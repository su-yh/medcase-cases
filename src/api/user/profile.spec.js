import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('user profile api', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('loads the current user profile', async () => {
    const { getMyProfile } = await import('@/api/user/profile')

    getMyProfile()

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/user-profile',
      method: 'get'
    })
  })

  it('submits the current user profile', async () => {
    const { submitProfile } = await import('@/api/user/profile')
    const payload = {
      nickName: '张医生',
      sex: '1',
      phone: '13800000000',
      idCardNumber: '110101199001011234',
      title: '主治医师',
      idCardFront: { filePath: 'front.png' },
      idCardBack: { filePath: 'back.png' },
      qualificationCertificate: { filePath: 'qualification.png' }
    }

    submitProfile(payload)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/user-profile',
      method: 'post',
      data: payload
    })
  })

  it('uploads user profile attachments through the storage endpoint', async () => {
    const { uploadProfileAttachment } = await import('@/api/user/profile')
    const file = new Blob(['front'], { type: 'image/png' })

    uploadProfileAttachment(file)

    const requestConfig = requestMock.mock.calls[0][0]
    expect(requestConfig.url).toBe('/file/upload')
    expect(requestConfig.method).toBe('post')
    expect(requestConfig.params).toEqual({ business: 'case-register' })
    expect(requestConfig.data).toBeInstanceOf(FormData)
    expect(requestConfig.data.get('file')).toBeInstanceOf(Blob)
  })
})
