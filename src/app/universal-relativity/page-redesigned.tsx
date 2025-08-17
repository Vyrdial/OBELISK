'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { MousePointer, RefreshCw, ChevronRight, Grid3X3, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, Plus } from 'lucide-react'
import NPCDialog from '@/components/npcs/NPCDialog'
import QuizInterface from '@/components/lesson/QuizInterface'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import AchievementToast, { achievements, Achievement } from '@/components/effects/AchievementToast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

type LessonPhase = 'void' | 'no-position' | 'second-appears' | 'relationship-born' | 'add-third' | 'triangle-discovery' | 'measurement-attempt' | 'coordinate-choice' | 'origin-experiment' | 'truth-revealed' | 'universe-view' | 'playground' | 'summary' | 'quiz' | 'complete'

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
    
    const dx = (dot2.x - dot1.x) * 2 // Scale for visual clarity
    const dy = (dot2.y - dot1.y) * 2
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
            transform: 'translate(-50%, -50%)'
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
  const dragRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canDrag || !onDrag) return
    e.preventDefault()
    setIsDragging(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const container = dragRef.current.closest('.relative')
        if (container) {
          const rect = container.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100
          onDrag(dot.id, Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)))
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <m.div
      ref={dragRef}
      className={`absolute w-4 h-4 ${canDrag ? 'cursor-move' : 'cursor-pointer'} z-10 ${isDragging ? 'z-20' : ''}`}
      style={{ 
        left: `${dot.x}%`, 
        top: `${dot.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={() => onClick?.(dot.id)}
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
function AdaptiveGrid({ visible = false, origin }: { visible?: boolean, origin?: Dot }) {
  if (!visible || !origin) return null

  return (
    <m.svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Draw grid lines relative to origin */}
      {[-2, -1, 0, 1, 2].map(i => (
        <g key={`grid-${i}`}>
          <line
            x1={`${origin.x + i * 20}%`}
            y1="0%"
            x2={`${origin.x + i * 20}%`}
            y2="100%"
            stroke={i === 0 ? "rgba(243, 156, 18, 0.5)" : "rgba(255, 255, 255, 0.1)"}
            strokeWidth={i === 0 ? "2" : "1"}
          />
          <line
            x1="0%"
            y1={`${origin.y + i * 20}%`}
            x2="100%"
            y2={`${origin.y + i * 20}%`}
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
      { id: '8', npc: 'ERRATA' as const, text: "Now watch...", requiresInteraction: false },
      { id: '9', npc: 'ERRATA' as const, text: "A second null core appears.", requiresInteraction: true }
    ],
    'relationship-born': [
      { id: '10', npc: 'ERRATA' as const, text: "Everything changes.", requiresInteraction: false },
      { id: '11', npc: 'ERRATA' as const, text: "Now we can say: This one is HERE relative to that one.", requiresInteraction: false },
      { id: '12', npc: 'ERRATA' as const, text: "They have distance. Direction. Relationship.", requiresInteraction: true },
      { id: '13', npc: 'ERRATA' as const, text: "But still... which one is 'at the center'?", requiresInteraction: true }
    ],
    'add-third': [
      { id: '14', npc: 'ERRATA' as const, text: "Let's add another.", requiresInteraction: false },
      { id: '15', npc: 'ERRATA' as const, text: "Three null cores. They form a shape.", requiresInteraction: true }
    ],
    'triangle-discovery': [
      { id: '16', npc: 'ERRATA' as const, text: "You can measure the distances between them.", requiresInteraction: false },
      { id: '17', npc: 'ERRATA' as const, text: "The shape is real. The relationships are real.", requiresInteraction: false },
      { id: '18', npc: 'ERRATA' as const, text: "But where is this triangle located? What are its coordinates?", requiresInteraction: true }
    ],
    'measurement-attempt': [
      { id: '19', npc: 'ERRATA' as const, text: "To assign coordinates, we need to make a choice.", requiresInteraction: false },
      { id: '20', npc: 'ERRATA' as const, text: "We must pick one null core and call it... the origin.", requiresInteraction: true }
    ],
    'coordinate-choice': [
      { id: '21', npc: 'ERRATA' as const, text: "Click on any null core to make it (0,0).", requiresInteraction: false },
      { id: '22', npc: 'ERRATA' as const, text: "Watch what happens to the coordinates of the others.", requiresInteraction: true }
    ],
    'origin-experiment': [
      { id: '23', npc: 'ERRATA' as const, text: "Now try a different one as origin.", requiresInteraction: false },
      { id: '24', npc: 'ERRATA' as const, text: "The coordinates all change... but look at the shape.", requiresInteraction: false },
      { id: '25', npc: 'ERRATA' as const, text: "The triangle remains the same. Only our description changes.", requiresInteraction: true }
    ],
    'truth-revealed': [
      { id: '26', npc: 'ERRATA' as const, text: "This is the secret:", requiresInteraction: false },
      { id: '27', npc: 'ERRATA' as const, text: "Coordinate systems are human inventions. Conveniences.", requiresInteraction: false },
      { id: '28', npc: 'ERRATA' as const, text: "The universe doesn't have a (0,0). We create it.", requiresInteraction: true }
    ],
    'universe-view': [
      { id: '29', npc: 'ERRATA' as const, text: "Universal Relativity: Every position exists only in relation to other positions.", requiresInteraction: false },
      { id: '30', npc: 'ERRATA' as const, text: "There is no absolute location. No true center. No universal grid.", requiresInteraction: false },
      { id: '31', npc: 'ERRATA' as const, text: "Just an infinite web of relationships.", requiresInteraction: true }
    ],
    playground: [
      { id: '32', npc: 'ERRATA' as const, text: "Create your own configuration. Add dots. Choose different origins.", requiresInteraction: false },
      { id: '33', npc: 'ERRATA' as const, text: "See how the universe doesn't care which coordinate system you use.", requiresInteraction: true }
    ],
    summary: [
      { id: '34', npc: 'ERRATA' as const, text: "Remember: Position without comparison is meaningless.", requiresInteraction: false },
      { id: '35', npc: 'ERRATA' as const, text: "Coordinates are choices, not discoveries.", requiresInteraction: false },
      { id: '36', npc: 'MNEMONIC' as const, text: "Everything is relative, even at the most fundamental level. Ready to test your understanding?", requiresInteraction: true }
    ]
  }

  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []

  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
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
          setCurrentPhase('second-appears')
          setCurrentDialogIndex(0)
          break
        case 'second-appears':
          // Add second dot at a random position
          setDots(prev => [...prev, { 
            id: '2', 
            x: 30 + Math.random() * 40, 
            y: 30 + Math.random() * 40 
          }])
          setCurrentPhase('relationship-born')
          setCurrentDialogIndex(0)
          break
        case 'relationship-born':
          setCurrentPhase('add-third')
          setCurrentDialogIndex(0)
          break
        case 'add-third':
          // Add third dot
          setDots(prev => [...prev, { 
            id: '3', 
            x: 40 + Math.random() * 30, 
            y: 50 + Math.random() * 30 
          }])
          setCurrentPhase('triangle-discovery')
          setCurrentDialogIndex(0)
          break
        case 'triangle-discovery':
          setEnableMeasurement(true)
          setCurrentPhase('measurement-attempt')
          setCurrentDialogIndex(0)
          break
        case 'measurement-attempt':
          setCurrentPhase('coordinate-choice')
          setCurrentDialogIndex(0)
          setShowLabels(true)
          break
        case 'coordinate-choice':
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
  }

  const handleDotClick = (id: string) => {
    if (currentPhase === 'coordinate-choice' || currentPhase === 'origin-experiment' || currentPhase === 'playground') {
      setSelectedOrigin(id)
      setShowGrid(true)
      
      // Update all dot labels based on new origin
      const originDot = dots.find(d => d.id === id)
      if (originDot) {
        setDots(prev => prev.map(dot => ({
          ...dot,
          isOrigin: dot.id === id,
          label: dot.id === id ? '(0, 0)' : 
            `(${Math.round((dot.x - originDot.x) * 2)}, ${Math.round((originDot.y - dot.y) * 2)})`
        })))
      }
    }
  }

  const addNewDot = () => {
    if (currentPhase === 'playground') {
      const newId = (dots.length + 1).toString()
      const newDot: Dot = {
        id: newId,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60
      }
      
      // If there's an origin selected, calculate coordinates
      if (selectedOrigin) {
        const originDot = dots.find(d => d.id === selectedOrigin)
        if (originDot) {
          newDot.label = `(${Math.round((newDot.x - originDot.x) * 2)}, ${Math.round((originDot.y - newDot.y) * 2)})`
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

  const currentDialog = getCurrentDialogs()[currentDialogIndex]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={true} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar />

      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16">
        <div className="relative w-full h-full">
          {/* Adaptive Grid */}
          <AdaptiveGrid 
            visible={showGrid} 
            origin={dots.find(d => d.id === selectedOrigin)}
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
                  isHighlighted={highlightedDot === dot.id}
                  canDrag={currentPhase !== 'coordinate-choice' && currentPhase !== 'origin-experiment'}
                />
              </m.div>
            ))}
          </AnimatePresence>

          {/* Playground Controls */}
          {currentPhase === 'playground' && (
            <m.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 space-y-2"
            >
              <button
                onClick={addNewDot}
                className="px-4 py-2 bg-cosmic-aurora text-black rounded-lg hover:bg-cosmic-aurora/80 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Null Core
              </button>
              
              <button
                onClick={() => {
                  setSelectedOrigin(null)
                  setShowGrid(false)
                  setDots(prev => prev.map(d => ({ ...d, isOrigin: false, label: undefined })))
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Clear Origin
              </button>
              
              <div className="bg-black/50 backdrop-blur rounded-lg p-3 text-white text-sm space-y-1">
                <div>Null Cores: {dots.length}</div>
                <div>Possible Origins: {dots.length}</div>
                <div className="text-xs text-white/60">Click any dot to set origin</div>
              </div>
            </m.div>
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
                  <h3 className="text-cosmic-aurora font-bold text-xl">UNIVERSAL TRUTH REVEALED</h3>
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

      {/* Dialog System */}
      {currentDialog && !showQuiz && !showCompletionScreen && (
        <NPCDialog
          dialog={currentDialog}
          onNext={handleNextDialog}
          isVisible={true}
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
                  onClick={() => router.push('/galaxy')}
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