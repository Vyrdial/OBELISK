import { lazy } from 'react'

// Lazy load heavy components to reduce initial bundle size
export const LazyFocusOrb = lazy(() => import('@/components/dashboard/FocusOrb'))
export const LazyCosmicBackground = lazy(() => import('@/components/effects/CosmicBackground'))
export const LazyMeditationParticles = lazy(() => import('@/components/effects/MeditationParticles'))
export const LazyConstellationMap = lazy(() => import('@/components/constellation/ConstellationMap'))
export const LazyMassVisualization = lazy(() => import('@/components/mass/MassVisualization'))
export const LazyInteractiveChangeTrendGraph = lazy(() => import('@/components/lesson/InteractiveChangeTrendGraph'))

// Heavy lesson pages
export const LazyUniversalRelativityPage = lazy(() => import('@/app/universal-relativity/page'))
export const LazyAxesPage = lazy(() => import('@/app/axes/page'))
export const LazyNullCorePage = lazy(() => import('@/app/null-core/page'))
export const LazyLessonsPage = lazy(() => import('@/app/lessons/page'))