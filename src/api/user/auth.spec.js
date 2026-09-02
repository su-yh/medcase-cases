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
    const authApi = await import('@/api/user/auth')
    const {
      login,
      register,
      sendRegisterSmsCode,
      logout,
      deleteAccount
    } = authApi

    await login({ username: 'doctor01', userType: USER_TYPE.DOCTOR })
    await sendRegisterSmsCode('13800000000')
    await register({
      username: 'doctor01',
      password: 'secret123',
      phone: '13800000000',
      userType: USER_TYPE.DOCTOR,
      smsCode: '123456'
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
    const registerRequest = requestMock.mock.calls[2][0]
    expect(registerRequest.url).toBe('/biz/user-auth/register')
    expect(registerRequest.method).toBe('post')
    expect(registerRequest.data).toEqual({
      username: 'doctor01',
      password: 'secret123',
      phone: '13800000000',
      userType: USER_TYPE.DOCTOR,
      smsCode: '123456'
    })
    expect(requestMock).toHaveBeenNthCalledWith(4, {
      url: '/biz/user-auth/logout',
      method: 'post'
    })
    expect(requestMock).toHaveBeenNthCalledWith(5, {
      url: '/biz/user-auth/account',
      method: 'delete'
    })
  })

  it('does not expose the removed anonymous registration upload api', async () => {
    const { uploadCaseRegistrationAttachment } = await import('@/api/user/auth')

    expect(uploadCaseRegistrationAttachment).toBeUndefined()
  })
})
