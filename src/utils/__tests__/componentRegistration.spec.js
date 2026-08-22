import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const mainSource = readFileSync(
  fileURLToPath(new URL('../../main.js', import.meta.url)),
  'utf8'
)

describe('Element Plus component registration', () => {
  it('registers the date picker used by the case center filters', () => {
    expect(mainSource).toContain('ElDatePicker')
    expect(mainSource).toContain('app.component(ElDatePicker.name, ElDatePicker)')
  })
})
