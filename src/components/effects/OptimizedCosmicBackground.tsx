'use client'

import { memo } from 'react'

interface OptimizedCosmicBackgroundProps {
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

const OptimizedCosmicBackground = memo(function OptimizedCosmicBackground({
  intensity = 'medium',
  className = ''
}: OptimizedCosmicBackgroundProps) {
  const intensityConfig = {
    low: { starCount: 10, opacity: 0.3, nebulaOpacity: 0.15 },
    medium: { starCount: 15, opacity: 0.5, nebulaOpacity: 0.25 },
    high: { starCount: 20, opacity: 0.7, nebulaOpacity: 0.35 }
  }

  const config = intensityConfig[intensity]

  // Generate stars deterministically based on index for stability
  const stars = Array.from({ length: config.starCount }, (_, i) => {
    const seed = i * 137.5 // Golden angle for better distribution
    return {
      id: i,
      left: `${(seed * 23) % 100}%`,
      top: `${(seed * 17) % 100}%`,
      size: 1 + (i % 3) * 0.5,
      delay: (i % 5) * 0.4,
      duration: 3 + (i % 3)
    }
  })

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />
      
      {/* Optimized stars using CSS animations */}
      <div className="absolute inset-0">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: config.opacity,
              animation: `twinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              perspective: '1000px'
            }}
          />
        ))}
      </div>

      {/* Enhanced cosmic nebula system */}
      <div className="absolute inset-0" style={{ opacity: config.nebulaOpacity }}>
        {/* Primary nebula - cosmic aurora colors with complex movement */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96"
          style={{ 
            background: 'radial-gradient(circle, rgba(243,156,18,0.4) 0%, rgba(233,69,96,0.3) 30%, rgba(147,51,234,0.2) 60%, transparent 100%)',
            filter: 'blur(60px)',
            animation: 'cosmic-nebula-swirl 30s ease-in-out infinite',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden' 
          }} 
        />
        
        {/* Secondary nebula - starlight colors with orbital motion */}
        <div 
          className="absolute top-1/2 left-1/3 w-80 h-80"
          style={{ 
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(168,85,247,0.3) 40%, rgba(236,72,153,0.2) 70%, transparent 100%)',
            filter: 'blur(50px)',
            animation: 'cosmic-nebula-orbit 25s ease-in-out infinite',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden' 
          }} 
        />
        
        {/* Tertiary nebula - mystical purple with breathing effect */}
        <div 
          className="absolute bottom-1/3 right-1/3 w-72 h-72"
          style={{ 
            background: 'radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(99,102,241,0.3) 50%, transparent 100%)',
            filter: 'blur(45px)',
            animation: 'cosmic-nebula-breathe 20s ease-in-out infinite',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden' 
          }} 
        />
        
        {/* Micro nebulas for depth */}
        <div 
          className="absolute top-1/4 right-1/4 w-48 h-48"
          style={{ 
            background: 'radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 70%)',
            filter: 'blur(30px)',
            animation: 'cosmic-nebula-float 35s ease-in-out infinite',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden' 
          }} 
        />
        
        <div 
          className="absolute bottom-1/4 left-1/4 w-56 h-56"
          style={{ 
            background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)',
            filter: 'blur(35px)',
            animation: 'cosmic-nebula-drift 40s ease-in-out infinite reverse',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden' 
          }} 
        />
      </div>
    </div>
  )
})

export default OptimizedCosmicBackground