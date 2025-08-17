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

type LessonPhase = 'slide-1' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9' | 'slide-10' | 'slide-11' | 'slide-12' | 'complete'

// 1D Slider Component
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

// Animation components
function ContinuousArrowAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <m.svg 
        width="400" 
        height="100" 
        viewBox="0 0 400 100" 
        className="opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main flow */}
        <m.path
          d="M 50 50 L 350 50"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10,5"
          animate={{ strokeDashoffset: [0, -15] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Continuous label */}
        <text x="200" y="80" textAnchor="middle" fill="white" className="text-sm">
          Continuous - no gaps
        </text>
      </m.svg>
    </div>
  )
}

function BidirectionalArrows() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <m.svg 
        width="400" 
        height="120" 
        viewBox="0 0 400 120" 
        className="opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left arrow */}
        <m.g
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: [-20, 0], opacity: [0, 1] }}
          transition={{ duration: 0.5 }}
        >
          <path
            d="M 80 50 L 40 50 M 40 50 L 50 40 M 40 50 L 50 60"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <text x="40" y="90" textAnchor="middle" fill="white" className="text-sm">
            ← One way
          </text>
        </m.g>
        
        {/* Right arrow */}
        <m.g
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: [20, 0], opacity: [0, 1] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <path
            d="M 320 50 L 360 50 M 360 50 L 350 40 M 360 50 L 350 60"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <text x="360" y="90" textAnchor="middle" fill="white" className="text-sm">
            Other way →
          </text>
        </m.g>
      </m.svg>
    </div>
  )
}

