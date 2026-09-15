import { describe, expect, it } from 'vitest'
import { USER_TYPE } from '@/constants/user'
import {
  getPreferredUserType,
  getUserTypeTheme,
  setPreferredUserType,
  USER_TYPE_OPTIONS
} from '@/utils/userTypePreference'

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial))

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    }
  }
}

describe('user type preference', () => {
  it('defaults to doctor when no stored user type exists', () => {
    expect(getPreferredUserType(createStorage())).toBe(USER_TYPE.DOCTOR)
  })

  it('persists one selected user type for login and registration pages', () => {
    const storage = createStorage()

    setPreferredUserType(USER_TYPE.PATIENT, storage)

    expect(getPreferredUserType(storage)).toBe(USER_TYPE.PATIENT)
  })

  it('ignores unsupported stored values', () => {
    const storage = createStorage({ medcase_cases_user_type: 'supplier' })

    expect(getPreferredUserType(storage)).toBe(USER_TYPE.DOCTOR)
  })

  it('defaults when browser storage is unavailable', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {}
    })
    Object.defineProperty(globalThis.window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('storage blocked')
      }
    })

    try {
      expect(getPreferredUserType()).toBe(USER_TYPE.DOCTOR)
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow)
      } else {
        delete globalThis.window
      }
    }
  })

  it('provides button options and distinct themes for every supported type', () => {
    expect(USER_TYPE_OPTIONS).toEqual([
      { label: '医生', value: USER_TYPE.DOCTOR },
      { label: '患者', value: USER_TYPE.PATIENT }
    ])
    expect(getUserTypeTheme(USER_TYPE.DOCTOR).name).toBe('doctor')
    expect(getUserTypeTheme(USER_TYPE.PATIENT).name).toBe('patient')
    expect(getUserTypeTheme(USER_TYPE.DOCTOR).primary).not.toBe(getUserTypeTheme(USER_TYPE.PATIENT).primary)
  })
})
