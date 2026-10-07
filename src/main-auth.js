// ===== Configuration API =====
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID

// ===== DOM Elements - Login =====
const loginPage = document.getElementById('loginPage')
const appPage = document.getElementById('appPage')
const githubLoginBtn = document.getElementById('githubLoginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const userAvatar = document.getElementById('userAvatar')
const userName = document.getElementById('userName')

// ===== DOM Elements - App =====
const joueurNomInput = document.getElementById('joueurNom')
const btnAjouterJoueur = document.getElementById('btnAjouterJoueur')
const messageAjout = document.getElementById('messageAjout')
const listeJoueurs = document.getElementById('listeJoueurs')

const joueur1Select = document.getElementById('joueur1')
const joueur2Select = document.getElementById('joueur2')
const gagnantSelect = document.getElementById('gagnant')
const btnAjouterVictoire = document.getElementById('btnAjouterVictoire')
const messageVictoire = document.getElementById('messageVictoire')

const tableauConfrontations = document.getElementById('tableauConfrontations')
const statistiques = document.getElementById('statistiques')
const historiqueVictoires = document.getElementById('historiqueVictoires')

// ===== État Global =====
let joueurs = []
let victoires = []
let currentUser = null
let token = null

// ===== AUTH FUNCTIONS =====

function getAuthToken() {
  return localStorage.getItem('auth_token')
}

function setAuthToken(t) {
  token = t
  localStorage.setItem('auth_token', t)
}

function clearAuthToken() {
  token = null
  localStorage.removeItem('auth_token')
  currentUser = null
}

async function checkAuth() {
  const savedToken = getAuthToken()
  if (!savedToken) {
    showLoginPage()
    return
  }

  token = savedToken

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      currentUser = await response.json()
      showAppPage()
      chargerDonnees()
    } else {
      clearAuthToken()
      showLoginPage()
    }
  } catch (error) {
    console.error('Erreur auth:', error)
    clearAuthToken()
    showLoginPage()
  }
}

function showLoginPage() {
  loginPage.style.display = 'flex'
  appPage.style.display = 'none'
}

function showAppPage() {
  loginPage.style.display = 'none'
  appPage.style.display = 'block'
  if (currentUser) {
    userName.textContent = `Bienvenue, ${currentUser.username}!`
    if (currentUser.avatar_url) {
      userAvatar.src = currentUser.avatar_url
    }
  }
}

// ===== GITHUB OAUTH =====

function initiateGitHubLogin() {
  if (!GITHUB_CLIENT_ID) {
    console.error('GITHUB_CLIENT_ID non configuré')
    afficherErreur('Erreur: Client ID GitHub manquant')
    return
  }

  const redirectUri = window.location.origin + '/victory-tracker'
  const scope = 'user:email'
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri + '/auth/callback')}&` +
    `scope=${scope}&` +
    `state=random-state-string`

  window.location.href = authUrl
}

async function handleGitHubCallback() {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')

  if (!code) {
    return
  }

  try {
    console.log('🔐 Processing GitHub callback with code:', code.substring(0, 10) + '...')
    console.log('📡 API URL:', API_URL)

    const response = await fetch(`${API_URL}/auth/github/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })

    console.log('✅ Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error:', errorText)
      throw new Error(`Erreur serveur: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Token received, logging in...')

    setAuthToken(data.token)
    currentUser = data.user

    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname)

    showAppPage()
    chargerDonnees()
  } catch (error) {
    console.error('❌ Erreur complète:', error)
    console.error('Message:', error.message)
    afficherErreur('❌ Erreur: ' + error.message)
  }
}

function logout() {
  clearAuthToken()
  showLoginPage()
}

// ===== API FUNCTIONS =====

async function fetchJoueurs() {
  try {
    const response = await fetch(`${API_URL}/api/joueurs`)
    if (!response.ok) throw new Error('Erreur')
    joueurs = await response.json()
    mettreAJourSelects()
    afficherJoueurs()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function fetchVictoires() {
  try {
    const response = await fetch(`${API_URL}/api/victoires`)
    if (!response.ok) throw new Error('Erreur')
    victoires = await response.json()
    afficherTableauConfrontations()
    afficherStatistiques()
    afficherHistorique()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function ajouterJoueur(nom) {
  try {
    const response = await fetch(`${API_URL}/api/joueurs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nom: nom.trim() })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur serveur')
    }

    const joueur = await response.json()
    joueurs.push(joueur)
    mettreAJourSelects()
    afficherJoueurs()
    afficherSucces('Joueur ajouté avec succès!')
    joueurNomInput.value = ''
  } catch (error) {
    afficherErreur(error.message)
  }
}

