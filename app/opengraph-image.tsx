import { ImageResponse } from 'next/og'
import { profile } from '@/lib/content'

export const alt = `${profile.name} — ${profile.role} building agent systems under control`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          color: '#f0eee9',
          background: '#090a0c',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -170,
            bottom: -300,
            display: 'flex',
            width: 760,
            height: 760,
            borderRadius: 760,
            background: 'radial-gradient(circle, rgba(217,119,87,.72) 0%, rgba(217,119,87,.2) 31%, rgba(217,119,87,0) 68%)',
          }}
        />
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              right: 76 - index * 58,
              bottom: 72 - index * 35,
              display: 'flex',
              width: 470 + index * 112,
              height: 182 + index * 54,
              border: `2px solid rgba(217,119,87,${0.62 - index * 0.1})`,
              borderRadius: '50%',
              transform: `rotate(${-18 + index * 3}deg)`,
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            inset: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '42px 46px 38px',
            border: '1px solid rgba(240,238,233,.16)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, letterSpacing: 2.2, color: '#aaa7a2' }}>
            <span>DAMON / PERSONAL INDEX</span>
            <span>AGENT SYSTEMS · 2026</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
            <div style={{ display: 'flex', color: '#d97757', fontSize: 22, letterSpacing: 3.5, marginBottom: 24 }}>
              RESEARCH · POST-TRAINING · CONTROL
            </div>
            <div style={{ display: 'flex', fontSize: 82, lineHeight: 0.88, letterSpacing: -7, fontWeight: 300 }}>
              {profile.name}
            </div>
            <div style={{ display: 'flex', marginTop: 28, fontSize: 32, lineHeight: 1.16, letterSpacing: -1.5, color: '#c9c6c0' }}>
              I build agents under control.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 18, color: '#858286' }}>
            <span>{profile.role} · {profile.company}</span>
            <span>{profile.location} · DAMON.AI</span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
