import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import SubRow from '../components/SubRow'
import AddSubDrawer from '../components/AddSubDrawer'
import styles from './AccountView.module.css'
import { STATUS_FILTERS, matchesStatusFilter, normalizeStatus } from '../utils/status'
import { toMonthlyIn, fmt } from '../utils/currency'

const ICON_BY_LABEL = {
  personal: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 13c0-3 2.7-5 6-5s6 2 6 5"/></svg>,
  work:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="12" height="8" rx="1.5"/><path d="M5 6V5a3 3 0 016 0v1"/></svg>,
  school:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2l1.5 4H14l-3.5 2.5 1.5 4L8 10l-4 2.5 1.5-4L2 6h4.5z"/></svg>,
  family:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="9" width="12" height="5" rx="1"/><path d="M5 9V7a3 3 0 016 0v2"/><circle cx="8" cy="4" r="2"/></svg>,
  leisure:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="10" height="8" rx="1"/><path d="M6 4V3a2 2 0 014 0v1"/></svg>,
}
const DEFAULT_ICON = <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 13c0-3 2.7-5 6-5s6 2 6 5"/></svg>

function getAccountMeta(account) {
  const label = account?.label || 'Account'
  const color = account?.color || '#6366F1'
  const key = label.toLowerCase()
  const icon = ICON_BY_LABEL[key] || DEFAULT_ICON
  return { label, color, bg: color + '1a', textColor: color, icon }
}

const FILTERS = [
  ...STATUS_FILTERS,
  { key: 'trial',  label: 'Trial' },
]

function daysUntil(str) {
  if (!str) return Infinity
  const d = new Date(str + 'T00:00:00')
  const now = new Date(); now.setHours(0,0,0,0)
  return Math.round((d - now) / 86400000)
}

