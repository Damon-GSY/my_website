'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'

const OptimizationPostEffects = dynamic(() => import('@/components/optimization-post-effects'), {
  ssr: false,
})

const BACKPLATE_WIDTH = 18.8
const BACKPLATE_HEIGHT = BACKPLATE_WIDTH * (1076 / 1920)
const TERRAIN_WIDTH = 16
const TERRAIN_DEPTH = 18
const CAMERA_RAIL_POINTS = [
  new THREE.Vector3(2.2, 3.1, 9.2),
  new THREE.Vector3(1.45, 2.12, 6.1),
  new THREE.Vector3(0.18, 1.36, 2.75),
  new THREE.Vector3(1.2, 0.92, -0.75),
  new THREE.Vector3(0.3, 0.24, -3.45),
  new THREE.Vector3(-0.08, -0.42, -5.35),
]
const LOOK_RAIL_POINTS = [
  new THREE.Vector3(0.5, -0.48, 4.25),
  new THREE.Vector3(0.05, -0.5, 1.75),
  new THREE.Vector3(0.72, -0.7, -0.95),
  new THREE.Vector3(0.96, -1.02, -3.15),
  new THREE.Vector3(0.28, -1.62, -5.65),
  new THREE.Vector3(0.18, -1.4, -7.55),
]
const cameraRail = new THREE.CatmullRomCurve3(CAMERA_RAIL_POINTS, false, 'catmullrom', 0.32)
const lookRail = new THREE.CatmullRomCurve3(LOOK_RAIL_POINTS, false, 'catmullrom', 0.28)
const cameraPosition = new THREE.Vector3()
const cameraLook = new THREE.Vector3()
const PATH_BASE_COLOR = new THREE.Color('#e27a57')
const PATH_PEAK_COLOR = new THREE.Color('#ffd0b4')
const SCROLL_SETTLE_SECONDS = 0.9

type AssetResolution = '1280' | '1920'
type ViewportProfile = {
  assetResolution: AssetResolution
  compactViewport: boolean
}

function readViewportProfile(): ViewportProfile {
  if (typeof window === 'undefined') return { assetResolution: '1280', compactViewport: false }

  const compactViewport = window.matchMedia('(max-width: 720px)').matches
  const renderedWidth = window.innerWidth * Math.min(window.devicePixelRatio, 1.5)
  return {
    assetResolution: renderedWidth > 1680 ? '1920' : '1280',
    compactViewport,
  }
}

function useViewportProfile() {
  const [profile, setProfile] = useState<ViewportProfile>(readViewportProfile)

  useEffect(() => {
    const compactQuery = window.matchMedia('(max-width: 720px)')
    const update = () => {
      const next = readViewportProfile()
      setProfile((current) =>
        current.assetResolution === next.assetResolution &&
        current.compactViewport === next.compactViewport
          ? current
          : next,
      )
    }

    compactQuery.addEventListener('change', update)
    window.addEventListener('resize', update, { passive: true })
    window.visualViewport?.addEventListener('resize', update, { passive: true })
    return () => {
      compactQuery.removeEventListener('change', update)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  return profile
}

function damp(value: number, target: number, delta: number, speed = 3.2) {
  return THREE.MathUtils.damp(value, target, speed, delta)
}

function pathX(z: number) {
  return -0.3 + Math.sin((z + 5.4) * 0.42) * 0.72 + z * 0.026
}

function terrainHeight(x: number, z: number) {
  const broadWave = Math.sin(x * 0.72 + z * 0.22) * 0.22 + Math.cos(z * 0.54 - x * 0.16) * 0.14
  const leftRidge = 1.05 * Math.exp(-((x + 3.6) ** 2) / 3.6) * (0.75 + Math.sin(z * 0.48) * 0.25)
  const rightRidge = 1.38 * Math.exp(-((x - 3.15) ** 2) / 3.2) * (0.72 + Math.cos(z * 0.42) * 0.28)
  const valley = -0.72 * Math.exp(-((x - pathX(z)) ** 2) / 0.82)
  const minimum = -0.92 * Math.exp(-(((x + 0.25) ** 2) / 1.7 + ((z + 5.9) ** 2) / 2.3))
  return broadWave + leftRidge + rightRidge + valley + minimum - 0.34
}

const CORE_CURVE_PROGRESS = 0.862
const CORE_ANCHOR = new THREE.Vector3(-0.25, terrainHeight(-0.25, -5.9) + 0.14, -5.9)

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return <div className="hero__scene-fallback" aria-hidden="true" />
    return this.props.children
  }
}

function LoadingLandscape() {
  return (
    <mesh position={[0.2, -0.08, -9]}>
      <planeGeometry args={[BACKPLATE_WIDTH, BACKPLATE_HEIGHT]} />
      <meshBasicMaterial color="#160d0a" />
    </mesh>
  )
}

function TerrainGeometry() {
  const geometryRef = useRef<THREE.PlaneGeometry>(null)

  useLayoutEffect(() => {
    const geometry = geometryRef.current
    if (!geometry) return

    const positions = geometry.attributes.position
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index)
      const worldZ = -positions.getY(index)
      positions.setZ(index, terrainHeight(x, worldZ))
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
  }, [])

  return <planeGeometry ref={geometryRef} args={[TERRAIN_WIDTH, TERRAIN_DEPTH, 72, 48]} />
}

