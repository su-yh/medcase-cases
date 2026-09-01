import { describe, expect, it } from 'vitest'
import {
  canAccessDoctorBusiness,
  canVisitDoctorProfile,
  getDoctorLandingPath
} from '@/router/access'
import { USER_STATUS } from '@/constants/user'

describe('doctor route access', () => {
  it('sends registered and review-failed doctors to the profile page', () => {
    expect(getDoctorLandingPath(USER_STATUS.REGISTER, '/cases')).toBe('/profile')
    expect(getDoctorLandingPath(USER_STATUS.REVIEW_FAILED, '/cases')).toBe('/profile')
  })

  it('keeps pending-review doctors on the profile page', () => {
    expect(getDoctorLandingPath(USER_STATUS.PENDING_REVIEW, '/cases')).toBe('/profile')
    expect(canVisitDoctorProfile(USER_STATUS.PENDING_REVIEW)).toBe(true)
  })

  it('allows only approved doctors to access doctor business pages', () => {
    expect(canAccessDoctorBusiness(USER_STATUS.OK)).toBe(true)
    expect(canAccessDoctorBusiness(USER_STATUS.REGISTER)).toBe(false)
    expect(canAccessDoctorBusiness(USER_STATUS.REVIEW_FAILED)).toBe(false)
  })

  it('normalizes numeric and enum-like status values', () => {
    expect(canVisitDoctorProfile(3)).toBe(true)
    expect(canVisitDoctorProfile({ code: USER_STATUS.PENDING_REVIEW })).toBe(true)
  })
})
