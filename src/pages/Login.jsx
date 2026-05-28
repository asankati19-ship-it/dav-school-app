import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-emblem">DAV</div>
        </div>
        <h1 className="login-title">D.A.V. Mukhyamantri Public School</h1>
        <p className="login-sub">Ulloor, Bhopalpatnam — Staff Portal</p>
        <form onSubmit={handleLogin} className="login-form">
          <div className="field-group">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="staff@davschool.in"
              required
            />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
