import axios from 'axios'
import { ElMessage } from 'element-plus'
import { clearToken, getToken } from './auth'
import { getHttpStatusMessage, unwrapResponse } from './response'

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

function handleUnauthorized() {
  clearToken()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

service.interceptors.response.use(
  (response) => {
    try {
      return unwrapResponse(response.data)
    } catch (error) {
      if (error.code === 401) {
        handleUnauthorized()
      }
      ElMessage.error(error.message || '请求失败')
      return Promise.reject(error)
    }
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.msg || (status
      ? getHttpStatusMessage(status)
      : error.message || '请求失败')
    if (status === 401 || error.response?.data?.code === 401) {
      handleUnauthorized()
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
