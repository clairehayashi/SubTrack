import { createClient } from '@supabase/supabase-js'
import { AUTH_PREVIEW, DASHBOARD_PREVIEW } from '../utils/authPreview'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || ((AUTH_PREVIEW || DASHBOARD_PREVIEW) ? 'https://frontend-preview.supabase.co' : undefined),
  import.meta.env.VITE_SUPABASE_ANON_KEY || ((AUTH_PREVIEW || DASHBOARD_PREVIEW) ? 'frontend-preview-public-key' : undefined),
  { auth: { persistSession: !(AUTH_PREVIEW || DASHBOARD_PREVIEW), autoRefreshToken: !(AUTH_PREVIEW || DASHBOARD_PREVIEW), detectSessionInUrl: !(AUTH_PREVIEW || DASHBOARD_PREVIEW) } }
)
