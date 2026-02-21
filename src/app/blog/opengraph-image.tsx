import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #0ea5a4, #7c3aed)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 800 }}>Boss Blog</div>
          <div style={{ fontSize: 28, opacity: 0.95 }}>AI Productivity • Automation • Growth Systems</div>
        </div>
      </div>
    ),
    { ...size }
  )
}


