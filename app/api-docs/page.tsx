'use client'
import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch('/api/docs')
      .then(r => r.json())
      .then(setSpec)
  }, [])

  if (!spec) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontFamily:'sans-serif' }}>
      Loading API Documentation...
    </div>
  )

  return (
    <div>
      <div style={{ background:'#1F4E79', padding:'20px 40px', color:'white' }}>
        <h1 style={{ margin:0, fontSize:'24px' }}>🎓 CampusIQ API Documentation</h1>
        <p style={{ margin:'5px 0 0', opacity:0.8 }}>College Discovery Platform — Backend API v1.0</p>
      </div>
      <SwaggerUI spec={spec} persistAuthorization={true} />
    </div>
  )
}
