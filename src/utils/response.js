const HTTP_STATUS_MESSAGES = {
  400: '请求参数错误',
  401: '登录状态已过期，请重新登录',
  403: '没有权限访问该资源',
  404: '请求资源不存在',
  405: '请求方法不支持',
  408: '请求超时',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂不可用',
  504: '网关请求超时'
}

export function getHttpStatusMessage(status) {
  return HTTP_STATUS_MESSAGES[status] || (status >= 500 ? '服务器异常，请稍后再试' : '请求失败，请稍后再试')
}

export function unwrapResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('请求失败')
  }

  if (payload.code === 0 || payload.code === 200) {
    return payload.data
  }

  const error = new Error(payload.msg || '请求失败')
  error.code = payload.code
  throw error
}
