import { useNavigate } from 'react-router-dom'
import { getFallbackColors } from '../lib/logo'
import ServiceLogo from './ServiceLogo'
import StatusChip from './StatusChip'
import { normalizeStatus } from '../utils/status'
import styles from './SubRow.module.css'

const CURRENCY_SYM = { JPY: '¥', USD: '$', EUR: '€', GBP: '£', NTD: 'NT$', CNY: '¥', HKD: 'HK$' }

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((d - now) / 86400000)
}

function formatDateShort(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function fmtAmount(amount, currency) {
  const sym = CURRENCY_SYM[currency] || currency
  return currency === 'JPY'
    ? sym + Math.round(amount).toLocaleString()
    : sym + Number(amount).toFixed(2)
}

function shortCycle(cycle) {
  return { Monthly: 'mo', Yearly: 'yr', Quarterly: 'qtr', Weekly: 'wk', Custom: '' }[cycle] || cycle
}

export default function SubRow({ sub, density = 'comfortable' }) {
  const navigate = useNavigate()
  const fallback = getFallbackColors(sub)
  const days = daysUntil(sub.nextBillingDate)
  const trialDays = sub.trialEndDate ? daysUntil(sub.trialEndDate) : null

  // Renewal urgency is shown in the date text.
  // Trial ending within 3 days outranks regular renewal proximity.
  let urgencyClass = ''
  if (trialDays !== null && trialDays >= 0 && trialDays <= 3) urgencyClass = styles.urgent
  else if (days !== null && days >= 0 && days <= 2)           urgencyClass = styles.urgent
  else if (days !== null && days >= 0 && days <= 7)           urgencyClass = styles.warning

  const daysLabel = days === null ? null
    : days === 0 ? 'today'
    : days === 1 ? 'tomorrow'
    : days < 0   ? 'overdue'
    : `${days}d`

  const status = normalizeStatus(sub.status)
  const tone = status === 'keep' ? 'keep'
    : status === 'cancel' || status === 'cancelled' ? 'cancel'
    : 'undecided'
  const openSubscription = () => navigate(`/subscriptions/${sub.id}`)

  return (
    <div
      className={`${styles.row} ${styles[density]} ${styles[tone]}`}
      onClick={openSubscription}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openSubscription()
        }
      }}
      aria-label={`Open ${sub.name}`}
      data-subscription-id={sub.id}
      data-status={status}
      role="button"
      tabIndex={0}
    >
      {/* Logo */}
      <div
        className={styles.logo}
        style={{ background: fallback.bg, color: fallback.fg }}
      >
        <ServiceLogo service={sub} />
      </div>

      {/* Middle */}
      <div className={styles.middle}>
        <div className={styles.name}>{sub.name}</div>
        {density === 'comfortable' && (
          <div className={styles.meta}>
            {sub.category}
            {sub.cycle && sub.cycle !== 'Custom' && ` · ${sub.cycle}`}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className={styles.amount}>
        <div className={styles.amountVal}>{fmtAmount(sub.amount, sub.currency)}</div>
        {sub.cycle && sub.cycle !== 'Custom' && (
          <div className={styles.amountCycle}>/ {shortCycle(sub.cycle)}</div>
        )}
      </div>

      {/* Renewal */}
      <div className={styles.renewal}>
        <div className={styles.renewalDate}>{formatDateShort(sub.nextBillingDate) || '—'}</div>
        {daysLabel && (
          <div className={`${styles.renewalDays} ${urgencyClass}`}>
            {daysLabel}
          </div>
        )}
      </div>

      {/* Status */}
      <div className={styles.status}>
        <StatusChip status={sub.status} />
      </div>

    </div>
  )
}
