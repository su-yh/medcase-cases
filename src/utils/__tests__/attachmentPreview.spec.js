import { describe, expect, it } from 'vitest'
import {
  getAttachmentExtension,
  getAttachmentPreviewType
} from '@/utils/attachmentPreview'

describe('attachment preview helpers', () => {
  it('uses the original filename to identify the extension', () => {
    expect(getAttachmentExtension({
      filePath: 'case/20260828/file.bin',
      originalFilename: '病例报告.PDF'
    })).toBe('pdf')
  })

  it('falls back to the storage path when the original filename is absent', () => {
    expect(getAttachmentExtension({
      filePath: 'case/20260828/report.xlsx'
    })).toBe('xlsx')
  })

  it('maps supported attachment formats to preview types', () => {
    expect(getAttachmentPreviewType({ originalFilename: 'photo.jpg' })).toBe('image')
    expect(getAttachmentPreviewType({ originalFilename: 'report.pdf' })).toBe('pdf')
    expect(getAttachmentPreviewType({ originalFilename: 'report.docx' })).toBe('docx')
    expect(getAttachmentPreviewType({ originalFilename: 'report.xls' })).toBe('excel')
    expect(getAttachmentPreviewType({ originalFilename: 'report.pptx' })).toBe('pptx')
    expect(getAttachmentPreviewType({ originalFilename: 'notes.txt' })).toBe('text')
  })

  it('uses download fallback for unsupported legacy office formats', () => {
    expect(getAttachmentPreviewType({ originalFilename: 'report.doc' })).toBe('download')
    expect(getAttachmentPreviewType({ originalFilename: 'slides.ppt' })).toBe('download')
  })
})
