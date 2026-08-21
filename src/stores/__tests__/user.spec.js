import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import useUserStore from '@/stores/user'
import { clearToken, getToken, setToken } from '@/utils/auth'
import { logout as logoutApi } from '@/api/doctor/auth'

vi.mock('@/api/doctor/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn()
}))

describe('doctor user store', () => {
  afterEach(() => {
    clearToken()
    vi.clearAllMocks()
  })

  it('logs out remotely and clears local token state', async () => {
    setActivePinia(createPinia())
    logoutApi.mockResolvedValue(undefined)
    setToken('doctor-token')
    const store = useUserStore()
    store.token = 'doctor-token'

    await store.logout()

    expect(logoutApi).toHaveBeenCalledTimes(1)
    expect(store.token).toBe('')
    expect(getToken()).toBe('')
  })

  it('clears local token state when remote logout fails', async () => {
    setActivePinia(createPinia())
    logoutApi.mockRejectedValue(new Error('expired token'))
    setToken('doctor-token')
    const store = useUserStore()
    store.token = 'doctor-token'

    await expect(store.logout()).resolves.toBeUndefined()

    expect(logoutApi).toHaveBeenCalledTimes(1)
    expect(store.token).toBe('')
    expect(getToken()).toBe('')
  })
})
