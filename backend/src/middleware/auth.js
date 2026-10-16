import { supabase, userClient } from '../lib/supabase.js'
export async function auth(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1]
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' })
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token)
    if (error || !user)
      return res
        .status(401)
        .json({ error: 'Your session is invalid or expired. Sign in again.' })
    req.user = user
    req.db = userClient(token)
    next()
  } catch (err) {
    next(err)
  }
}
