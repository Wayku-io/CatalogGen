/**
 * CatalogGen Studio
 * Multi-Catalog Dynamic Engine & Row Settings Controller
 */

// Mot de passe de protection privée par défaut (configurable via localStorage)
const DEFAULT_STUDIO_PASS = "wayku2026";

// Constantes pour le filtrage expert (identiques au backend pour fidélité 100%)
const STANDUP_PATTERNS = [
  'stand-up comedy', 'stand-up', 'comedy special', 'one-man show', 
  'one-man-show', 'one-woman show', 'one-woman-show', 'stand up', 
  'humorist', 'reality tv', 'reality show', 'game show', 'talk show', 
  'variety show', 'concert', 'concert film', 'humoriste', 'spectacle'
];

const MAIN_LANGUAGES = ['fr', 'en', 'es', 'it', 'de', 'ja', 'ko'];

const ORIGINAL_STUDIO_KEYWORDS = [
  'netflix', 'amazon studios', 'amazon content', 'amazon mgm', 'amazon', 'prime video', 'mgm', 'apple', 'disney+', 'disney', 'paramount+', 'paramount', 'hbo', 'warner'
];

// État de l'application
const studioState = {
  apiKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('tmdb_api_key') : '') || '',
  isAuthenticated: false,
  row1: {
    timeWindow: 60,
    theatricalGap: 2,
    provider: '',
    movies: [],
    loading: false
  },
  row2: {
    timeWindow: 60,
    theatricalGap: 120,
    genre: '',
    movies: [],
    loading: false
  }
};

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  initAuthGate();
  initModals();
  initRowSettingsToggles();
  initScrollNav();
  initRowButtons();
  
  // Démarrer le chargement des catalogues
  refreshAllRows();
});

// =============================================================================
// 1. SÉCURITÉ & AUTH GATEWAY (Option Simple et Efficace)
// =============================================================================
function initAuthGate() {
  const authGate = document.getElementById('authGateModal');
  const authForm = document.getElementById('authForm');
  const authInput = document.getElementById('authPasswordInput');
  const authError = document.getElementById('authErrorMsg');

  // Vérifier si clé dans l'URL ?key=wayku2026
  const urlParams = new URLSearchParams(window.location.search);
  const keyParam = urlParams.get('key');
  const savedAuth = typeof localStorage !== 'undefined' ? localStorage.getItem('cataloggen_auth') : null;

  if (keyParam === DEFAULT_STUDIO_PASS || savedAuth === 'true') {
    studioState.isAuthenticated = true;
    if (authGate) authGate.classList.add('hidden');
    return;
  }

  // Sinon afficher le modal d'accès privé
  if (authGate) authGate.classList.remove('hidden');

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPass = authInput.value.trim();
      if (enteredPass === DEFAULT_STUDIO_PASS) {
        studioState.isAuthenticated = true;
        if (typeof localStorage !== 'undefined') localStorage.setItem('cataloggen_auth', 'true');
        authGate.classList.add('hidden');
      } else {
        authError.classList.remove('hidden');
        authInput.value = '';
      }
    });
  }
}

