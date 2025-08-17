'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, RotateCcw, Minus, Plus } from 'lucide-react'

interface CelestialBody {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  mass: number
  size: number
  color: string
  trail: { x: number; y: number }[]
}

export default function OrbitDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bodies, setBodies] = useState<CelestialBody[]>([])
  const [gravitationalConstant, setGravitationalConstant] = useState(100)
  const [showTrails, setShowTrails] = useState(true)
  const [timeStep, setTimeStep] = useState(0.02)

  const initializeBodies = () => {
    const newBodies: CelestialBody[] = [
      {
        id: 1,
        x: 150, // center
        y: 130,
        vx: 0,
        vy: 0,
        mass: 50,
        size: 20,
        color: '#FBBF24',
        trail: []
      },
      {
        id: 2,
        x: 220, // orbiting body
        y: 130,
        vx: 0,
        vy: 2.5,
        mass: 5,
        size: 8,
        color: '#60A5FA',
        trail: []
      },
      {
        id: 3,
        x: 80, // second orbiting body
        y: 130,
        vx: 0,
        vy: -3.2,
        mass: 3,
        size: 6,
        color: '#F472B6',
        trail: []
      }
    ]
    setBodies(newBodies)
  }

  useEffect(() => {
    initializeBodies()
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setBodies(prevBodies => {
        return prevBodies.map(body => {
          let fx = 0, fy = 0

          // Calculate gravitational forces from other bodies
          prevBodies.forEach(other => {
            if (other.id !== body.id) {
              const dx = other.x - body.x
              const dy = other.y - body.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              
              if (distance > 5) {
                // F = G * m1 * m2 / r^2
                const force = (gravitationalConstant * body.mass * other.mass) / (distance * distance * 10)
                fx += force * dx / distance
                fy += force * dy / distance
              }
            }
          })

          // Update velocity (F = ma, so a = F/m)
          const newVx = body.vx + (fx / body.mass) * timeStep
          const newVy = body.vy + (fy / body.mass) * timeStep

          // Update position
          const newX = body.x + newVx * timeStep * 10
          const newY = body.y + newVy * timeStep * 10

          // Update trail
          const newTrail = showTrails 
            ? [...body.trail, { x: body.x, y: body.y }].slice(-100)
            : []

          return {
            ...body,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            trail: newTrail
          }
        })
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isPlaying, gravitationalConstant, timeStep, showTrails])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    initializeBodies()
  }

  const adjustGravity = (delta: number) => {
    setGravitationalConstant(prev => Math.max(10, Math.min(300, prev + delta)))
  }

  const adjustTimeStep = (delta: number) => {
    setTimeStep(prev => Math.max(0.005, Math.min(0.05, prev + delta)))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Celestial Orbital Mechanics
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Dynamic balance between attraction and momentum
        </p>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={togglePlayPause}
            className="p-2 bg-cosmic-starlight/20 hover:bg-cosmic-starlight/30 border border-cosmic-starlight/40 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-cosmic-starlight" />
            ) : (
              <Play className="w-4 h-4 text-cosmic-starlight" />
            )}
          </button>
          
          <button
            onClick={reset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              showTrails
                ? 'bg-cosmic-aurora/30 text-cosmic-aurora border border-cosmic-aurora/50'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Trails
          </button>
        </div>

        {/* Parameter Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="space-y-2">
            <label className="block text-white/70">Gravity</label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustGravity(-20)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Minus className="w-3 h-3 text-white" />
              </button>
              <span className="text-white font-mono w-8 text-center">{gravitationalConstant}</span>
              <button
                onClick={() => adjustGravity(20)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/70">Time Speed</label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustTimeStep(-0.005)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Minus className="w-3 h-3 text-white" />
              </button>
              <span className="text-white font-mono w-8 text-center">{Math.round(timeStep * 1000)}</span>
              <button
                onClick={() => adjustTimeStep(0.005)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20">
          {/* Trails */}
          {showTrails && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {bodies.map(body => 
                body.trail.map((point, index) => (
                  <circle
                    key={`trail-${body.id}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="1"
                    fill={body.color}
                    opacity={index / body.trail.length * 0.8}
                  />
                ))
              )}
            </svg>
          )}
          
          {/* Gravitational field visualization */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {bodies.map((body, i) =>
              bodies.slice(i + 1).map((other, j) => {
                const dx = other.x - body.x
                const dy = other.y - body.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                return (
                  <line
                    key={`force-${i}-${j}`}
                    x1={body.x}
                    y1={body.y}
                    x2={other.x}
                    y2={other.y}
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.3"
                  />
                )
              })
            )}
          </svg>
          
          {/* Celestial Bodies */}
          {bodies.map((body) => (
            <m.div
              key={body.id}
              className="absolute rounded-full"
              style={{
                left: body.x,
                top: body.y,
                width: body.size,
                height: body.size,
                backgroundColor: body.color,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${body.size}px ${body.color}60`
              }}
              animate={{
                rotate: isPlaying ? 360 : 0
              }}
              transition={{
                duration: 2,
                repeat: isPlaying ? Infinity : 0,
                ease: "linear"
              }}
            />
          ))}
          
          {/* Center of mass indicator */}
          <div className="absolute" style={{
            left: bodies.reduce((sum, body) => sum + body.x * body.mass, 0) / bodies.reduce((sum, body) => sum + body.mass, 0),
            top: bodies.reduce((sum, body) => sum + body.y * body.mass, 0) / bodies.reduce((sum, body) => sum + body.mass, 0),
            transform: 'translate(-50%, -50%)'
          }}>
            <div className="w-2 h-2 border border-white/40 rounded-full"></div>
          </div>
          
          {/* Labels */}
          <div className="absolute top-2 left-2 text-xs text-white/60 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>Star</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>Planet</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-white/60 text-xs">
            Neither approach nor escape but dynamic equilibrium
          </p>
          <p className="text-cosmic-starlight text-xs">
            "Every orbit is a negotiation between freedom and connection"
          </p>
        </div>
      </div>
    </div>
  )
}
