import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 800 }}>Launch Plan</div>
          <div style={{ fontSize: 28, opacity: 0.95 }}>$0 / Free Forever</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>AI Business Assistant • Basic Automation</div>
        </div>
      </div>
    ),
    { ...size }
  )
}


