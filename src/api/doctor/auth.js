import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/doctor/auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/doctor/auth/register',
    method: 'post',
    data
  })
}
