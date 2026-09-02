import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('user supplier api', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('loads enabled supplier options', async () => {
    const { getSupplierOptions } = await import('@/api/user/supplier')

    getSupplierOptions()

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/supplier/options',
      method: 'get'
    })
  })
})
