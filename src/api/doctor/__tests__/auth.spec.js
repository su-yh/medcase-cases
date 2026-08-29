import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('doctor auth api', () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({})
  })

  it('uses the biz doctor auth routes', async () => {
    const { login, register, logout, deleteAccount } = await import('@/api/doctor/auth')

    await login({ username: 'doctor01' })
    await register({
      username: 'doctor01',
      password: 'secret123',
      phone: '13800000000',
      nickName: '张医生',
      sex: '1',
      idCardNumber: '110101199001011234',
      title: '主治医师',
      inviteCode: '9999',
      idCardFront: { filePath: 'front.png' },
      idCardBack: { filePath: 'back.png' },
      qualificationCertificate: { filePath: 'qualification.png' }
    })
    await logout()
    await deleteAccount()

    expect(requestMock).toHaveBeenNthCalledWith(1, {
      url: '/biz/doctor-auth/login',
      method: 'post',
      data: { username: 'doctor01' }
    })
    const registerRequest = requestMock.mock.calls[1][0]
    expect(registerRequest.url).toBe('/biz/doctor-auth/register')
    expect(registerRequest.method).toBe('post')
    expect(registerRequest.data).toEqual({
      username: 'doctor01',
      password: 'secret123',
      phone: '13800000000',
      nickName: '张医生',
      sex: '1',
      idCardNumber: '110101199001011234',
      title: '主治医师',
      inviteCode: '9999',
      idCardFront: { filePath: 'front.png' },
      idCardBack: { filePath: 'back.png' },
      qualificationCertificate: { filePath: 'qualification.png' }
    })
    expect(requestMock).toHaveBeenNthCalledWith(3, {
      url: '/biz/doctor-auth/logout',
      method: 'post'
    })
    expect(requestMock).toHaveBeenNthCalledWith(4, {
      url: '/biz/doctor-auth/account',
      method: 'delete'
    })
  })

  it('uploads doctor registration attachments through the anonymous route', async () => {
    requestMock.mockResolvedValue({ filePath: 'doctor-register/front.png' })
    const { uploadDoctorRegistrationAttachment } = await import('@/api/doctor/auth')

    await uploadDoctorRegistrationAttachment(
      new Blob(['front'], { type: 'image/png' })
    )

    expect(requestMock).toHaveBeenCalledTimes(1)
    const requestConfig = requestMock.mock.calls[0][0]
    expect(requestConfig.url).toBe('/file/upload/doctor-register')
    expect(requestConfig.method).toBe('post')
    expect(requestConfig.data).toBeInstanceOf(FormData)
    expect(requestConfig.data.get('file')).toBeInstanceOf(Blob)
  })
})
