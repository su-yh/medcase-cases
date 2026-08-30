import { describe, expect, it } from 'vitest'

describe('case form helpers', () => {
  it('uses a 50 MB attachment size limit', async () => {
    const { MAX_CASE_ATTACHMENT_SIZE_MB } = await import('@/utils/caseForm')

    expect(MAX_CASE_ATTACHMENT_SIZE_MB).toBe(50)
  })

  it('normalizes case details into editable form data', async () => {
    const { normalizeCaseFormData } = await import('@/utils/caseForm')
    const attachment = {
      filePath: '20260827/report.pdf',
      originalFilename: 'report.pdf'
    }

    expect(normalizeCaseFormData({
      caseName: '病例名称',
      content: '病例内容',
      attachments: [attachment]
    })).toEqual({
      caseName: '病例名称',
      content: '病例内容',
      attachments: [{
      uid: 'existing-20260827/report.pdf',
        name: 'report.pdf',
        raw: null,
        uploading: false,
        attachment
      }]
    })
  })

  it('builds a payload from uploaded attachments only', async () => {
    const { buildCasePayload } = await import('@/utils/caseForm')
    const attachment = { filePath: '20260827/report.pdf' }

    expect(buildCasePayload(
      { caseName: '病例名称', content: '病例内容' },
      [
        { uploading: false, attachment },
        { uploading: true, attachment: null }
      ]
    )).toEqual({
      caseName: '病例名称',
      content: '病例内容',
      attachments: [attachment]
    })
  })

  it('adds the case id when saving an existing draft', async () => {
    const { addCaseIdToPayload } = await import('@/utils/caseForm')

    expect(addCaseIdToPayload({
      caseName: '病例名称',
      content: '病例内容',
      attachments: []
    }, 42)).toEqual({
      id: 42,
      caseName: '病例名称',
      content: '病例内容',
      attachments: []
    })
  })
})
