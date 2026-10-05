# ⚡ Setup Victory Tracker avec GitHub Login (10 min)

## 🎯 Quoi de neuf ?

✅ **Authentification GitHub** - Login sécurisé via GitHub  
✅ **Données partagées** - Tous les utilisateurs voient les mêmes joueurs/victoires  
✅ **24/7 disponible** - Déploiement sur Vercel (serveur externe)  
✅ **Accessible partout** - Fonctionne même quand ta machine est éteinte  

---

## 📋 Fichiers importants

| Fichier | Rôle |
|---------|------|
| `api/neon-auth.js` | Backend avec GitHub OAuth + JWT |
| `src/index-auth.html` | HTML avec page de login |
| `src/main-auth.js` | Frontend avec logique d'auth |
| `src/style-auth.css` | Styles (login + app) |
| `GITHUB_AUTH_SETUP.md` | Guide complet GitHub OAuth |
| `.env.example` | Variables d'environnement |

---

## 🚀 Quick Start (10 min)

### 1️⃣ Télécharge l'archive

Archive : `victory-tracker-auth.zip`

```bash
unzip victory-tracker-auth.zip
cd victory-tracker-full
```

### 2️⃣ Créer une GitHub OAuth App

1. Aller sur https://github.com/settings/developers
2. **New OAuth App**
3. Remplir le formulaire :
   - **Application name** : `Victory Tracker`
   - **Homepage URL** : `http://localhost:3000`
   - **Callback URL** : `http://localhost:3000/auth/callback`
4. Copier **Client ID** et **Client Secret**

### 3️⃣ Configurer `.env`

```bash
cp .env.example .env
```

Édite `.env` et remplis :
```env
DATABASE_URL=postgresql://...  # De Neon
VITE_GITHUB_CLIENT_ID=...      # De GitHub OAuth
GITHUB_CLIENT_ID=...            # De GitHub OAuth
GITHUB_CLIENT_SECRET=...        # De GitHub OAuth
```

### 4️⃣ Installer & Lancer

```bash
npm install

# Terminal 1 - Backend
npm run api

# Terminal 2 - Frontend
npm run dev
```

✅ Ouvre http://localhost:5173

Clique **"Se connecter avec GitHub"** → t'es connecté! 🎉

---

## 🌐 Déployer sur Vercel

### 1️⃣ Push sur GitHub

```bash
git add .
git commit -m "Add GitHub OAuth authentication"
git push origin main
```

### 2️⃣ Créer une GitHub OAuth App pour Vercel

Répète l'étape 2 avec :
- **Callback URL** : `https://your-app.vercel.app/auth/callback`

### 3️⃣ Vercel → Environment Variables

1. Aller sur [vercel.com](https://vercel.com)
2. Importer le repo GitHub
3. **Settings** → **Environment Variables**
4. Ajouter toutes les variables du `.env`

```
DATABASE_URL = ...
VITE_API_URL = https://your-app.vercel.app
VITE_GITHUB_CLIENT_ID = ... (production)
GITHUB_CLIENT_ID = ... (production)
GITHUB_CLIENT_SECRET = ... (production)
JWT_SECRET = (générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 4️⃣ Déployer

```bash
git push origin main
# Vercel détecte le push et déploie automatiquement
```

✅ Accède à `https://your-app.vercel.app`

---

## 📚 Documentation complète

- **GitHub OAuth Setup** → Voir `GITHUB_AUTH_SETUP.md`
- **Neon Setup** → Voir `NEON_GUIDE.md`
- **Architecture** → Voir `README.md`

---

## 🔄 Flux d'authentification

```
1. Utilisateur clique "Login with GitHub"
   ↓
2. Redirigé vers GitHub pour autoriser
   ↓
3. GitHub renvoie un code
   ↓
4. Backend échange code → JWT token
   ↓
5. Frontend stocke le token et accède l'app
   ↓
6. Token envoyer à chaque requête API
   ↓
7. Backend vérifie le token et permet l'accès
```

---

## ✅ Checklist

- [ ] Archive décompressée
- [ ] GitHub OAuth App créée (development)
- [ ] `.env` rempli
- [ ] `npm install` effectué
- [ ] Backend lancé (`npm run api`)
- [ ] Frontend lancé (`npm run dev`)
- [ ] Login GitHub testé localement ✅
- [ ] Repo pushé sur GitHub
- [ ] Vercel déploie le repo
- [ ] GitHub OAuth App créée (production)
- [ ] Env vars ajoutées à Vercel
- [ ] Production déploiement testé ✅

---

## 🎉 Vous êtes prêt !

L'application est maintenant :
- ✅ Avec authentification GitHub
- ✅ Données partagées entre utilisateurs
- ✅ Déployée sur Vercel 24/7
- ✅ Accessible via URL publique
- ✅ Fonctionne même quand ta machine est éteinte

**Invite tes amis !** 🚀

Les utilisateurs peuvent se connecter via :
```
https://your-app.vercel.app
```

---

**Questions ?** Voir les guides dans le dossier du projet.
