import ModalPortal from './ModalPortal'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import styles from './AddSubDrawer.module.css'
import AddAccountModal from './AddAccountModal'
import ServiceLogo from './ServiceLogo'
import LoadingWave from './LoadingWave'
import Dropdown from '../components/Dropdown'   // or './Dropdown' depending on relative path

const SERVICES = [
  { name: 'Netflix',         abbr: 'NF',  logoBg: '#FCEBEB', logoFg: '#A32D2D', website: 'netflix.com',     category: 'Entertainment' },
  { name: 'Spotify',         abbr: 'SP',  logoBg: '#E8F5E8', logoFg: '#27500A', website: 'spotify.com',     category: 'Entertainment' },
  { name: 'YouTube Premium', abbr: 'YT',  logoBg: '#FFF8E1', logoFg: '#633806', website: 'youtube.com',     category: 'Entertainment' },
  { name: 'Apple TV+',       abbr: 'AT',  logoBg: '#F1EFE8', logoFg: '#2C2C2A', website: 'tv.apple.com',    category: 'Entertainment' },
  { name: 'Disney+',         abbr: 'D+',  logoBg: '#E6F1FB', logoFg: '#0C447C', website: 'disneyplus.com',  category: 'Entertainment' },
  { name: 'HBO Max',         abbr: 'HBO', logoBg: '#EEEAF7', logoFg: '#3D247A', website: 'max.com',         category: 'Entertainment' },
  { name: 'Hulu',            abbr: 'HU',  logoBg: '#E7F8EC', logoFg: '#0E6B2C', website: 'hulu.com',        category: 'Entertainment' },
  { name: 'Paramount+',      abbr: 'P+',  logoBg: '#E5EEFB', logoFg: '#0D3A87', website: 'paramountplus.com', category: 'Entertainment' },
  { name: 'Peacock',         abbr: 'PK',  logoBg: '#FFF1E8', logoFg: '#A14B14', website: 'peacocktv.com',   category: 'Entertainment' },
  { name: 'Crunchyroll',     abbr: 'CR',  logoBg: '#FFEFE0', logoFg: '#A04A0B', website: 'crunchyroll.com', category: 'Entertainment' },
  { name: 'Amazon Prime',    abbr: 'AP',  logoBg: '#E6F4FB', logoFg: '#0F5784', website: 'amazon.com',      category: 'Entertainment' },
  { name: 'Audible',         abbr: 'AU',  logoBg: '#FFF1E1', logoFg: '#8C4A09', website: 'audible.com',     category: 'Entertainment' },
  { name: 'Kindle Unlimited',abbr: 'KU',  logoBg: '#E8F2F8', logoFg: '#1B5780', website: 'amazon.com',      category: 'Entertainment' },
  { name: 'Nintendo Switch Online', abbr: 'NS', logoBg: '#FCEAEA', logoFg: '#A02020', website: 'nintendo.com', category: 'Entertainment' },
  { name: 'ChatGPT Plus',    abbr: 'GPT', logoBg: '#F5F0FF', logoFg: '#3C3489', website: 'chatgpt.com',     category: 'Productivity' },
  { name: 'Claude Pro',      abbr: 'CL',  logoBg: '#FCEFE5', logoFg: '#A4521B', website: 'claude.ai',       category: 'Productivity' },
  { name: 'Notion',          abbr: 'NOT', logoBg: '#F5F5F5', logoFg: '#333333', website: 'notion.so',       category: 'Productivity' },
  { name: 'Microsoft 365',   abbr: 'MS',  logoBg: '#E8F4FF', logoFg: '#1466C0', website: 'microsoft.com',   category: 'Productivity' },
  { name: 'Slack',           abbr: 'SL',  logoBg: '#FBEEF6', logoFg: '#7E1F66', website: 'slack.com',       category: 'Productivity' },
  { name: 'Zoom',            abbr: 'ZM',  logoBg: '#E5F0FE', logoFg: '#1259C7', website: 'zoom.us',         category: 'Productivity' },
  { name: 'LinkedIn Premium',abbr: 'LI',  logoBg: '#E6F0F8', logoFg: '#0A4670', website: 'linkedin.com',    category: 'Productivity' },
  { name: 'Grammarly',       abbr: 'GR',  logoBg: '#E9F6EC', logoFg: '#1F6B36', website: 'grammarly.com',   category: 'Productivity' },
  { name: 'Adobe CC',        abbr: 'ADO', logoBg: '#EEEDFE', logoFg: '#3C3489', website: 'adobe.com',       category: 'Design' },
  { name: 'Figma',           abbr: 'FIG', logoBg: '#FFF0F0', logoFg: '#9B3A3A', website: 'figma.com',       category: 'Design' },
  { name: 'Canva Pro',       abbr: 'CAN', logoBg: '#E8F8FF', logoFg: '#0066A1', website: 'canva.com',       category: 'Design' },
  { name: 'GitHub Copilot',  abbr: 'GH',  logoBg: '#F0F0F0', logoFg: '#24292E', website: 'github.com',      category: 'Development' },
  { name: 'Dropbox',         abbr: 'DB',  logoBg: '#E8F0FF', logoFg: '#185FA5', website: 'dropbox.com',     category: 'Cloud' },
  { name: 'iCloud+',         abbr: 'iC',  logoBg: '#E8F4FF', logoFg: '#1A5F9C', website: 'icloud.com',      category: 'Cloud' },
  { name: 'Google One',      abbr: 'G1',  logoBg: '#E8F3FF', logoFg: '#1A4FB8', website: 'one.google.com',  category: 'Cloud' },
  { name: '1Password',       abbr: '1P',  logoBg: '#E5F0FB', logoFg: '#0F548B', website: '1password.com',   category: 'Other' },
  { name: 'NordVPN',         abbr: 'NV',  logoBg: '#E5EEFB', logoFg: '#1A3B8E', website: 'nordvpn.com',     category: 'Other' },
]

