
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  username: string;
  id: string; // userId aus dem JWT
}

export const useAuthStore = defineStore('auth', () => {
  //Token und user aus localstorage laden
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  )
  // API-URL aus der .env.development 
  const API_URL = import.meta.env.VITE_API_URL

  const router = useRouter()

  // Prüfen, ob User eingeloggt ist 
  const isAuthenticated = computed(() => !!token.value)
  // Header für API-Requests mit Token
  const authHeader = computed(() => ({
    'Authorization': `Bearer ${token.value}`
  }))

  // Login: schickt Username/Passwort ans Backend
  async function login(username: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Login fehlgeschlagen')

    // Antwort vom Backend: Token + User speichern
    const data = await res.json()
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  // Logout: löscht Token/User und zurück zu Login 
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push({ name: 'login' }) // zurück zur Login-Seite
  }

  // API-Aufrufe, die Authentifizierung brauchen
  async function fetchWithAuth(urlPath: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${urlPath}`, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeader.value
      }
    });

    // wenn Token ungültig dannn automatisch ausloggen
    if (res.status === 401) {
      logout()
      throw new Error('Unauthorized - Logging out')
    }
    return res
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchWithAuth
  }
})
