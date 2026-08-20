import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { buildTitle } from '@/utils/title'

const routes = [
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
    redirect: '/cases'
  },
  {
    path: '/',
    component: () => import('@/layouts/DoctorLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/cases'
      },
      {
        path: 'cases',
        name: 'CaseCenter',
        component: () => import('@/views/cases/CaseCenterView.vue'),
        meta: {
          title: '病例中心'
        }
      },
      {
        path: 'cases/submit',
        name: 'CaseSubmit',
        component: () => import('@/views/cases/SubmitCaseView.vue'),
        meta: {
          title: '提交病例'
        }
      }
    ]
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
