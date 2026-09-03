import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const routerSource = readFileSync(
  fileURLToPath(new URL('../index.js', import.meta.url)),
  'utf8'
)

describe('profile route layout', () => {
  it('renders the profile page as a child of the case layout', () => {
    expect(routerSource).toContain("path: 'profile'")
    expect(routerSource).toContain("component: () => import('@/views/profile/AccountProfileView.vue')")
    expect(routerSource).not.toContain("path: '/profile'")
  })
})
