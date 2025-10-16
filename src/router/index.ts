import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/router/views/Login.vue'
import Home from '@/router/views/Home.vue'
import Boot from '@/router/views/Boot.vue'
import ThreeScene from '@/router/views/ThreeScene.vue'

const routes = [
  { 
    path: '/', 
    name: 'three_view', 
    component: ThreeScene,
    // Pass which internal route to show
    props: { internalRoute: '/home' }
  },
  { path: '/boot', name: 'boot', component: Boot },
  { path: '/login', name: 'login', component: Login },
  { path: '/home', name: 'home', component: Home },

  { path: '/:pathMatch(.*)*', redirect: { name: 'boot' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// router.beforeEach((to, from) => {
//   const initialLoad = from.matched.length === 0
//   if (initialLoad && to.name !== 'boot') {
//     return { name: 'boot', replace: true }
//   }
// })

// router.afterEach((to, from) => {
//   const toRoute = to.name
//   const fromRoute = from.name

//   if (toRoute === 'home' && fromRoute === 'login') {
//     to.meta.transition = 'slide-up'
//   }
// })

export default router
