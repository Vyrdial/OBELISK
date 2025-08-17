'use client'

import { memo } from 'react'
import { m } from 'framer-motion'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface LessonLayoutProps {
  children: React.ReactNode
  title?: string
  showNavigation?: boolean
  backgroundIntensity?: 'low' | 'medium' | 'high' | 'epic'
}

const LessonLayout = memo(function LessonLayout({ 
  children, 
  title, 
  showNavigation = true,
  backgroundIntensity = 'medium'
}: LessonLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        <ClientOnly>
          <CosmicBackground 
            intensity={backgroundIntensity}
            enableMeteors={true}
            enableNebula={true}
            className="fixed inset-0 z-0" 
          />
        </ClientOnly>
        
        {showNavigation && <TopNavigationBar />}
        
        <m.main 
          className="relative z-10 min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </m.main>
      </div>
    </ProtectedRoute>
  )
})

export default LessonLayout