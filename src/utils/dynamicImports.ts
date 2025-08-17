import { lazy } from 'react'

// Simple lazy loading without JSX in this file
export function createLazyComponent<T extends Record<string, any>>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>
) {
  return lazy(importFunc)
}

// Lazy load heavy components
export const LazyCosmicBackground = createLazyComponent(
  () => import('@/components/effects/CosmicBackground')
)

// export const LazyFocusOrb = createLazyComponent(
//   () => import('@/components/dashboard/FocusOrb')
// )

export const LazyMeditationParticles = createLazyComponent(
  () => import('@/components/effects/MeditationParticles')
)

export const LazyConstellationMap = createLazyComponent(
  () => import('@/components/constellation/ConstellationMap')
)

export const LazyMassVisualization = createLazyComponent(
  () => import('@/components/mass/MassVisualization')
)

export const LazyCosmicPlanner = createLazyComponent(
  () => import('@/components/planner/CosmicPlanner')
)

export const LazyInteractiveChangeTrendGraph = createLazyComponent(
  () => import('@/components/lesson/InteractiveChangeTrendGraph')
)

// Lazy load lesson pages for better performance
export const LazyUniversalRelativityPage = createLazyComponent(
  () => import('@/app/universal-relativity/page')
)

export const LazyDimensionsPage = createLazyComponent(
  () => import('@/app/axes/page')
)

export const LazyNullCorePage = createLazyComponent(
  () => import('@/app/null-core/page')
)

// Lessons page no longer exists - removed
// export const LazyLessonsPage = createLazyComponent(
//   () => import('@/app/lessons/page')
// )