'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [user, setUser]       = useState<any>(null)
  const [menuOpen, setMenu]   = useState(false)
  const router    = useRouter()
  const pathname  = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('campusiq_token')
    const userData = localStorage.getItem('campusiq_user')
    if (token && userData) setUser(JSON.parse(userData))
  }, [])

  const logout = () => {
    localStorage.removeItem('campusiq_token')
    localStorage.removeItem('campusiq_user')
    setUser(null)
    router.push('/')
  }

  const navLinks = [
    { href: '/colleges', label: 'Explore' },
    { href: '/compare',  label: 'Comparison' },
    { href: '/predict',  label: 'Predictor' },
    { href: '/saved',    label: 'Saved' },
  ]

  return (
    <nav style={{ background: '#1F4E79', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{ fontSize: '20px' }}>🎓</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px' }}>CampusIQ</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} style={{
            color: pathname === link.href ? '#60CFFF' : 'rgba(255,255,255,0.85)',
            textDecoration: 'none', fontSize: '14px', fontWeight: pathname === link.href ? 600 : 400,
            borderBottom: pathname === link.href ? '2px solid #60CFFF' : '2px solid transparent',
            paddingBottom: '2px',
          }}>
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Hi, {user.name.split(' ')[0]}</span>
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
            <Link href="/login" style={{ background: '#2E86AB', color: 'white', padding: '7px 18px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
