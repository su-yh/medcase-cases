import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('doctor case api', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('saves a new case draft through the draft endpoint', async () => {
    const { saveDraftCase } = await import('@/api/doctor/cases')
    const payload = {
      title: '待完善病例',
      remark: '稍后补充',
      attachments: []
    }

    saveDraftCase(payload)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/doctor/cases/draft',
      method: 'post',
      data: payload
    })
  })

  it('deletes a case through the case resource endpoint', async () => {
    const { deleteCase } = await import('@/api/doctor/cases')

    deleteCase(42)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/doctor/cases/42',
      method: 'delete'
    })
  })

  it('loads a case detail through the case resource endpoint', async () => {
    const { getCaseDetail } = await import('@/api/doctor/cases')

    requestMock.mockResolvedValueOnce({})
    getCaseDetail(42)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/doctor/cases/42',
      method: 'get'
    })
  })

  it('submits an edited draft with its id', async () => {
    const { submitCase } = await import('@/api/doctor/cases')
    const payload = {
      id: 42,
      title: '病例',
      remark: '',
      attachments: []
    }

    submitCase(payload)

    expect(requestMock).toHaveBeenCalledWith({
      url: '/doctor/cases',
      method: 'post',
      data: payload
    })
  })
})
