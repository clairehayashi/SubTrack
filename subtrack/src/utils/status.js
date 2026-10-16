export const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'keep', label: 'Keep', color: 'var(--color-keep-500)' },
  { key: 'undecided', label: 'Undecided', color: 'var(--color-undecided-500)' },
  { key: 'cancel', label: 'Cancel', color: 'var(--color-cancel-500)' },
]

export function normalizeStatus(value) {
  const status = String(value || '').trim().toLowerCase()
  if (status === 'active') return 'keep'
  if (status === 'canceled') return 'cancelled'
  return ['keep', 'undecided', 'cancel', 'cancelled', 'trial'].includes(status) ? status : 'undecided'
}

export function matchesStatusFilter(sub, filter) {
  const status = normalizeStatus(sub.status)
  if (filter === 'all') return true
  if (filter === 'annual') return sub.cycle === 'Yearly'
  if (filter === 'cancel') return status === 'cancel' || status === 'cancelled'
  return status === filter
}
