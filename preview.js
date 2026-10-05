/**
 * CatalogGen Studio
 * Multi-Catalog Dynamic Engine (Flux Continu & Tri Chronologique Stable)
 */

// Mot de passe de protection privée par défaut
const DEFAULT_STUDIO_PASS = "wayku2026";

// Constantes pour le filtrage expert
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

// État de l'application (Flux continu sans limite arbitraire de jours)
const studioState = {
  apiKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('tmdb_api_key') : '') || '',
  isAuthenticated: false,
  row1: {
    provider: '',
    movies: [],
    pagesLoaded: 0,
    loading: false
  },
  row2: {
    genre: '',
    movies: [],
    pagesLoaded: 0,
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
  
  // Démarrer le chargement initial des catalogues
  refreshAllRows();
});

// =============================================================================
// 1. SÉCURITÉ & AUTH GATEWAY
// =============================================================================
function initAuthGate() {
  const authGate = document.getElementById('authGateModal');
  const authForm = document.getElementById('authForm');
  const authInput = document.getElementById('authPasswordInput');
  const authError = document.getElementById('authErrorMsg');

  const urlParams = new URLSearchParams(window.location.search);
  const keyParam = urlParams.get('key');
  const savedAuth = typeof localStorage !== 'undefined' ? localStorage.getItem('studio_auth') : null;

  if (keyParam === DEFAULT_STUDIO_PASS || savedAuth === 'granted') {
    studioState.isAuthenticated = true;
    if (authGate) authGate.classList.add('hidden');
    return;
  }

  if (authGate) authGate.classList.remove('hidden');

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pwd = authInput.value.trim();
      if (pwd === DEFAULT_STUDIO_PASS) {
        studioState.isAuthenticated = true;
        if (typeof localStorage !== 'undefined') localStorage.setItem('studio_auth', 'granted');
        authGate.classList.add('hidden');
        authError.classList.add('hidden');
      } else {
        authError.classList.remove('hidden');
        authInput.value = '';
        authInput.focus();
      }
    });
  }
}

// =============================================================================
// 2. MODAL CLÉ API TMDB
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
      if (globalStatusText) globalStatusText.textContent = 'Clé TMDB requise (Mode démo)';
    }
  }

  updateStatusDisplay();

  if (topApiKeyBtn && apiKeyModal) {
    topApiKeyBtn.addEventListener('click', () => {
      apiKeyModal.classList.remove('hidden');
      if (globalApiKeyInput) globalApiKeyInput.focus();
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
}

// =============================================================================
// 3. NAVIGATION DÉROULANTE (Settings Drawers)
// =============================================================================
function initRowSettingsToggles() {
  document.querySelectorAll('.row-settings-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const drawer = document.getElementById(targetId);
      if (drawer) {
        const isHidden = drawer.classList.contains('hidden');
        drawer.classList.toggle('hidden', !isHidden);
        btn.classList.toggle('active', isHidden);
      }
    });
  });

  document.querySelectorAll('.btn-apply-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const rowNum = btn.getAttribute('data-row');
      if (rowNum === '1') {
        studioState.row1.provider = document.getElementById('r1-provider').value;
        loadRow1(false);
      } else if (rowNum === '2') {
        studioState.row2.genre = document.getElementById('r2-genre').value;
        loadRow2(false);
      }
    });
  });
}

function initScrollNav() {
  document.querySelectorAll('.nav-arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
      const targetId = arrow.getAttribute('data-container');
      const dir = arrow.getAttribute('data-scroll');
      const container = document.getElementById(targetId);
      if (container) {
        const scrollAmount = dir === 'left' ? -500 : 500;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    });
  });
}

function initRowButtons() {
  const refreshAllBtn = document.getElementById('refreshAllBtn');
  if (refreshAllBtn) {
    refreshAllBtn.addEventListener('click', () => {
      refreshAllRows();
    });
  }
}

function refreshAllRows() {
  loadRow1(false).then(() => {
    loadRow2(false);
  });
}

