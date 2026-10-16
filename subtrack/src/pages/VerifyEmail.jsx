import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { AUTH_PREVIEW, previewRequest } from '../utils/authPreview'
import SubTrackLogo from '../components/SubTrackLogo'
import LoadingWave from '../components/LoadingWave'
import styles from './Auth.module.css'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const pendingEmail = useStore(s => s.pendingEmail)
  const [email, setEmail] = useState(pendingEmail)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')

  const resend = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      if (AUTH_PREVIEW) {
        await previewRequest()
        // Keep the original signup record; resending must not erase it.
        useStore.getState().resendPreviewConfirmation(email)
        setInfo('Confirmation email preview refreshed. No email was sent.')
      } else {
        const { error: sbErr } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
        if (sbErr) throw sbErr
        useStore.getState().setPendingEmail(email)
        setInfo('If this address has a pending signup, a new confirmation email is on its way.')
      }
    } catch (err) { setError(err.message || 'Unable to resend. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.centerColumn}>
        <SubTrackLogo size={32} showText />
        <div className={styles.card}>
          <h1 className={styles.heading}>Check your email</h1>
          <p className={styles.sub}>{AUTH_PREVIEW ? 'Preview the confirmation step for' : 'Follow the confirmation link sent to'} <strong>{pendingEmail || 'your email address'}</strong>. Then continue setting up SubTrack.</p>
          {error && <div className={styles.errorBox} role="alert">{error}</div>}
          {info && <div className={styles.infoBox} role="status">{info}</div>}
          {AUTH_PREVIEW && <button className={styles.primaryBtn} disabled={loading} onClick={() => navigate('/auth/callback?preview=confirm')}>Preview confirmation link</button>}
          <div className={styles.verificationActions}>
            <form className={styles.form} onSubmit={resend}>
              {!pendingEmail && <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" aria-label="Confirmation email" />}
              <button type="submit" className={styles.inlineLink} disabled={loading}>{loading ? <LoadingWave compact label="Preparing confirmation…" /> : 'Resend confirmation email'}</button>
            </form>
            <button className={styles.inlineLink} onClick={() => navigate('/auth?mode=signup', { state: { email } })}>Use a different email</button>
            <button className={styles.inlineLink} onClick={() => navigate('/auth')}>Back to sign in</button>
            {AUTH_PREVIEW && <button className={styles.inlineLink} onClick={() => navigate('/auth/callback?preview=expired')}>Preview expired link</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
