import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import styles from './Sidebar.module.css'
import SubTrackLogo from './SubTrackLogo'
import AddAccountModal from './AddAccountModal'
import ConfirmModal from './ConfirmModal'
import ThemeToggle from './ThemeToggle'

const NAV_MAIN = [
  {
    to: '/home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="5" height="5" rx="1"/>
        <rect x="9" y="2" width="5" height="5" rx="1"/>
        <rect x="2" y="9" width="5" height="5" rx="1"/>
        <rect x="9" y="9" width="5" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/subscriptions',
    label: 'Subscriptions',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="12" height="2.5" rx="1"/>
        <rect x="2" y="7" width="12" height="2.5" rx="1"/>
        <rect x="2" y="11" width="12" height="2.5" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/timeline',
    label: 'Timeline',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="12" height="12" rx="2"/>
        <line x1="2" y1="6" x2="14" y2="6"/>
        <line x1="6" y1="2" x2="6" y2="6"/>
        <line x1="10" y1="2" x2="10" y2="6"/>
      </svg>
    ),
  },
  {
    to: '/insights',
    label: 'Insights',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="2,12 5,8 8,10 11,5 14,7"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const subscriptions = useStore((s) => s.subscriptions)
  const settings      = useStore((s) => s.settings)
  const accounts      = useStore((s) => s.accounts)
  const navigate      = useNavigate()

  const [addAcctOpen,  setAddAcctOpen]  = useState(false)
  const [signOutOpen,  setSignOutOpen]  = useState(false)

  const initials = (settings.displayName || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <nav className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoRow}>
       <SubTrackLogo size={28} showText />
      </div>

      {/* Main nav */}
      <span className={styles.navSection}>Menu</span>
      {NAV_MAIN.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navTxt}>{item.label}</span>
        </NavLink>
      ))}

      {/* Accounts */}
      <span className={styles.navSection} style={{ marginTop: 12 }}>Accounts</span>
      {accounts.length === 0 && (
        <span className={styles.noAccounts}>No accounts yet</span>
      )}
      {accounts.map((acct) => (
        <NavLink
          key={acct.id}
          to={`/accounts/${acct.id}`}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.navIcon}>
            <span className={styles.acctDot} style={{ background: acct.color }} />
          </span>
          <span className={styles.navTxt}>{acct.label}</span>
        </NavLink>
      ))}

      <button className={styles.addAcctBtn} onClick={() => setAddAcctOpen(true)}>
        <span className={styles.navIcon}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="6" y1="1" x2="6" y2="11"/>
            <line x1="1" y1="6" x2="11" y2="6"/>
          </svg>
        </span>
        <span>Add account</span>
      </button>

      {/* Settings */}
      <div className={styles.settingsRow}>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `${styles.navItem} ${styles.navItemBottom} ${isActive ? styles.active : ''}`
        }
      >
        <span className={styles.navIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
        <span className={styles.navTxt}>Settings</span>
      </NavLink>
      <ThemeToggle />
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.avatar}>{settings.avatarUrl ? <img src={settings.avatarUrl} alt="Profile photo" /> : initials}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{settings.displayName || 'Your Name'}</div>
          <div className={styles.userSub}>Default: {settings.defaultCurrency}</div>
        </div>
        <button
          className={styles.signOutBtn}
          onClick={() => setSignOutOpen(true)}
          title="Sign out"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
            <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>
            <polyline points="10,5 13,8 10,11"/>
            <line x1="13" y1="8" x2="5" y2="8"/>
          </svg>
        </button>
      </div>

      {/* Modals */}
      <AddAccountModal open={addAcctOpen} onClose={() => setAddAcctOpen(false)} />

      <ConfirmModal
        open={signOutOpen}
        title="Sign out of SubTrack?"
        message="You can sign back in anytime with your email."
        confirmLabel="Sign out"
        onConfirm={async () => {
          setSignOutOpen(false)
          await useStore.getState().signOut()
          navigate('/auth')
        }}
        onCancel={() => setSignOutOpen(false)}
      />
    </nav>
  )
}
