'use client'

import { m } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getRandomSplashText } from '@/lib/splashTexts'

interface SuspenseFallbackProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  randomMessage?: boolean
}

export default function SuspenseFallback({ 
  message,
  size = 'md',
  randomMessage = true
}: SuspenseFallbackProps) {
  const [displayMessage, setDisplayMessage] = useState(message || "Loading...")
  
  useEffect(() => {
    if (randomMessage && !message) {
      setDisplayMessage(getRandomSplashText())
    }
  }, [randomMessage, message])
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex items-center justify-center p-8">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <m.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} text-cosmic-aurora`}
          >
            <Loader2 className="w-full h-full" />
          </m.div>
          
          <m.div
            animate={{ scale: 1.2 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-4 h-4 text-cosmic-starlight" />
          </m.div>
        </div>
        
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-sm"
        >
          {displayMessage}
        </m.p>
      </m.div>
    </div>
  )
}