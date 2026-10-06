/**
 * Script de rafraîchissement automatique des listes MDBList
 * Récupère automatiquement toutes les listes de l'utilisateur,
 * puis déclenche leur mise à jour.
 */

const cookie = process.env.MDBLIST_COOKIE;
const apiKey = process.env.MDBLIST_API_KEY;
const manualListIds = process.env.MDBLIST_IDS;

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
 * Récupération via l'API officielle MDBList (si la clé API est fournie)
 */
async function fetchListsViaApiKey(key) {
  try {
    console.log('🔍 Recherche automatique de vos listes via l\'API MDBList...');
    const res = await fetch(`https://api.mdblist.com/lists/user/?apikey=${key}`);
    if (!res.ok) {
      console.warn(`⚠️ L'API MDBList a répondu avec le statut ${res.status}.`);
      return null;
    }
    const data = await res.json();
    const lists = [];

    // L'API peut retourner un tableau ou un objet avec des catégories
    const extract = (item) => {
      if (item && item.id) {
        lists.push({ id: String(item.id), name: item.name || `Liste #${item.id}` });
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

    if (lists.length > 0) {
      console.log(`✅ ${lists.length} liste(s) trouvée(s) via l'API officielle.`);
      return lists;
    }
  } catch (err) {
    console.warn('⚠️ Impossible de joindre l\'API MDBList:', err.message);
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

    if (!res.ok) {
      console.warn(`⚠️ La page mylists a répondu avec le statut ${res.status}.`);
      return null;
    }

    const html = await res.text();
    const foundIds = new Set();

    // Regex pour détecter les listid dans les boutons de mise à jour, data attributes et liens
    const regexPatterns = [
      /list_notification\/\?listid=(\d+)/g,
      /data-listid=["']?(\d+)/g,
      /data-id=["']?(\d+)/g,
      /action=update[^"']*listid=(\d+)/g,
      /listid=(\d+)/g
    ];

    for (const regex of regexPatterns) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        if (match[1]) foundIds.add(match[1]);
      }
    }

    const ids = Array.from(foundIds);
    if (ids.length > 0) {
      console.log(`✅ ${ids.length} liste(s) détectée(s) automatiquement depuis votre profil : [${ids.join(', ')}].`);
      return ids.map(id => ({ id, name: `Liste #${id}` }));
    }
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

  console.log(`\n🔄 Déclenchement de la mise à jour pour : ${item.name} (#${item.id})...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders
    });

    const status = response.status;
    const text = await response.text();

    if (status === 200) {
      console.log(`✅ [HTTP 200] ${item.name} (#${item.id}) actualisée avec succès.`);
      console.log(`   Réponse : ${text.substring(0, 200)}`);
    } else if (status === 401 || status === 403) {
      console.error(`⚠️ [HTTP ${status}] Authentification refusée. Votre cookie MDBList a expiré.`);
      console.error(`   Réponse : ${text.substring(0, 200)}`);
    } else if (status === 429) {
      console.warn(`⏳ [HTTP 429] Rate limit atteint. Trop de requêtes envoyées.`);
    } else {
      console.log(`ℹ️ [HTTP ${status}] Statut inattendu pour ${item.name} (#${item.id}).`);
      console.log(`   Réponse : ${text.substring(0, 200)}`);
    }
  } catch (err) {
    console.error(`❌ Erreur réseau pour ${item.name} (#${item.id}):`, err.message);
  }
}

async function run() {
  console.log('🚀 Démarrage du script de rafraîchissement MDBList...');

  let listsToUpdate = null;

  // 1. Si une clé API est configurée, c'est la méthode la plus propre et officielle
  if (apiKey) {
    listsToUpdate = await fetchListsViaApiKey(apiKey);
  }

  // 2. Sinon, on essaie de parser automatiquement la page /mylists/ avec le cookie
  if (!listsToUpdate || listsToUpdate.length === 0) {
    listsToUpdate = await fetchListsViaWebPage();
  }

  // 3. Si l'auto-détection n'a rien trouvé, on se rabat sur les IDs configurés manuellement
  if (!listsToUpdate || listsToUpdate.length === 0) {
    if (manualListIds) {
      console.log('ℹ️ Détection auto infructueuse, utilisation des IDs manuels définis dans MDBLIST_IDS.');
      listsToUpdate = manualListIds.split(',').map(id => ({ id: id.trim(), name: `Liste #${id.trim()}` })).filter(item => item.id.length > 0);
    } else {
      console.log('ℹ️ Aucune liste détectée, utilisation de la liste par défaut (#168436).');
      listsToUpdate = [{ id: '168436', name: 'Liste par défaut (#168436)' }];
    }
  }

  console.log(`\n📋 ${listsToUpdate.length} liste(s) à actualiser au total.`);

  for (let i = 0; i < listsToUpdate.length; i++) {
    await updateList(listsToUpdate[i]);
    if (i < listsToUpdate.length - 1) {
      console.log('⏳ Pause de 3 secondes avant la suivante...');
      await sleep(3000);
    }
  }

  console.log('\n✨ Toutes les listes ont été traitées !');
}

run();
