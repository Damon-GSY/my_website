'use client'

import { Bloom, EffectComposer } from '@react-three/postprocessing'

export default function OptimizationPostEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.92} luminanceThreshold={0.48} luminanceSmoothing={0.74} mipmapBlur />
    </EffectComposer>
  )
}
