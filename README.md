# 🔄 MDBList Auto Refresh

Automatisation du rafraîchissement des listes dynamiques et statiques [MDBList](https://mdblist.com/) via **GitHub Actions**.

Ce projet permet de forcer la mise à jour prioritaire de vos listes MDBList à intervalles réguliers (toutes les 2 heures) sans action manuelle et 100 % gratuitement.

---

## ✨ Fonctionnalités

- 🤖 **Auto-détection des listes :** Scanne automatiquement votre compte MDBList (`/mylists/` ou API officielle) pour actualiser toutes vos listes existantes sans avoir à saisir leurs identifiants.
- ⏰ **Exécution planifiée :** Déclenchement automatique toutes les 2 heures via un cron GitHub Actions.
- ⚡ **Déclenchement manuel :** Possibilité de forcer un rafraîchissement immédiat en 1 clic via le bouton *Run workflow* sur GitHub.
- 🛡️ **Tolérant et sécurisé :** Vos identifiants et cookies sont stockés de manière chiffrée dans les **GitHub Secrets**.
- 🚀 **Zéro dépendance :** Tourne avec le `fetch` natif de Node.js (temps d'exécution < 10 secondes).

---

## ⚙️ Configuration sur GitHub

Rendez-vous dans les paramètres de votre dépôt :  
**Settings** ➔ **Secrets and variables** ➔ **Actions**

### 1. Secrets (Obligatoire)
| Secret | Description |
|---|---|
| `MDBLIST_COOKIE` | Votre cookie de session MDBList (valeur de `sessionid` depuis l'inspecteur web F12). |

### 2. Secrets (Optionnel)
| Secret | Description |
|---|---|
| `MDBLIST_API_KEY` | Votre clé API MDBList (disponible sur [mdblist.com/preferences/](https://mdblist.com/preferences/)) pour récupérer automatiquement le nom exact de chaque liste. |

### 3. Variables (Optionnel)
| Variable | Description |
|---|---|
| `MDBLIST_IDS` | Liste manuelle d'IDs séparés par des virgules (ex: `168436,168437`), si vous ne souhaitez pas utiliser la détection automatique. |

---

## 🚀 Utilisation locale (Optionnel)

Pour tester ou exécuter le script directement sur votre machine :

```bash
# Copier le template d'environnement
cp .env.example .env

# Renseigner vos variables dans .env, puis lancer le script :
npm run refresh
```

---

## 📄 Licence

MIT © [Wayku](https://github.com/Wayku-io)
