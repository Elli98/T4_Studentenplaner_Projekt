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

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { reactive, ref } from 'vue'


const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}

type TerminCategory = "Vorlesung" | "Abgabe" | "Prüfung" | "Freizeit"

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
   
  } catch (error) {
    console.error(error)
  } finally {
    isSaving.value = false
  }
}


</script>
