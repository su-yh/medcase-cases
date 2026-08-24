import { describe, expect, it, vi } from 'vitest'
import { previewAttachment } from '@/utils/attachment'

describe('previewAttachment', () => {
  it('opens an attachment URL in a new tab', () => {
    const openWindow = vi.fn()

    previewAttachment({ url: 'https://files.example.com/report.pdf' }, openWindow)

    expect(openWindow).toHaveBeenCalledWith(
      'https://files.example.com/report.pdf',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('does not open a window when the attachment URL is missing', () => {
    const openWindow = vi.fn()

    previewAttachment({ originalFilename: 'report.pdf' }, openWindow)

    expect(openWindow).not.toHaveBeenCalled()
  })
})
