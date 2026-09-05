import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { profile } from '@/lib/content'
import { paperCurve, paperPoint, pathPoint } from '@/components/fieldwork/surface-math'

export const alt = `${profile.name} — Curiosity, made useful. AI research and engineering.`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const [regular, italic, sans] = await Promise.all(
    ['InstrumentSerif-Regular.ttf', 'InstrumentSerif-Italic.ttf', 'DMSans-Regular.ttf']
      .map(name => readFile(join(process.cwd(), 'public/fonts', name))),
  )
  const route = Array.from({ length: 80 }, (_, i) => {
    const [x, y] = paperPoint(pathPoint(i / 79))
    return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
  return new ImageResponse(
    <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', background: '#f5f3ec', color: '#20352c', fontFamily: 'DM', padding: '48px 64px' }}>
      <div style={{ display: 'flex', position: 'absolute', left: 64, right: 64, top: 42, paddingBottom: 23, borderBottom: '1px solid #d3d8ca', justifyContent: 'space-between', fontSize: 18 }}>
        <span>Damon Guan</span><span>Research & engineering</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 155, left: 64 }}>
        <span style={{ fontSize: 14, color: '#586252', marginBottom: 30 }}>AI RESEARCHER & ENGINEER</span>
        <span style={{ fontFamily: 'Instrument', fontSize: 110, lineHeight: .98 }}>Curiosity,</span>
        <span style={{ display: 'flex', fontFamily: 'Instrument', fontSize: 110, lineHeight: .98 }}>made <span style={{ color: '#bd573a', fontStyle: 'italic', marginLeft: 16 }}>useful.</span></span>
      </div>
      <svg width="540" height="447" viewBox="0 0 640 530" style={{ position: 'absolute', right: 10, top: 115 }}>
        <path d={paperCurve(1)} fill="#e0e3cc"/>
        {Array.from({ length: 48 }, (_, i) => <path key={i} d={paperCurve((i + 1) / 48)} fill="none" stroke="#687758" strokeWidth="1"/>)}
        <path d={route} fill="none" stroke="#bd573a" strokeWidth="3"/>
      </svg>
      <div style={{ display: 'flex', position: 'absolute', bottom: 40, left: 64, right: 64, borderTop: '1px solid #d3d8ca', paddingTop: 20, fontSize: 15, color: '#586252', justifyContent: 'space-between' }}>
        <span>Reliable agents · Post-training · Evaluation</span><span>damon.ai</span>
      </div>
    </div>,
    { ...size, fonts: [
      { name: 'Instrument', data: new Uint8Array(regular).buffer, weight: 400, style: 'normal' },
      { name: 'Instrument', data: new Uint8Array(italic).buffer, weight: 400, style: 'italic' },
      { name: 'DM', data: new Uint8Array(sans).buffer, weight: 400, style: 'normal' },
    ] },
  )
}
