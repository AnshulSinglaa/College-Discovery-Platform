import Link from 'next/link'

interface Props {
  college: {
    id: number
    name: string
    slug: string
    city: string
    state: string
    type: string
    nirf_rank: number
    naac_grade: string
    avg_rating?: number
    min_fees?: number
    placement_2024?: { average_package_lpa: number; placement_rate_percent: number } | null
    saved_count?: number
  }
}

export default function CollegeCard({ college }: Props) {
  const typeColor = college.type === 'Government' ? '#16a34a' : college.type === 'Private' ? '#9333ea' : '#d97706'

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
            #{college.nirf_rank} NIRF
          </span>
          <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
            {college.naac_grade}
          </span>
          <span style={{ background: '#F0FDF4', color: typeColor, fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
            {college.type}
          </span>
        </div>
        {college.avg_rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontSize: '13px', fontWeight: 600 }}>
            ⭐ {college.avg_rating}
          </div>
        )}
      </div>

      <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827', lineHeight: '1.4' }}>
        {college.name}
      </h3>
      <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6B7280' }}>
        📍 {college.city}, {college.state}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
          <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Avg Package</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {college.placement_2024 ? `₹${college.placement_2024.average_package_lpa}L` : 'N/A'}
          </div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '10px' }}>
          <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Fees/Year</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {college.min_fees ? `₹${(college.min_fees / 100000).toFixed(1)}L` : 'N/A'}
          </div>
        </div>
      </div>

      <Link href={`/colleges/${college.slug}`} style={{
        display: 'block', textAlign: 'center', background: '#1F4E79', color: 'white',
        padding: '9px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
      }}>
        View Details →
      </Link>
    </div>
  )
}