function TerrainField() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <TerrainGeometry />
        <meshStandardMaterial
          color="#130d0c"
          emissive="#2c100a"
          emissiveIntensity={0.28}
          metalness={0.16}
          roughness={0.84}
        />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <TerrainGeometry />
        <meshBasicMaterial
          color="#c3684b"
          transparent
          opacity={0.11}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function SpatialContours() {
  const { majorGeometry, minorGeometry } = useMemo(() => {
    const major: number[] = []
    const minor: number[] = []
    const rows = 29
    const columns = 52

    for (let row = 0; row < rows; row += 1) {
      const z = 8.15 - row * 0.575
      const target = row % 4 === 0 ? major : minor
      for (let column = 0; column < columns; column += 1) {
        const x1 = -7.8 + (column / columns) * 15.6
        const x2 = -7.8 + ((column + 1) / columns) * 15.6
        target.push(x1, terrainHeight(x1, z) + 0.035, z, x2, terrainHeight(x2, z) + 0.035, z)
      }
    }

    const createGeometry = (positions: number[]) => {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.computeBoundingSphere()
      return geometry
    }

    return {
      majorGeometry: createGeometry(major),
      minorGeometry: createGeometry(minor),
    }
  }, [])

  useEffect(
    () => () => {
      majorGeometry.dispose()
      minorGeometry.dispose()
    },
    [majorGeometry, minorGeometry],
  )

  return (
    <group renderOrder={4}>
      <lineSegments geometry={minorGeometry}>
        <lineBasicMaterial
          color="#a95038"
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={majorGeometry}>
        <lineBasicMaterial
          color="#ef8864"
          transparent
          opacity={0.58}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  )
}

function OptimizationPath({ scrollProgress, reducedMotion }: SceneMotionProps) {
  const pathMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const coreLightRef = useRef<THREE.PointLight>(null)
  const curve = useMemo(() => {
    const points = Array.from({ length: 36 }, (_, index) => {
      const progress = index / 35
      const z = THREE.MathUtils.lerp(7.2, -8, progress)
      const x = pathX(z)
      return new THREE.Vector3(x, terrainHeight(x, z) + 0.13, z)
    })
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.25)
  }, [])
  const pathGeometry = useMemo(() => new THREE.TubeGeometry(curve, 180, 0.036, 8, false), [curve])
  const haloGeometry = useMemo(() => new THREE.TubeGeometry(curve, 180, 0.105, 8, false), [curve])
  const markers = useMemo(
    () =>
      [0, 0.14, 0.28, 0.42, 0.56, 0.7, CORE_CURVE_PROGRESS, 1].map((progress) => ({
        isCore: progress === CORE_CURVE_PROGRESS,
        position: progress === CORE_CURVE_PROGRESS ? CORE_ANCHOR.clone() : curve.getPoint(progress),
        progress,
      })),
    [curve],
  )

  useFrame((_, delta) => {
    const progress = reducedMotion ? 0.14 : scrollProgress.get()
    const ignition = THREE.MathUtils.smoothstep(progress, 0.12, 0.82)
    if (pathMaterialRef.current) {
      pathMaterialRef.current.color.lerpColors(PATH_BASE_COLOR, PATH_PEAK_COLOR, ignition)
    }
    if (haloRef.current) {
      const material = haloRef.current.material as THREE.MeshBasicMaterial
      material.opacity = damp(material.opacity, 0.055 + ignition * 0.16, delta, 2.6)
    }
    if (coreLightRef.current) coreLightRef.current.intensity = damp(coreLightRef.current.intensity, 8 + ignition * 18, delta)
  })

  return (
    <group>
      <mesh ref={haloRef} geometry={haloGeometry} renderOrder={4}>
        <meshBasicMaterial
          color="#ff6d3d"
          transparent
          opacity={0.055}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={pathGeometry} renderOrder={5}>
        <meshBasicMaterial ref={pathMaterialRef} color="#e27a57" toneMapped={false} />
      </mesh>
      {markers.map(({ isCore, position, progress }) => (
        <mesh key={progress} position={position} scale={isCore ? 1.9 : progress === 1 ? 0.72 : 1}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial color="#ffd0b4" toneMapped={false} />
        </mesh>
      ))}
      <pointLight
        ref={coreLightRef}
        position={CORE_ANCHOR}
        color="#ff8053"
        intensity={8}
        distance={6}
        decay={2}
      />
    </group>
  )
}

