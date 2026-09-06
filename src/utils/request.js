import axios from 'axios'
import { ElMessage } from 'element-plus'
import { clearToken, getToken } from './auth'
import { getHttpStatusMessage, USER_NOT_LOGIN_CODE, unwrapResponse } from './response'

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
  const loginPath = `${import.meta.env.BASE_URL}login`
  if (window.location.pathname !== loginPath) {
    window.location.href = loginPath
  }
}

function isBinaryResponse(response) {
  const responseType = response?.config?.responseType
  return responseType === 'blob' || responseType === 'arraybuffer'
}

service.interceptors.response.use(
  (response) => {
    if (isBinaryResponse(response)) {
      return response.data
    }

    try {
      return unwrapResponse(response.data)
    } catch (error) {
      if (error.code === USER_NOT_LOGIN_CODE) {
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
    if (status === 401 || error.response?.data?.code === USER_NOT_LOGIN_CODE) {
      handleUnauthorized()
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
