import { normalizeEnumCode, USER_STATUS } from '@/constants/user'

export function canAccessDoctorBusiness(status) {
  return normalizeEnumCode(status) === USER_STATUS.OK
}

export function canVisitDoctorProfile(status) {
  const normalizedStatus = normalizeEnumCode(status)
  return normalizedStatus === USER_STATUS.REGISTER
    || normalizedStatus === USER_STATUS.REVIEW_FAILED
    || normalizedStatus === USER_STATUS.PENDING_REVIEW
}

export function getDoctorLandingPath(status, fallbackPath = '/home') {
  if (canAccessDoctorBusiness(status)) {
    return fallbackPath
  }
  if (canVisitDoctorProfile(status)) {
    return '/profile'
  }
  return '/login'
}
