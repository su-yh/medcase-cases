import { describe, expect, it, vi } from 'vitest'

describe('doctor auth api', () => {
  it('uses the biz doctor auth routes', async () => {
    const request = vi.fn().mockResolvedValue({})
    vi.doMock('@/utils/request', () => ({ default: request }))
    const { login, register, logout } = await import('@/api/doctor/auth')

    await login({ username: 'doctor01' })
    await register({ username: 'doctor01' })
    await logout()

    expect(request).toHaveBeenNthCalledWith(1, {
      url: '/biz/doctor-auth/login',
      method: 'post',
      data: { username: 'doctor01' }
    })
    expect(request).toHaveBeenNthCalledWith(2, {
      url: '/biz/doctor-auth/register',
      method: 'post',
      data: { username: 'doctor01' }
    })
    expect(request).toHaveBeenNthCalledWith(3, {
      url: '/biz/doctor-auth/logout',
      method: 'post'
    })
  })
})
