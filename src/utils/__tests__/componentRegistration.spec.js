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

  it('registers the upload component used by profile and registration pages', () => {
    expect(mainSource).toContain('ElUpload')
    expect(mainSource).toContain('app.component(ElUpload.name, ElUpload)')
  })

  it('registers the select components used by doctor registration', () => {
    expect(mainSource).toContain('ElSelect')
    expect(mainSource).toContain('ElOption')
    expect(mainSource).toContain('app.component(ElSelect.name, ElSelect)')
    expect(mainSource).toContain('app.component(ElOption.name, ElOption)')
  })
})
