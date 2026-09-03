import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const layoutSource = readFileSync(
  fileURLToPath(new URL('./CaseLayout.vue', import.meta.url)),
  'utf8'
)

describe('case layout account navigation', () => {
  it('places profile and logout actions in the top-right dropdown', () => {
    expect(layoutSource).toContain('<el-dropdown')
    expect(layoutSource).toContain('@command="handleAccountCommand"')
    expect(layoutSource).toContain('command="profile"')
    expect(layoutSource).toContain('command="logout"')
    expect(layoutSource).not.toContain('class="case-account"')
    expect(layoutSource).not.toContain('<div class="case-nav-caption">账户</div>')
  })
})
