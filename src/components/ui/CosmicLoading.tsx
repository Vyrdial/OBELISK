'use client'

import { m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getRandomSplashText } from '@/lib/splashTexts'

interface CosmicLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  showMessage?: boolean
  randomMessage?: boolean
}

export default function CosmicLoading({ 
  message,
  size = 'md',
  showMessage = true,
  randomMessage = true
}: CosmicLoadingProps) {
  const [displayMessage, setDisplayMessage] = useState(message || "Traversing the cosmos...")
  
  useEffect(() => {
    if (randomMessage && !message) {
      setDisplayMessage(getRandomSplashText())
      // Change message every 3 seconds if still loading
      const interval = setInterval(() => {
        setDisplayMessage(getRandomSplashText())
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [randomMessage, message])
  const sizeConfig = {
    sm: { container: 'w-8 h-8', orb: 'w-2 h-2', text: 'text-sm' },
    md: { container: 'w-16 h-16', orb: 'w-3 h-3', text: 'text-base' },
    lg: { container: 'w-24 h-24', orb: 'w-4 h-4', text: 'text-lg' }
  }

  const config = sizeConfig[size]

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Loading Animation */}
      <div className={`relative ${config.container}`}>
        {/* Central Star */}
        <m.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora"
          animate={{
            scale: 1.2,
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Orbiting Elements */}
        {[...Array(3)].map((_, i) => (
          <m.div
            key={i}
            className={`absolute ${config.orb} rounded-full bg-cosmic-quasar`}
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${20 + i * 8}px center`,
            }}
            animate={{
              rotate: [0, 360],
              scale: 1,
            }}
            transition={{
              rotate: {
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 1.5,
                repeat: Infinity, repeatType: "reverse",
                delay: i * 0.2,
                ease: "easeInOut"
              }
            }}
          />
        ))}

        {/* Particle Ring */}
        {[...Array(8)].map((_, i) => (
          <m.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cosmic-stardust rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${30}px center`,
            }}
            animate={{
              rotate: [i * 45, i * 45 + 360],
              opacity: [0, 1, 0],
            }}
            transition={{
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }
            }}
          />
        ))}
      </div>

      {/* Loading Message */}
      {showMessage && (
        <m.p
          className={`text-white/70 ${config.text} text-center font-medium`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {displayMessage}
        </m.p>
      )}

      {/* Loading Dots */}
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <m.div
            key={i}
            className="w-2 h-2 bg-cosmic-aurora rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )
}