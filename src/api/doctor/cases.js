import request from '@/utils/request'

export async function uploadCaseAttachments(files) {
  const uploadedFiles = await Promise.all(files.map(file => {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/file/upload',
      method: 'post',
      params: { business: 'case' },
      data: formData
    })
  }))

  return uploadedFiles.map(file => ({
    filePath: file.filePath,
    originalFilename: file.originalFilename
  }))
}

export function submitCase(data) {
  return request({
    url: '/biz/cases',
    method: 'post',
    data
  })
}

export function saveDraftCase(data) {
  return request({
    url: '/biz/cases/draft',
    method: 'post',
    data
  })
}

export function getCasePage(params) {
  return request({
    url: '/biz/cases',
    method: 'get',
    params
  }).then(normalizeCasePage)
}

export function getCaseDetail(id) {
  return request({
    url: `/biz/cases/${id}`,
    method: 'get'
  }).then(normalizeCase)
}

export function deleteCase(id) {
  return request({
    url: `/biz/cases/${id}`,
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
