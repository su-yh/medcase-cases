export const MAX_CASE_ATTACHMENT_SIZE_MB = 50

export function normalizeCaseFormData(caseItem = {}) {
  return {
    title: caseItem.title || '',
    remark: caseItem.remark || '',
    attachments: (caseItem.attachments || []).map((attachment, index) => ({
      uid: `existing-${attachment.url || index}`,
      name: attachment.originalFilename || attachment.newFileName || attachment.fileName || `附件${index + 1}`,
      raw: null,
      uploading: false,
      attachment
    }))
  }
}

export function buildCasePayload(form, attachmentFiles) {
  return {
    title: form.title,
    remark: form.remark,
    attachments: attachmentFiles
      .filter(file => file.attachment && !file.uploading)
      .map(file => file.attachment)
  }
}

export function addCaseIdToPayload(payload, id) {
  return {
    id,
    ...payload
  }
}
