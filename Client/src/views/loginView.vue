<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Studentenplaner Login</h1>

      <div class="form-group">
        <label for="username">Benutzername</label>
        <input 
          id="username"
          v-model="username" 
          type="text" 
          placeholder="Benutzername" 
        />
      </div>

      <div class="form-group">
        <label for="password">Passwort</label>
        <input 
          id="password"
          v-model="password" 
          type="password" 
          placeholder="Passwort" 
        />
      </div>

      <button @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? 'Logge ein...' : 'Einloggen' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const username = ref('') 
const password = ref('') 
const errorMessage = ref('')
const isLoading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await authStore.login(username.value, password.value)
    router.push({ name: 'studyplan' })
  } catch (error) {
    errorMessage.value = 'Login fehlgeschlagen. Bitte prüfe deine Daten.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Zentrierung */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f4f8;
  padding: 1rem;
}

/* Breite Card mit anderer Farbe */
.login-card {
  background-color: #ffffff;
  width: 450px;
  padding: 2rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
}

.login-card h1 {
  color: #243446;
  margin-bottom: 0.5rem;
}

/* Input-Felder */
.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  margin-bottom: 0.3rem;
  font-weight: 500;
  color: #243446;
}

.form-group input {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}

.form-group input:focus {
  border-color: #57b657;
}

button {
  padding: 0.8rem;
  border: none;
  border-radius: 6px;
  background-color: #57b657;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background-color: #46964f;
}

button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.error {
  color: #e53935;
  font-weight: 500;
  text-align: center;
}
</style>
