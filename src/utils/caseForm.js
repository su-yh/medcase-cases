export const MAX_CASE_ATTACHMENT_SIZE_MB = 50

export function normalizeCaseFormData(caseItem = {}) {
  return {
    caseName: caseItem.caseName || '',
    content: caseItem.content || '',
    attachments: (caseItem.attachments || []).map((attachment, index) => ({
      uid: `existing-${attachment.filePath || index}`,
      name: attachment.originalFilename || attachment.filePath || `附件${index + 1}`,
      raw: null,
      uploading: false,
      attachment
    }))
  }
}

export function buildCasePayload(form, attachmentFiles) {
  return {
    caseName: form.caseName,
    content: form.content,
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
