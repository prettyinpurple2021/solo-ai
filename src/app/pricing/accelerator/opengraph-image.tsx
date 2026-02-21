import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 800 }}>Accelerator Plan</div>
          <div style={{ fontSize: 28, opacity: 0.95 }}>$19 / month</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>Workflow Automation AI • Founder AI Tools</div>
        </div>
      </div>
    ),
    { ...size }
  )
}


