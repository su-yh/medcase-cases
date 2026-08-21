import request from '@/utils/request'

export async function uploadCaseAttachment(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await request({
    url: '/common/upload',
    method: 'post',
    data: formData
  })
  return {
    fileName: response.fileName,
    originalFilename: response.originalFilename,
    url: response.url
  }
}

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
  }).then(normalizeCasePage)
}

export function getCaseDetail(id) {
  return request({
    url: `/doctor/cases/${id}`,
    method: 'get'
  }).then(normalizeCase)
}

function normalizeCasePage(page) {
  return {
    ...page,
    list: (page?.list || []).map(normalizeCase)
  }
}

function normalizeCase(caseItem) {
  return {
    ...caseItem,
    attachments: caseItem?.attachments || []
  }
}
