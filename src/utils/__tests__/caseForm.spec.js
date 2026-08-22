import { describe, expect, it } from 'vitest'

describe('case form helpers', () => {
  it('uses a 50 MB attachment size limit', async () => {
    const { MAX_CASE_ATTACHMENT_SIZE_MB } = await import('@/utils/caseForm')

    expect(MAX_CASE_ATTACHMENT_SIZE_MB).toBe(50)
  })

  it('normalizes case details into editable form data', async () => {
    const { normalizeCaseFormData } = await import('@/utils/caseForm')
    const attachment = {
      url: '/uploads/report.pdf',
      originalFilename: 'report.pdf'
    }

    expect(normalizeCaseFormData({
      title: '病例标题',
      remark: '病例备注',
      attachments: [attachment]
    })).toEqual({
      title: '病例标题',
      remark: '病例备注',
      attachments: [{
        uid: 'existing-/uploads/report.pdf',
        name: 'report.pdf',
        raw: null,
        uploading: false,
        attachment
      }]
    })
  })

  it('builds a payload from uploaded attachments only', async () => {
    const { buildCasePayload } = await import('@/utils/caseForm')
    const attachment = { url: '/uploads/report.pdf' }

    expect(buildCasePayload(
      { title: '病例标题', remark: '病例备注' },
      [
        { uploading: false, attachment },
        { uploading: true, attachment: null }
      ]
    )).toEqual({
      title: '病例标题',
      remark: '病例备注',
      attachments: [attachment]
    })
  })

  it('adds the case id when saving an existing draft', async () => {
    const { addCaseIdToPayload } = await import('@/utils/caseForm')

    expect(addCaseIdToPayload({
      title: '病例标题',
      remark: '病例备注',
      attachments: []
    }, 42)).toEqual({
      id: 42,
      title: '病例标题',
      remark: '病例备注',
      attachments: []
    })
  })
})
