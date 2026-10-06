/**
 * Script de rafraîchissement automatique des listes MDBList
 * Utilise l'endpoint AJAX interne de MDBList pour forcer la mise à jour
 */

const cookie = process.env.MDBLIST_COOKIE;
const listIdsEnv = process.env.MDBLIST_IDS || '168436';

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

const listIds = listIdsEnv
  .split(',')
  .map(id => id.trim())
  .filter(id => id.length > 0);

if (listIds.length === 0) {
  console.error('❌ ERREUR : Aucun ID de liste spécifié dans MDBLIST_IDS.');
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateList(listId) {
  const url = `https://mdblist.com/ajax/list_notification/?listid=${listId}&action=update&datatype=list`;

  console.log(`\n🔄 Déclenchement de la mise à jour pour la liste #${listId}...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': formattedCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://mdblist.com/lists/',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      }
    });

    const status = response.status;
    const text = await response.text();

    if (status === 200) {
      console.log(`✅ [HTTP 200] Liste #${listId} actualisée avec succès.`);
      console.log(`   Réponse : ${text.substring(0, 300)}`);
    } else if (status === 401 || status === 403) {
      console.error(`⚠️ [HTTP ${status}] Authentification refusée. Votre cookie MDBList a probablement expiré.`);
      console.error(`   Réponse : ${text.substring(0, 300)}`);
    } else if (status === 429) {
      console.warn(`⏳ [HTTP 429] Trop de requêtes (Rate limit). Réessayez plus tard.`);
    } else {
      console.log(`ℹ️ [HTTP ${status}] Statut inattendu pour la liste #${listId}.`);
      console.log(`   Réponse : ${text.substring(0, 300)}`);
    }
  } catch (err) {
    console.error(`❌ Erreur réseau lors de la mise à jour de la liste #${listId}:`, err.message);
  }
}

async function run() {
  console.log(`🚀 Démarrage de la mise à jour de ${listIds.length} liste(s) MDBList...`);

  for (let i = 0; i < listIds.length; i++) {
    await updateList(listIds[i]);
    // Petite pause de 3 secondes entre chaque liste pour éviter tout rate-limiting
    if (i < listIds.length - 1) {
      console.log('⏳ Attente de 3 secondes avant la liste suivante...');
      await sleep(3000);
    }
  }

  console.log('\n✨ Terminé !');
}

run();
