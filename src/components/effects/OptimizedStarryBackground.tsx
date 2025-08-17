'use client'

import { useEffect, useState, memo, useRef } from 'react'
import { m, LazyMotion, domAnimation } from 'framer-motion'

interface OptimizedStarryBackgroundProps {
  intensity?: 'low' | 'medium' | 'high' | 'epic'
  enableNebula?: boolean
  className?: string
}

const OptimizedStarryBackground = memo(function OptimizedStarryBackground({
  intensity = 'medium',
  enableNebula = true,
  className = ''
}: OptimizedStarryBackgroundProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const intensityConfig = {
    low: { starCount: 30 },
    medium: { starCount: 50 },
    high: { starCount: 80 },
    epic: { starCount: 120 }
  }
  
  const config = intensityConfig[intensity]
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Generate pseudo-random star positions with better distribution
  const generateStars = () => {
    const stars = []
    // Use a seeded pseudo-random generator for consistency
    let seed = 12345
    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) % 2147483647
      return seed / 2147483647
    }
    
    for (let i = 0; i < config.starCount; i++) {
      // Generate more natural-looking random positions
      const x = pseudoRandom() * 100
      const y = pseudoRandom() * 100
      
      // Vary sizes with more small stars than large ones
      const sizeRand = pseudoRandom()
      const size = sizeRand < 0.6 ? 1 : sizeRand < 0.9 ? 2 : 3
      
      // Random animation delays and durations
      const animationDelay = pseudoRandom() * 5
      const duration = 2 + pseudoRandom() * 3
      
      stars.push({
        id: i,
        left: `${x}%`,
        top: `${y}%`,
        size,
        animationDelay,
        duration
      })
    }
    return stars
  }
  
  const stars = generateStars()
  
  // Add CSS animations via style tag for better performance
  useEffect(() => {
    if (!mounted) return
    
    const style = document.createElement('style')
    style.textContent = `
      @keyframes twinkle {
        0% { opacity: 0.2; transform: scale(1); }
        25% { opacity: 0.5; transform: scale(1.05); }
        50% { opacity: 1; transform: scale(1.2); }
        75% { opacity: 0.5; transform: scale(1.05); }
        100% { opacity: 0.2; transform: scale(1); }
      }
      
      @keyframes nebula-drift {
        0%, 100% { opacity: 0.1; transform: scale(1) rotate(0deg); }
        50% { opacity: 0.3; transform: scale(1.1) rotate(180deg); }
      }
      
      @keyframes dust-float {
        0% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.3; }
        100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
      }
      
      .star {
        position: absolute;
        background: white;
        border-radius: 50%;
        animation: twinkle cubic-bezier(0.4, 0, 0.6, 1) infinite;
        will-change: opacity, transform;
      }
      
      .nebula-cloud {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        animation: nebula-drift ease-in-out infinite;
      }
      
      .cosmic-dust {
        position: absolute;
        width: 1px;
        height: 1px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        animation: dust-float ease-in-out infinite;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [mounted])
  
  
  if (!mounted) {
    // Simple server-side fallback
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-black opacity-50" />
      </div>
    )
  }
  
  return (
    <LazyMotion features={domAnimation}>
      <div 
        ref={containerRef}
        className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      >
        {/* Nebula Background - Using CSS animations */}
        {enableNebula && (
          <>
            <div 
              className="nebula-cloud"
              style={{
                left: '20%',
                top: '30%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(233, 69, 96, 0.3) 0%, transparent 70%)',
                animationDuration: '20s',
                animationDelay: '0s'
              }}
            />
            <div 
              className="nebula-cloud"
              style={{
                right: '60%',
                bottom: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(75, 0, 130, 0.1) 0%, transparent 70%)',
                animationDuration: '25s',
                animationDelay: '5s'
              }}
            />
            <div 
              className="nebula-cloud"
              style={{
                left: '50%',
                top: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(155, 89, 182, 0.15) 0%, transparent 70%)',
                animationDuration: '30s',
                animationDelay: '10s'
              }}
            />
          </>
        )}
        
        {/* Stars - Using CSS animations instead of framer-motion */}
        {stars.map((star) => {
          // Calculate initial opacity based on where in the animation cycle this star should start
          const animationProgress = (star.animationDelay / star.duration) % 1
          let initialOpacity = 0.2
          if (animationProgress < 0.25) {
            initialOpacity = 0.2 + (0.3 * (animationProgress / 0.25))
          } else if (animationProgress < 0.5) {
            initialOpacity = 0.5 + (0.5 * ((animationProgress - 0.25) / 0.25))
          } else if (animationProgress < 0.75) {
            initialOpacity = 1 - (0.5 * ((animationProgress - 0.5) / 0.25))
          } else {
            initialOpacity = 0.5 - (0.3 * ((animationProgress - 0.75) / 0.25))
          }
          
          return (
            <div
              key={star.id}
              className="star"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDuration: `${star.duration}s`,
                animationDelay: `-${star.animationDelay}s`, // Negative delay starts animation partway through
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)`,
                opacity: initialOpacity
              }}
            />
          )
        })}
        
        {/* Cosmic Dust */}
        {(() => {
          // Use same seeded random for cosmic dust
          let dustSeed = 54321
          const dustRandom = () => {
            dustSeed = (dustSeed * 1664525 + 1013904223) % 2147483647
            return dustSeed / 2147483647
          }
          
          return Array.from({ length: 15 }).map((_, i) => {
            const left = dustRandom() * 100
            const top = dustRandom() * 100
            const duration = 10 + dustRandom() * 10
            const delay = dustRandom() * 5
            
            return (
              <div
                key={`dust-${i}`}
                className="cosmic-dust"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`
                }}
              />
            )
          })
        })()}
        
        {/* Subtle constellation lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
          <defs>
            <linearGradient id="constellation-gradient">
              <stop offset="0%" stopColor="rgba(233, 69, 96, 0.3)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
            </linearGradient>
          </defs>
          {stars.slice(0, 8).map((star, index) => {
            const nextStar = stars[index + 1]
            if (!nextStar) return null
            
            const x1 = parseFloat(star.left)
            const y1 = parseFloat(star.top)
            const x2 = parseFloat(nextStar.left)
            const y2 = parseFloat(nextStar.top)
            
            return (
              <m.line
                key={`line-${star.id}`}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="url(#constellation-gradient)"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 0.3, 0.3, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: index * 1.5,
                  ease: "easeInOut"
                }}
              />
            )
          })}
        </svg>
      </div>
    </LazyMotion>
  )
})

export default OptimizedStarryBackground