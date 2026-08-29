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
  it('requires sex during registration and submits it', () => {
    expect(registerViewSource).toContain('prop="sex"')
    expect(registerViewSource).toContain('v-model="form.sex"')
    expect(registerViewSource).toContain('sex: form.sex')
  })

  it('submits sex and shows the review rejection reason', () => {
    expect(profileViewSource).toContain('v-model="form.sex"')
    expect(profileViewSource).toContain('sex: form.sex')
    expect(profileViewSource).toContain('reviewReason')
  })
})