// =============================================================================
// 2. MODALS & CLÉ TMDB
// =============================================================================
function initModals() {
  const topApiKeyBtn = document.getElementById('topApiKeyBtn');
  const apiKeyModal = document.getElementById('apiKeyModal');
  const closeApiKeyModal = document.getElementById('closeApiKeyModal');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
  const globalApiKeyInput = document.getElementById('globalApiKeyInput');
  const globalStatusDot = document.getElementById('globalStatusDot');
  const globalStatusText = document.getElementById('globalStatusText');

  function updateStatusDisplay() {
    if (studioState.apiKey) {
      if (globalStatusDot) {
        globalStatusDot.className = 'status-dot online';
      }
      if (globalStatusText) globalStatusText.textContent = 'Clé TMDB active';
      if (globalApiKeyInput) globalApiKeyInput.value = studioState.apiKey;
    } else {
      if (globalStatusDot) {
        globalStatusDot.className = 'status-dot offline';
      }
      if (globalStatusText) globalStatusText.textContent = 'Mode Démo (Pas de clé)';
    }
  }

  updateStatusDisplay();

  if (topApiKeyBtn && apiKeyModal) {
    topApiKeyBtn.addEventListener('click', () => {
      apiKeyModal.classList.remove('hidden');
    });
  }

  if (closeApiKeyModal && apiKeyModal) {
    closeApiKeyModal.addEventListener('click', () => {
      apiKeyModal.classList.add('hidden');
    });
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', () => {
      const val = globalApiKeyInput.value.trim();
      if (val) {
        studioState.apiKey = val;
        if (typeof localStorage !== 'undefined') localStorage.setItem('tmdb_api_key', val);
        updateStatusDisplay();
        apiKeyModal.classList.add('hidden');
        refreshAllRows();
      }
    });
  }

  if (clearApiKeyBtn) {
    clearApiKeyBtn.addEventListener('click', () => {
      studioState.apiKey = '';
      if (typeof localStorage !== 'undefined') localStorage.removeItem('tmdb_api_key');
      if (globalApiKeyInput) globalApiKeyInput.value = '';
      updateStatusDisplay();
      apiKeyModal.classList.add('hidden');
      refreshAllRows();
    });
  }

  // Modal Film
  const movieModal = document.getElementById('movieModal');
  const closeMovieModal = document.getElementById('closeMovieModal');
  if (closeMovieModal && movieModal) {
    closeMovieModal.addEventListener('click', () => {
      movieModal.classList.add('hidden');
    });
  }
}

// =============================================================================
// 3. ROW SETTINGS TOGGLE (Roue Crantée ⚙️ sur chaque ligne)
// =============================================================================
function initRowSettingsToggles() {
  document.querySelectorAll('.row-settings-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const drawer = document.getElementById(targetId);
      if (drawer) {
        const isClosed = drawer.classList.contains('hidden');
        drawer.classList.toggle('hidden');
        btn.classList.toggle('active', isClosed);
      }
    });
  });
}

// =============================================================================
// 4. NAVIGATION HORIZONTALE TYPE STREMIO (Flèches gauche/droite)
// =============================================================================
function initScrollNav() {
  document.querySelectorAll('.nav-arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
      const containerId = arrow.getAttribute('data-container');
      const direction = arrow.getAttribute('data-scroll');
      const container = document.getElementById(containerId);
      if (container) {
        const scrollAmount = direction === 'left' ? -600 : 600;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    });
  });
}

// =============================================================================
// 5. BOUTONS D'ACTUALISATION PAR LIGNE
// =============================================================================
function initRowButtons() {
  document.querySelectorAll('.btn-apply-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const rowNum = btn.getAttribute('data-row');
      if (rowNum === '1') {
        const tw = parseInt(document.getElementById('r1-timeWindow').value, 10);
        const gap = parseInt(document.getElementById('r1-theatricalGap').value, 10);
        const prov = document.getElementById('r1-provider').value;
        studioState.row1.timeWindow = tw;
        studioState.row1.theatricalGap = gap;
        studioState.row1.provider = prov;
        loadRow1();
      } else if (rowNum === '2') {
        const tw = parseInt(document.getElementById('r2-timeWindow').value, 10);
        const gap = parseInt(document.getElementById('r2-theatricalGap').value, 10);
        const genre = document.getElementById('r2-genre').value;
        studioState.row2.timeWindow = tw;
        studioState.row2.theatricalGap = gap;
        studioState.row2.genre = genre;
        loadRow2();
      }
    });
  });
}

function refreshAllRows() {
  loadRow1().then(() => {
    // La Ligne 2 dépend des films de la Ligne 1 pour l'exclusion mutuelle
    loadRow2();
  });
}

