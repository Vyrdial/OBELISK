'use client'

import { m } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'

const LagomDialogue = dynamic(() => import('@/components/sanctuary/LagomDialogue'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-cosmic-gradient flex items-center justify-center">
      <p className="text-white/70">Entering the sanctuary...</p>
    </div>
  )
})

export default function MeditationExperience({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 bg-cosmic-gradient z-40 flex flex-col">
      {/* Return Button */}
      <m.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onComplete}
        className="absolute top-6 left-6 z-50 px-4 py-2 glass-morphism hover:border-white/40 text-white rounded-xl cosmic-focus transition-all duration-300 flex items-center gap-2 border border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        Leave Sanctuary
      </m.button>
      
      {/* Lagom Dialogue */}
      <LagomDialogue />
    </div>
  )
}