// Origin visualization component
function OriginVisualization({ showHighlight = false, showNumber = false }) {
  const [sliderPosition, setSliderPosition] = useState(0.3)
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative h-32 flex items-center">
        {/* Main axis line */}
        <div className="relative w-full h-2 bg-white/10 rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5 rounded-full" />
          
          <div className="relative h-full">
            {/* Origin marker */}
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

// Unit Interval visualization
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
                className="absolute w-1 h-4 bg-white/60 rounded-full -top-1"
                style={{ 
                  left: `${50 + ((i + 1) * 50 / (numberOfUnits + 1))}%`,
                  transform: 'translateX(-50%)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: showAnimation ? 0.1 * i : 0 }}
              >
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/80 font-mono">
                  {showDirectionIndicators ? '+' : ''}{numberOfUnits === 1 ? 1 : (i + 1)}
                </span>
              </m.div>
            ))}
            
            {/* Unit marks to the left */}
            {[...Array(numberOfUnits)].map((_, i) => (
              <m.div
                key={`left-${i}`}
                className="absolute w-1 h-4 bg-white/60 rounded-full -top-1"
                style={{ 
                  left: `${50 - ((i + 1) * 50 / (numberOfUnits + 1))}%`,
                  transform: 'translateX(-50%)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: showAnimation ? 0.1 * i : 0 }}
              >
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/80 font-mono">
                  {showDirectionIndicators ? '−' : ''}{numberOfUnits === 1 ? 1 : (i + 1)}
                </span>
              </m.div>
            ))}
            
            {/* Origin label */}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-xs text-white/80 font-mono">0</span>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AxisFundamentalsContent() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
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
  const [directionalIndicators, setDirectionalIndicators] = useState({ left: '-', right: '+' })
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [showAxisCard, setShowAxisCard] = useState(true)
  const [showLimitationCard, setShowLimitationCard] = useState(true)
  const [showDirectionIndicatorsCard, setShowDirectionIndicatorsCard] = useState(true)
  const [showContinuityCard, setShowContinuityCard] = useState(true)
  const [showBidirectionalityCard, setShowBidirectionalityCard] = useState(true)
  const [showOriginCard, setShowOriginCard] = useState(true)
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
    } else if (entry.title === 'Limitation' || entry.title === 'Continuity' || entry.title === 'Bidirectionality') {
      // For properties, open the Axis concept with the specific property selected
      setViewingConcept(axisConcept)
      setInitialPropertyId(entry.title.toLowerCase())
      setShowConceptViewer(true)
    } else if (entry.title === 'Directional Indicators') {
      // For now, directional indicators don't have a full concept viewer
      // You could add a separate concept for this if needed
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
          handleLessonComplete()
          break
      }
      if (currentPhase === 'slide-9' && currentDialogIndex === 2) {
        setShowUnitAnimation(true)
      }
      if (currentPhase === 'slide-10' && currentDialogIndex === 0) {
        setShowBidirectionalUnits(true)
      }
    }
  }
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      const phaseOrder: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10', 'slide-11', 'slide-12']
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
      <TopNavigationBar currentPage="Axis Fundamentals" />
      
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

          {/* Origin concept unlock - during slide 8, dialog 8b */}
          {currentPhase === 'slide-8' && currentDialogIndex === 1 && showOriginCard && (
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
                  // Add concept to notebook immediately when animation completes
                  addNotebookEntry({
                    type: 'definition',
                    title: 'Origin',
                    content: 'The reference point on an axis from which all positions are measured, assigned the value 0.'
                  });
                  dictionaryService.addEntry({
                    id: 'origin',
                    term: 'Origin',
                    definition: 'The reference point on an axis from which all positions are measured, assigned the value 0.',
                    category: 'axis',
                    relatedTerms: ['axis', 'coordinates', 'reference point'],
                    examples: ['The origin divides the axis into positive and negative directions', 'All measurements start from the origin at position 0'],
                    visualAid: 'An axis with a highlighted point at the center marked as 0'
                  });
                }}
                className="relative max-w-md w-full mx-4 pointer-events-auto"
              >
                <div className="relative bg-cosmic-void/90 rounded-2xl border border-cosmic-aurora/50 shadow-xl overflow-hidden will-change-transform">
                  {/* Close button */}
                  <button
                    onClick={() => setShowOriginCard(false)}
                    className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                  
                  <div className="relative p-6 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-cosmic-aurora/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-cosmic-aurora" />
                      </div>
                      <div className="flex-1">
                        <div>
                          <p className="text-cosmic-aurora text-sm font-medium mb-1">CONCEPT UNLOCKED</p>
                          <h3 className="text-white text-2xl font-bold">Origin</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative px-6 pb-6">
                    <div className="space-y-4">
                      <div className="bg-black/30 rounded-xl p-4">
                        <div className="flex items-center justify-center">
                          <svg width="200" height="60" viewBox="0 0 200 60" className="w-full max-w-[200px]">
                            <line x1="20" y1="30" x2="180" y2="30" stroke="currentColor" strokeWidth="2" className="text-cosmic-frost/30" />
                            <circle cx="100" cy="30" r="6" fill="currentColor" className="text-cosmic-aurora" />
                            <text x="100" y="50" textAnchor="middle" className="fill-cosmic-aurora text-sm font-bold">0</text>
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-cosmic-dust/80 text-sm">
                          The reference point on an axis from which all positions are measured, assigned the value 0.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-cosmic-dust/60">
                          <BookOpen className="w-3 h-3" />
                          <span>Added to Archive & Notebook</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </m.div>
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
          
        </div>
      </div>
      
      {/* NPC Dialog */}
      {currentDialog && !showCompletionScreen && (
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
      )}
      
      {/* Concept unlock animation for slide 4 - Axis */}
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
                  An axis is continuous with no gaps or breaks in its path.
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
            transition={{ type: "spring", damping: 20, stiffness: 150, delay: 1.5 }}
            onAnimationComplete={() => {
              // Add to notebook
              addNotebookEntry({
                type: 'property',
                title: 'Bidirectionality',
                content: 'An axis extends in two opposite directions'
              })
              startConceptCooldown('bidirectionality')
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
                  An axis allows movement in two opposite directions from any point.
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
          isOpen={showConceptViewer}
          onClose={() => {
            setShowConceptViewer(false)
            setViewingConcept(null)
            setInitialPropertyId(undefined)
          }}
          initialPropertyId={initialPropertyId}
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
              You've mastered the fundamentals of axes! Ready to see how axes combine?
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-white/60 mb-2">Stardust Earned</p>
              <p className="text-2xl font-bold text-cosmic-aurora">+{earnedStardust}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/axis-combinations')}
                className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-aurora to-cosmic-starlight text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Continue to Axis Combinations
              </button>
              
              <button
                onClick={() => router.push('/lessons')}
                className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
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

export default function AxisFundamentalsPage() {
  return (
    <ProtectedRoute>
      <AxisFundamentalsContent />
    </ProtectedRoute>
  )
}