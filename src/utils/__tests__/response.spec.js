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
})
