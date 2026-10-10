import { createClient } from '@supabase/supabase-js'

// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://llehmrjrcnjexzyqmczm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZWhtcmpyY25qZXh6eXFtY3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjIxMDMsImV4cCI6MjEwNzE5ODEwM30.AwYA3Sru8o8CToSoJQwp3OyF0D7g24PzcjQ1ZDsd2bM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ===== DOM Elements =====
let loginPage, appPage, githubLoginBtn, logoutBtn, userAvatar, userName
let joueurNomInput, btnAjouterJoueur, messageAjout, listeJoueurs
let joueur1Select, joueur2Select, gagnantSelect, btnAjouterVictoire, messageVictoire
let tableauConfrontations, statistiques, historiqueVictoires

function initializeDOMElements() {
  loginPage = document.getElementById('loginPage')
  appPage = document.getElementById('appPage')
  githubLoginBtn = document.getElementById('githubLoginBtn')
  logoutBtn = document.getElementById('logoutBtn')
  userAvatar = document.getElementById('userAvatar')
  userName = document.getElementById('userName')

  joueurNomInput = document.getElementById('joueurNom')
  btnAjouterJoueur = document.getElementById('btnAjouterJoueur')
  messageAjout = document.getElementById('messageAjout')
  listeJoueurs = document.getElementById('listeJoueurs')

  joueur1Select = document.getElementById('joueur1')
  joueur2Select = document.getElementById('joueur2')
  gagnantSelect = document.getElementById('gagnant')
  btnAjouterVictoire = document.getElementById('btnAjouterVictoire')
  messageVictoire = document.getElementById('messageVictoire')

  tableauConfrontations = document.getElementById('tableauConfrontations')
  statistiques = document.getElementById('statistiques')
  historiqueVictoires = document.getElementById('historiqueVictoires')
}

// ===== État Global =====
let joueurs = []
let victoires = []
let currentUser = null

// ===== AUTH FUNCTIONS =====

async function initializeAuth() {
  console.log('🚀 Initializing Supabase auth...')
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    currentUser = session.user
    console.log('✅ User logged in:', currentUser.email)
    showAppPage()
    chargerDonnees()
  } else {
    console.log('📋 No session found, showing login page')
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
    userName.textContent = `Bienvenue, ${currentUser.user_metadata?.full_name || currentUser.email}!`
    if (currentUser.user_metadata?.avatar_url) {
      userAvatar.src = currentUser.user_metadata.avatar_url
    }
  }
}

async function initiateGitHubLogin() {
  console.log('🔐 Initiating GitHub login...')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + '/victory-tracker/index.html'
    }
  })
  if (error) {
    console.error('❌ Auth error:', error)
    afficherErreur('Erreur: ' + error.message)
  }
}

async function logout() {
  console.log('🔐 Logging out...')
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('❌ Logout error:', error)
  }
  currentUser = null
  showLoginPage()
}

// ===== API FUNCTIONS (SUPABASE) =====

async function fetchJoueurs() {
  try {
    console.log('📡 Fetching joueurs...')
    const { data, error } = await supabase
      .from('joueurs')
      .select('*')
      .order('nom', { ascending: true })
    
    if (error) throw error
    
    joueurs = data || []
    console.log('✅ Joueurs loaded:', joueurs.length)
    mettreAJourSelects()
    afficherJoueurs()
  } catch (error) {
    console.error('❌ Error fetching joueurs:', error)
  }
}

async function fetchVictoires() {
  try {
    console.log('📡 Fetching victoires...')
    const { data, error } = await supabase
      .from('victoires')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    victoires = data || []
    console.log('✅ Victoires loaded:', victoires.length)
    afficherTableauConfrontations()
    afficherStatistiques()
    afficherHistorique()
  } catch (error) {
    console.error('❌ Error fetching victoires:', error)
  }
}