export default function AccountView() {
  const { accountId } = useParams()
  const subscriptions = useStore((s) => s.subscriptions)
  const accounts = useStore((s) => s.accounts)
  const currency = useStore((s) => s.settings.defaultCurrency) || 'JPY'

  const [statusFilter, setStatus] = useState('all')
  const [emailFilter, setEmail]   = useState('all')
  const [drawerOpen, setDrawer]   = useState(false)

  const account = accounts.find((a) => a.id === accountId)
  const meta = getAccountMeta(account)
  const emails = account?.emails || []

  const acctSubs = subscriptions.filter((s) => {
   if (!account) return false
    // Match by ID for new subs that store accountId, or by label for older ones
   if (s.accountId) return s.accountId === account.id
   return s.accountType?.toLowerCase() === account.label?.toLowerCase()
   })

  const filtered = useMemo(() => {
    let list = acctSubs.filter((s) => matchesStatusFilter(s, statusFilter))
    if (emailFilter !== 'all') list = list.filter((s) => s.accountEmail === emailFilter)
    return [...list].sort((a, b) => daysUntil(a.nextBillingDate) - daysUntil(b.nextBillingDate))
    
  }, [acctSubs, statusFilter, emailFilter])

  const activeSubs = acctSubs.filter(s => normalizeStatus(s.status) !== 'cancelled')
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + toMonthlyIn(s, currency), 0)
  const urgentCount  = activeSubs.filter((s) => daysUntil(s.nextBillingDate) <= 7 && daysUntil(s.nextBillingDate) >= 0).length
  const trialCount   = activeSubs.filter((s) => normalizeStatus(s.status) === 'trial').length
  const undecidedCount = activeSubs.filter((s) => normalizeStatus(s.status) === 'undecided').length

  const fmtMonthly = fmt(monthlyTotal, currency)

  return (
    <>
      <div className={styles.page}>
        {/* Account header */}
        <div className={styles.acctHeader}>
          <div className={styles.headerRow}>
            <div className={styles.avatarLg} style={{ background: meta.bg, borderColor: meta.color, color: meta.color }}>
              {meta.icon}
            </div>
            <div>
              <div className={styles.acctBadge} style={{ background: meta.bg, color: meta.textColor }}>
                {meta.label}
              </div>
              <div className={styles.acctName}>{meta.label} account</div>
              <div className={styles.acctSub}>{acctSubs.length} subscriptions across {emails.length} email{emails.length !== 1 ? 's' : ''}</div>
            </div>
            <button className={styles.addBtn} onClick={() => setDrawer(true)} style={{ marginLeft: 'auto' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="white" strokeWidth="2">
                <line x1="6.5" y1="1" x2="6.5" y2="12"/><line x1="1" y1="6.5" x2="12" y2="6.5"/>
              </svg>
              Add subscription
            </button>
          </div>

          {/* Email pills */}
          {emails.length > 0 && (
            <div className={styles.emailPills}>
              <button
                className={`${styles.pill} ${emailFilter === 'all' ? styles.pillActive : ''}`}
                style={emailFilter === 'all' ? { borderColor: meta.color, background: meta.bg, color: meta.textColor } : {}}
                onClick={() => setEmail('all')}
              >
                <span className={styles.pillDot} style={{ background: meta.color }} />
                All emails
                <span className={styles.pillCount}>{acctSubs.length}</span>
              </button>
              {emails.map((email) => {
                const count = acctSubs.filter((s) => s.accountEmail === email).length
                return (
                  <button
                    key={email}
                    className={`${styles.pill} ${emailFilter === email ? styles.pillActive : ''}`}
                    style={emailFilter === email ? { borderColor: meta.color, background: meta.bg, color: meta.textColor } : {}}
                    onClick={() => setEmail(emailFilter === email ? 'all' : email)}
                  >
                    <span className={styles.pillDot} style={{ background: meta.color }} />
                    {email}
                    <span className={styles.pillCount}>{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Metrics strip */}
        <div className={styles.metricsStrip}>
          {[
            { label: 'Monthly spend',    value: fmtMonthly,              sub: `${activeSubs.length} active services` },
            { label: 'Renewing soon',    value: String(urgentCount),     sub: 'Within 7 days', urgent: urgentCount > 0 },
            { label: 'Trials ending',    value: String(trialCount),      sub: 'Need a decision', warn: trialCount > 0 },
            { label: 'Undecided',        value: String(undecidedCount),  sub: 'Marked undecided' },
          ].map(({ label, value, sub, urgent, warn }) => (
            <div key={label} className={styles.metricCard}>
              <div className={styles.metricLabel}>{label}</div>
              <div className={styles.metricVal} style={urgent ? { color: 'var(--red)' } : warn ? { color: 'var(--amber)' } : {}}>{value}</div>
              <div className={styles.metricSub} style={urgent ? { color: 'var(--red)' } : warn ? { color: 'var(--amber)' } : {}}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterLeft}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${statusFilter === f.key ? styles.filterActive : ''}`}
                style={statusFilter === f.key ? { background: meta.bg, borderColor: meta.color, color: meta.textColor } : {}}
                onClick={() => setStatus(f.key)}
                aria-pressed={statusFilter === f.key}
              >
                {f.color && <span className={styles.statusDot} style={{ background: f.color }} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subscription list */}
        <div className={styles.content}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>No subscriptions found</div>
              <div className={styles.emptySub}>
                {acctSubs.length === 0
                  ? `No subscriptions linked to your ${meta.label} account yet.`
                  : 'Try adjusting your filters.'}
              </div>
              {acctSubs.length === 0 && (
                <button className={styles.emptyBtn} style={{ background: meta.color }} onClick={() => setDrawer(true)}>
                  Add subscription
                </button>
              )}
            </div>
          ) : (
            <div className={styles.subList}>
              {filtered.map((sub) => <SubRow key={sub.id} sub={sub} showAccount={false} />)}
            </div>
          )}
        </div>
      </div>

      <AddSubDrawer
        open={drawerOpen}
        onClose={() => setDrawer(false)}
        defaultAccountId={accountId}
      />
    </>
  )
}
