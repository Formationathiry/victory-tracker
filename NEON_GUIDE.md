# 🚀 Victory Tracker avec Neon PostgreSQL

Guide complet pour utiliser Neon (PostgreSQL gratuit) avec Victory Tracker.

## ✨ Avantages de Neon

✅ **Gratuit** - 10 GB de stockage (pas de carte de crédit requise)  
✅ **PostgreSQL** - Identique à Supabase  
✅ **Facile** - Serverless, pas de maintenance  
✅ **Performant** - Optimisé pour le cloud  
✅ **Scalable** - Prêt pour la production  

---

## 📋 Étape 1 : Créer un compte Neon

1. Aller sur [neon.tech](https://neon.tech)
2. Cliquer **"Sign up"** (avec GitHub recommandé)
3. Créer un nouveau projet :
   - **Project name** : `victory-tracker`
   - **Database name** : `victory_tracker` (laisse par défaut)
   - **Region** : Europe (la plus proche)
   - Cliquer **"Create project"**

⏳ Attendre quelques secondes...

---

## 🔑 Étape 2 : Récupérer la connection string

Une fois le projet créé :

1. Dans Neon Dashboard, cliquer sur **"Connection String"**
2. Copier la connection string complète :

```
postgresql://username:password@host/database?sslmode=require
```

**Exemple :**
```
postgresql://user123:abc123@ep-cool-example.us-east-1.neon.tech/victory_tracker?sslmode=require
```

---

## 🛠️ Étape 3 : Configurer l'app

### A. Créer le fichier .env

```bash
cp .env.example .env
```

Éditer `.env` :

```env
# Neon Connection String
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Frontend
VITE_API_URL=http://localhost:3000
```

### B. Installer les dépendances

```bash
npm install
```

Cela va installer :
- `express` - Backend API
- `pg` - Driver PostgreSQL
- `cors` - CORS support
- `uuid` - Génération d'IDs

---

## 🚀 Étape 4 : Lancer localement

### Terminal 1 : Backend API

```bash
npm run api
```

Vous devriez voir :
```
✅ Connecté à Neon PostgreSQL
✅ Tables créées avec succès
🚀 Serveur lancé sur le port 3000
```

### Terminal 2 : Frontend

```bash
npm run dev
```

L'app s'ouvre à `http://localhost:5173` ✅

---

## ✅ Étape 5 : Tester

1. **Ajouter des joueurs** ✅
2. **Enregistrer des victoires** ✅
3. **Vérifier les stats** ✅

Tout fonctionne ! 🎉

---

## 🌐 Étape 6 : Déployer sur Vercel

### A. Push sur GitHub

```bash
git add .
git commit -m "Add Neon PostgreSQL integration"
git push origin main
```

### B. Déployer sur Vercel

```bash
npm install -g vercel
vercel
```

### C. Configurer les variables d'environnement

1. Aller à **Settings** → **Environment Variables**
2. Ajouter :
   - `DATABASE_URL` : Votre connection string Neon
   - `VITE_API_URL` : L'URL de votre app Vercel

**Exemple :**
```
DATABASE_URL=postgresql://...@neon.tech/victory_tracker?sslmode=require
VITE_API_URL=https://your-app.vercel.app
```

3. Redéployer : `vercel --prod`

✅ Votre app est en ligne ! 🚀

---

## 📊 Architecture

```
┌────────────────────────┐
│   Frontend (Vite)      │
│  http://localhost:5173 │
└───────────┬────────────┘
            │
            │ API calls (REST)
            ▼
┌────────────────────────┐
│  Backend (Express)     │
│  http://localhost:3000 │
└───────────┬────────────┘
            │
            │ SQL queries
            ▼
┌────────────────────────┐
│  Neon PostgreSQL       │
│  (Cloud Database)      │
└────────────────────────┘
```

---

## 📡 API Endpoints

### Joueurs

```bash
# Récupérer tous les joueurs
GET /api/joueurs

# Créer un joueur
POST /api/joueurs
Content-Type: application/json
{"nom": "Alice"}

# Supprimer un joueur
DELETE /api/joueurs/:id
```

### Victoires

```bash
# Récupérer toutes les victoires
GET /api/victoires

# Créer une victoire
POST /api/victoires
Content-Type: application/json
{
  "joueur1_id": "uuid1",
  "joueur2_id": "uuid2",
  "gagnant_id": "uuid1"
}
```

### Health

```bash
# Vérifier l'état du serveur
GET /api/health
```

---

## 🔍 Inspecter la base de données

### Via Neon Dashboard

1. Dans Neon, aller à **"SQL Editor"**
2. Voir les tables et les données en temps réel

### Via la CLI

```bash
# Se connecter à Neon
psql postgresql://username:password@host/database?sslmode=require

# Lister les tables
\dt

# Voir les données
SELECT * FROM joueurs;
SELECT * FROM victoires;
```

---

## 🐛 Dépannage

### "Error: connect ECONNREFUSED"

→ Le backend n'est pas lancé
```bash
npm run api
```

### "Error: connect EHOSTUNREACH"

→ Vérifier la connection string Neon
1. Aller à Neon Dashboard
2. Copier à nouveau la connection string
3. Vérifier qu'elle n'a pas de caractères spéciaux mal échappés

### "Error: password authentication failed"

→ Vérifier le password dans la connection string
- Neon Dashboard → Connection String → copier la complète

### "Error: relation "joueurs" does not exist"

→ Les tables n'ont pas été créées
- Relancer le backend (`npm run api`)
- Le backend crée automatiquement les tables

### "Error: listen EADDRINUSE :::3000"

→ Le port 3000 est déjà utilisé
```bash
# Utiliser un autre port
PORT=3001 npm run api
```

---

## 📚 Fichiers importants

| Fichier | Rôle |
|---------|------|
| `api/neon.js` | Backend Express + PostgreSQL |
| `src/main.js` | Frontend avec API REST |
| `src/index.html` | Interface HTML |
| `src/style.css` | Styles CSS |
| `.env` | Variables d'environnement |
| `vercel.json` | Configuration Vercel |

---

## 💡 Conseils

- ✅ Neon crée automatiquement les tables au démarrage
- ✅ La connection string est sécurisée (SSL activé par défaut)
- ✅ Vous avez 10 GB gratuit (plus que suffisant)
- ✅ Pas d'inactivité ("auto-sleep") sur le free plan
- ✅ Support gratuit

---

## 📞 Ressources

- [Neon Docs](https://neon.tech/docs)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)
- [Express.js API](https://expressjs.com/en/api/app.html)
- [Node.js pg](https://node-postgres.com/)

---

## 🎉 Vous êtes prêt !

- Base de données gratuite et illimitée
- Backend API simple et performant
- Frontend modern avec Vite
- Déploiement facile sur Vercel

**Bon développement ! 🚀**
