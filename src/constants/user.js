export const USER_TYPE = Object.freeze({
  DOCTOR: '01',
  PATIENT: '02'
})

export const USER_STATUS = Object.freeze({
  OK: '0',
  DISABLE: '1',
  PENDING_REVIEW: '3',
  REVIEW_FAILED: '4',
  REGISTER: '5'
})

export function normalizeEnumCode(value) {
  if (value && typeof value === 'object') {
    return String(value.code ?? '')
  }
  return String(value ?? '')
}