const CURRENCIES   = ['JPY', 'USD', 'EUR', 'GBP', 'NTD', 'CNY', 'HKD']
const CYCLES       = ['Monthly', 'Yearly', 'Quarterly', 'Weekly', 'Custom']
const CATEGORIES   = ['Entertainment', 'Productivity', 'Design', 'Development', 'Cloud', 'Education', 'Finance', 'Health', 'Other']
const PAYMENT_METHODS = ['Credit card', 'Debit card', 'PayPal', 'Apple ID', 'Google Play', 'Bank transfer', 'Other']
const BILLED_VIA   = ['Direct', 'App Store', 'Google Play', 'Other']

const EMPTY = {
  name: '', abbr: '', logoBg: '#EEEDFE', logoFg: '#3C3489', website: '',
  category: 'Entertainment', currency: 'JPY', amount: '', cycle: 'Monthly',
  nextBillingDate: '', trialEndDate: '', autoRenew: true,
  reminders: { days7: true, days3: true, onDay: false },
  accountId: '', accountEmail: '', accountType: '',
  payment: '', card4: '', billedVia: 'Direct',
  cancellationUrl: '', cancellationNotes: '',
  status: 'active', notes: '',
}

function calcCosts(amount, cycle, currency) {
  if (!amount || isNaN(amount)) return { monthly: null, yearly: null, perCycle: null }
  const n = parseFloat(amount)
  const sym = { JPY: '¥', USD: '$', EUR: '€', GBP: '£', NTD: 'NT$', CNY: '¥', HKD: 'HK$' }[currency] || currency
  const fmt = (v) => currency === 'JPY' ? sym + Math.round(v).toLocaleString() : sym + v.toFixed(2)

  if (cycle === 'Custom') {
    return { monthly: null, yearly: null, perCycle: fmt(n) }
  }

  const monthly = cycle === 'Monthly' ? n
    : cycle === 'Yearly'    ? n / 12
    : cycle === 'Quarterly' ? n / 3
    : cycle === 'Weekly'    ? n * 4.33
    : n

  return { monthly: fmt(monthly), yearly: fmt(monthly * 12), perCycle: null }
}

