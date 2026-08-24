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
