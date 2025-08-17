'use client'

import { m } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const LagomDialogue = dynamic(() => import('@/components/dashboard/LagomDialogue'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-cosmic-gradient flex items-center justify-center">
      <p className="text-white/70">Entering the dashboard...</p>
    </div>
  )
})

function UnwindContent() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-cosmic-gradient relative">
      {/* Background is now handled inside LagomDialogue */}
      <TopNavigationBar />
      
      <div className="fixed inset-0 z-40 flex flex-col">
        {/* Return Button */}
        <m.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/dashboard?from=unwind')}
          className="absolute top-24 left-6 z-50 px-4 py-2 glass-morphism hover:border-white/40 text-white rounded-xl cosmic-focus transition-all duration-300 flex items-center gap-2 border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          End Session
        </m.button>
        
        {/* Lagom Dialogue */}
        <LagomDialogue />
      </div>
    </div>
  )
}

export default function UnwindPage() {
  return (
    <ProtectedRoute>
      <UnwindContent />
    </ProtectedRoute>
  )
}