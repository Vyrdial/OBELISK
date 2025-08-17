'use client'

import React, { useState, useRef, useCallback } from 'react'
import { m } from 'framer-motion'

interface AntSliderProps {
  onPositionChange?: (position: number) => void
  initialPosition?: number
  showLabels?: boolean
  className?: string
}

export default function AntSlider({ 
  onPositionChange, 
  initialPosition = 0.5,
  showLabels = true,
  className = ""
}: AntSliderProps) {
  const [antPosition, setAntPosition] = useState(initialPosition) // 0 to 1 (normalized)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!sliderRef.current || !isDragging) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    
    setAntPosition(x)
    onPositionChange?.(x)
  }, [isDragging, onPositionChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.cursor = 'default'
  }, [])

  // Handle global mouse events for smoother dragging
  React.useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing'
      
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!sliderRef.current) return
        const rect = sliderRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        
        setAntPosition(x)
        onPositionChange?.(x)
      }
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'default'
      }
    }
  }, [isDragging, handleMouseUp, onPositionChange])

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-white/60 text-sm mb-2">
          <span>Left End</span>
          <span>Position: {(antPosition * 100).toFixed(0)}%</span>
          <span>Right End</span>
        </div>
      )}
      
      {/* Slider Track */}
      <div 
        ref={sliderRef}
        className="relative w-full h-16 bg-gradient-to-r from-amber-900/30 to-amber-700/30 rounded-full border-2 border-amber-600/50 cursor-pointer select-none overflow-hidden"
        onMouseDown={(e) => {
          setIsDragging(true)
          handleMouseMove(e)
        }}
      >
        {/* Track decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
        
        {/* Tick marks */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <div 
              key={i}
              className="w-0.5 h-8 bg-amber-400/40 rounded-full"
              style={{ position: 'absolute', left: `${tick * 100}%`, transform: 'translateX(-50%)' }}
            />
          ))}
        </div>
        
        {/* Ant Emoji */}
        <m.div
          className="absolute top-1/2 transform -translate-y-1/2 cursor-grab"
          style={{ 
            left: `${antPosition * 100}%`,
            x: '-50%',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          drag="x"
          dragConstraints={sliderRef}
          dragElastic={0}
          onDrag={(event, info) => {
            if (!sliderRef.current) return
            const rect = sliderRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(1, (info.point.x - rect.left) / rect.width))
            setAntPosition(x)
            onPositionChange?.(x)
          }}
        >
          <div className="text-5xl drop-shadow-lg select-none">
            🐜
          </div>
        </m.div>
      </div>
      
      {/* Description */}
      {showLabels && (
        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm">
            Drag the ant 🐜 along the tightrope! The ant can only move in one dimension - left or right along the rope.
          </p>
          <p className="text-white/60 text-xs mt-2">
            This demonstrates one-dimensional movement where there's only one independent way to vary position.
          </p>
        </div>
      )}
    </div>
  )
}