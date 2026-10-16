import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { AUTH_PREVIEW, previewRequest } from '../utils/authPreview'
import LoadingWave from '../components/LoadingWave'
import SubTrackLogo from '../components/SubTrackLogo'
import styles from './Auth.module.css'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const preview = params.get('preview')

  useEffect(() => {
    let cancelled = false
    const finish = async () => {
      try {
        if (AUTH_PREVIEW) {
          await previewRequest()
          if (cancelled) return
          if (preview === 'expired')
            throw new Error(
              'This confirmation link has expired. Request a new link to continue.'
            )
          if (preview === 'confirm' && !useStore.getState().previewSession)
            useStore.getState().confirmPreviewEmail()
          else if (!useStore.getState().previewSession)
            throw new Error('Start by creating a preview account.')
        } else {
          const hash = new URLSearchParams(window.location.hash.slice(1))
          if (hash.get('error'))
            throw new Error(
              hash.get('error_description') ||
                'This confirmation link is no longer valid.'
            )
          const { data, error: sbErr } = await supabase.auth.getSession()
          if (sbErr) throw sbErr
          if (!data.session)
            throw new Error(
              'We could not finish signing you in. Request a new confirmation link or sign in.'
            )
          if (cancelled) return
          await useStore.getState().acceptSession(data.session)
        }
        if (!cancelled)
          navigate(
            useStore.getState().settings.onboardingCompleted
              ? '/home'
              : '/setup',
            { replace: true }
          )
      } catch (err) {
        if (
          !cancelled &&
          useStore.getState().user &&
          useStore.getState().dataError
        )
          navigate('/home', { replace: true })
        else if (!cancelled)
          setError(err.message || 'Unable to finish confirmation.')
      }
    }
    finish()
    return () => {
      cancelled = true
    }
  }, [navigate, preview])

  if (!error)
    return <LoadingWave fullscreen label="Finishing your account setup…" />
  return (
    <div className={styles.page}>
      <div className={styles.centerColumn}>
        <SubTrackLogo size={32} showText />
        <div className={styles.card}>
          <h1 className={styles.heading}>Let’s get you back on track</h1>
          <p className={styles.sub} role="alert">
            {error}
          </p>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/auth/verify', { replace: true })}
          >
            Get a new confirmation link
          </button>
          <button
            className={styles.inlineLink}
            onClick={() => navigate('/auth', { replace: true })}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}
