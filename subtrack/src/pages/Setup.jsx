import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import styles from './Setup.module.css'
import LoadingWave from '../components/LoadingWave'
import { AUTH_PREVIEW, previewRequest } from '../utils/authPreview'

const CURRENCIES = ['JPY', 'USD', 'EUR', 'GBP', 'NTD', 'KRW']

const LABEL_DEFS = [
  { id: 'personal', label: 'Personal' },
  { id: 'work', label: 'Work' },
  { id: 'school', label: 'School' },
  { id: 'other', label: 'Other' }
]

const labelById = (id) => LABEL_DEFS.find((l) => l.id === id) || LABEL_DEFS[0]

function StepDot({ n, label, current }) {
  const done = n < current
  const active = n === current
  return (
    <div className={styles.progressItem}>
      <div
        className={`${styles.dot} ${done ? styles.dotDone : active ? styles.dotActive : ''}`}
      >
        {done ? '✓' : n}
      </div>
      <div
        className={`${styles.progLabel} ${active ? styles.progLabelActive : ''}`}
      >
        {label}
      </div>
    </div>
  )
}

export default function Setup() {
  const navigate = useNavigate()
  const completeSetup = useStore((s) => s.completeSetup)
  const saveSetupDraft = useStore((s) => s.saveSetupDraft)
  const draftError = useStore((s) => s.draftError)
  const signupEmail = useStore((s) =>
    AUTH_PREVIEW ? s.previewSession?.email || '' : s.user?.email || ''
  )
  const draft = useRef(useStore.getState().setupDraft).current

  const [step, setStep] = useState(draft?.step || 1)
  const TOTAL = 4
  const STEP_LABELS = ['Profile', 'Inboxes', 'Currency', 'Review']

  const existingName = useStore((s) => s.settings.displayName || '')
    .trim()
    .split(/\s+/)
  const [firstName, setFirst] = useState(
    draft?.firstName ?? existingName[0] ?? ''
  )
  const [lastName, setLast] = useState(
    draft?.lastName ?? existingName.slice(1).join(' ')
  )

  // Inbox rows: each has email + label id. First row seeded when entering step 2.
  const [emails, setEmails] = useState(draft?.emails || [])
  const [emailError, setEmailError] = useState('')
  const [openLabelMenu, setOpenLabelMenu] = useState(null)

  const [currency, setCurrency] = useState(draft?.currency || 'JPY')
  const [reminders, setReminders] = useState(
    draft?.reminders || {
      days7: true,
      days3: true,
      onDay: false,
      trialAlert: true
    }
  )
  const [launching, setLaunching] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (launching) return
    try {
      saveSetupDraft({ step, firstName, lastName, emails, currency, reminders })
    } catch {
      setSaveError(
        'Your browser could not save this preview draft. Please allow browser storage.'
      )
    }
  }, [
    step,
    firstName,
    lastName,
    emails,
    currency,
    reminders,
    launching,
    saveSetupDraft
  ])

  const seedInboxes = () => {
    if (!emails.length) setEmails([{ email: signupEmail, label: 'personal' }])
  }
  const addEmail = () => {
    if (emails.length < 8)
      setEmails((rows) => [...rows, { email: '', label: 'other' }])
  }
  const updateEmail = (i, key, value) =>
    setEmails((rows) =>
      rows.map((row, index) => (index === i ? { ...row, [key]: value } : row))
    )
  const removeEmail = (i) => {
    if (emails.length > 1)
      setEmails((rows) => rows.filter((_, index) => index !== i))
  }
  const validateStep2 = () => {
    const values = emails.map((row) => row.email.trim().toLowerCase())
    if (
      !values.length ||
      values.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      setEmailError('Enter a valid email in each row, or remove the empty row.')
      return false
    }
    if (new Set(values).size !== values.length) {
      setEmailError('List each subscription email only once.')
      return false
    }
    setEmailError('')
    return true
  }
  const next = () => {
    if (step === 1) seedInboxes()
    if (step === 2 && !validateStep2()) return
    if (step < TOTAL) setStep((value) => value + 1)
  }
  const prev = () => {
    if (step > 1) setStep((value) => value - 1)
  }

  const launch = async () => {
    if (launching) return
    setLaunching(true)
    setSaveError('')
    const displayName =
      [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') ||
      'Your Name'
    const colors = {
      personal: '#534AB7',
      work: '#BA7517',
      school: '#1D9E75',
      other: '#5A5A64'
    }
    const groups = LABEL_DEFS.map((def) => ({
      label: def.label,
      color: colors[def.id],
      emails: emails
        .filter((row) => row.label === def.id)
        .map((row) => row.email.trim())
    })).filter((group) => group.emails.length)
    try {
      if (AUTH_PREVIEW) await previewRequest()
      await completeSetup(
        { displayName, signupEmail, defaultCurrency: currency, reminders },
        groups
      )
      navigate('/home', { replace: true })
    } catch (err) {
      setSaveError(
        err.message || 'Unable to save your setup. Your details are still here.'
      )
      setLaunching(false)
    }
  }

  useEffect(() => {
    if (openLabelMenu === null) return
    const close = () => setOpenLabelMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openLabelMenu])

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Enter' || launching) return
      const tag = e.target.tagName
      if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return
      e.preventDefault()
      if (step === TOTAL) launch()
      else next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  if (launching)
    return <LoadingWave fullscreen label="Preparing your dashboard…" />

  return (
    <div className={styles.page}>
      <div className={styles.centerPanel}>
        {/* Progress */}
        <div className={styles.progress}>
          {STEP_LABELS.map((label, i) => (
            <StepDot key={label} n={i + 1} label={label} current={step} />
          ))}
        </div>

        <div className={styles.card}>
          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <div className={styles.stepContent} key="s1">
              <div className={styles.stepTag}>Step 1 of {TOTAL}</div>
              <div className={styles.stepTitle}>Let's start with you</div>
              <div className={styles.stepSub}>
                A few basics so SubTrack can personalize your dashboard.
              </div>

              <div className={styles.formRow2}>
                <div className={styles.field}>
                  <label className={styles.label}>First name</label>
                  <input
                    className={styles.input}
                    value={firstName}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last name</label>
                  <input
                    className={styles.input}
                    value={lastName}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>SubTrack sign-in email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={signupEmail}
                  readOnly
                  aria-label="SubTrack sign-in email"
                  placeholder="you@example.com"
                />
                <div className={styles.fieldHint}>
                  This is the email you used to create SubTrack. You can also
                  use it to organize your subscriptions.
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Inboxes ── */}
          {step === 2 && (
            <div className={styles.stepContent} key="s2">
              <div className={styles.stepTag}>Step 2 of {TOTAL}</div>
              <div className={styles.stepTitle}>
                Add the inboxes you want to track
              </div>
              <div className={styles.stepSub}>
                Organize the emails you use for subscriptions into Personal,
                Work, School, or Other. These are labels for your subscriptions;
                no extra sign-in is required.
              </div>

              <div className={styles.emailList}>
                {emails.map((row, i) => (
                  <div key={i} className={styles.emailRow}>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="you@example.com"
                      value={row.email}
                      onChange={(e) => updateEmail(i, 'email', e.target.value)}
                      style={{ flex: 1 }}
                    />

                    <div
                      className={styles.groupDrop}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={styles.groupDropBtn}
                        onClick={() =>
                          setOpenLabelMenu(openLabelMenu === i ? null : i)
                        }
                      >
                        <span
                          className={`${styles.labelDot} ${styles[`dot_${row.label}`]}`}
                        />
                        <span>{labelById(row.label).label}</span>
                        <svg
                          width="10"
                          height="6"
                          viewBox="0 0 10 6"
                          fill="none"
                        >
                          <path
                            d="M1 1l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      {openLabelMenu === i && (
                        <div className={styles.groupDropMenu}>
                          {LABEL_DEFS.map(({ id, label }) => (
                            <button
                              key={id}
                              type="button"
                              className={`${styles.groupDropItem} ${row.label === id ? styles.groupDropItemActive : ''}`}
                              onClick={() => {
                                updateEmail(i, 'label', id)
                                setOpenLabelMenu(null)
                              }}
                            >
                              <span
                                className={`${styles.labelDot} ${styles[`dot_${id}`]}`}
                              />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {emails.length > 1 && (
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeEmail(i)}
                        aria-label="Remove inbox"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <line x1="1" y1="1" x2="11" y2="11" />
                          <line x1="11" y1="1" x2="1" y2="11" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {emailError && (
                <div className={styles.emailError}>{emailError}</div>
              )}

              <button className={styles.addEmailBtn} onClick={addEmail}>
                <svg
                  viewBox="0 0 13 13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <line x1="6.5" y1="1" x2="6.5" y2="12" />
                  <line x1="1" y1="6.5" x2="12" y2="6.5" />
                </svg>
                Add another inbox
              </button>

              <div className={styles.infoNote}>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 7v4M8 5.5v.5" />
                </svg>
                SubTrack never reads your inbox. Emails are used to label and
                group subscriptions only.
              </div>
            </div>
          )}

          {/* ── Step 3: Currency & Reminders ── */}
          {step === 3 && (
            <div className={styles.stepContent} key="s3">
              <div className={styles.stepTag}>Step 3 of {TOTAL}</div>
              <div className={styles.stepTitle}>Set your preferences</div>
              <div className={styles.stepSub}>
                Defaults you can change later in Settings.
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Default currency</label>
                <div className={styles.currGrid}>
                  {CURRENCIES.map((c) => (
                    <div
                      key={c}
                      className={`${styles.currCard} ${currency === c ? styles.currSelected : ''}`}
                      onClick={() => setCurrency(c)}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Reminders</label>
                {[
                  ['days7', '7 days before renewal'],
                  ['days3', '3 days before renewal'],
                  ['onDay', 'On billing day'],
                  ['trialAlert', '2 days before trial ends']
                ].map(([key, lbl]) => (
                  <div key={key} className={styles.reminderRow}>
                    <div className={styles.reminderLabel}>{lbl}</div>
                    <button
                      className={`${styles.toggle} ${reminders[key] ? styles.toggleOn : ''}`}
                      onClick={() =>
                        setReminders((r) => ({ ...r, [key]: !r[key] }))
                      }
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Review (3-column scan) ── */}
          {step === 4 && (
            <div className={styles.stepContent} key="s4">
              <div className={styles.stepTag}>Step 4 of {TOTAL}</div>
              <div className={styles.stepTitle}>Everything looks good</div>
              <div className={styles.stepSub}>
                Review your setup. Any of this can be changed later in Settings.
              </div>

              <div className={styles.reviewGrid}>
                {/* Column 1: Profile */}
                <div className={styles.reviewCol}>
                  <div className={styles.reviewEyebrow}>Profile</div>
                  <div className={styles.reviewItem}>
                    <div className={styles.reviewItemKey}>Name</div>
                    <div className={styles.reviewItemVal}>
                      {fullName || 'Not provided'}
                    </div>
                  </div>
                  <div className={styles.reviewItem}>
                    <div className={styles.reviewItemKey}>Primary email</div>
                    <div className={styles.reviewItemVal}>
                      {signupEmail || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Column 2: Inboxes */}
                <div className={styles.reviewCol}>
                  <div className={styles.reviewEyebrow}>Inboxes</div>
                  {emails.filter((e) => e.email.trim()).length === 0 ? (
                    <div className={styles.reviewItemVal}>None added</div>
                  ) : (
                    emails
                      .filter((e) => e.email.trim())
                      .map((e, i) => (
                        <div key={i} className={styles.reviewInboxRow}>
                          <div className={styles.reviewInboxEmail}>
                            {e.email}
                          </div>
                          <span
                            className={`${styles.labelChip} ${styles[`chip_${e.label}`]}`}
                          >
                            <span
                              className={`${styles.labelDot} ${styles[`dot_${e.label}`]}`}
                            />
                            {labelById(e.label).label}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                {/* Column 3: Preferences */}
                <div className={styles.reviewCol}>
                  <div className={styles.reviewEyebrow}>Preferences</div>
                  <div className={styles.reviewItem}>
                    <div className={styles.reviewItemKey}>Currency</div>
                    <div className={styles.reviewItemVal}>{currency}</div>
                  </div>
                  <div className={styles.reviewItem}>
                    <div className={styles.reviewItemKey}>Reminders</div>
                    <div className={styles.reviewItemVal}>
                      {[
                        reminders.days7 && '7 days before',
                        reminders.days3 && '3 days before',
                        reminders.onDay && 'On billing day',
                        reminders.trialAlert && 'Trials ending'
                      ]
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(saveError || draftError) && (
            <div className={styles.emailError} role="alert">
              {saveError || draftError}
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <button
              className={styles.backBtn}
              style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
              onClick={prev}
            >
              Back
            </button>
            <span className={styles.counter}>
              Step {step} of {TOTAL}
            </span>
            {step < TOTAL ? (
              <button className={styles.nextBtn} onClick={next}>
                Continue
              </button>
            ) : (
              <button className={styles.finishBtn} onClick={launch}>
                Go to my dashboard →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
