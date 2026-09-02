import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_TYPE } from '@/constants/user'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('user auth api', () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({})
  })

  it('uses the biz case auth routes', async () => {
    const {
      login,
      register,
      sendRegisterSmsCode,
      logout,
      deleteAccount,
      getSupplierOptions
    } = await import('@/api/user/auth')

    await login({ username: 'doctor01', userType: USER_TYPE.DOCTOR })
    await sendRegisterSmsCode('13800000000')
    await getSupplierOptions()
    await register({
      username: 'doctor01',
      password: 'secret123',
      phone: '13800000000',
      userType: USER_TYPE.DOCTOR,
      nickName: '张医生',
      sex: '1',
      idCardNumber: '110101199001011234',
      title: '主治医师',
      supplierId: 1,
      smsCode: '123456',
      idCardFront: { filePath: 'front.png' },
      idCardBack: { filePath: 'back.png' },
      qualificationCertificate: { filePath: 'qualification.png' }
    })
    await logout()
    await deleteAccount()

    expect(requestMock).toHaveBeenNthCalledWith(1, {
      url: '/biz/user-auth/login',
      method: 'post',
      data: { username: 'doctor01', userType: USER_TYPE.DOCTOR }
    })
    expect(requestMock).toHaveBeenNthCalledWith(2, {
      url: '/biz/user-auth/register/sms-code',
      method: 'post',
      data: { phone: '13800000000' }
    })
    expect(requestMock).toHaveBeenNthCalledWith(3, {
      url: '/biz/supplier/options',
      method: 'get'
    })
    const registerRequest = requestMock.mock.calls[3][0]
    expect(registerRequest.url).toBe('/biz/user-auth/register')
    expect(registerRequest.method).toBe('post')
    expect(registerRequest.data).toEqual({
      username: 'doctor01',
      password: 'secret123',
      phone: '13800000000',
      userType: USER_TYPE.DOCTOR,
      nickName: '张医生',
      sex: '1',
      idCardNumber: '110101199001011234',
      title: '主治医师',
      supplierId: 1,
      smsCode: '123456',
      idCardFront: { filePath: 'front.png' },
      idCardBack: { filePath: 'back.png' },
      qualificationCertificate: { filePath: 'qualification.png' }
    })
    expect(requestMock).toHaveBeenNthCalledWith(5, {
      url: '/biz/user-auth/logout',
      method: 'post'
    })
    expect(requestMock).toHaveBeenNthCalledWith(6, {
      url: '/biz/user-auth/account',
      method: 'delete'
    })
  })

  it('uploads user registration attachments through the anonymous route', async () => {
    requestMock.mockResolvedValue({ filePath: 'case-register/front.png' })
    const { uploadCaseRegistrationAttachment } = await import('@/api/user/auth')

    await uploadCaseRegistrationAttachment(
      new Blob(['front'], { type: 'image/png' }),
      USER_TYPE.DOCTOR
    )

    expect(requestMock).toHaveBeenCalledTimes(1)
    const requestConfig = requestMock.mock.calls[0][0]
    expect(requestConfig.url).toBe('/file/upload/case-register')
    expect(requestConfig.method).toBe('post')
    expect(requestConfig.params).toEqual({ userType: USER_TYPE.DOCTOR })
    expect(requestConfig.data).toBeInstanceOf(FormData)
    expect(requestConfig.data.get('file')).toBeInstanceOf(Blob)
  })
})
