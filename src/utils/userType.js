import { normalizeEnumCode, USER_TYPE } from '@/constants/user'

const USER_TYPE_LABELS = {
  [USER_TYPE.DOCTOR]: '医生',
  [USER_TYPE.PATIENT]: '患者'
}

export function userTypeLabel(userType) {
  return USER_TYPE_LABELS[normalizeEnumCode(userType)] || '病例用户'
}
