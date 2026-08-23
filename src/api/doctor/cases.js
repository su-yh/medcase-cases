import request from '@/utils/request'

export async function uploadCaseAttachments(files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  const response = await request({
    url: '/common/uploads',
    method: 'post',
    data: formData
  })
  return response.map(file => ({
    url: file.url,
    newFileName: file.newFileName,
    originalFilename: file.originalFilename
  }))
}

export function submitCase(data) {
  return request({
    url: '/biz/doctor/cases',
    method: 'post',
    data
  })
}

export function saveDraftCase(data) {
  return request({
    url: '/biz/doctor/cases/draft',
    method: 'post',
    data
  })
}

export function getCasePage(params) {
  return request({
    url: '/biz/doctor/cases',
    method: 'get',
    params
  }).then(normalizeCasePage)
}

export function getCaseDetail(id) {
  return request({
    url: `/biz/doctor/cases/${id}`,
    method: 'get'
  }).then(normalizeCase)
}

export function deleteCase(id) {
  return request({
    url: `/biz/doctor/cases/${id}`,
    method: 'delete'
  })
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
