import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'
import {
  subscriptionToDb,
  subscriptionFromDb,
  accountToDb,
  settingsToDb,
  settingsFromDb
} from '../lib/dataMapping'
import {
  AUTH_PREVIEW,
  DASHBOARD_PREVIEW,
  defaultSettings,
  readPreview,
  writePreview,
  previewSnapshot,
  restorePreview
} from '../utils/authPreview'

const MOCK_SUBS = [
  {
    id: 'mock1',
    name: 'Netflix',
    abbr: 'NF',
    logoBg: '#FCEBEB',
    logoFg: '#A32D2D',
    category: 'Entertainment',
    currency: 'JPY',
    amount: 1490,
    cycle: 'Monthly',
    nextBillingDate: '2026-05-14',
    trialEndDate: null,
    accountEmail: 'personal@gmail.com',
    accountType: 'personal',
    payment: 'Credit card',
    card4: '4242',
    billedVia: 'Direct',
    cancellationUrl: 'netflix.com/account',
    cancellationNotes: 'Cancel from Netflix.com — cannot cancel via App Store.',
    cancellationDifficulty: 'Medium',
    status: 'cancel',
    autoRenew: true,
    reminders: { days7: true, days3: true, onDay: false },
    notes: 'Check if family still uses this before cancelling.'
  },
  {
    id: 'mock2',
    name: 'Spotify',
    abbr: 'SP',
    logoBg: '#E8F5E8',
    logoFg: '#27500A',
    category: 'Entertainment',
    currency: 'JPY',
    amount: 980,
    cycle: 'Monthly',
    nextBillingDate: '2026-05-18',
    trialEndDate: null,
    accountEmail: 'personal@gmail.com',
    accountType: 'personal',
    payment: 'Credit card',
    card4: '5678',
    billedVia: 'Direct',
    cancellationUrl: 'spotify.com/account',
    cancellationNotes: '',
    cancellationDifficulty: 'Easy',
    status: 'active',
    autoRenew: true,
    reminders: { days7: true, days3: true, onDay: false },
    notes: ''
  },
  {
    id: 'mock3',
    name: 'Adobe CC',
    abbr: 'ADO',
    logoBg: '#EEEDFE',
    logoFg: '#3C3489',
    category: 'Design',
    currency: 'USD',
    amount: 54.99,
    cycle: 'Monthly',
    nextBillingDate: '2026-05-10',
    trialEndDate: '2026-05-10',
    accountEmail: 'school@keio.jp',
    accountType: 'school',
    payment: 'Credit card',
    card4: '1234',
    billedVia: 'Direct',
    cancellationUrl: 'account.adobe.com',
    cancellationNotes: 'Cancellation fee may apply if cancelled early.',
    cancellationDifficulty: 'Hard',
    status: 'trial',
    autoRenew: true,
    reminders: { days7: true, days3: true, onDay: false },
    notes: ''
  },
  {
    id: 'mock4',
    name: 'ChatGPT Plus',
    abbr: 'GPT',
    logoBg: '#F5F0FF',
    logoFg: '#3C3489',
    category: 'Productivity',
    currency: 'USD',
    amount: 20,
    cycle: 'Monthly',
    nextBillingDate: '2026-06-01',
    trialEndDate: null,
    accountEmail: 'work@company.com',
    accountType: 'work',
    payment: 'Credit card',
    card4: '9999',
    billedVia: 'Direct',
    cancellationUrl: 'chat.openai.com/settings',
    cancellationNotes: '',
    cancellationDifficulty: 'Easy',
    status: 'active',
    autoRenew: true,
    reminders: { days7: false, days3: true, onDay: false },
    notes: ''
  },
  {
    id: 'mock5',
    name: 'Notion',
    abbr: 'NOT',
    logoBg: '#F5F5F5',
    logoFg: '#333333',
    category: 'Productivity',
    currency: 'JPY',
    amount: 15000,
    cycle: 'Yearly',
    nextBillingDate: '2026-08-01',
    trialEndDate: null,
    accountEmail: 'work@company.com',
    accountType: 'work',
    payment: 'Credit card',
    card4: '9999',
    billedVia: 'Direct',
    cancellationUrl: 'notion.so/settings',
    cancellationNotes: '',
    cancellationDifficulty: 'Easy',
    status: 'active',
    autoRenew: true,
    reminders: { days7: true, days3: true, onDay: false },
    notes: ''
  },
  {
    id: 'mock6',
    name: 'iCloud+',
    abbr: 'iC',
    logoBg: '#E8F4FF',
    logoFg: '#1a5f9c',
    category: 'Cloud',
    currency: 'JPY',
    amount: 13200,
    cycle: 'Yearly',
    nextBillingDate: '2026-09-01',
    trialEndDate: null,
    accountEmail: 'personal@gmail.com',
    accountType: 'personal',
    payment: 'Apple ID',
    card4: '',
    billedVia: 'App Store',
    cancellationUrl: 'settings > apple id > subscriptions',
    cancellationNotes: 'Cancel via iPhone Settings → Apple ID → Subscriptions.',
    cancellationDifficulty: 'Easy',
    status: 'active',
    autoRenew: true,
    reminders: { days7: true, days3: false, onDay: false },
    notes: ''
  }
]

