import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import useUserStore from '@/stores/user'
import { clearToken, getToken, setToken } from '@/utils/auth'
import {
  deleteAccount as deleteAccountApi,
  login as loginApi,
  logout as logoutApi
} from '@/api/doctor/auth'
import { getMyProfile } from '@/api/doctor/profile'

vi.mock('@/api/doctor/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  deleteAccount: vi.fn()
}))

vi.mock('@/api/doctor/profile', () => ({
  getMyProfile: vi.fn(),
  submitProfile: vi.fn()
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

    await store.logout()

    expect(logoutApi).toHaveBeenCalledTimes(1)
    expect(store.token).toBe('')
    expect(getToken()).toBe('')
  })

  it('deletes the account and clears local token state', async () => {
    setActivePinia(createPinia())
    deleteAccountApi.mockResolvedValue(undefined)
    setToken('doctor-token')
    const store = useUserStore()
    store.token = 'doctor-token'

    await store.deleteAccount()

    expect(deleteAccountApi).toHaveBeenCalledTimes(1)
    expect(store.token).toBe('')
    expect(getToken()).toBe('')
  })

  it('loads and stores the doctor profile after login', async () => {
    setActivePinia(createPinia())
    loginApi.mockResolvedValue('doctor-token')
    getMyProfile.mockResolvedValue({
      id: 12,
      nickName: '张医生',
      phone: '13800000000',
      status: '5'
    })
    const store = useUserStore()

    await store.login({
      username: 'doctor01',
      password: 'secret123'
    })

    expect(store.token).toBe('doctor-token')
    expect(getToken()).toBe('doctor-token')
    expect(getMyProfile).toHaveBeenCalledTimes(1)
    expect(store.userInfo).toEqual({
      id: 12,
      nickName: '张医生',
      phone: '13800000000',
      status: '5'
    })
  })
})
