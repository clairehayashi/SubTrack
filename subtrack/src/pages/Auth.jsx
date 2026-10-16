import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import SubTrackLogo from '../components/SubTrackLogo'
import styles from './Auth.module.css'
import LoadingWave from '../components/LoadingWave'
import { AUTH_PREVIEW, previewRequest, readPreview } from '../utils/authPreview'

const MODES = ['login', 'signup', 'reset', 'reset-confirm']
const DEFAULT_MODE = 'login'

function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.'
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter.'
  return null
}

const COPY = {
  login: {
    heading: 'Welcome back',
    sub: 'Sign in to keep tabs on your subscriptions.',
    submit: 'Sign in',
    submitting: 'Signing in...',
  },
  signup: {
    heading: 'Create your account',
    sub: 'Track subscriptions across every inbox you use.',
    submit: 'Create account',
    submitting: 'Creating account...',
  },
  reset: {
    heading: 'Reset your password',
    sub: 'Enter your email and we\'ll send you a link to set a new password.',
    submit: 'Send reset link',
    submitting: 'Sending...',
  },
  'reset-confirm': {
    heading: 'Set a new password',
    sub: 'Choose a new password for your SubTrack account.',
    submit: 'Update password',
    submitting: 'Updating...',
  },
}

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawMode = searchParams.get('mode') || DEFAULT_MODE
  const mode = MODES.includes(rawMode) ? rawMode : DEFAULT_MODE

  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || (AUTH_PREVIEW && mode === 'reset-confirm' ? readPreview().recoveryEmail || '' : ''))
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset messages and form fields when switching modes
  useEffect(() => {
    setError('')
    setInfo('')
    setPassword('')
    setConfirm('')
  }, [mode])

  const goToMode = (next) => {
    const nextParams = new URLSearchParams()
    if (next !== DEFAULT_MODE) nextParams.set('mode', next)
    setSearchParams(nextParams)
  }

  const copy = COPY[mode]

  // ── Handlers per mode ──

  const destination = () => useStore.getState().settings.onboardingCompleted ? '/home' : '/setup'

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (AUTH_PREVIEW) {
        await previewRequest()
        const confirmed = useStore.getState().signInPreview(email)
        navigate(confirmed ? destination() : '/auth/verify', { replace: true })
      } else {
        const { error: sbErr } = await supabase.auth.signInWithPassword({ email, password })
        if (sbErr) throw sbErr
        navigate('/auth/callback', { replace: true })
      }
    } catch (err) {
      setError(/invalid.*(login|credentials)/i.test(err.message) ? 'Incorrect email or password.' : err.message || 'Unable to sign in. Please try again.')
    } finally { setLoading(false) }
  }

  const handleSignup = async () => {
    if (loading) return
    const pwErr = validatePassword(password)
    if (pwErr) { setError(pwErr); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      if (AUTH_PREVIEW) {
        await previewRequest()
        useStore.getState().startPreviewSignup(email)
        navigate('/auth/verify', { replace: true })
      } else {
        const { data, error: sbErr } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (sbErr) throw sbErr
        useStore.getState().setPendingEmail(email)
        navigate(data.session ? '/auth/callback' : '/auth/verify', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Unable to create your account. Please try again.')
    } finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (AUTH_PREVIEW) {
        await previewRequest()
        useStore.getState().setPreviewRecovery(email)
        setInfo('Password-reset email preview ready. No email was sent.')
      } else {
        const { error: sbErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth?mode=reset-confirm`,
        })
        if (sbErr) throw sbErr
        setInfo('Reset link sent. Check your email to continue.')
      }
    } catch (err) { setError(err.message || 'Unable to send a reset link.') }
    finally { setLoading(false) }
  }

  const handleResetConfirm = async () => {
    if (loading) return
    const pwErr = validatePassword(password)
    if (pwErr) { setError(pwErr); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      if (AUTH_PREVIEW) {
        await previewRequest()
        const confirmed = useStore.getState().signInPreview(email)
        navigate(confirmed ? destination() : '/auth/verify', { replace: true })
      } else {
        const { error: sbErr } = await supabase.auth.updateUser({ password })
        if (sbErr) throw sbErr
        navigate('/auth/callback', { replace: true })
      }
    } catch (err) { setError(err.message || 'Unable to update your password.') }
    finally { setLoading(false) }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (mode === 'login')          return handleLogin()
    if (mode === 'signup')         return handleSignup()
    if (mode === 'reset')          return handleReset()
    if (mode === 'reset-confirm')  return handleResetConfirm()
  }

  // Which fields show in this mode
  const showEmail   = mode !== 'reset-confirm'
  const showPwd     = mode === 'login' || mode === 'signup' || mode === 'reset-confirm'
  const showConfirm = mode === 'signup' || mode === 'reset-confirm'

  return (
    <div className={styles.page}>
      <div className={styles.centerColumn}>

        {/* Logo above the card */}
        <div className={styles.logoWrap}>
          <SubTrackLogo size={32} showText />
        </div>

        <div className={styles.card}>
          <h1 className={styles.heading}>{copy.heading}</h1>
          <p className={styles.sub}>{copy.sub}</p>

          {error && <div className={styles.errorBox} role="alert">{error}</div>}
          {info && <div className={styles.infoBox}>{info}</div>}
          {AUTH_PREVIEW && <p className={styles.hint}>Use sample details. Preview passwords are not verified or saved.</p>}
          {AUTH_PREVIEW && mode === 'reset' && info && (
            <button type="button" className={styles.primaryBtn} onClick={() => goToMode('reset-confirm')}>Preview reset link</button>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>

            {showEmail && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
            )}

            {showPwd && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="auth-password">
                  {mode === 'reset-confirm' ? 'New password' : 'Password'}
                </label>
                <input
                  id="auth-password"
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 8 characters"
                />
                {(mode === 'signup' || mode === 'reset-confirm') && (
                  <div className={styles.hint}>
                    At least 8 characters, one uppercase, one lowercase.
                  </div>
                )}
                {mode === 'login' && (
                  <button
                    type="button"
                    className={styles.inlineLink}
                    onClick={() => goToMode('reset')}
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            )}

            {showConfirm && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="auth-confirm">Confirm password</label>
                <input
                  id="auth-confirm"
                  className={styles.input}
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
              </div>
            )}

            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading ? <LoadingWave compact label={copy.submitting} /> : copy.submit}
            </button>
          </form>

          {/* Mode switcher at the bottom */}
          <div className={styles.switchRow}>
            {mode === 'login' && (
              <>No account yet?{' '}
                <button type="button" className={styles.switchLink} onClick={() => goToMode('signup')}>
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}
                <button type="button" className={styles.switchLink} onClick={() => goToMode('login')}>
                  Sign in
                </button>
              </>
            )}
            {mode === 'reset' && (
              <button type="button" className={styles.switchLink} onClick={() => goToMode('login')}>
                Back to sign in
              </button>
            )}
            {mode === 'reset-confirm' && (
              <button type="button" className={styles.switchLink} onClick={() => goToMode('login')}>
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