function ConvergenceField({ scrollProgress, reducedMotion }: SceneMotionProps) {
  const fieldRef = useRef<THREE.Group>(null)
  const beamsRef = useRef<THREE.InstancedMesh>(null)
  const beamMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const primaryRingRef = useRef<THREE.Mesh>(null)
  const secondaryRingRef = useRef<THREE.Mesh>(null)
  const beamMatrices = useMemo(() => {
    const starts = [
      new THREE.Vector3(-3.25, 2.7, 1.7),
      new THREE.Vector3(-2.2, 3.55, -0.55),
      new THREE.Vector3(-0.95, 4.25, -1.45),
      new THREE.Vector3(0.85, 4.55, -1.2),
      new THREE.Vector3(2.15, 3.7, -0.2),
      new THREE.Vector3(3.05, 2.75, 1.25),
      new THREE.Vector3(-1.8, 2.45, 2.45),
      new THREE.Vector3(1.9, 2.6, 2.2),
    ]
    const up = new THREE.Vector3(0, 1, 0)

    return starts.map((start) => {
      const direction = start.clone()
      const length = direction.length()
      const midpoint = start.clone().multiplyScalar(0.5)
      const rotation = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize())
      return new THREE.Matrix4().compose(midpoint, rotation, new THREE.Vector3(1, length, 1))
    })
  }, [])

  useLayoutEffect(() => {
    if (!beamsRef.current) return
    beamMatrices.forEach((matrix, index) => beamsRef.current?.setMatrixAt(index, matrix))
    beamsRef.current.instanceMatrix.setUsage(THREE.StaticDrawUsage)
    beamsRef.current.instanceMatrix.needsUpdate = true
  }, [beamMatrices])

  useFrame((_, delta) => {
    const progress = reducedMotion ? 0.72 : THREE.MathUtils.clamp(scrollProgress.get(), 0, 1)
    const convergence = THREE.MathUtils.smoothstep(progress, 0.5, 0.92)
    const settle = THREE.MathUtils.smoothstep(progress, 0.72, 1)
    const resolve = (current: number, target: number, speed = 3.2) =>
      reducedMotion ? target : damp(current, target, delta, speed)

    if (fieldRef.current) {
      fieldRef.current.visible = reducedMotion || convergence > 0.002
      fieldRef.current.scale.setScalar(0.34 + convergence * 0.66)
    }
    if (beamMaterialRef.current) {
      beamMaterialRef.current.opacity = resolve(beamMaterialRef.current.opacity, convergence * 0.115, 2.8)
    }
    if (coreMaterialRef.current) {
      coreMaterialRef.current.opacity = resolve(coreMaterialRef.current.opacity, 0.18 + convergence * 0.62)
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.72 + convergence * 0.52 - settle * 0.08)
    }
    if (primaryRingRef.current) {
      primaryRingRef.current.rotation.z = progress * Math.PI * 1.35
      primaryRingRef.current.scale.setScalar(0.72 + convergence * 1.15)
      const material = primaryRingRef.current.material as THREE.MeshBasicMaterial
      material.opacity = resolve(material.opacity, convergence * 0.58)
    }
    if (secondaryRingRef.current) {
      secondaryRingRef.current.rotation.z = -progress * Math.PI * 0.9
      secondaryRingRef.current.scale.setScalar(0.9 + convergence * 1.8)
      const material = secondaryRingRef.current.material as THREE.MeshBasicMaterial
      material.opacity = resolve(material.opacity, convergence * 0.24, 2.7)
    }
  })

  return (
    <group ref={fieldRef} position={CORE_ANCHOR} visible={false}>
      <instancedMesh
        ref={beamsRef}
        args={[undefined, undefined, beamMatrices.length]}
        frustumCulled={false}
        renderOrder={6}
      >
        <cylinderGeometry args={[0.075, 0.006, 1, 6, 1, true]} />
        <meshBasicMaterial
          ref={beamMaterialRef}
          color="#ffd0b4"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
      <mesh ref={coreRef} position={[0, 0.055, 0]} renderOrder={9}>
        <sphereGeometry args={[0.105, 24, 24]} />
        <meshBasicMaterial
          ref={coreMaterialRef}
          color="#fff0e5"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={primaryRingRef} position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={8}>
        <ringGeometry args={[0.22, 0.244, 64]} />
        <meshBasicMaterial
          color="#ffc3a9"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={secondaryRingRef} position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={7}>
        <ringGeometry args={[0.39, 0.402, 72]} />
        <meshBasicMaterial
          color="#e98968"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function GradientVectors() {
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (let row = 0; row < 5; row += 1) {
      for (let column = 0; column < 8; column += 1) {
        const z = 4.8 - row * 2.35
        const x = -6 + column * 1.72
        const y = terrainHeight(x, z) + 0.08
        const strength = 0.16 + Math.abs(x - pathX(z)) * 0.035
        positions.push(x, y, z, x + (pathX(z) - x) * 0.07, y + strength, z - 0.16)
      }
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return buffer
  }, [])

  return (
    <lineSegments geometry={geometry} renderOrder={4}>
      <lineBasicMaterial color="#e88a67" transparent opacity={0.34} blending={THREE.AdditiveBlending} />
    </lineSegments>
  )
}

