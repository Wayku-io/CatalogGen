/**
 * Vercel Serverless Function: Stremio Catalog Handler
 * Dual Catalog Support:
 * - Line 1 ('streaming_fr_originals'): Nouveautés Streaming SVOD France (Netflix, Prime, Disney+, Canal+, Max, Apple TV+)
 * - Line 2 ('digital_vod_worldwide'): Sorties Mondiales Digital & VOD (Type 4) avec disponibilité/pistes FR
 */

const PROVIDER_IDS = {
  'netflix': 8,
  'prime video': 119,
  'disney+': 337,
  'canal+': 381,
  'apple tv+': 350,
  'max': 1899
};

const GENRE_MAP = {
  'action': 28,
  'thriller': 53,
  'science-fiction': 878,
  'comédie': 35,
  'drame': 18,
  'horreur': 27,
  'aventure': 12
};

const ORIGINAL_STUDIO_KEYWORDS = [
  'netflix', 'amazon studios', 'amazon content', 'amazon mgm', 'amazon', 'prime video', 'mgm', 'apple', 'disney+', 'disney', 'paramount+', 'paramount', 'hbo', 'warner'
];

const STANDUP_PATTERNS = [
  'stand-up comedy', 'stand-up', 'comedy special', 'one-man show', 
  'one-man-show', 'one-woman show', 'one-woman-show', 'stand up', 
  'humorist', 'reality tv', 'reality show', 'game show', 'talk show', 
  'variety show', 'concert', 'concert film', 'humoriste', 'spectacle'
];

const MAIN_LANGUAGES = ['fr', 'en', 'es', 'it', 'de', 'ja', 'ko'];

function sendResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400');
  res.end(JSON.stringify(data));
}

