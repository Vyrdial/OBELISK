'use client'

import { useState, useRef } from 'react'
import { m } from 'framer-motion'

interface FreeTwoAxisAreaProps {
  position?: { x: number, y: number }
  onPositionChange?: (pos: { x: number, y: number }) => void
  enabled?: boolean
  showGrid?: boolean
}

export default function FreeTwoAxisArea({ 
  position: controlledPosition,
  onPositionChange,
  enabled = true, 
  showGrid = false 
}: FreeTwoAxisAreaProps) {
  // Use internal state if not controlled
  const [internalPosition, setInternalPosition] = useState({ x: 0.5, y: 0.5 })
  const position = controlledPosition ?? internalPosition
  const setPosition = onPositionChange ?? setInternalPosition
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const updatePosition = (e: MouseEvent) => {
      e.preventDefault()
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setPosition({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y))
      })
    }
    
    updatePosition(e.nativeEvent)
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', updatePosition, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-white/5 border border-white/20 rounded-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Grid animation */}
          {showGrid && (
            <m.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {[...Array(10)].map((_, i) => (
                <g key={`grid-${i}`}>
                  <m.line
                    x1={`${(i + 1) * 10}%`}
                    y1="0"
                    x2={`${(i + 1) * 10}%`}
                    y2="100%"
                    stroke="rgba(255,255,255,0.1)"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  />
                  <m.line
                    x1="0"
                    y1={`${(i + 1) * 10}%`}
                    x2="100%"
                    y2={`${(i + 1) * 10}%`}
                    stroke="rgba(255,255,255,0.1)"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  />
                </g>
              ))}
            </m.g>
          )}
          
          {/* Main axes */}
          <line 
            x1="50%" y1="0" x2="50%" y2="100%" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="2"
          />
          <line 
            x1="0" y1="50%" x2="100%" y2="50%" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="2"
          />
          
          {/* Axis labels */}
          <text x="95%" y="45%" fill="rgba(255,255,255,0.6)" fontSize="14" textAnchor="middle" dominantBaseline="middle">
            X
          </text>
          <text x="55%" y="8%" fill="rgba(255,255,255,0.6)" fontSize="14" textAnchor="middle" dominantBaseline="middle">
            Y
          </text>
        </svg>
        
        {/* Position indicator dot */}
        <m.div
          className="absolute w-4 h-4 bg-cosmic-aurora rounded-full -ml-2 -mt-2"
          animate={{ 
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`
          }}
          transition={{ type: "tween", duration: 0.1 }}
        />
        
        {/* Coordinate display */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded px-3 py-1">
          <p className="text-white/80 text-sm font-mono">
            ({(position.x * 2 - 1).toFixed(2)}, {(1 - position.y * 2).toFixed(2)})
          </p>
        </div>
      </div>
    </div>
  )
}