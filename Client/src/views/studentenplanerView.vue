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
    <div class="card countdown-card" v-if="countdownMessage">
        <h2>Nächster wichtiger Termin</h2>
        <p>{{ countdownMessage }}</p>
    </div>

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
            <option style="color: #6a8df0">Vorlesung</option>
            <option style="color: #d4af37">Abgabe</option>
            <option style="color: #ff0000">Prüfung</option>
            <option style="color: #57b657">Freizeit</option>
          </select>
        </div>

        <!--Eingabefeld für Beschreibugn-->
        <div class="form-group full-width">
          <label for="new-desc">Beschreibung</label>
          <textarea
            id="new-desc"
            v-model="newTermin.description"
            placeholder="Details zum Termin..."
            rows="3"></textarea>
        </div>
      </div>

       <button @click="editingTerminId ? saveTermin(editingTerminId) : addTermin()" :disabled="isSaving">
        {{ isSaving ? 'Speichert...' : (editingTerminId ? 'Termin aktualisieren' : 'Termin speichern') }}
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
        :class="['termin-row', getTerminClass(termin)]">

        <!--  Bearbeitung eines Termins -->
        <template v-if="editingTerminId === termin.id">
          <div class="edit-section">
            <input type="text" v-model="editTermin.title" placeholder="Titel" />
            <input type="date" v-model="editTermin.date" />
            <input type="time" v-model="editTermin.time" />
            <select v-model="editTermin.category">
              <option>Vorlesung</option>
              <option>Abgabe</option>
              <option>Prüfung</option>
              <option>Freizeit</option>
            </select>
            <textarea v-model="editTermin.description" placeholder="Beschreibung..." rows="2"></textarea>
          </div>
          <div class="row-actions">
            <button @click="saveTermin(termin.id)" class="save-btn">Speichern</button>
            <button @click="cancelEdit" class="cancel-btn">Abbrechen</button>
          </div>
        </template>
        
        <template v-else>
          <div class="termin-info">
            <div class="termin-left">
              <div class="category-mark"></div>
              <div>
                <h3>{{ termin.title }}</h3>
              <p v-if="termin.description">{{ termin.description }}</p>
              </div>
            </div>
            <div class="termin-right">
              <p>{{ formatTerminDate(termin.date, termin.time) }}</p>
              <p>{{ termin.category }}</p>
              <small>erstellt am {{ new Date(termin.createdAt).toLocaleDateString('de-DE') }}</small>
              <div class="row-actions">
                <button @click="toggleEdit(termin)" class="edit-btn">Bearbeiten</button>
                <button @click="deleteTermin(termin.id)" class="delete-btn">Löschen</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { reactive, ref, onMounted, computed } from 'vue'


const authStore = useAuthStore()

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

//Bearbeiten
const editingTerminId = ref<string | null>(null)
const editTermin = reactive({
  title: '',
  description: '',
  date: '',
  time: '',
  category: 'Vorlesung' as TerminCategory
})


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

function toggleEdit(termin: Termin) {
  editingTerminId.value = termin.id
  editTermin.title = termin.title
  editTermin.description = termin.description || ''
  editTermin.date = termin.date
  editTermin.time = termin.time
  editTermin.category = termin.category
}
function cancelEdit() {
  editingTerminId.value = null
}

async function saveTermin(id: string) {
  if (!editTermin.title || !editTermin.date || !editTermin.time) {
    alert('Titel, Datum und Uhrzeit dürfen nicht leer sein.')
    return
  }
  try {
    const res = await authStore.fetchWithAuth(`/termine/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editTermin)
    })
    if (!res.ok) throw new Error('Fehler beim Aktualisieren')
    cancelEdit()
    await loadTermine()
  } catch (error) {
    console.error(error)
  }
}

function handleLogout() {
  authStore.logout()
}

function getTerminClass(termin: Termin): string {
  return `category-${termin.category.toLowerCase()}`
}

//nächsten wichtigen Termin berechnen
const nextImportantTermin = computed(() => {
  // nur Prüfungen oder Abgaben berücksichtigen
  const wichtige = termine.value.filter(t =>
    t.category === "Prüfung" || t.category === "Abgabe"
  )
  // nach Datum sortieren
  wichtige.sort((a, b) =>
    new Date(`${a.date}T${a.time}`).getTime() -
    new Date(`${b.date}T${b.time}`).getTime()
  )
  return wichtige[0] || null
})
//Countdown-Nachricht
const countdownMessage = computed(() => {
  if (loading.value) return 'Lade Termine für Countdown...'
  if (!nextImportantTermin.value) {
    return 'Aktuell stehen keine Abgaben oder Prüfungen an.'
  }
  const termin = nextImportantTermin.value
  const terminDate = new Date(`${termin.date}T${termin.time}`)
  const diffMs = terminDate.getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const terminDatum = new Date(termin.date).toLocaleDateString('de-DE')

  if (diffDays > 1) return `Nächste ${termin.category} in ${diffDays} Tagen: ${termin.title} (${terminDatum})`
  if (diffDays === 1) return `Nächste ${termin.category} ist morgen: ${termin.title} (${terminDatum})`
  if (diffDays === 0) return `Nächste ${termin.category} ist heute: ${termin.title} (${terminDatum})`
  return ''
})

// Termine beim Laden der Seite abrufen
onMounted(() => loadTermine())
</script>


<style scoped>
.termin-container {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading,
.no-entries {
  text-align: center;
  font-style: italic;
  color: #666;
  margin-top: 1rem;
}

.termin-row {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e4e8f0;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  transition: background 0.2s ease;
}
.termin-row:hover {
  background: #f7f9ff;
}

.termin-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.termin-left {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.category-mark {
  width: 10px;
  border-radius: 6px;
  background: #ccc;
  margin-top: 0.3rem;
  min-height: 100px;
  flex-shrink: 0; 
}

.termin-left h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2f4f8f;
}
.termin-left .termin-desc {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.2rem;
}

.termin-right {
  text-align: right;
  min-width: 180px;
}
.termin-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}
.termin-cat {
  font-size: 0.85rem;
  color: #666;
}
.created-at {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.3rem;
}

.row-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.3rem;
  justify-content: flex-end;
}
.row-actions button {
  padding: 0.4rem 0.6rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
}
.edit-btn { background: #000000; color: #fff; }
.delete-btn { background: #a11515; color: #fff; }
.edit-btn:hover { background: #999999; }
.delete-btn:hover { background: #e14f4f; }

.edit-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.edit-section input,
.edit-section select,
.edit-section textarea {
  border: 1px solid #d0d4e4;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.9rem;
}
.row-actions .save-btn { background: #57b657; color: #fff; }
.row-actions .cancel-btn { background: #adb5bd; color: #fff; }

.category-vorlesung .category-mark { background: #6a8df0; }
.category-abgabe .category-mark { background: #fcdb70; }
.category-prüfung .category-mark,
.category-pruefung .category-mark { background: #ff0000; }
.category-freizeit .category-mark { background: #57b657; }

@media (max-width: 700px) {
  .termin-info {
    flex-direction: column;
    text-align: left;
  }
  .termin-right {
    text-align: left;
  }
}

/* Zentrierung der Begrüßung */
.user-info {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5rem;
  gap: 0.5rem;
}
.user-info span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #243446; 
}

.user-info .logout-btn {
  width: auto;
  background: #6c757d;
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.user-info .logout-btn:hover {
  background: #5a6268;
}
textarea {
  resize: none;
}
</style>