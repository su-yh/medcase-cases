import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi } from '@/api/doctor/auth'
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
    logout() {
      this.token = ''
      this.userInfo = null
      clearToken()
    }
  }
})

export default useUserStore
