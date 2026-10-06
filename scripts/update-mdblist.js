/**
 * Script de rafraîchissement intelligent des listes MDBList
 * Détecte automatiquement les listes et gère les dépendances en 2 voyages :
 * 1. Voyage 1 : Actualisation des listes sources (tag "Used by" ou listes mères)
 * 2. Pause (3 minutes) pour laisser MDBList recalculer les sources
 * 3. Voyage 2 : Actualisation des autres listes (dont les listes dépendantes)
 */

const cookie = process.env.MDBLIST_COOKIE;
const apiKey = process.env.MDBLIST_API_KEY;
const manualListIds = process.env.MDBLIST_IDS;
const waitSecondsSources = parseInt(process.env.MDBLIST_WAIT_SECONDS || '180', 10); // 3 minutes par défaut

if (!cookie) {
  console.error('❌ ERREUR : La variable MDBLIST_COOKIE est absente.');
  console.error('Veuillez ajouter votre cookie de session dans les Secrets GitHub.');
  process.exit(1);
}

// Formatage du cookie de session
let formattedCookie = cookie.trim();
if (!formattedCookie.includes('=')) {
  formattedCookie = `sessionid=${formattedCookie}`;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const defaultHeaders = {
  'Cookie': formattedCookie,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://mdblist.com/lists/',
  'X-Requested-With': 'XMLHttpRequest',
  'Accept': 'application/json, text/javascript, */*; q=0.01'
};

/**
 * Pause avec compte à rebours visuel
 */
async function countdownSleep(seconds) {
  console.log(`\n⏳ Début de la pause de ${seconds} secondes (${Math.round(seconds / 60)} minutes)...`);
  const interval = 30;
  let remaining = seconds;

  while (remaining > 0) {
    const waitTime = Math.min(interval, remaining);
    await sleep(waitTime * 1000);
    remaining -= waitTime;
    if (remaining > 0) {
      console.log(`   ⏳ Encore ${remaining}s d'attente (MDBList compile les listes en arrière-plan)...`);
    }
  }
  console.log('✅ Temps d\'attente écoulé, reprise des mises à jour !\n');
}

/**
 * Récupération via l'API officielle MDBList (Recommandé, jamais bloqué par Cloudflare)
 */
async function fetchListsViaApiKey(key) {
  try {
    console.log('🔍 Recherche des listes via l\'API officielle https://api.mdblist.com/lists/user/ ...');
    const res = await fetch(`https://api.mdblist.com/lists/user/?apikey=${key}`);
    if (!res.ok) {
      console.warn(`⚠️ L'API MDBList a répondu avec le statut ${res.status}.`);
      return null;
    }
    const data = await res.json();
    const rawLists = [];

    const extract = (item) => {
      if (item && item.id) {
        rawLists.push({
          id: String(item.id),
          name: item.name || `Liste #${item.id}`,
          isSource: false
        });
      }
    };

    if (Array.isArray(data)) {
      data.forEach(extract);
    } else if (typeof data === 'object' && data !== null) {
      Object.values(data).forEach(val => {
        if (Array.isArray(val)) val.forEach(extract);
        else extract(val);
      });
    }

    if (rawLists.length === 0) return null;

    console.log(`✅ ${rawLists.length} liste(s) récupérée(s) via l'API officielle.`);

    // Analyse des dépendances (identifier les listes sources vs dépendantes)
    // 1. Soit en interrogeant les détails de chaque liste pour voir les exclusions
    // 2. Soit par détection des listes d'exclusion / mots-clés
    const sourceIds = new Set();
    for (const list of rawLists) {
      try {
        const detailRes = await fetch(`https://api.mdblist.com/lists/${list.id}/?apikey=${key}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const detailStr = JSON.stringify(detail);
          // Chercher si cette liste exclut une autre liste appartenant à l'utilisateur
          for (const other of rawLists) {
            if (other.id !== list.id && detailStr.includes(other.id)) {
              sourceIds.add(other.id);
              console.log(`   🔗 La liste "${other.name}" (#${other.id}) est utilisée par "${list.name}" (#${list.id}) !`);
            }
          }
        }
      } catch (e) {
        // Ignorer silencieusement si le détail n'est pas accessible
      }
    }

    // Appliquer le tag source
    for (const list of rawLists) {
      if (sourceIds.has(list.id)) {
        list.isSource = true;
      }
    }

    // Si aucune dépendance trouvée par l'API mais qu'une liste s'appelle "Nouvelles sorties"
    if (sourceIds.size === 0) {
      for (const list of rawLists) {
        if (/nouvelles?\s+sorties/i.test(list.name) || /new\s+shows/i.test(list.name)) {
          list.isSource = true;
          console.log(`   💡 Liste source identifiée par son nom : "${list.name}" (#${list.id})`);
        }
      }
    }

    return rawLists;
  } catch (err) {
    console.warn('⚠️ Erreur avec l\'API MDBList:', err.message);
  }
  return null;
}

/**
 * Récupération automatique via la page web /mylists/ avec le cookie de session
 */
