import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const viewSource = readFileSync(
  fileURLToPath(new URL('./AccountProfileView.vue', import.meta.url)),
  'utf8'
)

describe('account profile view', () => {
  it('provides separate phone and password dialog actions', () => {
    expect(viewSource).toContain('修改手机号')
    expect(viewSource).toContain('修改密码')
    expect(viewSource).toContain('v-model="phoneDialogVisible"')
    expect(viewSource).toContain('v-model="passwordDialogVisible"')
    expect(viewSource).toContain('当前密码')
    expect(viewSource).toContain('短信验证码')
    expect(viewSource).toContain('获取验证码')
    expect(viewSource).toContain('sendProfilePhoneSmsCode')
    expect(viewSource).toContain('function openPhoneDialog()')
    expect(viewSource).toContain('function openPasswordDialog()')
  })
})
