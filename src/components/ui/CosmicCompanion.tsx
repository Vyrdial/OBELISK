'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import EquippedAvatar from './EquippedAvatar'

export default function CosmicCompanion() {
  const pathname = usePathname()
  const [showCompanion, setShowCompanion] = useState(false)
  const [isFloating, setIsFloating] = useState(true)

  // Show companion on certain pages
  useEffect(() => {
    // Show on main app pages, but not on auth or lesson pages
    const showOnPages = ['/planner'] // Removed /galaxy, /shop, /archive, /home, /sanctuary
    const isMainPage = showOnPages.some(page => pathname === page)
    const isNotLessonPage = !pathname.includes('/null-core') && !pathname.includes('/learn')
    
    setShowCompanion(isMainPage && isNotLessonPage)
  }, [pathname])

  if (!showCompanion) return null

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0, x: 100, y: 100 }}
        className="fixed bottom-6 left-6 z-40 pointer-events-none"
      >
        <m.div
          animate={isFloating ? {
            y: [-5, 5, -5],
            rotate: [-2, 2, -2]
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* Companion Avatar */}
          <EquippedAvatar 
            size="md" 
            showPulse={true} 
            showTrail={true}
            showEffects={true}
          />
          
          {/* Cosmic Trail */}
          {[...Array(3)].map((_, i) => (
            <m.div
              key={i}
              className="absolute inset-0"
              animate={{
                scale: 1.5,
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            >
              <EquippedAvatar size="md" className="opacity-20" showEffects={true} />
            </m.div>
          ))}
          
          {/* Hover interaction */}
          <m.div
            className="absolute inset-0 cursor-pointer pointer-events-auto"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFloating(!isFloating)}
            title="Your cosmic companion • Click to toggle float"
          />
        </m.div>
        
        {/* Status indicator */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full border-2 border-black/50 animate-pulse"
        />
      </m.div>
    </AnimatePresence>
  )
}