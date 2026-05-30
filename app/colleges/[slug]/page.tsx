'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function CollegeDetailPage() {
  const { slug }                  = useParams()
  const router                    = useRouter()
  const [college,   setCollege]   = useState<any>(null)
  const [realTalk,  setRealTalk]  = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [rtLoading, setRtLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [saved,     setSaved]     = useState(false)
  const [saveMsg,   setSaveMsg]   = useState('')

  useEffect(() => {
    fetch(`/api/colleges/${slug}`)
      .then(r => r.json())
      .then(d => { setCollege(d.data?.college); setLoading(false) })
  }, [slug])

  const fetchRealTalk = async () => {
    if (realTalk) return
    setRtLoading(true)
    const res  = await fetch(`/api/colleges/${slug}/real-talk`)
    const data = await res.json()
    setRealTalk(data.data)
    setRtLoading(false)
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'realtalk') fetchRealTalk()
  }

  const handleSave = async () => {
    const token = localStorage.getItem('campusiq_token')
    if (!token) { router.push('/login'); return }
    const res  = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ college_id: college.id, status: 'shortlisted' }),
    })
    const data = await res.json()
    if (data.success) { setSaved(true); setSaveMsg('Saved!') }
    else setSaveMsg(data.error || 'Already saved')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const tabs = ['overview','courses','placements','reviews','realtalk']
  const tabLabels: Record<string,string> = {
    overview:'Overview', courses:'Courses & Fees',
    placements:'Placements', reviews:'Reviews', realtalk:'🤖 Real Talk',
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC' }}>
      <Navbar />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh', flexDirection:'column', gap:'16px' }}>
        <div style={{ width:'40px', height:'40px', border:'4px solid #E5E7EB', borderTop:'4px solid #1F4E79', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <p style={{ color:'#6B7280' }}>Loading college data...</p>
      </div>
    </div>
  )

  if (!college) return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'80px' }}>
        <div style={{ fontSize:'48px' }}>😕</div>
        <h2>College not found</h2>
        <Link href="/colleges" style={{ color:'#1F4E79', fontWeight:600 }}>← Back to colleges</Link>
      </div>
    </div>
  )

  const avgR  = college.avg_ratings
  const p2024 = college.placements?.find((p: any) => p.year === 2024)

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC' }}>
      <Navbar />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1F4E79 0%,#2E86AB 100%)', padding:'40px 24px 0' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'16px' }}>
            <Link href="/" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none' }}>Home</Link>
            {' › '}
            <Link href="/colleges" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none' }}>Colleges</Link>
            {' › '}
            <span style={{ color:'white' }}>{college.name}</span>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px' }}>
                <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>#{college.nirf_rank} NIRF 2025</span>
                <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'12px', fontWeight:600, padding:'3px 10px', borderRadius:'20px' }}>NAAC {college.naac_grade}</span>
                <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'12px', fontWeight:600, padding:'3px 10px', borderRadius:'20px' }}>{college.type}</span>
                <span style={{ background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.9)', fontSize:'12px', padding:'3px 10px', borderRadius:'20px' }}>Est. {college.established_year}</span>
              </div>
              <h1 style={{ color:'white', margin:'0 0 8px', fontSize:'28px', fontWeight:800, lineHeight:1.2 }}>{college.name}</h1>
              <p style={{ color:'rgba(255,255,255,0.8)', margin:0, fontSize:'14px' }}>
                📍 {college.city}, {college.state} · 🌐{' '}
                <a href={college.website} target="_blank" rel="noreferrer" style={{ color:'#60CFFF' }}>
                  {college.website?.replace('https://','').replace('http://','')}
                </a>
              </p>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleSave} style={{ background:saved?'#10B981':'white', color:saved?'white':'#1F4E79', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:700, fontSize:'13px' }}>
                {saved ? '✅ Saved' : '🔖 Save College'}
              </button>
              <Link href={`/compare?ids=${college.id}`} style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.3)', padding:'10px 20px', borderRadius:'8px', textDecoration:'none', fontWeight:600, fontSize:'13px' }}>
                ⚖️ Compare
              </Link>
            </div>
          </div>

          {saveMsg && <div style={{ marginTop:'8px', color:'#60CFFF', fontSize:'13px', fontWeight:600 }}>{saveMsg}</div>}

          {/* Stats Row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginTop:'28px' }}>
            {[
              { label:'Avg Package',     value: p2024?`₹${p2024.average_package_lpa}L`:'N/A',      sub:'Per Annum 2024' },
              { label:'Highest Package', value: p2024?`₹${p2024.highest_package_lpa}L`:'N/A',      sub:'Domestic Offer' },
              { label:'Placement Rate',  value: p2024?`${p2024.placement_rate_percent}%`:'N/A',     sub:'Batch 2024' },
              { label:'Total Seats',     value: college.total_seats?.toLocaleString()||'N/A',        sub:`${college.campus_size_acres||'—'} Acre Campus` },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.1)', borderRadius:'10px', padding:'16px' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
                <div style={{ fontSize:'22px', fontWeight:800, color:'white' }}>{s.value}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', marginTop:'2px' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:'4px', marginTop:'24px' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => handleTabClick(tab)}
                style={{ padding:'10px 20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:600, borderRadius:'8px 8px 0 0', background:activeTab===tab?'white':'rgba(255,255,255,0.1)', color:activeTab===tab?'#1F4E79':'rgba(255,255,255,0.8)' }}>
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 24px' }}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px' }}>
            <div>
              <div style={{ background:'white', borderRadius:'12px', padding:'24px', border:'1px solid #E5E7EB', marginBottom:'20px' }}>
                <h2 style={{ margin:'0 0 12px', fontSize:'18px', fontWeight:700, color:'#111827' }}>About</h2>
                <p style={{ margin:0, color:'#4B5563', lineHeight:1.7, fontSize:'14px' }}>{college.description}</p>
              </div>

              {avgR && (
                <div style={{ background:'white', borderRadius:'12px', padding:'24px', border:'1px solid #E5E7EB', marginBottom:'20px' }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'20px' }}>
                    <h2 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#111827' }}>⭐ Student Ratings</h2>
                    <span style={{ fontSize:'28px', fontWeight:800, color:'#F59E0B' }}>{avgR.overall}</span>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>/5 · {college.total_reviews} reviews</span>
                  </div>
                  {[
                    { label:'Academics',      value:avgR.academics },
                    { label:'Placements',     value:avgR.placements },
                    { label:'Infrastructure', value:avgR.infrastructure },
                    { label:'Faculty',        value:avgR.faculty },
                  ].map(r => (
                    <div key={r.label} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                      <span style={{ fontSize:'13px', color:'#374151', width:'110px', flexShrink:0 }}>{r.label}</span>
                      <div style={{ flex:1, background:'#F3F4F6', borderRadius:'4px', height:'8px' }}>
                        <div style={{ width:`${(r.value/5)*100}%`, background:'#F59E0B', height:'8px', borderRadius:'4px' }} />
                      </div>
                      <span style={{ fontSize:'13px', fontWeight:700, color:'#111827', width:'32px' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {p2024?.top_recruiters?.length > 0 && (
                <div style={{ background:'white', borderRadius:'12px', padding:'24px', border:'1px solid #E5E7EB' }}>
                  <h2 style={{ margin:'0 0 16px', fontSize:'18px', fontWeight:700, color:'#111827' }}>Top Recruiters</h2>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {p2024.top_recruiters.map((r: string) => (
                      <span key={r} style={{ background:'#EFF6FF', color:'#1D4ED8', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:600 }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {college.infrastructure && (
                <div style={{ background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E5E7EB', marginBottom:'16px' }}>
                  <h3 style={{ margin:'0 0 14px', fontSize:'15px', fontWeight:700, color:'#111827' }}>🏛 Infrastructure</h3>
                  {[
                    { icon:'🏠', label:'Hostel',  value: college.infrastructure.hostel_available?`Available · ₹${((college.infrastructure.hostel_fees_per_year||0)/1000).toFixed(0)}K/yr`:'Not Available' },
                    { icon:'📚', label:'Library', value: college.infrastructure.library },
                    { icon:'🔬', label:'Labs',    value: college.infrastructure.labs },
                    { icon:'⚽', label:'Sports',  value: college.infrastructure.sports },
                    { icon:'📶', label:'WiFi',    value: college.infrastructure.wifi_available?'Campus-wide WiFi':'Limited' },
                  ].map(item => (
                    <div key={item.label} style={{ borderBottom:'1px solid #F3F4F6', paddingBottom:'10px', marginBottom:'10px' }}>
                      <div style={{ fontSize:'11px', color:'#6B7280', marginBottom:'2px' }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize:'12px', color:'#374151', fontWeight:500 }}>{item.value || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              )}

              {college.similar_colleges?.length > 0 && (
                <div style={{ background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E5E7EB' }}>
                  <h3 style={{ margin:'0 0 14px', fontSize:'15px', fontWeight:700, color:'#111827' }}>Similar Colleges</h3>
                  {college.similar_colleges.map((s: any) => (
                    <Link key={s.id} href={`/colleges/${s.slug}`} style={{ textDecoration:'none' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F3F4F6', cursor:'pointer' }}>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:600, color:'#111827' }}>{s.name}</div>
                          <div style={{ fontSize:'11px', color:'#6B7280' }}>{s.city}</div>
                        </div>
                        <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'12px', alignSelf:'center' }}>#{s.nirf_rank}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <div style={{ background:'white', borderRadius:'12px', border:'1px solid #E5E7EB', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#1F4E79' }}>
                  {['Course Name','Duration','Fees/Year','Seats','Entrance Exam','Eligibility'].map(h => (
                    <th key={h} style={{ padding:'14px 16px', textAlign:'left', fontSize:'12px', fontWeight:700, color:'white', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {college.courses?.map((c: any, i: number) => (
                  <tr key={c.id} style={{ background:i%2===0?'white':'#F9FAFB', borderBottom:'1px solid #E5E7EB' }}>
                    <td style={{ padding:'14px 16px', fontSize:'13px', fontWeight:600, color:'#111827' }}>{c.name}</td>
                    <td style={{ padding:'14px 16px', fontSize:'13px', color:'#374151' }}>{c.duration_years} yrs</td>
                    <td style={{ padding:'14px 16px', fontSize:'13px', fontWeight:600, color:'#374151' }}>₹{((c.fees_per_year||0)/100000).toFixed(1)}L</td>
                    <td style={{ padding:'14px 16px', fontSize:'13px', color:'#374151' }}>{c.total_seats||'N/A'}</td>
                    <td style={{ padding:'14px 16px', fontSize:'12px', color:'#374151' }}>{c.entrance_exams_accepted||'N/A'}</td>
                    <td style={{ padding:'14px 16px', fontSize:'12px', color:'#6B7280', maxWidth:'200px' }}>{c.eligibility||'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Placements */}
        {activeTab === 'placements' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px' }}>
            {college.placements?.map((p: any) => (
              <div key={p.year} style={{ background:'white', borderRadius:'12px', padding:'24px', border:'1px solid #E5E7EB' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
                  <h3 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#111827' }}>Batch {p.year}</h3>
                  <span style={{ background:p.year===2024?'#DCFCE7':'#F3F4F6', color:p.year===2024?'#16A34A':'#6B7280', fontSize:'12px', fontWeight:700, padding:'4px 10px', borderRadius:'20px' }}>
                    {p.year===2024?'✓ Latest':p.year}
                  </span>
                </div>
                {[
                  { label:'Avg Package',     value:`₹${p.average_package_lpa}L` },
                  { label:'Highest Package', value:`₹${p.highest_package_lpa}L` },
                  { label:'Median Package',  value: p.median_package_lpa?`₹${p.median_package_lpa}L`:'N/A' },
                  { label:'Placement Rate',  value:`${p.placement_rate_percent}%` },
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>{s.label}</span>
                    <span style={{ fontSize:'14px', fontWeight:700, color:'#111827' }}>{s.value}</span>
                  </div>
                ))}
                {p.top_recruiters?.length > 0 && (
                  <div style={{ marginTop:'14px' }}>
                    <div style={{ fontSize:'12px', color:'#6B7280', marginBottom:'8px' }}>Top Recruiters</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {p.top_recruiters?.slice(0,6).map((r: string) => (
                        <span key={r} style={{ background:'#EFF6FF', color:'#1D4ED8', padding:'3px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:600 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div>
            {college.reviews?.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px', color:'#6B7280' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>💬</div>
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {college.reviews?.map((r: any) => (
                  <div key={r.id} style={{ background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E5E7EB' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#1F4E79', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'14px' }}>
                          {r.user?.name?.[0]||'A'}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'14px', color:'#111827' }}>{r.user?.name||'Anonymous'}</div>
                          <div style={{ fontSize:'12px', color:'#6B7280' }}>Batch {r.batch_year}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'4px', background:'#FEF3C7', padding:'4px 10px', borderRadius:'20px' }}>
                        <span style={{ color:'#F59E0B' }}>⭐</span>
                        <span style={{ fontWeight:700, fontSize:'13px', color:'#92400E' }}>{r.overall_rating}</span>
                      </div>
                    </div>
                    <p style={{ margin:'0 0 12px', fontSize:'14px', color:'#374151', lineHeight:1.6 }}>{r.review_text}</p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                      <div style={{ background:'#F0FDF4', borderRadius:'8px', padding:'10px' }}>
                        <div style={{ fontSize:'11px', color:'#16A34A', fontWeight:700, marginBottom:'4px' }}>✅ PROS</div>
                        <div style={{ fontSize:'13px', color:'#374151' }}>{r.pros}</div>
                      </div>
                      <div style={{ background:'#FFF1F2', borderRadius:'8px', padding:'10px' }}>
                        <div style={{ fontSize:'11px', color:'#E11D48', fontWeight:700, marginBottom:'4px' }}>⚠️ CONS</div>
                        <div style={{ fontSize:'13px', color:'#374151' }}>{r.cons}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Real Talk */}
        {activeTab === 'realtalk' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,#1F4E79,#2E86AB)', borderRadius:'12px', padding:'20px', marginBottom:'24px', color:'white' }}>
              <h2 style={{ margin:'0 0 6px', fontSize:'20px' }}>🤖 Real Talk — AI Analysis</h2>
              <p style={{ margin:0, opacity:0.85, fontSize:'13px' }}>Aggregated insights from Reddit, Quora and student forums. Cached for 7 days.</p>
            </div>

            {rtLoading ? (
              <div style={{ textAlign:'center', padding:'60px', color:'#6B7280' }}>
                <div style={{ fontSize:'40px', marginBottom:'16px' }}>🤖</div>
                <p style={{ fontWeight:600, color:'#111827' }}>AI is searching Reddit, Quora & student forums...</p>
                <p style={{ fontSize:'13px' }}>This may take 10-15 seconds</p>
              </div>
            ) : realTalk ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                <div style={{ gridColumn:'1 / -1', background:'white', borderRadius:'12px', padding:'16px 24px', border:'1px solid #E5E7EB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:'12px', color:'#6B7280', marginBottom:'4px' }}>Overall Sentiment</div>
                    <div style={{ fontSize:'20px', fontWeight:700, color: realTalk.sentiment==='Mostly Positive'?'#16A34A':realTalk.sentiment==='Mostly Negative'?'#DC2626':'#D97706' }}>
                      {realTalk.sentiment==='Mostly Positive'?'😊':realTalk.sentiment==='Mostly Negative'?'😞':'😐'} {realTalk.sentiment}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', fontSize:'12px', color:'#9CA3AF' }}>
                    <div>Sources: {realTalk.sources?.join(', ')}</div>
                    <div>Updated: {new Date(realTalk.last_updated).toLocaleDateString()}</div>
                  </div>
                </div>

                <div style={{ background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E5E7EB' }}>
                  <h3 style={{ margin:'0 0 14px', color:'#16A34A', fontSize:'15px', fontWeight:700 }}>✅ What Students Love</h3>
                  {realTalk.pros?.map((p: string, i: number) => (
                    <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                      <span style={{ color:'#16A34A', flexShrink:0 }}>●</span>
                      <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E5E7EB' }}>
                  <h3 style={{ margin:'0 0 14px', color:'#DC2626', fontSize:'15px', fontWeight:700 }}>⚠️ Common Concerns</h3>
                  {realTalk.cons?.map((c: string, i: number) => (
                    <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                      <span style={{ color:'#DC2626', flexShrink:0 }}>●</span>
                      <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{c}</span>
                    </div>
                  ))}
                </div>

                {realTalk.hidden_gems?.length > 0 && (
                  <div style={{ background:'#FFFBEB', borderRadius:'12px', padding:'20px', border:'1px solid #FDE68A' }}>
                    <h3 style={{ margin:'0 0 14px', color:'#D97706', fontSize:'15px', fontWeight:700 }}>💎 Hidden Gems</h3>
                    {realTalk.hidden_gems?.map((g: string, i: number) => (
                      <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                        <span style={{ color:'#D97706', flexShrink:0 }}>◆</span>
                        <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{g}</span>
                      </div>
                    ))}
                  </div>
                )}

                {realTalk.common_complaints?.length > 0 && (
                  <div style={{ background:'#FFF1F2', borderRadius:'12px', padding:'20px', border:'1px solid #FECDD3' }}>
                    <h3 style={{ margin:'0 0 14px', color:'#E11D48', fontSize:'15px', fontWeight:700 }}>📢 Common Complaints</h3>
                    {realTalk.common_complaints?.map((c: string, i: number) => (
                      <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                        <span style={{ color:'#E11D48', flexShrink:0 }}>!</span>
                        <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
