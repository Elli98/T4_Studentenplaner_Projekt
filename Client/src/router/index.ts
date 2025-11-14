import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/loginView.vue'
import { useAuthStore } from '@/stores/authStore'

// Router mit History-Modus erstellen
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/studyplan',
      name: 'studyplan',
      // Lazy-Loading: wird nur geladen wenn Route aufgerufen wird
      component: () => import('../views/studentenplanerView.vue'),
      meta: { requiresAuth: true } // nur für eingeloggte User
    }
  ]
})

//  Login Status vor jedem Seitenwechsel prüfen
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' }) // nicht eingeloggt, zurück zum Login
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'studyplan' }) // eingeloggt, nicht zurück zum Login
  } else {
    next()  //alles passt, weiter zur Route
  }
})

export default router
