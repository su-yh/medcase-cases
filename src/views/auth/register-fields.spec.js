import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const registerViewSource = readFileSync(
  fileURLToPath(new URL('./RegisterView.vue', import.meta.url)),
  'utf8'
)

const profileViewSource = readFileSync(
  fileURLToPath(new URL('../profile/DoctorProfileView.vue', import.meta.url)),
  'utf8'
)

describe('doctor profile fields', () => {
  it('renders and submits a selectable sex field', () => {
    expect(registerViewSource).toContain('prop="sex"')
    expect(registerViewSource).toContain('v-model="form.sex"')
    expect(registerViewSource).toContain('<el-option label="男" value="0" />')
    expect(registerViewSource).toContain('<el-option label="女" value="1" />')
    expect(registerViewSource).toContain('sex: form.sex')
  })

  it('includes SMS verification and uses the responsive registration grid', () => {
    expect(registerViewSource).toContain('prop="smsCode"')
    expect(registerViewSource).toContain("smsCode: '999999'")
    expect(registerViewSource).toContain('sendRegisterSmsCode')
    expect(registerViewSource).toContain('class="register-form-grid"')
  })

  it('submits sex and shows the review rejection reason', () => {
    expect(profileViewSource).toContain('v-model="form.sex"')
    expect(profileViewSource).toContain('sex: form.sex')
    expect(profileViewSource).toContain('reviewReason')
  })
})
