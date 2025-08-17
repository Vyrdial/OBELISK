'use client'

import { useEffect, useState } from 'react'

interface Planet {
  id: number
  x: number
  y: number
  size: number
  color: string
  orbitSpeed: number
  orbitRadius: number
  orbitCenterX: number
  orbitCenterY: number
  angle: number
}

export default function StableCosmicBackground() {
  const [mounted, setMounted] = useState(false)
  const [planets, setPlanets] = useState<Planet[]>([])
  
  // Initialize after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)
    
    // Initialize planets with deterministic values
    const initialPlanets: Planet[] = [
      {
        id: 1,
        x: 0,
        y: 0,
        size: 40,
        color: '#3498db',
        orbitSpeed: 0.0003,
        orbitRadius: 150,
        orbitCenterX: 0.7, // Percentage of screen width
        orbitCenterY: 0.3, // Percentage of screen height
        angle: 0
      },
      {
        id: 2,
        x: 0,
        y: 0,
        size: 30,
        color: '#e74c3c',
        orbitSpeed: 0.0005,
        orbitRadius: 100,
        orbitCenterX: 0.2,
        orbitCenterY: 0.6,
        angle: Math.PI
      },
      {
        id: 3,
        x: 0,
        y: 0,
        size: 25,
        color: '#f39c12',
        orbitSpeed: 0.0004,
        orbitRadius: 120,
        orbitCenterX: 0.8,
        orbitCenterY: 0.7,
        angle: Math.PI / 2
      }
    ]
    
    setPlanets(initialPlanets)
  }, [])
  
  // Animate planets
  useEffect(() => {
    if (!mounted) return
    
    const animatePlanets = () => {
      setPlanets(prev => prev.map(planet => {
        const newAngle = planet.angle + planet.orbitSpeed
        const centerX = window.innerWidth * planet.orbitCenterX
        const centerY = window.innerHeight * planet.orbitCenterY
        const newX = centerX + Math.cos(newAngle) * planet.orbitRadius
        const newY = centerY + Math.sin(newAngle) * planet.orbitRadius
        
        return {
          ...planet,
          x: newX,
          y: newY,
          angle: newAngle
        }
      }))
    }
    
    const interval = setInterval(animatePlanets, 50) // 20fps for smooth movement
    return () => clearInterval(interval)
  }, [mounted])
  
  if (!mounted) {
    return null // Return nothing during SSR to avoid hydration mismatch
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/20 to-emerald-900/30" />
      
      {/* Static Stars */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => {
          // Use deterministic positioning based on index
          const x = ((i * 137) % 100) + '%'
          const y = ((i * 89) % 100) + '%'
          const size = (i % 3) + 1
          const delay = (i % 5) + 's'
          
          return (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white/30 animate-pulse"
              style={{
                left: x,
                top: y,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: delay,
                animationDuration: '4s'
              }}
            />
          )
        })}
      </div>
      
      {/* Drifting Planets */}
      {planets.map((planet) => (
        <div
          key={planet.id}
          className="absolute transition-none"
          style={{
            left: `${planet.x}px`,
            top: `${planet.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              background: `radial-gradient(circle at 30% 30%, ${planet.color}dd, ${planet.color}88)`,
              boxShadow: `0 0 ${planet.size}px ${planet.color}44, inset 0 0 ${planet.size / 3}px rgba(0,0,0,0.3)`
            }}
          >
            {/* Planet surface detail */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `radial-gradient(ellipse at 20% 20%, transparent 30%, ${planet.color}44 70%)`
              }}
            />
          </div>
        </div>
      ))}
      
      {/* Nebula Effects */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute w-full h-full"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(233, 69, 96, 0.3) 0%, transparent 50%)'
          }}
        />
        <div 
          className="absolute w-full h-full"
          style={{
            background: 'radial-gradient(ellipse at 80% 70%, rgba(52, 152, 219, 0.2) 0%, transparent 50%)'
          }}
        />
      </div>
    </div>
  )
}