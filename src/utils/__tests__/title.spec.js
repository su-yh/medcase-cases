import { describe, expect, it } from 'vitest'

describe('title utils', () => {
  it('builds page title with app name', async () => {
    const { buildTitle } = await import('@/utils/title')

    expect(buildTitle('登录')).toBe('登录 - MedCase 医生端')
  })
})
