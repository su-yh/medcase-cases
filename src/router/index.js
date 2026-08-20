import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/HomeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
