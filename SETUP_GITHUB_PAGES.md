# 🚀 Setup avec GitHub Pages + Vercel

Frontend sur GitHub Pages, Backend sur Vercel - URL accessible via `https://formationathiry.github.io/victory-tracker/`

---

## 📋 Architecture

```
┌─────────────────────────────────────────────┐
│  GitHub Pages (Frontend statique)           │
│  https://formationathiry.github.io/victory-tracker/
└──────────────┬──────────────────────────────┘
               │
               │ API calls
               ▼
┌─────────────────────────────────────────────┐
│  Vercel (Backend serverless + Neon DB)      │
│  https://victory-tracker-api.vercel.app     │
└─────────────────────────────────────────────┘
```

---

## 🎯 Étapes de setup

### 1️⃣ Préparer le Frontend pour GitHub Pages

**✅ Déjà fait !** Les fichiers incluent :
- `.github/workflows/deploy.yml` - Workflow GitHub Actions
- `vite.config.js` - Configuré avec `base: '/victory-tracker/'`

### 2️⃣ Configurer GitHub Pages dans les settings

1. Va sur ton repo GitHub : `https://github.com/formationathiry/victory-tracker`
2. **Settings** → **Pages**
3. **Source** : Sélectionne `Deploy from a branch`
4. **Branch** : Sélectionne `gh-pages` (créée automatiquement par le workflow)
5. Clique **Save**

---

### 3️⃣ Déployer le Backend sur Vercel

**3.1 Créer une app Vercel pour le backend uniquement**

```bash
npm install -g vercel
vercel
```

Réponds aux questions :
- **Project name** : `victory-tracker-api`
- **Select framework** : `Other`
- **Root directory** : `./` (ou vide)

**3.2 Ajouter les env vars à Vercel**

Settings → Environment Variables :
```
DATABASE_URL = postgresql://...@neon.tech/victory_tracker?sslmode=require
GITHUB_CLIENT_ID = (production GitHub OAuth)
GITHUB_CLIENT_SECRET = (production GitHub OAuth)
JWT_SECRET = (clé sécurisée générée)
```

**3.3 Déployer**

```bash
vercel --prod
```

URL du backend : `https://victory-tracker-api.vercel.app`

---

### 4️⃣ Configurer les env vars du Frontend pour GitHub Pages

Crée un fichier `.env.production` :

```env
VITE_API_URL=https://victory-tracker-api.vercel.app
VITE_GITHUB_CLIENT_ID=your_production_client_id
```

---

### 5️⃣ Push sur GitHub et déploiement automatique

```bash
git add .
git commit -m "Setup GitHub Pages + Vercel"
git push origin main
```

**Que se passe-t-il :**
1. GitHub Actions détecte le push
2. Build le frontend (`npm run build`)
3. Deploy sur GitHub Pages automatiquement ✅
4. Frontend accessible à `https://formationathiry.github.io/victory-tracker/`

---

## ⚙️ Configuration GitHub OAuth pour production

### Créer une 3ème GitHub OAuth App (pour production)

1. Va sur https://github.com/settings/developers
2. **New OAuth App**
3. Remplis :
   - **Application name** : `Victory Tracker (Production)`
   - **Homepage URL** : `https://formationathiry.github.io/victory-tracker/`
   - **Callback URL** : `https://victory-tracker-api.vercel.app/auth/callback`
4. Copie **Client ID** et **Client Secret**
5. Ajoute à Vercel env vars + `.env.production`

---

## 📊 Déploiement automatique

À chaque fois que tu fais un **push sur main** :
1. GitHub Actions lance automatiquement
2. Build le frontend Vite
3. Deploy sur GitHub Pages
4. **Accessible à** : `https://formationathiry.github.io/victory-tracker/`

**Aucune action manuelle nécessaire !** ✅

---

## 🧪 Tester localement

```bash
# Développement (frontend + backend local)
npm run dev      # Frontend sur localhost:5173
npm run api      # Backend sur localhost:3000
```

---

## ✅ Checklist

- [ ] Repo créé sur GitHub
- [ ] Workflow GitHub Actions en place (`.github/workflows/deploy.yml`)
- [ ] `vite.config.js` configuré avec `base: '/victory-tracker/'`
- [ ] GitHub Pages settings → `gh-pages` branch
- [ ] Backend déployé sur Vercel
- [ ] Env vars ajoutées à Vercel
- [ ] GitHub OAuth App (production) créée
- [ ] `.env.production` rempli
- [ ] Push sur main → Frontend déploie automatiquement ✅
- [ ] Accès via `https://formationathiry.github.io/victory-tracker/`

---

## 🎉 Résultat final

- **Frontend** : `https://formationathiry.github.io/victory-tracker/` (GitHub Pages)
- **Backend** : `https://victory-tracker-api.vercel.app` (Vercel)
- **Base de données** : Neon PostgreSQL
- **Déploiement** : Automatique à chaque push GitHub

**Les utilisateurs accèdent simplement via l'URL GitHub Pages !** 🚀

---

## 📞 Dépannage

### "GitHub Pages not building"

→ Vérifier GitHub Actions logs
1. Repo → **Actions**
2. Voir les logs de la dernière build
3. Chercher les erreurs (généralement `npm install` ou `npm run build`)

### "404 on GitHub Pages"

→ Vérifier le chemin dans `vite.config.js`
```js
base: '/victory-tracker/'  // Doit correspondre au nom du repo
```

### "API not accessible from GitHub Pages"

→ Vérifier CORS
Le backend Vercel doit accepter les requêtes depuis GitHub Pages :
```
Origin: https://formationathiry.github.io
```

(Déjà configuré dans `api/neon-auth.js`)

---

**Vous êtes prêt !** 🚀
