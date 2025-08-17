'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { dictionaryService, predefinedEntries } from '@/lib/dictionaryService'
import { m, AnimatePresence } from 'framer-motion'
import { MousePointer, RefreshCw, ChevronRight, Grid3X3, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, Plus, Trash2 } from 'lucide-react'
import NPCDialog from '@/components/npcs/NPCDialog'
import QuizInterface from '@/components/lesson/QuizInterface'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import AchievementToast, { achievements, Achievement } from '@/components/effects/AchievementToast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

type LessonPhase = 'void' | 'no-position' | 'second-appears' | 'relationship-born' | 'add-third' | 'triangle-discovery' | 'measurement-attempt' | 'coordinate-choice' | 'interval-definition' | 'origin-experiment' | 'truth-revealed' | 'universe-view' | 'playground' | 'summary' | 'quiz' | 'complete'

interface Dot {
  id: string
  x: number
  y: number
  label?: string
  isOrigin?: boolean
}

// Measurement tool component
function MeasurementTool({ dots, enabled = false }: { dots: Dot[], enabled?: boolean }) {
  const [measuring, setMeasuring] = useState(false)
  const [measureStart, setMeasureStart] = useState<string | null>(null)
  const [measureEnd, setMeasureEnd] = useState<string | null>(null)

  if (!enabled || dots.length < 2) return null

  const handleDotClick = (dotId: string) => {
    if (!measureStart) {
      setMeasureStart(dotId)
    } else if (dotId !== measureStart) {
      setMeasureEnd(dotId)
      setMeasuring(true)
    }
  }

  const getDistance = () => {
    if (!measureStart || !measureEnd) return 0
    const dot1 = dots.find(d => d.id === measureStart)
    const dot2 = dots.find(d => d.id === measureEnd)
    if (!dot1 || !dot2) return 0
    
    const dx = dot2.x - dot1.x
    const dy = dot2.y - dot1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  return (
    <>
      {/* Measurement overlay */}
      {dots.map(dot => (
        <div
          key={`measure-${dot.id}`}
          className={`absolute w-8 h-8 cursor-pointer rounded-full border-2 border-dashed ${
            measureStart === dot.id ? 'border-cosmic-aurora' : 'border-white/30'
          } hover:border-white/60 transition-colors`}
          style={{ 
            left: `${dot.x}%`, 
            top: `${dot.y}%`,
            marginLeft: '-16px',
            marginTop: '-16px'
          }}
          onClick={() => handleDotClick(dot.id)}
        />
      ))}
      
      {/* Distance display */}
      {measuring && measureStart && measureEnd && (
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg"
        >
          Distance: {getDistance().toFixed(1)} units
          <button
            onClick={() => {
              setMeasureStart(null)
              setMeasureEnd(null)
              setMeasuring(false)
            }}
            className="ml-4 text-cosmic-aurora hover:text-cosmic-aurora/80"
          >
            Reset
          </button>
        </m.div>
      )}
    </>
  )
}

// Component to draw lines connecting dots
function ConnectionLines({ dots, showDistances = false, intervalScale = 1 }: { dots: Dot[], showDistances?: boolean, intervalScale?: number }) {
  if (dots.length < 2) return null

  const lines = []
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dot1 = dots[i]
      const dot2 = dots[j]
      const dx = dot2.x - dot1.x
      const dy = dot2.y - dot1.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const scaledDistance = distance * intervalScale
      const midX = (dot1.x + dot2.x) / 2
      const midY = (dot1.y + dot2.y) / 2
      
      lines.push(
        <g key={`line-${dot1.id}-${dot2.id}`}>
          <m.line
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            x1={`${dot1.x}%`}
            y1={`${dot1.y}%`}
            x2={`${dot2.x}%`}
            y2={`${dot2.y}%`}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {showDistances && (
            <m.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              x={`${midX}%`}
              y={`${midY}%`}
              fill="rgba(255, 255, 255, 0.6)"
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none"
            >
              {scaledDistance.toFixed(1)} units
            </m.text>
          )}
        </g>
      )
    }
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {lines}
    </svg>
  )
}

