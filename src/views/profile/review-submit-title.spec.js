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

  it('returns from the pending review page after ten seconds or by button click', () => {
    expect(viewSource).toContain('返回登录')
    expect(viewSource).toContain('pendingSeconds')
    expect(viewSource).toContain('startCountdown(')
    expect(viewSource).toContain('    10,')
    expect(viewSource).toContain('watch(')
    expect(viewSource).toContain('pendingReview,')
    expect(viewSource).toContain('handleReturnToLogin')
    expect(viewSource).toContain('await userStore.logout()')
  })
})
