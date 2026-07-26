export const WORLD_PLATE_URLS = {
  mobile: '/assets/optimization-world-v2-mobile.webp',
  standard: '/assets/optimization-world-v2-1280.webp',
  highDensity: '/assets/optimization-world-v2-1920.webp',
} as const

export const PORTFOLIO_VISUALS = [
  '/assets/optimization-core-midjourney.webp',
  WORLD_PLATE_URLS.highDensity,
  WORLD_PLATE_URLS.standard,
  '/assets/optimization-core-mobile-720.webp',
  WORLD_PLATE_URLS.mobile,
] as const

export const WORLD_PLATE_MEDIA = {
  mobilePortrait: '(max-width: 720px) and (orientation: portrait)',
  highDensityWide: '(min-width: 1280px) and (min-resolution: 1.5dppx)',
  standard:
    '(max-width: 1279px) and (orientation: landscape), (min-width: 721px) and (max-width: 1279px) and (orientation: portrait), (min-width: 1280px) and (resolution < 1.5dppx)',
} as const

export type WorldPlateResolution = '1280' | '1920'
