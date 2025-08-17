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

type LessonPhase = 'slide-13' | 'slide-14' | 'slide-15' | 'slide-16' | 'slide-17' | 'complete'

// 1D Slider Component (for reference)
function OneAxisSlider({ position, onPositionChange, enabled = true, showCoordinates = false }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean,
  showCoordinates?: boolean
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
        />
      </div>
      {showCoordinates && (
        <m.div 
          className="flex justify-between mt-2 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span>-1</span>
          <span>0</span>
          <span>+1</span>
        </m.div>
      )}
    </div>
  )
}

// Intersecting Axes for slides 13-15
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

// Free 2D Movement Area with grid animation for slide 17
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

function AxisCombinationsContent() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-13')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(60)
  
  // Interactive states
  const [sliderPosition, setSliderPosition] = useState(0.5)
  const [freePosition, setFreePosition] = useState({ x: 0.5, y: 0.5 })
  const [showGrid, setShowGrid] = useState(false)
  const [showJunctionHighlight, setShowJunctionHighlight] = useState(false)
  const [showSpanCard, setShowSpanCard] = useState(true)
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  const [conceptCooldowns, setConceptCooldowns] = useState<{ [key: string]: number }>({})
  const [cooldownTimers, setCooldownTimers] = useState<{ [key: string]: NodeJS.Timeout }>({})
  
  // Phase dialogs
  const phaseDialogs = {
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
    if (entry.title === 'Span') {
      setViewingConcept(spanConcept)
      setShowConceptViewer(true)
    }
  }
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Move to next phase
      switch (currentPhase) {
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
      const phaseOrder: LessonPhase[] = ['slide-13', 'slide-14', 'slide-15', 'slide-16', 'slide-17']
      const currentIndex = phaseOrder.indexOf(currentPhase)
      if (currentIndex > 0) {
        const prevPhase = phaseOrder[currentIndex - 1]
        setCurrentPhase(prevPhase)
        
        // Reset concept cards when leaving their slides
        if (currentPhase === 'slide-16') {
          setShowSpanCard(true)
        }
        
        const prevDialogs = phaseDialogs[prevPhase]
        setCurrentDialogIndex(prevDialogs.length - 1)
      }
    }
  }
  
  const handleLessonComplete = async () => {
    const stardustEarned = 15
    await addStardust(stardustEarned)
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
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar currentPage="Axis Combinations" />
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          
          {/* Slide 13 - Single axis */}
          {currentPhase === 'slide-13' && (
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
                  showCoordinates={true}
                />
              </div>
            </m.div>
          )}
          
          {/* Slides 14-15 - Intersecting axes with restrictions */}
          {(currentPhase === 'slide-14' || currentPhase === 'slide-15') && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <IntersectingAxes 
                showSecondAxis={true}
                showJunctionHighlight={currentPhase === 'slide-14' && currentDialogIndex >= 1}
              />
            </m.div>
          )}
          
          {/* Slide 16 - Span concept explanation */}
          {currentPhase === 'slide-16' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <IntersectingAxes 
                showSecondAxis={true}
                showJunctionHighlight={false}
              />
            </m.div>
          )}
          
          {/* Slide 17 - Free 2D movement with grid */}
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
      
      {/* NPC Dialog */}
      {currentDialog && !showCompletionScreen && (
        <NPCDialog
          dialog={currentDialog}
          onNext={handleNextDialog}
          isVisible={true}
          canGoBack={!(currentPhase === 'slide-13' && currentDialogIndex === 0)}
          onBack={handleBackDialog}
          allowMinimize={false}
          continueButtonLockDuration={
            (currentPhase === 'slide-16' && currentDialogIndex === 2 && showSpanCard) ? 3 : 0
          }
        />
      )}
      
      {/* Concept unlock animation for slide 16 - Span */}
      {currentPhase === 'slide-16' && currentDialogIndex === 2 && showSpanCard && (
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
                addNotebookEntry({
                  type: 'definition',
                  title: 'Span',
                  content: 'The minimum set of axial intersections that continuously connect positions between axes'
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
                      <h3 className="text-white text-2xl font-bold">Span</h3>
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
                      {/* Grid forming between axes */}
                      <svg width="200" height="200" viewBox="0 0 200 200" className="w-full max-w-[200px]">
                        {/* Main axes */}
                        <line
                          x1="20"
                          y1="100"
                          x2="180"
                          y2="100"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-cosmic-aurora"
                        />
                        <line
                          x1="100"
                          y1="20"
                          x2="100"
                          y2="180"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-cosmic-aurora"
                        />
                        
                        {/* Grid lines animating in */}
                        <m.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          transition={{ delay: 0.5, duration: 1 }}
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
                                className="text-white"
                              />
                              <line
                                x1="20"
                                y1={pos}
                                x2="180"
                                y2={pos}
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-white"
                              />
                            </g>
                          ))}
                        </m.g>
                        
                        {/* Center point */}
                        <circle
                          cx="100"
                          cy="100"
                          r="4"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <p className="text-center text-white/60 text-sm mt-3">
                      Axes create a continuous field
                    </p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-white/80 leading-relaxed">
                    Span connects the axes to form a complete coordinate space where every position is accessible.
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="relative px-6 pb-6">
                <div className="flex items-center gap-2 text-cosmic-aurora">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Added to Notebook</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Learning Notebook */}
      <LearningNotebook
        entries={notebookEntries}
        onAddNote={addUserNote}
        onEntryClick={handleNotebookEntryClick}
      />
      
      {/* Concept Viewer */}
      {showConceptViewer && viewingConcept && (
        <ConceptViewer
          concept={viewingConcept}
          onClose={() => {
            setShowConceptViewer(false)
            setViewingConcept(null)
          }}
          onPropertyViewed={(propertyId) => {
            // Track property views if needed
          }}
        />
      )}
      
      {/* Completion Screen */}
      {showCompletionScreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cosmic-void/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center"
          >
            <Award className="w-16 h-16 text-cosmic-aurora mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
            <p className="text-white/80 mb-6">
              You've learned how axes combine to create multi-dimensional spaces!
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-white/60 mb-2">Stardust Earned</p>
              <p className="text-2xl font-bold text-cosmic-aurora">+{earnedStardust}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/lessons')}
                className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-aurora to-cosmic-starlight text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to Lessons
              </button>
            </div>
          </m.div>
        </div>
      )}
    </div>
  )
}

export default function AxisCombinationsPage() {
  return (
    <ProtectedRoute>
      <AxisCombinationsContent />
    </ProtectedRoute>
  )
}