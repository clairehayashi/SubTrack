import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { validate, validId } from '../middleware/validate.js'
import { subscriptionBody } from '../lib/schemas.js'
const router = Router()
router.use(auth)
async function bindAccount(req, existing = {}) {
  const id =
    req.body.account_id === undefined
      ? existing.account_id
      : req.body.account_id
  if (!id) {
    if (req.body.account_id === null) req.body.account_type = ''
    return
  }
  const { data: group, error } = await req.db
    .from('account_groups')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .maybeSingle()
  if (error) throw error
  if (!group)
    throw Object.assign(
      new Error('Choose one of your own subscription accounts.'),
      { status: 400 }
    )
  const email = (
    req.body.account_email ??
    existing.account_email ??
    group.emails[0] ??
    ''
  )
    .trim()
    .toLowerCase()
  if (!group.emails.some((v) => v.toLowerCase() === email))
    throw Object.assign(
      new Error('Choose an email from the selected account.'),
      { status: 400 }
    )
  Object.assign(req.body, {
    account_id: id,
    account_type: group.label,
    account_email: email
  })
}
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('next_billing_date', { ascending: true })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})
router.post('/', validate(subscriptionBody), async (req, res, next) => {
  try {
    if (req.body.account_id && !req.body.account_email)
      delete req.body.account_email
    await bindAccount(req)
    const { data, error } = await req.db
      .from('subscriptions')
      .insert({ ...req.body, user_id: req.user.id })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
})
router.patch(
  '/:id',
  validId,
  validate(
    subscriptionBody
      .partial()
      .refine((v) => Object.keys(v).length > 0, 'Include a change')
  ),
  async (req, res, next) => {
    try {
      const current = await req.db
        .from('subscriptions')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .maybeSingle()
      if (current.error) throw current.error
      if (!current.data)
        return res.status(404).json({ error: 'Subscription not found.' })
      await bindAccount(req, current.data)
      const { data, error } = await req.db
        .from('subscriptions')
        .update(req.body)
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select()
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      next(err)
    }
  }
)
router.delete('/:id', validId, async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('subscriptions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Subscription not found.' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
export default router
