# ⚡ Quick Start - Neon (5 min)

## 1️⃣ Créer une DB Neon (gratuite)

```
https://neon.tech
→ Sign up → Create project → victory-tracker
→ Copier la connection string
```

Exemple :
```
postgresql://user:pass@ep-cool-example.neon.tech/victory_tracker?sslmode=require
```

## 2️⃣ Configurer l'app

```bash
cp .env.example .env
```

Éditer `.env` :
```env
DATABASE_URL=postgresql://user:pass@...
VITE_API_URL=http://localhost:3000
```

## 3️⃣ Installer & lancer

```bash
npm install

# Terminal 1 - Backend
npm run api

# Terminal 2 - Frontend
npm run dev
```

✅ C'est prêt ! Ouvre http://localhost:5173

---

## 🚀 Déployer sur Vercel

```bash
git add .
git commit -m "Add Neon"
git push

vercel
# Ajouter DATABASE_URL dans les env vars
```

---

**Plus de détails ?** Voir `NEON_GUIDE.md`
