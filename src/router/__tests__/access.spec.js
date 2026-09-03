import { describe, expect, it } from 'vitest'
import {
  canAccessCaseBusiness,
  canVisitUserProfile,
  getUserLandingPath
} from '@/router/access'
import { USER_STATUS } from '@/constants/user'

describe('case route access', () => {
  it('sends registered and review-failed users to the profile page', () => {
    expect(getUserLandingPath(USER_STATUS.REGISTER, '/cases')).toBe('/profile')
    expect(getUserLandingPath(USER_STATUS.REVIEW_FAILED, '/cases')).toBe('/profile')
  })

  it('keeps pending-review users on the profile page', () => {
    expect(getUserLandingPath(USER_STATUS.PENDING_REVIEW, '/cases')).toBe('/profile')
    expect(canVisitUserProfile(USER_STATUS.PENDING_REVIEW)).toBe(true)
  })

  it('allows approved users to maintain their profile', () => {
    expect(canVisitUserProfile(USER_STATUS.OK)).toBe(true)
  })

  it('allows only approved users to access case business pages', () => {
    expect(canAccessCaseBusiness(USER_STATUS.OK)).toBe(true)
    expect(canAccessCaseBusiness(USER_STATUS.REGISTER)).toBe(false)
    expect(canAccessCaseBusiness(USER_STATUS.REVIEW_FAILED)).toBe(false)
  })

  it('normalizes numeric and enum-like status values', () => {
    expect(canVisitUserProfile(3)).toBe(true)
    expect(canVisitUserProfile({ code: USER_STATUS.PENDING_REVIEW })).toBe(true)
  })
})
