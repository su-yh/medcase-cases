import axios from 'axios'
import { ElMessage } from 'element-plus'
import { clearToken, getToken } from './auth'
import { unwrapResponse } from './response'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    try {
      return unwrapResponse(response.data)
    } catch (error) {
      ElMessage.error(error.message || '请求失败')
      return Promise.reject(error)
    }
  },
  (error) => {
    const message = error.response?.data?.msg || error.message || '请求失败'
    if (error.response?.status === 401) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
