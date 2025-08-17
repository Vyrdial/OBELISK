'use client'

import { m } from 'framer-motion'
import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react'
import { useTabVisibility, useOptimizedTimer } from '@/hooks/useTabVisibility'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'

interface CosmicBackgroundProps {
  intensity?: 'low' | 'medium' | 'high' | 'epic'
  enableMeteors?: boolean
  enableNebula?: boolean
  enablePlanets?: boolean
  className?: string
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  twinkleDelay: number
  color: string
}

interface Meteor {
  id: number
  x: number
  y: number
  angle: number
  speed: number
  size: number
  trail: { x: number; y: number }[]
}

interface Planet {
  id: number
  x: number
  y: number
  size: number
  color: string
  rings?: boolean
  orbitSpeed: number
  orbitRadius: number
  orbitCenter: { x: number; y: number }
  angle: number
}

const CosmicBackground = memo(function CosmicBackground({
  intensity = 'medium',
  enableMeteors = true,
  enableNebula = true,
  enablePlanets = true,
  className = ''
}: CosmicBackgroundProps) {
  const [stars, setStars] = useState<Star[]>([])
  const [meteors, setMeteors] = useState<Meteor[]>([])
  const [planets, setPlanets] = useState<Planet[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  const { isVisible, wasHidden } = useTabVisibility()
  const { getOptimizedSettings } = usePerformanceOptimization()
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Get optimized settings based on performance and visibility
  const settings = getOptimizedSettings()

  const intensityConfig = {
    low: { starCount: 30, meteorChance: 0.001, planetCount: 2 },
    medium: { starCount: settings.particleCount || 50, meteorChance: 0.003, planetCount: 3 },
    high: { starCount: settings.particleCount || 100, meteorChance: 0.007, planetCount: 4 },
    epic: { starCount: settings.particleCount || 150, meteorChance: 0.01, planetCount: 5 }
  }

  const config = intensityConfig[intensity] || intensityConfig.low

  // Handle pause/resume based on tab visibility
  useEffect(() => {
    const handlePause = () => setIsPaused(true)
    const handleResume = () => {
      if (wasHidden) {
        // Gradual resume after tab switch
        setTimeout(() => setIsPaused(false), settings.animationDelay)
      } else {
        setIsPaused(false)
      }
    }

    window.addEventListener('pauseAnimations', handlePause)
    window.addEventListener('resumeAnimations', handleResume)
    
    // Set initial pause state
    setIsPaused(!isVisible)

    return () => {
      window.removeEventListener('pauseAnimations', handlePause)
      window.removeEventListener('resumeAnimations', handleResume)
    }
  }, [isVisible, wasHidden, settings.animationDelay])

  // Initialize client-side rendering and dimensions
  useEffect(() => {
    setIsClient(true)
    
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || !isClient || initialized || !config) return
    
    // Randomize star positions - all white stars
    const newStars: Star[] = Array.from({ length: config.starCount }, (_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleDelay: Math.random() * 5,
      color: '#ffffff' // All stars are white
    }))

    setStars(newStars)
    setInitialized(true)
  }, [dimensions, config?.starCount, isClient, initialized])

  // Initialize planets with drifting motion
  useEffect(() => {
    if (dimensions.width === 0 || !isClient || !enablePlanets || !config) return

    const planetColors = [
      '#e74c3c', // Red
      '#3498db', // Blue
      '#f39c12', // Orange
      '#9b59b6', // Purple
      '#2ecc71', // Green
      '#f1c40f'  // Yellow
    ]
    
    const newPlanets: Planet[] = Array.from({ length: config.planetCount }, (_, i) => {
      // Random starting positions across the screen
      const startX = Math.random() * dimensions.width
      const startY = Math.random() * dimensions.height
      
      return {
        id: i,
        x: startX,
        y: startY,
        size: 20 + Math.random() * 40, // Random sizing 20-60px
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        rings: Math.random() > 0.6, // 40% chance of rings
        orbitSpeed: 0.5 + Math.random() * 1.5, // Now used as drift speed
        orbitRadius: 0, // Not used for drifting
        orbitCenter: { x: startX, y: startY }, // Store initial position
        angle: Math.random() * Math.PI * 2 // Direction of drift
      }
    })

    setPlanets(newPlanets)
  }, [dimensions, config?.planetCount, isClient, enablePlanets])

  // Animate planets using CSS animations instead of state updates
  const [animationStartTime] = useState(() => Date.now())

  // Optimized meteor shower effect
  useOptimizedTimer(() => {
    if (!enableMeteors || dimensions.width === 0 || !isClient || !config || isPaused) return

    if (Math.random() < config.meteorChance) {
      const newMeteor: Meteor = {
        id: Date.now() + Math.random(),
        x: Math.random() * dimensions.width,
        y: -50,
        angle: 30 + Math.random() * 30,
        speed: 6 + Math.random() * 3,
        size: 2 + Math.random() * 2,
        trail: []
      }

      setMeteors(prev => [...prev.slice(-2), newMeteor])

      // Remove meteor after animation
      setTimeout(() => {
        setMeteors(prev => prev.filter(m => m.id !== newMeteor.id))
      }, 2000)
    }
  }, 200, { pauseWhenHidden: true, reduceWhenHidden: true })

  // Update meteor positions
  useEffect(() => {
    const updateMeteors = () => {
      setMeteors(prev => prev.map(meteor => {
        const radians = (meteor.angle * Math.PI) / 180
        const newX = meteor.x + Math.cos(radians) * meteor.speed
        const newY = meteor.y + Math.sin(radians) * meteor.speed

        // Add to trail
        const newTrail = [...meteor.trail, { x: meteor.x, y: meteor.y }]
        if (newTrail.length > 15) newTrail.shift()

        return {
          ...meteor,
          x: newX,
          y: newY,
          trail: newTrail
        }
      }))
    }

    const interval = setInterval(updateMeteors, 16) // ~60fps
    return () => clearInterval(interval)
  }, [])

  // Don't render complex animations on server
  if (!isClient) {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-nebula-gradient opacity-50" />
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Nebula Background - Very subtle */}
      {enableNebula && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 20% 30%, rgba(233, 69, 96, 0.05) 0%, transparent 50%)',
              opacity: 0.3,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 80% 70%, rgba(52, 152, 219, 0.05) 0%, transparent 50%)',
              opacity: 0.25,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 60% 20%, rgba(155, 89, 182, 0.05) 0%, transparent 50%)',
              opacity: 0.2,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          />
        </>
      )}

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
            animation: `twinkle ${2 + star.twinkleDelay}s ${star.twinkleDelay}s ease-in-out infinite`,
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
      ))}

      {/* Meteor Showers */}
      {enableMeteors && meteors.map((meteor) => (
        <div key={meteor.id}>
          {/* Meteor Trail */}
          {meteor.trail.map((point, index) => (
            <m.div
              key={index}
              className="absolute rounded-full bg-white"
              style={{
                left: point.x,
                top: point.y,
                width: meteor.size * (index / meteor.trail.length),
                height: meteor.size * (index / meteor.trail.length),
                opacity: (index / meteor.trail.length) * 0.8,
              }}
            />
          ))}
          
          {/* Meteor Head */}
          <m.div
            className="absolute rounded-full bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora"
            style={{
              left: meteor.x,
              top: meteor.y,
              width: meteor.size,
              height: meteor.size,
              boxShadow: `0 0 ${meteor.size * 3}px rgba(233, 69, 96, 0.8)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3 }}
          />
        </div>
      ))}

      {/* Cosmic Dust - Disabled to prevent random bright spots */}
      {false && (
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`dust-${i}`}
              className="absolute w-px h-px bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `cosmic-dust-float ${15 + i * 2}s ${i * 0.5}s ease-in-out infinite`,
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            />
          ))}
        </div>
      )}


      {/* Constellation Connectors (Subtle) */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        {stars.slice(0, 10).map((star, index) => {
          const nextStar = stars[index + 1]
          if (!nextStar) return null
          
          return (
            <m.line
              key={`line-${star.id}`}
              x1={star.x}
              y1={star.y}
              x2={nextStar.x}
              y2={nextStar.y}
              stroke="rgba(233, 69, 96, 0.3)"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                delay: index * 2,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </svg>
    </div>
  )
})

export default CosmicBackground