// =============================================================================
// 6. MOTEUR LIGNE 1 : SVOD FRANCE (Flux Continu & Exclus Streaming)
// =============================================================================
async function loadRow1(append = false) {
  const track = document.getElementById('track-row-1');
  const counter = document.getElementById('count-row-1');
  if (!track) return;

  if (studioState.row1.loading) return;
  studioState.row1.loading = true;

  if (!append) {
    track.innerHTML = '<div class="track-loading">Chargement des nouveautés SVOD France...</div>';
    studioState.row1.movies = [];
    studioState.row1.pagesLoaded = 0;
  }

  if (!studioState.apiKey) {
    renderDemoRow1();
    studioState.row1.loading = false;
    return;
  }

  try {
    const isBearer = studioState.apiKey.length > 50;
    const headers = isBearer ? { 'Authorization': `Bearer ${studioState.apiKey}` } : {};
    const keyParam = isBearer ? '' : `api_key=${studioState.apiKey}&`;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let baseUrl = `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&watch_region=FR&with_watch_monetization_types=flatrate&with_release_type=4&without_genres=99|10770&release_date.lte=${todayStr}&sort_by=release_date.desc`;

    if (studioState.row1.provider) {
      baseUrl += `&with_watch_providers=${studioState.row1.provider}`;
    }

    const startPage = studioState.row1.pagesLoaded + 1;
    const pagesToFetch = [startPage, startPage + 1, startPage + 2, startPage + 3, startPage + 4];

    const pagePromises = pagesToFetch.map(p => {
      return fetch(`${baseUrl}&page=${p}`, { headers })
        .then(r => r.ok ? r.json() : { results: [] })
        .catch(() => ({ results: [] }));
    });

    const pageResults = await Promise.all(pagePromises);
    const existingIds = new Set(studioState.row1.movies.map(m => m.id));
    const candidateMap = new Map();

    pageResults.forEach(pr => {
      (pr.results || []).forEach(item => {
        if (!existingIds.has(item.id) && !candidateMap.has(item.id)) {
          candidateMap.set(item.id, item);
        }
      });
    });

    const candidates = Array.from(candidateMap.values());
    const currentYear = new Date().getFullYear();

    const enriched = await Promise.all(
      candidates.map(async (m) => {
        try {
          const detailUrl = `https://api.themoviedb.org/3/movie/${m.id}?${keyParam}append_to_response=release_dates,watch/providers,external_ids,keywords,credits,translations&language=fr-FR`;
          const detailRes = await fetch(detailUrl, { headers });
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();

          // Exclusions documentaires & téléfilms
          const genres = (detail.genres || []).map(g => g.id);
          if (genres.includes(99) || genres.includes(10770)) return null;

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

          // Exclusion des vieux films (> 1 an d'âge)
          const primaryYear = parseInt((detail.release_date || '').substring(0, 4), 10);
          if (primaryYear && primaryYear < (currentYear - 1)) {
            return null;
          }

          // Dates de sortie
          const allCountries = detail.release_dates?.results || [];
          let earliestCommercialTheatrical = null;
          let digitalDate = null;

          allCountries.forEach(country => {
            country.release_dates.forEach(rd => {
              const d = rd.release_date ? rd.release_date.split('T')[0] : null;
              if (!d) return;
              if (rd.type === 3) {
                if (!earliestCommercialTheatrical || d < earliestCommercialTheatrical) earliestCommercialTheatrical = d;
              }
              if (rd.type === 4) {
                if (country.iso_3166_1 === 'FR') digitalDate = d;
                else if (!digitalDate) digitalDate = d;
              }
            });
          });

          // Écart cinéma commercial : exclusivités streaming (écart <= 7 jours si ciné)
          if (earliestCommercialTheatrical) {
            const tDate = new Date(earliestCommercialTheatrical);
            const dDate = new Date(digitalDate || detail.release_date);
            const diffDays = Math.round((dDate - tDate) / (1000 * 60 * 60 * 24));
            if (diffDays > 7) return null;
          }

          // Vérification présence réelle en SVOD France
          const providerData = detail['watch/providers']?.results?.FR?.flatrate || [];
          if (providerData.length === 0) return null;

          const finalReleaseDate = digitalDate || detail.release_date || '';
          if (!finalReleaseDate || finalReleaseDate > todayStr) return null;

          return {
            id: detail.id,
            imdbId: detail.external_ids?.imdb_id || `tmdb:${detail.id}`,
            title: detail.title,
            originalTitle: detail.original_title,
            poster: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : 'https://placehold.co/300x450/1e293b/94a3b8?text=Sans+Affiche',
            backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
            year: finalReleaseDate.substring(0, 4) || '2026',
            rating: detail.vote_average ? detail.vote_average.toFixed(1) : 'NR',
            runtime: detail.runtime ? `${detail.runtime} min` : '',
            overview: detail.overview || 'Sortie SVOD France.',
            providers: providerData.map(p => ({
              name: p.provider_name,
              logo: `https://image.tmdb.org/t/p/original${p.logo_path}`
            })),
            releaseDate: finalReleaseDate
          };
        } catch (e) {
          return null;
        }
      })
    );

    const validNew = enriched
      .filter(Boolean)
      .sort((a, b) => (b.releaseDate || b.year || '').localeCompare(a.releaseDate || a.year || ''));

    if (append) {
      studioState.row1.movies.push(...validNew);
    } else {
      studioState.row1.movies = validNew;
    }

    studioState.row1.pagesLoaded = pagesToFetch[pagesToFetch.length - 1];
    renderTrack('track-row-1', studioState.row1.movies, 1);
    if (counter) counter.textContent = `${studioState.row1.movies.length} films`;
  } catch (err) {
    if (!append) {
      track.innerHTML = `<div class="track-loading" style="color: #f87171;">Erreur lors du chargement : ${err.message}</div>`;
    }
  } finally {
    studioState.row1.loading = false;
  }
}

