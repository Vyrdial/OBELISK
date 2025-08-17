'use client'

import { m } from 'framer-motion'
import { useEffect, useState, memo } from 'react'

interface StableCosmicBackgroundProps {
  intensity?: 'low' | 'medium' | 'high'
  enableMeteors?: boolean
  enableNebula?: boolean
  className?: string
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  color: string
  twinkleSpeed: number
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
  moons?: Array<{ distance: number; size: number; speed: number; angle: number }>
  glowIntensity: number
  driftSpeed: number
  driftAngle: number
}


const StableCosmicBackground = memo(function StableCosmicBackground({
  intensity = 'medium',
  enableMeteors = true,
  enableNebula = true,
  className = ''
}: StableCosmicBackgroundProps) {
  const [stars, setStars] = useState<Star[]>([])
  const [meteors, setMeteors] = useState<Meteor[]>([])
  const [planets, setPlanets] = useState<Planet[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)

  const intensityConfig = {
    low: { starCount: 40, meteorChance: 0.002 },
    medium: { starCount: 80, meteorChance: 0.004 },
    high: { starCount: 120, meteorChance: 0.006 }
  }

  const config = intensityConfig[intensity]

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

  // Generate stable stars only once
  useEffect(() => {
    if (dimensions.width === 0 || !isClient) return

    const colors = ['#ffffff', '#e94560', '#f39c12', '#3498db', '#9b59b6', '#f1c40f']
    
    const newStars: Star[] = Array.from({ length: config.starCount }, (_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkleSpeed: 3 + Math.random() * 4
    }))

    setStars(newStars)
  }, [dimensions.width, dimensions.height, config.starCount, isClient])

  // Generate planets only once
  useEffect(() => {
    if (dimensions.width === 0 || !isClient) return

    const planetColors = [
      '#8b5cf6', // Magical purple
      '#06b6d4', // Ethereal cyan  
      '#f472b6', // Mystic pink
      '#34d399', // Enchanted emerald
      '#fbbf24', // Golden aurora
      '#a78bfa', // Lavender dream
      '#60a5fa', // Celestial blue
      '#fb7185', // Rose nebula
      '#10b981', // Jade mystique
      '#f59e0b', // Amber starlight
    ]
    
    const newPlanets: Planet[] = Array.from({ length: 3 }, (_, i) => {
      const size = 20 + Math.random() * 40 // Much smaller: 20-60px instead of 60-160px
      const hasRings = Math.random() > 0.7 // Less frequent rings
      const moons = Math.random() > 0.7 ? Array.from({ length: 1 }, (_, j) => ({ // Fewer moons, max 1
        distance: 20 + j * 15,
        size: 4 + Math.random() * 6, // Smaller moons
        speed: 0.3 + Math.random() * 0.8, // Slower moon orbits
        angle: Math.random() * 360
      })) : undefined

      return {
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size,
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        rings: hasRings,
        moons,
        glowIntensity: 0.2 + Math.random() * 0.3, // Less glow
        driftSpeed: 0.1 + Math.random() * 0.3, // Add drift speed
        driftAngle: Math.random() * 360 // Add drift direction
      }
    })

    setPlanets(newPlanets)
  }, [dimensions.width, dimensions.height, isClient])

  // Meteor shower effect
  useEffect(() => {
    if (!enableMeteors || dimensions.width === 0 || !isClient) return

    const interval = setInterval(() => {
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
    }, 200)

    return () => clearInterval(interval)
  }, [enableMeteors, dimensions.width, isClient, config.meteorChance])

  // Update meteor positions
  useEffect(() => {
    if (!enableMeteors) return

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
  }, [enableMeteors])

  // Update planet positions and moon orbits
  useEffect(() => {
    const updatePlanets = () => {
      setPlanets(prev => prev.map(planet => {
        // Calculate drift
        const radians = (planet.driftAngle * Math.PI) / 180
        let newX = planet.x + Math.cos(radians) * planet.driftSpeed
        let newY = planet.y + Math.sin(radians) * planet.driftSpeed
        
        // Wrap around screen edges
        if (newX > dimensions.width + planet.size) newX = -planet.size
        if (newX < -planet.size) newX = dimensions.width + planet.size
        if (newY > dimensions.height + planet.size) newY = -planet.size
        if (newY < -planet.size) newY = dimensions.height + planet.size

        return {
          ...planet,
          x: newX,
          y: newY,
          moons: planet.moons?.map(moon => ({
            ...moon,
            angle: moon.angle + moon.speed
          }))
        }
      }))
    }

    const interval = setInterval(updatePlanets, 100) // Update planets and moons
    return () => clearInterval(interval)
  }, [dimensions.width, dimensions.height])


  // Server-side fallback
  if (!isClient) {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/20 to-emerald-900/30" />
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Base cosmic gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/20 to-emerald-900/30" />
      
      {/* Stable nebula backgrounds */}
      {enableNebula && (
        <>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(ellipse 800px 400px at 20% 30%, rgba(233, 69, 96, 0.3) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-8"
            style={{
              background: 'radial-gradient(ellipse 600px 300px at 80% 70%, rgba(52, 152, 219, 0.2) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-6"
            style={{
              background: 'radial-gradient(ellipse 700px 350px at 60% 20%, rgba(155, 89, 182, 0.15) 0%, transparent 70%)',
            }}
          />
        </>
      )}

      {/* Stable twinkling stars */}
      {stars.map((star) => (
        <m.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            filter: `drop-shadow(0 0 ${star.size * 2}px ${star.color})`
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: 1.2,
          }}
          transition={{
            duration: star.twinkleSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Planetary System */}
      {planets.map((planet) => (
        <div key={planet.id} className="absolute">
          {/* Planet Rings */}
          {planet.rings && (
            <>
              <m.div
                className="absolute border rounded-full"
                style={{
                  left: planet.x - planet.size * 0.6,
                  top: planet.y - planet.size * 0.25,
                  width: planet.size * 1.2,
                  height: planet.size * 0.5,
                  borderImage: `linear-gradient(45deg, ${planet.color}60, transparent, ${planet.color}40) 1`,
                  borderWidth: '1px',
                  transform: 'rotateX(75deg) rotateY(15deg)',
                  opacity: 0.6,
                }}
                animate={{ 
                  rotate: [0, 360],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            </>
          )}
          
          {/* Planet Body */}
          <m.div
            className="absolute rounded-full"
            style={{
              left: planet.x - planet.size / 2,
              top: planet.y - planet.size / 2,
              width: planet.size,
              height: planet.size,
              background: `
                radial-gradient(circle at 25% 25%, 
                  ${planet.color}ff 0%, 
                  ${planet.color}dd 30%, 
                  ${planet.color}88 60%, 
                  ${planet.color}44 80%, 
                  transparent 100%
                ),
                radial-gradient(circle at 70% 70%, 
                  rgba(255,255,255,0.3) 0%, 
                  rgba(255,255,255,0.1) 40%, 
                  transparent 70%
                )
              `,
              filter: `brightness(1.2) saturate(1.3) blur(0.3px)`,
            }}
            animate={{
              scale: 1.02,
              opacity: [0.7, 0.9, 0.7],
              filter: [
                `brightness(1.2) saturate(1.3) blur(0.3px) hue-rotate(0deg)`,
                `brightness(1.4) saturate(1.5) blur(0.3px) hue-rotate(5deg)`,
                `brightness(1.2) saturate(1.3) blur(0.3px) hue-rotate(0deg)`
              ]
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Planet Moons */}
          {planet.moons?.map((moon, moonIndex) => {
            const moonX = planet.x + Math.cos((moon.angle * Math.PI) / 180) * moon.distance
            const moonY = planet.y + Math.sin((moon.angle * Math.PI) / 180) * moon.distance * 0.6 // Elliptical orbit
            
            return (
              <m.div
                key={moonIndex}
                className="absolute rounded-full"
                style={{
                  left: moonX - moon.size / 2,
                  top: moonY - moon.size / 2,
                  width: moon.size,
                  height: moon.size,
                  background: `
                    radial-gradient(circle at 30% 30%, 
                      rgba(255,255,255,0.9) 0%, 
                      rgba(200,200,255,0.7) 40%, 
                      rgba(150,150,220,0.4) 80%, 
                      transparent 100%
                    )
                  `,
                  filter: 'brightness(1.1) saturate(0.8) blur(0.2px)',
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: 1.1,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )
          })}
        </div>
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

      {/* Subtle pulsing cosmic energy */}
      <m.div
        className="absolute inset-0 opacity-5"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(233, 69, 96, 0.1) 0%, transparent 50%)'
        }}
        animate={{
          scale: 1.05,
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
})

export default StableCosmicBackground