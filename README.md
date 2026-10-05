# 🏆 Victory Tracker

Une application web moderne pour tracker les victoires et confrontations entre joueurs.

## ✨ Fonctionnalités

✅ **Gestion des joueurs** - Ajouter/supprimer des joueurs facilement  
✅ **Enregistrement des victoires** - Tracker chaque match et résultat  
✅ **Tableau des confrontations** - Voir l'historique H2H entre joueurs  
✅ **Statistiques en temps réel** - Rankings, taux de victoire, etc.  
✅ **Historique complet** - Consulter toutes les victoires enregistrées  
✅ **Interface responsive** - Fonctionne sur desktop, tablet, mobile  

## 🚀 Quick Start (5 min)

### 1️⃣ Cloner et configurer

```bash
git clone https://github.com/ton-username/victory-tracker.git
cd victory-tracker
cp .env.example .env
```

### 2️⃣ Créer une DB Neon gratuite

1. Aller sur [neon.tech](https://neon.tech)
2. Sign up → Create project `victory-tracker`
3. Copier la connection string PostgreSQL
4. Coller dans `.env` (variable `DATABASE_URL`)

**Exemple :**
```env
DATABASE_URL=postgresql://user:pass@ep-cool-example.neon.tech/victory_tracker?sslmode=require
VITE_API_URL=http://localhost:3000
```

### 3️⃣ Installer & Lancer

```bash
npm install

# Terminal 1 - Backend
npm run api

# Terminal 2 - Frontend
npm run dev
```

✅ L'app s'ouvre à `http://localhost:5173`

## 📁 Structure du Projet

```
victory-tracker/
├── src/
│   ├── index.html          # Page HTML
│   ├── style.css           # Styles (responsive)
│   └── main.js             # Logique frontend + API REST
├── api/
│   └── neon.js             # Backend Express + PostgreSQL
├── package.json            # Dépendances
├── vite.config.js          # Config Vite
├── vercel.json             # Config Vercel
├── .env.example            # Template env vars
├── .gitignore              # Git ignore
└── README.md               # Ce fichier
```

## 🛠️ Stack Technique

| Composant | Tech |
|-----------|------|
| **Frontend** | Vite, Vanilla JS, HTML5, CSS3 |
| **Backend** | Express.js, Node.js |
| **Database** | Neon (PostgreSQL gratuit) |
| **Déploiement** | Vercel (serverless) |

## 📡 Architecture

```
Frontend (Vite)          Backend (Express)       Database (Neon)
http://localhost:5173 ←→ http://localhost:3000 ←→ PostgreSQL
```

## 🌐 Déployer sur Vercel

### 1️⃣ Push sur GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2️⃣ Deployer sur Vercel

```bash
npm install -g vercel
vercel
```

### 3️⃣ Ajouter les env vars

Dans Vercel Dashboard → Settings → Environment Variables :
```
DATABASE_URL = (ta connection string Neon)
VITE_API_URL = https://ton-app.vercel.app
```

### 4️⃣ Redéployer

```bash
vercel --prod
```

✅ Ton app est en ligne! 🚀

## 📊 API Endpoints

### Joueurs

```bash
# Récupérer tous les joueurs
GET /api/joueurs

# Créer un joueur
POST /api/joueurs
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
{
  "joueur1_id": "uuid1",
  "joueur2_id": "uuid2",
  "gagnant_id": "uuid1"
}
```

### Health

```bash
GET /api/health
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Démarrer frontend (Vite)
npm run build        # Build frontend
npm run preview      # Prévisualiser build
npm run api          # Démarrer backend
npm run api:legacy   # Démarrer backend MySQL (legacy)
npm run dev:api      # Démarrer backend en mode développement
```

## 🐛 Dépannage

### "Error: connect ECONNREFUSED"
→ Le backend n'est pas lancé
```bash
npm run api
```

### "Error: password authentication failed"
→ Vérifier la connection string Neon
- Aller à Neon Dashboard
- Copier la connection string complète
- Vérifier qu'elle n'a pas de caractères mal échappés

### "Error: listen EADDRINUSE :::3000"
→ Le port 3000 est déjà utilisé
```bash
PORT=3001 npm run api
```

## 📚 Documentation complète

Voir `NEON_GUIDE.md` pour des instructions détaillées sur Neon, la base de données, et le dépannage.

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont bienvenues ! 🎉

---

**Développé avec ❤️ | Powered by Neon PostgreSQL + Express + Vite**
