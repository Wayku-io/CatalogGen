# Stremio Streaming France • Dynamic TMDB Addon & Studio

Addon Stremio personnalisé et studio de test visuel conçu pour filtrer strictement les **véritables nouveautés et exclusivités streaming en France** (Netflix Originals, Prime Video Exclusives, Apple Original Films, Disney+, Canal+ Direct VOD...).

## 🎯 Problème résolu
Les addons publics (TMDB Discover Plus, CyberFlix, etc.) polluent les catalogues en qualifiant de "Nouveautés Streaming" des vieux films des années 1990/2000 dès qu'une plateforme les réintègre à son catalogue.

Cet addon applique un double filtre chirurgical :
1. **Source TMDB** : Cible uniquement les sorties numériques/digitales récentes en France (`region=FR`, `watch_region=FR`, `with_release_type=4`, `with_watch_monetization_types=flatrate`).
2. **Filtre Algorithmique Strict** : Vérifie l'historique complet des sorties mondiales du film. Si le film a eu une sortie cinéma antérieure à sa sortie streaming, il est **immédiatement rejeté**. Seules les **exclusivités pures (Direct-to-Streaming / 0 jour d'écart)** sont conservées.

---

## 🚀 1. Utiliser le Studio Visuel en Local

Le studio interactif permet de visualiser le rendu Stremio, d'inspecter les films acceptés/rejetés et de tester avec ta propre clé API TMDB.

1. Lancer le serveur local :
   ```bash
   node server.js
   ```
2. Ouvrir dans le navigateur :
   [http://localhost:3456/](http://localhost:3456/)
3. Cliquer sur **« Paramètres & Clé API »** pour renseigner ta clé TMDB et basculer sur les données en direct.

---

## ☁️ 2. Déploiement Serverless sur Vercel (100% Gratuit Hobby)

L'addon est prêt à être déployé sur ton compte Vercel :

1. Crée un dépôt GitHub pour ce dossier (`CatalogGen`).
2. Pousse ton code :
   ```bash
   git init
   git add .
   git commit -m "feat: addon stremio nouveautés streaming france"
   git remote add origin https://github.com/Wayku-io/stremio-streaming-france.git
   git push -u origin main
   ```
3. Sur [vercel.com](https://vercel.com) :
   * Importe ton dépôt GitHub.
   * Dans **Settings > Environment Variables**, ajoute :
     * `TMDB_API_KEY` : ta clé d'API TMDB.
   * Clique sur **Deploy**.

---

## 📺 3. Installation dans Stremio

Une fois déployé sur Vercel :
1. Copie l'URL de ton manifest :
   ```
   https://ton-addon.vercel.app/manifest.json
   ```
2. Ouvre Stremio (desktop ou web), colle cette URL dans la barre de recherche d'addons et clique sur **Installer**.
3. Une nouvelle ligne **« Nouveautés Streaming France »** apparaîtra instantanément sur ton écran d'accueil Stremio, triée et filtrée sans aucun vieux film !
