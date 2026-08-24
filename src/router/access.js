const DoctorUserStatus = {
  OK: '0',
  PENDING_REVIEW: '3',
  REVIEW_FAILED: '4',
  REGISTER: '5'
}

export function canAccessDoctorBusiness(status) {
  return status === DoctorUserStatus.OK
}

export function canVisitDoctorProfile(status) {
  return status === DoctorUserStatus.REGISTER
    || status === DoctorUserStatus.REVIEW_FAILED
    || status === DoctorUserStatus.PENDING_REVIEW
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
