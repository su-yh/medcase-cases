import request from '@/utils/request'

export function getCaptcha() {
  return request({
    url: '/captchaImage',
    method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/biz/user-auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/biz/user-auth/register',
    method: 'post',
    data
  })
}

export function sendRegisterSmsCode(phone) {
  return request({
    url: '/biz/user-auth/register/sms-code',
    method: 'post',
    data: { phone }
  })
}

export function getSupplierOptions() {
  return request({
    url: '/biz/supplier/options',
    method: 'get'
  })
}

export function uploadCaseRegistrationAttachment(file, userType) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/file/upload/case-register',
    method: 'post',
    params: { userType },
    data: formData
  })
}

export function logout() {
  return request({
    url: '/biz/user-auth/logout',
    method: 'post'
  })
}

export function deleteAccount() {
  return request({
    url: '/biz/user-auth/account',
    method: 'delete'
  })
}
