'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function SavedPage() {
  const router = useRouter()
  const [saved,    setSaved]   = useState<any[]>([])
  const [summary,  setSummary] = useState<any>(null)
  const [loading,  setLoading] = useState(true)
  const [filter,   setFilter]  = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('campusiq_token')
    if (!token) { router.push('/login'); return }
    fetchSaved(token)
  }, [])

  const fetchSaved = async (token: string) => {
    const [savedRes, summaryRes] = await Promise.all([
      fetch('/api/saved', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/saved/summary', { headers: { Authorization: `Bearer ${token}` } }),
    ])
    const savedData   = await savedRes.json()
    const summaryData = await summaryRes.json()
    setSaved(savedData.data?.saved || [])
    setSummary(summaryData.data?.summary || null)
    setLoading(false)
  }

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('campusiq_token')
    await fetch(`/api/saved/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    setSaved(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const removeCollege = async (id: number) => {
    const token = localStorage.getItem('campusiq_token')
    await fetch(`/api/saved/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setSaved(prev => prev.filter(s => s.id !== id))
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    shortlisted: { bg: '#EFF6FF', text: '#1D4ED8' },
    applied:     { bg: '#FEF3C7', text: '#D97706' },
    admitted:    { bg: '#DCFCE7', text: '#16A34A' },
    rejected:    { bg: '#FEE2E2', text: '#DC2626' },
  }

  const filtered = filter === 'all' ? saved : saved.filter(s => s.status === filter)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#6B7280' }}>
        Loading your saved colleges...
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, color: '#111827' }}>🔖 Saved Colleges</h1>
        <p style={{ margin: '0 0 28px', color: '#6B7280', fontSize: '14px' }}>Track your college applications in one place</p>

        {/* Summary Cards */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Total',       value: summary.total,       color: '#1F4E79', bg: '#EFF6FF' },
              { label: 'Shortlisted', value: summary.shortlisted, color: '#1D4ED8', bg: '#EFF6FF' },
              { label: 'Applied',     value: summary.applied,     color: '#D97706', bg: '#FEF3C7' },
              { label: 'Admitted',    value: summary.admitted,    color: '#16A34A', bg: '#DCFCE7' },
              { label: 'Rejected',    value: summary.rejected,    color: '#DC2626', bg: '#FEE2E2' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: s.color, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'shortlisted', 'applied', 'admitted', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 16px', border: '1px solid #D1D5DB', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                background: filter === f ? '#1F4E79' : 'white',
                color: filter === f ? 'white' : '#374151',
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {saved.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔖</div>
            <h3 style={{ color: '#111827', margin: '0 0 8px' }}>No saved colleges yet</h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px' }}>Browse colleges and save the ones you like</p>
            <Link href="/colleges" style={{ background: '#1F4E79', color: 'white', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              Explore Colleges →
            </Link>
          </div>
        )}

        {/* Saved List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(s => {
            const c = s.college
            const sc = statusColors[s.status] || statusColors.shortlisted
            return (
              <div key={s.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                {/* College Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Link href={`/colleges/${c.slug}`} style={{ textDecoration: 'none' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{c.name}</span>
                    </Link>
                    <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>#{c.nirf_rank} NIRF</span>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>{c.naac_grade}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>📍 {c.city}, {c.state} · {c.type}</div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    {c.placements?.[0] && (
                      <span style={{ fontSize: '12px', color: '#374151' }}>
                        Avg Pkg: <strong>₹{c.placements[0].average_package_lpa}L</strong>
                      </span>
                    )}
                    {c.courses?.[0] && (
                      <span style={{ fontSize: '12px', color: '#374151' }}>
                        Fees: <strong>₹{(c.courses[0].fees_per_year / 100000).toFixed(1)}L/yr</strong>
                      </span>
                    )}
                  </div>

                  {s.notes && (
                    <div style={{ marginTop: '10px', background: '#F9FAFB', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#374151' }}>
                      📝 {s.notes}
                    </div>
                  )}
                </div>

                {/* Status + Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                  <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)}
                    style={{ padding: '6px 12px', border: `1px solid ${sc.text}`, borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: sc.text, background: sc.bg, cursor: 'pointer', outline: 'none' }}>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="applied">Applied</option>
                    <option value="admitted">Admitted</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/colleges/${c.slug}`}
                      style={{ fontSize: '12px', color: '#1F4E79', fontWeight: 600, textDecoration: 'none', padding: '5px 12px', border: '1px solid #1F4E79', borderRadius: '6px' }}>
                      View →
                    </Link>
                    <button onClick={() => removeCollege(s.id)}
                      style={{ fontSize: '12px', color: '#EF4444', background: 'none', border: '1px solid #EF4444', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
