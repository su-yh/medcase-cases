import request from '@/utils/request'

export function getSupplierOptions() {
  return request({
    url: '/biz/supplier/options',
    method: 'get'
  })
}
