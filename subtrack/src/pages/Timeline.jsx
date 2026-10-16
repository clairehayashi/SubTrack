import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getFallbackColors } from '../lib/logo'
import ServiceLogo from '../components/ServiceLogo'
import styles from './Timeline.module.css'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

// ─── Small logo bubble used in calendar cells + sidebar ───
function EventLogo({ sub, size = 'sm', onClick, title }) {
  const fallback = getFallbackColors(sub)

  return (
    <button
      type="button"
      className={`${styles.eventLogo} ${styles[size]}`}
      style={{ background: fallback.bg, color: fallback.fg }}
      onClick={onClick}
      title={title || sub.name}
    >
      <ServiceLogo service={sub} />
    </button>
  )
}

export default function Timeline() {
  const navigate = useNavigate()
  const subscriptions = useStore((s) => s.subscriptions)

  const today = new Date()
  const [viewYear,  setYear]  = useState(today.getFullYear())
  const [viewMonth, setMonth] = useState(today.getMonth())

  const changeMonth = (delta) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setMonth(m); setYear(y)
  }

  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay  = new Date(viewYear, viewMonth + 1, 0)
  const startPad = firstDay.getDay()
  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7

  const cells = useMemo(() => {
    return Array.from({ length: totalCells }, (_, i) => {
      const date = new Date(viewYear, viewMonth, i - startPad + 1)
      const isOther = date.getMonth() !== viewMonth
      const isToday = sameDay(date, today)

      const events = subscriptions.filter((sub) => {
        if (!sub.nextBillingDate) return false
        const d = new Date(sub.nextBillingDate + 'T00:00:00')
        return sameDay(d, date)
      })

      const trials = subscriptions.filter((sub) => {
        if (!sub.trialEndDate) return false
        const d = new Date(sub.trialEndDate + 'T00:00:00')
        return sameDay(d, date)
      })

      return { date, isOther, isToday, events, trials }
    })
  }, [viewYear, viewMonth, subscriptions])

  const monthEvents = useMemo(() => {
    const start = new Date(viewYear, viewMonth, 1)
    const end   = new Date(viewYear, viewMonth + 1, 0)
    return subscriptions
      .filter((s) => {
        const d = s.nextBillingDate ? new Date(s.nextBillingDate + 'T00:00:00') : null
        return d && d >= start && d <= end
      })
      .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate))
  }, [viewYear, viewMonth, subscriptions])

  const sym = { JPY: '¥', USD: '$', EUR: '€', GBP: '£' }
  const fmtAmt = (s) => {
    const c = sym[s.currency] || s.currency
    return s.currency === 'JPY' ? c + Math.round(s.amount).toLocaleString() : c + s.amount.toFixed(2)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <h1 className={styles.title}>Timeline</h1>
          <div className={styles.monthNav}>
            <button className={styles.mnavBtn} onClick={() => changeMonth(-1)}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9,2 4,7 9,12"/></svg>
            </button>
            <span className={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
            <button className={styles.mnavBtn} onClick={() => changeMonth(1)}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="5,2 10,7 5,12"/></svg>
            </button>
          </div>
        </div>
        <button className={styles.todayBtn} onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()) }}>
          Today
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.calWrap}>
          <div className={styles.dayHeaders}>
            {DAYS.map((d) => <div key={d} className={styles.dayHeader}>{d}</div>)}
          </div>

          <div className={styles.grid}>
            {cells.map(({ date, isOther, isToday, events, trials }, i) => (
              <div key={i} className={`${styles.cell} ${isOther ? styles.otherMonth : ''} ${isToday ? styles.todayCell : ''}`}>
                <div className={styles.dayNum}>
                  {isToday
                    ? <span className={styles.todayBadge}>{date.getDate()}</span>
                    : <span>{date.getDate()}</span>
                  }
                </div>
                <div className={styles.cellEvents}>
                  {events.slice(0, 3).map((sub) => (
                    <EventLogo
                      key={sub.id}
                      sub={sub}
                      size="sm"
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                    />
                  ))}
                  {trials.slice(0, 1).map((sub) => (
                    <div key={'t' + sub.id} className={styles.trialPin}>
                      <EventLogo
                        sub={sub}
                        size="sm"
                        onClick={() => navigate(`/subscriptions/${sub.id}`)}
                        title={`${sub.name} trial ends`}
                      />
                      <span className={styles.trialDot} title="Trial ending" />
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className={styles.moreLabel}>+{events.length - 3}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--color-brand-500)' }} />
              Renewal
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--color-work-500)' }} />
              Trial ending
            </div>
            <div className={styles.legendItem}>
              <span className={styles.todayBadge} style={{ width: 16, height: 16, fontSize: 10 }}>{today.getDate()}</span>
              Today
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>
            {MONTHS[viewMonth]} renewals
            <span className={styles.sidebarCount}>{monthEvents.length}</span>
          </div>
          {monthEvents.length === 0 ? (
            <div className={styles.sidebarEmpty}>No renewals this month</div>
          ) : (
            <div className={styles.eventList}>
              {monthEvents.map((sub) => {
                const d = new Date(sub.nextBillingDate + 'T00:00:00')
                return (
                  <div key={sub.id} className={styles.eventItem}
                    onClick={() => navigate(`/subscriptions/${sub.id}`)}>
                    <div className={styles.eventDate}>
                      <div className={styles.eventDay}>{d.getDate()}</div>
                      <div className={styles.eventMon}>{MONTHS[d.getMonth()].slice(0,3)}</div>
                    </div>
                    <EventLogo sub={sub} size="md" />
                    <div className={styles.eventInfo}>
                      <div className={styles.eventName}>{sub.name}</div>
                      <div className={styles.eventEmail}>{sub.accountEmail}</div>
                    </div>
                    <div className={styles.eventAmt}>{fmtAmt(sub)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
