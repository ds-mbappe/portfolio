import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Home from './views/Home.vue'
import Boot from './views/Boot.vue'

const routes = [
  { path: '/', name: 'boot', component: Boot },
  { path: '/login', name: 'login', component: Login },
  { path: '/home', name: 'home', component: Home },

  { path: '/:pathMatch(.*)*', redirect: { name: 'boot' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to, from) => {
  const initialLoad = from.matched.length === 0
  if (initialLoad && to.name !== 'boot') {
    return { name: 'boot', replace: true }
  }
})

// router.afterEach((to, from) => {
//   const toRoute = to.name
//   const fromRoute = from.name

//   if (toRoute === 'home' && fromRoute === 'login') {
//     to.meta.transition = 'slide-up'
//   }
// })

export default router
