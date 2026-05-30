'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

function CompareContent() {
  const searchParams = useSearchParams()
  const [query, setQuery]           = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>(
    searchParams.get('ids')?.split(',').map(Number).filter(Boolean) || []
  )
  const [result, setResult]         = useState<any>(null)
  const [loading, setLoading]       = useState(false)
  const [weights, setWeights]       = useState({ placement: 0.4, fees: 0.3, rating: 0.3 })

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    const t = setTimeout(() => {
      fetch(`/api/colleges/search-suggestions?q=${query}`)
        .then(r => r.json())
        .then(d => setSuggestions(d.data?.suggestions || []))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (selectedIds.length >= 2) fetchCompare()
  }, [selectedIds, weights])

  const fetchCompare = async () => {
    setLoading(true)
    const res = await fetch(`/api/colleges/compare?ids=${selectedIds.join(',')}&wPlacement=${weights.placement}&wFees=${weights.fees}&wRating=${weights.rating}`)
    const data = await res.json()
    setResult(data.data)
    setLoading(false)
  }

  const addCollege = (c: any) => {
    if (selectedIds.includes(c.id) || selectedIds.length >= 3) return
    setSelectedIds([...selectedIds, c.id])
    setQuery('')
    setSuggestions([])
  }

  const removeCollege = (id: number) => {
    setSelectedIds(selectedIds.filter(i => i !== id))
    setResult(null)
  }

  const colleges = result?.colleges || []
  const winners  = result?.winners  || {}

  const winnerColor = (colName: string, field: string) =>
    winners[field] === colName ? '#DCFCE7' : 'white'

  const rows = [
    { label: 'NIRF Rank',       field: 'nirf_rank',       fmt: (c: any) => `#${c.nirf_rank}` },
    { label: 'NAAC Grade',      field: 'naac_grade',      fmt: (c: any) => c.naac_grade },
    { label: 'Type',            field: '',                 fmt: (c: any) => c.type },
    { label: 'Min Fees/Year',   field: 'fees',            fmt: (c: any) => c.min_fees ? `₹${(c.min_fees/100000).toFixed(1)}L` : 'N/A' },
    { label: 'Avg Package',     field: 'avg_package',     fmt: (c: any) => c.placement_2024 ? `₹${c.placement_2024.average_package_lpa}L` : 'N/A' },
    { label: 'Placement Rate',  field: 'placement_rate',  fmt: (c: any) => c.placement_2024 ? `${c.placement_2024.placement_rate_percent}%` : 'N/A' },
    { label: 'Avg Rating',      field: 'rating',          fmt: (c: any) => c.avg_rating ? `⭐ ${c.avg_rating}` : 'N/A' },
    { label: 'Campus Size',     field: '',                 fmt: (c: any) => `${c.campus_size_acres} acres` },
    { label: 'Weighted Score',  field: 'weighted_score',  fmt: (c: any) => `${c.weighted_score}/100` },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, color: '#111827' }}>⚖️ Compare Colleges</h1>
        <p style={{ margin: '0 0 32px', color: '#6B7280', fontSize: '14px' }}>Select up to 3 colleges for a side-by-side comparison</p>

        {/* College Selector */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {selectedIds.map(id => {
              const col = colleges.find((c: any) => c.id === id)
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#1D4ED8' }}>
                  {col?.name || `College #${id}`}
                  <span onClick={() => removeCollege(id)} style={{ cursor: 'pointer', color: '#6B7280', fontWeight: 400 }}>×</span>
                </div>
              )
            })}
            {selectedIds.length < 3 && (
              <div style={{ position: 'relative' }}>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="+ Add college..."
                  style={{ padding: '8px 14px', border: '2px dashed #D1D5DB', borderRadius: '20px', fontSize: '13px', outline: 'none', width: '180px' }}
                />
                {suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '40px', left: 0, background: 'white', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '260px', overflow: 'hidden' }}>
                    {suggestions.filter(s => !selectedIds.includes(s.id)).map(s => (
                      <div key={s.id} onClick={() => addCollege(s)}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', fontSize: '13px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        <div style={{ fontWeight: 600, color: '#111827' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{s.city}, {s.state}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Weights */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Customize Weights (must sum to 1.0)</p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { key: 'placement', label: 'Placement' },
                { key: 'fees',      label: 'Fees' },
                { key: 'rating',    label: 'Rating' },
              ].map(w => (
                <div key={w.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <label style={{ color: '#374151', fontWeight: 500 }}>{w.label}</label>
                  <input type="number" min="0" max="1" step="0.1"
                    value={(weights as any)[w.key]}
                    onChange={e => setWeights({ ...weights, [w.key]: parseFloat(e.target.value) })}
                    style={{ width: '60px', padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compare Table */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚖️</div>
            <p>Comparing colleges...</p>
          </div>
        )}

        {result && !loading && (
          <>
            {/* Overall Winner */}
            <div style={{ background: 'linear-gradient(135deg, #1F4E79, #2E86AB)', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>🏆 OVERALL WINNER</div>
                <div style={{ fontSize: '22px', fontWeight: 800 }}>{result.overall_winner}</div>
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>
                Based on weights: Placement {weights.placement * 100}% · Fees {weights.fees * 100}% · Rating {weights.rating * 100}%
              </div>
            </div>

            {/* Comparison Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1F4E79' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: 'white', fontWeight: 600, width: '160px' }}>Criteria</th>
                    {colleges.map((c: any) => (
                      <th key={c.id} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: 'white', fontWeight: 700 }}>
                        <div>{c.name}</div>
                        <div style={{ fontWeight: 400, opacity: 0.8, fontSize: '11px' }}>#{c.nirf_rank} NIRF · {c.city}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.label} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>{row.label}</td>
                      {colleges.map((c: any) => (
                        <td key={c.id} style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: '#111827', background: row.field ? winnerColor(c.name, row.field) : 'inherit' }}>
                          {row.fmt(c)}
                          {row.field && winners[row.field] === c.name && (
                            <span style={{ marginLeft: '8px', fontSize: '11px', background: '#16A34A', color: 'white', padding: '1px 6px', borderRadius: '10px' }}>BEST</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {selectedIds.length < 2 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
            <h3 style={{ color: '#111827', margin: '0 0 8px' }}>Select at least 2 colleges to compare</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Search and add colleges above</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center', color: '#6B7280' }}>Loading...</div>}>
      <CompareContent />
    </Suspense>
  )
}
