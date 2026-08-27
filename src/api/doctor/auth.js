import request from '@/utils/request'

export function getCaptcha() {
  return request({
    url: '/captchaImage',
    method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/biz/doctor-auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/biz/doctor-auth/register',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/biz/doctor-auth/logout',
    method: 'post'
  })
}

export function deleteAccount() {
  return request({
    url: '/biz/doctor-auth/account',
    method: 'delete'
  })
}