async function ajouterJoueur(nom) {
  try {
    console.log('📡 Adding joueur:', nom)
    const { data, error } = await supabase
      .from('joueurs')
      .insert([{ nom: nom.trim(), user_id: currentUser.id }])
      .select()
    
    if (error) throw error
    
    joueurs.push(data[0])
    console.log('✅ Joueur added')
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
    console.log('📡 Deleting joueur:', id)
    const { error } = await supabase
      .from('joueurs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    joueurs = joueurs.filter(j => j.id !== id)
    victoires = victoires.filter(v => v.joueur1_id !== id && v.joueur2_id !== id)
    console.log('✅ Joueur deleted')
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
    console.log('📡 Adding victoire...')
    const { data, error } = await supabase
      .from('victoires')
      .insert([{
        joueur1_id: joueur1Id,
        joueur2_id: joueur2Id,
        gagnant_id: gagnantId,
        user_id: currentUser.id
      }])
      .select()
    
    if (error) throw error
    
    victoires.unshift(data[0])
    console.log('✅ Victoire added')
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

// ===== UI FUNCTIONS =====

function chargerDonnees() {
  fetchJoueurs()
  fetchVictoires()
}

function mettreAJourSelects() {
  joueur1Select.innerHTML = '<option value="">-- Sélectionner --</option>'
  joueur2Select.innerHTML = '<option value="">-- Sélectionner --</option>'
  gagnantSelect.innerHTML = '<option value="">-- Sélectionner --</option>'

  joueurs.forEach(j => {
    joueur1Select.innerHTML += `<option value="${j.id}">${j.nom}</option>`
    joueur2Select.innerHTML += `<option value="${j.id}">${j.nom}</option>`
    gagnantSelect.innerHTML += `<option value="${j.id}">${j.nom}</option>`
  })
}

function afficherJoueurs() {
  listeJoueurs.innerHTML = ''
  joueurs.forEach(joueur => {
    const div = document.createElement('div')
    div.className = 'joueur-item'
    div.innerHTML = `
      <span>${joueur.nom}</span>
      <button onclick="supprimerJoueur('${joueur.id}')" class="btn-small">Supprimer</button>
    `
    listeJoueurs.appendChild(div)
  })
}

function afficherTableauConfrontations() {
  const confrontations = {}
  
  joueurs.forEach(j => {
    confrontations[j.id] = {}
    joueurs.forEach(j2 => {
      if (j.id !== j2.id) {
        const wins = victoires.filter(v => v.gagnant_id === j.id && 
          ((v.joueur1_id === j.id && v.joueur2_id === j2.id) || 
           (v.joueur2_id === j.id && v.joueur1_id === j2.id))).length
        confrontations[j.id][j2.id] = wins
      }
    })
  })

  let html = '<table><tr><th>Joueur</th>'
  joueurs.forEach(j => html += `<th>${j.nom}</th>`)
  html += '</tr>'

  joueurs.forEach(j => {
    html += `<tr><td><strong>${j.nom}</strong></td>`
    joueurs.forEach(j2 => {
      if (j.id === j2.id) {
        html += '<td>-</td>'
      } else {
        html += `<td>${confrontations[j.id][j2.id] || 0}</td>`
      }
    })
    html += '</tr>'
  })
  html += '</table>'

  tableauConfrontations.innerHTML = html
}

function afficherStatistiques() {
  let html = '<div class="stats-container">'
  
  joueurs.forEach(j => {
    const wins = victoires.filter(v => v.gagnant_id === j.id).length
    const total = victoires.filter(v => v.joueur1_id === j.id || v.joueur2_id === j.id).length
    html += `
      <div class="stat-card">
        <strong>${j.nom}</strong><br>
        Victoires: ${wins}<br>
        Total matchs: ${total}
      </div>
    `
  })
  
  html += '</div>'
  statistiques.innerHTML = html
}

function afficherHistorique() {
  historiqueVictoires.innerHTML = ''
  
  victoires.forEach(v => {
    const j1 = joueurs.find(j => j.id === v.joueur1_id)
    const j2 = joueurs.find(j => j.id === v.joueur2_id)
    const gagnant = joueurs.find(j => j.id === v.gagnant_id)
    
    if (j1 && j2 && gagnant) {
      const div = document.createElement('div')
      div.className = 'historique-item'
      const date = new Date(v.created_at).toLocaleDateString('fr-FR')
      div.innerHTML = `<strong>${gagnant.nom}</strong> a battu ${j1.nom === gagnant.nom ? j2.nom : j1.nom} (${date})`
      historiqueVictoires.appendChild(div)
    }
  })
}

function afficherSucces(msg) {
  messageAjout.style.color = 'green'
  messageAjout.textContent = msg
  setTimeout(() => messageAjout.textContent = '', 3000)
}

function afficherErreur(msg) {
  messageAjout.style.color = 'red'
  messageAjout.textContent = msg
}

// ===== EVENT LISTENERS =====

function initializeApp() {
  initializeDOMElements()
  initializeAuth()

  githubLoginBtn.addEventListener('click', initiateGitHubLogin)
  logoutBtn.addEventListener('click', logout)
  btnAjouterJoueur.addEventListener('click', () => {
    if (joueurNomInput.value.trim()) {
      ajouterJoueur(joueurNomInput.value)
    }
  })
  btnAjouterVictoire.addEventListener('click', () => {
    const j1 = joueur1Select.value
    const j2 = joueur2Select.value
    const g = gagnantSelect.value
    if (j1 && j2 && g && j1 !== j2) {
      ajouterVictoire(j1, j2, g)
    }
  })

  // Auto-refresh when data changes
  supabase
    .channel('joueurs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'joueurs' }, () => fetchJoueurs())
    .subscribe()

  supabase
    .channel('victoires')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'victoires' }, () => fetchVictoires())
    .subscribe()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
