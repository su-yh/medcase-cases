import { describe, expect, it } from 'vitest'
import { isPasswordConfirmed } from '@/utils/register'

describe('register utils', () => {
  it('rejects a confirmation password that differs from the password', () => {
    expect(isPasswordConfirmed('doctor-password', 'different-password')).toBe(false)
  })
})
