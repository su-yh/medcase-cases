import { describe, expect, it } from 'vitest'

describe('response utils', () => {
  it('unwraps success payload data', async () => {
    const { unwrapResponse } = await import('@/utils/response')

    expect(unwrapResponse({ code: 0, msg: '操作成功', data: 'token' })).toBe('token')
  })

  it('throws error message for failed payload', async () => {
    const { unwrapResponse } = await import('@/utils/response')

    expect(() => unwrapResponse({ code: 2000007, msg: '医生账号不存在' })).toThrow('医生账号不存在')
  })

  it('preserves the unauthorized code for response interceptor handling', async () => {
    const { unwrapResponse } = await import('@/utils/response')

    expect.assertions(2)
    try {
      unwrapResponse({
        code: 401,
        msg: '请求访问：/medcase/biz/cases，认证失败，无法访问系统资源'
      })
    } catch (error) {
      expect(error.message).toContain('认证失败')
      expect(error.code).toBe(401)
    }
  })
})
