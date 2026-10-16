import ModalPortal from './ModalPortal'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import styles from './AddAccountModal.module.css'
import LoadingWave from './LoadingWave'

const ACCT_COLORS = ['#6366F1','#0EA5E9','#10B981','#F59E0B','#EC4899','#8B5CF6','#F97316']

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
}

export default function AddAccountModal({ open, onClose, onAdded }) {
  const accounts = useStore((s) => s.accounts)
  const addAccount = useStore((s) => s.addAccount)

  const [label, setLabel] = useState('')
  const [email, setEmail] = useState('')
  const [labelError, setLabelError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      setLabel('')
      setEmail('')
      setLabelError('')
      setEmailError('')
      setSaved(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const validate = () => {
  let ok = true

    if (!label.trim()) {
      setLabelError('Please enter an account name.')
     ok = false
    } else {
      setLabelError('')
    }

    const trimmedEmail = email.trim()
    const emailLower = trimmedEmail.toLowerCase()

    if (!trimmedEmail) {
     setEmailError('Please enter an email address.')
      ok = false
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address.')
      ok = false
    } else {
      const usedBy = accounts.find((a) =>
       a.emails?.some((e) => e.toLowerCase() === emailLower)
      )
      if (usedBy) {
       setEmailError(`Already linked to "${usedBy.label}". Use a different email.`)
      ok = false
      } else {
       setEmailError('')
      }
    }

    return ok
  }

  const handleAdd = async () => {
    if (saving || saved || !validate()) return
    setSaving(true)
    try {
      const color = ACCT_COLORS[accounts.length % ACCT_COLORS.length]
      const account = { id: crypto.randomUUID(), label: label.trim(), color, emails: [email.trim()] }
      const created = await addAccount(account)
      onAdded?.(created || account)
      setSaved(true)
      setTimeout(() => onClose(), 800)
    } catch (err) {
      setLabelError(err.message || 'Could not add this account. Please try again.')
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
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Add account">
          {/* Header */}
          <div className={styles.header}>
            <div>
              <div className={styles.title}>Add account</div>
              <div className={styles.stepLabel}>Fill in the details below to create a new account.</div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            <div className={styles.stepContent}>

              <div className={styles.field}>
                <label className={styles.label}>
                  Account name <span className={styles.req}>*</span>
                </label>
                <input
                  className={`${styles.input} ${labelError ? styles.inputError : ''}`}
                  type="text"
                  placeholder="e.g. Personal, Work, School…"
                  value={label}
                  autoFocus
                  onChange={(e) => { setLabel(e.target.value); if (labelError) setLabelError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                />
                {labelError && <div className={styles.fieldError}>{labelError}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Email address <span className={styles.req}>*</span>
                </label>
                <input
                  className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                />
                {emailError && <div className={styles.fieldError}>{emailError}</div>}
                <div className={styles.hint}>The email address you use for subscriptions under this account.</div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button className={styles.backBtn} onClick={onClose}>Cancel</button>
            <button
              className={`${styles.nextBtn} ${saved ? styles.savedBtn : ''}`}
              onClick={handleAdd}
              disabled={saving || saved}
            >
              {saved ? 'Added ✓' : saving ? <LoadingWave compact label="Adding account…" /> : 'Add account'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
