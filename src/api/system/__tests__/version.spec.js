import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('system version api', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('loads backend version through the system version endpoint', async () => {
    const { getSystemVersion } = await import('@/api/system/version')

    getSystemVersion()

    expect(requestMock).toHaveBeenCalledWith({
      url: '/system/version',
      method: 'get'
    })
  })
})
