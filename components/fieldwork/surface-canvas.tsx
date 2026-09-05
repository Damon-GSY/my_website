'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, CatmullRomCurve3, DoubleSide, Float32BufferAttribute, Group, Mesh, Vector3 } from 'three'
import { heightAt, pathPoint, surfacePoint } from './surface-math'

function Surface({ onReady, onLost }: { onReady: () => void; onLost: () => void }) {
  const group = useRef<Group>(null)
  const bead = useRef<Mesh>(null)
  const { invalidate, gl } = useThree()
  const target = useRef({ x: .02, y: -.25, t: .58 })
  const current = useRef({ x: .02, y: -.25, t: .58 })
  const ready = useRef(false)
  const { skin, contours, trajectory } = useMemo(() => {
    const positions: number[] = [], indices: number[] = [], lines: number[] = []
    const rings = 60, segments = 128
    for (let r = 0; r <= rings; r++) {
      for (let s = 0; s <= segments; s++) positions.push(...surfacePoint(r / rings, s / segments * Math.PI * 2))
    }
    for (let r = 0; r < rings; r++) for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s, b = a + segments + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
    for (let r = 1; r <= 76; r++) for (let s = 0; s < 192; s++) {
      const a = surfacePoint(r / 76, s / 192 * Math.PI * 2)
      const b = surfacePoint(r / 76, (s + 1) / 192 * Math.PI * 2)
      a[1] += .015; b[1] += .015
      lines.push(...a, ...b)
    }
    const skin = new BufferGeometry()
    skin.setAttribute('position', new Float32BufferAttribute(positions, 3))
    skin.setIndex(indices); skin.computeVertexNormals()
    const contours = new BufferGeometry()
    contours.setAttribute('position', new Float32BufferAttribute(lines, 3))
    const trajectory = new CatmullRomCurve3(Array.from({ length: 80 }, (_, i) => new Vector3(...pathPoint(i / 79))))
    return { skin, contours, trajectory }
  }, [])
  useEffect(() => {
    const element = gl.domElement
    // Scope context loss to this Canvas; R3F also releases old contexts on unmount.
    element.addEventListener('webglcontextlost', onLost)
    let visible = true
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) invalidate() })
    observer.observe(element)
    const onMove = (event: PointerEvent) => {
      if (!visible || document.hidden || event.pointerType === 'touch') return
      const rect = element.getBoundingClientRect()
      target.current.x = .02 + Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5)) * .16
      target.current.y = -.25 + Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5)) * .3
      invalidate()
    }
    const onScroll = () => {
      if (!visible || document.hidden) return
      const progress = Math.min(1, window.scrollY / window.innerHeight)
      target.current.y = -.25 + progress * .6
      target.current.t = .58 + progress * .32
      invalidate()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { observer.disconnect(); element.removeEventListener('webglcontextlost', onLost); window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll) }
  }, [gl, invalidate, onLost])
  useFrame((_, delta) => {
    if (!ready.current) { ready.current = true; onReady() }
    const ease = 1 - Math.exp(-Math.min(delta, .05) * 7)
    let moving = false
    for (const key of ['x', 'y', 't'] as const) {
      current.current[key] += (target.current[key] - current.current[key]) * ease
      if (Math.abs(target.current[key] - current.current[key]) > .0001) moving = true
    }
    if (group.current) group.current.rotation.set(current.current.x, current.current.y, -.06)
    if (bead.current) bead.current.position.copy(trajectory.getPoint(current.current.t)).add(new Vector3(0, .1, 0))
    if (moving && !document.hidden) invalidate()
  })
  return <group ref={group} scale={1.25}>
    <mesh geometry={skin}><meshStandardMaterial color="#d7dbc2" side={DoubleSide} roughness={.88} metalness={.06} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1}/></mesh>
    <lineSegments geometry={contours}><lineBasicMaterial color="#536549" transparent opacity={.8}/></lineSegments>
    <mesh><tubeGeometry args={[trajectory, 180, .023, 8, false]}/><meshStandardMaterial color="#b84c2f" roughness={.42}/></mesh>
    <mesh ref={bead} position={[0, heightAt(0, 0) + .18, 0]}><sphereGeometry args={[.115, 24, 24]}/><meshStandardMaterial color="#cf653e" metalness={.45} roughness={.23}/></mesh>
  </group>
}

export default function SurfaceCanvas({ onReady, onLost }: { onReady: () => void; onLost: () => void }) {
  return <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [6.5, 6.2, 8.5], fov: 38 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
    <ambientLight intensity={1.5}/>
    <directionalLight position={[3, 7, 4]} intensity={3.2} color="#fff5de"/>
    <directionalLight position={[-5, 3, -2]} intensity={1.3} color="#dae2c9"/>
    <Surface onReady={onReady} onLost={onLost}/>
  </Canvas>
}
