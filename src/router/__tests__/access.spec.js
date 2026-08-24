import { describe, expect, it } from 'vitest'
import {
  canAccessDoctorBusiness,
  canVisitDoctorProfile,
  getDoctorLandingPath
} from '@/router/access'

describe('doctor route access', () => {
  it('sends registered and review-failed doctors to the profile page', () => {
    expect(getDoctorLandingPath('5', '/cases')).toBe('/profile')
    expect(getDoctorLandingPath('4', '/cases')).toBe('/profile')
  })

  it('keeps pending-review doctors on the profile page', () => {
    expect(getDoctorLandingPath('3', '/cases')).toBe('/profile')
    expect(canVisitDoctorProfile('3')).toBe(true)
  })

  it('allows only approved doctors to access doctor business pages', () => {
    expect(canAccessDoctorBusiness('0')).toBe(true)
    expect(canAccessDoctorBusiness('5')).toBe(false)
    expect(canAccessDoctorBusiness('4')).toBe(false)
  })
})
