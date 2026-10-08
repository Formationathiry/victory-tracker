import express from 'express'
import { Client } from 'pg'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import fetch from 'node-fetch'

const app = express()

// Middleware
app.use(cors({
  origin: ['https://formationathiry.github.io', 'http://localhost:5173'],
  credentials: true
}))
app.use(express.json())

// Configuration de la base de données Neon
const client = new Client({
  connectionString: process.env.DATABASE_URL
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ========== INITIALISATION ==========

let connected = false

async function connectDB() {
  try {
    await client.connect()
    connected = true
    console.log('✅ Connecté à Neon PostgreSQL')

    // Créer les tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        github_id INTEGER UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS joueurs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nom TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS victoires (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        joueur1_id UUID NOT NULL REFERENCES joueurs(id) ON DELETE CASCADE,
        joueur2_id UUID NOT NULL REFERENCES joueurs(id) ON DELETE CASCADE,
        gagnant_id UUID NOT NULL REFERENCES joueurs(id) ON DELETE CASCADE,
        date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        CONSTRAINT different_players CHECK (joueur1_id != joueur2_id),
        CONSTRAINT gagnant_valide CHECK (gagnant_id IN (joueur1_id, joueur2_id))
      );

      CREATE INDEX IF NOT EXISTS idx_victoires_joueur1 ON victoires(joueur1_id);
      CREATE INDEX IF NOT EXISTS idx_victoires_joueur2 ON victoires(joueur2_id);
      CREATE INDEX IF NOT EXISTS idx_victoires_gagnant ON victoires(gagnant_id);
    `)

    console.log('✅ Tables créées avec succès')
  } catch (error) {
    console.error('❌ Erreur de connexion à Neon:', error.message)
    process.exit(1)
  }
}

// ========== MIDDLEWARE AUTH ==========

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requis' })
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' })
  }
}

// ========== AUTH ENDPOINTS ==========

// Login with GitHub
app.post('/auth/github/login', async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Code requis' })
  }

  try {
    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return res.status(401).json({ error: 'Erreur GitHub OAuth' })
    }

    const accessToken = tokenData.access_token

    // Récupérer les infos utilisateur
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    })

    const githubUser = await userResponse.json()

    // Trouver ou créer l'utilisateur
    let user = await client.query(
      'SELECT * FROM users WHERE github_id = $1',
      [githubUser.id]
    )

    if (user.rows.length === 0) {
      // Créer nouvel utilisateur
      const id = uuidv4()
      const result = await client.query(
        `INSERT INTO users (id, github_id, username, email, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, github_id, username, email, avatar_url`,
        [id, githubUser.id, githubUser.login, githubUser.email, githubUser.avatar_url]
      )
      user = result
    }

    // Générer JWT
    const jwtToken = jwt.sign(
      {
        id: user.rows[0].id,
        github_id: user.rows[0].github_id,
        username: user.rows[0].username
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      token: jwtToken,
      user: user.rows[0]
    })
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Get current user
app.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const result = await client.query(
      'SELECT id, github_id, username, email, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ========== JOUEURS ENDPOINTS (Protégés) ==========

app.get('/api/joueurs', async (req, res) => {
  try {
    const result = await client.query(
      'SELECT id, nom, created_at FROM joueurs ORDER BY nom ASC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/joueurs', verifyToken, async (req, res) => {
  const { nom } = req.body

  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le nom est requis' })
  }

  try {
    const id = uuidv4()
    const result = await client.query(
      'INSERT INTO joueurs (id, nom) VALUES ($1, $2) RETURNING id, nom',
      [id, nom.trim()]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ce joueur existe déjà' })
    }
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.delete('/api/joueurs/:id', verifyToken, async (req, res) => {
  const { id } = req.params

  try {
    const result = await client.query(
      'DELETE FROM joueurs WHERE id = $1',
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Joueur non trouvé' })
    }

    res.json({ message: 'Joueur supprimé' })
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ========== VICTOIRES ENDPOINTS (Protégées) ==========

app.get('/api/victoires', async (req, res) => {
  try {
    const result = await client.query(
      'SELECT * FROM victoires ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/victoires', verifyToken, async (req, res) => {
  const { joueur1_id, joueur2_id, gagnant_id } = req.body

  if (!joueur1_id || !joueur2_id || !gagnant_id) {
    return res.status(400).json({ error: 'Tous les champs sont requis' })
  }

  if (joueur1_id === joueur2_id) {
    return res.status(400).json({ error: 'Les joueurs doivent être différents' })
  }

  if (gagnant_id !== joueur1_id && gagnant_id !== joueur2_id) {
    return res.status(400).json({ error: 'Le gagnant doit être l\'un des deux joueurs' })
  }

  try {
    const id = uuidv4()
    const date = new Date().toISOString()

    const result = await client.query(
      'INSERT INTO victoires (id, joueur1_id, joueur2_id, gagnant_id, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, joueur1_id, joueur2_id, gagnant_id, date]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: connected ? 'connected' : 'disconnected' })
})

// ========== DÉMARRAGE ==========

const PORT = process.env.PORT || 3000

async function start() {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`)
    console.log(`📡 API disponible à http://localhost:${PORT}/api`)
    console.log(`🔐 Auth disponible à http://localhost:${PORT}/auth`)
  })
}

start().catch(error => {
  console.error('Erreur de démarrage:', error)
  process.exit(1)
})

export default app
# Vercel env vars updated
// Deploy to victory-tracker-backend
