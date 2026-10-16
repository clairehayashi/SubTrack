import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import SubRow from '../components/SubRow'
import AddSubDrawer from '../components/AddSubDrawer'
import styles from './SubscriptionList.module.css'
import Dropdown from '../components/Dropdown'   // or './Dropdown' depending on relative path
import { STATUS_FILTERS, matchesStatusFilter } from '../utils/status'

const FILTERS = [
  ...STATUS_FILTERS,
  { key: 'trial',  label: 'Trial' },
  { key: 'annual', label: 'Annual' },
]

function daysUntil(dateStr) {
  if (!dateStr) return Infinity
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date(); now.setHours(0,0,0,0)
  return Math.round((d - now) / 86400000)
}

function toMonthly(s) {
  const m = { Monthly: 1, Yearly: 1/12, Quarterly: 1/3, Weekly: 4.33, Custom: 1 }
  return s.amount * (m[s.cycle] || 1)
}

function matchAccount(sub, account) {
  if (!account) return false
  if (sub.accountId) return sub.accountId === account.id
  return sub.accountType?.toLowerCase() === account.label?.toLowerCase()
}

export default function SubscriptionList() {
  const subscriptions = useStore((s) => s.subscriptions)
  const accounts      = useStore((s) => s.accounts)

  const [query, setQuery]         = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [acctFilter, setAcct]     = useState(null) // account id, or null for "all"
  const [sort, setSort]           = useState('renewal')
  const [drawerOpen, setDrawer]   = useState(false)

  const toggleAcct = (key) => setAcct((prev) => prev === key ? null : key)

  const filtered = useMemo(() => {
    let list = subscriptions.filter((s) => matchesStatusFilter(s, statusFilter))

    if (acctFilter) {
      const acct = accounts.find((a) => a.id === acctFilter)
      list = list.filter((s) => matchAccount(s, acct))
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.accountEmail?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.accountType?.toLowerCase().includes(q)
      )
    }

    if (sort === 'renewal')     list = [...list].sort((a, b) => daysUntil(a.nextBillingDate) - daysUntil(b.nextBillingDate))
    if (sort === 'price-asc')   list = [...list].sort((a, b) => toMonthly(a) - toMonthly(b))
    if (sort === 'price-desc')  list = [...list].sort((a, b) => toMonthly(b) - toMonthly(a))
    if (sort === 'name')        list = [...list].sort((a, b) => a.name.localeCompare(b.name))

    return list
  }, [subscriptions, accounts, statusFilter, acctFilter, query, sort])

  const total = subscriptions.length
  const showResultsInfo = filtered.length !== total || query || acctFilter || statusFilter !== 'all'

  return (
    <>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>
                Subscriptions
                <span className={styles.titleCount}>{total} total</span>
              </h1>
              <p className={styles.sub}>All services across your accounts</p>
            </div>
            <button className={styles.addBtn} onClick={() => setDrawer(true)}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="white" strokeWidth="2">
                <line x1="6.5" y1="1" x2="6.5" y2="12"/><line x1="1" y1="6.5" x2="12" y2="6.5"/>
              </svg>
              Add subscription
            </button>
          </div>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
              </svg>
            </span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search subscriptions, accounts, or emails..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className={styles.searchClear} onClick={() => setQuery('')}>
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
                </svg>
              </button>
            )}
          </div>

          <div className={styles.filterBar}>
            <div className={styles.filterLeft}>
              {FILTERS.map((f) => (
                <button key={f.key}
                  className={`${styles.filterBtn} ${statusFilter === f.key ? styles.filterActive : ''}`}
                  onClick={() => setStatus(f.key)}
                  aria-pressed={statusFilter === f.key}
                >
                  {f.color && <span className={styles.statusDot} style={{ background: f.color }} />}
                  {f.label}
                </button>
              ))}
              {accounts.length > 0 && <div className={styles.filterDivider} />}
              {accounts.map((acct) => (
                <button key={acct.id}
                  className={`${styles.filterBtn} ${acctFilter === acct.id ? styles.filterActive : ''}`}
                  onClick={() => toggleAcct(acct.id)}
                >
                  <span
                    className={styles.acctFilterDot}
                    style={{ background: acct.color }}
                  />
                  {acct.label}
                </button>
              ))}
            </div>
            <div className={styles.filterRight}>
              <span className={styles.sortLabel}>Sort by</span>
              <Dropdown
                value={sort}
                options={[
                  { value: 'renewal',    label: 'Renewal date' },
                  { value: 'price-asc',  label: 'Price (low to high)' },
                  { value: 'price-desc', label: 'Price (high to low)' },
                  { value: 'name',       label: 'Name A to Z' },
                ]}
                onChange={setSort}
                size="sm"
                align="right"
              />
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {showResultsInfo && total > 0 && (
            <div className={styles.resultsInfo}>
              <strong>{filtered.length}</strong> of {total} subscriptions
            </div>
          )}

          {total === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="18" height="14" rx="3"/>
                  <line x1="7" y1="9" x2="15" y2="9"/><line x1="7" y1="13" x2="12" y2="13"/>
                </svg>
              </div>
              <div className={styles.emptyTitle}>No subscriptions yet</div>
              <div className={styles.emptySub}>Add your first subscription to start tracking renewal dates and costs across all your accounts.</div>
              <button className={styles.emptyBtn} onClick={() => setDrawer(true)}>Add subscription</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.noResults}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="9" r="6"/><line x1="14" y1="14" x2="20" y2="20"/>
                  <line x1="6" y1="9" x2="12" y2="9"/>
                </svg>
              </div>
              <div className={styles.emptyTitle}>No matches found</div>
              <div className={styles.emptySub}>
                {query ? `No results for "${query}". Try adjusting your search or filters.` : 'Try adjusting your filters.'}
              </div>
              <button className={styles.clearBtn} onClick={() => { setQuery(''); setStatus('all'); setAcct(null) }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className={styles.subList}>
              {filtered.map((sub) => <SubRow key={sub.id} sub={sub} />)}
            </div>
          )}
        </div>
      </div>

      <AddSubDrawer open={drawerOpen} onClose={() => setDrawer(false)} />
    </>
  )
}
