'use client'

import React, { useState, useRef, useCallback } from 'react'
import { m } from 'framer-motion'

interface InteractiveChangeTrendGraphProps {
  onReferencePointChange?: (x: number) => void
  onObserverPositionChange?: (x: number) => void
}

export default function InteractiveChangeTrendGraph({ 
  onReferencePointChange, 
  onObserverPositionChange 
}: InteractiveChangeTrendGraphProps) {
  const [referencePoint, setReferencePoint] = useState(0.5) // 0 to 1 (normalized)
  const [observerPosition, setObserverPosition] = useState(0.2) // Observer position
  const [isDraggingRef, setIsDraggingRef] = useState(false)
  const [isDraggingObs, setIsDraggingObs] = useState(false)
  const graphRef = useRef<HTMLDivElement>(null)

  // Sample function: f(x) = x^2 for demonstration
  const sampleFunction = (x: number) => {
    const scaledX = (x - 0.5) * 4 // Scale from -2 to 2
    return 0.5 - (scaledX * scaledX) * 0.1 // Inverted parabola, normalized
  }

  // Calculate derivative (change trends) at reference point
  const calculateChangeTrends = (x: number) => {
    const h = 0.001
    const scaledX = (x - 0.5) * 4
    const derivative = 2 * scaledX // Derivative of x^2
    return -derivative * 0.4 // Scale and invert for display
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!graphRef.current || (!isDraggingRef && !isDraggingObs)) return
    
    const rect = graphRef.current.getBoundingClientRect()
    const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width)) // Buffer from edges
    
    if (isDraggingRef) {
      setReferencePoint(x)
      onReferencePointChange?.(x)
    } else if (isDraggingObs) {
      setObserverPosition(x)
      onObserverPositionChange?.(x)
    }
  }, [isDraggingRef, isDraggingObs, onReferencePointChange, onObserverPositionChange])

  const handleMouseUp = useCallback(() => {
    setIsDraggingRef(false)
    setIsDraggingObs(false)
    document.body.style.cursor = 'default'
  }, [])

  // Handle global mouse events for smoother dragging
  React.useEffect(() => {
    if (isDraggingRef || isDraggingObs) {
      document.body.style.cursor = 'grabbing'
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!graphRef.current) return
        const rect = graphRef.current.getBoundingClientRect()
        const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width))
        
        if (isDraggingRef) {
          setReferencePoint(x)
          onReferencePointChange?.(x)
        } else if (isDraggingObs) {
          setObserverPosition(x)
          onObserverPositionChange?.(x)
        }
      }
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'default'
      }
    }
  }, [isDraggingRef, isDraggingObs, handleMouseUp, onReferencePointChange, onObserverPositionChange])

  // Generate curve points
  const curvePoints = Array.from({ length: 100 }, (_, i) => {
    const x = i / 99
    const y = sampleFunction(x)
    return `${x * 100},${y * 100}`
  }).join(' ')

  // Calculate trend line at reference point
  const slope = calculateChangeTrends(referencePoint)
  const refY = sampleFunction(referencePoint)
  const trendLineLength = 20 // percentage
  
  return (
    <div className="w-full h-full relative">
      {/* Graph Container */}
      <div 
        ref={graphRef}
        className="relative w-full h-full bg-black/20 rounded-xl border border-white/20 overflow-hidden select-none"
      >
        {/* SVG Graph */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          style={{ transform: 'scaleY(-1)' }} // Flip Y axis
        >
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Main Function Curve */}
          <polyline
            points={curvePoints}
            fill="none"
            stroke="rgba(233, 69, 96, 0.8)"
            strokeWidth="0.8"
            className="drop-shadow-lg"
          />
          
          {/* Trend Line at Reference Point */}
          <line
            x1={Math.max(0, Math.min(100, (referencePoint * 100) - trendLineLength))}
            y1={Math.max(0, Math.min(100, (refY * 100) - (slope * trendLineLength)))}
            x2={Math.max(0, Math.min(100, (referencePoint * 100) + trendLineLength))}
            y2={Math.max(0, Math.min(100, (refY * 100) + (slope * trendLineLength)))}
            stroke="rgba(52, 211, 153, 0.9)"
            strokeWidth="1"
            className="drop-shadow-lg"
          />
          
          {/* Reference Point */}
          <m.circle
            cx={referencePoint * 100}
            cy={refY * 100}
            r={isDraggingRef ? "3" : "2.5"}
            fill="rgba(52, 211, 153, 1)"
            stroke="white"
            strokeWidth="1"
            className="drop-shadow-lg cursor-grab"
            style={{ cursor: isDraggingRef ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => {
              e.preventDefault()
              setIsDraggingRef(true)
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
          
          {/* Observer Position */}
          <m.circle
            cx={observerPosition * 100}
            cy={sampleFunction(observerPosition) * 100}
            r={isDraggingObs ? "2.5" : "2"}
            fill="rgba(168, 85, 247, 1)"
            stroke="white"
            strokeWidth="1"
            className="drop-shadow-lg cursor-grab"
            style={{ cursor: isDraggingObs ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => {
              e.preventDefault()
              setIsDraggingObs(true)
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
          
          {/* Connection Line between Observer and Reference Point */}
          <line
            x1={observerPosition * 100}
            y1={sampleFunction(observerPosition) * 100}
            x2={referencePoint * 100}
            y2={refY * 100}
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-2 left-2 text-white/60 text-xs">
          <div>🟢 Reference Point</div>
          <div>🟣 Observer Position</div>
          <div>🔵 Change Trend Line</div>
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="glass-morphism rounded-xl p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-2">Reference Point</h4>
          <p className="text-white/70 text-sm">
            Position: {(referencePoint * 100).toFixed(1)}%
          </p>
          <p className="text-white/70 text-sm">
            Change Trend: {slope > 0 ? 'Increasing' : slope < 0 ? 'Decreasing' : 'Flat'}
          </p>
        </div>
        
        <div className="glass-morphism rounded-xl p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-2">Observer View</h4>
          <p className="text-white/70 text-sm">
            Distance: {Math.abs(referencePoint - observerPosition).toFixed(3)}
          </p>
          <p className="text-white/70 text-sm">
            Perspective: {observerPosition < referencePoint ? 'Left' : 'Right'} side
          </p>
        </div>
      </div>
    </div>
  )
}