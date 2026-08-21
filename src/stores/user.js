import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, register as registerApi } from '@/api/doctor/auth'
import { clearToken, getToken, setToken } from '@/utils/auth'

const useUserStore = defineStore('doctor-user', {
  state: () => ({
    token: getToken(),
    userInfo: null
  }),
  actions: {
    async login(payload) {
      const token = await loginApi(payload)
      this.token = token
      setToken(token)
      return token
    },
    async register(payload) {
      return registerApi(payload)
    },
    async logout() {
      try {
        await logoutApi()
      } catch {
        // Local logout should still complete when the remote session is already invalid.
      } finally {
        this.token = ''
        this.userInfo = null
        clearToken()
      }
    }
  }
})

export default useUserStore
