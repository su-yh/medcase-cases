import { describe, expect, it, vi } from 'vitest'

describe('doctor captcha api', () => {
  it('unwraps the captcha response through the shared request client', async () => {
    const request = vi.fn().mockResolvedValue({
      captchaEnabled: true,
      uuid: 'captcha-uuid',
      img: 'captcha-image'
    })
    vi.doMock('@/utils/request', () => ({ default: request }))

    const { getCaptcha } = await import('@/api/doctor/auth')
    const result = await getCaptcha()

    expect(request).toHaveBeenCalledWith({
      url: '/captchaImage',
      method: 'get'
    })
    expect(result).toEqual({
      captchaEnabled: true,
      uuid: 'captcha-uuid',
      img: 'captcha-image'
    })
  })
})
