export const AUTH_PREVIEW = import.meta.env.DEV && import.meta.env.VITE_AUTH_PREVIEW === 'true'
export const DASHBOARD_PREVIEW = import.meta.env.DEV && import.meta.env.VITE_DESIGN_PREVIEW === 'true' && !AUTH_PREVIEW
const STORAGE_KEY = 'subtrack-frontend-preview-v1'

export const defaultSettings = () => ({
  displayName: '', defaultCurrency: 'JPY', onboardingCompleted: false,
  showYearlyProjection: true, showCancelled: true, monthlyBudgetAlert: null,
  reminders: { days7: true, days3: true, onDay: false, trialAlert: true },
})

export function readPreview() {
  if (!AUTH_PREVIEW) return { records: {}, activeEmail: null, pendingEmail: '' }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (data?.version === 1 && data.records) return data
  } catch { /* Start fresh if a previous preview is unreadable. */ }
  return { version: 1, records: {}, activeEmail: null, pendingEmail: '' }
}

export function writePreview(data) {
  if (!AUTH_PREVIEW) throw new Error('Frontend preview is disabled.')
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: 1 }))
}

export function previewSnapshot(state) {
  return { settings: state.settings, accounts: state.accounts, subscriptions: state.subscriptions, setupDraft: state.setupDraft }
}

export function restorePreview(record) {
  return {
    user: null, previewSession: { email: record.email }, pendingEmail: '',
    authLoading: false, dataLoading: false,
    settings: { ...defaultSettings(), ...record.settings },
    accounts: record.accounts || [], subscriptions: record.subscriptions || [],
    setupDraft: record.setupDraft || null,
  }
}

// A short simulated request lets designers inspect the loading state.
export const previewRequest = () => new Promise(resolve => setTimeout(resolve, 1100))
