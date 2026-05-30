'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const EXAMS    = ['JEE_ADV', 'JEE_MAIN', 'NEET', 'CAT', 'BITSAT', 'XAT', 'GATE']
const CATS     = ['General', 'OBC', 'SC', 'ST', 'EWS']
const STATES   = ['','Andhra Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Delhi','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Pondicherry','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal']

export default function PredictPage() {
  const [form, setForm] = useState({
    exam: 'JEE_MAIN', rank: '', category: 'General',
    preferredCourse: '', preferredState: '', maxFees: '',
  })
  const [result,  setResult]  = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handlePredict = async () => {
    if (!form.rank) { setError('Please enter your rank'); return }
    setError('')
    setLoading(true)
    const body: any = {
      exam:     form.exam,
      rank:     parseInt(form.rank),
      category: form.category,
    }
    if (form.preferredCourse) body.preferredCourse = form.preferredCourse
    if (form.preferredState)  body.preferredState  = form.preferredState
    if (form.maxFees)         body.maxFees          = parseInt(form.maxFees)

    const res  = await fetch('/api/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.success) setResult(data.data)
    else setError(data.error || 'Prediction failed')
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB',
    borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }

  const CollegeCard = ({ c, tier }: { c: any; tier: string }) => {
    const tierColor = tier === 'safe' ? '#16A34A' : tier === 'moderate' ? '#D97706' : '#DC2626'
    const tierBg    = tier === 'safe' ? '#F0FDF4'  : tier === 'moderate' ? '#FFFBEB'  : '#FEF2F2'
    const tierLabel = tier === 'safe' ? '✅ Safe'   : tier === 'moderate' ? '⚡ Moderate' : '🎯 Reach'
    return (
      <div style={{ background: 'white', border: `1px solid ${tierColor}30`, borderRadius: '12px', padding: '16px', borderLeft: `4px solid ${tierColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <Link href={`/colleges/${c.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{c.college_name}</div>
            </Link>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>📍 {c.city}, {c.state} · #{c.nirf_rank} NIRF</div>
          </div>
          <span style={{ background: tierBg, color: tierColor, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', flexShrink: 0, marginLeft: '8px' }}>{tierLabel}</span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>🎓 {c.branch}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ background: '#F9FAFB', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>Your Rank</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1F4E79' }}>{c.your_rank.toLocaleString()}</div>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>Closing Rank</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: tierColor }}>{c.closing_rank.toLocaleString()}</div>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>Buffer</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>+{c.buffer.toLocaleString()}</div>
          </div>
        </div>
        {(c.min_fees || c.placement_2024) && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F3F4F6' }}>
            {c.min_fees && <span style={{ fontSize: '12px', color: '#374151' }}>Fees: <strong>₹{(c.min_fees/100000).toFixed(1)}L/yr</strong></span>}
            {c.placement_2024 && <span style={{ fontSize: '12px', color: '#374151' }}>Avg Pkg: <strong>₹{c.placement_2024.average_package_lpa}L</strong></span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1F4E79 0%, #2E86AB 100%)', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 800, margin: '0 0 10px' }}>🎯 College Predictor</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0 }}>
          Enter your rank and get personalised college predictions — Safe, Moderate & Reach
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Form Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #E5E7EB', marginBottom: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 700, color: '#111827' }}>Enter Your Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>

            <div>
              <label style={labelStyle}>Exam *</label>
              <select value={form.exam} onChange={e => setForm({ ...form, exam: e.target.value })} style={inputStyle}>
                {EXAMS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Your Rank *</label>
              <input type="number" value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })}
                placeholder="e.g. 5000" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Preferred Course</label>
              <input value={form.preferredCourse} onChange={e => setForm({ ...form, preferredCourse: e.target.value })}
                placeholder="e.g. Computer Science" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Preferred State</label>
              <select value={form.preferredState} onChange={e => setForm({ ...form, preferredState: e.target.value })} style={inputStyle}>
                {STATES.map(s => <option key={s} value={s}>{s || 'Any State'}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Max Fees/Year (₹)</label>
              <select value={form.maxFees} onChange={e => setForm({ ...form, maxFees: e.target.value })} style={inputStyle}>
                <option value="">Any</option>
                <option value="50000">Under ₹50K</option>
                <option value="200000">Under ₹2L</option>
                <option value="500000">Under ₹5L</option>
                <option value="1000000">Under ₹10L</option>
                <option value="2000000">Under ₹20L</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#E11D48', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handlePredict} disabled={loading}
            style={{ background: loading ? '#9CA3AF' : '#1F4E79', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Predicting...' : '🎯 Predict Colleges'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontWeight: 600, color: '#111827' }}>Analysing 2024 cutoff data...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* Summary Banner */}
            <div style={{ background: 'linear-gradient(135deg, #1F4E79, #2E86AB)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>PREDICTION COMPLETE</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>Found {result.total_matches} matching colleges</div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>
                  {result.input.exam.replace('_', ' ')} Rank {result.input.rank.toLocaleString()} · {result.input.category}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Admission Chance</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{result.admission_chance}</div>
              </div>
            </div>

            {/* Tier Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
              {[
                { label: '✅ Safe', count: result.safe_colleges.length,     color: '#16A34A', bg: '#F0FDF4', desc: '20%+ buffer' },
                { label: '⚡ Moderate', count: result.moderate_colleges.length, color: '#D97706', bg: '#FFFBEB', desc: '8-20% buffer' },
                { label: '🎯 Reach', count: result.reach_colleges.length,   color: '#DC2626', bg: '#FEF2F2', desc: 'Under 8% buffer' },
              ].map(t => (
                <div key={t.label} style={{ background: t.bg, borderRadius: '10px', padding: '16px', textAlign: 'center', border: `1px solid ${t.color}20` }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: t.color }}>{t.count}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: t.color }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{t.desc}</div>
                </div>
              ))}
            </div>

            {/* Safe Colleges */}
            {result.safe_colleges.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 700, color: '#16A34A' }}>✅ Safe Colleges ({result.safe_colleges.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                  {result.safe_colleges.map((c: any, i: number) => <CollegeCard key={i} c={c} tier="safe" />)}
                </div>
              </div>
            )}

            {/* Moderate Colleges */}
            {result.moderate_colleges.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 700, color: '#D97706' }}>⚡ Moderate Colleges ({result.moderate_colleges.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                  {result.moderate_colleges.map((c: any, i: number) => <CollegeCard key={i} c={c} tier="moderate" />)}
                </div>
              </div>
            )}

            {/* Reach Colleges */}
            {result.reach_colleges.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 700, color: '#DC2626' }}>🎯 Reach Colleges ({result.reach_colleges.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                  {result.reach_colleges.map((c: any, i: number) => <CollegeCard key={i} c={c} tier="reach" />)}
                </div>
              </div>
            )}

            {result.total_matches === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
                <h3 style={{ color: '#111827', margin: '0 0 8px' }}>No matches found</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>Try relaxing your filters or selecting a different exam</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
