'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, RotateCcw, Zap } from 'lucide-react'

interface Charge {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  charge: number // positive or negative
  size: number
}

export default function RepulsionDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [charges, setCharges] = useState<Charge[]>([])
  const [repulsionStrength, setRepulsionStrength] = useState(200)
  const [showFieldLines, setShowFieldLines] = useState(true)

  const initializeCharges = () => {
    const newCharges: Charge[] = [
      {
        id: 1,
        x: 120,
        y: 130,
        vx: 0,
        vy: 0,
        charge: 1,
        size: 16
      },
      {
        id: 2,
        x: 180,
        y: 130,
        vx: 0,
        vy: 0,
        charge: 1,
        size: 16
      },
      {
        id: 3,
        x: 150,
        y: 100,
        vx: 0,
        vy: 0,
        charge: -1,
        size: 12
      },
      {
        id: 4,
        x: 150,
        y: 160,
        vx: 0,
        vy: 0,
        charge: -1,
        size: 12
      }
    ]
    setCharges(newCharges)
  }

  useEffect(() => {
    initializeCharges()
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCharges(prevCharges => {
        return prevCharges.map(charge => {
          let fx = 0, fy = 0

          // Calculate repulsive/attractive forces from other charges
          prevCharges.forEach(other => {
            if (other.id !== charge.id) {
              const dx = other.x - charge.x
              const dy = other.y - charge.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              
              if (distance > 5) {
                // Coulomb's law: F = k * q1 * q2 / r^2
                // Same charges repel, opposite charges attract
                const force = (repulsionStrength * charge.charge * other.charge) / (distance * distance)
                const forceX = -force * dx / distance // negative for repulsion
                const forceY = -force * dy / distance
                
                fx += forceX
                fy += forceY
              }
            }
          })

          // Update velocity
          const newVx = charge.vx + fx * 0.01
          const newVy = charge.vy + fy * 0.01
          
          // Apply damping
          const damping = 0.95
          const dampedVx = newVx * damping
          const dampedVy = newVy * damping

          // Update position
          let newX = charge.x + dampedVx
          let newY = charge.y + dampedVy

          // Boundary collisions
          const margin = charge.size / 2
          if (newX < margin || newX > 300 - margin) {
            newX = Math.max(margin, Math.min(300 - margin, newX))
          }
          if (newY < margin || newY > 200 - margin) {
            newY = Math.max(margin, Math.min(200 - margin, newY))
          }

          return {
            ...charge,
            x: newX,
            y: newY,
            vx: dampedVx,
            vy: dampedVy
          }
        })
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isPlaying, repulsionStrength])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    initializeCharges()
  }

  const getChargeColor = (charge: number) => {
    return charge > 0 ? '#EF4444' : '#3B82F6'
  }

  const generateFieldLines = () => {
    const lines = []
    const gridSize = 20
    
    for (let x = 20; x < 280; x += gridSize) {
      for (let y = 20; y < 180; y += gridSize) {
        let fx = 0, fy = 0
        
        charges.forEach(charge => {
          const dx = x - charge.x
          const dy = y - charge.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 10) {
            const field = (charge.charge * 100) / (distance * distance)
            fx += field * dx / distance
            fy += field * dy / distance
          }
        })
        
        const magnitude = Math.sqrt(fx * fx + fy * fy)
        if (magnitude > 0.1) {
          const length = Math.min(12, magnitude * 2)
          const angle = Math.atan2(fy, fx)
          
          lines.push({
            x1: x,
            y1: y,
            x2: x + Math.cos(angle) * length,
            y2: y + Math.sin(angle) * length,
            opacity: Math.min(1, magnitude * 0.3)
          })
        }
      }
    }
    
    return lines
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Electromagnetic Force Field
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Watch charges maintain their boundaries through repulsion
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
            onClick={() => setShowFieldLines(!showFieldLines)}
            className={`p-2 rounded-lg transition-colors ${
              showFieldLines 
                ? 'bg-cosmic-aurora/20 border border-cosmic-aurora/40 text-cosmic-aurora'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

        {/* Repulsion Strength Slider */}
        <div className="mb-4">
          <label className="block text-white/70 text-sm mb-2">
            Field Strength: {repulsionStrength}
          </label>
          <input
            type="range"
            min="50"
            max="500"
            value={repulsionStrength}
            onChange={(e) => setRepulsionStrength(Number(e.target.value))}
            className="w-48 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Visualization */}
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20">
          {/* Field Lines */}
          {showFieldLines && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {generateFieldLines().map((line, index) => (
                <line
                  key={index}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="white"
                  strokeWidth="1"
                  opacity={line.opacity * 0.4}
                />
              ))}
            </svg>
          )}
          
          {/* Force vectors between charges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {charges.map((charge, i) =>
              charges.slice(i + 1).map((other, j) => {
                const dx = other.x - charge.x
                const dy = other.y - charge.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance > 5) {
                  const sameCharge = charge.charge * other.charge > 0
                  const midX = (charge.x + other.x) / 2
                  const midY = (charge.y + other.y) / 2
                  
                  return (
                    <g key={`force-${i}-${j}`}>
                      <line
                        x1={charge.x}
                        y1={charge.y}
                        x2={other.x}
                        y2={other.y}
                        stroke={sameCharge ? '#EF4444' : '#3B82F6'}
                        strokeWidth="1"
                        strokeDasharray={sameCharge ? '3,3' : 'none'}
                        opacity="0.5"
                      />
                      <text
                        x={midX}
                        y={midY - 5}
                        fontSize="10"
                        fill="white"
                        textAnchor="middle"
                        opacity="0.7"
                      >
                        {sameCharge ? 'repel' : 'attract'}
                      </text>
                    </g>
                  )
                }
                return null
              })
            )}
          </svg>
          
          {/* Charges */}
          {charges.map((charge) => (
            <m.div
              key={charge.id}
              className="absolute rounded-full flex items-center justify-center text-white font-bold"
              style={{
                left: charge.x,
                top: charge.y,
                width: charge.size,
                height: charge.size,
                backgroundColor: getChargeColor(charge.charge),
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${charge.size}px ${getChargeColor(charge.charge)}60`
              }}
              animate={{
                x: 0,
                y: 0
              }}
            >
              {charge.charge > 0 ? '+' : '−'}
            </m.div>
          ))}
          
          {/* Legend */}
          <div className="absolute top-2 left-2 text-xs text-white/60 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Positive (+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Negative (−)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-white/60 text-xs">
            Like charges repel, opposite charges attract
          </p>
          <p className="text-cosmic-starlight text-xs">
            "Repulsion creates the space necessary for relationship"
          </p>
        </div>
      </div>
    </div>
  )
}
