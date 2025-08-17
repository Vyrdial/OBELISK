'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, X } from 'lucide-react'
import { dictionaryService, predefinedEntries } from '@/lib/dictionaryService'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import AchievementToast, { achievements, Achievement } from '@/components/effects/AchievementToast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept, ConceptProperty } from '@/components/lesson/ConceptViewer'

type LessonPhase = 'slide-1' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9' | 'slide-10' | 'slide-11' | 'slide-12' | 'slide-13' | 'slide-14' | 'slide-15' | 'slide-16' | 'slide-17' | 'complete'

// 1D Slider Component from /axes
function OneAxisSlider({ position, onPositionChange, enabled = true, showRadiatingRings = false, showCoordinates = false, directionalIndicators = { left: '-', right: '+' } }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean,
  showRadiatingRings?: boolean,
  showCoordinates?: boolean,
  directionalIndicators?: { left: string, right: string }
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const updatePosition = (clientX: number) => {
      const x = (clientX - rect.left) / rect.width
      onPositionChange(Math.max(0, Math.min(1, x)))
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

// Intersecting Axes for slides 7-8
function IntersectingAxes({ showSecondAxis = false, showJunctionHighlight = false }: { showSecondAxis?: boolean, showJunctionHighlight?: boolean }) {
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
          
          {/* Junction highlight circle - positioned relative to axes container */}
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

// Free 2D Movement Area with grid animation for slide 10
function FreeTwoAxisArea({ position, onPositionChange, enabled = true, showGrid = false }: {
  position: { x: number, y: number },
  onPositionChange: (pos: { x: number, y: number }) => void,
  enabled?: boolean,
  showGrid?: boolean
}) {
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
      onPositionChange({
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
        
        <m.div
          className="absolute w-4 h-4 bg-cosmic-aurora rounded-full -ml-2 -mt-2"
          animate={{ 
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`
          }}
          transition={{ type: "tween", duration: 0.1 }}
        />
      </div>
    </div>
  )
}

// Arrow animation for slide 5
function ContinuousArrowAnimation() {
  return (
    <m.div
      className="absolute -top-12 left-0 w-full h-8 flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <m.div
        className="absolute text-white text-3xl drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        initial={{ left: '-5%' }}
        animate={{ left: ['0%', '95%', '0%'] }}
        transition={{ 
          duration: 4,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.3
        }}
      >
        <m.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↓
        </m.div>
      </m.div>
    </m.div>
  )
}

// Bidirectional arrows for slide 5 dialog 2
function BidirectionalArrows() {
  return (
    <>
      <m.div
        className="absolute -top-12 left-8 text-white text-3xl drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
        initial={{ opacity: 0, x: 10 }}
        animate={{ 
          opacity: 1,
          x: [-3, 3, -3]
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          x: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        ←
      </m.div>
      <m.div
        className="absolute -top-12 right-8 text-white text-3xl drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
        initial={{ opacity: 0, x: -10 }}
        animate={{ 
          opacity: 1,
          x: [3, -3, 3]
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          x: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        →
      </m.div>
    </>
  )
}

// Origin visualization for slide 9
function OriginVisualization({ showHighlight = false, showNumber = false }: { showHighlight?: boolean, showNumber?: boolean }) {
  const [sliderPosition, setSliderPosition] = useState(0.5)
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative h-32">
        {/* Main axis */}
        <div className="absolute inset-0 flex items-center">
          <div className="relative w-full h-2 bg-white/10 rounded-full">
            {/* Origin tick mark - properly centered */}
            <m.div
              className="absolute left-1/2 top-1/2 w-1 h-6 bg-white/30 rounded-full"
              style={{ transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Origin highlight */}
              {showHighlight && (
                <m.div
                  className="absolute bottom-full -mb-4"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="relative -left-4 w-8 h-8">
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-sm" />
                    <div className="absolute inset-0 rounded-full border border-white/60" />
                    <m.div
                      className="absolute inset-0 rounded-full border border-white"
                      animate={{ 
                        scale: 1.3,
                        opacity: [0.8, 0.3, 0.8]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </m.div>
              )}
              
              {/* Origin label */}
              {(showNumber || showHighlight) && (
                <m.div 
                  className="absolute top-full mt-1 text-white/80 text-sm left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  0
                </m.div>
              )}
            </m.div>
            
            {/* Slider dot */}
            <m.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ left: `${sliderPosition * 100}%`, marginLeft: '-8px' }}
              transition={{ type: "tween", duration: 0.1 }}
            />
          </div>
        </div>
        
      </div>
      
      {/* Interactive slider control */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const updatePosition = (clientX: number) => {
            const x = (clientX - rect.left) / rect.width
            setSliderPosition(Math.max(0, Math.min(1, x)))
          }
          
          updatePosition(e.clientX)
          
          const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault()
            updatePosition(e.clientX)
          }
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }
          
          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        }}
      />
    </div>
  )
}

// Animation for cycling directional indicators
function DirectionalIndicatorAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const symbolPairs = [
    { left: '−', right: '+' },
    { left: '←', right: '→' },
    { left: 'L', right: 'R' },
    { left: 'A', right: 'B' },
    { left: '◀', right: '▶' },
    { left: '<', right: '>' }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % symbolPairs.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])
  
  const currentPair = symbolPairs[currentIndex]
  
  return (
    <div className="relative">
      {/* Axis line */}
      <div className="relative h-1 bg-white/20 rounded-full mx-8">
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
      </div>
      
      {/* Animated symbols */}
      <div className="flex justify-between items-center mt-4 px-4">
        <AnimatePresence mode="wait">
          <m.span
            key={`left-${currentIndex}`}
            className="text-2xl font-bold text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {currentPair.left}
          </m.span>
        </AnimatePresence>
        
        <span className="text-white/60 font-mono">0</span>
        
        <AnimatePresence mode="wait">
          <m.span
            key={`right-${currentIndex}`}
            className="text-2xl font-bold text-green-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {currentPair.right}
          </m.span>
        </AnimatePresence>
      </div>
      
      <p className="text-center text-white/60 text-sm mt-4">
        Any unique pair of symbols works
      </p>
    </div>
  )
}

// Unit Interval visualization for slide 10
function UnitIntervalVisualization({ numberOfUnits, onNumberOfUnitsChange, showAnimation = false, showDirectionIndicators = true }: { 
  numberOfUnits: number, 
  onNumberOfUnitsChange: (count: number) => void,
  showAnimation?: boolean,
  showDirectionIndicators?: boolean 
}) {
  const maxUnits = 8
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Number controls */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-sm">Unit Size</span>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onNumberOfUnitsChange(Math.max(1, numberOfUnits - 1))}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              disabled={numberOfUnits <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-white font-mono text-xl font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] min-w-[3ch] text-center">
              {numberOfUnits === 1 ? '1' : `1/${numberOfUnits}`}
            </div>
            <button
              onClick={() => onNumberOfUnitsChange(Math.min(8, numberOfUnits + 1))}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              disabled={numberOfUnits >= 8}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Axis with units */}
        <div className="relative h-32">
          <div className="absolute inset-0 flex items-center">
            <div className="relative w-full h-2 bg-white/10 rounded-full">
            {/* Origin */}
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-8 bg-white rounded-full -top-3" />
            
            {/* Unit marks to the right */}
            {[...Array(numberOfUnits)].map((_, i) => (
              <m.div
                key={`right-${i}`}
                className="absolute w-0.5 h-6 bg-white/40 rounded-full -top-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: showAnimation ? [0, 1, 1, 0.4] : 0.4,
                  scale: showAnimation ? [0, 1.2, 1, 1] : 1,
                  left: `${50 + ((i + 1) / numberOfUnits) * 50}%`
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: showAnimation ? i * 0.1 : 0,
                  times: showAnimation ? [0, 0.3, 0.6, 1] : undefined
                }}
              />
            ))}
            
            {/* Unit marks to the left */}
            {[...Array(numberOfUnits)].map((_, i) => (
              <m.div
                key={`left-${i}`}
                className="absolute w-0.5 h-6 bg-white/40 rounded-full -top-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: showAnimation ? [0, 1, 1, 0.4] : 0.4,
                  scale: showAnimation ? [0, 1.2, 1, 1] : 1,
                  left: `${50 - ((i + 1) / numberOfUnits) * 50}%`
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: showAnimation ? i * 0.1 : 0,
                  times: showAnimation ? [0, 0.3, 0.6, 1] : undefined
                }}
              />
            ))}
            
            {/* Unit interval highlight */}
            {showAnimation && (
              <m.div
                className="absolute h-4 bg-cosmic-aurora/20 rounded-full -top-1"
                initial={{ width: 0, left: "50%" }}
                animate={{ 
                  width: `${50 / numberOfUnits}%`,
                  left: "50%"
                }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            )}
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute w-full -bottom-4 flex justify-center">
          <div className="relative w-full">
            {/* Origin label */}
            <span className="absolute left-1/2 -translate-x-1/2 text-white font-mono font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">0</span>
            
            {/* Right side labels */}
            {[...Array(numberOfUnits)].map((_, i) => (
              <m.span
                key={`label-right-${i}`}
                className="absolute text-white font-mono text-sm font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  left: `${50 + ((i + 1) / numberOfUnits) * 50}%`
                }}
                transition={{ delay: showAnimation ? 0.8 + i * 0.1 : 0 }}
                style={{ transform: 'translateX(-50%)' }}
              >
                {showDirectionIndicators ? '+' : ''}{i + 1}
              </m.span>
            ))}
            
            {/* Left side labels */}
            {[...Array(numberOfUnits)].map((_, i) => (
              <m.span
                key={`label-left-${i}`}
                className="absolute text-white font-mono text-sm font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  left: `${50 - ((i + 1) / numberOfUnits) * 50}%`
                }}
                transition={{ delay: showAnimation ? 0.8 + i * 0.1 : 0 }}
                style={{ transform: 'translateX(-50%)' }}
              >
                {showDirectionIndicators ? '-' : ''}{i + 1}
              </m.span>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}




function SpaceFundamentalsContent() {
  const router = useRouter()
  const { profile, addStardust, unlockModule } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-1')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(60)
  
  // Interactive states
  const [sliderPosition, setSliderPosition] = useState(0.5)
  const [hasMovedSlider, setHasMovedSlider] = useState(false)
  const [showArrowAnimation, setShowArrowAnimation] = useState(false)
  const [showBidirectionalArrows, setShowBidirectionalArrows] = useState(false)
  const [freePosition, setFreePosition] = useState({ x: 0.5, y: 0.5 })
  const [showGrid, setShowGrid] = useState(false)
  const [showJunctionHighlight, setShowJunctionHighlight] = useState(false)
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [directionalIndicators, setDirectionalIndicators] = useState({ left: '-', right: '+' })
  const [selectedOriginAnswer, setSelectedOriginAnswer] = useState<string | null>(null)
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [showAxisCard, setShowAxisCard] = useState(true)
  const [showLimitationCard, setShowLimitationCard] = useState(true)
  const [showDirectionIndicatorsCard, setShowDirectionIndicatorsCard] = useState(true)
  const [showSpanCard, setShowSpanCard] = useState(true)
  const [showContinuityCard, setShowContinuityCard] = useState(true)
  const [showBidirectionalityCard, setShowBidirectionalityCard] = useState(true)
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  const [conceptCooldowns, setConceptCooldowns] = useState<{ [key: string]: number }>({})
  const [cooldownTimers, setCooldownTimers] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const [initialPropertyId, setInitialPropertyId] = useState<string | undefined>(undefined)
  const [showOriginHighlight, setShowOriginHighlight] = useState(false)
  const [showOriginNumber, setShowOriginNumber] = useState(false)
  const [numberOfUnits, setNumberOfUnits] = useState(1)
  const [showUnitAnimation, setShowUnitAnimation] = useState(false)
  const [showBidirectionalUnits, setShowBidirectionalUnits] = useState(false)
  const [showDirectionIndicators, setShowDirectionIndicators] = useState(false)
  
  // Handle dialog-specific animations
  useEffect(() => {
    if (currentPhase === 'slide-11' && currentDialogIndex === 1) {
      // Show direction indicators when we talk about them (dialog 11b)
      setShowDirectionIndicators(true)
    }
  }, [currentPhase, currentDialogIndex])
  
  // Phase dialogs
  const phaseDialogs = {
    'slide-1': [
      { id: '1', npc: 'ERRATA' as const, text: "Every system requires change.", requiresInteraction: true }
    ],
    'slide-2': [
      { id: '2', npc: 'ERRATA' as const, text: "But before anything can change, it needs a way to change.", requiresInteraction: true }
    ],
    'slide-3': [
      { id: '3', npc: 'ERRATA' as const, text: "That 'way' is called the axis. Let's discover what an axis is.", requiresInteraction: true }
    ],
    'slide-4': [
      { id: '4', npc: 'ERRATA' as const, text: "An axis is a continuous line that allows change in two opposite directions", requiresInteraction: true }
    ],
    'slide-5': [
      { id: '5', npc: 'ERRATA' as const, text: "Here's an axis!", requiresInteraction: true }
    ],
    'slide-6': [
      { id: '6a', npc: 'ERRATA' as const, text: "We can see it's an axis because it's continuous...", requiresInteraction: false },
      { id: '6b', npc: 'ERRATA' as const, text: "...and because we can move in two opposite directions.", requiresInteraction: true }
    ],
    'slide-7': [
      { id: '7a', npc: 'ERRATA' as const, text: "Just as a container limits where water can go...", requiresInteraction: false },
      { id: '7b', npc: 'ERRATA' as const, text: "An axis limits where an object can go.", requiresInteraction: true }
    ],
    'slide-8': [
      { id: '8a', npc: 'ERRATA' as const, text: "To keep track of position on the axis, we need a reference point.", requiresInteraction: false },
      { id: '8b', npc: 'ERRATA' as const, text: "This reference point is called the origin, and we assign the number 0 to it.", requiresInteraction: false },
      { id: '8c', npc: 'ERRATA' as const, text: "From this origin, we can measure distance in both directions.", requiresInteraction: true }
    ],
    'slide-9': [
      { id: '9a', npc: 'ERRATA' as const, text: "But how do we measure these distances?", requiresInteraction: false },
      { id: '9b', npc: 'ERRATA' as const, text: "We need consistent steps - like marks on a ruler.", requiresInteraction: true }
    ],
    'slide-10': [
      { id: '10a', npc: 'ERRATA' as const, text: "Each step is called a unit.", requiresInteraction: false },
      { id: '10b', npc: 'ERRATA' as const, text: "It's our standard distance - what we call '1'.", requiresInteraction: false },
      { id: '10c', npc: 'ERRATA' as const, text: "Try adding more units to see how they spread across the axis.", requiresInteraction: true }
    ],
    'slide-11': [
      { id: '11a', npc: 'ERRATA' as const, text: "Units extend in both directions from the origin, but we need to distinguish these directions.", requiresInteraction: false },
      { id: '11b', npc: 'ERRATA' as const, text: "By convention, we use '+' and '-' as direction indicators.", requiresInteraction: false },
      { id: '11c', npc: 'ERRATA' as const, text: "These aren't about adding or subtracting - they just tell us which way we're going.", requiresInteraction: false },
      { id: '11d', npc: 'ERRATA' as const, text: "We could use ← and →, or L and R, or any symbols - as long as everyone agrees.", requiresInteraction: false },
      { id: '11e', npc: 'ERRATA' as const, text: "The distance from 0 to +1 is the same as from 0 to -1.", requiresInteraction: false },
      { id: '11f', npc: 'ERRATA' as const, text: "Same unit, opposite directions.", requiresInteraction: true }
    ],
    'slide-12': [
      { id: '12a', npc: 'ERRATA' as const, text: "Here's a question: At the center, which directional indicator should we use?", requiresInteraction: false },
      { id: '12b', npc: 'ERRATA' as const, text: "Since the center is the same distance from both sides, neither one gets priority.", requiresInteraction: false },
      { id: '12c', npc: 'ERRATA' as const, text: "This is why we use 0 for the origin! It gets no side indicator, because it's not on either side!", requiresInteraction: false },
      { id: '12d', npc: 'ERRATA' as const, text: "All that from just one axis! That's a lot. You're doing well to keep up.", requiresInteraction: true }
    ],
    'slide-13': [
      { id: '13a', npc: 'ERRATA' as const, text: "But what if we add a second axis?", requiresInteraction: false },
      { id: '13b', npc: 'ERRATA' as const, text: "Every new axis must have at least one different position from the existing axes. If it doesn't, then we're not even talking about a new axis.", requiresInteraction: true }
    ],
    'slide-14': [
      { id: '14a', npc: 'ERRATA' as const, text: "Now we have two intersecting axes.", requiresInteraction: false },
      { id: '14b', npc: 'ERRATA' as const, text: "If two axes overlap, then the point at which they do is called an intersection.", requiresInteraction: false },
      { id: '14c', npc: 'ERRATA' as const, text: "An intersection is a position covered by two or more axes.", requiresInteraction: false },
      { id: '14d', npc: 'ERRATA' as const, text: "When our object is at the intersection, it is on both axes at once- since the object and both axes share the same position.", requiresInteraction: true }
    ],
    'slide-15': [
      { id: '15a', npc: 'ERRATA' as const, text: "Notice: you can only move along one axis at a time.", requiresInteraction: false },
      { id: '15b', npc: 'ERRATA' as const, text: "To switch axes, the object must pass through the axial intersection.", requiresInteraction: true }
    ],
    'slide-16': [
      { id: '16a', npc: 'ERRATA' as const, text: "But what if we could access the positions outside of just the axes?", requiresInteraction: false },
      { id: '16b', npc: 'ERRATA' as const, text: "To do this, we can take the span of the axes.", requiresInteraction: false },
      { id: '16c', npc: 'ERRATA' as const, text: "Span: The minimum set of axial intersections that continuously connect the positions between axes.", requiresInteraction: true }
    ],
    'slide-17': [
      { id: '17', npc: 'ERRATA' as const, text: "Watch as the grid forms between the 2 axes, creating a 2D space!", requiresInteraction: true }
    ]
  }
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  // Concept definitions
  const axisConcept: Concept = {
    id: 'axis',
    name: 'Axis',
    definition: 'An axis is a continuous line that allows movement in two opposite directions.',
    whyItMatters: 'Understanding axes is fundamental to comprehending space itself. Every position, movement, and measurement relies on having a reference framework. Without axes, we cannot describe where things are or how they change.',
    demonstration: (
      <svg width="300" height="80" viewBox="0 0 300 80" className="w-full max-w-[300px] mx-auto">
        <line x1="30" y1="40" x2="270" y2="40" stroke="currentColor" strokeWidth="2" className="text-cosmic-aurora" />
        <path d="M 25 40 L 35 35 L 35 45 Z" fill="currentColor" className="text-cosmic-aurora" />
        <path d="M 275 40 L 265 35 L 265 45 Z" fill="currentColor" className="text-cosmic-aurora" />
        <m.circle cx="150" cy="40" r="4" fill="white" animate={{ cx: [150, 220, 80, 150] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
    ),
    properties: [
      {
        id: 'continuity',
        name: 'Continuity',
        description: 'An axis is continuous - no gaps or breaks',
        whyItMatters: 'Continuity ensures you can reach any position along the axis. Without it, some positions would be inaccessible, breaking the fundamental nature of space.',
        demonstration: (
          <div className="text-center">
            <svg width="300" height="80" viewBox="0 0 300 80" className="w-full max-w-[300px] mx-auto">
              <line x1="30" y1="40" x2="270" y2="40" stroke="currentColor" strokeWidth="2" className="text-blue-400" strokeDasharray="0" />
              <m.circle cx="150" cy="40" r="4" fill="currentColor" className="text-white" animate={{ cx: [50, 250] }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "linear" }} />
            </svg>
            <p className="text-white/60 text-sm mt-2">Smooth, unbroken movement</p>
          </div>
        )
      },
      {
        id: 'bidirectionality',
        name: 'Bidirectionality',
        description: 'An axis extends in two opposite directions',
        whyItMatters: 'Bidirectionality provides freedom of movement and creates the concept of opposites (left/right, up/down). This is essential for navigation and orientation in space.',
        demonstration: (
          <div className="text-center">
            <svg width="300" height="80" viewBox="0 0 300 80" className="w-full max-w-[300px] mx-auto">
              <line x1="30" y1="40" x2="270" y2="40" stroke="currentColor" strokeWidth="2" className="text-blue-400" />
              <path d="M 25 40 L 35 35 L 35 45 Z" fill="currentColor" className="text-blue-400" />
              <path d="M 275 40 L 265 35 L 265 45 Z" fill="currentColor" className="text-blue-400" />
              <text x="50" y="30" fill="currentColor" className="text-blue-400 text-sm">←</text>
              <text x="250" y="30" fill="currentColor" className="text-blue-400 text-sm">→</text>
            </svg>
            <p className="text-white/60 text-sm mt-2">Two opposite directions</p>
          </div>
        )
      },
      {
        id: 'limitation',
        name: 'Limitation',
        description: 'Axes limit where objects can go',
        whyItMatters: 'Limitation creates structure and order. By constraining movement to a line, an axis makes positions predictable and measurable.',
        demonstration: (
          <div className="text-center">
            <svg width="300" height="120" viewBox="0 0 300 120" className="w-full max-w-[300px] mx-auto">
              <rect x="30" y="20" width="240" height="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20" strokeDasharray="4" />
              <line x1="30" y1="60" x2="270" y2="60" stroke="currentColor" strokeWidth="2" className="text-blue-400" />
              <circle cx="150" cy="60" r="4" fill="currentColor" className="text-white" />
              <text x="150" y="110" textAnchor="middle" fill="currentColor" className="text-white/60 text-xs">Constrained to the line</text>
            </svg>
          </div>
        )
      }
    ]
  }
  
  const spanConcept: Concept = {
    id: 'span',
    name: 'Span',
    definition: 'The minimum set of axial intersections that continuously connect the positions between axes.',
    whyItMatters: 'Span is what transforms isolated axes into a unified space. It creates the continuous field of positions that allows objects to move freely between axes, enabling true multi-dimensional movement and measurement.',
    demonstration: (
      <svg width="300" height="300" viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
        <line x1="30" y1="150" x2="270" y2="150" stroke="currentColor" strokeWidth="2" className="text-cosmic-aurora" />
        <line x1="150" y1="30" x2="150" y2="270" stroke="currentColor" strokeWidth="2" className="text-cosmic-aurora" />
        <m.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
          {[60, 90, 120, 180, 210, 240].map((pos) => (
            <g key={pos}>
              <line x1={pos} y1="30" x2={pos} y2="270" stroke="currentColor" strokeWidth="0.5" className="text-cosmic-starlight/40" />
              <line x1="30" y1={pos} x2="270" y2={pos} stroke="currentColor" strokeWidth="0.5" className="text-cosmic-starlight/40" />
            </g>
          ))}
        </m.g>
        <circle cx="150" cy="150" r="4" fill="currentColor" className="text-cosmic-starlight" />
      </svg>
    ),
    properties: []
  }
  
  // Start cooldown for a concept
  const startConceptCooldown = (conceptId: string) => {
    // Clear any existing timer
    if (cooldownTimers[conceptId]) {
      clearInterval(cooldownTimers[conceptId])
    }
    
    // Set initial cooldown
    setConceptCooldowns(prev => ({ ...prev, [conceptId]: 5 }))
    
    // Start countdown
    const timer = setInterval(() => {
      setConceptCooldowns(prev => {
        const newValue = (prev[conceptId] || 0) - 1
        if (newValue <= 0) {
          clearInterval(timer)
          // Clean up timer reference
          setCooldownTimers(prevTimers => {
            const { [conceptId]: _, ...rest } = prevTimers
            return rest
          })
          // Remove cooldown
          const { [conceptId]: __, ...restCooldowns } = prev
          return restCooldowns
        }
        return { ...prev, [conceptId]: newValue }
      })
    }, 1000)
    
    setCooldownTimers(prev => ({ ...prev, [conceptId]: timer }))
  }
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(cooldownTimers).forEach(timer => clearInterval(timer))
    }
  }, [cooldownTimers])
  
  // Notebook functions
  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
    // Check if entry already exists (by title and type)
    const exists = notebookEntries.some(
      e => e.title === entry.title && e.type === entry.type
    )
    
    if (exists) {
      return // Don't add duplicate
    }
    
    const newEntry: NotebookEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      timestamp: Date.now()
    }
    setNotebookEntries(prev => [...prev, newEntry])
  }
  
  const addUserNote = (note: string) => {
    addNotebookEntry({
      type: 'note',
      title: 'Personal Note',
      content: note
    })
  }
  
  const handleNotebookEntryClick = (entry: NotebookEntry) => {
    // Open concept viewer for concepts
    if (entry.title === 'Axis') {
      setViewingConcept(axisConcept)
      setInitialPropertyId(undefined)
      setShowConceptViewer(true)
    } else if (entry.title === 'Span') {
      setViewingConcept(spanConcept)
      setInitialPropertyId(undefined)
      setShowConceptViewer(true)
    } else if (entry.title === 'Limitation' || entry.title === 'Continuity' || entry.title === 'Bidirectionality') {
      // For properties, open the Axis concept with the specific property selected
      setViewingConcept(axisConcept)
      setInitialPropertyId(entry.title.toLowerCase())
      setShowConceptViewer(true)
    }
  }

  const handlePropertyCardClick = (propertyName: string) => {
    // Open the Axis concept with the specific property selected
    setViewingConcept(axisConcept)
    setInitialPropertyId(propertyName.toLowerCase())
    setShowConceptViewer(true)
    // Hide the property card
    if (propertyName === 'Limitation') setShowLimitationCard(false)
    else if (propertyName === 'Continuity') setShowContinuityCard(false)
    else if (propertyName === 'Bidirectionality') setShowBidirectionalityCard(false)
  }
  
  const handleSliderChange = (value: number) => {
    setSliderPosition(value)
    if (!hasMovedSlider && Math.abs(value - 0.5) > 0.1) {
      setHasMovedSlider(true)
    }
  }
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
      // Handle slide 5 animations
      if (currentPhase === 'slide-5') {
        if (currentDialogIndex === 0) {
          // Moving to dialog 2 - show bidirectional arrows
          setShowArrowAnimation(false)
          setShowBidirectionalArrows(true)
        }
      }
      // Handle slide 8 animations
      if (currentPhase === 'slide-8') {
        if (currentDialogIndex === 0) {
          // Moving to dialog 8b - show the number 0
          setShowOriginNumber(true)
        } else if (currentDialogIndex === 1) {
          // Moving to dialog 8c - show the highlight
          setShowOriginHighlight(true)
        }
      }
    } else {
      // Move to next phase
      switch (currentPhase) {
        case 'slide-1':
          setCurrentPhase('slide-2')
          setCurrentDialogIndex(0)
          break
        case 'slide-2':
          setCurrentPhase('slide-3')
          setCurrentDialogIndex(0)
          break
        case 'slide-3':
          setCurrentPhase('slide-4')
          setCurrentDialogIndex(0)
          break
        case 'slide-4':
          setCurrentPhase('slide-5')
          setCurrentDialogIndex(0)
          break
        case 'slide-5':
          setCurrentPhase('slide-6')
          setCurrentDialogIndex(0)
          break
        case 'slide-6':
          setCurrentPhase('slide-7')
          setCurrentDialogIndex(0)
          break
        case 'slide-7':
          setCurrentPhase('slide-8')
          setCurrentDialogIndex(0)
          setShowOriginHighlight(false)
          setShowOriginNumber(false)
          break
        case 'slide-8':
          setCurrentPhase('slide-9')
          setCurrentDialogIndex(0)
          setShowUnitAnimation(false)
          break
        case 'slide-9':
          setCurrentPhase('slide-10')
          setCurrentDialogIndex(0)
          setShowBidirectionalUnits(false)
          break
        case 'slide-10':
          setCurrentPhase('slide-11')
          setCurrentDialogIndex(0)
          break
        case 'slide-11':
          setCurrentPhase('slide-12')
          setCurrentDialogIndex(0)
          break
        case 'slide-12':
          setCurrentPhase('slide-13')
          setCurrentDialogIndex(0)
          break
        case 'slide-13':
          setCurrentPhase('slide-14')
          setCurrentDialogIndex(0)
          break
        case 'slide-14':
          setCurrentPhase('slide-15')
          setCurrentDialogIndex(0)
          break
        case 'slide-15':
          setCurrentPhase('slide-16')
          setCurrentDialogIndex(0)
          break
        case 'slide-16':
          setCurrentPhase('slide-17')
          setCurrentDialogIndex(0)
          setTimeout(() => setShowGrid(true), 1000)
          break
        case 'slide-17':
          handleLessonComplete()
          break
      }
      if (currentPhase === 'slide-9' && currentDialogIndex === 2) {
        setShowUnitAnimation(true)
      }
      if (currentPhase === 'slide-10' && currentDialogIndex === 0) {
        setShowBidirectionalUnits(true)
      }
      // Add axial intersection to notebook when it's mentioned
      if (currentPhase === 'slide-14' && currentDialogIndex === 1) {
        // Moving to dialog explaining axial intersection
        addNotebookEntry({
          type: 'definition',
          title: 'Axial Intersection',
          content: 'A point simultaneously inhabited by multiple axes'
        })
      }
    }
  }
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      const phaseOrder: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10', 'slide-11', 'slide-12', 'slide-13', 'slide-14', 'slide-15', 'slide-16', 'slide-17']
      const currentIndex = phaseOrder.indexOf(currentPhase)
      if (currentIndex > 0) {
        const prevPhase = phaseOrder[currentIndex - 1]
        setCurrentPhase(prevPhase)
        
        // Reset concept cards when leaving their slides
        if (currentPhase === 'slide-4') {
          setShowAxisCard(true)
        }
        if (currentPhase === 'slide-11') {
          setShowDirectionIndicatorsCard(true)
        }
        
        const prevDialogs = phaseDialogs[prevPhase]
        setCurrentDialogIndex(prevDialogs.length - 1)
      }
    }
  }
  
  const handleLessonComplete = async () => {
    const stardustEarned = 30
    await addStardust(stardustEarned)
    await unlockModule('intersecting-axes')
    await unlockModule('free-2d-movement')
    setEarnedStardust(stardustEarned)
    setShowCompletionScreen(true)
  }
  
  // Cooldown timer effect
  useEffect(() => {
    if (!showCompletionScreen) return
    
    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [showCompletionScreen])
  
  
  // ESC key handler for notebook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // This will be handled by the notebook component itself
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar currentPage="Space Fundamentals" />
      
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          
          {/* Slide 1 */}
          {currentPhase === 'slide-1' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            />
          )}
          
          {/* Slide 2 */}
          {currentPhase === 'slide-2' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            />
          )}
          
          {/* Slide 3 - Definition */}
          {currentPhase === 'slide-3' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            />
          )}
          
          {/* Slides 5-7 - Single axis with various features */}
          {(currentPhase === 'slide-5' || currentPhase === 'slide-6' || currentPhase === 'slide-7') && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-full max-w-2xl">
                <div className="relative">
                  {currentPhase === 'slide-6' && currentDialogIndex === 0 && <ContinuousArrowAnimation />}
                  {currentPhase === 'slide-6' && currentDialogIndex === 1 && <BidirectionalArrows />}
                  <OneAxisSlider
                    position={sliderPosition}
                    onPositionChange={currentPhase === 'slide-6' ? handleSliderChange : setSliderPosition}
                    enabled={true}
                    showRadiatingRings={false}
                    showCoordinates={false}
                    directionalIndicators={directionalIndicators}
                  />
                </div>
              </div>
            </m.div>
          )}
          
          {/* Slides 8-9 - Origin (shared visualization) */}
          {(currentPhase === 'slide-8' || currentPhase === 'slide-9') && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <OriginVisualization showHighlight={showOriginHighlight} showNumber={showOriginNumber} />
            </m.div>
          )}
          
          {/* Slides 10-11 - Unit Interval (shared visualization) */}
          {(currentPhase === 'slide-10' || currentPhase === 'slide-11') && !(currentPhase === 'slide-11' && currentDialogIndex === 1 && showDirectionIndicatorsCard) && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <UnitIntervalVisualization 
                numberOfUnits={numberOfUnits}
                onNumberOfUnitsChange={setNumberOfUnits}
                showAnimation={currentPhase === 'slide-10' ? showUnitAnimation : showBidirectionalUnits}
                showDirectionIndicators={currentPhase === 'slide-11' ? showDirectionIndicators : false}
              />
            </m.div>
          )}
          
          {/* Slide 12 - Back to single axis with coordinates */}
          {currentPhase === 'slide-12' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-full max-w-2xl">
                <OneAxisSlider
                  position={sliderPosition}
                  onPositionChange={setSliderPosition}
                  enabled={true}
                  showRadiatingRings={false}
                  showCoordinates={true}
                  directionalIndicators={directionalIndicators}
                />
              </div>
            </m.div>
          )}
          
          
          {/* Slides 14, 15, and 16 - Constrained two axes */}
          {(currentPhase === 'slide-14' || currentPhase === 'slide-15' || currentPhase === 'slide-16') && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: (currentPhase === 'slide-14' && currentDialogIndex === 2) || (currentPhase === 'slide-16' && currentDialogIndex === 2) ? 0 : 1 }}
              className="flex items-center justify-center h-full -mt-8"
            >
              <IntersectingAxes 
                showSecondAxis={true} 
                showJunctionHighlight={currentPhase === 'slide-14' && (currentDialogIndex === 1 || currentDialogIndex === 3)}
              />
            </m.div>
          )}
          
          
          {/* Slides 12 and 13 - Single axis before second axis introduction */}
          {(currentPhase === 'slide-12' || currentPhase === 'slide-13') && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-full max-w-2xl">
                <OneAxisSlider
                  position={sliderPosition}
                  onPositionChange={setSliderPosition}
                  enabled={true}
                  showRadiatingRings={false}
                  showCoordinates={true}
                  directionalIndicators={directionalIndicators}
                />
              </div>
            </m.div>
          )}
          
          {/* Slide 17 - Spanning with 2D grid */}
          {currentPhase === 'slide-17' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <FreeTwoAxisArea
                position={freePosition}
                onPositionChange={setFreePosition}
                enabled={true}
                showGrid={showGrid}
              />
            </m.div>
          )}
        </div>
      </div>
      
      {/* Dialog System */}
      {currentDialog && !showCompletionScreen && (
        <div className="relative">
          <NPCDialog
            dialog={currentDialog}
            onNext={handleNextDialog}
            isVisible={true}
            canGoBack={!(currentPhase === 'slide-1' && currentDialogIndex === 0)}
            onBack={handleBackDialog}
            allowMinimize={false}
            continueButtonLockDuration={
              (currentPhase === 'slide-4' && showAxisCard) || 
              (currentPhase === 'slide-11' && currentDialogIndex === 1 && showDirectionIndicatorsCard) ? 3 : 0
            }
          />
        </div>
      )}
      
      {/* Completion Screen */}
      {showCompletionScreen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center p-6"
        >
          <div className="max-w-2xl w-full">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-2xl p-8 text-center"
            >
              <m.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-cosmic-aurora/20 rounded-full flex items-center justify-center"
              >
                <Award className="w-10 h-10 text-cosmic-aurora" />
              </m.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
              <p className="text-white/80 mb-6">You've learned how space works through axes</p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 text-cosmic-starlight mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">+{earnedStardust} Stardust earned</span>
                </div>
                <p className="text-sm text-white/60">
                  Space emerges from the spanning of orthogonal axes
                </p>
              </div>

              {/* Cooldown Timer */}
              <div className="bg-cosmic-void/50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-cosmic-aurora" />
                  <h3 className="text-xl font-semibold text-white">Learning Cooldown</h3>
                </div>
                <p className="text-white/70 mb-4">
                  Take a moment to let the concepts sink in before proceeding
                </p>
                <div className="relative w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <m.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 60, ease: "linear" }}
                    className="absolute h-full bg-cosmic-aurora"
                  />
                </div>
                <p className="text-cosmic-aurora text-2xl font-bold mt-3">
                  {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard?activity=review')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-cosmic-aurora" />
                  <span className="text-white/80 text-sm">Review Notes</span>
                </m.button>

                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard?activity=meditate')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <Brain className="w-6 h-6 text-cosmic-starlight" />
                  <span className="text-white/80 text-sm">Meditate</span>
                </m.button>

                <m.button
                  whileHover={{ scale: cooldownTime === 0 ? 1.05 : 1 }}
                  whileTap={{ scale: cooldownTime === 0 ? 0.95 : 1 }}
                  onClick={() => cooldownTime === 0 && router.push('/home')}
                  disabled={cooldownTime > 0}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    cooldownTime === 0 
                      ? 'bg-cosmic-aurora hover:bg-cosmic-aurora/80 cursor-pointer' 
                      : 'bg-cosmic-void/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                  <span className="text-white text-sm font-medium">
                    {cooldownTime === 0 ? 'Continue' : 'Wait...'}
                  </span>
                </m.button>
              </div>
            </m.div>
          </div>
        </m.div>
      )}
      
      {/* Definition unlock animation for slide 4 - Axis */}
      {currentPhase === 'slide-4' && showAxisCard && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              // Defer these operations to avoid blocking the animation
              setTimeout(() => {
                dictionaryService.addEntry(predefinedEntries['axis'])
                addNotebookEntry({
                  type: 'definition',
                  title: 'Axis',
                  content: 'An axis is a continuous line that allows change in two opposite directions'
                })
              }, 100)
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto"
          >
            {/* Card container with optimized styling */}
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-cosmic-aurora/50 shadow-xl overflow-hidden will-change-transform">
              
              
              {/* Header with icon */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon container - static for performance */}
                  <div className="w-16 h-16 rounded-2xl bg-cosmic-aurora/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-cosmic-aurora" />
                  </div>
                  
                  <div className="flex-1">
                    <div>
                      <p className="text-cosmic-aurora text-sm font-medium mb-1">CONCEPT UNLOCKED</p>
                      <h3 className="text-white text-2xl font-bold">Axis</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="relative px-6 pb-6">
                <div className="space-y-4">
                  {/* Visual representation */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="flex items-center justify-center">
                      {/* Animated axis with bidirectional movement */}
                      <svg width="200" height="60" viewBox="0 0 200 60" className="w-full max-w-[200px]">
                        {/* Axis line - static */}
                        <line
                          x1="20"
                          y1="30"
                          x2="180"
                          y2="30"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-cosmic-aurora"
                        />
                        {/* Arrows - static */}
                        <path
                          d="M 15 30 L 25 25 L 25 35 Z"
                          fill="currentColor"
                          className="text-cosmic-aurora"
                        />
                        <path
                          d="M 185 30 L 175 25 L 175 35 Z"
                          fill="currentColor"
                          className="text-cosmic-aurora"
                        />
                        {/* Moving dot - optimized animation */}
                        <m.circle
                          cx="100"
                          cy="30"
                          r="4"
                          fill="white"
                          animate={{ cx: [40, 160, 40] }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {/* Direction labels - static */}
                        <text
                          x="10"
                          y="55"
                          fill="currentColor"
                          className="text-cosmic-aurora/60 text-xs"
                        >
                          ←
                        </text>
                        <text
                          x="185"
                          y="55"
                          fill="currentColor"
                          className="text-cosmic-aurora/60 text-xs"
                        >
                          →
                        </text>
                      </svg>
                    </div>
                    <p className="text-center text-white/60 text-sm mt-3">
                      A single dimension of movement
                    </p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-white/80 leading-relaxed">
                    An axis is a continuous line that allows movement in two opposite directions.
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="relative px-6 pb-6">
                <div className="flex items-center gap-2 text-cosmic-aurora">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Added to Archive & Notebook</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Concept unlock animation for slide 11 - Directional Indicators */}
      {currentPhase === 'slide-11' && currentDialogIndex === 1 && showDirectionIndicatorsCard && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              // Defer these operations to avoid blocking the animation
              setTimeout(() => {
                dictionaryService.addEntry(predefinedEntries['directional-indicators'])
                addNotebookEntry({
                  type: 'definition',
                  title: 'Directional Indicators',
                  content: 'Symbols that distinguish opposite directions on an axis'
                })
              }, 100)
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto"
          >
            {/* Card container with optimized styling */}
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-cosmic-aurora/50 shadow-xl overflow-hidden will-change-transform">
              
              
              {/* Header with icon */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon container - static for performance */}
                  <div className="w-16 h-16 rounded-2xl bg-cosmic-aurora/20 flex items-center justify-center">
                    <div className="text-cosmic-aurora text-2xl font-bold">{'<>'}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div>
                      <p className="text-cosmic-aurora text-sm font-medium mb-1">CONCEPT UNLOCKED</p>
                      <h3 className="text-white text-2xl font-bold">Directional Indicators</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="relative px-6 pb-6">
                <div className="space-y-4">
                  {/* Visual representation */}
                  <div className="bg-black/30 rounded-xl p-6">
                    <DirectionalIndicatorAnimation />
                  </div>
                  
                  {/* Description */}
                  <p className="text-white/80 leading-relaxed">
                    Directional indicators are symbols that help us distinguish between opposite directions on an axis. They're not about arithmetic - just orientation.
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="relative px-6 pb-6">
                <div className="flex items-center gap-2 text-cosmic-aurora">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Added to Archive & Notebook</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Property unlock animation for slide 7 - Limitation */}
      {currentPhase === 'slide-7' && currentDialogIndex === 1 && showLimitationCard && (
        <m.div
          className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            onAnimationComplete={() => {
              // Add to notebook
              addNotebookEntry({
                type: 'property',
                title: 'Limitation',
                content: 'Axes limit where objects can go'
              })
            }}
            className="relative max-w-xs w-full pointer-events-auto"
          >
            {/* Card container with glass morphism */}
            <div 
              className="relative bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-blue-500/50 shadow-xl overflow-hidden cursor-pointer hover:border-blue-400/70 transition-colors"
              onClick={() => handlePropertyCardClick('Limitation')}
            >
              
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLimitationCard(false)
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              
              {/* Header */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-400 text-xs font-medium">PROPERTY</p>
                    <h3 className="text-white text-base font-bold">Limitation</h3>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-3 pb-3">
                <p className="text-white/80 text-xs leading-relaxed">
                  An axis creates a line that limits where objects can exist in space.
                </p>
              </div>
              
              {/* Footer */}
              <div className="px-3 pb-3 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-blue-400">
                    <BookOpen className="w-3 h-3" />
                    <span className="text-xs">Added to notebook</span>
                  </div>
                  <span className="text-xs text-white/40">Click to explore</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Property unlock animation for slide 6 - Continuity */}
      {currentPhase === 'slide-6' && currentDialogIndex === 0 && showContinuityCard && (
        <m.div
          className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            onAnimationComplete={() => {
              // Add to notebook
              addNotebookEntry({
                type: 'property',
                title: 'Continuity',
                content: 'An axis is continuous - no gaps or breaks'
              })
            }}
            className="relative max-w-xs w-full pointer-events-auto"
          >
            {/* Card container */}
            <div 
              className="relative bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-blue-500/50 shadow-xl overflow-hidden cursor-pointer hover:border-blue-400/70 transition-colors"
              onClick={() => handlePropertyCardClick('Continuity')}
            >
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowContinuityCard(false)
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              
              {/* Header */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-400 text-xs font-medium">PROPERTY</p>
                    <h3 className="text-white text-base font-bold">Continuity</h3>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-3 pb-3">
                <p className="text-white/80 text-xs leading-relaxed">
                  An axis forms an unbroken line - you can slide smoothly to any position.
                </p>
              </div>
              
              {/* Footer */}
              <div className="px-3 pb-3 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-blue-400">
                    <BookOpen className="w-3 h-3" />
                    <span className="text-xs">Added to notebook</span>
                  </div>
                  <span className="text-xs text-white/40">Click to explore</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Property unlock animation for slide 6 - Bidirectionality */}
      {currentPhase === 'slide-6' && currentDialogIndex === 1 && showBidirectionalityCard && (
        <m.div
          className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            onAnimationComplete={() => {
              // Add to notebook
              addNotebookEntry({
                type: 'property',
                title: 'Bidirectionality',
                content: 'An axis extends in two opposite directions'
              })
            }}
            className="relative max-w-xs w-full pointer-events-auto"
          >
            {/* Card container */}
            <div 
              className="relative bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-blue-500/50 shadow-xl overflow-hidden cursor-pointer hover:border-blue-400/70 transition-colors"
              onClick={() => handlePropertyCardClick('Bidirectionality')}
            >
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBidirectionalityCard(false)
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              
              {/* Header */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-400 text-xs font-medium">PROPERTY</p>
                    <h3 className="text-white text-base font-bold">Bidirectionality</h3>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-3 pb-3">
                <p className="text-white/80 text-xs leading-relaxed">
                  An axis allows movement in two opposite directions - left/right, up/down, forward/backward.
                </p>
              </div>
              
              {/* Footer */}
              <div className="px-3 pb-3 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-blue-400">
                    <BookOpen className="w-3 h-3" />
                    <span className="text-xs">Added to notebook</span>
                  </div>
                  <span className="text-xs text-white/40">Click to explore</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Definition unlock animation for slide 9 - Span */}
      {currentPhase === 'slide-9' && currentDialogIndex === 2 && showSpanCard && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background glow effect - simplified */}
          <m.div
            className="absolute inset-0 bg-cosmic-starlight/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            onAnimationComplete={() => {
              // Add to dictionary when animation completes
              if (predefinedEntries['span']) {
                dictionaryService.addEntry(predefinedEntries['span'])
              }
              // Add to notebook
              addNotebookEntry({
                type: 'definition',
                title: 'Span',
                content: 'The minimum set of axial intersections that continuously connect the positions between axes'
              })
              // Start cooldown
              startConceptCooldown('span')
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto"
          >
            {/* Card container with glass morphism */}
            <div className="relative bg-cosmic-void/90 backdrop-blur-xl rounded-2xl border border-cosmic-starlight/50 shadow-2xl overflow-hidden">
              {/* Static border - no animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-cosmic-starlight/50" />
              
              {/* Close button */}
              <button
                onClick={() => setShowSpanCard(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              
              {/* Header with icon */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Animated icon container */}
                  <m.div
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cosmic-starlight/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-cosmic-starlight" />
                    </div>
                  </m.div>
                  
                  <div className="flex-1">
                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-cosmic-starlight text-sm font-medium mb-1">CONCEPT UNLOCKED</p>
                      <h3 className="text-white text-2xl font-bold">Span</h3>
                    </m.div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative px-6 pb-6"
              >
                <div className="space-y-4">
                  {/* Visual representation */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="flex items-center justify-center">
                      {/* Animated grid forming between axes */}
                      <svg width="200" height="200" viewBox="0 0 200 200" className="w-full max-w-[200px]">
                        {/* X axis */}
                        <m.line
                          x1="20"
                          y1="100"
                          x2="180"
                          y2="100"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-cosmic-aurora"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        />
                        {/* Y axis */}
                        <m.line
                          x1="100"
                          y1="20"
                          x2="100"
                          y2="180"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-cosmic-aurora"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        />
                        {/* Grid lines - static with fade in */}
                        <m.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 1 }}
                        >
                          {[40, 60, 80, 120, 140, 160].map((pos) => (
                            <g key={pos}>
                              <line
                                x1={pos}
                                y1="20"
                                x2={pos}
                                y2="180"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-cosmic-starlight/40"
                              />
                              <line
                                x1="20"
                                y1={pos}
                                x2="180"
                                y2={pos}
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-cosmic-starlight/40"
                              />
                            </g>
                          ))}
                        </m.g>
                        {/* Highlight center intersection only */}
                        <m.circle
                          cx="100"
                          cy="100"
                          r="3"
                          fill="currentColor"
                          className="text-cosmic-starlight"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 1.5 }}
                        />
                      </svg>
                    </div>
                    <p className="text-center text-white/60 text-sm mt-3">
                      Axes → Intersections → Space
                    </p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-white/80 leading-relaxed">
                    Spanning creates a multi-dimensional space by connecting all possible positions between axes through their intersections.
                  </p>
                </div>
              </m.div>
              
              {/* Footer */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative px-6 pb-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-cosmic-starlight">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Added to Archive & Notebook</span>
                  </div>
                  
                  {/* Continue button with cooldown */}
                  <button
                    onClick={() => {
                      if (!conceptCooldowns['span']) {
                        setShowSpanCard(false)
                      }
                    }}
                    disabled={!!conceptCooldowns['span']}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      conceptCooldowns['span'] 
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-cosmic-starlight text-cosmic-void hover:bg-cosmic-starlight/80'
                    }`}
                  >
                    {conceptCooldowns['span'] 
                      ? `Continue (${conceptCooldowns['span']}s)`
                      : 'Continue'
                    }
                  </button>
                </div>
              </m.div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Learning Notebook - positioned last to ensure it's on top */}
      <LearningNotebook 
        entries={notebookEntries}
        onAddNote={addUserNote}
        onEntryClick={handleNotebookEntryClick}
      />
      
      
      {/* Concept Viewer */}
      <ConceptViewer
        concept={viewingConcept}
        isOpen={showConceptViewer}
        onClose={() => {
          setShowConceptViewer(false)
          setViewingConcept(null)
          setInitialPropertyId(undefined)
        }}
        initialPropertyId={initialPropertyId}
      />
      
    </div>
  )
}

export default function SpaceFundamentalsPage() {
  return (
    <ProtectedRoute>
      <SpaceFundamentalsContent />
    </ProtectedRoute>
  )
}