async function supprimerJoueur(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return

  try {
    const response = await fetch(`${API_URL}/api/joueurs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) throw new Error('Erreur')

    joueurs = joueurs.filter(j => j.id !== id)
    victoires = victoires.filter(v => v.joueur1_id !== id && v.joueur2_id !== id)
    mettreAJourSelects()
    afficherJoueurs()
    afficherTableauConfrontations()
    afficherStatistiques()
    afficherHistorique()
    afficherSucces('Joueur supprimé!')
  } catch (error) {
    afficherErreur('Impossible de supprimer le joueur')
  }
}

async function ajouterVictoire(joueur1Id, joueur2Id, gagnantId) {
  try {
    const response = await fetch(`${API_URL}/api/victoires`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        joueur1_id: joueur1Id,
        joueur2_id: joueur2Id,
        gagnant_id: gagnantId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur serveur')
    }

    const victoire = await response.json()
    victoires.push(victoire)
    afficherTableauConfrontations()
    afficherStatistiques()
    afficherHistorique()
    afficherSucces('Victoire enregistrée!')
    joueur1Select.value = ''
    joueur2Select.value = ''
    gagnantSelect.value = ''
  } catch (error) {
    afficherErreur(error.message)
  }
}

// ===== AFFICHAGE =====

function mettreAJourSelects() {
  const selects = [joueur1Select, joueur2Select, gagnantSelect]
  const optionsHtml = joueurs
    .map(j => `<option value="${j.id}">${j.nom}</option>`)
    .join('')

  selects.forEach(select => {
    const currentValue = select.value
    select.innerHTML = `<option value="">Sélectionner...</option>${optionsHtml}`
    select.value = currentValue
  })
}

function afficherJoueurs() {
  if (joueurs.length === 0) {
    listeJoueurs.innerHTML = '<p class="loading">Aucun joueur</p>'
    return
  }

  const stats = calculerStatsJoueurs()
  const html = joueurs
    .map(joueur => {
      const stat = stats[joueur.id] || { victoires: 0, total: 0, ratio: '0%' }
      return `
        <div class="joueur-item">
          <div>
            <div class="joueur-nom">${joueur.nom}</div>
            <div class="joueur-stats">
              ${stat.victoires}/${stat.total} matchs • ${stat.ratio}
            </div>
          </div>
          <button class="btn btn-small" onclick="supprimerJoueur('${joueur.id}')">
            Supprimer
          </button>
        </div>
      `
    })
    .join('')

  listeJoueurs.innerHTML = html
}

function afficherTableauConfrontations() {
  if (joueurs.length < 2) {
    tableauConfrontations.innerHTML = '<p class="loading">Ajoutez au moins 2 joueurs</p>'
    return
  }

  const matrice = {}
  joueurs.forEach(j1 => {
    matrice[j1.id] = {}
    joueurs.forEach(j2 => {
      if (j1.id !== j2.id) {
        const victJ1 = victoires.filter(
          v => (v.joueur1_id === j1.id && v.joueur2_id === j2.id && v.gagnant_id === j1.id) ||
               (v.joueur2_id === j1.id && v.joueur1_id === j2.id && v.gagnant_id === j1.id)
        ).length
        const victJ2 = victoires.filter(
          v => (v.joueur1_id === j1.id && v.joueur2_id === j2.id && v.gagnant_id === j2.id) ||
               (v.joueur2_id === j1.id && v.joueur1_id === j2.id && v.gagnant_id === j2.id)
        ).length
        matrice[j1.id][j2.id] = `${victJ1}-${victJ2}`
      }
    })
  })

  const headerHtml = `
    <tr>
      <th>Joueur</th>
      ${joueurs.map(j => `<th>${j.nom}</th>`).join('')}
    </tr>
  `

  const rowsHtml = joueurs
    .map(j1 => `
      <tr>
        <td><strong>${j1.nom}</strong></td>
        ${joueurs
          .map(j2 => {
            if (j1.id === j2.id) return '<td>-</td>'
            return `<td class="score-cell">${matrice[j1.id][j2.id]}</td>`
          })
          .join('')}
      </tr>
    `)
    .join('')

  tableauConfrontations.innerHTML = `
    <table>
      <thead>${headerHtml}</thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `
}

function afficherStatistiques() {
  const stats = calculerStatsJoueurs()
  const joueursTries = joueurs.sort((a, b) => {
    const statsA = stats[a.id] || { victoires: 0 }
    const statsB = stats[b.id] || { victoires: 0 }
    return statsB.victoires - statsA.victoires
  })

  const html = joueursTries
    .map((joueur, index) => {
      const stat = stats[joueur.id] || { victoires: 0, total: 0, ratio: '0%' }
      const couleurs = [
        'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'linear-gradient(135deg, #c0cfd9 0%, #999999 100%)',
        'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
      ]
      const couleur = couleurs[index] || 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'

      return `
        <div class="stat-card" style="background: ${couleur}">
          <div class="stat-label">#${index + 1} - ${joueur.nom}</div>
          <div class="stat-value">${stat.victoires}</div>
          <div class="stat-label">${stat.total} matchs • ${stat.ratio}</div>
        </div>
      `
    })
    .join('')

  statistiques.innerHTML = html
}

function afficherHistorique() {
  if (victoires.length === 0) {
    historiqueVictoires.innerHTML = '<p class="loading">Aucune victoire enregistrée</p>'
    return
  }

  const html = victoires
    .slice()
    .reverse()
    .map(victoire => {
      const j1 = joueurs.find(j => j.id === victoire.joueur1_id)
      const j2 = joueurs.find(j => j.id === victoire.joueur2_id)
      const gagnant = joueurs.find(j => j.id === victoire.gagnant_id)
      const perdant = victoire.gagnant_id === victoire.joueur1_id ? j2 : j1

      const date = new Date(victoire.date)
      const dateStr = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      return `
        <div class="historique-item">
          <div class="historique-titre">
            🏆 ${gagnant?.nom || 'Inconnu'} a battu ${perdant?.nom || 'Inconnu'}
          </div>
          <div class="historique-date">${dateStr}</div>
        </div>
      `
    })
    .join('')

  historiqueVictoires.innerHTML = html
}

function calculerStatsJoueurs() {
  const stats = {}

  joueurs.forEach(joueur => {
    const victoires_count = victoires.filter(v => v.gagnant_id === joueur.id).length
    const total = victoires.filter(
      v => v.joueur1_id === joueur.id || v.joueur2_id === joueur.id
    ).length
    const ratio = total > 0 ? Math.round((victoires_count / total) * 100) : 0

    stats[joueur.id] = {
      victoires: victoires_count,
      total: total,
      ratio: `${ratio}%`
    }
  })

  return stats
}

// ===== Messages =====

function afficherSucces(message) {
  messageAjout.textContent = message
  messageAjout.className = 'message success'
  setTimeout(() => {
    messageAjout.className = 'message'
  }, 3000)
}

function afficherErreur(message) {
  messageAjout.textContent = message
  messageAjout.className = 'message error'
}

// ===== Event Listeners =====

githubLoginBtn.addEventListener('click', initiateGitHubLogin)
logoutBtn.addEventListener('click', logout)

btnAjouterJoueur.addEventListener('click', () => {
  const nom = joueurNomInput.value.trim()
  if (!nom) {
    afficherErreur('Veuillez entrer un nom')
    return
  }
  ajouterJoueur(nom)
})

joueurNomInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnAjouterJoueur.click()
})

btnAjouterVictoire.addEventListener('click', () => {
  const j1 = joueur1Select.value
  const j2 = joueur2Select.value
  const gagnant = gagnantSelect.value

  if (!j1 || !j2 || !gagnant) {
    messageVictoire.textContent = 'Veuillez sélectionner les joueurs et le gagnant'
    messageVictoire.className = 'message error'
    return
  }

  if (j1 === j2) {
    messageVictoire.textContent = 'Sélectionnez deux joueurs différents'
    messageVictoire.className = 'message error'
    return
  }

  if (gagnant !== j1 && gagnant !== j2) {
    messageVictoire.textContent = 'Le gagnant doit être l\'un des deux joueurs'
    messageVictoire.className = 'message error'
    return
  }

  ajouterVictoire(j1, j2, gagnant)
})

// ===== Chargement Initial =====

async function chargerDonnees() {
  await fetchJoueurs()
  await fetchVictoires()
}

// Vérifier l'authentification au démarrage
checkAuth()

// Rafraîchir les données toutes les 5 secondes
setInterval(() => {
  if (currentUser) {
    chargerDonnees()
  }
}, 5000)
