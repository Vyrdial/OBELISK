'use client'

import { m } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const PersonalDictionary = dynamic(() => import('@/components/dashboard/PersonalDictionary'), {
  ssr: false,
  loading: () => <div className="h-96 glass-morphism rounded-3xl border border-white/10 flex items-center justify-center">
    <p className="text-white/70">Loading dictionary...</p>
  </div>
})

function ReviewContent() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative">
      
      <TopNavigationBar />
      
      <div className="relative z-10 p-6">
        {/* Return Button */}
        <m.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/dashboard')}
          className="mb-6 px-4 py-2 glass-morphism hover:border-white/40 text-white rounded-xl cosmic-focus transition-all duration-300 flex items-center gap-2 border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </m.button>
        
        {/* Personal Dictionary */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PersonalDictionary />
        </m.div>
      </div>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <ProtectedRoute>
      <ReviewContent />
    </ProtectedRoute>
  )
}