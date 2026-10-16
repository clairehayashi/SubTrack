import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import MetricCard from '../components/MetricCard'
import SubRow from '../components/SubRow'
import AddSubDrawer from '../components/AddSubDrawer'
import styles from './Home.module.css'
import { toMonthlyIn, fmt } from '../utils/currency'
import Dropdown from '../components/Dropdown'   // or './Dropdown' depending on relative path
import { STATUS_FILTERS, matchesStatusFilter, normalizeStatus } from '../utils/status'

function timeOfDayGreeting() {
  const h = new Date().getHours()
  if (h < 12)  return 'Good morning'
  if (h < 17)  return 'Good afternoon'
  return 'Good evening'
}

function todayLabel() {
  const d = new Date()
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function daysUntil(dateStr) {
  if (!dateStr) return Infinity
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date(); now.setHours(0,0,0,0)
  return Math.round((d - now) / 86400000)
}

function firstName(displayName) {
  return (displayName || '').trim().split(/\s+/)[0] || ''
}

const SORT_OPTIONS = [
  { id: 'renewal-asc',  label: 'Next renewal' },
  { id: 'cost-desc',    label: 'Cost (high to low)' },
  { id: 'cost-asc',     label: 'Cost (low to high)' },
  { id: 'name-asc',     label: 'Name (A to Z)' },
]

const LS_DENSITY = 'subtrack-density'
const LS_SORT    = 'subtrack-sort'

export default function Home() {
  const navigate = useNavigate()
  const subscriptions = useStore((s) => s.subscriptions)
  const settings      = useStore((s) => s.settings)
  const accounts      = useStore((s) => s.accounts)
  const cur = settings.defaultCurrency

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [density, setDensity] = useState(() => localStorage.getItem(LS_DENSITY) || 'comfortable')
  const [sortBy, setSortBy] = useState(() => localStorage.getItem(LS_SORT) || 'renewal-asc')

  useEffect(() => { localStorage.setItem(LS_DENSITY, density) }, [density])
  useEffect(() => { localStorage.setItem(LS_SORT,    sortBy)  }, [sortBy])

  // ── Derived data ──

  const active = subscriptions.filter((s) => normalizeStatus(s.status) !== 'cancelled')

  const monthlyTotal = useMemo(
    () => fmt(active.reduce((sum, s) => sum + toMonthlyIn(s, cur), 0), cur),
    [active, cur]
  )

  const yearlyTotal = useMemo(
    () => fmt(active.reduce((sum, s) => sum + toMonthlyIn(s, cur), 0) * 12, cur),
    [active, cur]
  )

  const renewingSoon = active.filter((s) => {
    const d = daysUntil(s.nextBillingDate)
    return d >= 0 && d <= 7
  })

  const trialsEnding = active.filter(
    (s) => s.trialEndDate && daysUntil(s.trialEndDate) >= 0 && daysUntil(s.trialEndDate) <= 7
  )

  // ── Filter + sort ──

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => matchesStatusFilter(s, statusFilter))
  }, [subscriptions, statusFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'renewal-asc') arr.sort((a, b) => daysUntil(a.nextBillingDate) - daysUntil(b.nextBillingDate))
    if (sortBy === 'cost-desc')   arr.sort((a, b) => toMonthlyIn(b, cur) - toMonthlyIn(a, cur))
    if (sortBy === 'cost-asc')    arr.sort((a, b) => toMonthlyIn(a, cur) - toMonthlyIn(b, cur))
    if (sortBy === 'name-asc')    arr.sort((a, b) => a.name.localeCompare(b.name))
    return arr
  }, [filtered, sortBy, cur])

  // ── Group into account sections ──

  const sections = useMemo(() => {
    const matched = accounts.map((acct) => ({
      id: acct.id,
      label: acct.label,
      color: acct.color,
      subs: sorted.filter((s) => {
          if (s.accountId) return s.accountId === acct.id
          return s.accountType?.toLowerCase() === acct.label?.toLowerCase()
      }),
    }))

    const matchedSubs = new Set(matched.flatMap((section) => section.subs))
    const unmatched = sorted.filter((s) => !matchedSubs.has(s))

    if (unmatched.length > 0) {
      matched.push({
        id: '_other',
        label: 'Other',
        color: 'var(--color-neutral-500)',
        subs: unmatched,
      })
    }

    return matched.filter((sec) => sec.subs.length > 0)
  }, [accounts, sorted])

  // ── Greeting ──

  const name = firstName(settings.displayName)
  const greetingMain = name ? `${timeOfDayGreeting()}, ${name}.` : timeOfDayGreeting()

  let urgencyLine = todayLabel()
  if (trialsEnding.length > 0) {
    urgencyLine = trialsEnding.length === 1
      ? '1 trial ends this week.'
      : `${trialsEnding.length} trials end this week.`
  } else if (renewingSoon.length > 0) {
    urgencyLine = renewingSoon.length === 1
      ? '1 renewal this week.'
      : `${renewingSoon.length} renewals this week.`
  }

  const hasSubs = subscriptions.length > 0
  const hasResults = sections.length > 0

  return (
    <>
      <div className={styles.page}>

        {/* Topbar */}
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.title}>{greetingMain}</h1>
            <p className={styles.sub}>{urgencyLine}</p>
          </div>
          <button className={styles.addBtn} onClick={() => setDrawerOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="white" strokeWidth="2">
              <line x1="6.5" y1="1" x2="6.5" y2="12"/><line x1="1" y1="6.5" x2="12" y2="6.5"/>
            </svg>
            Add subscription
          </button>
        </div>

        {/* Metrics */}
        <div className={styles.metrics}>
          <MetricCard label="Monthly total" value={monthlyTotal} sub={`${active.length} services`} />
          {settings.showYearlyProjection && (
            <MetricCard label="Yearly total" value={yearlyTotal} sub="projected" />
          )}
          <MetricCard
            label="Renewing soon"
            value={String(renewingSoon.length)}
            sub="within 7 days"
            valueColor={renewingSoon.length > 0 ? 'var(--color-danger-500)' : undefined}
          />
          <MetricCard
            label="Trials ending"
            value={String(trialsEnding.length)}
            sub="action needed"
            valueColor={trialsEnding.length > 0 ? 'var(--color-work-500)' : undefined}
          />
        </div>

        {/* Controls bar */}
        {hasSubs && (
          <div className={styles.controls}>
            <div className={styles.filterPills}>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`${styles.pill} ${statusFilter === f.key ? styles.pillActive : ''}`}
                  onClick={() => setStatusFilter(f.key)}
                  aria-pressed={statusFilter === f.key}
                >
                  {f.color && <span className={styles.pillDot} style={{ background: f.color }} />}
                  {f.label}
                </button>
              ))}
            </div>

            <div className={styles.controlsRight}>
              <div className={styles.densitySwitch}>
                <button
                  className={`${styles.densityBtn} ${density === 'comfortable' ? styles.densityActive : ''}`}
                  onClick={() => setDensity('comfortable')}
                  aria-label="Comfortable view"
                  title="Comfortable view"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="3"  width="12" height="3" rx="1"/>
                    <rect x="2" y="10" width="12" height="3" rx="1"/>
                  </svg>
                </button>
                <button
                  className={`${styles.densityBtn} ${density === 'dense' ? styles.densityActive : ''}`}
                  onClick={() => setDensity('dense')}
                  aria-label="Dense view"
                  title="Dense view"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <line x1="2" y1="4"  x2="14" y2="4"/>
                    <line x1="2" y1="8"  x2="14" y2="8"/>
                    <line x1="2" y1="12" x2="14" y2="12"/>
                  </svg>
                </button>
              </div>

              <Dropdown
                value={sortBy}
                options={SORT_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
                onChange={setSortBy}
                triggerLabelPrefix="Sort: "
                size="sm"
                align="right"
              />
            </div>
          </div>
        )}

        {/* Sections */}
        {!hasSubs ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="18" height="14" rx="3"/>
                <line x1="7" y1="9" x2="15" y2="9"/>
                <line x1="7" y1="13" x2="12" y2="13"/>
              </svg>
            </div>
            <div className={styles.emptyTitle}>No subscriptions yet</div>
            <div className={styles.emptySub}>Add your first subscription to start tracking.</div>
            <button className={styles.emptyBtn} onClick={() => setDrawerOpen(true)}>
              Add subscription
            </button>
          </div>
        ) : !hasResults ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>No subscriptions match this filter</div>
            <div className={styles.emptySub}>Try a different status or clear the filter.</div>
            <button className={styles.emptyBtn} onClick={() => setStatusFilter('all')}>
              Show all
            </button>
          </div>
        ) : (
          <div className={styles.sections}>
            {sections.map((section) => (
              <section key={section.id} className={styles.section}>
                <div className={styles.sectionHd}>
                  <div className={styles.sectionTitle}>
                    <span className={styles.sectionDot} style={{ background: section.color }} />
                    {section.label}
                  </div>
                  <span className={styles.sectionCount}>{section.subs.length}</span>
                </div>
                <div className={`${styles.subList} ${styles[density]}`}>
                  {section.subs.map((sub) => (
                    <SubRow key={sub.id} sub={sub} density={density} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <AddSubDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
