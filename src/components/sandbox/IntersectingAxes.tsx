'use client'

import { useState, useRef } from 'react'
import { m } from 'framer-motion'

interface IntersectingAxesProps {
  showSecondAxis?: boolean
  showJunctionHighlight?: boolean
}

export default function IntersectingAxes({ 
  showSecondAxis = false, 
  showJunctionHighlight = false 
}: IntersectingAxesProps) {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)
  const [currentAxis, setCurrentAxis] = useState<'horizontal' | 'vertical' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return
    
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    const rect = container.getBoundingClientRect()
    
    const updatePosition = (clientX: number, clientY: number) => {
      const rawX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      
      // Add safety bounds to prevent going too far off axes
      const x = Math.max(0.1, Math.min(0.9, rawX))
      const y = Math.max(0.1, Math.min(0.9, rawY))
      
      if (!showSecondAxis) {
        setPosition({ x, y: 0.5 })
        return
      }
      
      // Calculate distance to center and define intersection zone
      const deltaX = Math.abs(x - 0.5)
      const deltaY = Math.abs(y - 0.5)
      const inIntersectionZone = deltaX < 0.04 && deltaY < 0.04 // Much smaller intersection zone
      
      if (inIntersectionZone && currentAxis === null) {
        // Allow free movement in intersection zone but clamp to zone bounds
        const clampedX = Math.max(0.5 - 0.04, Math.min(0.5 + 0.04, x))
        const clampedY = Math.max(0.5 - 0.04, Math.min(0.5 + 0.04, y))
        setPosition({ x: clampedX, y: clampedY })
      } else if (currentAxis === null) {
        // Determine axis based on movement direction from center
        const moveX = x - 0.5
        const moveY = y - 0.5
        
        if (Math.abs(moveX) > Math.abs(moveY) * 1.3) {
          setCurrentAxis('horizontal')
          setPosition({ x, y: 0.5 })
        } else if (Math.abs(moveY) > Math.abs(moveX) * 1.3) {
          setCurrentAxis('vertical')
          setPosition({ x: 0.5, y })
        } else {
          // Still close to center, snap to intersection
          setPosition({ x: 0.5, y: 0.5 })
        }
      } else {
        // Strict movement along current axis
        if (currentAxis === 'horizontal') {
          // Check if we're entering the intersection zone
          if (deltaX < 0.04) {
            setCurrentAxis(null)
            // Snap to intersection point when entering zone
            setPosition({ x: 0.5, y: 0.5 })
          } else {
            // Strictly constrain to horizontal axis
            setPosition({ x, y: 0.5 })
          }
        } else if (currentAxis === 'vertical') {
          // Check if we're entering the intersection zone
          if (deltaY < 0.04) {
            setCurrentAxis(null)
            // Snap to intersection point when entering zone
            setPosition({ x: 0.5, y: 0.5 })
          } else {
            // Strictly constrain to vertical axis
            setPosition({ x: 0.5, y })
          }
        }
      }
    }
    
    // Initial position
    updatePosition(e.clientX, e.clientY)
    
    const handlePointerMove = (e: PointerEvent) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        updatePosition(e.clientX, e.clientY)
      })
    }
    
    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
    }
    
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)
  }
  
  const isAtCenter = Math.abs(position.x - 0.5) < 0.04 && Math.abs(position.y - 0.5) < 0.04
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Status text with smooth transitions */}
      {showSecondAxis && (
        <m.p 
          className="text-center text-white/60 text-sm mb-4"
          key={currentAxis || 'center'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isAtCenter 
            ? "At intersection • Move to select axis"
            : `${currentAxis === 'horizontal' ? 'Horizontal' : 'Vertical'} axis • Return to center to switch`}
        </m.p>
      )}
      
      <div 
        ref={containerRef}
        className="relative h-96 touch-none select-none"
        onPointerDown={handlePointerDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Axes with subtle glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
          {showSecondAxis && (
            <m.div
              className="absolute w-2 h-full bg-white/10 rounded-full overflow-hidden"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            </m.div>
          )}
          
          {/* Junction highlight circle */}
          {showJunctionHighlight && (
            <m.div
              className="absolute pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <m.div 
                className="w-24 h-24 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2"
                animate={{ 
                  scale: 1.15,
                  opacity: [0.8, 0.4, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </m.div>
          )}
          
          {/* Axis labels */}
          {showSecondAxis && (
            <>
              <m.div 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-xs font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                X
              </m.div>
              <m.div 
                className="absolute left-1/2 top-2 -translate-x-1/2 text-white/40 text-xs font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Y
              </m.div>
            </>
          )}
        </div>
        
        {/* Intersection glow */}
        {showSecondAxis && (
          <m.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            animate={{ 
              scale: isAtCenter ? 1.5 : 1,
              opacity: isAtCenter ? 0.8 : 0.3 
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 rounded-full bg-cosmic-aurora/20 blur-xl" />
          </m.div>
        )}
        
        {/* Center point indicator */}
        {showSecondAxis && (
          <m.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <m.div 
              className="w-2 h-2 rounded-full bg-white/20"
              animate={{ 
                scale: 1.2,
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </m.div>
        )}
        
        {/* Trail effect */}
        <m.div
          className="absolute w-3 h-3 pointer-events-none rounded-full bg-white/20"
          animate={{ 
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
          }}
          transition={{ 
            type: "spring",
            damping: 20,
            stiffness: 100
          }}
          style={{ x: '-50%', y: '-50%' }}
        />
        
        {/* Slider dot */}
        <m.div
          className="absolute w-4 h-4 pointer-events-none"
          animate={{ 
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            scale: isDragging ? 1.2 : 1
          }}
          transition={{ 
            type: "tween",
            duration: 0.05,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          style={{ x: '-50%', y: '-50%' }}
        >
          {/* Glow effect - stronger when at intersection */}
          <div className={`absolute inset-0 rounded-full bg-white ${isAtCenter ? 'blur-md opacity-80' : 'blur-sm opacity-60'}`} />
          {/* Main dot */}
          <div className={`relative w-full h-full rounded-full shadow-lg ${
            currentAxis === 'horizontal' ? 'bg-blue-400' : 
            currentAxis === 'vertical' ? 'bg-purple-400' : 
            'bg-white'
          }`} />
        </m.div>
        
        {/* Axis guides (subtle lines showing current axis) */}
        {showSecondAxis && currentAxis && !isAtCenter && (
          <m.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
          >
            {currentAxis === 'horizontal' ? (
              <div className="absolute left-0 right-0 top-1/2 h-px bg-cosmic-aurora -translate-y-1/2" />
            ) : (
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cosmic-aurora -translate-x-1/2" />
            )}
          </m.div>
        )}
      </div>
      
    </div>
  )
}