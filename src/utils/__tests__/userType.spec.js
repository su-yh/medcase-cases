import { describe, expect, it } from 'vitest'
import { USER_TYPE } from '@/constants/user'
import { userTypeLabel } from '@/utils/userType'

describe('user type utils', () => {
  it('returns the corresponding label for doctor and patient users', () => {
    expect(userTypeLabel(USER_TYPE.DOCTOR)).toBe('医生')
    expect(userTypeLabel(USER_TYPE.PATIENT)).toBe('患者')
  })

  it('supports enum-like user type values', () => {
    expect(userTypeLabel({ code: USER_TYPE.PATIENT })).toBe('患者')
  })
})
