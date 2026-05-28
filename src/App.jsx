import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
        <div style={{ color:'var(--text-secondary)', fontSize:'14px' }}>Loading…</div>
      </div>
    )
  }

  if (!session) return <Login />
  return <Register user={session.user} onSignOut={handleSignOut} />
}
