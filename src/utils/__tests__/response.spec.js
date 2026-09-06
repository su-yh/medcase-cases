import { describe, expect, it } from 'vitest'

describe('response utils', () => {
  it('unwraps success payload data', async () => {
    const { unwrapResponse } = await import('@/utils/response')

    expect(unwrapResponse({ code: 'OK', msg: '操作成功', data: 'token' })).toBe('token')
  })

  it('throws error message for failed payload', async () => {
    const { unwrapResponse } = await import('@/utils/response')

    expect(() => unwrapResponse({
      code: 'error.code.user.login.failed',
      msg: '医生账号不存在'
    })).toThrow('医生账号不存在')
  })

  it('preserves the unauthorized code for response interceptor handling', async () => {
    const { unwrapResponse } = await import('@/utils/response')

    expect.assertions(2)
    try {
      unwrapResponse({
        code: 'error.code.user.not.login',
        msg: '请求访问：/medcase/biz/cases，认证失败，无法访问系统资源'
      })
    } catch (error) {
      expect(error.message).toContain('认证失败')
      expect(error.code).toBe('error.code.user.not.login')
    }
  })

  it('maps common HTTP status codes to user-facing messages', async () => {
    const { getHttpStatusMessage } = await import('@/utils/response')

    expect(getHttpStatusMessage(401)).toBe('登录状态已过期，请重新登录')
    expect(getHttpStatusMessage(403)).toBe('没有权限访问该资源')
    expect(getHttpStatusMessage(404)).toBe('请求资源不存在')
    expect(getHttpStatusMessage(405)).toBe('请求方法不支持')
  })
})
