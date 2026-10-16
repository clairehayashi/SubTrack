import { defaultSettings } from '../utils/authPreview'
const subscriptionFields = {
  name: 'name',
  abbr: 'abbr',
  logoBg: 'logo_bg',
  logoFg: 'logo_fg',
  category: 'category',
  website: 'website',
  currency: 'currency',
  amount: 'amount',
  cycle: 'cycle',
  nextBillingDate: 'next_billing_date',
  trialEndDate: 'trial_end_date',
  accountId: 'account_id',
  accountEmail: 'account_email',
  accountType: 'account_type',
  payment: 'payment',
  card4: 'card_4',
  billedVia: 'billed_via',
  cancellationUrl: 'cancellation_url',
  cancellationNotes: 'cancellation_notes',
  cancellationDifficulty: 'cancellation_difficulty',
  status: 'status',
  autoRenew: 'auto_renew',
  reminders: 'reminders',
  notes: 'notes'
}
const settingsFields = {
  displayName: 'display_name',
  defaultCurrency: 'default_currency',
  showYearlyProjection: 'show_yearly_projection',
  showCancelled: 'show_cancelled',
  monthlyBudgetAlert: 'monthly_budget_alert',
  reminders: 'reminders',
  avatarPath: 'avatar_path'
}
const mapToDb = (value, fields) =>
  Object.fromEntries(
    Object.entries(fields)
      .filter(([key]) => value[key] !== undefined)
      .map(([key, column]) => [column, value[key]])
  )
export const subscriptionToDb = (value) => {
  const result = mapToDb(value, subscriptionFields)
  for (const key of ['account_id', 'next_billing_date', 'trial_end_date'])
    if (result[key] === '') result[key] = null
  return result
}
export const subscriptionFromDb = (row) => ({
  id: row.id,
  ...Object.fromEntries(
    Object.entries(subscriptionFields).map(([key, column]) => [
      key,
      row[column]
    ])
  ),
  amount: Number(row.amount || 0),
  currency: row.currency === 'TWD' ? 'NTD' : row.currency
})
export const accountToDb = (value) =>
  Object.fromEntries(
    ['label', 'color', 'emails']
      .filter((key) => value[key] !== undefined)
      .map((key) => [key, value[key]])
  )
export const settingsToDb = (value) => mapToDb(value, settingsFields)
export const settingsFromDb = (row, email, avatarUrl = '') => ({
  ...defaultSettings(),
  ...Object.fromEntries(
    Object.entries(settingsFields)
      .filter(([, column]) => row[column] !== undefined)
      .map(([key, column]) => [key, row[column]])
  ),
  email,
  signupEmail: email,
  onboardingCompleted: row.onboarding_completed === true,
  avatarUrl,
  defaultCurrency:
    row.default_currency === 'TWD' ? 'NTD' : row.default_currency || 'JPY'
})
