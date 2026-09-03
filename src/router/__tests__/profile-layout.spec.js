import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const routerSource = readFileSync(
  fileURLToPath(new URL('../index.js', import.meta.url)),
  'utf8'
)

describe('profile route layout', () => {
  it('keeps review submission outside the case layout', () => {
    expect(routerSource).toContain("path: '/profile'")
    expect(routerSource).toContain("component: () => import('@/views/profile/ReviewSubmitView.vue')")
    expect(routerSource).toContain("path: 'account/profile'")
    expect(routerSource).toContain("component: () => import('@/views/profile/AccountProfileView.vue')")
  })
})
