import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const caseFormSource = readFileSync(
  fileURLToPath(new URL('./CaseForm.vue', import.meta.url)),
  'utf8'
)

describe('case form attachments', () => {
  it('does not limit the number of attachments', () => {
    expect(caseFormSource).not.toContain('remainingSlots')
    expect(caseFormSource).not.toContain('最多上传 5 个附件')
    expect(caseFormSource).toContain('单个文件不超过 50 MB')
  })
})
