import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('doctor case api', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('uploads each case attachment through the single-file storage endpoint', async () => {
    const { uploadCaseAttachments } = await import('@/api/doctor/cases')
    const files = [
      new File(['first'], 'first.pdf', { type: 'application/pdf' }),
      new File(['second'], 'second.pdf', { type: 'application/pdf' })
    ]
    requestMock
      .mockResolvedValueOnce({
        filePath: 'attachments/first.pdf',
        originalFilename: 'first.pdf'
      })
      .mockResolvedValueOnce({
        filePath: 'attachments/second.pdf',
        originalFilename: 'second.pdf'
      })

    const result = await uploadCaseAttachments(files)

    expect(requestMock).toHaveBeenCalledTimes(2)
    requestMock.mock.calls.forEach(([config], index) => {
      expect(config).toMatchObject({
        url: '/file/upload',
        method: 'post',
        params: { business: 'case' }
      })
      expect(config.data).toBeInstanceOf(FormData)
      expect(config.data.get('file')).toBe(files[index])
      expect(config.data.has('business')).toBe(false)
    })
    expect(result).toEqual([
      {
        filePath: 'attachments/first.pdf',
        originalFilename: 'first.pdf'
      },
      {
        filePath: 'attachments/second.pdf',
        originalFilename: 'second.pdf'
      }
    ])
  })

  it('saves a new case draft through the draft endpoint', async () => {
    const { saveDraftCase } = await import('@/api/doctor/cases')
    const payload = {
      caseName: '待完善病例',
      content: '稍后补充',
      attachments: []
    }

    saveDraftCase(payload)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/cases/draft',
      method: 'post',
      data: payload
    })
  })

  it('deletes a case through the case resource endpoint', async () => {
    const { deleteCase } = await import('@/api/doctor/cases')

    deleteCase(42)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/cases/42',
      method: 'delete'
    })
  })

  it('loads a case detail through the case resource endpoint', async () => {
    const { getCaseDetail } = await import('@/api/doctor/cases')

    requestMock.mockResolvedValueOnce({})
    getCaseDetail(42)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/cases/42',
      method: 'get'
    })
  })

  it('submits an edited draft with its id', async () => {
    const { submitCase } = await import('@/api/doctor/cases')
    const payload = {
      id: 42,
      caseName: '病例',
      content: '',
      attachments: []
    }

    submitCase(payload)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/biz/cases',
      method: 'post',
      data: payload
    })
  })
})
