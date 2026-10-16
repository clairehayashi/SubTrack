import { createClient } from '@supabase/supabase-js'
const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_PUBLISHABLE_KEY } =
  process.env
const key = SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY
if (!SUPABASE_URL || !key)
  throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY (the public key).')
export const userClient = (token) =>
  createClient(SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    ...(token
      ? { global: { headers: { Authorization: `Bearer ${token}` } } }
      : {})
  })
export const supabase = userClient()
