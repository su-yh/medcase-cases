import axios from 'axios'
import request from '@/utils/request'

export async function getCaptcha() {
  const response = await axios.get(`${import.meta.env.VITE_APP_BASE_API}/captchaImage`)
  return response.data
}

export function login(data) {
  return request({
    url: '/biz/doctor/auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/biz/doctor/auth/register',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/biz/doctor/auth/logout',
    method: 'post'
  })
}
