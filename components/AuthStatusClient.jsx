// components/AuthStatusClient.jsx
'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function AuthStatusClient() {
  const supabase = createSupabaseBrowser()
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    // 1) Read current session without forcing a refresh
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setEmail(data.session?.user?.email ?? null)
      setLoading(false)
    })

    // 2) Keep it in sync when user signs in/out
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return
      setEmail(session?.user?.email ?? null)
    })

    return () => {
      alive = false
      sub?.subscription?.unsubscribe()
    }
  }, [supabase])

  if (loading) return <div className="text-sm text-zinc-400">checking session…</div>
  return (
    <div className="text-sm">
      {email ? (
        <span className="text-emerald-400">logged in as {email}</span>
      ) : (
        <span className="text-zinc-400">not signed in</span>
      )}
    </div>
  )
}