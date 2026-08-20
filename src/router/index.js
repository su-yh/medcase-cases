import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { buildTitle } from '@/utils/title'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: '注册'
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/HomeView.vue'),
    meta: {
      title: '首页',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  document.title = buildTitle(to.meta?.title)

  const token = getToken()
  if (to.meta?.requiresAuth && !token) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (token && to.path === '/login') {
    return '/home'
  }

  return true
})

export default router
