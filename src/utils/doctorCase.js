export const CASE_STATUS_TABS = [
  { key: '', label: '全部病例' },
  { key: 'pending_review', label: '待审核' },
  { key: 'review_failed', label: '审核失败' },
  { key: 'approved_pending_settlement', label: '审核通过 / 待结算' },
  { key: 'settled', label: '已结算' }
]

const CASE_STATUS_LABELS = Object.fromEntries(
  CASE_STATUS_TABS.filter((item) => item.key).map((item) => [item.key, item.label])
)

export function getCaseStatusLabel(status) {
  return CASE_STATUS_LABELS[status] || '未知状态'
}

export function getCaseStatusClass(status) {
  return {
    pending_review: 'reviewing',
    review_failed: 'failed',
    approved_pending_settlement: 'passed',
    settled: 'settled'
  }[status] || ''
}
