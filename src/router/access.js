import { normalizeEnumCode, USER_STATUS } from '@/constants/user'

export function canAccessCaseBusiness(status) {
  return normalizeEnumCode(status) === USER_STATUS.OK
}

export function canVisitUserProfile(status) {
  const normalizedStatus = normalizeEnumCode(status)
  return normalizedStatus === USER_STATUS.REGISTER
    || normalizedStatus === USER_STATUS.REVIEW_FAILED
    || normalizedStatus === USER_STATUS.PENDING_REVIEW
    || normalizedStatus === USER_STATUS.OK
}

export function getUserLandingPath(status, fallbackPath = '/home') {
  if (canAccessCaseBusiness(status)) {
    return fallbackPath
  }
  if (canVisitUserProfile(status)) {
    return '/profile'
  }
  return '/login'
}
