import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('doctor profile api', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('loads the current doctor profile', async () => {
    const { getMyProfile } = await import('@/api/doctor/profile')

    getMyProfile()

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/doctor-profile',
      method: 'get'
    })
  })

  it('submits the current doctor profile', async () => {
    const { submitProfile } = await import('@/api/doctor/profile')
    const payload = {
      name: '张医生',
      phone: '13800000000'
    }

    submitProfile(payload)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/doctor-profile',
      method: 'post',
      data: payload
    })
  })
})
