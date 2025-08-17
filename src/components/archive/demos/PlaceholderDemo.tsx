'use client'

import { m } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface PlaceholderDemoProps {
  conceptName: string
}

export default function PlaceholderDemo({ conceptName }: PlaceholderDemoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-white/70 mb-4">
          Interactive demonstration for {conceptName}
        </p>
        
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20 flex items-center justify-center">
          <m.div
            animate={{ 
              scale: 1.1,
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex flex-col items-center gap-4 text-cosmic-starlight"
          >
            <Sparkles className="w-12 h-12" />
            <div className="text-lg font-medium">
              {conceptName}
            </div>
            <div className="text-sm text-white/60">
              Demo coming soon
            </div>
          </m.div>
        </div>

        <p className="text-white/40 text-xs mt-4">
          This concept awaits its interactive demonstration
        </p>
      </div>
    </div>
  )
}