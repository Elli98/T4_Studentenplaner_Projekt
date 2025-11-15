<template>
  <div>
    <header class="header">
      <h1>Studentenplaner</h1>
      <div class="user-info">
        <span v-if="authStore.user">Hallo, {{ authStore.user.username }}!</span>
        <button @click="handleLogout" class="logout-btn">
          Ausloggen
        </button>
      </div>
    </header>

    <!--Formular für neuen Termin -->
    <div class="card">
      <h2>Neuer Termin</h2>
      
      <div class="form-grid">
        <!--Eingabefeld für den Titel-->
        <div class="form-group full-width">
          <label for="new-title">Titel</label>
          <input
            id="new-title"
            type="text"
            v-model="newTermin.title"
            placeholder="z.B. Klausur"
          />
        </div>

        <!--Eingabefeld für Datum-->
        <div class="form-group">
          <label for="new-date">Datum</label>
          <input id="new-date" type="date" v-model="newTermin.date" />
        </div>

        <!--Eingabefeld für Uhrzeit-->
        <div class="form-group">
          <label for="new-time">Uhrzeit</label>
          <input id="new-time" type="time" v-model="newTermin.time" />
        </div>

        <!--Auswahl der Kategorie-->
         <div class="form-group full-width">
          <label for="new-category">Kategorie</label>
          <select id="new-category" v-model="newTermin.category">
            <option>Vorlesung</option>
            <option>Abgabe</option>
            <option>Prüfung</option>
            <option>Freizeit</option>
          </select>
        </div>

        <!--Eingabefeld für Beschreibugn-->
        <div class="form-group full-width">
          <label for="new-desc">Beschreibung</label>
          <textarea
            id="new-desc"
            v-model="newTermin.description"
            placeholder="Details zum Termin..."
            rows="3"
          ></textarea>
        </div>
      </div>

       <button @click="addTermin" :disabled="isSaving">
        {{ isSaving ? 'Speichert...' : 'Termin speichern' }}
      </button>
    </div>

    <hr />
    <h2>Deine Termine</h2>

    <div class="termin-container">
      <div v-if="loading" class="loading">Lade Termine...</div>

      <!-- wenn keine Termine vorhanden sind-->
      <div v-else-if="termine.length === 0" class="no-entries">
        Keine Termine gefunden.
      </div>

      <!-- Liste der Termine -->
      <div 
        v-else
        v-for="termin in termine" 
        :key="termin.id" 
        class="termin-row">

        <div class="termin-info">
          <div class="termin-left">
            <h3>{{ termin.title }}</h3>
            <p v-if="termin.description">{{ termin.description }}</p>
          </div>
          <div class="termin-right">
            <p>{{ formatTerminDate(termin.date, termin.time) }}</p>
            <p>{{ termin.category }}</p>
            <small>
              erstellt am {{ new Date(termin.createdAt).toLocaleDateString('de-DE') }}
            </small>
          </div>
        </div>
      
    <!--Buttons zum Bearbeiten & Löschen-->
    <div class="termin-actions">
          <button @click="editTermin(termin)">Bearbeiten</button>
          <button @click="deleteTermin(termin.id)">Löschen</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { reactive, ref, onMounted } from 'vue'


const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}

type TerminCategory = "Vorlesung" | "Abgabe" | "Prüfung" | "Freizeit"
interface Termin {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  category: TerminCategory;
  createdAt: Date;
  userId: string;
}
const isSaving = ref(false)

//Voralge für neuen Termin, mit Standardwerten
const createTerminTemplate = () => ({
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  category: 'Vorlesung' as TerminCategory
})

const newTermin = reactive(createTerminTemplate())
//Speichern

async function addTermin() {
  if (!newTermin.title || !newTermin.date || !newTermin.time) {
    alert('Bitte Titel, Datum und Uhrzeit eingeben.')
    return
  }
  isSaving.value = true
  try {

    const res = await authStore.fetchWithAuth('/termine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTermin)
    })
    if (!res.ok) throw new Error('Fehler beim Speichern')
    Object.assign(newTermin, createTerminTemplate())
    await loadTermine()
  } catch (error) {
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

const termine = ref<Termin[]>([])
const loading = ref(true)

// Funktion zum Laden der Termine aus dem Backend
async function loadTermine() {
  loading.value = true
  try {
    const res = await authStore.fetchWithAuth('/termine')
    if (!res.ok) throw new Error('Fehler beim Laden der Termine')
    termine.value = await res.json()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
// Hilfsfunktion zum Formatieren von Datum und Uhrzeit
function formatTerminDate(dateStr: string, timeStr: string): string {
  try {
    const date = new Date(`${dateStr}T${timeStr}`)
    return date.toLocaleString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' Uhr'
  } catch {
    return "Ungültiges Datum"
  }
}

// Termine beim Laden der Seite abrufen
onMounted(() => loadTermine())

// Termin löschen
async function deleteTermin(id: string) {
  try {
    const res = await authStore.fetchWithAuth(`/termine/${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Fehler beim Löschen')
    await loadTermine() // Liste neu laden
  } catch (error) {
    console.error(error)
  }
}
// Termin bearbeiten 
function editTermin(termin: Termin) {
  Object.assign(newTermin, {
    title: termin.title,
    description: termin.description || '',
    date: termin.date,
    time: termin.time,
    category: termin.category
  })
}
</script>
