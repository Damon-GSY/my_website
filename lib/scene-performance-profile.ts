export type ScenePerformanceProfile =
  | 'full'
  | 'static-server'
  | 'static-save-data'
  | 'static-slow-network'
  | 'static-low-memory'
  | 'static-low-cpu'
  | 'static-compact-coarse'

export type ScenePerformanceSignals = {
  compactCoarse: boolean
  deviceMemory?: number
  effectiveType?: string
  hardwareConcurrency?: number
  networkConstrainedClient: boolean
  saveData: boolean
}

const SLOW_EFFECTIVE_TYPES = new Set(['slow-2g', '2g', '3g'])

export function resolveScenePerformanceProfile({
  compactCoarse,
  deviceMemory,
  effectiveType,
  hardwareConcurrency,
  networkConstrainedClient,
  saveData,
}: ScenePerformanceSignals): ScenePerformanceProfile {
  if (saveData) return 'static-save-data'
  if (deviceMemory !== undefined && deviceMemory < 4) return 'static-low-memory'
  if (hardwareConcurrency !== undefined && hardwareConcurrency <= 4) return 'static-low-cpu'
  if (networkConstrainedClient && effectiveType && SLOW_EFFECTIVE_TYPES.has(effectiveType)) {
    return 'static-slow-network'
  }
  if (compactCoarse) return 'static-compact-coarse'
  return 'full'
}
