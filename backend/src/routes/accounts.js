import { accountBody } from '../lib/schemas.js'
import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { validate, validId } from '../middleware/validate.js'

const router = Router()
router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('account_groups')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.post('/', validate(accountBody), async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('account_groups')
      .insert({ ...req.body, user_id: req.user.id })
      .select()
      .maybeSingle()
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
    accountBody
      .partial()
      .refine((v) => Object.keys(v).length > 0, 'Include a change')
  ),
  async (req, res, next) => {
    try {
      const { data, error } = await req.db
        .from('account_groups')
        .update(req.body)
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select()
        .maybeSingle()
      if (error) throw error
      if (!data) return res.status(404).json({ error: 'Account not found.' })
      res.json(data)
    } catch (err) {
      next(err)
    }
  }
)

router.delete('/:id', validId, async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('account_groups')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Account not found.' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
