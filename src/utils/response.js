export function unwrapResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('请求失败')
  }

  if (payload.code === 0) {
    return payload.data
  }

  const error = new Error(payload.msg || '请求失败')
  error.code = payload.code
  throw error
}
