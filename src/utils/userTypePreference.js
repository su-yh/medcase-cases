import { normalizeEnumCode, USER_TYPE } from '@/constants/user'
import { userTypeLabel } from '@/utils/userType'

export const USER_TYPE_STORAGE_KEY = 'medcase_cases_user_type'

export const USER_TYPE_OPTIONS = Object.freeze([
  { label: userTypeLabel(USER_TYPE.DOCTOR), value: USER_TYPE.DOCTOR },
  { label: userTypeLabel(USER_TYPE.PATIENT), value: USER_TYPE.PATIENT }
])

const DEFAULT_USER_TYPE = USER_TYPE.DOCTOR
const SUPPORTED_USER_TYPES = new Set(USER_TYPE_OPTIONS.map(option => option.value))

const USER_TYPE_THEMES = {
  [USER_TYPE.DOCTOR]: {
    name: 'doctor',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryActive: '#1e40af',
    primarySoft: '#dbeafe',
    border: '#93c5fd',
    shadow: '0 18px 42px rgb(37 99 235 / 18%)',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fbff 45%, #ecfeff 100%)'
  },
  [USER_TYPE.PATIENT]: {
    name: 'patient',
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryActive: '#166534',
    primarySoft: '#dcfce7',
    border: '#86efac',
    shadow: '0 18px 42px rgb(22 163 74 / 18%)',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #fffaf0 48%, #ecfdf5 100%)'
  }
}

function browserStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function normalizeUserType(userType) {
  const code = normalizeEnumCode(userType)
  return SUPPORTED_USER_TYPES.has(code) ? code : DEFAULT_USER_TYPE
}

function readStoredUserType(storage) {
  try {
    return storage?.getItem(USER_TYPE_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredUserType(userType, storage) {
  try {
    storage?.setItem(USER_TYPE_STORAGE_KEY, userType)
  } catch {
    // Ignore unavailable storage so auth pages still work in restricted browsers.
  }
}

export function getPreferredUserType(storage = browserStorage()) {
  return normalizeUserType(readStoredUserType(storage))
}

export function setPreferredUserType(userType, storage = browserStorage()) {
  const normalizedUserType = normalizeUserType(userType)
  writeStoredUserType(normalizedUserType, storage)
  return normalizedUserType
}

export function getUserTypeTheme(userType) {
  return USER_TYPE_THEMES[normalizeUserType(userType)]
}
