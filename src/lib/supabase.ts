// ============================================================
// Supabase client — single shared instance for the whole app
// ============================================================
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = (import.meta.env.VITE_SUPABASE_URL  as string) || ''
const supabaseAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '[WasteOS] Missing Supabase env variables — running in MOCK mode.\n' +
    'Copy .env.local and fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.'
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ---- Auth helpers -----------------------------------------------

export async function signUp(email: string, password: string, meta: { full_name: string; portal: 'citizen' | 'municipal'; city?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: meta },
  })
  if (error) throw error

  // Insert profile row (trigger also creates carbon_wallet for citizens)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        full_name: meta.full_name,
        portal: meta.portal,
        city: meta.city ?? 'Indore',
        phone: null,
        society: null,
        ward: null,
        avatar_url: null,
      }])
      .select()
    if (profileError) throw profileError
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}
