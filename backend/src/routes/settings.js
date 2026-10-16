import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { settingsBody, draftBody, setupBody } from '../lib/schemas.js'
const router = Router()
router.use(auth)
const DEFAULTS = {
  display_name: '',
  default_currency: 'JPY',
  show_yearly_projection: true,
  show_cancelled: false,
  monthly_budget_alert: null,
  reminders: { days7: true, days3: true, onDay: false, trialAlert: true },
  onboarding_completed: false,
  setup_draft: null,
  avatar_path: null
}
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle()
    if (error) throw error
    res.json(data || { ...DEFAULTS, user_id: req.user.id })
  } catch (err) {
    next(err)
  }
})
router.patch('/', validate(settingsBody), async (req, res, next) => {
  try {
    const path = req.body.avatar_path
    if (
      path &&
      (!path.startsWith(req.user.id + '/') ||
        !/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.jpg$/i.test(path))
    )
      return res.status(400).json({ error: 'Invalid profile photo reference.' })
    const { data, error } = await req.db
      .from('user_settings')
      .upsert({ ...req.body, user_id: req.user.id }, { onConflict: 'user_id' })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})
router.patch('/draft', validate(draftBody), async (req, res, next) => {
  try {
    const { data, error } = await req.db.rpc('subtrack_save_setup_draft', {
      p_draft: req.body.draft
    })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})
router.post('/setup', validate(setupBody), async (req, res, next) => {
  try {
    const { groups, ...profile } = req.body
    const { data, error } = await req.db.rpc('subtrack_complete_setup', {
      p_profile: profile,
      p_groups: groups
    })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})
router.delete('/data', async (req, res, next) => {
  try {
    const { error } = await req.db.rpc('subtrack_clear_data')
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
export default router
