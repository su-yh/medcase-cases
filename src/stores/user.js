import { defineStore } from 'pinia'
import {
  deleteAccount as deleteAccountApi,
  login as loginApi,
  logout as logoutApi,
  register as registerApi
} from '@/api/user/auth'
import { getMyProfile, submitProfile as submitProfileApi } from '@/api/user/profile'
import { clearToken, getToken, setToken } from '@/utils/auth'

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: null
  }),
  actions: {
    async login(payload) {
      const token = await loginApi(payload)
      this.token = token
      setToken(token)
      await this.loadProfile()
      return token
    },
    async loadProfile() {
      const profile = await getMyProfile()
      this.userInfo = profile
      return profile
    },
    async submitProfile(payload) {
      await submitProfileApi(payload)
      return this.loadProfile()
    },
    async register(payload) {
      return registerApi(payload)
    },
    async logout() {
      try {
        await logoutApi()
      } catch {
        // Local logout should still complete when the remote session is invalid.
      } finally {
        this.clearSession()
      }
    },
    async deleteAccount() {
      await deleteAccountApi()
      this.clearSession()
    },
    clearSession() {
      this.token = ''
      this.userInfo = null
      clearToken()
    }
  }
})

export default useUserStore
