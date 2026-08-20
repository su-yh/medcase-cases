import { describe, expect, it } from 'vitest'

describe('auth utils', () => {
  it('stores and clears token', async () => {
    const { clearToken, getToken, setToken } = await import('@/utils/auth')

    clearToken()
    setToken('doctor-token')
    expect(getToken()).toBe('doctor-token')
    clearToken()
    expect(getToken()).toBe('')
  })
})
