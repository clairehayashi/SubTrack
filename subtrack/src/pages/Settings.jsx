import ModalPortal from '../components/ModalPortal'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Dropdown from '../components/Dropdown'
import ConfirmModal from '../components/ConfirmModal'
import AddAccountModal from '../components/AddAccountModal'
import AvatarCropper from '../components/AvatarCropper'
import styles from './Settings.module.css'

const SECTIONS = [
  {
    id: 'general',
    label: 'General',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="5.5" r="2.5" />
        <path d="M3 13.5c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" />
      </svg>
    )
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="6" width="12" height="8" rx="1.5" />
        <path d="M5 6V5a3 3 0 016 0v1" />
      </svg>
    )
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="3" y1="5" x2="13" y2="5" />
        <line x1="3" y1="8" x2="13" y2="8" />
        <line x1="3" y1="11" x2="13" y2="11" />
        <circle cx="6" cy="5" r="1.6" fill="currentColor" />
        <circle cx="10" cy="8" r="1.6" fill="currentColor" />
        <circle cx="7" cy="11" r="1.6" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'reminders',
    label: 'Reminders',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 6a4 4 0 018 0v4l1 2H3l1-2V6z" />
        <path d="M6.5 13a1.5 1.5 0 003 0" />
      </svg>
    )
  },
  {
    id: 'data',
    label: 'Data & Privacy',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M8 2l5 2v4c0 3-2.2 5.5-5 6.5-2.8-1-5-3.5-5-6.5V4l5-2z" />
      </svg>
    )
  }
]

const CURRENCY_OPTIONS = ['JPY', 'USD', 'EUR', 'GBP', 'NTD', 'KRW'].map(
  (c) => ({ value: c, label: c })
)

