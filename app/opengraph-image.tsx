import {ImageResponse} from 'next/og'

export const alt = 'Healing Tides Collective — Minnesota care, matched by a person'
export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f7f5f2',
          color: '#2f2f2f',
          padding: '72px 84px',
          border: '18px solid #efeae1',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{display: 'flex', fontSize: 24, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3f706c'}}>
          Healing Tides Collective
        </div>
        <div style={{display: 'flex', flexDirection: 'column', maxWidth: 940}}>
          <div style={{display: 'flex', fontSize: 76, lineHeight: 1.04, letterSpacing: '-0.025em'}}>
            Less searching. More healing.
          </div>
          <div style={{display: 'flex', marginTop: 28, fontFamily: 'Arial, sans-serif', fontSize: 30, lineHeight: 1.35, color: '#4a4a4a'}}>
            Human-guided care matching across Minnesota.
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif', fontSize: 20, color: '#625e59'}}>
          <span>Therapy · holistic care · thoughtful fit</span>
          <span>healingtides.co</span>
        </div>
      </div>
    ),
    size,
  )
}
