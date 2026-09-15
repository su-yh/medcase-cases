import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appSource = readFileSync(
  fileURLToPath(new URL('./App.vue', import.meta.url)),
  'utf8'
)

describe('global user type theme', () => {
  it('applies the selected user type theme around the whole application', () => {
    expect(appSource).toContain('preferredUserType')
    expect(appSource).toContain('getUserTypeThemeStyle')
    expect(appSource).toContain(':style="themeStyle"')
    expect(appSource).toContain('userStore.userInfo?.userType')
  })
})
