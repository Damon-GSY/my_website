export const WORLD_PLATE_URLS = {
  mobile: '/assets/optimization-world-v2-mobile.webp',
  standard: '/assets/optimization-world-v2-1280.webp',
  highDensity: '/assets/optimization-world-v2-1920.webp',
} as const

export const CREATOR_HERO_VISUAL = '/assets/creator-hero-v1.webp'

export const PROJECT_VISUALS = {
  risk: '/assets/project-risk-routing-v1.webp',
  tools: '/assets/project-tool-resolution-v1.webp',
  benchmark: '/assets/project-domain-llm-v1.webp',
  reward: '/assets/project-reward-architecture-v1.webp',
} as const

export const ABOUT_VISUALS = [
  '/assets/about-moon-v1-alpha.webp',
  '/assets/about-knot-v1-alpha.webp',
  '/assets/about-basin-v1-alpha.webp',
  '/assets/about-core-v1-alpha.webp',
] as const

export const PORTFOLIO_VISUALS = [
  PROJECT_VISUALS.risk,
  PROJECT_VISUALS.tools,
  PROJECT_VISUALS.benchmark,
  PROJECT_VISUALS.reward,
  CREATOR_HERO_VISUAL,
] as const

export const WORLD_PLATE_MEDIA = {
  mobilePortrait: '(max-width: 720px) and (orientation: portrait)',
  highDensityWide: '(min-width: 1280px) and (min-resolution: 1.5dppx)',
  standard:
    '(max-width: 1279px) and (orientation: landscape), (min-width: 721px) and (max-width: 1279px) and (orientation: portrait), (min-width: 1280px) and (resolution < 1.5dppx)',
} as const

export type WorldPlateResolution = '1280' | '1920'