// =============================================================================
// 6. MOTEUR LIGNE 1 : SVOD FRANCE (Exclus Streaming)
// =============================================================================
async function loadRow1() {
  const track = document.getElementById('track-row-1');
  const counter = document.getElementById('count-row-1');
  if (!track) return;

  track.innerHTML = '<div class="track-loading">Chargement des films SVOD France...</div>';

  if (!studioState.apiKey) {
    // Mode démo si pas de clé
    renderDemoRow1();
    return;
  }

  try {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - studioState.row1.timeWindow);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    const isBearer = studioState.apiKey.length > 50;
    const headers = isBearer ? { 'Authorization': `Bearer ${studioState.apiKey}` } : {};
    const keyParam = isBearer ? '' : `api_key=${studioState.apiKey}&`;

    let url = `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&watch_region=FR&with_watch_monetization_types=flatrate&with_release_type=4&without_genres=99|10770&release_date.gte=${startStr}&release_date.lte=${endStr}&sort_by=release_date.desc&page=1`;

    if (studioState.row1.provider) {
      url += `&with_watch_providers=${studioState.row1.provider}`;
    }

    // Calculer le nombre de pages à scanner selon la fenêtre temporelle demandée :
    // 30 jours = 3 pages (60 films), 60 jours = 5 pages (100 films), 90 jours = 7 pages (140 films), 180 jours = 12 pages (240 films)
    const maxPages = studioState.row1.timeWindow >= 180 ? 12 : (studioState.row1.timeWindow >= 90 ? 7 : (studioState.row1.timeWindow >= 60 ? 5 : 3));
    const pagesToFetch = Array.from({ length: maxPages }, (_, i) => i + 1);

    const pagePromises = pagesToFetch.map(p => {
      const pUrl = url.replace(/&page=\d+/, `&page=${p}`);
      return fetch(pUrl, { headers }).then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }));
    });

    const pageResults = await Promise.all(pagePromises);
    const candidateMap = new Map();
    pageResults.forEach(pr => {
      (pr.results || []).forEach(item => {
        if (!candidateMap.has(item.id)) candidateMap.set(item.id, item);
      });
    });

    const candidates = Array.from(candidateMap.values());

    // Enrichissement et filtrage expert (parallélisé sur tous les candidats)
    const enriched = await Promise.all(
      candidates.map(async (m) => {
        try {
          const detailUrl = `https://api.themoviedb.org/3/movie/${m.id}?${keyParam}append_to_response=release_dates,watch/providers,external_ids,keywords,credits,translations&language=fr-FR`;
          const detailRes = await fetch(detailUrl, { headers });
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();

          // Exclusions documentaires
          const genres = (detail.genres || []).map(g => g.id);
          if (genres.includes(99)) return null;

          // Exclusions standup / télé-réalité
          const kws = (detail.keywords?.keywords || []).map(k => k.name.toLowerCase());
          const fullText = `${detail.title} ${detail.tagline || ''} ${detail.overview || ''}`.toLowerCase();
          const isStandup = kws.some(k => STANDUP_PATTERNS.some(p => k.includes(p))) 
            || /\b(stand-up|standup|one-man-show|spectacle d'humour|en spectacle|comedy special|télé-réalité)\b/i.test(fullText);

          const hasSelfRole = (detail.credits?.cast || []).slice(0, 3).some(c => 
            /^(self|himself|herself|lui-même|elle-même)$/i.test((c.character || '').trim())
          );
          if (isStandup || (hasSelfRole && genres.includes(35))) return null;

          // Durée min 70 min
          if (detail.runtime && detail.runtime < 70) return null;

          // Langues courantes
          const lang = (detail.original_language || '').toLowerCase();
          if (lang && !MAIN_LANGUAGES.includes(lang)) return null;

          // Synopsis français obligatoire
          if (!detail.overview || detail.overview.trim().length < 20) return null;

          // Studio original
          const companies = detail.production_companies || [];
          const isStudioOriginal = companies.some(c => 
            ORIGINAL_STUDIO_KEYWORDS.some(kw => (c.name || '').toLowerCase().includes(kw))
          );

          // Dates de sortie
          const allCountries = detail.release_dates?.results || [];
          let earliestTheatrical = null;
          let digitalDate = null;

          allCountries.forEach(country => {
            country.release_dates.forEach(rd => {
              const d = rd.release_date ? rd.release_date.split('T')[0] : null;
              if (!d) return;
              if (rd.type === 2 || rd.type === 3) {
                if (!earliestTheatrical || d < earliestTheatrical) earliestTheatrical = d;
              }
              if (rd.type === 4) {
                if (country.iso_3166_1 === 'FR') digitalDate = d;
                else if (!digitalDate) digitalDate = d;
              }
            });
          });

          // Écart cinéma
          if (earliestTheatrical) {
            const tDate = new Date(earliestTheatrical);
            const dDate = new Date(digitalDate || detail.release_date);
            const diffDays = Math.round((dDate - tDate) / (1000 * 60 * 60 * 24));
            if (diffDays > studioState.row1.theatricalGap) return null;
          }

          const providerData = detail['watch/providers']?.results?.FR?.flatrate || [];

          return {
            id: detail.id,
            imdbId: detail.external_ids?.imdb_id || `tmdb:${detail.id}`,
            title: detail.title,
            originalTitle: detail.original_title,
            poster: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : 'https://placehold.co/300x450/1e293b/94a3b8?text=Sans+Affiche',
            backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
            year: (digitalDate || detail.release_date || '2026').substring(0, 4),
            rating: detail.vote_average ? detail.vote_average.toFixed(1) : 'NR',
            runtime: detail.runtime ? `${detail.runtime} min` : '',
            overview: detail.overview,
            providers: providerData.map(p => ({
              name: p.provider_name,
              logo: `https://image.tmdb.org/t/p/original${p.logo_path}`
            })),
            releaseDate: digitalDate || detail.release_date || ''
          };
        } catch (e) {
          return null;
        }
      })
    );

    const valid = enriched.filter(Boolean);
    studioState.row1.movies = valid;
    renderTrack('track-row-1', valid);
    if (counter) counter.textContent = `${valid.length} films`;
  } catch (err) {
    track.innerHTML = `<div class="track-loading" style="color: #f87171;">Erreur lors du chargement : ${err.message}</div>`;
  }
}

