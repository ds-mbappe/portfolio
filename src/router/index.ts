import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Home from './views/Home.vue'

const routes = [
  { path: '/', name: 'login', component: Login },
  { path: '/home', name: 'home', component: Home },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to, from) => {
  const toRoute = to.name
  const fromRoute = from.name

  if (toRoute === 'home' && !fromRoute) {
    return { name: 'login' }
  }
})

router.afterEach((to, from) => {
  const toRoute = to.name
  const fromRoute = from.name

  if (toRoute === 'home' && fromRoute === 'login') {
    to.meta.transition = 'slide-up'
  }
})

export default router
