import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import StatusChip from '../components/StatusChip'
import ConfirmModal from '../components/ConfirmModal'
import AddSubDrawer from '../components/AddSubDrawer'
import ServiceLogo from '../components/ServiceLogo'
import { normalizeStatus } from '../utils/status'
import styles from './SubscriptionDetail.module.css'

const CURRENCY_SYM = { JPY: '¥', USD: '$', EUR: '€', GBP: '£', NTD: 'NT$', CNY: '¥', HKD: 'HK$' }

function formatDate(str) {
  if (!str) return null
  const d = new Date(str + 'T00:00:00')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function daysUntil(str) {
  if (!str) return null
  const d = new Date(str + 'T00:00:00')
  const now = new Date(); now.setHours(0,0,0,0)
  return Math.round((d - now) / 86400000)
}

function toMonthly(amount, cycle) {
  const m = { Monthly: 1, Yearly: 1/12, Quarterly: 1/3, Weekly: 4.33, Custom: 1 }
  return amount * (m[cycle] || 1)
}

function fmtAmount(amount, currency) {
  const sym = CURRENCY_SYM[currency] || currency
  return currency === 'JPY'
    ? sym + Math.round(amount).toLocaleString()
    : sym + amount.toFixed(2)
}

const STATUS_OPTIONS = [
  { key: 'keep',      label: 'Keep',              dotCls: styles.dotKeep,      selCls: styles.selKeep },
  { key: 'undecided', label: 'Undecided for now', dotCls: styles.dotUndecided, selCls: styles.selUndecided },
  { key: 'cancel',    label: 'Cancel soon',       dotCls: styles.dotCancel,    selCls: styles.selCancel },
]

export default function SubscriptionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const sub = useStore((s) => s.subscriptions.find((x) => x.id === id))
  const updateSubscription = useStore((s) => s.updateSubscription)
  const deleteSubscription = useStore((s) => s.deleteSubscription)

  const [notes,      setNotes]      = useState(sub?.notes || '')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)

  if (!sub) {
    return (
      <div className={styles.notFound}>
        <p>Subscription not found.</p>
        <button onClick={() => navigate('/subscriptions')} className={styles.backLink}>
          Back to subscriptions
        </button>
      </div>
    )
  }

  const monthly  = toMonthly(sub.amount, sub.cycle)
  const yearly   = monthly * 12
  const days     = daysUntil(sub.nextBillingDate)
  const trialDays = sub.trialEndDate ? daysUntil(sub.trialEndDate) : null
  const isUrgent  = (days !== null && days <= 2) || (trialDays !== null && trialDays <= 3)

  const daysText = days === null ? null
    : days === 0 ? 'Today'
    : days === 1 ? 'Tomorrow'
    : days < 0   ? 'Overdue'
    : `${days} days`

  const handleStatus = async (key) => {
    try { await updateSubscription(id, { status: key }) }
    catch (err) { alert(err.message) }
  }

  const handleReminder = async (key) => {
    try {
      await updateSubscription(id, {
        reminders: { ...sub.reminders, [key]: !sub.reminders[key] },
      })
    } catch (err) { alert(err.message) }
  }

  const handleNotesBlur = async () => {
    try { await updateSubscription(id, { notes }) }
    catch (err) { alert(err.message) }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9,2 4,7 9,12"/>
        </svg>
        Back
      </button>

      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroLogo} style={{ background: sub.logoBg, color: sub.logoFg }}>
            <ServiceLogo service={sub} />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroName}>{sub.name}</div>
            <div className={styles.heroCat}>{sub.category} · {sub.cycle}</div>
            <div style={{ marginTop: 8 }}><StatusChip status={sub.status} /></div>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.btnOutline} onClick={() => setEditOpen(true)}>Edit</button>
            <button className={styles.btnDanger} onClick={() => setDeleteOpen(true)}>Delete</button>
          </div>
        </div>

        <div className={styles.priceBand}>
          <div>
            <div className={styles.priceLabel}>Amount</div>
            <div className={styles.priceVal}>{fmtAmount(sub.amount, sub.currency)}</div>
            <div className={styles.priceCycle}>per {sub.cycle.toLowerCase()}</div>
          </div>
          <div>
            <div className={styles.priceLabel}>Yearly cost</div>
            <div className={styles.priceVal}>{fmtAmount(yearly, sub.currency)}</div>
            <div className={styles.priceCycle}>if kept all year</div>
          </div>
          <div>
            <div className={styles.priceLabel}>Next renewal</div>
            <div
              className={styles.priceVal}
              style={isUrgent ? { color: 'var(--red)', fontSize: 16 } : { fontSize: 16 }}
            >
              {formatDate(sub.nextBillingDate)?.split(',')[0] ?? 'Not set'}
            </div>
            {daysText && (
              <div className={styles.priceCycle} style={isUrgent ? { color: 'var(--red)' } : {}}>
                {daysText}
              </div>
            )}
          </div>
        </div>
      </div>

      {(sub.status === 'cancel' || isUrgent) && (
        <div className={styles.urgencyBanner}>
          <span className={styles.urgencyDot} />
          <span className={styles.urgencyText}>
            {sub.status === 'cancel'
              ? `Renews in ${daysText}. You marked this for cancellation.`
              : `Renews in ${daysText}. Action needed.`}
          </span>
          {sub.cancellationUrl && (
            <a
              className={styles.urgencyAction}
              href={sub.cancellationUrl.startsWith('http') ? sub.cancellationUrl : 'https://' + sub.cancellationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Go to cancellation
            </a>
          )}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Subscription details</div>
            {[
              ['Service',       sub.name],
              ['Category',      sub.category],
              ['Billing cycle', sub.cycle],
              ['Auto-renew',    sub.autoRenew ? 'Yes' : 'No'],
              ['Next billing',  formatDate(sub.nextBillingDate) ?? 'Not set'],
              sub.trialEndDate ? ['Trial ends', formatDate(sub.trialEndDate)] : null,
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className={styles.infoRow}>
                <span className={styles.infoLabel}>{k}</span>
                <span
                  className={styles.infoVal}
                  style={k === 'Next billing' && isUrgent ? { color: 'var(--red)' } : {}}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Account and payment</div>
            {[
              ['Account',    sub.accountEmail],
              ['Type',       sub.accountType.charAt(0).toUpperCase() + sub.accountType.slice(1)],
              ['Payment',    sub.card4 ? `${sub.payment} ···· ${sub.card4}` : sub.payment || 'Not set'],
              ['Currency',   sub.currency],
              ['Billed via', sub.billedVia || 'Not set'],
            ].map(([k, v]) => (
              <div key={k} className={styles.infoRow}>
                <span className={styles.infoLabel}>{k}</span>
                <span className={styles.infoVal}>{v}</span>
              </div>
            ))}
          </div>

          {(sub.cancellationUrl || sub.cancellationNotes) && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Cancellation</div>
              {sub.cancellationNotes && (
                <div className={styles.cancelNote}>{sub.cancellationNotes}</div>
              )}
              {sub.cancellationUrl && (
                <div className={styles.infoRow} style={{ marginTop: sub.cancellationNotes ? 10 : 0 }}>
                  <span className={styles.infoLabel}>Cancellation page</span>
                  <a
                    className={styles.infoLink}
                    href={sub.cancellationUrl.startsWith('http') ? sub.cancellationUrl : 'https://' + sub.cancellationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {sub.cancellationUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Decision status</div>
            <div className={styles.statusGroup}>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`${styles.statusBtn} ${normalizeStatus(sub.status) === opt.key ? opt.selCls : ''}`}
                  onClick={() => handleStatus(opt.key)}
                >
                  <span className={`${styles.statusDot} ${opt.dotCls}`} />
                  <span className={styles.statusLabel}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Notes</div>
            <textarea
              className={styles.notesBox}
              rows={4}
              placeholder="Add a note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
            />
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Reminders</div>
            {[
              ['days7', '7 days before'],
              ['days3', '3 days before'],
              ['onDay', 'On billing day'],
            ].map(([key, label]) => (
              <div key={key} className={styles.infoRow}>
                <span className={styles.infoLabel}>{label}</span>
                <button
                  className={styles.reminderToggle}
                  style={{ color: sub.reminders?.[key] ? 'var(--indigo)' : 'var(--text3)' }}
                  onClick={() => handleReminder(key)}
                >
                  {sub.reminders?.[key] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title={`Delete "${sub.name}"?`}
        message="This permanently removes the subscription and all its history. This cannot be undone."
        confirmLabel="Delete subscription"
        variant="danger"
        onConfirm={() => {
          setDeleteOpen(false)
          deleteSubscription(id)
            .then(() => navigate('/subscriptions'))
            .catch((err) => alert(err.message))
        }}
        onCancel={() => setDeleteOpen(false)}
      />

      <AddSubDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        subscription={sub}
      />
    </div>
  )
}
