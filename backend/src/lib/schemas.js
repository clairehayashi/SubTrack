import { z } from 'zod'
export const currency = z
  .enum(['JPY', 'USD', 'EUR', 'GBP', 'NTD', 'TWD', 'KRW', 'CNY', 'HKD'])
  .transform((v) => (v === 'TWD' ? 'NTD' : v))
export const reminders = z
  .object({
    days7: z.boolean(),
    days3: z.boolean(),
    onDay: z.boolean(),
    trialAlert: z.boolean()
  })
  .strict()
export const accountBody = z
  .object({
    label: z.string().trim().min(1).max(60),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Use a hex color'),
    emails: z
      .array(
        z
          .string()
          .trim()
          .email()
          .transform((v) => v.toLowerCase())
      )
      .min(1)
      .max(8)
      .refine((v) => new Set(v).size === v.length, 'List each email once')
  })
  .strict()
const date = z
  .string()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => {
    if (v === null) return true
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
    const parsed = new Date(v + 'T00:00:00Z')
    return (
      !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v
    )
  }, 'Use a valid YYYY-MM-DD date')
export const subscriptionBody = z
  .object({
    name: z.string().trim().min(1).max(120),
    abbr: z.string().max(20).default(''),
    logo_bg: z.string().max(30).default('#EEEDFE'),
    logo_fg: z.string().max(30).default('#3C3489'),
    category: z.string().max(60).default('Other'),
    website: z.string().max(500).default(''),
    currency,
    amount: z.number().finite().min(0).max(1000000000),
    cycle: z.enum(['Monthly', 'Yearly', 'Quarterly', 'Weekly', 'Custom']),
    next_billing_date: date.optional(),
    trial_end_date: date.optional(),
    account_id: z.string().uuid().nullable().optional(),
    account_email: z.string().max(254).default(''),
    account_type: z.string().max(60).default(''),
    payment: z.string().max(60).default(''),
    card_4: z
      .string()
      .regex(/^(\d{4})?$/, 'Use four digits or leave empty')
      .default(''),
    billed_via: z.string().max(60).default('Direct'),
    cancellation_url: z.string().max(1000).default(''),
    cancellation_notes: z.string().max(5000).default(''),
    cancellation_difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
    status: z
      .enum(['active', 'trial', 'cancel', 'cancelled', 'keep', 'undecided'])
      .default('undecided'),
    auto_renew: z.boolean().default(true),
    reminders: reminders
      .omit({ trialAlert: true })
      .default({ days7: true, days3: true, onDay: false }),
    notes: z.string().max(5000).default('')
  })
  .strict()
export const settingsBody = z
  .object({
    display_name: z.string().trim().max(120).optional(),
    default_currency: currency.optional(),
    show_yearly_projection: z.boolean().optional(),
    show_cancelled: z.boolean().optional(),
    monthly_budget_alert: z.number().finite().min(0).nullable().optional(),
    reminders: reminders.optional(),
    avatar_path: z.string().max(200).nullable().optional()
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Include a setting to update')
export const draftBody = z
  .object({
    draft: z
      .object({
        step: z.number().int().min(1).max(4),
        firstName: z.string().max(120),
        lastName: z.string().max(120),
        emails: z
          .array(
            z
              .object({
                email: z.string().max(254),
                label: z.enum(['personal', 'work', 'school', 'other'])
              })
              .strict()
          )
          .max(8),
        currency,
        reminders
      })
      .strict()
      .nullable()
  })
  .strict()
export const setupBody = z
  .object({
    display_name: z.string().trim().min(1).max(120),
    default_currency: currency,
    reminders,
    groups: z
      .array(accountBody.extend({ id: z.string().uuid() }))
      .min(1)
      .max(4)
  })
  .strict()
  .superRefine((v, ctx) => {
    const emails = v.groups.flatMap((g) => g.emails)
    if (new Set(emails).size !== emails.length)
      ctx.addIssue({
        code: 'custom',
        path: ['groups'],
        message: 'List each email in one group only'
      })
    if (
      new Set(v.groups.map((g) => g.label.toLowerCase())).size !==
      v.groups.length
    )
      ctx.addIssue({
        code: 'custom',
        path: ['groups'],
        message: 'Use each group label once'
      })
  })
