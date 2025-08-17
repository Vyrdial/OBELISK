'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  mass: number
  color: string
}

export default function AttractionDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [attractionStrength, setAttractionStrength] = useState(50)

  const initializeParticles = () => {
    const newParticles: Particle[] = []
    const colors = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA']
    
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        mass: Math.random() * 3 + 1,
        color: colors[i % colors.length]
      })
    }
    setParticles(newParticles)
  }

  useEffect(() => {
    initializeParticles()
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          let fx = 0, fy = 0

          // Calculate gravitational forces from other particles
          prevParticles.forEach(other => {
            if (other.id !== particle.id) {
              const dx = other.x - particle.x
              const dy = other.y - particle.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              
              if (distance > 5) { // Avoid division by zero
                const force = (attractionStrength * particle.mass * other.mass) / (distance * distance * 100)
                fx += force * dx / distance
                fy += force * dy / distance
              }
            }
          })

          // Update velocity and position
          const newVx = particle.vx + fx / particle.mass
          const newVy = particle.vy + fy / particle.mass
          
          // Apply damping
          const damping = 0.99
          let dampedVx = newVx * damping
          let dampedVy = newVy * damping

          let newX = particle.x + dampedVx
          let newY = particle.y + dampedVy

          // Boundary collisions
          if (newX < 10 || newX > 290) dampedVx *= -0.8
          if (newY < 10 || newY > 190) dampedVy *= -0.8
          newX = Math.max(10, Math.min(290, newX))
          newY = Math.max(10, Math.min(190, newY))

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: dampedVx,
            vy: dampedVy
          }
        })
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isPlaying, attractionStrength])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    initializeParticles()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-white/70 mb-4">
          Watch particles drawn together by mutual attraction
        </p>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={togglePlayPause}
            className="p-2 bg-cosmic-starlight/20 hover:bg-cosmic-starlight/30 border border-cosmic-starlight/40 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-cosmic-starlight" />
            ) : (
              <Play className="w-5 h-5 text-cosmic-starlight" />
            )}
          </button>
          
          <button
            onClick={reset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Attraction Strength Slider */}
        <div className="mb-6">
          <label className="block text-white/70 text-sm mb-2">
            Attraction Strength: {attractionStrength}
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={attractionStrength}
            onChange={(e) => setAttractionStrength(Number(e.target.value))}
            className="w-48 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Simulation Area */}
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20">
          {particles.map(particle => (
            <m.div
              key={particle.id}
              animate={{
                x: particle.x,
                y: particle.y
              }}
              transition={{ duration: 0 }}
              className="absolute rounded-full"
              style={{
                width: `${particle.mass * 6}px`,
                height: `${particle.mass * 6}px`,
                backgroundColor: particle.color,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {particles.map((particle, i) =>
              particles.slice(i + 1).map(other => {
                const distance = Math.sqrt(
                  (particle.x - other.x) ** 2 + (particle.y - other.y) ** 2
                )
                const opacity = Math.max(0, 1 - distance / 100)
                
                return (
                  <line
                    key={`${particle.id}-${other.id}`}
                    x1={particle.x}
                    y1={particle.y}
                    x2={other.x}
                    y2={other.y}
                    stroke="white"
                    strokeWidth="1"
                    opacity={opacity * 0.3}
                  />
                )
              })
            )}
          </svg>
        </div>

        <p className="text-white/40 text-xs mt-4">
          The universe recognizing itself in apparent otherness
        </p>
      </div>
    </div>
  )
}