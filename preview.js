/**
 * Stremio Dynamic Catalog Studio
 * TMDB Streaming France Engine & Filter Inspector
 */

// --- Demo Dataset (Simulating TMDB live response for instant test without API key) ---
const DEMO_MOVIES = [
  {
    id: 1159311,
    title: "Le Cerveau du Siècle (Netflix Original)",
    original_title: "The Mastermind",
    overview: "Un thriller palpitant produit en exclusivité pour Netflix. Un braquage millimétré vire à la confrontation psychologique.",
    poster_path: "/7x09eBq8yZ30N9QeM0YlG0u.jpg",
    backdrop_path: "/backdrop1.jpg",
    vote_average: 7.4,
    vote_count: 342,
    imdb_id: "tt2891104",
    primary_release_date: "2026-09-18",
    france_digital_date: "2026-09-18",
    providers: [{ name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null
  },
  {
    id: 1022789,
    title: "Echoes of Silence (Apple Original)",
    original_title: "Echoes of Silence",
    overview: "Drame intimiste et captivant sur un pianiste virtuose confronté à la perte soudaine de son ouïe.",
    poster_path: "/uXDwYmb9G9v3hN5lP9Q.jpg",
    backdrop_path: "/backdrop2.jpg",
    vote_average: 8.1,
    vote_count: 512,
    imdb_id: "tt3019842",
    primary_release_date: "2026-09-26",
    france_digital_date: "2026-09-26",
    providers: [{ name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/peURlLlr8jggOwK53fJ5wdQl05y.jpg" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null
  },
  {
    id: 934052,
    title: "Sous la Surface (Prime Video Exclusive)",
    original_title: "Deep Current",
    overview: "En haute mer, un sous-marin de recherche découvre une anomalie biologique qui menace la station.",
    poster_path: "/samplePoster3.jpg",
    backdrop_path: "/backdrop3.jpg",
    vote_average: 6.8,
    vote_count: 189,
    imdb_id: "tt2749102",
    primary_release_date: "2026-09-10",
    france_digital_date: "2026-09-10",
    providers: [{ name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/ceCYw30k0kUf16B2V1q.jpg" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null
  },
  {
    id: 823464,
    title: "Cyber City: Renegades",
    original_title: "Cyber City: Renegades",
    overview: "Film d'animation SF cyberpunk sorti directement en streaming sur Disney+ et Hulu.",
    poster_path: "/samplePoster4.jpg",
    backdrop_path: "/backdrop4.jpg",
    vote_average: 7.9,
    vote_count: 420,
    imdb_id: "tt2991032",
    primary_release_date: "2026-09-02",
    france_digital_date: "2026-09-02",
    providers: [{ name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgQI5a1t9OnRyd29umV3VA.jpg" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null
  },
  {
    id: 615656,
    title: "Inception (2010)",
    original_title: "Inception",
    overview: "Dom Cobb est un voleur expérimenté dans l'art périlleux de l'extraction de secrets...",
    poster_path: "/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    vote_average: 8.4,
    vote_count: 36000,
    imdb_id: "tt1375666",
    primary_release_date: "2010-07-15",
    france_digital_date: "2026-09-20", // Re-added on Netflix France this month!
    providers: [{ name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" }],
    theatrical_release_exists: true,
    earliest_theatrical_date: "2010-07-15"
  },
  {
    id: 157336,
    title: "Interstellar (2014)",
    original_title: "Interstellar",
    overview: "Une équipe d'explorateurs franchit une faille dans l'espace pour sauver l'humanité.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/rAiYTggjG9svABYXZCq.jpg",
    vote_average: 8.4,
    vote_count: 34500,
    imdb_id: "tt0816692",
    primary_release_date: "2014-11-05",
    france_digital_date: "2026-09-15", // Re-added on Prime Video
    providers: [{ name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/ceCYw30k0kUf16B2V1q.jpg" }],
    theatrical_release_exists: true,
    earliest_theatrical_date: "2014-11-05"
  },
  {
    id: 980489,
    title: "Gran Turismo (Arrivée SVOD récente)",
    original_title: "Gran Turismo",
    overview: "Un jeune joueur de Gran Turismo tente de devenir pilote automobile professionnel.",
    poster_path: "/51tqzRtKMMZEY4Vp277MkW99.jpg",
    backdrop_path: "/rM59w.jpg",
    vote_average: 7.7,
    vote_count: 2400,
    imdb_id: "tt13202454",
    primary_release_date: "2023-08-09",
    france_digital_date: "2026-09-01",
    providers: [{ name: "Canal+", logo: "https://image.tmdb.org/t/p/original/381.jpg" }],
    theatrical_release_exists: true,
    earliest_theatrical_date: "2023-08-09"
  },
  {
    id: 1226578,
    title: "L'Ombre du Doute (Max Original)",
    original_title: "Shadow of Doubt",
    overview: "Une enquêtrice judiciaire découvre une conspiration interne au sein de la cour suprême.",
    poster_path: "/samplePoster5.jpg",
    backdrop_path: "/backdrop5.jpg",
    vote_average: 7.2,
    vote_count: 98,
    imdb_id: "tt3128941",
    primary_release_date: "2026-09-28",
    france_digital_date: "2026-09-28",
    providers: [{ name: "Max", logo: "https://image.tmdb.org/t/p/original/6ooaL8.jpg" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null
  },
  {
    id: 1111111,
    title: "The Night Courier (Direct SVOD)",
    original_title: "The Night Courier",
    overview: "Un coursier à moto de nuit se retrouve pris en chasse par deux gangs rivaux à Paris.",
    poster_path: "/samplePoster6.jpg",
    backdrop_path: "/backdrop6.jpg",
    vote_average: 6.9,
    vote_count: 215,
    imdb_id: "tt3201981",
    primary_release_date: "2026-09-22",
    france_digital_date: "2026-09-22",
    providers: [{ name: "Canal+", logo: "https://image.tmdb.org/t/p/original/381.jpg" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null
  }
];

// --- Demo Dataset for Line 2 (Worldwide VOD & Digital Drops with French Audio/Sub availability) ---
const DEMO_VOD_MOVIES = [
  {
    id: 1607127,
    title: "One Last Shot (2026)",
    original_title: "One Last Shot",
    overview: "Navy SEAL Jake Harris reprend du service pour neutraliser un commando de mercenaires, mené par un ancien frère d'armes, avant qu'il ne sabote le système de défense antimissile américain.",
    poster_path: "/niQ4NBh2jqAf1hDZP5m6ReWFAb7.jpg",
    backdrop_path: "/8giIQcHpxgsPVP6c7aQtHl3txuh.jpg",
    vote_average: 7.5,
    vote_count: 94,
    imdb_id: "tt33245452",
    primary_release_date: "2026-09-22",
    france_digital_date: "2026-09-22",
    original_language: "en",
    hasFrenchAvailability: true,
    hasFrenchFlatrateSVOD: false,
    providers: [{ name: "Amazon Video US / Apple TV (VOD)", logo: "https://image.tmdb.org/t/p/original/ceCYw30k0kUf16B2V1q.jpg" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null,
    genres: [28, 53],
    runtime: 98,
    keywords: ["navy seal", "hostage", "action hero", "mercenary"],
    topCast: [{ name: "Scott Adkins", character: "Jake Harris" }, { name: "Dolph Lundgren", character: "Admiral Mulholland" }]
  },
  {
    id: 1059071,
    title: "The Shadow Sector (2026)",
    original_title: "The Shadow Sector",
    overview: "Thriller d'action tactique sorti directement en VOD et achat digital mondial sur Prime Video US et iTunes.",
    poster_path: "/samplePoster5.jpg",
    backdrop_path: "/backdrop5.jpg",
    vote_average: 6.8,
    vote_count: 145,
    imdb_id: "tt2910291",
    primary_release_date: "2026-09-28",
    france_digital_date: "2026-09-28",
    original_language: "en",
    hasFrenchAvailability: true,
    hasFrenchFlatrateSVOD: false,
    providers: [{ name: "VOD US (Achat/Location)", logo: "" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null,
    genres: [28, 53],
    runtime: 104,
    keywords: ["special ops", "mercenary"],
    topCast: [{ name: "Frank Grillo", character: "Commander Vance" }]
  },
  {
    id: 980489,
    title: "Gran Turismo (Exemple Rejet Ligne 2 - Déjà en SVOD)",
    original_title: "Gran Turismo",
    overview: "Disponible sur Canal+ SVOD France en abonnement, donc exclu de la Ligne 2 pour garantir une séparation 100% nette avec la Ligne 1.",
    poster_path: "/51tqzRtKMMZEY4Vp277MkW99.jpg",
    backdrop_path: "/rM59w.jpg",
    vote_average: 7.7,
    vote_count: 2400,
    imdb_id: "tt13202454",
    primary_release_date: "2023-08-09",
    france_digital_date: "2026-09-01",
    original_language: "en",
    hasFrenchAvailability: true,
    hasFrenchFlatrateSVOD: true,
    flatrateProviderNames: "Canal+",
    providers: [{ name: "Canal+", logo: "https://image.tmdb.org/t/p/original/381.jpg" }],
    theatrical_release_exists: true,
    earliest_theatrical_date: "2023-08-09",
    genres: [28, 18],
    runtime: 134
  },
  {
    id: 1122334,
    title: "Regional Asian Drama (Exemple Rejet - Pas de FR)",
    original_title: "Local Story",
    overview: "Drame local sans doublage ni sous-titres français enregistrés.",
    poster_path: null,
    backdrop_path: null,
    vote_average: 6.2,
    vote_count: 50,
    imdb_id: "tt9988776",
    primary_release_date: "2026-09-15",
    france_digital_date: "2026-09-15",
    original_language: "th",
    hasFrenchAvailability: false,
    hasFrenchFlatrateSVOD: false,
    providers: [{ name: "VOD Asie", logo: "" }],
    theatrical_release_exists: false,
    earliest_theatrical_date: null,
    genres: [18],
    runtime: 85
  }
];

// Generate beautiful, self-contained SVG posters (zero network dependencies, never breaks)
function createFallbackPoster(title, subtitle = "STREAMING ORIGINAL", color = "#8b5cf6") {
  const cleanTitle = title.replace(/\(.*?\)/g, '').trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#181c2e"/>
        <stop offset="50%" stop-color="#101320"/>
        <stop offset="100%" stop-color="#08090f"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="25" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <rect width="500" height="750" fill="url(#bg)"/>
    <circle cx="250" cy="270" r="110" fill="url(#accent)" opacity="0.18" filter="url(#glow)"/>
    <circle cx="250" cy="270" r="60" fill="#1e243a" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <polygon points="240,245 275,270 240,295" fill="${color}"/>
    <rect x="60" y="470" width="380" height="3" rx="1.5" fill="url(#accent)"/>
    <text x="250" y="525" fill="#ffffff" font-family="'Outfit', system-ui, sans-serif" font-size="27" font-weight="700" text-anchor="middle" letter-spacing="-0.5">
      ${cleanTitle.length > 22 ? cleanTitle.substring(0, 20) + '...' : cleanTitle}
    </text>
    <text x="250" y="565" fill="${color}" font-family="'Outfit', system-ui, sans-serif" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="3">
      ${subtitle.toUpperCase()}
    </text>
    <text x="250" y="605" fill="#64748b" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">
      FRANCE • EXCLUSIVITÉ VOD
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Brand logos / badge helper
function getProviderBadgeHtml(provider) {
  const brandColors = {
    'netflix': { bg: '#E50914', text: '#FFF', short: 'NETFLIX' },
    'prime': { bg: '#00A8E1', text: '#FFF', short: 'PRIME' },
    'disney': { bg: '#113CCF', text: '#FFF', short: 'DISNEY+' },
    'canal': { bg: '#000000', text: '#FFF', short: 'CANAL+' },
    'apple': { bg: '#1c1c1e', text: '#FFF', short: ' TV+' },
    'max': { bg: '#002BE7', text: '#FFF', short: 'MAX' },
    'paramount': { bg: '#0064FF', text: '#FFF', short: 'PARAMOUNT+' }
  };

  const nameLower = (provider.name || '').toLowerCase();
  let brand = Object.entries(brandColors).find(([k]) => nameLower.includes(k));
  const style = brand ? brand[1] : { bg: '#334155', text: '#FFF', short: provider.name || 'SVOD' };

  if (provider.logo && !provider.logo.includes('undefined') && !provider.logo.includes('placehold.co')) {
    return `<div class="provider-icon-badge" title="${provider.name}">
      <img src="${provider.logo}" alt="${provider.name}" onerror="this.style.display=\\'none\\'; this.parentElement.innerHTML=\\'<span style=\\\\'background:${style.bg};color:${style.text};padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;\\\\'\\\\>${style.short}\\\\</span>\\'">
    </div>`;
  }

  return `<div class="provider-icon-badge" style="background:${style.bg};color:${style.text};padding:3px 7px;font-size:10px;font-weight:700;border-radius:5px;border:none;">
    ${style.short}
  </div>`;
}

function getPosterUrl(posterPath, title, isOriginal = true) {
  if (posterPath && posterPath.startsWith('http') && !posterPath.includes('placehold.co')) {
    return posterPath;
  }
  if (posterPath && posterPath.startsWith('/') && !posterPath.includes('samplePoster')) {
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }
  const color = isOriginal ? '#8b5cf6' : '#0284c7';
  const subtitle = isOriginal ? 'Streaming Original' : 'Nouveauté VOD';
  return createFallbackPoster(title, subtitle, color);
}

// --- Application State ---
const state = {
  catalogMode: 'streaming_fr', // 'streaming_fr' (Line 1 SVOD) | 'digital_vod' (Line 2 VOD)
  apiKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('tmdb_api_key') : '') || '',
  isLiveApi: false,
  rawMovies: [],
  processedItems: [],
  activePreset: 'strict',
  theatricalGapMax: 0, // 0 = Strict Direct-to-Streaming / Originals only
  timeWindowDays: 60,
  providerFilter: 'all',
  minRating: 0,
  minVotes: 0,
  minRuntime: 70,
  mainLanguagesOnly: true,
  frenchLocalizationOnly: true,
  excludeStandup: true,
  excludeDocu: true,
  excludeTvMovies: true,
  inspectorFilter: 'all' // all | accepted | rejected
};

// --- DOM Elements ---
const elements = typeof document !== 'undefined' ? {
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
  clearApiKeyBtn: document.getElementById('clearApiKeyBtn'),
  configPanel: document.getElementById('configPanel'),
  toggleConfigBtn: document.getElementById('toggleConfigBtn'),
  closeConfigBtn: document.getElementById('closeConfigBtn'),
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  apiStatusText: document.getElementById('apiStatusText'),

  tabCatalogStreaming: document.getElementById('tabCatalogStreaming'),
  tabCatalogVod: document.getElementById('tabCatalogVod'),

  presetStrict: document.getElementById('presetStrictOriginals'),
  presetFresh: document.getElementById('presetFreshReleases'),
  presetAll: document.getElementById('presetAllStreaming'),

  theatricalGapMax: document.getElementById('theatricalGapMax'),
  theatricalGapLabel: document.getElementById('theatricalGapLabel'),
  gapDisplay: document.getElementById('gapDisplay'),
  gapHelpText: document.getElementById('gapHelpText'),
  timeWindowSelect: document.getElementById('timeWindowSelect'),
  timeWindowLabel: document.getElementById('timeWindowLabel'),
  timeWindowHelp: document.getElementById('timeWindowHelp'),
  providerFilterContainer: document.getElementById('providerFilterContainer'),
  providerFilterLabel: document.getElementById('providerFilterLabel'),
  providerFilterSelect: document.getElementById('providerFilterSelect'),
  providerFilterHelp: document.getElementById('providerFilterHelp'),

  presetStrictTitle: document.getElementById('presetStrictTitle'),
  presetStrictSub: document.getElementById('presetStrictSub'),
  presetFreshTitle: document.getElementById('presetFreshTitle'),
  presetFreshSub: document.getElementById('presetFreshSub'),
  presetAllTitle: document.getElementById('presetAllTitle'),
  presetAllSub: document.getElementById('presetAllSub'),

  minRatingInput: document.getElementById('minRatingInput'),
  minRuntimeInput: document.getElementById('minRuntimeInput'),
  excludeStandupCheckbox: document.getElementById('excludeStandupCheckbox'),
  excludeDocuCheckbox: document.getElementById('excludeDocuCheckbox'),
  excludeTvMoviesCheckbox: document.getElementById('excludeTvMoviesCheckbox'),
  mainLanguagesOnlyCheckbox: document.getElementById('mainLanguagesOnlyCheckbox'),
  frenchLocalizationOnlyCheckbox: document.getElementById('frenchLocalizationOnlyCheckbox'),
  applyFiltersBtn: document.getElementById('applyFiltersBtn'),
  filterSummaryText: document.getElementById('filterSummaryText'),

  tabStremioView: document.getElementById('tabStremioView'),
  tabDebugView: document.getElementById('tabDebugView'),
  stremioViewSection: document.getElementById('stremioViewSection'),
  inspectorSection: document.getElementById('inspectorSection'),
  statsPill: document.getElementById('statsPill'),

  stremioRowTrack: document.getElementById('stremioRowTrack'),
  scrollLeftBtn: document.getElementById('scrollLeftBtn'),
  scrollRightBtn: document.getElementById('scrollRightBtn'),
  catalogTitleDisplay: document.getElementById('catalogTitleDisplay'),

  inspectorTableBody: document.getElementById('inspectorTableBody'),
  countTotal: document.getElementById('countTotal'),
  countAccepted: document.getElementById('countAccepted'),
  countRejected: document.getElementById('countRejected'),
  filterShowAll: document.getElementById('filterShowAll'),
  filterShowAccepted: document.getElementById('filterShowAccepted'),
  filterShowRejected: document.getElementById('filterShowRejected'),

  jsonOutput: document.getElementById('jsonOutput'),
  copyJsonBtn: document.getElementById('copyJsonBtn'),

  movieModal: document.getElementById('movieModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalBody: document.getElementById('modalBody')
} : {};

// --- Initialization ---
function init() {
  if (state.apiKey) {
    elements.apiKeyInput.value = state.apiKey;
    validateAndConnectApiKey(state.apiKey);
  } else {
    setDemoMode();
  }

  setupEventListeners();
  applyFilters();
}

// --- Event Listeners ---
function setupEventListeners() {
  // Config Panel Drawer
  elements.toggleConfigBtn.addEventListener('click', () => {
    elements.configPanel.classList.toggle('open');
  });
  elements.closeConfigBtn.addEventListener('click', () => {
    elements.configPanel.classList.remove('open');
  });

  // API Key handlers
  elements.saveApiKeyBtn.addEventListener('click', () => {
    const key = elements.apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('tmdb_api_key', key);
      state.apiKey = key;
      validateAndConnectApiKey(key);
    }
  });

  elements.clearApiKeyBtn.addEventListener('click', () => {
    localStorage.removeItem('tmdb_api_key');
    state.apiKey = '';
    elements.apiKeyInput.value = '';
    setDemoMode();
    applyFilters();
  });

  // Catalog Line Switching (Line 1: Streaming France vs Line 2: VOD & Digital Worldwide)
  if (elements.tabCatalogStreaming) {
    elements.tabCatalogStreaming.addEventListener('click', () => switchCatalogMode('streaming_fr'));
  }
  if (elements.tabCatalogVod) {
    elements.tabCatalogVod.addEventListener('click', () => switchCatalogMode('digital_vod'));
  }

  // Presets
  elements.presetStrict.addEventListener('click', () => setPreset('strict'));
  elements.presetFresh.addEventListener('click', () => setPreset('fresh'));
  elements.presetAll.addEventListener('click', () => setPreset('all'));

  // Gap Slider
  elements.theatricalGapMax.addEventListener('input', (e) => {
    state.theatricalGapMax = parseInt(e.target.value, 10);
    updateGapDisplay();
    updateSummaryText();
  });

  elements.timeWindowSelect.addEventListener('change', (e) => {
    state.timeWindowDays = parseInt(e.target.value, 10);
    updateSummaryText();
    if (state.isLiveApi) {
      fetchLiveTmdbData();
    } else {
      applyFilters();
    }
  });

  elements.providerFilterSelect.addEventListener('change', (e) => {
    state.providerFilter = e.target.value;
    if (state.isLiveApi) {
      fetchLiveTmdbData();
    } else {
      applyFilters();
    }
  });

  elements.minRatingInput.addEventListener('change', (e) => {
    state.minRating = parseFloat(e.target.value) || 0;
  });

  elements.minRuntimeInput.addEventListener('change', (e) => {
    state.minRuntime = parseInt(e.target.value, 10) || 0;
    applyFilters();
  });

  elements.excludeStandupCheckbox.addEventListener('change', (e) => {
    state.excludeStandup = e.target.checked;
    applyFilters();
  });

  elements.excludeDocuCheckbox.addEventListener('change', (e) => {
    state.excludeDocu = e.target.checked;
    if (state.isLiveApi) {
      fetchLiveTmdbData();
    } else {
      applyFilters();
    }
  });

  elements.excludeTvMoviesCheckbox.addEventListener('change', (e) => {
    state.excludeTvMovies = e.target.checked;
    if (state.isLiveApi) {
      fetchLiveTmdbData();
    } else {
      applyFilters();
    }
  });

  elements.mainLanguagesOnlyCheckbox.addEventListener('change', (e) => {
    state.mainLanguagesOnly = e.target.checked;
    applyFilters();
  });

  elements.frenchLocalizationOnlyCheckbox.addEventListener('change', (e) => {
    state.frenchLocalizationOnly = e.target.checked;
    applyFilters();
  });

  elements.applyFiltersBtn.addEventListener('click', () => {
    if (state.isLiveApi) {
      fetchLiveTmdbData();
    } else {
      applyFilters();
    }
  });

  // Tabs
  elements.tabStremioView.addEventListener('click', () => switchTab('stremio'));
  elements.tabDebugView.addEventListener('click', () => switchTab('debug'));

  // Inspector Chip Filters
  elements.filterShowAll.addEventListener('click', () => setInspectorFilter('all'));
  elements.filterShowAccepted.addEventListener('click', () => setInspectorFilter('accepted'));
  elements.filterShowRejected.addEventListener('click', () => setInspectorFilter('rejected'));

  // Scroll controls for Stremio row
  elements.scrollLeftBtn.addEventListener('click', () => {
    elements.stremioRowTrack.scrollBy({ left: -450, behavior: 'smooth' });
  });
  elements.scrollRightBtn.addEventListener('click', () => {
    elements.stremioRowTrack.scrollBy({ left: 450, behavior: 'smooth' });
  });

  // Copy Stremio JSON
  elements.copyJsonBtn.addEventListener('click', copyStremioJson);

  // Modal
  elements.closeModalBtn.addEventListener('click', closeModal);
  elements.movieModal.addEventListener('click', (e) => {
    if (e.target === elements.movieModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function updateGapDisplay() {
  const isVod = state.catalogMode === 'digital_vod';
  if (state.theatricalGapMax === 0) {
    elements.gapDisplay.textContent = isVod 
      ? '0 à 2 jours (Strictement Direct-to-VOD / Sans sortie cinéma)'
      : '0 à 2 jours (Strictement exclusif streaming / marge simultanée)';
  } else {
    elements.gapDisplay.textContent = `Max ${state.theatricalGapMax} jours d'écart ciné/${isVod ? 'VOD' : 'streaming'}`;
  }
}

function updateSummaryText() {
  const isVod = state.catalogMode === 'digital_vod';
  if (isVod) {
    if (state.theatricalGapMax === 0) {
      elements.filterSummaryText.innerHTML = `Règle active : <strong>Exclusivités VOD pures</strong> (Direct-to-Digital sans cinéma préalable).`;
    } else {
      elements.filterSummaryText.innerHTML = `Règle active : <strong>Nouveautés VOD Mondiales</strong> (Direct VOD + ciné récent &le; ${state.theatricalGapMax}j max + Piste/Traduction FR).`;
    }
  } else {
    if (state.theatricalGapMax === 0) {
      elements.filterSummaryText.innerHTML = `Règle active : <strong>Exclusivités Streaming pures</strong> (tolérance de 1 à 2 jours pour sorties simultanées / day-and-date).`;
    } else {
      elements.filterSummaryText.innerHTML = `Règle active : <strong>Nouveautés Récentes</strong> (Direct streaming + tolérance ciné de ${state.theatricalGapMax}j max).`;
    }
  }
}

function updateUiForCatalogMode(mode) {
  const isVod = mode === 'digital_vod';
  if (isVod) {
    if (elements.theatricalGapLabel) elements.theatricalGapLabel.textContent = "Écart max Sortie Ciné / VOD";
    if (elements.gapHelpText) elements.gapHelpText.textContent = "Tolérance d'écart entre la projection cinéma et l'arrivée en VOD / achat digital.";
    if (elements.timeWindowLabel) elements.timeWindowLabel.textContent = "Fenêtre de sortie VOD & Digital";
    if (elements.timeWindowHelp) elements.timeWindowHelp.textContent = "Date d'arrivée sur les stores digitaux mondiaux (Amazon US/FR, Apple TV...).";
    
    if (elements.presetStrictTitle) elements.presetStrictTitle.textContent = "100% Exclusivités Direct VOD";
    if (elements.presetStrictSub) elements.presetStrictSub.innerHTML = "Sorties Direct-to-Digital sans cinéma préalable";
    
    if (elements.presetFreshTitle) elements.presetFreshTitle.textContent = "Nouveautés VOD & Ciné Récent (< 90j)";
    if (elements.presetFreshSub) elements.presetFreshSub.textContent = "Sorties VOD récentes (Direct VOD ou ciné récent avec VF/VOSTFR)";
    
    if (elements.presetAllTitle) elements.presetAllTitle.textContent = "Toutes sorties VOD mondiales";
    if (elements.presetAllSub) elements.presetAllSub.textContent = "Tout le catalogue numérique mondial avec VF/VOSTFR";

    if (elements.providerFilterLabel) elements.providerFilterLabel.textContent = "Stores VOD & Digital (Mondial)";
    if (elements.providerFilterHelp) elements.providerFilterHelp.textContent = "Type : Achat / Location (Type 4 WEB-DL mondiaux).";
    if (elements.providerFilterSelect) {
      elements.providerFilterSelect.innerHTML = `
        <option value="all" selected>Tous les stores (Amazon Video, Apple TV, Google TV...)</option>
        <option value="vod_us">Sorties US (Prime Video US, iTunes US)</option>
        <option value="vod_fr">Sorties France (Canal VOD, Orange, Apple FR)</option>
      `;
    }
  } else {
    if (elements.theatricalGapLabel) elements.theatricalGapLabel.textContent = "Écart max Sortie Ciné / Streaming";
    if (elements.gapHelpText) elements.gapHelpText.textContent = "Si 0 : seuls les films exclusifs streaming (marge de 2j tolérée pour sorties simultanées) sont acceptés.";
    if (elements.timeWindowLabel) elements.timeWindowLabel.textContent = "Fenêtre de sortie en France";
    if (elements.timeWindowHelp) elements.timeWindowHelp.textContent = "Date d'arrivée sur les plateformes françaises.";

    if (elements.presetStrictTitle) elements.presetStrictTitle.textContent = "100% Exclusivités & Direct Streaming";
    if (elements.presetStrictSub) elements.presetStrictSub.innerHTML = "Sortie ciné &le; 2 jours (Netflix Originals, Prime, etc.)";

    if (elements.presetFreshTitle) elements.presetFreshTitle.textContent = "Nouveautés & Ciné Récent (< 90j)";
    if (elements.presetFreshSub) elements.presetFreshSub.textContent = "Direct streaming + sorties ciné très récentes";

    if (elements.presetAllTitle) elements.presetAllTitle.textContent = "Toutes sorties récentes streaming";
    if (elements.presetAllSub) elements.presetAllSub.textContent = "Filtre classique sans élimination des anciens";

    if (elements.providerFilterLabel) elements.providerFilterLabel.textContent = "Plateformes SVOD France";
    if (elements.providerFilterHelp) elements.providerFilterHelp.textContent = "Monétisation : type abonnement streaming (flatrate).";
    if (elements.providerFilterSelect) {
      elements.providerFilterSelect.innerHTML = `
        <option value="all" selected>Toutes plateformes (Netflix, Prime, Disney+, Canal+, Max...)</option>
        <option value="8">Netflix uniquement</option>
        <option value="119">Amazon Prime Video uniquement</option>
        <option value="337">Disney+ uniquement</option>
        <option value="381">Canal+ / MyCanal uniquement</option>
        <option value="350">Apple TV+ uniquement</option>
        <option value="1899">Max (HBO) uniquement</option>
        <option value="531">Paramount+ uniquement</option>
      `;
    }
  }
}

function setPreset(type) {
  state.activePreset = type;
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));

  const isVod = state.catalogMode === 'digital_vod';

  if (type === 'strict') {
    elements.presetStrict.classList.add('active');
    state.theatricalGapMax = 0;
    elements.theatricalGapMax.value = 0;
    elements.catalogTitleDisplay.textContent = isVod
      ? "Nouveautés VOD & Digital (Exclusivités Direct VOD)"
      : "Nouveautés Streaming France (Films Exclusifs)";
  } else if (type === 'fresh') {
    elements.presetFresh.classList.add('active');
    state.theatricalGapMax = 90;
    elements.theatricalGapMax.value = 90;
    elements.catalogTitleDisplay.textContent = isVod
      ? "Nouveautés VOD & Digital (Achat / Location - Sorties Mondiales avec Piste FR)"
      : "Nouveautés Streaming France (Exclusivités & Ciné Récent)";
  } else if (type === 'all') {
    elements.presetAll.classList.add('active');
    state.theatricalGapMax = 3650; // No filter on gap
    elements.theatricalGapMax.value = 365;
    elements.catalogTitleDisplay.textContent = isVod
      ? "Toutes les Arrivées VOD & Digital Mondiales"
      : "Toutes les Arrivées Récentes en Streaming (Sans filtre d'âge)";
  }

  updateGapDisplay();
  updateSummaryText();
  applyFilters();
}

function setDemoMode() {
  state.isLiveApi = false;
  elements.apiStatusBadge.querySelector('.status-dot').classList.remove('active');
  elements.apiStatusText.textContent = 'Mode Démo (Données simulées)';
  if (state.catalogMode === 'digital_vod') {
    state.rawMovies = [...DEMO_VOD_MOVIES];
  } else {
    state.rawMovies = [...DEMO_MOVIES];
  }
}

function switchCatalogMode(mode) {
  state.catalogMode = mode;
  updateUiForCatalogMode(mode);

  if (mode === 'streaming_fr') {
    if (elements.tabCatalogStreaming) elements.tabCatalogStreaming.classList.add('active');
    if (elements.tabCatalogVod) elements.tabCatalogVod.classList.remove('active');
    setPreset('strict');
  } else {
    if (elements.tabCatalogStreaming) elements.tabCatalogStreaming.classList.remove('active');
    if (elements.tabCatalogVod) elements.tabCatalogVod.classList.add('active');
    // On VOD, default to 'fresh' (< 90j) so recent theatrical releases dropping on VOD appear immediately
    setPreset('fresh');
  }

  if (state.isLiveApi && state.apiKey) {
    fetchLiveTmdbData();
  } else {
    setDemoMode();
    applyFilters();
  }
}

// --- TMDB API Live Verification & Fetching ---
async function validateAndConnectApiKey(key) {
  elements.apiStatusText.textContent = 'Vérification en cours...';
  try {
    const isBearer = key.length > 50;
    const headers = isBearer ? { 'Authorization': `Bearer ${key}` } : {};
    const url = isBearer 
      ? 'https://api.themoviedb.org/3/configuration' 
      : `https://api.themoviedb.org/3/configuration?api_key=${key}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Clé invalide');

    state.isLiveApi = true;
    elements.apiStatusBadge.querySelector('.status-dot').classList.add('active');
    elements.apiStatusText.textContent = 'Connecté en direct à TMDB';
    elements.configPanel.classList.remove('open');
    await fetchLiveTmdbData();
  } catch (err) {
    console.error(err);
    alert('Impossible de valider cette clé TMDB. Vérifie ta clé ou utilise le mode Démo.');
    setDemoMode();
  }
}

async function fetchLiveTmdbData() {
  const modeDesc = state.catalogMode === 'digital_vod' ? 'VOD & Digital mondial' : 'Streaming SVOD France';
  elements.stremioRowTrack.innerHTML = `<div class="empty-state">Scan approfondi de l'API TMDB pour ${modeDesc} (requêtes multi-pages)...</div>`;
  elements.statsPill.textContent = 'Chargement et analyse intelligente TMDB...';

  try {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - state.timeWindowDays);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    const isBearer = state.apiKey.length > 50;
    const headers = isBearer ? { 'Authorization': `Bearer ${state.apiKey}` } : {};
    const keyParam = isBearer ? '' : `api_key=${state.apiKey}&`;

    // Production companies IDs known for Streaming Originals
    const ORIGINAL_STUDIO_KEYWORDS = [
      'netflix', 'amazon studios', 'amazon content', 'amazon mgm', 'amazon', 'prime video', 'mgm', 'apple', 'disney+', 'disney', 'paramount+', 'paramount', 'hbo', 'warner bros'
    ];

    let withoutGenresParam = '';
    let excludedGenres = [];
    if (state.excludeDocu) excludedGenres.push(99);
    if (state.excludeTvMovies) excludedGenres.push(10770);
    if (excludedGenres.length > 0) {
      withoutGenresParam = `&without_genres=${excludedGenres.join('|')}`;
    }

    // Dynamic candidate limit scaled to the time window:
    // 30 days:  ~45 candidates  -> yields ~20-25 accepted films
    // 60 days:  ~75 candidates  -> yields ~35-45 accepted films
    // 90 days:  ~100 candidates -> yields ~50-60 accepted films
    // 180 days: ~140 candidates -> yields ~75-85+ accepted films
    let targetCandidateLimit = 75;
    if (state.timeWindowDays <= 30) {
      targetCandidateLimit = 45;
    } else if (state.timeWindowDays <= 60) {
      targetCandidateLimit = 75;
    } else if (state.timeWindowDays <= 90) {
      targetCandidateLimit = 100;
    } else {
      targetCandidateLimit = 140;
    }

    let allResults = [];

    if (state.catalogMode === 'digital_vod') {
      // Line 2: Worldwide Digital / VOD (Type 4)
      // Pure popularity.desc multi-page queries: ensures ONLY high-profile, real movies with posters & logos are fetched!
      const vodQueries = [];

      // Scale pages with the time window:
      // 30 days:  US pages 1 to 3, FR pages 1 to 2 (~80-100 candidates)
      // 60 days:  US pages 1 to 5, FR pages 1 to 2 (~120-140 candidates)
      // 90 days:  US pages 1 to 6, FR pages 1 to 3 (~160-180 candidates)
      // 180 days: US pages 1 to 8, FR pages 1 to 3 (~200-220 candidates)
      const popPagesUS = state.timeWindowDays <= 30 ? 3 : (state.timeWindowDays <= 60 ? 5 : (state.timeWindowDays <= 90 ? 6 : 8));
      for (let p = 1; p <= popPagesUS; p++) {
        vodQueries.push(
          `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&region=US&with_release_type=4${withoutGenresParam}&release_date.gte=${startStr}&release_date.lte=${endStr}&sort_by=popularity.desc&page=${p}`
        );
      }
      const popPagesFR = state.timeWindowDays <= 30 ? 2 : 3;
      for (let p = 1; p <= popPagesFR; p++) {
        vodQueries.push(
          `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&region=FR&with_release_type=4${withoutGenresParam}&release_date.gte=${startStr}&release_date.lte=${endStr}&sort_by=popularity.desc&page=${p}`
        );
      }

      const vodResponses = await Promise.all(
        vodQueries.map(url => fetch(url, { headers }).then(r => r.json()).catch(() => ({})))
      );
      for (const data of vodResponses) {
        if (data.results && data.results.length > 0) {
          allResults.push(...data.results);
        }
      }
    } else {
      // Line 1: French Flatrate SVOD (sort_by=release_date.desc)
      // Number of pages scales with time window to cover the full duration
      const pagesCount = state.timeWindowDays <= 30 ? 3 : (state.timeWindowDays <= 60 ? 5 : (state.timeWindowDays <= 90 ? 7 : 9));
      const line1Queries = [];
      for (let p = 1; p <= pagesCount; p++) {
        let discoverUrl = `https://api.themoviedb.org/3/discover/movie?${keyParam}language=fr-FR&watch_region=FR&with_watch_monetization_types=flatrate&with_release_type=4${withoutGenresParam}&release_date.gte=${startStr}&release_date.lte=${endStr}&sort_by=release_date.desc&page=${p}`;
        if (state.providerFilter !== 'all') {
          discoverUrl += `&with_watch_providers=${state.providerFilter}`;
        }
        line1Queries.push(fetch(discoverUrl, { headers }).then(r => r.json()).catch(() => ({})));
      }
      const line1Responses = await Promise.all(line1Queries);
      for (const data of line1Responses) {
        if (data.results && data.results.length > 0) {
          allResults.push(...data.results);
        }
      }
    }

    // Deduplicate
    const uniqueMap = new Map();
    allResults.forEach(item => uniqueMap.set(item.id, item));
    const uniqueResults = Array.from(uniqueMap.values());

    const candidatesToEnrich = uniqueResults.slice(0, targetCandidateLimit);

    elements.statsPill.textContent = `Analyse intelligente TMDB (0/${candidatesToEnrich.length})...`;

    // Concurrency pool (15 parallel requests) for fast, smooth and rate-limit safe enrichment
    const concurrency = 15;
    let completedCount = 0;
    const enrichedMovies = new Array(candidatesToEnrich.length);
    let curIdx = 0;

    async function enrichWorker() {
      while (curIdx < candidatesToEnrich.length) {
        const idx = curIdx++;
        const m = candidatesToEnrich[idx];
        try {
          const detailUrl = `https://api.themoviedb.org/3/movie/${m.id}?${keyParam}append_to_response=release_dates,watch/providers,external_ids,keywords,credits,translations&language=fr-FR`;
          const detailRes = await fetch(detailUrl, { headers });
          const detail = await detailRes.json();

          // 1. Check production companies
          const companies = detail.production_companies || [];
          const isStudioOriginal = companies.some(c => 
            ORIGINAL_STUDIO_KEYWORDS.some(kw => (c.name || '').toLowerCase().includes(kw))
          );

          // 2. Check French audio/sub/translations availability
          const translations = detail.translations?.translations || [];
          const hasFrenchTranslation = translations.some(t => t.iso_639_1 === 'fr');
          const hasFrenchAudio = (detail.spoken_languages || []).some(l => l.iso_639_1 === 'fr');
          const isFrenchOriginal = (detail.original_language || '').toLowerCase() === 'fr';
          const hasFrenchOverview = detail.overview && detail.overview.trim().length > 20;
          const hasFrenchTitle = detail.title && detail.original_title && detail.title.toLowerCase() !== detail.original_title.toLowerCase();
          const isMajorStudio = companies.some(c => 
            ['warner', 'sony', 'universal', 'paramount', 'disney', 'lionsgate', 'mgm', '20th century'].some(st => (c.name || '').toLowerCase().includes(st))
          );
          const hasFrenchAvailability = hasFrenchTranslation || hasFrenchAudio || isFrenchOriginal || hasFrenchOverview || hasFrenchTitle || (isMajorStudio && (detail.original_language || '').toLowerCase() === 'en');

          // 3. Analyse release dates
          const allReleaseDates = detail.release_dates?.results || [];
          let earliestCommercialTheatrical = null;
          let earliestAnyTheatrical = null;
          let digitalReleaseDate = null;

          allReleaseDates.forEach(country => {
            country.release_dates.forEach(rd => {
              const date = rd.release_date ? rd.release_date.split('T')[0] : null;
              if (!date) return;

              // Type 3: True commercial wide theatrical release
              if (rd.type === 3) {
                if (!earliestCommercialTheatrical || date < earliestCommercialTheatrical) {
                  earliestCommercialTheatrical = date;
                }
              }

              // Type 2: Limited / festival
              if (rd.type === 2 || rd.type === 3) {
                if (!earliestAnyTheatrical || date < earliestAnyTheatrical) {
                  earliestAnyTheatrical = date;
                }
              }

              // Digital: Type 4 (either FR, US or global)
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

          // Watch providers in FR or worldwide
          const frFlatrate = detail['watch/providers']?.results?.FR?.flatrate || [];
          const hasFrenchFlatrateSVOD = frFlatrate.length > 0;
          const flatrateProviderNames = frFlatrate.map(p => p.provider_name).join(', ');

          const frBuyRent = [
            ...(detail['watch/providers']?.results?.FR?.buy || []),
            ...(detail['watch/providers']?.results?.FR?.rent || [])
          ];
          const usBuyRent = [
            ...(detail['watch/providers']?.results?.US?.buy || []),
            ...(detail['watch/providers']?.results?.US?.rent || [])
          ];

          let provList = [];
          if (state.catalogMode === 'digital_vod') {
            provList = frBuyRent.length > 0 ? frBuyRent : usBuyRent;
          } else {
            provList = frFlatrate;
          }

          let providers = provList.slice(0, 3).map(p => ({
            name: p.provider_name,
            logo: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : ''
          }));

          if (providers.length === 0) {
            providers = state.catalogMode === 'digital_vod'
              ? [{ name: "Amazon Video / Apple TV (VOD)", logo: "https://image.tmdb.org/t/p/original/ceCYw30k0kUf16B2V1q.jpg" }]
              : [{ name: "Streaming FR", logo: "" }];
          }

          const primaryDate = detail.release_date || digitalReleaseDate;
          const finalDigitalDate = digitalReleaseDate || detail.release_date;

          const theatricalToCompare = isStudioOriginal ? earliestCommercialTheatrical : earliestAnyTheatrical;

          const genres = (detail.genres || []).map(g => g.id);
          const keywords = (detail.keywords?.keywords || []).map(k => k.name.toLowerCase());
          const topCast = (detail.credits?.cast || []).slice(0, 3).map(c => ({
            name: c.name || '',
            character: c.character || ''
          }));
          const runtime = detail.runtime || 0;
          const tagline = detail.tagline || '';

          enrichedMovies[idx] = {
            id: detail.id,
            title: detail.title,
            original_title: detail.original_title,
            overview: detail.overview,
            poster_path: detail.poster_path,
            backdrop_path: detail.backdrop_path,
            vote_average: detail.vote_average,
            vote_count: detail.vote_count,
            imdb_id: detail.external_ids?.imdb_id || `tmdb:${detail.id}`,
            primary_release_date: primaryDate,
            france_digital_date: finalDigitalDate,
            original_language: detail.original_language || '',
            providers,
            hasFrenchFlatrateSVOD,
            flatrateProviderNames,
            theatrical_release_exists: !!theatricalToCompare,
            earliest_theatrical_date: theatricalToCompare,
            isStudioOriginal,
            hasFrenchAvailability,
            genres,
            keywords,
            topCast,
            runtime,
            tagline
          };
        } catch (e) {
          enrichedMovies[idx] = null;
        } finally {
          completedCount++;
          if (completedCount % 5 === 0 || completedCount === candidatesToEnrich.length) {
            elements.statsPill.textContent = `Analyse intelligente TMDB (${completedCount}/${candidatesToEnrich.length})...`;
          }
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(concurrency, candidatesToEnrich.length) },
      () => enrichWorker()
    );
    await Promise.all(workers);

    state.rawMovies = enrichedMovies.filter(Boolean);
    applyFilters();
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la récupération des données réelles de TMDB.");
    setDemoMode();
    applyFilters();
  }
}

// --- The Core Filtering Algorithm ---
function applyFilters() {
  const processed = [];

  state.rawMovies.forEach(movie => {
    const rejectionReasons = [];
    let gapDays = 0;

    // THE CRITICAL CHECK: Theatrical Release VS Digital Release
    if (movie.theatrical_release_exists && movie.earliest_theatrical_date) {
      const theatDate = new Date(movie.earliest_theatrical_date);
      const digiDate = new Date(movie.france_digital_date || movie.primary_release_date);
      gapDays = Math.round((digiDate - theatDate) / (1000 * 60 * 60 * 24));

      if (state.catalogMode === 'digital_vod') {
        // Line 2 (VOD & Digital): we dynamically use state.theatricalGapMax
        if (state.theatricalGapMax === 0) {
          // Strict Direct VOD
          if (gapDays > 2) {
            rejectionReasons.push(`Sortie cinéma préalable (${gapDays}j d'écart, mode 100% Direct VOD actif)`);
          }
        } else if (state.theatricalGapMax < 3650) {
          if (gapDays > state.theatricalGapMax) {
            const years = (gapDays / 365).toFixed(1);
            rejectionReasons.push(`Sortie cinéma antérieure il y a ${years} ans (${gapDays}j d'écart, max toléré ${state.theatricalGapMax}j)`);
          }
        }
      } else {
        // Line 1 (SVOD France): strict tolerance of max 2 days for day-and-date
        const effectiveGap = Math.max(0, gapDays - 2);
        if (effectiveGap > state.theatricalGapMax) {
          const years = (gapDays / 365).toFixed(1);
          rejectionReasons.push(`Sortie cinéma il y a ${years} ans (${gapDays}j d'écart)`);
        }
      }
    } else {
      gapDays = 0;
    }

    // Check rating & votes threshold
    if (movie.vote_average < state.minRating) {
      rejectionReasons.push(`Note trop basse (${movie.vote_average}/10 < seuil ${state.minRating})`);
    }
    if (movie.vote_count < state.minVotes) {
      rejectionReasons.push(`Trop peu de votes (${movie.vote_count} votes < seuil ${state.minVotes})`);
    }

    // Provider check (only applies to Line 1 SVOD France)
    if (state.catalogMode === 'streaming_fr' && state.providerFilter !== 'all') {
      const targetProviderName = getProviderNameById(state.providerFilter);
      const hasProvider = movie.providers.some(p => p.name.toLowerCase().includes(targetProviderName.toLowerCase()));
      if (!hasProvider) {
        rejectionReasons.push(`Non disponible sur ${targetProviderName}`);
      }
    }

    // Mutual exclusion: Line 2 (VOD & Digital) strictly excludes titles available in French SVOD subscriptions (Line 1)
    if (state.catalogMode === 'digital_vod' && movie.hasFrenchFlatrateSVOD) {
      rejectionReasons.push(`Déjà disponible en streaming SVOD France (${movie.flatrateProviderNames || 'Netflix/Prime/Canal'}) - Réservé à la Ligne 1`);
    }

    // Minimum Runtime check (e.g. >= 70 min to eliminate shorts, NFL clips, making-of)
    if (state.minRuntime > 0 && movie.runtime > 0 && movie.runtime < state.minRuntime) {
      rejectionReasons.push(`Format court / Short (${movie.runtime} min < seuil de ${state.minRuntime} min)`);
    }

    // Main Languages Filter (FR, EN, ES, IT, DE, JA, KO) to eliminate obscure catalog fillers
    if (state.mainLanguagesOnly && movie.original_language) {
      const MAIN_LANGS = ['fr', 'en', 'es', 'it', 'de', 'ja', 'ko'];
      if (!MAIN_LANGS.includes(movie.original_language.toLowerCase())) {
        rejectionReasons.push(`Langue secondaire non prioritaire (${movie.original_language.toUpperCase()})`);
      }
    }

    // French localization & audio requirement
    if (state.frenchLocalizationOnly) {
      if (state.catalogMode === 'digital_vod') {
        if (!movie.hasFrenchAvailability) {
          rejectionReasons.push("Aucune piste audio, sous-titres ou traduction FR enregistrée");
        }
      } else {
        if (!movie.overview || movie.overview.trim().length < 20) {
          rejectionReasons.push("Pas de résumé français officiel disponible sur TMDB");
        }
      }
    }

    // Documentaires (Genre 99)
    if (state.excludeDocu) {
      const isDocuGenre = (movie.genres || []).includes(99);
      const isDocuKw = (movie.keywords || []).some(k => k.includes('documentary') || k.includes('docuseries'));
      const isDocuText = /\b(documentaire|documentary|docuseries|an nfl short)\b/i.test(`${movie.title} ${movie.tagline || ''} ${movie.overview || ''}`);
      if (isDocuGenre || isDocuKw || isDocuText) {
        rejectionReasons.push("Documentaire (Genre 99)");
      }
    }

    // Stand-up, Spectacles, Reality TV exclusion (without banning Comedy genre 35!)
    if (state.excludeStandup) {
      const STANDUP_PATTERNS = [
        'stand-up comedy', 'stand-up', 'comedy special', 'one-man show', 
        'one-man-show', 'one-woman show', 'one-woman-show', 'stand up', 
        'humorist', 'reality tv', 'reality show', 'game show', 'talk show', 
        'variety show', 'concert', 'concert film', 'humoriste', 'spectacle'
      ];

      const fullText = `${movie.title} ${movie.tagline || ''} ${movie.overview || ''}`.toLowerCase();
      const hasKeyword = (movie.keywords || []).some(k => 
        STANDUP_PATTERNS.some(p => k.includes(p))
      );
      const hasTextMatch = /\b(stand-up|standup|one-man-show|one-woman-show|spectacle d'humour|en spectacle|comedy special|dans ce spectacle)\b/i.test(fullText);

      // Role check: in comedy specials, the comedian plays "Self" / "Himself" / "Herself"
      const hasSelfRole = (movie.topCast || []).some(c => 
        /^(self|himself|herself|lui-même|elle-même)$/i.test((c.character || '').trim())
      );
      // Stand-up format is typically <= 68 min with Comedy tag
      const isShortComedy = (movie.genres || []).includes(35) && movie.runtime > 0 && movie.runtime <= 68;

      if (hasKeyword || hasTextMatch || (hasSelfRole && (movie.genres || []).includes(35)) || isShortComedy) {
        rejectionReasons.push("Stand-up / Spectacle d'humour (Comedy Special)");
      }
    }

    // TV Movie (10770) / Bêtisiers exclusion
    if (state.excludeTvMovies) {
      const isTvMovie = (movie.genres || []).includes(10770);
      const isBetisier = /b[eê]tisier/i.test(`${movie.title} ${movie.tagline || ''} ${movie.overview || ''}`);
      if (isTvMovie || isBetisier) {
        rejectionReasons.push("Téléfilm / Émission TV spéciale (Bêtisier)");
      }
    }

    const accepted = rejectionReasons.length === 0;
    const isPureOriginal = !movie.theatrical_release_exists || gapDays <= 2;
    let verdictReason = "";
    if (accepted) {
      if (state.catalogMode === 'digital_vod') {
        verdictReason = `Accepté : Nouveauté VOD & Digital mondiale (${movie.hasFrenchAvailability ? 'Piste/Traduction FR confirmée' : 'Disponibilité FR'})`;
      } else if (isPureOriginal) {
        verdictReason = gapDays <= 0 
          ? "Accepté : 100% Exclusivité Streaming / Original (aucune sortie ciné préalable)"
          : `Accepté : Exclusivité Streaming / Original (marge ciné de ${gapDays}j tolérée : sortie simultanée / day-and-date)`;
      } else {
        verdictReason = `Accepté : film ciné récent arrivé en streaming (${gapDays}j d'écart, max toléré ${state.theatricalGapMax}j)`;
      }
    } else {
      verdictReason = `Rejeté : ${rejectionReasons.join(' • ')}`;
    }

    processed.push({
      ...movie,
      gapDays,
      accepted,
      verdictReason,
      isPureOriginal
    });
  });

  // Sort chronologically: most recent release date first (on the far left of Stremio row)
  processed.sort((a, b) => {
    const dateA = a.france_digital_date || a.primary_release_date || '1970-01-01';
    const dateB = b.france_digital_date || b.primary_release_date || '1970-01-01';
    return dateB.localeCompare(dateA);
  });

  state.processedItems = processed;
  renderStremioRow();
  renderInspectorTable();
  renderStremioJson();
  updateStats();
}

function getProviderNameById(id) {
  const map = {
    '8': 'Netflix',
    '119': 'Prime',
    '337': 'Disney',
    '381': 'Canal',
    '350': 'Apple',
    '1899': 'Max',
    '531': 'Paramount'
  };
  return map[id] || '';
}

// --- Render View 1: Stremio Cinema Row ---
function renderStremioRow() {
  // Sort accepted items chronologically so the latest releases are at the very beginning (left)
  const acceptedItems = state.processedItems
    .filter(item => item.accepted)
    .sort((a, b) => {
      const dateA = a.france_digital_date || a.primary_release_date || '1970-01-01';
      const dateB = b.france_digital_date || b.primary_release_date || '1970-01-01';
      return dateB.localeCompare(dateA);
    });

  if (acceptedItems.length === 0) {
    const hint = state.catalogMode === 'digital_vod'
      ? "Astuce : active le preset 'Nouveautés VOD & Ciné Récent (< 90j)' ou élargis la fenêtre de sortie."
      : "Essaie d'augmenter légèrement la fenêtre de sortie ou de tolérer un écart ciné.";
    elements.stremioRowTrack.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>Aucun film ne correspond strictement à ces filtres.</p>
        <small>${hint}</small>
      </div>
    `;
    return;
  }

  elements.stremioRowTrack.innerHTML = acceptedItems.map(movie => {
    const poster = getPosterUrl(movie.poster_path, movie.title, movie.isPureOriginal);
    const provider = movie.providers[0] || { name: 'Streaming', logo: '' };
    const originalBadge = state.catalogMode === 'digital_vod'
      ? `<span class="tag-original" style="background:#059669;color:#fff;">VOD / Digital</span>`
      : (movie.isPureOriginal 
          ? `<span class="tag-original">Original</span>` 
          : `<span class="tag-original" style="background:#0284c7;color:#fff;">Ciné Récent</span>`);
    
    const providerBadge = getProviderBadgeHtml(provider);

    return `
      <div class="movie-card" onclick="openMovieModal(${movie.id})">
        <div class="poster-wrap">
          <img src="${poster}" alt="${movie.title}" loading="lazy" onerror="this.src=createFallbackPoster('${movie.title.replace(/'/g, "\\'")}', '${movie.isPureOriginal ? 'Streaming Original' : 'Nouveauté VOD'}')">
          <div class="poster-overlay">
            ${originalBadge}
            ${providerBadge}
          </div>
          <div class="rating-badge">
            ★ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
          </div>
        </div>
        <div class="card-info">
          <div class="movie-title" title="${movie.title}">${movie.title}</div>
          <div class="movie-meta-sub">
            <span class="movie-date">${movie.france_digital_date || ''}</span>
            <span>${movie.imdb_id ? movie.imdb_id.split(':')[0] : ''}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- Render View 2: Inspector / Debug Table ---
function renderInspectorTable() {
  let itemsToDisplay = state.processedItems;
  if (state.inspectorFilter === 'accepted') {
    itemsToDisplay = state.processedItems.filter(i => i.accepted);
  } else if (state.inspectorFilter === 'rejected') {
    itemsToDisplay = state.processedItems.filter(i => !i.accepted);
  }

  elements.inspectorTableBody.innerHTML = itemsToDisplay.map(movie => {
    const poster = getPosterUrl(movie.poster_path, movie.title);
    const statusBadge = movie.accepted 
      ? `<span class="badge-status accepted">✓ VALIDÉ</span>` 
      : `<span class="badge-status rejected">✕ REJETÉ</span>`;

    const theatDateStr = movie.theatrical_release_exists 
      ? `<strong>${movie.earliest_theatrical_date}</strong> (Cinéma)` 
      : `<span style="color:#10b981;font-weight:600;">Aucune (Direct VOD)</span>`;

    const gapFormatted = movie.theatrical_release_exists 
      ? `<span style="color:${movie.gapDays > 180 ? '#ef4444' : '#38bdf8'};font-weight:600;">${movie.gapDays} jours (${(movie.gapDays / 365).toFixed(1)} ans)</span>`
      : `<span style="color:#10b981;font-weight:600;">0 jour</span>`;

    const providerName = movie.providers.map(p => p.name).join(', ') || 'N/A';

    return `
      <tr>
        <td>
          <div class="cell-movie">
            <img src="${poster}" class="table-thumb" alt="${movie.title}" onerror="this.src=createFallbackPoster('${movie.title.replace(/'/g, "\\'")}')">
            <div>
              <strong>${movie.title}</strong>
              <div style="font-size:0.75rem;color:#94a3b8;">${movie.imdb_id} • Note: ${movie.vote_average ? movie.vote_average.toFixed(1) : 0}/10 (${movie.vote_count} votes)</div>
            </div>
          </div>
        </td>
        <td>${theatDateStr}</td>
        <td><strong>${movie.france_digital_date}</strong></td>
        <td>${gapFormatted}</td>
        <td>${providerName}</td>
        <td>
          ${statusBadge}
          <div style="font-size:0.75rem;margin-top:4px;color:${movie.accepted ? '#94a3b8' : '#fca5a5'};">
            ${movie.verdictReason}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --- Render Stremio JSON output ---
function renderStremioJson() {
  const acceptedItems = state.processedItems
    .filter(item => item.accepted)
    .sort((a, b) => {
      const dateA = a.france_digital_date || a.primary_release_date || '1970-01-01';
      const dateB = b.france_digital_date || b.primary_release_date || '1970-01-01';
      return dateB.localeCompare(dateA);
    });
  const catalogId = state.catalogMode === 'digital_vod' ? 'digital_vod_worldwide' : 'streaming_fr_originals';
  
  const stremioCatalogResponse = {
    catalog: catalogId,
    metas: acceptedItems.map(m => ({
      id: m.imdb_id || `tmdb:${m.id}`,
      type: "movie",
      name: m.title,
      poster: getPosterUrl(m.poster_path, m.title),
      description: m.overview || m.tagline,
      releaseInfo: m.france_digital_date ? m.france_digital_date.substring(0, 4) : "2026",
      imdbRating: m.vote_average ? m.vote_average.toFixed(1) : undefined
    }))
  };

  elements.jsonOutput.textContent = JSON.stringify(stremioCatalogResponse, null, 2);
}

function updateStats() {
  const total = state.processedItems.length;
  const accepted = state.processedItems.filter(i => i.accepted).length;
  const rejected = total - accepted;

  elements.countTotal.textContent = total;
  elements.countAccepted.textContent = accepted;
  elements.countRejected.textContent = rejected;

  if (state.catalogMode === 'digital_vod') {
    elements.statsPill.textContent = `${accepted} film(s) retenus sur ${total} analysés (${rejected} filtrés selon critères)`;
  } else {
    elements.statsPill.textContent = `${accepted} film(s) retenus sur ${total} analysés (${rejected} anciens ou hors critères éliminés)`;
  }
}

// --- Tabs & Filters Navigation ---
function switchTab(tab) {
  if (tab === 'stremio') {
    elements.tabStremioView.classList.add('active');
    elements.tabDebugView.classList.remove('active');
    elements.stremioViewSection.classList.remove('hidden');
    elements.inspectorSection.classList.add('hidden');
  } else {
    elements.tabStremioView.classList.remove('active');
    elements.tabDebugView.classList.add('active');
    elements.stremioViewSection.classList.add('hidden');
    elements.inspectorSection.classList.remove('hidden');
  }
}

function setInspectorFilter(filter) {
  state.inspectorFilter = filter;
  elements.filterShowAll.classList.toggle('active', filter === 'all');
  elements.filterShowAccepted.classList.toggle('active', filter === 'accepted');
  elements.filterShowRejected.classList.toggle('active', filter === 'rejected');
  renderInspectorTable();
}

// --- Modal Movie Details ---
if (typeof window !== 'undefined') {
  window.openMovieModal = function(movieId) {
    const movie = state.processedItems.find(m => m.id === movieId);
    if (!movie) return;

    const poster = getPosterUrl(movie.poster_path, movie.title);
    const providerList = movie.providers.map(p => `
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:6px;margin-right:6px;font-size:0.8rem;">
        ${p.logo ? `<img src="${p.logo}" style="width:18px;height:18px;border-radius:4px;">` : ''}
        <span>${p.name}</span>
      </div>
    `).join('');

    const statusBadge = state.catalogMode === 'digital_vod'
      ? '<span class="pill-tag green">🎬 Nouveauté VOD & Digital (Achat / Location)</span>'
      : (movie.isPureOriginal 
          ? '<span class="pill-tag green">⚡ Exclusivité / Direct Streaming</span>' 
          : '<span class="pill-tag" style="background:#0284c7;color:#fff;">🍿 Sortie Ciné Récente</span>');

    elements.modalBody.innerHTML = `
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <img src="${poster}" style="width:140px;border-radius:10px;object-fit:cover;aspect-ratio:2/3;" alt="${movie.title}">
        <div style="flex:1;min-width:240px;">
          <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:6px;">${movie.title}</h2>
          <div style="font-size:0.85rem;color:#94a3b8;margin-bottom:12px;">
            Titre original : <em>${movie.original_title}</em> • IMDb : <strong>${movie.imdb_id}</strong>
          </div>
          <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
            ${statusBadge}
            <span class="pill-tag">★ ${movie.vote_average} (${movie.vote_count} votes)</span>
          </div>
          <div style="margin-bottom:14px;">
            <div style="font-size:0.8rem;color:#64748b;margin-bottom:4px;">${state.catalogMode === 'digital_vod' ? 'Disponibilité / Magasin VOD :' : 'Plateforme(s) en France :'}</div>
            ${providerList}
          </div>
          ${state.catalogMode === 'digital_vod' ? `
          <div style="margin-bottom:14px;">
            <div style="font-size:0.8rem;color:#64748b;margin-bottom:4px;">Disponibilité FR (Audio / Sous-titres) :</div>
            <span class="pill-tag ${movie.hasFrenchAvailability ? 'green' : 'amber'}">${movie.hasFrenchAvailability ? '✓ Piste audio ou sous-titres FR détectés' : '⚠ Non confirmée'}</span>
          </div>
          ` : ''}
        </div>
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
        <h4 style="font-size:0.9rem;margin-bottom:6px;color:#cbd5e1;">Synopsis :</h4>
        <p style="font-size:0.88rem;color:#94a3b8;line-height:1.6;">${movie.overview || 'Sortie VOD & Digital mondiale (Achat / Location - Piste ou sous-titres FR disponibles).'}</p>
      </div>
      <div style="margin-top:20px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;">
        <div>
          <div style="color:#64748b;">Sortie Mondiale / Ciné : <strong>${movie.earliest_theatrical_date || 'Direct Digital'}</strong></div>
          <div style="color:#38bdf8;">Arrivée VOD / Digital : <strong>${movie.france_digital_date}</strong></div>
        </div>
        <div style="text-align:right;">
          <div style="color:#64748b;">Écart constaté :</div>
          <strong style="color:${movie.gapDays <= 2 ? '#10b981' : '#f59e0b'};font-size:1rem;">${movie.gapDays} jour${movie.gapDays > 1 ? 's' : ''} ${movie.gapDays > 0 && movie.gapDays <= 2 ? '(Sortie simultanée)' : ''}</strong>
        </div>
      </div>
    `;

    elements.movieModal.classList.add('open');
  };
}

function closeModal() {
  if (elements.movieModal) elements.movieModal.classList.remove('open');
}

function copyStremioJson() {
  if (!elements.jsonOutput || !elements.copyJsonBtn) return;
  const code = elements.jsonOutput.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = elements.copyJsonBtn.innerHTML;
    elements.copyJsonBtn.innerHTML = `✓ Copié !`;
    setTimeout(() => {
      elements.copyJsonBtn.innerHTML = originalText;
    }, 2000);
  });
}

// Start
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}