// =============================================================================
// 7. MOTEUR LIGNE 2 : VOD & DIGITAL MONDIAL (Avec Exclusion Mutuelle Ligne 1)
// =============================================================================
async function loadRow2() {
  const track = document.getElementById('track-row-2');
  const counter = document.getElementById('count-row-2');
  if (!track) return;

  track.innerHTML = '<div class="track-loading">Chargement des sorties VOD & Digital...</div>';

  if (!studioState.apiKey) {
    renderDemoRow2();
    return;
  }

  try {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - studioState.row2.timeWindow);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    const isBearer = studioState.apiKey.length > 50;
    const headers = isBearer ? { 'Authorization': `Bearer ${studioState.apiKey}` } : {};
    const keyParam = isBearer ? '' : `api_key=${studioState.apiKey}&`;

    let url = `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&region=US&with_release_type=4&without_genres=99|10770&release_date.gte=${startStr}&release_date.lte=${endStr}&sort_by=release_date.desc&page=1`;

    if (studioState.row2.genre) {
      url += `&with_genres=${studioState.row2.genre}`;
    }

    // Calculer le nombre de pages à scanner selon la fenêtre temporelle demandée :
    // 30 jours = 4 pages (80 films), 60 jours = 7 pages (140 films), 90 jours = 10 pages (200 films), 180 jours = 15 pages (300 films)
    const maxPages = studioState.row2.timeWindow >= 180 ? 15 : (studioState.row2.timeWindow >= 90 ? 10 : (studioState.row2.timeWindow >= 60 ? 7 : 4));
    const pagesToFetch = Array.from({ length: maxPages }, (_, i) => i + 1);

    const pagePromises = pagesToFetch.map(p => {
      const pUrl = url.replace(/&page=\d+/, `&page=${p}`);
      return fetch(pUrl, { headers }).then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }));
    });

    const pageResults = await Promise.all(pagePromises);
    const candidateMap = new Map();
    pageResults.forEach(pr => {
      (pr.results || []).forEach(item => {
        if (!candidateMap.has(item.id)) candidateMap.set(item.id, item);
      });
    });

    const candidates = Array.from(candidateMap.values());

    // Récupérer la liste des IDs de la Ligne 1 pour EXCLUSION MUTUELLE
    const line1Ids = new Set(studioState.row1.movies.map(m => m.id));

    const enriched = await Promise.all(
      candidates.map(async (m) => {
        try {
          // EXCLUSION MUTUELLE : si déjà présent dans la Ligne 1, on l'écarte
          if (line1Ids.has(m.id)) return null;

          const detailUrl = `https://api.themoviedb.org/3/movie/${m.id}?${keyParam}append_to_response=release_dates,watch/providers,external_ids,keywords,credits,translations&language=fr-FR`;
          const detailRes = await fetch(detailUrl, { headers });
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();

          // Documentaires
          const genres = (detail.genres || []).map(g => g.id);
          if (genres.includes(99)) return null;

          // Stand-up & télé-réalité
          const kws = (detail.keywords?.keywords || []).map(k => k.name.toLowerCase());
          const fullText = `${detail.title} ${detail.tagline || ''} ${detail.overview || ''}`.toLowerCase();
          const isStandup = kws.some(k => STANDUP_PATTERNS.some(p => k.includes(p))) 
            || /\b(stand-up|standup|one-man-show|spectacle d'humour|comedy special)\b/i.test(fullText);

          if (isStandup) return null;
          if (detail.runtime && detail.runtime < 70) return null;

          // Vérification de la disponibilité française (VOD FR)
          const translations = detail.translations?.translations || [];
          const hasFrTranslation = translations.some(t => t.iso_639_1 === 'fr');
          const hasFrAudio = (detail.spoken_languages || []).some(l => l.iso_639_1 === 'fr');
          const isFrOriginal = (detail.original_language || '').toLowerCase() === 'fr';
          const hasFrOverview = detail.overview && detail.overview.trim().length > 20;

          if (!hasFrTranslation && !hasFrAudio && !isFrOriginal && !hasFrOverview) {
            return null;
          }

          // Exclusion des abonnements SVOD France déjà inclus
          const frFlatrate = detail['watch/providers']?.results?.FR?.flatrate || [];
          if (frFlatrate.length > 0) return null;

          // Écart cinéma
          const allCountries = detail.release_dates?.results || [];
          let earliestTheatrical = null;
          let digitalDate = null;

          allCountries.forEach(country => {
            country.release_dates.forEach(rd => {
              const d = rd.release_date ? rd.release_date.split('T')[0] : null;
              if (!d) return;
              if (rd.type === 2 || rd.type === 3) {
                if (!earliestTheatrical || d < earliestTheatrical) earliestTheatrical = d;
              }
              if (rd.type === 4) {
                if (country.iso_3166_1 === 'US' || country.iso_3166_1 === 'FR') {
                  if (!digitalDate) digitalDate = d;
                } else if (!digitalDate) {
                  digitalDate = d;
                }
              }
            });
          });

          if (earliestTheatrical) {
            const tDate = new Date(earliestTheatrical);
            const dDate = new Date(digitalDate || detail.release_date);
            const diffDays = Math.round((dDate - tDate) / (1000 * 60 * 60 * 24));
            if (diffDays > studioState.row2.theatricalGap) return null;
          }

          return {
            id: detail.id,
            imdbId: detail.external_ids?.imdb_id || `tmdb:${detail.id}`,
            title: detail.title,
            originalTitle: detail.original_title,
            poster: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : 'https://placehold.co/300x450/1e293b/94a3b8?text=Sans+Affiche',
            backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
            year: (digitalDate || detail.release_date || '2026').substring(0, 4),
            rating: detail.vote_average ? detail.vote_average.toFixed(1) : 'NR',
            runtime: detail.runtime ? `${detail.runtime} min` : '',
            overview: detail.overview || 'Sortie VOD & Digital (Piste ou sous-titres FR disponibles).',
            providers: [],
            isVod: true,
            releaseDate: digitalDate || detail.release_date || ''
          };
        } catch (e) {
          return null;
        }
      })
    );

    const valid = enriched.filter(Boolean);
    studioState.row2.movies = valid;
    renderTrack('track-row-2', valid);
    if (counter) counter.textContent = `${valid.length} films`;
  } catch (err) {
    track.innerHTML = `<div class="track-loading" style="color: #f87171;">Erreur lors du chargement : ${err.message}</div>`;
  }
}