function DustField({ reducedMotion, scrollProgress }: SceneMotionProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)
  const points = useMemo(() => {
    const positions = new Float32Array(440 * 3)
    for (let index = 0; index < 440; index += 1) {
      positions[index * 3] = -7 + ((index * 73) % 140) / 10
      positions[index * 3 + 1] = -0.1 + ((index * 47) % 48) / 16
      positions[index * 3 + 2] = -8 + ((index * 31) % 160) / 10
    }
    return positions
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current || !materialRef.current) return
    const progress = reducedMotion ? 0.12 : scrollProgress.get()
    pointsRef.current.position.z = damp(pointsRef.current.position.z, progress * 0.85, delta, 2.2)
    pointsRef.current.rotation.y = reducedMotion ? 0 : progress * 0.045
    materialRef.current.opacity = damp(materialRef.current.opacity, 0.16 + progress * 0.28, delta)
  })

  return (
    <points ref={pointsRef} renderOrder={6}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#f4a383"
        size={0.038}
        transparent
        opacity={0.16}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

type SceneMotionProps = {
  reducedMotion: boolean
  scrollProgress: MotionValue<number>
}

function ScrollFrameDriver({
  active,
  reducedMotion,
  scrollProgress,
}: SceneMotionProps & { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate)
  const settleSeconds = useRef(0)

  useEffect(() => {
    settleSeconds.current = active && !reducedMotion ? 0.3 : 0
    invalidate()
    if (!active || reducedMotion) return

    return scrollProgress.on('change', () => {
      settleSeconds.current = SCROLL_SETTLE_SECONDS
      invalidate()
    })
  }, [active, invalidate, reducedMotion, scrollProgress])

  useFrame((_, delta) => {
    if (!active || reducedMotion || settleSeconds.current <= 0) return
    settleSeconds.current = Math.max(0, settleSeconds.current - delta)
    if (settleSeconds.current > 0) invalidate()
  })

  return null
}

function AtmosphericBackdrop({
  assetResolution,
  reducedMotion,
  scrollProgress,
  onReady,
}: SceneMotionProps & { assetResolution: AssetResolution; onReady: () => void }) {
  const backdropRef = useRef<THREE.MeshBasicMaterial>(null)
  const textureUrl = `/assets/optimization-signature-${assetResolution}.webp`
  const landscape = useLoader(THREE.TextureLoader, textureUrl)

  useEffect(() => {
    landscape.colorSpace = THREE.SRGBColorSpace
    landscape.minFilter = THREE.LinearMipmapLinearFilter
    landscape.magFilter = THREE.LinearFilter
    landscape.needsUpdate = true
    onReady()
  }, [landscape, onReady])

  useFrame((_, delta) => {
    const progress = reducedMotion ? 0.12 : scrollProgress.get()
    if (backdropRef.current) {
      const targetOpacity = THREE.MathUtils.lerp(0.72, 0.1, THREE.MathUtils.smoothstep(progress, 0.05, 0.88))
      backdropRef.current.opacity = damp(backdropRef.current.opacity, targetOpacity, delta, 3.4)
    }
  })

  return (
    <mesh position={[0.82, 1.02, -11.8]} renderOrder={-3}>
      <planeGeometry args={[BACKPLATE_WIDTH, BACKPLATE_HEIGHT]} />
      <meshBasicMaterial
        ref={backdropRef}
        map={landscape}
        transparent
        opacity={0.72}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function OptimizationWorld({
  assetResolution,
  reducedMotion,
  scrollProgress,
  onReady,
}: SceneMotionProps & { assetResolution: AssetResolution; onReady: () => void }) {
  const progressRef = useRef(reducedMotion ? 0.14 : 0)

  useFrame(({ camera, pointer }, delta) => {
    const rawProgress = reducedMotion ? 0.14 : scrollProgress.get()
    progressRef.current = damp(progressRef.current, rawProgress, delta, 4.6)
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1)
    cameraRail.getPointAt(progress, cameraPosition)
    lookRail.getPointAt(Math.min(1, progress * 0.96 + 0.04), cameraLook)
    camera.position.copy(cameraPosition)
    camera.position.x += (reducedMotion ? 0 : pointer.x * 0.12) + Math.sin(progress * Math.PI) * 0.52
    camera.position.y += (reducedMotion ? 0 : pointer.y * 0.07) + Math.sin(progress * Math.PI) * 0.38
    camera.lookAt(cameraLook)
    camera.rotateZ(reducedMotion ? 0 : Math.sin(progress * Math.PI * 1.7) * 0.014)

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = damp(camera.fov, 50 - progress * 10, delta, 3.4)
      camera.updateProjectionMatrix()
    }
  })

  return (
    <>
      <AtmosphericBackdrop
        assetResolution={assetResolution}
        reducedMotion={reducedMotion}
        scrollProgress={scrollProgress}
        onReady={onReady}
      />
      <group position={[0.8, -0.2, 0]}>
        <TerrainField />
        <SpatialContours />
        <OptimizationPath reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
        <ConvergenceField reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
        <GradientVectors />
        <DustField reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
      </group>
      <ambientLight intensity={0.18} color="#bdc6d1" />
      <directionalLight position={[3.5, 6, 4]} intensity={1.7} color="#f0b096" />
    </>
  )
}

export default function OptimizationLandscapeScene({
  active = true,
  reducedMotion = false,
  scrollProgress,
}: SceneMotionProps & { active?: boolean }) {
  const [ready, setReady] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])
  const { assetResolution, compactViewport } = useViewportProfile()

  useEffect(() => setReady(false), [assetResolution])

  return (
    <div className="hero__scene-stage">
      <div
        className={`hero__scene-fallback hero__scene-fallback--loading${ready ? ' is-ready' : ''}`}
        aria-hidden="true"
      />
      <SceneErrorBoundary>
        <Canvas
          dpr={[1, compactViewport ? 1.1 : 1.35]}
          frameloop="demand"
          camera={{ position: CAMERA_RAIL_POINTS[0].toArray(), fov: 50, near: 0.06, far: 36 }}
          gl={{ antialias: !compactViewport, alpha: false, powerPreference: 'high-performance' }}
          fallback={<div className="hero__scene-fallback" aria-hidden="true" />}
        >
          <color attach="background" args={['#07090b']} />
          <fog attach="fog" args={['#07090b', 7.5, 24]} />
          <ScrollFrameDriver
            active={active}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
          />
          <Suspense fallback={<LoadingLandscape />}>
            <OptimizationWorld
              assetResolution={assetResolution}
              reducedMotion={reducedMotion}
              scrollProgress={scrollProgress}
              onReady={handleReady}
            />
            {!compactViewport && !reducedMotion && <OptimizationPostEffects />}
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
