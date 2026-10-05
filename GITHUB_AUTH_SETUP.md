# 🔐 Configuration GitHub OAuth

Guide pour configurer l'authentification GitHub avec Victory Tracker.

## 📋 Étape 1 : Créer une GitHub OAuth App (pour développement local)

### 1.1 Aller sur GitHub Settings

1. Aller sur https://github.com/settings/developers
2. Cliquer sur **"OAuth Apps"** (menu de gauche)
3. Cliquer **"New OAuth App"**

### 1.2 Remplir le formulaire

**Application name :**
```
Victory Tracker
```

**Homepage URL :**
```
http://localhost:3000
```

**Application description :**
```
Application pour tracker les victoires entre joueurs
```

**Authorization callback URL :**
```
http://localhost:3000/auth/callback
```

### 1.3 Récupérer les credentials

Après création, tu verras :
- **Client ID** → Copie dans `.env` comme `VITE_GITHUB_CLIENT_ID`
- **Client Secret** → Copie dans `.env` comme `GITHUB_CLIENT_SECRET`

---

## 🛠️ Étape 2 : Configurer le `.env`

```bash
cp .env.example .env
```

Édite `.env` :

```env
# Database
DATABASE_URL=postgresql://...@neon.tech/victory_tracker?sslmode=require

# Frontend
VITE_API_URL=http://localhost:3000
VITE_GITHUB_CLIENT_ID=YOUR_CLIENT_ID_HERE

# Backend
GITHUB_CLIENT_ID=YOUR_CLIENT_ID_HERE
GITHUB_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
JWT_SECRET=your-secret-key-change-in-production
```

⚠️ **IMPORTANT** :
- Ne push **JAMAIS** le `.env` sur GitHub (il est dans `.gitignore`)
- Change `JWT_SECRET` en production

---

## 🚀 Étape 3 : Tester localement

```bash
npm install
npm run api      # Terminal 1
npm run dev      # Terminal 2
```

1. Ouvre http://localhost:5173
2. Clique "Se connecter avec GitHub"
3. GitHub te demande d'autoriser l'accès
4. Tu es redirigé et connecté! ✅

---

## 🌐 Étape 4 : Configuration pour Vercel (production)

### 4.1 Créer une 2ème GitHub OAuth App (pour production)

Répète l'étape 1, mais avec :

**Homepage URL :**
```
https://your-app.vercel.app
```

**Authorization callback URL :**
```
https://your-app.vercel.app/auth/callback
```

### 4.2 Ajouter les env vars à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Sélectionner ton projet
3. **Settings** → **Environment Variables**
4. Ajouter :

| Clé | Valeur |
|-----|--------|
| `DATABASE_URL` | Connection string Neon |
| `VITE_API_URL` | `https://your-app.vercel.app` |
| `VITE_GITHUB_CLIENT_ID` | Client ID (production OAuth) |
| `GITHUB_CLIENT_ID` | Client ID (production OAuth) |
| `GITHUB_CLIENT_SECRET` | Client Secret (production OAuth) |
| `JWT_SECRET` | Générer une clé sécurisée |

### 4.3 Redéployer

```bash
git push origin main
# Vercel détecte le push et redéploie automatiquement
```

---

## 🔑 Générer une clé JWT sécurisée

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Colle le résultat comme `JWT_SECRET` dans Vercel.

---

## 🐛 Dépannage

### "Redirect URI mismatch"

→ La callback URL ne correspond pas à celle configurée sur GitHub
- Vérifier que `Authorization callback URL` sur GitHub = `http://localhost:3000/auth/callback`
- En production, doit être `https://your-app.vercel.app/auth/callback`

### "Invalid Client ID"

→ `VITE_GITHUB_CLIENT_ID` ou `GITHUB_CLIENT_ID` manquant ou incorrect
- Vérifier le `.env`
- Copier exactement depuis GitHub

### "JWT invalid"

→ Token JWT invalide ou expiré
- Vérifier `JWT_SECRET` est configuré partout (local + Vercel)
- Les tokens expirent après 30 jours

### "Cannot find module 'jsonwebtoken'"

→ Les dépendances ne sont pas installées
```bash
npm install
```

---

## 📊 Architecture OAuth

```
┌─────────────────────┐
│   Frontend (Vite)   │
│  localhost:5173     │
└──────────┬──────────┘
           │
           │ 1. Clique "Login with GitHub"
           │
           ▼
┌─────────────────────┐
│   GitHub OAuth      │
│ (github.com)        │
└──────────┬──────────┘
           │
           │ 2. Utilisateur autorise
           │
           ▼
┌─────────────────────┐
│  Backend (Express)  │
│  localhost:3000     │
└──────────┬──────────┘
           │
           │ 3. Créer/récupérer user
           │    Générer JWT token
           │
           ▼
┌─────────────────────┐
│   Frontend (Vite)   │
│  Utilisateur connecté
└─────────────────────┘
```

---

## 🔐 Tokens JWT

- **Durée** : 30 jours
- **Stockage** : `localStorage` (frontend)
- **Envoi** : Header `Authorization: Bearer <token>`

Après 30 jours, l'utilisateur doit se reconnecter.

---

## 📚 Ressources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [JWT Introduction](https://jwt.io/introduction)
- [Express.js middleware](https://expressjs.com/en/guide/using-middleware.html)

---

## ✅ Checklist de déploiement

- [ ] GitHub OAuth App créée (development)
- [ ] `.env` configuré localement
- [ ] `npm install` effectué
- [ ] Backend et frontend testés localement
- [ ] Repo pushé sur GitHub
- [ ] Vercel déploie automatiquement
- [ ] GitHub OAuth App créée (production)
- [ ] Env vars ajoutées à Vercel
- [ ] Test login sur production ✅

---

**Vous êtes prêt ! 🚀**