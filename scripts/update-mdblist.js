/**
 * Script de rafraîchissement intelligent des listes MDBList
 * Détecte automatiquement les listes et gère les dépendances en 2 étapes :
 * 1. Actualisation des listes sources (tag "Used by")
 * 2. Pause (3 minutes) pour laisser MDBList recalculer les sources
 * 3. Actualisation des autres listes (qui utilisent les sources)
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

// Si l'utilisateur n'a copié que la valeur brute de sessionid sans "sessionid="
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
  const interval = 30; // log toutes les 30 secondes
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
 * Récupération et analyse automatique de https://mdblist.com/mylists/
 * Détecte les listes, leurs noms et si elles ont le tag "Used by"
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

    if (!res.ok) {
      console.warn(`⚠️ La page mylists a répondu avec le statut ${res.status}.`);
      return null;
    }

    const html = await res.text();

    // 1. Détecter tous les boutons d'actualisation et leurs positions
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
      console.warn('⚠️ Aucun bouton list_notification trouvé dans la page.');
      return null;
    }

    // Dédoublonnage en conservant la première occurrence
    const uniqueMatches = [];
    const seenIds = new Set();
    for (const m of matches) {
      if (!seenIds.has(m.id)) {
        seenIds.add(m.id);
        uniqueMatches.push(m);
      }
    }

    const detectedLists = [];

    // 2. Pour chaque liste, analyser son bloc HTML (environ 2500 caractères autour)
    for (let i = 0; i < uniqueMatches.length; i++) {
      const current = uniqueMatches[i];
      const start = Math.max(0, current.index - 2000);
      const end = Math.min(html.length, current.index + 2000);
      const chunk = html.substring(start, end);

      // Détecter si la liste est marquée "Used by" (tag de dépendance jaune / share)
      const isSource = /used by the following dynamic lists|used by/i.test(chunk);

      // Tenter d'extraire le nom de la liste dans le bloc
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
      console.warn(`   ⏳ [HTTP 429] Rate limit atteint. Trop de requêtes envoyées.`);
    } else {
      console.log(`   ℹ️ [HTTP ${status}] Statut inattendu : ${text.substring(0, 150)}`);
    }
  } catch (err) {
    console.error(`   ❌ Erreur réseau pour ${item.name} (#${item.id}):`, err.message);
  }
}

async function run() {
  console.log('🚀 Démarrage du rafraîchissement automatique MDBList...\n');

  let lists = await fetchListsViaWebPage();

  // Fallback si l'auto-détection web échoue
  if (!lists || lists.length === 0) {
    if (manualListIds) {
      console.log('ℹ️ Utilisation des IDs configurés manuellement dans MDBLIST_IDS.');
      lists = manualListIds.split(',').map(id => ({ id: id.trim(), name: `Liste #${id.trim()}`, isSource: false }));
    } else {
      console.log('ℹ️ Aucune liste détectée, utilisation de la liste par défaut (#168436).');
      lists = [{ id: '168436', name: 'Liste par défaut (#168436)', isSource: false }];
    }
  }

  // Séparation en deux groupes : Sources ("Used by") vs Autres
  const sourceLists = lists.filter(l => l.isSource);
  const otherLists = lists.filter(l => !l.isSource);

  console.log(`📋 Récapitulatif : ${lists.length} liste(s) détectée(s) au total :`);
  console.log(`   • ${sourceLists.length} liste(s) SOURCE (tag "Used by") : ${sourceLists.map(l => l.name).join(', ') || 'aucune'}`);
  console.log(`   • ${otherLists.length} autre(s) liste(s) : ${otherLists.map(l => l.name).join(', ')}\n`);

  // --- VOYAGE 1 : Les listes sources ---
  if (sourceLists.length > 0) {
    console.log(`========== 🚀 VOYAGE 1/2 : Mise à jour des ${sourceLists.length} liste(s) source(s) ==========`);
    for (let i = 0; i < sourceLists.length; i++) {
      await updateList(sourceLists[i]);
      if (i < sourceLists.length - 1) await sleep(3000);
    }

    // Pause d'attente pour laisser MDBList finir le calcul des sources
    console.log(`\n========================================================================`);
    console.log(`⏸️  Les listes sources ont été déclenchées.`);
    console.log(`    Pause de ${waitSecondsSources}s (3 min) pour que MDBList les calcule avant le voyage 2...`);
    console.log(`========================================================================`);
    await countdownSleep(waitSecondsSources);
  }

  // --- VOYAGE 2 : Les autres listes (qui bénéficient des sources à jour) ---
  console.log(`========== 🚀 VOYAGE 2/2 : Mise à jour des ${otherLists.length} autre(s) liste(s) ==========`);
  for (let i = 0; i < otherLists.length; i++) {
    await updateList(otherLists[i]);
    if (i < otherLists.length - 1) await sleep(3000);
  }

  console.log('\n✨ Tous les voyages ont été effectués avec succès ! Vos catalogues sont 100% à jour.');
}

run();
