import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadAttachment } from '@/utils/attachment'

const requestMock = vi.hoisted(() => vi.fn())

vi.mock('@/utils/request', () => ({
  default: requestMock
}))

describe('downloadAttachment', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('downloads an attachment through the authenticated storage endpoint', async () => {
    const blob = new Blob(['file content'], { type: 'application/pdf' })
    const click = vi.fn()
    const anchor = {
      href: '',
      download: '',
      click,
      remove: vi.fn()
    }
    const documentObject = {
      createElement: vi.fn(() => anchor),
      body: {
        appendChild: vi.fn()
      }
    }
    const urlObject = {
      createObjectURL: vi.fn(() => 'blob:attachment'),
      revokeObjectURL: vi.fn()
    }
    requestMock.mockResolvedValue(blob)

    await downloadAttachment(
      {
        filePath: 'attachments/report.pdf',
        originalFilename: 'report.pdf'
      },
      { documentObject, urlObject }
    )

    expect(requestMock).toHaveBeenCalledWith({
      url: '/file/download',
      method: 'get',
      params: {
        filePath: 'attachments/report.pdf',
        originalFilename: 'report.pdf'
      },
      responseType: 'blob'
    })
    expect(click).toHaveBeenCalled()
    expect(urlObject.createObjectURL).toHaveBeenCalledWith(blob)
    expect(urlObject.revokeObjectURL).toHaveBeenCalledWith('blob:attachment')
    expect(anchor.download).toBe('report.pdf')
  })

  it('uses the attachment file path and requested filename when downloading', async () => {
    requestMock.mockResolvedValue(new Blob(['file content']))

    await downloadAttachment(
      {
        filePath: '01-12/20260827/report.pdf',
        originalFilename: 'report.pdf'
      },
      {
        documentObject: {
          createElement: vi.fn(() => ({
            click: vi.fn(),
            remove: vi.fn()
          })),
          body: {
            appendChild: vi.fn()
          }
        },
        urlObject: {
          createObjectURL: vi.fn(() => 'blob:attachment'),
          revokeObjectURL: vi.fn()
        }
      }
    )

    expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({
      params: {
        filePath: '01-12/20260827/report.pdf',
        originalFilename: 'report.pdf'
      }
    }))
  })

  it('does not request a download when no file path exists', async () => {
    await downloadAttachment(
      { originalFilename: 'report.pdf' },
      {
        documentObject: {},
        urlObject: {}
      }
    )

    expect(requestMock).not.toHaveBeenCalled()
  })
})
