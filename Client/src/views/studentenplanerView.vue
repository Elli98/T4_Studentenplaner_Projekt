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
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>