// =============================================================================
// 7. MOTEUR LIGNE 2 : VOD & DIGITAL MONDIAL (Flux Continu & Exclusion Mutuelle)
// =============================================================================
async function loadRow2(append = false) {
  const track = document.getElementById('track-row-2');
  const counter = document.getElementById('count-row-2');
  if (!track) return;

  if (studioState.row2.loading) return;
  studioState.row2.loading = true;

  if (!append) {
    track.innerHTML = '<div class="track-loading">Chargement des sorties VOD & Digital...</div>';
    studioState.row2.movies = [];
    studioState.row2.pagesLoaded = 0;
  }

  if (!studioState.apiKey) {
    renderDemoRow2();
    studioState.row2.loading = false;
    return;
  }

  try {
    const isBearer = studioState.apiKey.length > 50;
    const headers = isBearer ? { 'Authorization': `Bearer ${studioState.apiKey}` } : {};
    const keyParam = isBearer ? '' : `api_key=${studioState.apiKey}&`;

    const genreParam = studioState.row2.genre ? `&with_genres=${studioState.row2.genre}` : '';

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startPage = studioState.row2.pagesLoaded + 1;
    const pagesUS = [startPage, startPage + 1, startPage + 2, startPage + 3, startPage + 4];
    const pagesFR = [startPage, startPage + 1, startPage + 2, startPage + 3];

    const queries = [];
    pagesUS.forEach(p => {
      queries.push(`https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&region=US&with_release_type=4&without_genres=99|10770&release_date.lte=${todayStr}&sort_by=release_date.desc&page=${p}${genreParam}`);
    });
    pagesFR.forEach(p => {
      queries.push(`https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&region=FR&with_release_type=4&without_genres=99|10770&release_date.lte=${todayStr}&sort_by=release_date.desc&page=${p}${genreParam}`);
    });

    const pageResults = await Promise.all(
      queries.map(q => fetch(q, { headers }).then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] })))
    );

    const existingIds = new Set(studioState.row2.movies.map(m => m.id));
    const line1Ids = new Set(studioState.row1.movies.map(m => m.id));
    const candidateMap = new Map();

    pageResults.forEach(pr => {
      (pr.results || []).forEach(item => {
        if (!existingIds.has(item.id) && !line1Ids.has(item.id) && !candidateMap.has(item.id)) {
          candidateMap.set(item.id, item);
        }
      });
    });

    const candidates = Array.from(candidateMap.values());
    const currentYear = new Date().getFullYear();

    const enriched = await Promise.all(
      candidates.map(async (m) => {
        try {
          // EXCLUSION MUTUELLE LIGNE 1
          if (line1Ids.has(m.id)) return null;

          const detailUrl = `https://api.themoviedb.org/3/movie/${m.id}?${keyParam}append_to_response=release_dates,watch/providers,external_ids,keywords,credits,translations&language=fr-FR`;
          const detailRes = await fetch(detailUrl, { headers });
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();

          // Documentaires & téléfilms
          const genres = (detail.genres || []).map(g => g.id);
          if (genres.includes(99) || genres.includes(10770)) return null;

          // Stand-up & télé-réalité
          const kws = (detail.keywords?.keywords || []).map(k => k.name.toLowerCase());
          const fullText = `${detail.title} ${detail.tagline || ''} ${detail.overview || ''}`.toLowerCase();
          const isStandup = kws.some(k => STANDUP_PATTERNS.some(p => k.includes(p))) 
            || /\b(stand-up|standup|one-man-show|spectacle d'humour|comedy special)\b/i.test(fullText);

          if (isStandup) return null;
          if (detail.runtime && detail.runtime < 70) return null;

          // Disponibilité française
          const translations = detail.translations?.translations || [];
          const hasFrTranslation = translations.some(t => t.iso_639_1 === 'fr');
          const hasFrAudio = (detail.spoken_languages || []).some(l => l.iso_639_1 === 'fr');
          const isFrOriginal = (detail.original_language || '').toLowerCase() === 'fr';
          const hasFrOverview = detail.overview && detail.overview.trim().length > 20;
          const hasFrTitle = detail.title && detail.original_title && detail.title.toLowerCase() !== detail.original_title.toLowerCase();
          const isMajorStudio = (detail.production_companies || []).some(c => 
            ['warner', 'sony', 'universal', 'paramount', 'disney', 'lionsgate', 'mgm', '20th century'].some(st => (c.name || '').toLowerCase().includes(st))
          );

          if (!hasFrTranslation && !hasFrAudio && !isFrOriginal && !hasFrOverview && !hasFrTitle && !(isMajorStudio && (detail.original_language || '').toLowerCase() === 'en')) {
            return null;
          }

          // EXCLUSION MUTUELLE : si déjà disponible en abonnement SVOD France
          const frFlatrate = detail['watch/providers']?.results?.FR?.flatrate || [];
          if (frFlatrate.length > 0) return null;

          // Exclusion des vieux films (> 1 an)
          const primaryYear = parseInt((detail.release_date || '').substring(0, 4), 10);
          if (primaryYear && primaryYear < (currentYear - 1)) {
            return null;
          }

          // Analyse précise des dates
          const allCountries = detail.release_dates?.results || [];
          let earliestCommercialTheatrical = null;
          let digitalDate = null;

          allCountries.forEach(country => {
            country.release_dates.forEach(rd => {
              const d = rd.release_date ? rd.release_date.split('T')[0] : null;
              if (!d) return;

              // Sortie cinéma commerciale uniquement (type 3, pas festival type 2)
              if (rd.type === 3) {
                if (!earliestCommercialTheatrical || d < earliestCommercialTheatrical) {
                  earliestCommercialTheatrical = d;
                }
              }

              // Sortie VOD / Digital (type 4)
              if (rd.type === 4) {
                if (country.iso_3166_1 === 'FR') {
                  digitalDate = d;
                } else if (country.iso_3166_1 === 'US' && (!digitalDate || country.iso_3166_1 !== 'FR')) {
                  digitalDate = d;
                } else if (!digitalDate) {
                  digitalDate = d;
                }
              }
            });
          });

          // Écart cinéma commercial vs digital (standard 180 jours = 6 mois)
          if (earliestCommercialTheatrical && digitalDate) {
            const tDate = new Date(earliestCommercialTheatrical);
            const dDate = new Date(digitalDate);
            const diffDays = Math.round((dDate - tDate) / (1000 * 60 * 60 * 24));
            if (diffDays > 180) return null;
          }

          const finalReleaseDate = digitalDate || detail.release_date || '';

          return {
            id: detail.id,
            imdbId: detail.external_ids?.imdb_id || `tmdb:${detail.id}`,
            title: detail.title,
            originalTitle: detail.original_title,
            poster: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : 'https://placehold.co/300x450/1e293b/94a3b8?text=Sans+Affiche',
            backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
            year: finalReleaseDate.substring(0, 4) || '2026',
            rating: detail.vote_average ? detail.vote_average.toFixed(1) : 'NR',
            runtime: detail.runtime ? `${detail.runtime} min` : '',
            overview: detail.overview || 'Sortie VOD & Digital (Piste ou sous-titres FR disponibles).',
            providers: [],
            isVod: true,
            releaseDate: finalReleaseDate
          };
        } catch (e) {
          return null;
        }
      })
    );

    const validNew = enriched
      .filter(Boolean)
      .sort((a, b) => (b.releaseDate || b.year || '').localeCompare(a.releaseDate || a.year || ''));

    if (append) {
      studioState.row2.movies.push(...validNew);
    } else {
      studioState.row2.movies = validNew;
    }

    studioState.row2.pagesLoaded = pagesUS[pagesUS.length - 1];
    renderTrack('track-row-2', studioState.row2.movies, 2);
    if (counter) counter.textContent = `${studioState.row2.movies.length} films`;
  } catch (err) {
    if (!append) {
      track.innerHTML = `<div class="track-loading" style="color: #f87171;">Erreur lors du chargement : ${err.message}</div>`;
    }
  } finally {
    studioState.row2.loading = false;
  }
}

