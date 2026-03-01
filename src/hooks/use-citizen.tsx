import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { PortalType } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

interface CitizenState {
  citizenId: string | null
  portal: PortalType
  loading: boolean
  setPortal: (p: PortalType) => void
  logout: () => void
}

const Ctx = createContext<CitizenState | null>(null)

const LS_PORTAL = 'wasteos-portal'

export function CitizenProvider({ children }: { children: ReactNode }) {
  const [citizenId, setCitizenId] = useState<string | null>(null)
  const [portal, setPortalState] = useState<PortalType>(
    () => (localStorage.getItem(LS_PORTAL) as PortalType) ?? 'citizen'
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // 1. Reuse existing Supabase session if present
        const { data: { session } } = await supabase.auth.getSession()
        let uid = session?.user?.id

        // 2. No session → sign in anonymously (enable in Supabase Dashboard → Auth → Settings)
        if (!uid) {
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) throw error
          uid = data.user?.id
        }

        if (!uid) throw new Error('Could not obtain user ID')

        // 3. Ensure a profile row exists (ignore if already there)
        await supabase.from('profiles').upsert(
          { id: uid, full_name: 'Guest User', portal: 'citizen', city: 'Indore' },
          { onConflict: 'id', ignoreDuplicates: true }
        )

        setCitizenId(uid)
      } catch (err) {
        console.error('[WasteOS] Session init failed:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user?.id) setCitizenId(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const setPortal = (p: PortalType) => {
    setPortalState(p)
    localStorage.setItem(LS_PORTAL, p)
    // Keep the DB profile in sync so RLS policies that check portal work correctly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase.from('profiles').update({ portal: p }).eq('id', session.user.id)
      }
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem(LS_PORTAL)
    setCitizenId(null)
    setPortalState('citizen')
  }

  return (
    <Ctx.Provider value={{ citizenId, portal, loading, setPortal, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCitizen() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCitizen must be inside CitizenProvider')
  return ctx
}
