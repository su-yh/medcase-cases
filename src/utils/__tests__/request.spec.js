import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosCreate, requestUse, responseUse } = vi.hoisted(() => {
  const requestUse = vi.fn()
  const responseUse = vi.fn()
  const axiosCreate = vi.fn(() => ({
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse }
    }
  }))
  return { axiosCreate, requestUse, responseUse }
})

vi.mock('axios', () => ({
  default: {
    create: axiosCreate
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

describe('request client', () => {
  beforeEach(() => {
    axiosCreate.mockClear()
    requestUse.mockClear()
    responseUse.mockClear()
  })

  it('returns binary responses without treating them as R payloads', async () => {
    await import('@/utils/request')
    const onFulfilled = responseUse.mock.calls[0][0]
    const blob = new Blob(['file content'])

    expect(onFulfilled({
      config: { responseType: 'blob' },
      data: blob
    })).toBe(blob)
  })
})