// Fonction globale appelée par la carte "Charger plus"
window.loadMoreRow = function(rowNum) {
  if (rowNum === 1) {
    loadRow1(true);
  } else if (rowNum === 2) {
    loadRow2(true);
  }
};

// =============================================================================
// 8. RENDU DES AFFICHES (Stremio Cards) & MODAL FILM
// =============================================================================
function renderTrack(containerId, movies, rowNum) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (movies.length === 0) {
    container.innerHTML = '<div class="track-loading">Aucun film trouvé avec ces filtres.</div>';
    return;
  }

  const cardsHtml = movies.map(m => `
    <div class="movie-card" data-id="${m.id}" onclick="openMovieDetail(${m.id})">
      <div class="poster-wrap">
        <img src="${m.poster}" alt="${escapeHtml(m.title)}" loading="lazy">
        <div class="card-overlay">
          <span class="rating-pill">★ ${m.rating}</span>
          <span class="year-pill">${m.year}</span>
        </div>
        ${m.isVod ? '<span class="badge-card-vod">VOD</span>' : ''}
      </div>
      <div class="card-info">
        <h3 class="movie-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</h3>
        <div class="movie-meta">
          <span class="meta-year">${m.year}</span>
          ${m.runtime ? `<span class="meta-runtime">${m.runtime}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  const loadMoreBtnHtml = `
    <div class="movie-card load-more-card" onclick="loadMoreRow(${rowNum})" title="Charger plus de titres dans le passé">
      <div class="load-more-inner">
        <span class="load-more-icon">➕</span>
        <span class="load-more-title">Charger plus</span>
        <span class="load-more-sub">Remonter dans le passé</span>
      </div>
    </div>
  `;

  container.innerHTML = cardsHtml + loadMoreBtnHtml;
}