async function fetchListsViaWebPage() {
  try {
    console.log('🔍 Analyse automatique de votre page https://mdblist.com/mylists/ ...');
    const res = await fetch('https://mdblist.com/mylists/', {
      method: 'GET',
      headers: {
        'Cookie': formattedCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const status = res.status;
    const html = await res.text();

    if (!res.ok) {
      console.warn(`⚠️ La page mylists a renvoyé HTTP ${status} (probablement bloqué par Cloudflare).`);
      return null;
    }

    if (html.includes('Sign in') || html.includes('login') && !html.includes('logout')) {
      console.warn('⚠️ La page mylists a redirigé vers la page de connexion (Cookie de session invalide ou expiré).');
      return null;
    }

    // Détecter tous les boutons d'actualisation et leurs positions
    const updateRegex = /list_notification\/\?listid=(\d+)/g;
    const matches = [];
    let match;

    while ((match = updateRegex.exec(html)) !== null) {
      matches.push({
        id: match[1],
        index: match.index
      });
    }

    if (matches.length === 0) {
      console.warn('⚠️ Aucun bouton list_notification trouvé dans le HTML.');
      return null;
    }

    // Dédoublonnage
    const uniqueMatches = [];
    const seenIds = new Set();
    for (const m of matches) {
      if (!seenIds.has(m.id)) {
        seenIds.add(m.id);
        uniqueMatches.push(m);
      }
    }

    const detectedLists = [];
    for (let i = 0; i < uniqueMatches.length; i++) {
      const current = uniqueMatches[i];
      const start = Math.max(0, current.index - 2500);
      const end = Math.min(html.length, current.index + 2500);
      const chunk = html.substring(start, end);

      const isSource = /used by the following dynamic lists|used by/i.test(chunk);

      let name = `Liste #${current.id}`;
      const nameMatch = chunk.match(/<a[^>]*href="\/lists\/[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                        chunk.match(/class="[^"]*header[^"]*"[^>]*>([^<]+)</i);
      if (nameMatch && nameMatch[1].trim()) {
        name = nameMatch[1].trim();
      }

      detectedLists.push({
        id: current.id,
        name,
        isSource
      });
    }

    return detectedLists;
  } catch (err) {
    console.warn('⚠️ Erreur lors de l\'analyse de la page web:', err.message);
  }
  return null;
}

/**
 * Déclenchement de la mise à jour d'une liste
 */
async function updateList(item) {
  const url = `https://mdblist.com/ajax/list_notification/?listid=${item.id}&action=update&datatype=list`;

  console.log(`🔄 [Mise à jour] ${item.name} (#${item.id})${item.isSource ? ' ⭐ [SOURCE]' : ''}...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders
    });

    const status = response.status;
    const text = await response.text();

    if (status === 200) {
      console.log(`   ✅ [HTTP 200] OK - Réponse : ${text.substring(0, 150)}`);
    } else if (status === 401 || status === 403) {
      console.error(`   ⚠️ [HTTP ${status}] Authentification refusée. Cookie expiré.`);
    } else if (status === 429) {
      console.warn(`   ⏳ [HTTP 429] Rate limit atteint. Trop de requêtes.`);
    } else {
      console.log(`   ℹ️ [HTTP ${status}] Statut : ${text.substring(0, 150)}`);
    }
  } catch (err) {
    console.error(`   ❌ Erreur réseau pour ${item.name} (#${item.id}):`, err.message);
  }
}

async function run() {
  console.log('🚀 Démarrage du rafraîchissement automatique MDBList...\n');

  let lists = null;

  // 1. Priorité à l'API officielle si MDBLIST_API_KEY est renseignée
  if (apiKey) {
    lists = await fetchListsViaApiKey(apiKey);
  }

  // 2. Sinon analyse de la page web mylists
  if (!lists || lists.length === 0) {
    lists = await fetchListsViaWebPage();
  }

  // 3. Fallback sur les IDs manuels ou liste par défaut
  if (!lists || lists.length === 0) {
    if (manualListIds) {
      console.log('ℹ️ Utilisation des IDs configurés dans MDBLIST_IDS.');
      lists = manualListIds.split(',').map(id => ({ id: id.trim(), name: `Liste #${id.trim()}`, isSource: false }));
    } else {
      console.log('⚠️ Aucune liste détectée automatiquement.');
      console.log('👉 ASTUCE : Ajoutez votre secret GitHub MDBLIST_API_KEY pour une détection infaillible de vos 5 listes !');
      lists = [{ id: '168436', name: 'Liste par défaut (#168436)', isSource: false }];
    }
  }

  // Séparation en deux groupes : Sources ("Used by") vs Autres
  const sourceLists = lists.filter(l => l.isSource);
  const otherLists = lists.filter(l => !l.isSource);

  console.log(`\n📋 Récapitulatif : ${lists.length} liste(s) au total :`);
  console.log(`   • ${sourceLists.length} liste(s) SOURCE : ${sourceLists.map(l => l.name).join(', ') || 'aucune'}`);
  console.log(`   • ${otherLists.length} autre(s) liste(s) : ${otherLists.map(l => l.name).join(', ')}\n`);

  // --- VOYAGE 1 : Les listes sources ---
  if (sourceLists.length > 0) {
    console.log(`========== 🚀 VOYAGE 1/2 : Mise à jour des ${sourceLists.length} liste(s) source(s) ==========`);
    for (let i = 0; i < sourceLists.length; i++) {
      await updateList(sourceLists[i]);
      if (i < sourceLists.length - 1) await sleep(3000);
    }

    console.log(`\n========================================================================`);
    console.log(`⏸️  Les listes sources ont été déclenchées.`);
    console.log(`    Pause de ${waitSecondsSources}s (3 min) pour que MDBList les calcule avant le voyage 2...`);
    console.log(`========================================================================`);
    await countdownSleep(waitSecondsSources);
  }

  // --- VOYAGE 2 : Les autres listes ---
  console.log(`========== 🚀 VOYAGE 2/2 : Mise à jour des ${otherLists.length} autre(s) liste(s) ==========`);
  for (let i = 0; i < otherLists.length; i++) {
    await updateList(otherLists[i]);
    if (i < otherLists.length - 1) await sleep(3000);
  }

  console.log('\n✨ Rafraîchissement terminé avec succès !');
}

run();
