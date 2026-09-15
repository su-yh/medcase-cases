import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const viewSource = readFileSync(
  fileURLToPath(new URL('./ReviewSubmitView.vue', import.meta.url)),
  'utf8'
)

describe('review submission title', () => {
  it('distinguishes doctor and patient in the profile completion title', () => {
    expect(viewSource).toContain("reviewFailed ? '重新提交' : '完善'")
    expect(viewSource).toContain('userTypeLabel')
    expect(viewSource).toContain('profile-type-text')
    expect(viewSource).toContain('color: var(--el-color-primary)')
  })
})