window.openMovieDetail = function(movieId) {
  const allMovies = [...studioState.row1.movies, ...studioState.row2.movies];
  const m = allMovies.find(item => item.id === movieId);
  if (!m) return;

  const modal = document.getElementById('movieModal');
  const body = document.getElementById('movieModalBody');
  if (!modal || !body) return;

  const providerLogos = (m.providers || []).map(p => `
    <div class="provider-pill">
      ${p.logo ? `<img src="${p.logo}" alt="${escapeHtml(p.name)}">` : ''}
      <span>${escapeHtml(p.name)}</span>
    </div>
  `).join('');

  body.innerHTML = `
    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
      <img src="${m.poster}" style="width: 180px; border-radius: 12px; object-fit: cover; aspect-ratio: 2/3;" alt="${escapeHtml(m.title)}">
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
          IMDb ID : ${m.imdbId} • TMDB ID : ${m.id}
        </div>
        ${providerLogos ? `
          <div style="margin-top: 16px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Disponible sur :</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">${providerLogos}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
};

const closeMovieModal = document.getElementById('closeMovieModal');
if (closeMovieModal) {
  closeMovieModal.addEventListener('click', () => {
    const modal = document.getElementById('movieModal');
    if (modal) modal.classList.add('hidden');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderDemoRow1() {
  const track = document.getElementById('track-row-1');
  if (track) {
    track.innerHTML = '<div class="track-loading">Mode démo : Saisis ta clé TMDB en haut à droite pour afficher les nouveautés réelles en temps réel.</div>';
  }
}

function renderDemoRow2() {
  const track = document.getElementById('track-row-2');
  if (track) {
    track.innerHTML = '<div class="track-loading">Mode démo : Saisis ta clé TMDB en haut à droite pour afficher les nouveautés VOD réelles.</div>';
  }
}
