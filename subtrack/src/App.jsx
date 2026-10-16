import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import AppLayout from './components/AppLayout'
import LoadingWave from './components/LoadingWave'
import { AUTH_PREVIEW, DASHBOARD_PREVIEW } from './utils/authPreview'
import styles from './App.module.css'

const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Setup = lazy(() => import('./pages/Setup'))
const Home = lazy(() => import('./pages/Home'))
const SubscriptionList = lazy(() => import('./pages/SubscriptionList'))
const SubscriptionDetail = lazy(() => import('./pages/SubscriptionDetail'))
const AccountView = lazy(() => import('./pages/AccountView'))
const Timeline = lazy(() => import('./pages/Timeline'))
const Insights = lazy(() => import('./pages/Insights'))
const Settings = lazy(() => import('./pages/Settings'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))

async function loadDesignPreview() {
  await useStore.getState().loadAll()
  const { subscriptions, settings } = useStore.getState()
  const futureDate = (days) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  useStore.setState({
    authLoading: false,
    settings: { ...settings, displayName: 'Design Preview' },
    subscriptions: subscriptions.map((sub, index) => ({
      ...sub,
      nextBillingDate: futureDate(index + 2),
      trialEndDate: sub.status === 'trial' ? futureDate(5) : sub.trialEndDate
    })),
    accounts: [
      {
        id: 'preview-personal',
        label: 'Personal',
        emails: ['personal@gmail.com'],
        color: '#534AB7'
      },
      {
        id: 'preview-work',
        label: 'Work',
        emails: ['work@studio.com'],
        color: '#A96611'
      },
      {
        id: 'preview-school',
        label: 'School',
        emails: ['school@university.edu'],
        color: '#167E61'
      }
    ]
  })
}

function LoadingScreen() {
  return <LoadingWave fullscreen label="Loading SubTrack…" />
}

function DataErrorScreen() {
  const error = useStore((s) => s.dataError)
  return (
    <div className={styles.dataErrorPage}>
      <div className={styles.dataErrorCard}>
        <h1>We couldn’t load your dashboard</h1>
        <p role="alert">{error}</p>
        <button
          onClick={() =>
            useStore
              .getState()
              .loadAll()
              .catch(() => {})
          }
        >
          Try again
        </button>
        <button
          onClick={() =>
            useStore
              .getState()
              .signOut()
              .catch((err) => useStore.setState({ dataError: err.message }))
          }
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function AuthGuard({ children }) {
  const user = useStore((s) => (AUTH_PREVIEW ? s.previewSession : s.user))
  const authLoading = useStore((s) => s.authLoading || s.dataLoading)
  const settings = useStore((s) => s.settings)
  const dataError = useStore((s) => s.dataError)

  if (DASHBOARD_PREVIEW) return children
  if (authLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (dataError) return <DataErrorScreen />
  if (!settings?.onboardingCompleted) return <Navigate to="/setup" replace />
  return children
}

function SetupGuard({ children }) {
  const user = useStore((s) => (AUTH_PREVIEW ? s.previewSession : s.user))
  const authLoading = useStore((s) => s.authLoading || s.dataLoading)
  const settings = useStore((s) => s.settings)
  const dataError = useStore((s) => s.dataError)

  if (authLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (dataError) return <DataErrorScreen />
  if (settings?.onboardingCompleted) return <Navigate to="/home" replace />
  return children
}

function PublicGuard({ children }) {
  const dataError = useStore((s) => s.dataError)
  const user = useStore((s) => (AUTH_PREVIEW ? s.previewSession : s.user))
  const authLoading = useStore((s) => s.authLoading || s.dataLoading)

  // Allow signed-in users through if they're completing a password reset
  const isResetConfirm =
    new URLSearchParams(window.location.search).get('mode') === 'reset-confirm'

  if (authLoading) return <LoadingScreen />
  if (user && !isResetConfirm && dataError) return <DataErrorScreen />
  if (user && !isResetConfirm)
    return (
      <Navigate
        to={
          useStore.getState().settings.onboardingCompleted ? '/home' : '/setup'
        }
        replace
      />
    )
  return children
}

export default function App() {
  useEffect(() => {
    if (DASHBOARD_PREVIEW) {
      loadDesignPreview()
    } else {
      return useStore.getState().initAuth()
    }
  }, [])

  return (
    <BrowserRouter>
      {AUTH_PREVIEW && (
        <div className={styles.previewNotice}>
          Frontend preview · Email and authentication are simulated. Use sample
          details.
        </div>
      )}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Landing page — public, accessible to all */}
          <Route path="/" element={<Landing />} />

          {/* Auth — public for non-authenticated */}
          <Route
            path="/auth"
            element={
              <PublicGuard>
                <Auth />
              </PublicGuard>
            }
          />

          <Route
            path="/auth/verify"
            element={
              <PublicGuard>
                <VerifyEmail />
              </PublicGuard>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Setup — requires auth, but not setup complete */}
          <Route
            path="/setup"
            element={
              <SetupGuard>
                <Setup />
              </SetupGuard>
            }
          />

          {/* Main app — requires auth + setup complete */}
          <Route
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/subscriptions" element={<SubscriptionList />} />
            <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/accounts/:accountId" element={<AccountView />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
