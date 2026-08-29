import request from '@/utils/request'

export function getMyProfile() {
  return request({
    url: '/biz/doctor-profile',
    method: 'get'
  })
}

export function submitProfile(data) {
  return request({
    url: '/biz/doctor-profile',
    method: 'post',
    data
  })
}

export function uploadProfileAttachment(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/file/upload',
    method: 'post',
    params: { business: 'doctor-register' },
    data: formData
  })
}
