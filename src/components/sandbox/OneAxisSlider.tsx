'use client'

import { useState } from 'react'
import { m } from 'framer-motion'

interface OneAxisSliderProps {
  position?: number
  onPositionChange?: (pos: number) => void
  enabled?: boolean
  showRadiatingRings?: boolean
  showCoordinates?: boolean
  directionalIndicators?: { left: string, right: string }
}

export default function OneAxisSlider({ 
  position: controlledPosition,
  onPositionChange,
  enabled = true, 
  showRadiatingRings = false, 
  showCoordinates = false, 
  directionalIndicators = { left: '-', right: '+' } 
}: OneAxisSliderProps) {
  // Use internal state if not controlled
  const [internalPosition, setInternalPosition] = useState(0.5)
  const position = controlledPosition ?? internalPosition
  const setPosition = onPositionChange ?? setInternalPosition

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const updatePosition = (clientX: number) => {
      const x = (clientX - rect.left) / rect.width
      setPosition(Math.max(0, Math.min(1, x)))
    }
    
    updatePosition(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX)
    }
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div 
        className="relative h-2 bg-white/10 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <m.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full -ml-2"
          animate={{ left: `${position * 100}%` }}
          transition={{ type: "tween", duration: 0.1 }}
        >
          {/* Radiating rings effect */}
          {showRadiatingRings && (
            <>
              {[0, 1, 2].map((i) => (
                <m.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-white"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ 
                    scale: [1, 3],
                    opacity: [0.8, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.7,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}
        </m.div>
      </div>
      {showCoordinates && (
        <m.div 
          className="flex justify-between mt-2 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span>{directionalIndicators.left}1</span>
          <span>0</span>
          <span>{directionalIndicators.right}1</span>
        </m.div>
      )}
    </div>
  )
}