export const useStore = create((set, get) => {
  const commit = (patch) => {
    const next = { ...get(), ...patch }
    if (AUTH_PREVIEW && next.previewSession?.email) {
      const db = readPreview()
      const email = next.previewSession.email
      db.records[email] = { ...db.records[email], ...previewSnapshot(next) }
      writePreview(db)
    }
    set(patch)
  }
  let sessionLoad = null
  let sessionVersion = 0
  let latestToken = ''
  let draftTimer = null
  let settingsQueue = Promise.resolve()
  let avatarObjectUrl = ''
  const releaseAvatar = () => {
    if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
    avatarObjectUrl = ''
  }
  const request = async (path, options = {}) => {
    if (!get().user) throw new Error('Sign in to continue.')
    const version = sessionVersion
    const result = await apiFetch(path, {
      ...options,
      accessToken: latestToken
    })
    if (version !== sessionVersion)
      throw new Error('Your session changed. Please try again.')
    return result
  }
  const avatarBlob = async (path) => {
    if (!path) return null
    const { data, error } = await supabase.storage
      .from('subtrack-avatars')
      .download(path)
    return error ? null : data
  }
  const clearCurrent = () => ({
    user: null,
    previewSession: null,
    pendingEmail: '',
    subscriptions: [],
    accounts: [],
    settings: defaultSettings(),
    setupDraft: null,
    authLoading: false,
    dataLoading: false,
    dataError: '',
    draftError: ''
  })

  return {
    user: null,
    previewSession: null,
    pendingEmail: '',
    authLoading: true,
    dataLoading: false,
    dataError: '',
    draftError: '',
    setupDraft: null,
    subscriptions: [],
    accounts: [],
    settings: defaultSettings(),

    initAuth: () => {
      if (AUTH_PREVIEW) {
        const db = readPreview()
        const record = db.records[db.activeEmail]
        set(
          record?.emailConfirmed
            ? restorePreview(record)
            : { ...clearCurrent(), pendingEmail: db.pendingEmail || '' }
        )
        return
      }
      let alive = true
      const applySession = (session) => {
        if (alive)
          get()
            .acceptSession(session)
            .catch(() => {})
      }
      supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (error) throw error
          applySession(data.session)
        })
        .catch(() => {
          if (alive) set(clearCurrent())
        })
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, session) => {
        // Finish session notifications before loading application data.
        queueMicrotask(() => applySession(session))
      })
      return () => {
        alive = false
        subscription.unsubscribe()
      }
    },

    acceptSession: async (session) => {
      const user = session?.user || null
      latestToken = session?.access_token || ''
      if (!user) {
        sessionVersion++
        clearTimeout(draftTimer)
        releaseAvatar()
        set(clearCurrent())
        return
      }
      if (get().user?.id === user.id && !get().authLoading) return sessionLoad
      sessionVersion++
      clearTimeout(draftTimer)
      releaseAvatar()
      set({ ...clearCurrent(), user, dataLoading: true })
      const loading = get().loadAll()
      sessionLoad = loading
      try {
        await loading
      } finally {
        if (sessionLoad === loading) sessionLoad = null
      }
    },

    startPreviewSignup: (email) => {
      const key = email.trim().toLowerCase()
      const db = readPreview()
      if (db.records[key]?.emailConfirmed)
        throw new Error(
          'This preview account already exists. Sign in to continue.'
        )
      db.records[key] ||= {
        email: key,
        emailConfirmed: false,
        settings: defaultSettings(),
        accounts: [],
        subscriptions: [],
        setupDraft: null
      }
      db.pendingEmail = key
      db.activeEmail = null
      writePreview(db)
      set({ ...clearCurrent(), pendingEmail: key })
    },
    resendPreviewConfirmation: (email) => {
      const key = email.trim().toLowerCase()
      const db = readPreview()
      if (!db.records[key] || db.records[key].emailConfirmed) return
      db.pendingEmail = key
      writePreview(db)
      set({ pendingEmail: key })
    },
    confirmPreviewEmail: () => {
      const db = readPreview()
      const email = db.pendingEmail
      if (!email || !db.records[email])
        throw new Error('Start by creating a preview account.')
      db.records[email].emailConfirmed = true
      db.pendingEmail = ''
      db.activeEmail = email
      writePreview(db)
      set(restorePreview(db.records[email]))
    },
    signInPreview: (email) => {
      const key = email.trim().toLowerCase()
      const db = readPreview()
      const record = db.records[key]
      if (!record)
        throw new Error(
          'No saved preview account found. Create an account first.'
        )
      if (!record.emailConfirmed) {
        db.pendingEmail = key
        db.activeEmail = null
        writePreview(db)
        set({ ...clearCurrent(), pendingEmail: key })
        return false
      }
      db.activeEmail = key
      db.pendingEmail = ''
      writePreview(db)
      set(restorePreview(record))
      return true
    },
    setPendingEmail: (email) =>
      set({ pendingEmail: email.trim().toLowerCase() }),
    setPreviewRecovery: (email) => {
      const db = readPreview()
      db.recoveryEmail = email.trim().toLowerCase()
      writePreview(db)
    },
    signOut: async () => {
      clearTimeout(draftTimer)
      if (AUTH_PREVIEW) {
        const db = readPreview()
        db.activeEmail = null
        db.pendingEmail = ''
        writePreview(db)
      } else {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
      sessionVersion++
      latestToken = ''
      releaseAvatar()
      set(clearCurrent())
    },

    loadAll: async () => {
      if (DASHBOARD_PREVIEW) {
        set({
          subscriptions: MOCK_SUBS,
          accounts: [],
          settings: {
            ...defaultSettings(),
            displayName: 'Design Preview',
            onboardingCompleted: true
          }
        })
        return
      }
      if (AUTH_PREVIEW) return
      const version = sessionVersion
      set({ dataLoading: true, dataError: '' })
      try {
        const [subscriptions, accounts, row] = await Promise.all([
          request('/subscriptions'),
          request('/accounts'),
          request('/settings')
        ])
        const blob = await avatarBlob(row.avatar_path)
        if (version !== sessionVersion) return
        releaseAvatar()
        avatarObjectUrl = blob ? URL.createObjectURL(blob) : ''
        set({
          subscriptions: subscriptions.map(subscriptionFromDb),
          accounts,
          settings: settingsFromDb(row, get().user.email, avatarObjectUrl),
          setupDraft: row.setup_draft || null
        })
      } catch (err) {
        if (version === sessionVersion)
          set({ dataError: err.message || 'Unable to load your data.' })
        throw err
      } finally {
        if (version === sessionVersion) set({ dataLoading: false })
      }
    },
    loadSubscriptions: async () => get().loadAll(),
    loadAccounts: async () => get().loadAll(),
    loadSettings: async () => get().loadAll(),

    addSubscription: async (sub) => {
      const saved =
        AUTH_PREVIEW || DASHBOARD_PREVIEW
          ? { ...sub, id: sub.id || crypto.randomUUID() }
          : subscriptionFromDb(
              await request('/subscriptions', {
                method: 'POST',
                body: JSON.stringify(subscriptionToDb(sub))
              })
            )
      commit({ subscriptions: [...get().subscriptions, saved] })
      return saved
    },
    updateSubscription: async (id, patch) => {
      const saved =
        AUTH_PREVIEW || DASHBOARD_PREVIEW
          ? patch
          : subscriptionFromDb(
              await request('/subscriptions/' + encodeURIComponent(id), {
                method: 'PATCH',
                body: JSON.stringify(subscriptionToDb(patch))
              })
            )
      commit({
        subscriptions: get().subscriptions.map((sub) =>
          sub.id === id ? { ...sub, ...saved } : sub
        )
      })
    },
    deleteSubscription: async (id) => {
      if (!AUTH_PREVIEW && !DASHBOARD_PREVIEW)
        await request('/subscriptions/' + encodeURIComponent(id), {
          method: 'DELETE'
        })
      commit({
        subscriptions: get().subscriptions.filter((sub) => sub.id !== id)
      })
    },
    addAccount: async (account) => {
      const saved =
        AUTH_PREVIEW || DASHBOARD_PREVIEW
          ? { ...account, id: account.id || crypto.randomUUID() }
          : await request('/accounts', {
              method: 'POST',
              body: JSON.stringify(accountToDb(account))
            })
      commit({ accounts: [...get().accounts, saved] })
      return saved
    },
    updateAccount: async (id, patch) => {
      const saved =
        AUTH_PREVIEW || DASHBOARD_PREVIEW
          ? patch
          : await request('/accounts/' + encodeURIComponent(id), {
              method: 'PATCH',
              body: JSON.stringify(accountToDb(patch))
            })
      commit({
        accounts: get().accounts.map((account) =>
          account.id === id ? { ...account, ...saved } : account
        )
      })
    },
    deleteAccount: async (id) => {
      if (!AUTH_PREVIEW && !DASHBOARD_PREVIEW)
        await request('/accounts/' + encodeURIComponent(id), {
          method: 'DELETE'
        })
      commit({
        accounts: get().accounts.filter((account) => account.id !== id),
        subscriptions: get().subscriptions.map((sub) =>
          sub.accountId === id
            ? { ...sub, accountId: null, accountType: '' }
            : sub
        )
      })
    },
    updateSettings: async (patch) => {
      if (AUTH_PREVIEW || DASHBOARD_PREVIEW)
        return commit({ settings: { ...get().settings, ...patch } })
      const version = sessionVersion
      const save = async () => {
        if (version !== sessionVersion)
          throw new Error('Your session changed. Please try again.')
        let blob, path
        const previousPath = get().settings.avatarPath
        const payload = settingsToDb(patch)
        if (patch.avatarUrl) {
          if (!/^data:image\/jpeg;base64,/.test(patch.avatarUrl))
            throw new Error('Choose a cropped JPEG photo.')
          blob = await (await fetch(patch.avatarUrl)).blob()
          if (version !== sessionVersion)
            throw new Error('Your session changed. Please try again.')
          if (blob.size > 262144)
            throw new Error('The cropped photo is too large.')
          path = get().user.id + '/' + crypto.randomUUID() + '.jpg'
          const { error } = await supabase.storage
            .from('subtrack-avatars')
            .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
          if (error) throw error
          if (version !== sessionVersion)
            throw new Error('Your session changed. Please try again.')
          payload.avatar_path = path
        }
        let row
        try {
          row = await request('/settings', {
            method: 'PATCH',
            body: JSON.stringify(payload)
          })
        } catch (err) {
          if (path)
            await supabase.storage.from('subtrack-avatars').remove([path])
          throw err
        }
        if (blob) {
          releaseAvatar()
          avatarObjectUrl = URL.createObjectURL(blob)
        }
        set({
          settings: settingsFromDb(row, get().user.email, avatarObjectUrl)
        })
        if (path && previousPath && previousPath !== path)
          await supabase.storage.from('subtrack-avatars').remove([previousPath])
      }
      const result = settingsQueue.then(save, save)
      settingsQueue = result.catch(() => {})
      return result
    },
    saveSetupDraft: (draft) => {
      commit({ setupDraft: draft })
      if (AUTH_PREVIEW || DASHBOARD_PREVIEW) return
      clearTimeout(draftTimer)
      const version = sessionVersion
      draftTimer = setTimeout(async () => {
        try {
          await request('/settings/draft', {
            method: 'PATCH',
            body: JSON.stringify({ draft })
          })
          if (version === sessionVersion) set({ draftError: '' })
        } catch (err) {
          if (version === sessionVersion) set({ draftError: err.message })
        }
      }, 400)
    },
    completeSetup: async (profile, groups) => {
      clearTimeout(draftTimer)
      if (AUTH_PREVIEW || DASHBOARD_PREVIEW)
        return commit({
          settings: {
            ...get().settings,
            ...profile,
            email: profile.signupEmail,
            onboardingCompleted: true
          },
          accounts: groups
            ? groups.map((group) => ({
                ...group,
                id: group.id || crypto.randomUUID()
              }))
            : get().accounts,
          setupDraft: null
        })
      const result = await request('/settings/setup', {
        method: 'POST',
        body: JSON.stringify({
          display_name: profile.displayName,
          default_currency: profile.defaultCurrency,
          reminders: profile.reminders,
          groups: groups.map((group) => ({
            ...accountToDb(group),
            id: group.id || crypto.randomUUID()
          }))
        })
      })
      set({
        settings: settingsFromDb(
          result.settings,
          get().user.email,
          avatarObjectUrl
        ),
        accounts: result.accounts,
        setupDraft: null,
        draftError: ''
      })
    },
    clearAll: async () => {
      if (!AUTH_PREVIEW && !DASHBOARD_PREVIEW)
        await request('/settings/data', { method: 'DELETE' })
      commit({ subscriptions: [], accounts: [] })
    },
    clearAllData: async () => get().clearAll(),

    // ── Selectors ──
    getSubsByAccount: (accountId) => {
      const account = get().accounts.find((a) => a.id === accountId)
      if (!account) return []
      return get().subscriptions.filter((s) => {
        if (s.accountId) return s.accountId === account.id
        return s.accountType?.toLowerCase() === account.label?.toLowerCase()
      })
    },

    getMonthlyTotal: (currency) => {
      const RATES = {
        JPY: 1,
        USD: 150,
        EUR: 165,
        GBP: 193,
        NTD: 4.6,
        KRW: 0.11,
        CNY: 21,
        HKD: 19
      }
      const target = currency || get().settings.defaultCurrency || 'JPY'
      const toRate = RATES[target] || 1
      return get()
        .subscriptions.filter((s) => s.status !== 'cancelled')
        .reduce((sum, s) => {
          const monthly =
            s.cycle === 'Monthly'
              ? s.amount
              : s.cycle === 'Yearly'
                ? s.amount / 12
                : s.cycle === 'Quarterly'
                  ? s.amount / 3
                  : s.cycle === 'Weekly'
                    ? s.amount * 4.33
                    : s.amount
          const fromRate = RATES[s.currency] || 1
          return sum + monthly * (fromRate / toRate)
        }, 0)
    },

    getUpcomingRenewals: (withinDays = 7) => {
      const now = new Date()
      const cutoff = new Date(now.getTime() + withinDays * 86400000)
      return get()
        .subscriptions.filter((s) => {
          if (!s.nextBillingDate) return false
          const d = new Date(s.nextBillingDate)
          return d >= now && d <= cutoff
        })
        .sort(
          (a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate)
        )
    }
  }
})
