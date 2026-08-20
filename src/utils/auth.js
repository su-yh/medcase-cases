const TOKEN_KEY = 'doctor_token'
let memoryToken = ''

function hasLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getToken() {
  if (hasLocalStorage()) {
    return window.localStorage.getItem(TOKEN_KEY) || ''
  }
  return memoryToken
}

export function setToken(token) {
  if (hasLocalStorage()) {
    window.localStorage.setItem(TOKEN_KEY, token)
    return
  }
  memoryToken = token || ''
}

export function clearToken() {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(TOKEN_KEY)
    return
  }
  memoryToken = ''
}