export default function Settings() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.settings)
  const accounts = useStore((s) => s.accounts)
  const subscriptions = useStore((s) => s.subscriptions)
  const updateSettings = useStore((s) => s.updateSettings)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const clearAllData = useStore((s) => s.clearAllData)
  const signOut = useStore((s) => s.signOut)

  const [activeSection, setActiveSection] = useState('general')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [profileName, setProfileName] = useState(settings.displayName || '')
  const [settingsError, setSettingsError] = useState('')
  useEffect(
    () => setProfileName(settings.displayName || ''),
    [settings.displayName]
  )
  const [addAcctOpen, setAddAcctOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deletingAcct, setDeletingAcct] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarError, setAvatarError] = useState('')
  const photoInputRef = useRef(null)

  const close = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/home')
  }

  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === 'Escape' &&
        !avatarFile &&
        !addAcctOpen &&
        !pendingDelete &&
        !clearOpen &&
        !signOutOpen
      )
        close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [avatarFile, addAcctOpen, pendingDelete, clearOpen, signOutOpen])

  const choosePhoto = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Choose a JPG, PNG, or WebP photo.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Choose a photo smaller than 10 MB.')
      return
    }
    setAvatarError('')
    setAvatarFile(file)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const savePreference = async (patch, message) => {
    try {
      await updateSettings(patch)
      setSettingsError('')
      showToast(message)
    } catch (err) {
      setSettingsError(err.message || 'Unable to save your settings.')
    }
  }

  const filteredSections = useMemo(
    () =>
      !search
        ? SECTIONS
        : SECTIONS.filter((s) =>
            s.label.toLowerCase().includes(search.toLowerCase())
          ),
    [search]
  )

  const handleDeleteAccount = async () => {
    if (!pendingDelete) return
    setDeletingAcct(true)
    try {
      await deleteAccount(pendingDelete.id)
      showToast(`${pendingDelete.label} account deleted.`)
      setPendingDelete(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingAcct(false)
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    try {
      await clearAllData()
      showToast('All data cleared.')
      setClearOpen(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setClearing(false)
    }
  }

  const initials = (settings.displayName || 'User')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <ModalPortal>
      <div className={styles.overlay} onClick={close}>
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.closeBtn}
            onClick={close}
            aria-label="Close"
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>

          <aside className={styles.leftRail}>
            <div className={styles.searchWrap}>
              <svg
                className={styles.searchIcon}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="7" cy="7" r="4.5" />
                <line
                  x1="10.5"
                  y1="10.5"
                  x2="13.5"
                  y2="13.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.railGroup}>
              <div className={styles.railGroupLabel}>Settings</div>
              {filteredSections.map((s) => (
                <button
                  key={s.id}
                  className={`${styles.railItem} ${activeSection === s.id ? styles.railItemActive : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <span className={styles.railIcon}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </aside>

          <main className={styles.content}>
            {settingsError && (
              <p className={styles.avatarError} role="alert">
                {settingsError}
              </p>
            )}
            {activeSection === 'general' && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Profile</h2>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Avatar</div>
                  <div className={styles.fieldControl}>
                    <div className={styles.avatarControl}>
                      <button
                        className={styles.avatarCircle}
                        aria-label={
                          settings.avatarUrl
                            ? 'Change profile photo'
                            : 'Upload profile photo'
                        }
                        onClick={() => photoInputRef.current?.click()}
                      >
                        {settings.avatarUrl ? (
                          <img src={settings.avatarUrl} alt="Profile photo" />
                        ) : (
                          initials
                        )}
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        {settings.avatarUrl ? 'Change photo' : 'Upload photo'}
                      </button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Choose profile photo"
                        hidden
                        onChange={choosePhoto}
                      />
                    </div>
                  </div>
                </div>
                {avatarError && (
                  <p className={styles.avatarError} role="alert">
                    {avatarError}
                  </p>
                )}
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Full name</div>
                  <div className={styles.fieldControl}>
                    <input
                      className={styles.textInput}
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      onBlur={() => {
                        if (profileName !== settings.displayName)
                          savePreference(
                            { displayName: profileName },
                            'Name updated.'
                          )
                      }}
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Sign-in email</div>
                  <div className={styles.fieldControl}>
                    <input
                      className={styles.textInput}
                      type="text"
                      value={settings.email || ''}
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'accounts' && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Accounts</h2>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => setAddAcctOpen(true)}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <line x1="6" y1="1.5" x2="6" y2="10.5" />
                      <line x1="1.5" y1="6" x2="10.5" y2="6" />
                    </svg>
                    Add account
                  </button>
                </div>
                <p className={styles.panelDesc}>
                  Organize subscriptions by the email you signed up with.
                </p>
                <div className={styles.acctList}>
                  {accounts.length === 0 && (
                    <div className={styles.emptyState}>
                      You haven't added any accounts yet.
                    </div>
                  )}
                  {accounts.map((acct) => {
                    const count = subscriptions.filter(
                      (s) =>
                        (s.accountId && s.accountId === acct.id) ||
                        s.accountType?.toLowerCase() ===
                          acct.label?.toLowerCase()
                    ).length
                    return (
                      <div key={acct.id} className={styles.acctRow}>
                        <span
                          className={styles.acctDot}
                          style={{ background: acct.color }}
                        />
                        <div className={styles.acctInfo}>
                          <div className={styles.acctLabel}>{acct.label}</div>
                          <div className={styles.acctEmail}>
                            {acct.emails?.[0] || 'No email set'}
                            <span className={styles.acctCount}>
                              · {count} subscription{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          className={styles.ghostBtnDanger}
                          onClick={() => setPendingDelete(acct)}
                        >
                          Delete
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Preferences</h2>
                <div className={styles.field}>
                  <div className={styles.fieldLabelBlock}>
                    <div className={styles.fieldLabel}>Default currency</div>
                    <div className={styles.fieldHint}>
                      New subscriptions default to this currency.
                    </div>
                  </div>
                  <div className={styles.fieldControl}>
                    <Dropdown
                      value={settings.defaultCurrency || 'JPY'}
                      options={CURRENCY_OPTIONS}
                      onChange={(v) =>
                        savePreference(
                          { defaultCurrency: v },
                          'Currency updated.'
                        )
                      }
                      size="sm"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabelBlock}>
                    <div className={styles.fieldLabel}>
                      Show yearly projection
                    </div>
                    <div className={styles.fieldHint}>
                      Display the yearly total card on the dashboard.
                    </div>
                  </div>
                  <div className={styles.fieldControl}>
                    <Toggle
                      on={settings.showYearlyProjection}
                      onChange={(v) =>
                        savePreference(
                          { showYearlyProjection: v },
                          v ? 'Yearly projection on.' : 'Yearly projection off.'
                        )
                      }
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabelBlock}>
                    <div className={styles.fieldLabel}>
                      Show cancelled subscriptions
                    </div>
                    <div className={styles.fieldHint}>
                      Include ended subscriptions in your lists.
                    </div>
                  </div>
                  <div className={styles.fieldControl}>
                    <Toggle
                      on={settings.showCancelled}
                      onChange={(v) =>
                        savePreference(
                          { showCancelled: v },
                          v ? 'Showing cancelled.' : 'Hiding cancelled.'
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'reminders' && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Reminders</h2>
                <p className={styles.panelDesc}>
                  Choose when SubTrack alerts you about upcoming renewals and
                  trials.
                </p>
                {[
                  {
                    key: 'days7',
                    label: '7 days before renewal',
                    hint: 'Get an early heads-up on upcoming charges.'
                  },
                  {
                    key: 'days3',
                    label: '3 days before renewal',
                    hint: "A closer reminder before you're billed."
                  },
                  {
                    key: 'onDay',
                    label: 'On billing day',
                    hint: 'Alert on the day the charge happens.'
                  },
                  {
                    key: 'trialAlert',
                    label: 'Trial ending alerts',
                    hint: 'Get notified before free trials convert.'
                  }
                ].map((r) => (
                  <div key={r.key} className={styles.field}>
                    <div className={styles.fieldLabelBlock}>
                      <div className={styles.fieldLabel}>{r.label}</div>
                      <div className={styles.fieldHint}>{r.hint}</div>
                    </div>
                    <div className={styles.fieldControl}>
                      <Toggle
                        on={settings.reminders?.[r.key]}
                        onChange={(v) =>
                          savePreference(
                            {
                              reminders: { ...settings.reminders, [r.key]: v }
                            },
                            'Reminders updated.'
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'data' && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Data & Privacy</h2>
                <p className={styles.panelDesc}>
                  Your subscription data is stored securely. You control what
                  happens to it.
                </p>
                <div className={styles.dataAction}>
                  <div className={styles.dataInfo}>
                    <div className={styles.dataTitle}>Export your data</div>
                    <div className={styles.dataHint}>
                      Download all your accounts and subscriptions as JSON.
                    </div>
                  </div>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => showToast('Export coming soon.')}
                  >
                    Export
                  </button>
                </div>
                <div className={styles.dataAction}>
                  <div className={styles.dataInfo}>
                    <div className={styles.dataTitle}>Sign out</div>
                    <div className={styles.dataHint}>
                      End your session on this device.
                    </div>
                  </div>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => setSignOutOpen(true)}
                  >
                    Sign out
                  </button>
                </div>
                <div className={styles.dividerLg} />
                <div className={styles.dataAction}>
                  <div className={styles.dataInfo}>
                    <div className={styles.dataTitleDanger}>Clear all data</div>
                    <div className={styles.dataHint}>
                      Permanently delete every subscription and account. This
                      cannot be undone.
                    </div>
                  </div>
                  <button
                    className={styles.dangerBtn}
                    onClick={() => setClearOpen(true)}
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {toast && <div className={styles.toast}>{toast}</div>}

        {avatarFile && (
          <AvatarCropper
            file={avatarFile}
            onCancel={() => setAvatarFile(null)}
            onSave={async (avatarUrl) => {
              await updateSettings({ avatarUrl })
              setAvatarFile(null)
              showToast('Photo updated.')
            }}
          />
        )}

        <AddAccountModal
          open={addAcctOpen}
          onClose={() => {
            setAddAcctOpen(false)
          }}
        />
        <ConfirmModal
          open={!!pendingDelete}
          title={`Delete ${pendingDelete?.label} account?`}
          message="This will unlink all subscriptions tied to this account. They stay in your list but lose their account label. This cannot be undone."
          confirmLabel="Delete account"
          variant="danger"
          loading={deletingAcct}
          onConfirm={handleDeleteAccount}
          onCancel={() => setPendingDelete(null)}
        />
        <ConfirmModal
          open={clearOpen}
          title="Clear all data?"
          message="Every subscription and account will be permanently deleted. This cannot be undone."
          confirmLabel="Clear all data"
          variant="danger"
          loading={clearing}
          onConfirm={handleClearAll}
          onCancel={() => setClearOpen(false)}
        />
        <ConfirmModal
          open={signOutOpen}
          title="Sign out?"
          message="You'll need to sign in again to access your subscriptions."
          confirmLabel="Sign out"
          onConfirm={async () => {
            await signOut()
            navigate('/auth')
          }}
          onCancel={() => setSignOutOpen(false)}
        />
      </div>
    </ModalPortal>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={!!on}
    >
      <span className={styles.toggleThumb} />
    </button>
  )
}
