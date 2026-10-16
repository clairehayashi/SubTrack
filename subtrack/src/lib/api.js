import { supabase } from './supabase'
export async function apiFetch(path, options = {}) {
  const { accessToken, ...requestOptions } = options
  const token =
    accessToken ||
    (await supabase.auth.getSession()).data?.session?.access_token
  if (!token) throw new Error('Sign in to continue.')
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  if (!base)
    throw new Error('Set VITE_API_URL to your API address, including /api.')
  let res
  try {
    res = await fetch(base + path, {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...requestOptions.headers,
        Authorization: `Bearer ${token}`
      }
    })
  } catch {
    throw new Error('Cannot reach the API. Check that your backend is running.')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = new Error(
      typeof body.error === 'string'
        ? body.error
        : `Request failed (${res.status}).`
    )
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  return res.json()
}