export default function AddSubDrawer({ open, onClose, subscription, defaultAccountId }) {
  const addSubscription    = useStore((s) => s.addSubscription)
  const updateSubscription = useStore((s) => s.updateSubscription)
  const defaultCurrency    = useStore((s) => s.settings.defaultCurrency)
  const accounts           = useStore((s) => s.accounts)

  const isEdit = !!subscription
  const presetAccount = !subscription && defaultAccountId
    ? accounts.find((a) => a.id === defaultAccountId)
    : null

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY)
  const [query, setQuery] = useState('')
  const [showSugg, setShowSugg] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stepError, setStepError] = useState('')
  const [addAcctOpen, setAddAcctOpen] = useState(false)
  const overlayRef = useRef(null)
  const initializedFor = useRef(null)

  const canAdvance = (s, f) => {
    if (s === 1) return f.name.trim() !== ''
    if (s === 2) {
      if (!f.amount || !f.nextBillingDate) return false
      const today = new Date().toISOString().split('T')[0]
      return f.nextBillingDate >= today
    }
    if (s === 3) return f.accountId.trim() !== ''
    return true
  }

  const stepErrorMsg = (s, f) => {
    if (s === 1) return 'Please enter a service name to continue.'
    if (s === 2) {
      if (!f.amount || !f.nextBillingDate) return 'Please fill in the amount and next billing date.'
      const today = new Date().toISOString().split('T')[0]
      if (f.nextBillingDate < today) return 'Next billing date cannot be in the past.'
      return ''
    }
    if (s === 3) return 'Please pick which account this subscription belongs to.'
    return ''
  }

  const tryAdvance = () => {
    if (!canAdvance(step, form)) { setStepError(stepErrorMsg(step, form)); return }
    setStepError('')
    setStep((s) => s + 1)
  }

  useEffect(() => {
    if (!open || addAcctOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Enter') {
        const tag = e.target.tagName
        if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return
        if (step < 4) {
          e.preventDefault()
          if (!canAdvance(step, form)) { setStepError(stepErrorMsg(step, form)); return }
          setStepError('')
          setStep((s) => s + 1)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, addAcctOpen, onClose, step, form])

  useEffect(() => {
    if (!open) {
      initializedFor.current = null
      return
    }
    const session = subscription ? `edit:${subscription.id}` : `add:${defaultAccountId || 'picker'}`
    if (initializedFor.current === session) return
    if (!subscription && defaultAccountId && !presetAccount) return
    initializedFor.current = session

    if (subscription) {
      // Edit mode
      const acct = accounts.find((a) =>
        a.id === subscription.accountId ||
        a.label?.toLowerCase() === subscription.accountType?.toLowerCase()
      )
      setForm({
        ...EMPTY,
        ...subscription,
        amount: String(subscription.amount ?? ''),
        accountId: acct?.id || subscription.accountId || '',
        accountEmail: subscription.accountEmail || '',
        accountType: subscription.accountType || '',
      })
      setQuery(subscription.name || '')
    } else if (presetAccount) {
      // Add mode opened from an account page — lock in that account
      setForm({
        ...EMPTY,
        currency: defaultCurrency,
        accountId: presetAccount.id,
        accountEmail: presetAccount.emails?.[0] || '',
        accountType: presetAccount.label?.toLowerCase() || '',
      })
      setQuery('')
    } else {
      // Add mode opened from Home — blank form, user picks account
      setForm({ ...EMPTY, currency: defaultCurrency })
      setQuery('')
    }

    setStep(1)
    setShowSugg(false)
    setSaved(false)
    setStepError('')
    setAddAcctOpen(false)
  }, [open, subscription, defaultAccountId, defaultCurrency, accounts, presetAccount])

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    if (stepError) setStepError('')
  }

  const setReminder = (key) => setForm((f) => ({
    ...f, reminders: { ...f.reminders, [key]: !f.reminders[key] }
  }))

  const pickAccount = (acct) => {
    setForm((f) => ({
      ...f,
      accountId: acct.id,
      accountEmail: acct.emails?.[0] || '',
      accountType: acct.label?.toLowerCase() || '',
    }))
    if (stepError) setStepError('')
  }

  const suggestions = showSugg && query.trim()
    ? SERVICES.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  const pickService = (svc) => {
    setForm((f) => ({
      ...f,
      name: svc.name,
      abbr: svc.abbr,
      logoBg: svc.logoBg,
      logoFg: svc.logoFg,
      website: svc.website,
      category: svc.category || f.category,
    }))
    setQuery(svc.name)
    setShowSugg(false)
    if (stepError) setStepError('')
  }

  const costs = calcCosts(form.amount, form.cycle, form.currency)
  const isCustomCycle = form.cycle === 'Custom'

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) || 0 }
      if (isEdit) {
        await updateSubscription(subscription.id, payload)
      } else {
        await addSubscription(payload)
      }
      setSaved(true)
      setTimeout(() => { onClose() }, 900)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <ModalPortal>
      <div
        className={styles.overlay}
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      >
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit subscription' : 'Add subscription'}>

          <div className={styles.header}>
            <div>
              <div className={styles.title}>
                {isEdit ? 'Edit subscription' : 'Add subscription'}
              </div>
              <div className={styles.stepLabel}>
                Step {step} of 4. {['Service', 'Billing', 'Account', 'Review'][step - 1]}
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="2" y1="2" x2="12" y2="12"/>
                <line x1="12" y1="2" x2="2" y2="12"/>
              </svg>
            </button>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(step / 4) * 100}%` }} />
          </div>

          <div className={styles.body}>

            {/* ── Step 1: Service ── */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.field}>
                  <label className={styles.label}>Service name <span className={styles.req}>*</span></label>
                  <div className={styles.searchWrap}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Type to search or enter manually..."
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); set('name', e.target.value); setShowSugg(true) }}
                      autoFocus
                    />
                    {suggestions.length > 0 && (
                      <div className={styles.suggestions}>
                        {suggestions.map((svc) => (
                          <div key={svc.name} className={styles.suggestion} onClick={() => pickService(svc)}>
                            <div className={styles.suggLogo} style={{ background: svc.logoBg, color: svc.logoFg }}><ServiceLogo service={svc} /></div>
                            <div>
                              <div className={styles.suggName}>{svc.name}</div>
                              <div className={styles.suggDomain}>{svc.website}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Category</label>
                  <div className={styles.chips}>
                    {CATEGORIES.map((c) => (
                      <button key={c} className={`${styles.chip} ${form.category === c ? styles.chipActive : ''}`}
                        onClick={() => set('category', c)}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Service website</label>
                  <input className={styles.input} type="text" placeholder="e.g. netflix.com"
                    value={form.website} onChange={(e) => set('website', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Notes</label>
                  <textarea className={styles.textarea} rows={3} placeholder="Any notes about this subscription..."
                    value={form.notes} onChange={(e) => set('notes', e.target.value)} />
                </div>
              </div>
            )}

            {/* ── Step 2: Billing ── */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.previewBar}>
                  <div className={styles.previewLogo} style={{ background: form.logoBg, color: form.logoFg }}>
                    <ServiceLogo service={form} />
                  </div>
                  <div className={styles.previewName}>{form.name || 'Service name'}</div>
                </div>

                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label className={styles.label}>Currency <span className={styles.req}>*</span></label>
                    <Dropdown
                      value={form.currency}
                      options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                      onChange={(v) => set('currency', v)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Amount <span className={styles.req}>*</span></label>
                    <input className={styles.input} type="number" placeholder="0.00" min="0" step="0.01"
                      value={form.amount} onChange={(e) => set('amount', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Billing cycle <span className={styles.req}>*</span></label>
                    <Dropdown
                      value={form.cycle}
                      options={CYCLES.map((c) => ({ value: c, label: c }))}
                      onChange={(v) => set('cycle', v)}
                    />
                  </div>
                </div>

                {isCustomCycle && (
                  <div className={styles.infoNote}>
                    For Custom billing, SubTrack tracks each renewal date you enter manually. We do not project a monthly cost.
                  </div>
                )}

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Next billing date <span className={styles.req}>*</span></label>
                    <input className={styles.input} type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.nextBillingDate} onChange={(e) => set('nextBillingDate', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Trial end date</label>
                    <input className={styles.input} type="date"
                      value={form.trialEndDate} onChange={(e) => set('trialEndDate', e.target.value)} />
                    <div className={styles.hint}>Leave blank if not a trial</div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Reminders</label>
                  <div className={styles.chips}>
                    {[['days7', '7 days before'], ['days3', '3 days before'], ['onDay', 'On billing day']].map(([k, lbl]) => (
                      <button key={k} className={`${styles.chip} ${form.reminders[k] ? styles.chipActive : ''}`}
                        onClick={() => setReminder(k)}>{lbl}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>Auto-renew</div>
                    <div className={styles.toggleSub}>Subscription renews automatically</div>
                  </div>
                  <button className={`${styles.toggle} ${form.autoRenew ? styles.toggleOn : ''}`}
                    onClick={() => set('autoRenew', !form.autoRenew)}>
                    <span className={styles.toggleThumb} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Account ── */}
            {step === 3 && (
              <div className={styles.stepContent}>

                {presetAccount ? (
                  /* Locked-in account when opened from an account page */
                  <div className={styles.field}>
                    <label className={styles.label}>Account</label>
                    <div className={`${styles.accountCard} ${styles.accountCardLocked}`}>
                      <span className={styles.accountDot} style={{ background: presetAccount.color }} />
                      <div className={styles.accountInfo}>
                        <div className={styles.accountLabel}>{presetAccount.label}</div>
                        {presetAccount.emails?.[0] && (
                          <div className={styles.accountEmail}>{presetAccount.emails[0]}</div>
                        )}
                      </div>
                      <span className={styles.presetBadge}>Adding here</span>
                    </div>
                  </div>
                ) : (
                  /* Open picker when opened from Home or no context */
                  <div className={styles.field}>
                    <label className={styles.label}>Which account is this signed up under? <span className={styles.req}>*</span></label>
                    <div className={styles.hint} style={{ marginBottom: 8 }}>
                      Pick the account you used to sign up for this service.
                    </div>
                    {accounts.length === 0 ? (
                      <div className={styles.emptyAccounts}>
                        You haven't added any accounts yet.
                        <button className={styles.linkBtn} onClick={() => setAddAcctOpen(true)}>
                          Add your first account
                        </button>
                      </div>
                    ) : (
                      <div className={styles.accountList}>
                        {accounts.map((acct) => (
                          <button
                            key={acct.id}
                            type="button"
                            aria-pressed={form.accountId === acct.id}
                            className={`${styles.accountCard} ${form.accountId === acct.id ? styles.accountCardActive : ''}`}
                            onClick={() => pickAccount(acct)}
                          >
                            <span className={styles.accountDot} style={{ background: acct.color }} />
                            <div className={styles.accountInfo}>
                              <div className={styles.accountLabel}>{acct.label}</div>
                              {acct.emails?.[0] && (
                                <div className={styles.accountEmail}>{acct.emails[0]}</div>
                              )}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          className={styles.addAccountInline}
                          onClick={() => setAddAcctOpen(true)}
                        >
                          <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <line x1="6.5" y1="1" x2="6.5" y2="12"/>
                            <line x1="1" y1="6.5" x2="12" y2="6.5"/>
                          </svg>
                          Add a new account
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Payment method</label>
                    <Dropdown
                      value={form.payment}
                      options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
                      onChange={(v) => set('payment', v)}
                      placeholder="Select method"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Card last 4 digits</label>
                    <input className={styles.input} type="text" placeholder="e.g. 4242" maxLength={4}
                      value={form.card4} onChange={(e) => set('card4', e.target.value)} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Billed via</label>
                  <div className={styles.chips}>
                    {BILLED_VIA.map((b) => (
                      <button key={b} className={`${styles.chip} ${form.billedVia === b ? styles.chipActive : ''}`}
                        onClick={() => set('billedVia', b)}>{b}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Cancellation URL</label>
                  <input className={styles.input} type="url" placeholder="https://..."
                    value={form.cancellationUrl} onChange={(e) => set('cancellationUrl', e.target.value)} />
                  <div className={styles.hint}>SubTrack will link here when it's time to cancel</div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Cancellation instructions</label>
                  <textarea className={styles.textarea} rows={3}
                    placeholder="e.g. Must cancel from desktop. App Store cancellation not supported."
                    value={form.cancellationNotes} onChange={(e) => set('cancellationNotes', e.target.value)} />
                </div>
              </div>
            )}

            {/* ── Step 4: Review ── */}
            {step === 4 && (
              <div className={styles.stepContent}>
                {isCustomCycle ? (
                  costs.perCycle && (
                    <div className={styles.costGrid}>
                      <div className={styles.costCard}>
                        <div className={styles.costLabel}>Per billing cycle</div>
                        <div className={styles.costVal}>{costs.perCycle}</div>
                        <div className={styles.costSub}>{form.name} · {form.currency}</div>
                      </div>
                    </div>
                  )
                ) : (
                  costs.monthly && (
                    <div className={styles.costGrid}>
                      <div className={styles.costCard}>
                        <div className={styles.costLabel}>Monthly cost</div>
                        <div className={styles.costVal}>{costs.monthly}</div>
                        <div className={styles.costSub}>{form.name} · {form.currency}</div>
                      </div>
                      <div className={styles.costCard}>
                        <div className={styles.costLabel}>Yearly projection</div>
                        <div className={styles.costVal}>{costs.yearly}</div>
                        <div className={styles.costSub}>if kept all year</div>
                      </div>
                    </div>
                  )
                )}

                {[
                  { heading: 'Service', rows: [
                    ['Name',     form.name || 'Not set'],
                    ['Category', form.category],
                    ['Website',  form.website || 'Not set'],
                  ]},
                  { heading: 'Billing', rows: [
                    ['Amount',        form.amount ? `${form.amount} ${form.currency} per ${form.cycle.toLowerCase()}` : 'Not set'],
                    ['Next renewal',  form.nextBillingDate || 'Not set'],
                    form.trialEndDate ? ['Trial ends', form.trialEndDate] : null,
                    ['Auto-renew',    form.autoRenew ? 'Yes' : 'No'],
                    ['Reminders',     [
                      form.reminders.days7 && '7 days',
                      form.reminders.days3 && '3 days',
                      form.reminders.onDay && 'On day',
                    ].filter(Boolean).join(', ') || 'None'],
                  ].filter(Boolean)},
                  { heading: 'Account', rows: [
                    ['Account',    accounts.find((a) => a.id === form.accountId)?.label || 'Not set'],
                    ['Email',      form.accountEmail || 'Not set'],
                    ['Payment',    [form.payment, form.card4 && `···· ${form.card4}`].filter(Boolean).join(' ') || 'Not set'],
                    ['Billed via', form.billedVia],
                  ]},
                ].map(({ heading, rows }) => (
                  <div key={heading}>
                    <div className={styles.reviewHeading}>{heading}</div>
                    {rows.map(([k, v]) => (
                      <div key={k} className={styles.reviewRow}>
                        <span className={styles.reviewKey}>{k}</span>
                        <span className={styles.reviewVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {stepError && (
            <div className={styles.stepErrorBar}>{stepError}</div>
          )}

          <div className={styles.footer}>
            <button
              className={styles.backBtn}
              onClick={() => { setStep((s) => s - 1); setStepError('') }}
              style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
            >
              Back
            </button>
            <span className={styles.stepCounter}>Step {step} of 4</span>
            {step < 4 ? (
              <button className={styles.nextBtn} onClick={tryAdvance}>Continue</button>
            ) : (
              <button
                className={`${styles.nextBtn} ${saved ? styles.savedBtn : ''}`}
                onClick={handleSave}
                disabled={saving || saved}
              >
                {saved ? 'Saved ✓' : saving ? <LoadingWave compact label="Saving subscription…" /> : (isEdit ? 'Save changes' : 'Add subscription')}
              </button>
            )}
          </div>
        </div>

        <AddAccountModal open={addAcctOpen} onClose={() => setAddAcctOpen(false)} onAdded={pickAccount} />
      </div>
    </ModalPortal>
  )
}
