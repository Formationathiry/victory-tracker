import express from 'express'
import { Client } from 'pg'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Configuration de la base de données Neon
const client = new Client({
  connectionString: process.env.DATABASE_URL
})

// ========== INITIALISATION ==========

let connected = false

async function connectDB() {
  try {
    await client.connect()
    connected = true
    console.log('✅ Connecté à Neon PostgreSQL')

    // Créer les tables si elles n'existent pas
    await client.query(`
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

// ========== API ENDPOINTS ==========

// Récupérer tous les joueurs
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

// Créer un joueur
app.post('/api/joueurs', async (req, res) => {
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
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Ce joueur existe déjà' })
    }
    console.error('Erreur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Supprimer un joueur
app.delete('/api/joueurs/:id', async (req, res) => {
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

// Récupérer toutes les victoires
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

// Créer une victoire
app.post('/api/victoires', async (req, res) => {
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
  })
}

start().catch(error => {
  console.error('Erreur de démarrage:', error)
  process.exit(1)
})

export default app