// Enhanced dot component without pre-defined coordinates
function InteractiveDot({ 
  dot, 
  onDrag, 
  onClick,
  showLabel = false,
  isHighlighted = false,
  canDrag = true
}: { 
  dot: Dot
  onDrag?: (id: string, x: number, y: number) => void
  onClick?: (id: string) => void
  showLabel?: boolean
  isHighlighted?: boolean
  canDrag?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    if (!canDrag || !onDrag) {
      // If dragging is disabled, just handle this as a click
      setHasMoved(false)
      return
    }
    
    setIsDragging(true)
    setHasMoved(false) // Reset movement flag
    
    // Get the parent container for calculations
    const container = dragRef.current?.closest('.relative')
    if (!container) return
    
    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const moveThreshold = 5 // pixels
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - startMouseX)
      const deltaY = Math.abs(e.clientY - startMouseY)
      
      // Only mark as moved if we've moved more than threshold
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        setHasMoved(true) // Mark that we've moved
        const rect = container.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        onDrag(dot.id, Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // Only immediately snap to cursor if we start dragging (not for small clicks)
    // This prevents accidental moves when trying to click

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <m.div
      ref={dragRef}
      className={`absolute ${canDrag ? 'cursor-move' : 'cursor-pointer'} z-10 ${isDragging ? 'z-20' : ''}`}
      style={{ 
        left: `${dot.x}%`, 
        top: `${dot.y}%`,
        width: '16px',
        height: '16px',
        marginLeft: '-8px',
        marginTop: '-8px'
      }}
      onClick={(e) => {
        // Only fire click if we haven't moved during drag
        if (!hasMoved && onClick) {
          onClick(dot.id)
        }
      }}
      onMouseDown={handleMouseDown}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <m.div 
        className={`w-4 h-4 rounded-full ${
          dot.isOrigin ? 'bg-cosmic-aurora' :
          isHighlighted ? 'bg-cosmic-starlight' :
          'bg-white'
        } ${isDragging ? 'shadow-lg shadow-white/50' : ''}`}
        animate={isHighlighted ? {
          boxShadow: ['0 0 0 0 rgba(255,255,255,0.8)', '0 0 0 8px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0.8)']
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {showLabel && dot.label && (
        <m.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded ${
            dot.isOrigin ? 'bg-cosmic-aurora/20 text-cosmic-aurora' : 'bg-black/50 text-white'
          } whitespace-nowrap pointer-events-none`}
        >
          {dot.label}
        </m.div>
      )}
    </m.div>
  )
}

// Dynamic coordinate grid that adapts to chosen origin
function AdaptiveGrid({ visible = false, origin, unitDistance = 0, containerRef }: { 
  visible?: boolean, 
  origin?: Dot, 
  unitDistance?: number,
  containerRef?: React.RefObject<HTMLDivElement>
}) {
  if (!visible || !origin || unitDistance === 0) return null

  // Get container dimensions to calculate proper aspect ratio
  const containerWidth = containerRef?.current?.clientWidth || 1000
  const containerHeight = containerRef?.current?.clientHeight || 1000
  const aspectRatio = containerWidth / containerHeight

  // Convert percentage distance to actual pixel-equivalent distance
  // unitDistance is in percentage points, we need to make X and Y spacing equal in actual pixels
  const gridSpacingX = unitDistance // X spacing in percentage
  const gridSpacingY = unitDistance * aspectRatio // Y spacing adjusted for aspect ratio

  return (
    <m.svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Draw grid lines relative to origin using actual unit distance */}
      {[-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <g key={`grid-${i}`}>
          <line
            x1={`${origin.x + i * gridSpacingX}%`}
            y1="0%"
            x2={`${origin.x + i * gridSpacingX}%`}
            y2="100%"
            stroke={i === 0 ? "rgba(243, 156, 18, 0.5)" : "rgba(255, 255, 255, 0.1)"}
            strokeWidth={i === 0 ? "2" : "1"}
          />
          <line
            x1="0%"
            y1={`${origin.y + i * gridSpacingY}%`}
            x2="100%"
            y2={`${origin.y + i * gridSpacingY}%`}
            stroke={i === 0 ? "rgba(243, 156, 18, 0.5)" : "rgba(255, 255, 255, 0.1)"}
            strokeWidth={i === 0 ? "2" : "1"}
          />
        </g>
      ))}
    </m.svg>
  )
}

// Quiz questions for Universal Relativity
const quiz = {
  id: 'universal-relativity-quiz',
  questions: [
    {
      id: 'q1',
      question: "Why can't a single object in void have a position?",
      options: [
        "It's too small to measure",
        "Position requires comparison to something else",
        "The void is infinite",
        "Objects always have position"
      ],
      correctAnswer: 1,
      explanation: "Position is fundamentally about relationships. Without another object to compare to, the concept of 'where' becomes meaningless.",
      hint: "What does 'position' actually mean?"
    },
    {
      id: 'q2',
      question: "When choosing a coordinate system origin (0,0), what are we really doing?",
      options: [
        "Finding the true center of space",
        "Locating the most important object",
        "Making an arbitrary choice for convenience",
        "Discovering a fundamental truth"
      ],
      correctAnswer: 2,
      explanation: "Choosing an origin is purely arbitrary - any point can serve as (0,0). The relationships between objects remain the same regardless of which coordinate system we use.",
      hint: "Remember our experiment with different origins..."
    },
    {
      id: 'q3',
      question: "What does Universal Relativity tell us about Earth's position?",
      options: [
        "Earth is at the center of the universe",
        "Earth has no absolute position, only relative ones",
        "Earth's position is fixed in space",
        "Earth is located at specific coordinates"
      ],
      correctAnswer: 1,
      explanation: "Earth, like everything else, has no absolute position. It's only positioned relative to the Sun, which is relative to other stars, and so on. There is no universal coordinate system.",
      hint: "Apply what we learned to the cosmic scale..."
    }
  ],
  passingScore: 2,
  stardustReward: 60
}

function UniversalRelativityLessonContent() {
  const router = useRouter()
  const { profile, addStardust, addAchievement } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('void')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [dots, setDots] = useState<Dot[]>([])
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [enableMeasurement, setEnableMeasurement] = useState(false)
  const [highlightedDot, setHighlightedDot] = useState<string | null>(null)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(60)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [showConnections, setShowConnections] = useState(false)
  const [intervalScale, setIntervalScale] = useState(1) // 1 = default scale
  const [intervalSelectionMode, setIntervalSelectionMode] = useState(false)
  const [intervalDots, setIntervalDots] = useState<string[]>([])
  const [unitDistance, setUnitDistance] = useState(0) // The actual distance that equals 1 unit
  const [hasDraggedDot, setHasDraggedDot] = useState(false)
  const [removeMode, setRemoveMode] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Phase-specific dialogs - redesigned for emergent discovery
  const phaseDialogs = {
    void: [
      { id: '1', npc: 'ERRATA' as const, text: "Look at this.", requiresInteraction: false },
      { id: '2', npc: 'ERRATA' as const, text: "A null core. Floating in absolute void.", requiresInteraction: true },
      { id: '3', npc: 'ERRATA' as const, text: "Tell me... where is it?", requiresInteraction: true }
    ],
    'no-position': [
      { id: '4', npc: 'ERRATA' as const, text: "Is it on the left? The right? The center?", requiresInteraction: false },
      { id: '5', npc: 'ERRATA' as const, text: "Drag it around. Does its position change?", requiresInteraction: true },
      { id: '6', npc: 'ERRATA' as const, text: "Or are you just moving your view?", requiresInteraction: true },
      { id: '7', npc: 'ERRATA' as const, text: "A single object in void has no position. Position requires... comparison.", requiresInteraction: true }
    ],
    'second-appears': [
      { id: '8', npc: 'ERRATA' as const, text: "Now watch... A second null core appears.", requiresInteraction: true }
    ],
    'relationship-born': [
      { id: '10', npc: 'ERRATA' as const, text: "We can see their most basic relationship by connecting them with the shortest possible path.", requiresInteraction: false },
      { id: '11', npc: 'ERRATA' as const, text: "Now we can say: This one is HERE relative to that one.", requiresInteraction: false },
      { id: '12', npc: 'ERRATA' as const, text: "They have distance. Direction. Relationship.", requiresInteraction: true },
      { id: '13', npc: 'ERRATA' as const, text: "But still... which one is 'at the center'?", requiresInteraction: true }
    ],
    'add-third': [
      { id: '14', npc: 'ERRATA' as const, text: "Let's add another.", requiresInteraction: false },
      { id: '15', npc: 'ERRATA' as const, text: "Three null cores.", requiresInteraction: true }
    ],
    'triangle-discovery': [
      { id: '16', npc: 'ERRATA' as const, text: "They form a shape. A triangle.", requiresInteraction: false },
      { id: '17', npc: 'ERRATA' as const, text: "The shape is real. The relationships are real.", requiresInteraction: false },
      { id: '18', npc: 'ERRATA' as const, text: "But where is this triangle located? What are its coordinates?", requiresInteraction: true }
    ],
    'measurement-attempt': [
      { id: '19', npc: 'ERRATA' as const, text: "To assign coordinates, we need to make a choice.", requiresInteraction: false },
      { id: '20', npc: 'ERRATA' as const, text: "We must pick one null core and call it... the origin.", requiresInteraction: true }
    ],
    'coordinate-choice': [
      { id: '21', npc: 'ERRATA' as const, text: "Click on any null core to make it (0,0).", requiresInteraction: true },
      { id: '22', npc: 'ERRATA' as const, text: "Good. Now we have an origin. But to give coordinates to the others...", requiresInteraction: false },
      { id: '23', npc: 'ERRATA' as const, text: "We need to decide how far apart they are. In what units?", requiresInteraction: true }
    ],
    'interval-definition': [
      { id: '24', npc: 'ERRATA' as const, text: "What does '1 unit' mean?", requiresInteraction: false },
      { id: '25', npc: 'ERRATA' as const, text: "Is it the distance between these two? Or those two? Or something else entirely?", requiresInteraction: false },
      { id: '26', npc: 'ERRATA' as const, text: "We must choose an interval - a standard unit of measurement.", requiresInteraction: false },
      { id: '27', npc: 'ERRATA' as const, text: "Click on two null cores to define what '1 unit' means in our coordinate system.", requiresInteraction: true }
    ],
    'origin-experiment': [
      { id: '28', npc: 'ERRATA' as const, text: "Perfect. Now look - we can measure distances in our units.", requiresInteraction: false },
      { id: '29', npc: 'ERRATA' as const, text: "Try a different null core as origin. Watch the coordinates change.", requiresInteraction: false },
      { id: '30', npc: 'ERRATA' as const, text: "The triangle remains the same. The distances remain the same. Only our description changes.", requiresInteraction: true }
    ],
    'truth-revealed': [
      { id: '31', npc: 'ERRATA' as const, text: "This is the secret:", requiresInteraction: false },
      { id: '32', npc: 'ERRATA' as const, text: "Coordinate systems are human inventions. Conveniences.", requiresInteraction: false },
      { id: '33', npc: 'ERRATA' as const, text: "The universe doesn't have a (0,0). We create it. And we decide what '1' means.", requiresInteraction: true }
    ],
    'universe-view': [
      { id: '34', npc: 'ERRATA' as const, text: "Universal Relativity: Every position exists only in relation to other positions.", requiresInteraction: false },
      { id: '35', npc: 'ERRATA' as const, text: "There is no absolute location. No true center. No universal grid.", requiresInteraction: false },
      { id: '36', npc: 'ERRATA' as const, text: "Just an infinite web of relationships.", requiresInteraction: true }
    ],
    playground: [
      { id: '37', npc: 'ERRATA' as const, text: "Create your own configuration. Add dots. Choose different origins.", requiresInteraction: false },
      { id: '38', npc: 'ERRATA' as const, text: "See how the universe doesn't care which coordinate system you use.", requiresInteraction: true }
    ],
    summary: [
      { id: '39', npc: 'ERRATA' as const, text: "Remember: Position without comparison is meaningless.", requiresInteraction: false },
      { id: '40', npc: 'ERRATA' as const, text: "Coordinates are choices, not discoveries. Even the size of '1 unit' is arbitrary.", requiresInteraction: false },
      { id: '41', npc: 'MNEMONIC' as const, text: "Everything is relative, even at the most fundamental level. Ready to test your understanding?", requiresInteraction: true }
    ]
  }

  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []

  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      // Go back within current phase
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      switch (currentPhase) {
        case 'no-position':
          setCurrentPhase('void')
          const voidDialogs = phaseDialogs['void']
          setCurrentDialogIndex(voidDialogs.length - 1)
          break
        case 'second-appears':
          // Remove the second dot when going back
          setDots(prev => prev.filter(d => d.id !== '2'))
          setShowConnections(false)
          setCurrentPhase('no-position')
          const noPositionDialogs = phaseDialogs['no-position']
          setCurrentDialogIndex(noPositionDialogs.length - 1)
          setHasDraggedDot(false) // Reset drag flag when going back
          break
        case 'relationship-born':
          setCurrentPhase('second-appears')
          const secondAppearsDialogs = phaseDialogs['second-appears']
          setCurrentDialogIndex(secondAppearsDialogs.length - 1)
          break
        case 'add-third':
          // Remove the third dot when going back
          setDots(prev => prev.filter(d => d.id !== '3'))
          setCurrentPhase('relationship-born')
          const relationshipDialogs = phaseDialogs['relationship-born']
          setCurrentDialogIndex(relationshipDialogs.length - 1)
          break
        case 'triangle-discovery':
          setCurrentPhase('add-third')
          const addThirdDialogs = phaseDialogs['add-third']
          setCurrentDialogIndex(addThirdDialogs.length - 1)
          break
        case 'measurement-attempt':
          setCurrentPhase('triangle-discovery')
          const triangleDialogs = phaseDialogs['triangle-discovery']
          setCurrentDialogIndex(triangleDialogs.length - 1)
          break
        case 'coordinate-choice':
          setShowLabels(false)
          setCurrentPhase('measurement-attempt')
          const measurementDialogs = phaseDialogs['measurement-attempt']
          setCurrentDialogIndex(measurementDialogs.length - 1)
          break
        case 'interval-definition':
          // Keep origin but remove other labels
          setDots(prev => prev.map(dot => ({
            ...dot,
            label: dot.isOrigin ? '(0, 0)' : undefined
          })))
          setCurrentPhase('coordinate-choice')
          const coordinateDialogs = phaseDialogs['coordinate-choice']
          setCurrentDialogIndex(coordinateDialogs.length - 1)
          break
        case 'origin-experiment':
          setEnableMeasurement(false)
          setShowGrid(false) // Hide grid when going back
          setIntervalSelectionMode(true)
          // Remove all coordinate labels except origin
          setDots(prev => prev.map(dot => ({
            ...dot,
            label: dot.isOrigin ? '(0, 0)' : undefined
          })))
          setCurrentPhase('interval-definition')
          const intervalDialogs = phaseDialogs['interval-definition']
          setCurrentDialogIndex(intervalDialogs.length - 1)
          break
        case 'truth-revealed':
          setCurrentPhase('origin-experiment')
          const originDialogs = phaseDialogs['origin-experiment']
          setCurrentDialogIndex(originDialogs.length - 1)
          break
        case 'universe-view':
          setShowGrid(true)
          setShowLabels(true)
          setCurrentPhase('truth-revealed')
          const truthDialogs = phaseDialogs['truth-revealed']
          setCurrentDialogIndex(truthDialogs.length - 1)
          break
        case 'playground':
          setDots(prev => prev.slice(0, 3)) // Keep only original 3 dots
          setCurrentPhase('universe-view')
          const universeDialogs = phaseDialogs['universe-view']
          setCurrentDialogIndex(universeDialogs.length - 1)
          break
        case 'summary':
          setCurrentPhase('playground')
          const playgroundDialogs = phaseDialogs['playground']
          setCurrentDialogIndex(playgroundDialogs.length - 1)
          break
      }
    }
  }

  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    // Check if we're on the "drag it around" dialog and haven't dragged yet
    if (currentPhase === 'no-position' && currentDialogIndex === 1 && !hasDraggedDot) {
      // Don't advance - user needs to drag first
      return
    }
    
    // Check if we need to select origin
    if (currentPhase === 'coordinate-choice' && currentDialogIndex === 0 && !selectedOrigin) {
      // Don't advance - user needs to select origin first
      return
    }
    
    // Check if we need to select 2 dots for interval (on the "Click on two null cores" dialog)
    if (currentPhase === 'interval-definition' && currentDialogIndex === 3 && intervalDots.length !== 2) {
      // Enable interval selection mode if not already enabled
      if (!intervalSelectionMode) {
        setIntervalSelectionMode(true)
      }
      // Don't advance - user needs to select 2 dots
      return
    }
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Move to next phase
      switch (currentPhase) {
        case 'void':
          setCurrentPhase('no-position')
          setCurrentDialogIndex(0)
          break
        case 'no-position':
          // Add second dot when transitioning to second-appears
          setDots(prev => [...prev, { 
            id: '2', 
            x: 30 + Math.random() * 40, 
            y: 30 + Math.random() * 40 
          }])
          setShowConnections(true) // Show connections when second dot appears
          setCurrentPhase('second-appears')
          setCurrentDialogIndex(0)
          break
        case 'second-appears':
          setCurrentPhase('relationship-born')
          setCurrentDialogIndex(0)
          break
        case 'relationship-born':
          // Add third dot when transitioning to add-third
          setDots(prev => [...prev, { 
            id: '3', 
            x: 40 + Math.random() * 30, 
            y: 50 + Math.random() * 30 
          }])
          setCurrentPhase('add-third')
          setCurrentDialogIndex(0)
          break
        case 'add-third':
          setCurrentPhase('triangle-discovery')
          setCurrentDialogIndex(0)
          break
        case 'triangle-discovery':
          setCurrentPhase('measurement-attempt')
          setCurrentDialogIndex(0)
          break
        case 'measurement-attempt':
          setCurrentPhase('coordinate-choice')
          setCurrentDialogIndex(0)
          setShowLabels(true)
          break
        case 'coordinate-choice':
          setCurrentPhase('interval-definition')
          setCurrentDialogIndex(0)
          break
        case 'interval-definition':
          setIntervalSelectionMode(false)
          setIntervalDots([])
          setEnableMeasurement(true) // Enable measurement after coordinate system is fully defined
          setShowGrid(true) // NOW show the grid
          
          // NOW calculate all coordinates with the chosen interval scale
          if (selectedOrigin && unitDistance > 0) {
            const originDot = dots.find(d => d.id === selectedOrigin)
            if (originDot) {
              setDots(prev => prev.map(dot => ({
                ...dot,
                label: dot.id === selectedOrigin ? '(0, 0)' : 
                  `(${((dot.x - originDot.x) / unitDistance).toFixed(1)}, ${((originDot.y - dot.y) / unitDistance).toFixed(1)})`
              })))
            }
          }
          
          setCurrentPhase('origin-experiment')
          setCurrentDialogIndex(0)
          break
        case 'origin-experiment':
          setCurrentPhase('truth-revealed')
          setCurrentDialogIndex(0)
          break
        case 'truth-revealed':
          setCurrentPhase('universe-view')
          setCurrentDialogIndex(0)
          setShowGrid(false)
          setShowLabels(false)
          break
        case 'universe-view':
          setCurrentPhase('playground')
          setCurrentDialogIndex(0)
          setDots([{ id: '1', x: 50, y: 50 }])
          setShowLabels(true)
          break
        case 'playground':
          setCurrentPhase('summary')
          setCurrentDialogIndex(0)
          break
        case 'summary':
          setShowQuiz(true)
          break
      }
    }
  }

  const handleDotDrag = (id: string, x: number, y: number) => {
    setDots(prev => prev.map(dot => 
      dot.id === id ? { ...dot, x, y } : dot
    ))
    
    // Track that the user has dragged during the no-position phase
    if (currentPhase === 'no-position' && !hasDraggedDot) {
      setHasDraggedDot(true)
    }
    
    // Update interval in real-time during interval selection
    if (intervalSelectionMode && intervalDots.length === 2 && intervalDots.includes(id)) {
      const updatedDots = dots.map(dot => dot.id === id ? { ...dot, x, y } : dot)
      const dot1 = updatedDots.find(d => d.id === intervalDots[0])
      const dot2 = updatedDots.find(d => d.id === intervalDots[1])
      if (dot1 && dot2) {
        const dx = dot2.x - dot1.x
        const dy = dot2.y - dot1.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        setUnitDistance(distance)
        setIntervalScale(1 / distance)
      }
    }
  }

  const handleDotClick = (id: string) => {
    // Handle remove mode in playground
    if (removeMode && currentPhase === 'playground') {
      // Don't allow removing if it would leave less than 3 dots
      if (dots.length <= 3) {
        return
      }
      
      // Remove the dot
      setDots(prev => prev.filter(d => d.id !== id))
      
      // If we removed the current origin, clear it
      if (selectedOrigin === id) {
        setSelectedOrigin(null)
        setShowGrid(false)
      }
      
      // Exit remove mode after removing a dot
      setRemoveMode(false)
      return
    }
    
    if (intervalSelectionMode && currentPhase === 'interval-definition') {
      // Handle interval selection
      if (intervalDots.includes(id)) {
        // Deselect if already selected
        setIntervalDots(prev => prev.filter(d => d !== id))
      } else if (intervalDots.length < 2) {
        // Add to selection
        setIntervalDots(prev => [...prev, id])
        
        // If we have 2 dots selected, calculate the interval
        if (intervalDots.length === 1) {
          const dot1 = dots.find(d => d.id === intervalDots[0])
          const dot2 = dots.find(d => d.id === id)
          if (dot1 && dot2) {
            const dx = dot2.x - dot1.x
            const dy = dot2.y - dot1.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            setUnitDistance(distance) // Store the ACTUAL distance that equals 1 unit
            setIntervalScale(1 / distance) // Scale for calculations
            
            // Don't update labels here - wait for the phase transition
          }
        }
      }
    } else if (currentPhase === 'coordinate-choice') {
      // In coordinate-choice phase, ONLY show (0,0) for the origin
      setSelectedOrigin(id)
      setShowGrid(false) // No grid yet!
      
      setDots(prev => prev.map(dot => ({
        ...dot,
        isOrigin: dot.id === id,
        label: dot.id === id ? '(0, 0)' : undefined // No coordinates for other dots yet!
      })))
    } else if (currentPhase === 'origin-experiment' || currentPhase === 'playground') {
      // Only in these phases do we show full coordinates (after interval is defined)
      setSelectedOrigin(id)
      setShowGrid(true)
      
      const originDot = dots.find(d => d.id === id)
      if (originDot && unitDistance > 0) {
        setDots(prev => prev.map(dot => ({
          ...dot,
          isOrigin: dot.id === id,
          label: dot.id === id ? '(0, 0)' : 
            `(${((dot.x - originDot.x) / unitDistance).toFixed(1)}, ${((originDot.y - dot.y) / unitDistance).toFixed(1)})`
        })))
      }
    }
  }

  const addNewDot = () => {
    if (currentPhase === 'playground' && dots.length < 7) {
      const newId = (dots.length + 1).toString()
      const newDot: Dot = {
        id: newId,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60
      }
      
      // If there's an origin selected, calculate coordinates
      if (selectedOrigin && unitDistance > 0) {
        const originDot = dots.find(d => d.id === selectedOrigin)
        if (originDot) {
          newDot.label = `(${((newDot.x - originDot.x) / unitDistance).toFixed(1)}, ${((originDot.y - newDot.y) / unitDistance).toFixed(1)})`
        }
      }
      
      setDots(prev => [...prev, newDot])
    }
  }

  const handleQuizComplete = async (totalQuestions: number) => {
    const stardustEarned = quiz.stardustReward
    await addStardust(stardustEarned)
    
    setShowQuiz(false)
    setShowCompletionScreen(true)
    setEarnedStardust(stardustEarned)
  }

  // Initialize first dot
  useEffect(() => {
    if (currentPhase === 'void' && dots.length === 0) {
      setDots([{ id: '1', x: 50, y: 50 }])
    }
  }, [currentPhase, dots.length])

  // Highlight effect for no-position phase
  useEffect(() => {
    if (currentPhase === 'no-position' && currentDialogIndex === 1) {
      setHighlightedDot('1')
    } else {
      setHighlightedDot(null)
    }
  }, [currentPhase, currentDialogIndex])

  // Enable interval selection mode when we reach the "click on two null cores" dialog
  useEffect(() => {
    if (currentPhase === 'interval-definition' && currentDialogIndex === 3) {
      setIntervalSelectionMode(true)
    } else if (currentPhase !== 'interval-definition') {
      setIntervalSelectionMode(false)
      setIntervalDots([])
    }
  }, [currentPhase, currentDialogIndex])

  // Clear remove mode when leaving playground
  useEffect(() => {
    if (currentPhase !== 'playground') {
      setRemoveMode(false)
    }
  }, [currentPhase])

  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  // Dynamically update button text for interactions
  const dialogWithDynamicButton = currentDialog ? {
    ...currentDialog,
    buttonText: (currentPhase === 'no-position' && currentDialogIndex === 1 && !hasDraggedDot) 
      ? 'Drag the dot first...'
      : (currentPhase === 'coordinate-choice' && currentDialogIndex === 0 && !selectedOrigin)
        ? 'Click on a null core first...'
      : (currentPhase === 'interval-definition' && currentDialogIndex === 3)
        ? intervalDots.length === 0 
          ? 'Select two dots...'
          : intervalDots.length === 1
            ? 'Select one more dot...'
            : 'Continue'
      : currentDialog.buttonText || 'Continue'
  } : null

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <TopNavigationBar />

      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16 pb-40">
        <div ref={containerRef} className="relative w-full h-full">
          {/* Connection Lines */}
          {showConnections && (
            <ConnectionLines 
              dots={dots} 
              showDistances={enableMeasurement && selectedOrigin !== null && intervalScale !== 1}
              intervalScale={intervalScale}
            />
          )}
          
          {/* Adaptive Grid */}
          <AdaptiveGrid 
            visible={showGrid} 
            origin={dots.find(d => d.id === selectedOrigin)}
            unitDistance={unitDistance}
            containerRef={containerRef}
          />
          
          {/* Measurement Tool */}
          <MeasurementTool dots={dots} enabled={enableMeasurement} />
          
          {/* Dots */}
          <AnimatePresence>
            {dots.map((dot) => (
              <m.div
                key={dot.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <InteractiveDot
                  dot={dot}
                  onDrag={handleDotDrag}
                  onClick={handleDotClick}
                  showLabel={showLabels}
                  isHighlighted={highlightedDot === dot.id || (intervalSelectionMode && intervalDots.includes(dot.id)) || (removeMode && currentPhase === 'playground' && dots.length > 3)}
                  canDrag={currentPhase !== 'coordinate-choice' && !removeMode}
                />
              </m.div>
            ))}
          </AnimatePresence>
          
          {/* Drag instruction indicator */}
          {currentPhase === 'no-position' && currentDialogIndex === 1 && !hasDraggedDot && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <m.div
                animate={{ 
                  x: [0, 30, 0, -30, 0],
                  y: [0, -20, 0, 20, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="w-12 h-12 border-2 border-dashed border-cosmic-aurora rounded-full flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-cosmic-aurora" />
                </div>
              </m.div>
            </m.div>
          )}

          {/* Playground Controls */}
          {currentPhase === 'playground' && (
            <m.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 space-y-2"
            >
              <button
                onClick={addNewDot}
                disabled={dots.length >= 7}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  dots.length >= 7 
                    ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                    : 'bg-cosmic-aurora text-black hover:bg-cosmic-aurora/80 cursor-pointer'
                }`}
              >
                <Plus className="w-4 h-4" />
                {dots.length >= 7 ? 'Max Dots (7)' : 'Add Null Core'}
              </button>
              
              <button
                onClick={() => setRemoveMode(!removeMode)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  removeMode
                    ? 'bg-cosmic-starlight text-white border border-cosmic-starlight'
                    : dots.length <= 3
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20 cursor-pointer'
                }`}
                disabled={dots.length <= 3}
              >
                <Trash2 className="w-4 h-4" />
                {removeMode ? 'Cancel Remove' : 'Remove Dot'}
              </button>
              
              <button
                onClick={() => {
                  setSelectedOrigin(null)
                  setShowGrid(false)
                  setRemoveMode(false)
                  setDots(prev => prev.map(d => ({ ...d, isOrigin: false, label: undefined })))
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Clear Origin
              </button>
              
              <div className="bg-black/50 backdrop-blur rounded-lg p-3 text-white text-sm space-y-1">
                <div>Null Cores: {dots.length}</div>
                <div>Possible Origins: {dots.length}</div>
                <div className="text-xs text-white/60">
                  {removeMode 
                    ? "Click any dot to remove it" 
                    : "Click any dot to set origin"}
                </div>
                {removeMode && dots.length <= 3 && (
                  <div className="text-xs text-cosmic-starlight">
                    Need at least 3 dots
                  </div>
                )}
              </div>
            </m.div>
          )}

          {/* Remove Mode Instructions */}
          {removeMode && currentPhase === 'playground' && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-cosmic-starlight/20 border border-cosmic-starlight rounded-lg px-4 py-2"
            >
              <p className="text-cosmic-starlight text-sm font-medium">
                {dots.length <= 3 
                  ? "Need at least 3 dots - cannot remove more"
                  : "Click on any dot to remove it"}
              </p>
            </m.div>
          )}

          {/* Interval Selection Instructions */}
          {intervalSelectionMode && intervalDots.length < 2 && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-cosmic-starlight/20 border border-cosmic-starlight rounded-lg px-4 py-2"
            >
              <p className="text-cosmic-starlight text-sm font-medium">
                {intervalDots.length === 0 
                  ? "Click on two null cores to define '1 unit'"
                  : "Click on one more null core"}
              </p>
            </m.div>
          )}

          {/* Interval Selection Indicator */}
          {intervalSelectionMode && intervalDots.length === 2 && (
            <>
              <m.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-cosmic-aurora/20 border border-cosmic-aurora rounded-lg px-4 py-2"
              >
                <p className="text-cosmic-aurora text-sm font-medium">
                  This distance = 1 unit (drag to adjust)
                </p>
              </m.div>
              
              {/* Line showing the unit interval */}
              {(() => {
                const dot1 = dots.find(d => d.id === intervalDots[0])
                const dot2 = dots.find(d => d.id === intervalDots[1])
                if (dot1 && dot2) {
                  return (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <m.line
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        x1={`${dot1.x}%`}
                        y1={`${dot1.y}%`}
                        x2={`${dot2.x}%`}
                        y2={`${dot2.y}%`}
                        stroke="rgb(243, 156, 18)"
                        strokeWidth="3"
                        strokeDasharray="0"
                      />
                    </svg>
                  )
                }
                return null
              })()}
            </>
          )}

          {/* Truth Reveal Animation */}
          {currentPhase === 'universe-view' && currentDialogIndex === 0 && (
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-cosmic-aurora/10 border-2 border-cosmic-aurora rounded-xl p-8 max-w-2xl backdrop-blur">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-cosmic-aurora" />
                  <h3 className="text-cosmic-aurora font-bold text-xl">DEFINITION UNLOCKED!</h3>
                </div>
                <p className="text-white font-bold text-lg mb-2">Universal Relativity</p>
                <p className="text-white/80">
                  Every position exists only in relation to other positions.
                  There is no absolute location in the universe.
                </p>
              </div>
            </m.div>
          )}
        </div>
      </div>

      {/* Definition unlock animations */}
      {/* Origin definition - when ERRATA says "We must pick one null core and call it... the origin" */}
      {currentPhase === 'measurement-attempt' && currentDialogIndex === 1 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onAnimationComplete={() => {
              dictionaryService.addEntry(predefinedEntries['origin'])
            }}
            className="bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border-2 border-cosmic-aurora rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <m.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-cosmic-aurora" />
              </m.div>
              <h3 className="text-cosmic-aurora font-bold text-xl">DEFINITION UNLOCKED!</h3>
            </div>
            <p className="text-white font-medium mb-2">Origin</p>
            <p className="text-white/80">
              A chosen reference point that becomes (0,0) in a coordinate system. Completely arbitrary.
            </p>
            <m.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-cosmic-starlight text-sm mt-3"
            >
              ✨ Added to the Archive
            </m.p>
          </m.div>
        </div>
      )}

      {/* Interval definition - when ERRATA talks about defining what "1 unit" means */}
      {currentPhase === 'interval-definition' && currentDialogIndex === 2 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onAnimationComplete={() => {
              dictionaryService.addEntry(predefinedEntries['interval'])
            }}
            className="bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border-2 border-cosmic-aurora rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <m.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-cosmic-aurora" />
              </m.div>
              <h3 className="text-cosmic-aurora font-bold text-xl">DEFINITION UNLOCKED!</h3>
            </div>
            <p className="text-white font-medium mb-2">Interval</p>
            <p className="text-white/80">
              The distance chosen to represent "1 unit" in a coordinate system. This choice is arbitrary.
            </p>
            <m.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-cosmic-starlight text-sm mt-3"
            >
              ✨ Added to the Archive
            </m.p>
          </m.div>
        </div>
      )}

      {/* Dialog System */}
      {dialogWithDynamicButton && !showQuiz && !showCompletionScreen && (
        <NPCDialog
          dialog={dialogWithDynamicButton}
          onNext={handleNextDialog}
          isVisible={true}
          canGoBack={!(currentPhase === 'void' && currentDialogIndex === 0)}
          onBack={handleBackDialog}
          allowMinimize={false}
        />
      )}

      {/* Quiz */}
      {showQuiz && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-30 p-6"
        >
          <div className="max-w-4xl mx-auto">
            <QuizInterface
              quiz={quiz}
              onComplete={handleQuizComplete}
            />
          </div>
        </m.div>
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
              <p className="text-white/80 mb-6">You've discovered Universal Relativity</p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 text-cosmic-starlight mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">+{earnedStardust} Stardust earned</span>
                </div>
                <p className="text-sm text-white/60">
                  Remember: There is no absolute position - only relationships
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/sanctuary?activity=review')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-cosmic-aurora" />
                  <span className="text-white/80 text-sm">Review Notes</span>
                </m.button>

                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/lessons')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-aurora hover:bg-cosmic-aurora/80 rounded-xl transition-colors"
                >
                  <ArrowRight className="w-6 h-6 text-black" />
                  <span className="text-black text-sm font-medium">Continue Journey</span>
                </m.button>
              </div>
            </m.div>
          </div>
        </m.div>
      )}

      {/* Achievement Toast */}
      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementToast
            achievement={unlockedAchievement}
            onClose={() => setUnlockedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function UniversalRelativityPage() {
  return (
    <ProtectedRoute>
      <UniversalRelativityLessonContent />
    </ProtectedRoute>
  )
}