async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY || (req.query && req.query.api_key);
    if (!apiKey) {
      return sendResponse(res, 200, {
        metas: [],
        error: "TMDB_API_KEY non configurée dans les variables d'environnement Vercel (ou paramètre ?api_key= manquant)."
      });
    }

    const { type, id, extra } = req.query || {};

    if (type !== 'movie') {
      return sendResponse(res, 200, { metas: [] });
    }

    const cleanId = (id || '').replace(/\.json$/, '');
    const isCatalogStreaming = cleanId === 'streaming_fr_originals';
    const isCatalogVod = cleanId === 'digital_vod_worldwide';

    if (!isCatalogStreaming && !isCatalogVod) {
      return sendResponse(res, 200, { metas: [] });
    }

    // Parse extra parameters (genre filter, skip pagination)
    let selectedExtraOption = '';
    let skip = 0;

    if (extra) {
      const parts = Array.isArray(extra) ? extra : extra.split('&');
      parts.forEach(part => {
        if (part.startsWith('genre=')) {
          selectedExtraOption = decodeURIComponent(part.replace('genre=', ''));
        }
        if (part.startsWith('skip=')) {
          skip = parseInt(part.replace('skip=', ''), 10) || 0;
        }
      });
    }

    const page = Math.floor(skip / 20) + 1;

    // Date range: last 60 days
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 60);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    const isBearer = apiKey.length > 50;
    const headers = isBearer ? { 'Authorization': `Bearer ${apiKey}` } : {};
    const keyParam = isBearer ? '' : `api_key=${apiKey}&`;

    let results = [];

    if (isCatalogStreaming) {
      // LINE 1: Pure French Streaming Subscriptions (flatrate)
      let discoverUrl = `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&watch_region=FR&with_watch_monetization_types=flatrate&with_release_type=4&without_genres=99|10770&sort_by=release_date.desc&page=${page}`;
      const providerKey = selectedExtraOption.toLowerCase();
      if (PROVIDER_IDS[providerKey]) {
        discoverUrl += `&with_watch_providers=${PROVIDER_IDS[providerKey]}`;
      }
      const tmdbRes = await fetch(discoverUrl, { headers, signal: AbortSignal.timeout(4000) });
      if (tmdbRes.ok) {
        const data = await tmdbRes.json();
        results = data.results || [];
      }
    } else {
      // LINE 2: Worldwide Digital & VOD Releases (Type 4) multi-régions (US + FR)
      const genreKey = selectedExtraOption.toLowerCase();
      const genreParam = GENRE_MAP[genreKey] ? `&with_genres=${GENRE_MAP[genreKey]}` : '';
      const urlUS = `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&region=US&with_release_type=4&without_genres=99|10770&sort_by=release_date.desc&page=${page}${genreParam}`;
      const urlFR = `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&region=FR&with_release_type=4&without_genres=99|10770&sort_by=release_date.desc&page=${page}${genreParam}`;

      const [resUS, resFR] = await Promise.all([
        fetch(urlUS, { headers, signal: AbortSignal.timeout(4000) }).then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] })),
        fetch(urlFR, { headers, signal: AbortSignal.timeout(4000) }).then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }))
      ]);

      const map = new Map();
      (resUS.results || []).forEach(m => map.set(m.id, m));
      (resFR.results || []).forEach(m => { if (!map.has(m.id)) map.set(m.id, m); });
      results = Array.from(map.values());
    }

    // Enrich and filter items (up to 50 candidates per page for rich Stremio rows)
    const enriched = await Promise.all(
      results.slice(0, 50).map(async (m) => {
        try {
          const detailUrl = `https://api.themoviedb.org/3/movie/${m.id}?${keyParam}append_to_response=release_dates,watch/providers,external_ids,keywords,credits,translations&language=fr-FR`;
          const detailRes = await fetch(detailUrl, { headers, signal: AbortSignal.timeout(3500) });
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();

          // Exclude documentaries (genre 99)
          const genres = (detail.genres || []).map(g => g.id);
          if (genres.includes(99)) {
            return null;
          }

          // Exclude stand-up & comedy specials without banning comedy movies (genre 35)
          const kws = (detail.keywords?.keywords || []).map(k => k.name.toLowerCase());
          const fullText = `${detail.title} ${detail.tagline || ''} ${detail.overview || ''}`.toLowerCase();
          const isStandupOrReality = kws.some(k => STANDUP_PATTERNS.some(p => k.includes(p))) 
            || /\b(stand-up|standup|one-man-show|one-woman-show|spectacle d'humour|en spectacle|comedy special|dans ce spectacle|télé-réalité|bêtisier)\b/i.test(fullText);

          const hasSelfRole = (detail.credits?.cast || []).slice(0, 3).some(c => 
            /^(self|himself|herself|lui-même|elle-même)$/i.test((c.character || '').trim())
          );
          const isShortComedy = genres.includes(35) && detail.runtime > 0 && detail.runtime <= 68;

          if (isStandupOrReality || (hasSelfRole && genres.includes(35)) || isShortComedy) {
            return null;
          }

          // Exclude shorts & promotional clips (< 70 min)
          if (detail.runtime && detail.runtime < 70) {
            return null;
          }

          // Language filter: primary language must be in main cinematic languages
          const lang = (detail.original_language || '').toLowerCase();
          if (lang && !MAIN_LANGUAGES.includes(lang)) {
            return null;
          }

          const companies = detail.production_companies || [];
          const isStudioOriginal = companies.some(c => 
            ORIGINAL_STUDIO_KEYWORDS.some(kw => (c.name || '').toLowerCase().includes(kw))
          );

          // Line-specific language and localization rules:
          if (isCatalogStreaming) {
            // Line 1: French overview mandatory
            if (!detail.overview || detail.overview.trim().length < 20) {
              return null;
            }
          } else {
            // Line 2: Worldwide VOD releases must have French availability (translation, French audio, or French overview)
            const translations = detail.translations?.translations || [];
            const hasFrenchTranslation = translations.some(t => t.iso_639_1 === 'fr');
            const hasFrenchAudio = (detail.spoken_languages || []).some(l => l.iso_639_1 === 'fr');
            const isFrenchOriginal = lang === 'fr';
            const hasFrenchOverview = detail.overview && detail.overview.trim().length > 20;
            const hasFrenchTitle = detail.title && detail.original_title && detail.title.toLowerCase() !== detail.original_title.toLowerCase();
            const isMajorStudio = companies.some(c => 
              ['warner', 'sony', 'universal', 'paramount', 'disney', 'lionsgate', 'mgm', '20th century'].some(st => (c.name || '').toLowerCase().includes(st))
            );

            if (!hasFrenchTranslation && !hasFrenchAudio && !isFrenchOriginal && !hasFrenchOverview && !hasFrenchTitle && !(isMajorStudio && lang === 'en')) {
              return null; // Reject if zero French track, translation or localization exists
            }

            // Line 2 Mutual Exclusion: Exclude any title already available on French SVOD subscriptions (Line 1)
            const frFlatrate = detail['watch/providers']?.results?.FR?.flatrate || [];
            if (frFlatrate.length > 0) {
              return null; // Excluded from Line 2 because it's available in French SVOD (Line 1)
            }
          }

          // Rejet des films sortis il y a plus de 1 an
          const primaryYear = parseInt((detail.release_date || '').substring(0, 4), 10);
          const currentYear = new Date().getFullYear();
          if (primaryYear && primaryYear < (currentYear - 1)) {
            return null;
          }

          const allCountries = detail.release_dates?.results || [];
          let earliestCommercialTheatrical = null;
          let earliestAnyTheatrical = null;
          let digitalReleaseDate = null;

          allCountries.forEach(country => {
            country.release_dates.forEach(rd => {
              const date = rd.release_date ? rd.release_date.split('T')[0] : null;
              if (!date) return;

              if (rd.type === 3) {
                if (!earliestCommercialTheatrical || date < earliestCommercialTheatrical) {
                  earliestCommercialTheatrical = date;
                }
              }
              if (rd.type === 2 || rd.type === 3) {
                if (!earliestAnyTheatrical || date < earliestAnyTheatrical) {
                  earliestAnyTheatrical = date;
                }
              }
              if (rd.type === 4) {
                if (country.iso_3166_1 === 'FR') {
                  digitalReleaseDate = date;
                } else if (country.iso_3166_1 === 'US' && !digitalReleaseDate) {
                  digitalReleaseDate = date;
                } else if (!digitalReleaseDate) {
                  digitalReleaseDate = date;
                }
              }
            });
          });

          // Check gap with theatrical release
          const theatDateToCheck = earliestCommercialTheatrical;
          if (theatDateToCheck) {
            const theatDate = new Date(theatDateToCheck);
            const digiDate = new Date(digitalReleaseDate || detail.release_date);
            const diffDays = Math.round((digiDate - theatDate) / (1000 * 60 * 60 * 24));

            if (isCatalogStreaming) {
              // Line 1: Strict streaming originals (tolerance max 2 days for day-and-date)
              if (diffDays > 2) {
                return null;
              }
            } else {
              // Line 2: VOD & Digital releases (accept direct digital or recent cinema < 120 days)
              if (diffDays > 180) {
                return null;
              }
            }
          }

          const imdbId = detail.external_ids?.imdb_id || `tmdb:${detail.id}`;
          const poster = detail.poster_path 
            ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
            : undefined;

          const description = (detail.overview && detail.overview.trim().length > 20)
            ? detail.overview
            : (detail.tagline ? `${detail.tagline} • Sortie VOD & Digital (Piste/Traduction FR).` : "Sortie VOD & Digital (Achat / Location - Piste ou sous-titres FR disponibles).");

          const finalDate = digitalReleaseDate || detail.release_date || '1970-01-01';

          return {
            id: imdbId,
            type: "movie",
            name: detail.title,
            poster: poster,
            description,
            releaseInfo: digitalReleaseDate ? digitalReleaseDate.substring(0, 4) : (detail.release_date ? detail.release_date.substring(0, 4) : "2026"),
            imdbRating: detail.vote_average ? detail.vote_average.toFixed(1) : undefined,
            _sortDate: finalDate
          };
        } catch (e) {
          return null;
        }
      })
    );

    // Sort valid metas chronologically (most recent digital release first on the left of Stremio row)
    const validMetas = enriched
      .filter(Boolean)
      .sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''))
      .map(({ _sortDate, ...meta }) => meta);

    return sendResponse(res, 200, { metas: validMetas });
  } catch (error) {
    console.error("Erreur Catalog:", error);
    return sendResponse(res, 200, { metas: [] });
  }
}

module.exports = handler;
module.exports.default = handler;
