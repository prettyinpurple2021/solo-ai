import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5a4 50%, #ec4899 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 28, opacity: 0.9 }}>SoloSuccess AI</div>
          <div>Pricing for Solo Founders</div>
          <div style={{ fontSize: 28, marginTop: 8 }}>AI Co‑founder • Business Co‑pilot • Workflow Automation</div>
        </div>
      </div>
    ),
    { ...size }
  )
}


