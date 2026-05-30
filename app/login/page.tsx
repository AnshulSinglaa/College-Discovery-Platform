'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form, setForm]       = useState({ name: '', email: '', password: '' })

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Please fill all fields'); return }
    if (mode === 'register' && !form.name) { setError('Please enter your name'); return }

    setLoading(true)
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body: any = { email: form.email, password: form.password }
    if (mode === 'register') body.name = form.name

    const res  = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (data.success) {
      localStorage.setItem('campusiq_token', data.data.token)
      localStorage.setItem('campusiq_user',  JSON.stringify(data.data.user))
      router.push('/')
    } else {
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB',
    borderRadius: '10px', fontSize: '15px', color: '#111827',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1F4E79 0%, #2E86AB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎓</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1F4E79' }}>CampusIQ</div>
          </Link>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6B7280' }}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#1F4E79' : '#6B7280',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Rahul Singh" style={inputStyle} />
            </div>
          )}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@email.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters" style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
        </div>

        {error && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#E11D48', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: loading ? '#9CA3AF' : '#1F4E79', color: 'white', border: 'none', padding: '13px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '...' : mode === 'login' ? 'Login →' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6B7280' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ color: '#1F4E79', fontWeight: 600, cursor: 'pointer' }}>
            {mode === 'login' ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  )
}
