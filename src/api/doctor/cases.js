import request from '@/utils/request'

export function submitCase(data) {
  return request({
    url: '/doctor/cases',
    method: 'post',
    data
  })
}

export function getCasePage(params) {
  return request({
    url: '/doctor/cases',
    method: 'get',
    params
  })
}

export function getCaseDetail(id) {
  return request({
    url: `/doctor/cases/${id}`,
    method: 'get'
  })
}
