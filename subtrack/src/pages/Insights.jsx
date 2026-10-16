import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import styles from './Insights.module.css'
import { toMonthlyIn, fmt } from '../utils/currency'
import ServiceLogo from '../components/ServiceLogo'

function daysUntil(str) {
  if (!str) return Infinity
  const d = new Date(str + 'T00:00:00')
  const now = new Date(); now.setHours(0,0,0,0)
  return Math.round((d - now) / 86400000)
}

export default function Insights() {
  const navigate = useNavigate()
  const subscriptions = useStore((s) => s.subscriptions)
  const settings = useStore((s) => s.settings)
  const cur = settings.defaultCurrency

  const active = subscriptions.filter((s) => s.status !== 'cancelled')

  const monthlyTotal = useMemo(() => active.reduce((sum, s) => sum + toMonthlyIn(s, cur), 0), [active, cur])
  const yearlyTotal  = monthlyTotal * 12

  // By category
  const byCategory = useMemo(() => {
    const map = {}
    active.forEach((s) => {
      const cat = s.category || 'Other'
      if (!map[cat]) map[cat] = 0
      map[cat] += toMonthlyIn(s, cur)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [active, cur])

  // By account
  const byAccount = useMemo(() => {
    const map = {}
    active.forEach((s) => {
      const k = s.accountType
      if (!map[k]) map[k] = { total: 0, count: 0 }
      map[k].total += toMonthlyIn(s, cur)
      map[k].count++
    })
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total)
  }, [active, cur])

  const maxCatAmt = byCategory[0]?.[1] || 1

  // Most expensive services
  const topServices = [...active].sort((a, b) => toMonthlyIn(b, cur) - toMonthlyIn(a, cur)).slice(0, 5)

  // Insights
  const insights = useMemo(() => {
    const list = []

    // Cancel soon items
    const cancelSoon = active.filter((s) => s.status === 'cancel')
    if (cancelSoon.length > 0) {
      const saving = cancelSoon.reduce((sum, s) => sum + toMonthlyIn(s, cur), 0)
      list.push({
        type: 'cancel',
        icon: '💸',
        title: `Cancel ${cancelSoon.length} marked subscription${cancelSoon.length > 1 ? 's' : ''} to save ${fmt(saving * 12, cur)}/year`,
        desc: cancelSoon.map((s) => s.name).join(', '),
        action: 'Review →',
        sub: cancelSoon[0],
        color: 'var(--red)',
        bg: 'var(--red-bg)',
      })
    }

    // Trials ending soon
    const trials = active.filter((s) => s.status === 'trial' && daysUntil(s.trialEndDate) <= 7 && daysUntil(s.trialEndDate) >= 0)
    if (trials.length > 0) {
      list.push({
        type: 'trial',
        icon: '⚡',
        title: `${trials.length} trial${trials.length > 1 ? 's' : ''} ending within 7 days`,
        desc: trials.map((s) => `${s.name} (${daysUntil(s.trialEndDate)}d)`).join(', '),
        action: 'Decide now →',
        sub: trials[0],
        color: 'var(--amber)',
        bg: 'var(--amber-bg)',
      })
    }

    // Large annual renewals
    const bigAnnual = active.filter((s) => s.cycle === 'Yearly' && daysUntil(s.nextBillingDate) <= 30 && daysUntil(s.nextBillingDate) >= 0)
    if (bigAnnual.length > 0) {
      list.push({
        type: 'annual',
        icon: '📅',
        title: `${bigAnnual.length} annual plan${bigAnnual.length > 1 ? 's' : ''} renewing this month`,
        desc: bigAnnual.map((s) => `${s.name}: ${fmt(s.amount, s.currency)}`).join(' · '),
        action: 'Review →',
        sub: bigAnnual[0],
        color: 'var(--indigo)',
        bg: 'var(--indigo-light)',
      })
    }

    // Undecided subscriptions
    const undecided = active.filter((s) => s.status === 'undecided')
    if (undecided.length > 0) {
      list.push({
        type: 'undecided',
        icon: '🤔',
        title: `${undecided.length} subscription${undecided.length > 1 ? 's' : ''} still undecided`,
        desc: `${undecided.map((s) => s.name).join(', ')} — make a decision before they renew`,
        action: 'Review →',
        sub: undecided[0],
        color: 'var(--text2)',
        bg: 'var(--bg2)',
      })
    }

    return list
  }, [active, cur])

  const ACCT_LABELS = { personal: 'Personal', work: 'Work', school: 'School' }
  const ACCT_COLORS = { personal: 'var(--acct-personal)', work: 'var(--acct-work)', school: 'var(--acct-school)' }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Financial Insights</h1>
        <p className={styles.sub}>Based on {active.length} active subscriptions</p>
      </div>

      <div className={styles.body}>
        {/* Metric strip */}
        <div className={styles.metricStrip}>
          {[
            { label: 'Monthly total',  value: fmt(monthlyTotal, cur), sub: `${active.length} services`,   color: '' },
            { label: 'Yearly total',   value: fmt(yearlyTotal, cur),  sub: 'projected spend',            color: '' },
            { label: 'Avg per service',value: fmt(active.length ? monthlyTotal / active.length : 0, cur), sub: 'per month',  color: '' },
            { label: 'Cancel & save',  value: fmt(active.filter(s => s.status === 'cancel').reduce((a, s) => a + toMonthlyIn(s, cur), 0) * 12, cur),
              sub: 'potential yearly saving', color: active.filter(s => s.status === 'cancel').length ? 'var(--green)' : '' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className={styles.mcard}>
              <div className={styles.mcardLabel}>{label}</div>
              <div className={styles.mcardVal} style={color ? { color } : {}}>{value}</div>
              <div className={styles.mcardSub}>{sub}</div>
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          {/* Category breakdown */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Spend by category</div>
            {byCategory.length === 0 ? (
              <div className={styles.cardEmpty}>No data yet</div>
            ) : byCategory.map(([cat, amt]) => (
              <div key={cat} className={styles.barRow}>
                <div className={styles.barLabel}>{cat}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(amt / maxCatAmt) * 100}%` }} />
                </div>
                <div className={styles.barAmt}>{fmt(amt, cur)}<span className={styles.barSub}>/mo</span></div>
              </div>
            ))}
          </div>

          {/* By account */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Spend by account</div>
            {byAccount.map(([acct, { total, count }]) => (
              <div key={acct} className={styles.acctRow}
                onClick={() => navigate(`/accounts/${acct}`)}
                style={{ cursor: 'pointer' }}>
                <span className={styles.acctDot} style={{ background: ACCT_COLORS[acct] || 'var(--indigo)' }} />
                <div className={styles.acctInfo}>
                  <div className={styles.acctLabel}>{ACCT_LABELS[acct] || acct}</div>
                  <div className={styles.acctCount}>{count} subscription{count !== 1 ? 's' : ''}</div>
                </div>
                <div className={styles.acctAmt}>{fmt(total, cur)}<span className={styles.barSub}>/mo</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Top services */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Most expensive services</div>
          {topServices.map((sub, i) => (
            <div key={sub.id} className={styles.topRow}
              onClick={() => navigate(`/subscriptions/${sub.id}`)}>
              <span className={styles.topRank}>#{i + 1}</span>
              <div className={styles.topLogo} style={{ background: sub.logoBg, color: sub.logoFg }}><ServiceLogo service={sub} /></div>
              <div className={styles.topInfo}>
                <div className={styles.topName}>{sub.name}</div>
                <div className={styles.topMeta}>{sub.cycle} · {sub.accountEmail}</div>
              </div>
              <div className={styles.topAmt}>
                <div className={styles.topAmtVal}>{fmt(toMonthlyIn(sub, cur), cur)}<span className={styles.barSub}>/mo</span></div>
                <div className={styles.topAmtYear}>{fmt(toMonthlyIn(sub, cur) * 12, cur)}/yr</div>
              </div>
            </div>
          ))}
        </div>

        {/* Insight cards */}
        {insights.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Action items</div>
            {insights.map((ins, i) => (
              <div key={i} className={styles.insightItem}
                onClick={() => ins.sub && navigate(`/subscriptions/${ins.sub.id}`)}>
                <div className={styles.insightIcon} style={{ background: ins.bg, color: ins.color }}>
                  {ins.icon}
                </div>
                <div className={styles.insightBody}>
                  <div className={styles.insightTitle}>{ins.title}</div>
                  <div className={styles.insightDesc}>{ins.desc}</div>
                  {ins.sub && <div className={styles.insightAction}>{ins.action}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