// =============================================================================
// 8. RENDU DES AFFICHES (Stremio Cards) & MODAL FILM
// =============================================================================
function renderTrack(containerId, movies) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (movies.length === 0) {
    container.innerHTML = '<div class="track-loading">Aucun film ne correspond à ces critères dans cette fenêtre.</div>';
    return;
  }

  container.innerHTML = movies.map(m => `
    <div class="movie-card" data-id="${m.id}" onclick="openMovieDetail(${m.id})">
      <div class="poster-wrap">
        <img src="${m.poster}" alt="${escapeHtml(m.title)}" loading="lazy">
        <div class="poster-overlay">
          ${m.isVod ? '<span class="tag-original" style="background:#0891b2; color:#fff;">VOD / WEB-DL</span>' : '<span class="tag-original">STREAMING</span>'}
          ${m.providers && m.providers.length > 0 ? `
            <div class="provider-icon-badge" title="${escapeHtml(m.providers[0].name)}">
              <img src="${m.providers[0].logo}" alt="${escapeHtml(m.providers[0].name)}">
            </div>
          ` : ''}
        </div>
        <div class="rating-badge">★ ${m.rating}</div>
      </div>
      <div class="card-info">
        <div class="card-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</div>
        <div class="card-meta">
          <span>${m.year}</span>
          ${m.runtime ? `<span>• ${m.runtime}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

window.openMovieDetail = function(movieId) {
  const allMovies = [...studioState.row1.movies, ...studioState.row2.movies];
  const m = allMovies.find(item => item.id === movieId);
  if (!m) return;

  const modal = document.getElementById('movieModal');
  const content = document.getElementById('modalMovieContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
      <div style="flex: 0 0 180px;">
        <img src="${m.poster}" alt="${escapeHtml(m.title)}" style="width: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
      </div>
      <div style="flex: 1; min-width: 260px;">
        <h2 style="font-size: 1.5rem; margin-bottom: 4px; color: #fff;">${escapeHtml(m.title)}</h2>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 12px;">
          Titre original : <em>${escapeHtml(m.originalTitle || m.title)}</em> • Sortie : ${m.releaseDate || m.year}
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <span style="background: rgba(251,191,36,0.15); color: #fbbf24; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.85rem;">★ Note : ${m.rating}</span>
          ${m.runtime ? `<span style="background: rgba(255,255,255,0.08); color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem;">${m.runtime}</span>` : ''}
          <span style="background: rgba(139,92,246,0.15); color: #c4b5fd; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem;">${m.isVod ? 'Sortie VOD Mondial' : 'SVOD France'}</span>
        </div>
        <p style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; margin-bottom: 18px;">
          ${escapeHtml(m.overview || 'Aucun résumé disponible.')}
        </p>
        <div style="font-size: 0.8rem; color: #64748b; font-family: monospace;">
          ID IMDB / Stremio : <strong>${m.imdbId}</strong> (ID TMDB : ${m.id})
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Fallback Démo instantané
function renderDemoRow1() {
  const demoList = [
    {
      id: 1159311,
      title: "The Mastermind (Netflix Original)",
      originalTitle: "The Mastermind",
      poster: "https://image.tmdb.org/t/p/w500/7x09eBq8yZ30N9QeM0YlG0u.jpg",
      year: "2026",
      rating: "7.4",
      runtime: "114 min",
      overview: "Un thriller palpitant produit en exclusivité pour Netflix. Un braquage millimétré vire à la confrontation psychologique.",
      providers: [{ name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" }],
      releaseDate: "2026-09-18"
    },
    {
      id: 1022789,
      title: "Echoes of Silence (Apple Original)",
      originalTitle: "Echoes of Silence",
      poster: "https://image.tmdb.org/t/p/w500/uXDwYmb9G9v3hN5lP9Q.jpg",
      year: "2026",
      rating: "8.1",
      runtime: "108 min",
      overview: "Drame intimiste et captivant sur un pianiste virtuose confronté à la perte soudaine de son ouïe.",
      providers: [{ name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/peURlLlr8jggOwK53fJ5wdQl05y.jpg" }],
      releaseDate: "2026-09-26"
    }
  ];
  studioState.row1.movies = demoList;
  renderTrack('track-row-1', demoList);
  const counter = document.getElementById('count-row-1');
  if (counter) counter.textContent = `${demoList.length} films (Mode Démo)`;
}

function renderDemoRow2() {
  const demoList = [
    {
      id: 934052,
      title: "Deep Current (Sortie WEB-DL VOD)",
      originalTitle: "Deep Current",
      poster: "https://placehold.co/300x450/0f172a/38bdf8?text=VOD+Worldwide",
      year: "2026",
      rating: "6.9",
      runtime: "102 min",
      overview: "Sortie digitale mondiale avec piste audio et sous-titres français disponibles.",
      isVod: true,
      releaseDate: "2026-09-15"
    }
  ];
  studioState.row2.movies = demoList;
  renderTrack('track-row-2', demoList);
  const counter = document.getElementById('count-row-2');
  if (counter) counter.textContent = `${demoList.length} films (Mode Démo)`;
}
