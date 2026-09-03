import request from '@/utils/request'

export function getMyProfile() {
  return request({
    url: '/biz/user-profile',
    method: 'get'
  })
}

export function submitProfile(data) {
  return request({
    url: '/biz/user-profile',
    method: 'post',
    data
  })
}

export function updateProfilePhone(data) {
  return request({
    url: '/biz/user-profile/phone',
    method: 'put',
    data
  })
}

export function updateProfilePassword(data) {
  return request({
    url: '/biz/user-profile/password',
    method: 'put',
    data
  })
}

export function uploadProfileAttachment(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/file/upload',
    method: 'post',
    params: { business: 'profile' },
    data: formData
  })
}
