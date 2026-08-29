import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import {
  canAccessDoctorBusiness,
  canVisitDoctorProfile,
  getDoctorLandingPath
} from '@/router/access'
import useUserStore from '@/stores/user'
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
    path: '/profile',
    name: 'DoctorProfile',
    component: () => import('@/views/profile/DoctorProfileView.vue'),
    meta: {
      title: '资料提交',
      requiresAuth: true
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  document.title = buildTitle(to.meta?.title)

  const userStore = useUserStore()
  const token = userStore.token || getToken()
  if (!token) {
    if (!to.meta?.requiresAuth) {
      return true
    }
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (!userStore.userInfo) {
    try {
      await userStore.loadProfile()
    } catch {
      userStore.clearSession()
      return {
        path: '/login',
        query: {
          redirect: to.fullPath
        }
      }
    }
  }

  const status = userStore.userInfo?.status
  if (to.path === '/login' || to.path === '/register') {
    return getDoctorLandingPath(status)
  }

  if (to.path === '/profile') {
    if (canVisitDoctorProfile(status)) {
      return true
    }
    return canAccessDoctorBusiness(status) ? '/home' : '/login'
  }

  if (to.meta?.requiresAuth && !canAccessDoctorBusiness(status)) {
    return '/profile'
  }

  return true
})

export default router
