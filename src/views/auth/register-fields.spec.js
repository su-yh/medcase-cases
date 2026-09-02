import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const registerViewSource = readFileSync(
  fileURLToPath(new URL('./RegisterView.vue', import.meta.url)),
  'utf8'
)

const profileViewSource = readFileSync(
  fileURLToPath(new URL('../profile/UserProfileView.vue', import.meta.url)),
  'utf8'
)

describe('user registration fields', () => {
  it('keeps registration limited to account fields', () => {
    expect(registerViewSource).toContain('prop="userType"')
    expect(registerViewSource).toContain(':value="USER_TYPE.DOCTOR"')
    expect(registerViewSource).toContain(':value="USER_TYPE.PATIENT"')
    expect(registerViewSource).not.toContain('prop="sex"')
    expect(registerViewSource).not.toContain('prop="supplierId"')
    expect(registerViewSource).not.toContain('idCardFront')
  })

  it('includes SMS verification with the fixed development code', () => {
    expect(registerViewSource).toContain('prop="smsCode"')
    expect(registerViewSource).toContain("smsCode: '999999'")
    expect(registerViewSource).toContain('sendRegisterSmsCode')
  })

  it('uses a supplier selector in the authenticated profile flow', () => {
    expect(profileViewSource).toContain('prop="supplierId"')
    expect(profileViewSource).toContain('v-model="form.supplierId"')
    expect(profileViewSource).toContain('getSupplierOptions')
    expect(profileViewSource).toContain('supplierId: form.supplierId')
    expect(registerViewSource).not.toContain('inviteCode')
  })

  it('shows the review rejection reason without collecting sex', () => {
    expect(profileViewSource).not.toContain('v-model="form.sex"')
    expect(profileViewSource).not.toContain('sex: form.sex')
    expect(profileViewSource).toContain('reviewReason')
  })

  it('refreshes the profile when the profile page opens', () => {
    expect(profileViewSource).toContain('onMounted(async () =>')
    expect(profileViewSource).toContain('loadProfile()')
  })
})
