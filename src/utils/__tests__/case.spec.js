import { describe, expect, it } from 'vitest'

describe('case helpers', () => {
  it('provides the case status tabs', async () => {
    const { CASE_STATUS_TABS } = await import('@/utils/case')

    expect(CASE_STATUS_TABS.map((item) => item.key)).toEqual([
      '',
      'draft',
      'pending_review',
      'review_failed',
      'approved_pending_settlement',
      'settled'
    ])
  })

  it('resolves status labels', async () => {
    const { getCaseStatusLabel } = await import('@/utils/case')

    expect(getCaseStatusLabel('draft')).toBe('草稿')
    expect(getCaseStatusLabel('review_failed')).toBe('审核失败')
    expect(getCaseStatusLabel('unknown')).toBe('未知状态')
  })
})
