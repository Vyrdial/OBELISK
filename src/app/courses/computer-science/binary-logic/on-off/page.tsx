'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useUnlockedConcepts } from '@/hooks/useUnlockedConcepts'
import { useLessonCompletion, getStardustCounterPosition } from '@/hooks/useLessonCompletion'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, X, Binary, Circle, Square, CheckCircle2, Zap, ToggleLeft, ToggleRight, Power, Star } from 'lucide-react'
import { dictionaryService } from '@/lib/dictionaryService'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept } from '@/components/lesson/ConceptViewer'

type LessonPhase = 'slide-1' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9' | 'complete'

// Simple Binary Switch Component with Wires
function BinaryStateSwitch() {
  const [value, setValue] = useState(false)
  
  // Wire path generator (simplified bezier curves)
  const createWirePath = (startX: number, startY: number, endX: number, endY: number) => {
    const controlDistance = 30
    return `M ${startX} ${startY} C ${startX + controlDistance} ${startY}, ${endX - controlDistance} ${endY}, ${endX} ${endY}`
  }
  
  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Wire visualization container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <svg 
          className="absolute" 
          viewBox="-700 0 2000 400"
          style={{ 
            width: '200vw', 
            height: '400px', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            minWidth: '2000px'
          }}
        >
          {/* Right wire - connects to right edge of switch and extends off screen */}
          <g>
            <path
              d={createWirePath(366, 168, 1200, 168)}
              fill="none"
              stroke={value ? '#10b981' : '#ffffff33'}
              strokeWidth="3"
              className="transition-all duration-500"
            />
            {value && (
              <>
                <circle r="6" fill="#10b981">
                  <animateMotion dur="1s" repeatCount="indefinite">
                    <mpath href="#right-wire-path" />
                  </animateMotion>
                </circle>
                <path
                  id="right-wire-path"
                  d={createWirePath(366, 168, 1200, 168)}
                  fill="none"
                  stroke="none"
                />
              </>
            )}
          </g>
          
          {/* Left wire - connects to left edge of switch and extends off screen */}
          <g>
            <path
              d={createWirePath(234, 168, -600, 168)}
              fill="none"
              stroke={value ? '#10b981' : '#ffffff33'}
              strokeWidth="3"
              className="transition-all duration-500"
            />
            {value && (
              <>
                <circle r="6" fill="#10b981">
                  <animateMotion dur="1s" repeatCount="indefinite">
                    <mpath href="#left-wire-path" />
                  </animateMotion>
                </circle>
                <path
                  id="left-wire-path"
                  d={createWirePath(234, 168, -600, 168)}
                  fill="none"
                  stroke="none"
                />
              </>
            )}
          </g>
        </svg>
      </div>
      
      {/* The switch itself */}
      <div className="relative z-10">
        <button
          onClick={() => setValue(!value)}
          className={`relative w-32 h-16 rounded-full transition-all duration-300 ${
            value ? 'bg-green-500/20 border-2 border-green-400 shadow-lg shadow-green-500/30' : 'bg-red-500/20 border-2 border-red-400'
          }`}
        >
          <m.div
            className={`absolute w-12 h-12 rounded-full ${
              value ? 'bg-green-400' : 'bg-red-400'
            }`}
            style={{ top: '6px', left: value ? '66px' : '6px' }}
            initial={false}
            animate={{ left: value ? '66px' : '6px' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </button>
      </div>
      
      <div className="text-white text-lg font-semibold mt-2">
        {value ? 'ON' : 'OFF'}
      </div>
    </div>
  )
}

// Interactive Pixel Grid Component
function PixelGrid() {
  // Generate initial random state
  const [pixels, setPixels] = useState<boolean[]>(() => 
    Array.from({ length: 64 }, () => Math.random() > 0.5)
  )
  
  const togglePixel = (index: number) => {
    setPixels(prev => {
      const newPixels = [...prev]
      newPixels[index] = !newPixels[index]
      return newPixels
    })
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white text-center">Real World: Your Screen</h2>
      
      <p className="text-white/50 text-center text-sm">
        Click any pixel to toggle it ON/OFF!
      </p>
      
      <div className="grid grid-cols-8 gap-1 p-4 bg-black rounded-lg border-2 border-gray-700">
        {pixels.map((isOn, i) => (
          <m.button
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              backgroundColor: isOn ? '#00bcd4' : '#111827'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              opacity: { delay: i * 0.01 },
              backgroundColor: { duration: 0.2 }
            }}
            onClick={() => togglePixel(i)}
            className={`w-8 h-8 cursor-pointer transition-all ${
              isOn 
                ? 'shadow-lg shadow-cyan-400/50' 
                : ''
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Keyboard Example Component
function KeyboardExample() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [animatingKeys, setAnimatingKeys] = useState<Set<string>>(new Set())
  const [mouseClicked, setMouseClicked] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | null>(null)
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      
      // Clear any existing timeout for this key
      if (timeoutRefs.current.has(key)) {
        clearTimeout(timeoutRefs.current.get(key)!)
      }
      
      // Add to both pressed and animating sets
      setPressedKeys(prev => new Set(prev).add(key))
      setAnimatingKeys(prev => new Set(prev).add(key))
      
      // Set a timeout to remove from animating after animation completes
      const timeout = setTimeout(() => {
        setAnimatingKeys(prev => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
        timeoutRefs.current.delete(key)
      }, 600) // Keep animated for 600ms minimum
      
      timeoutRefs.current.set(key, timeout)
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      
      // Remove from pressed immediately
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
      
      // Let the animation finish (controlled by timeout)
    }
    
    const handleMouseDown = (e: MouseEvent) => {
      // Clear any existing mouse timeout
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current)
      }
      
      setMouseClicked(true)
      setClickPosition({ x: e.clientX, y: e.clientY })
      
      // Reset after animation
      mouseTimeoutRef.current = setTimeout(() => {
        setMouseClicked(false)
        setClickPosition(null)
      }, 600)
    }
    
    const handleMouseUp = () => {
      // Mouse is handled by the timeout
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current)
      }
    }
  }, [])
  
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ]
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-white/80 text-center">Real World: Your Keyboard & Mouse</h2>
      
      <p className="text-white/50 text-center text-sm">
        Press any key or click your mouse to see it light up!
      </p>
      
      {/* Keyboard layout */}
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key) => (
              <m.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: animatingKeys.has(key) ? -4 : 0,
                  backgroundColor: animatingKeys.has(key) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: animatingKeys.has(key) ? 'rgba(34, 197, 94, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                  scale: animatingKeys.has(key) ? 1.1 : 1,
                  rotate: animatingKeys.has(key) ? 2 : 0
                }}
                transition={{ 
                  delay: rowIndex * 0.05 + row.indexOf(key) * 0.01,
                  duration: animatingKeys.has(key) ? 0.4 : 0.2,
                  type: "spring",
                  stiffness: 250,
                  damping: 20
                }}
                onClick={() => {
                  // Clear any existing timeout for this key
                  if (timeoutRefs.current.has(key)) {
                    clearTimeout(timeoutRefs.current.get(key)!)
                  }
                  
                  // Add to animating set
                  setAnimatingKeys(prev => new Set(prev).add(key))
                  
                  // Set a timeout to remove from animating after animation completes
                  const timeout = setTimeout(() => {
                    setAnimatingKeys(prev => {
                      const newSet = new Set(prev)
                      newSet.delete(key)
                      return newSet
                    })
                    timeoutRefs.current.delete(key)
                  }, 600)
                  
                  timeoutRefs.current.set(key, timeout)
                }}
                className={`w-12 h-12 border rounded-lg flex items-center justify-center font-medium text-sm transition-all relative overflow-hidden cursor-pointer ${
                  animatingKeys.has(key) 
                    ? 'text-green-400 shadow-lg shadow-green-500/30' 
                    : 'text-white hover:border-white/20'
                }`}
              >
                {/* Ripple effect when pressed */}
                {animatingKeys.has(key) && (
                  <m.div
                    className="absolute inset-0 bg-green-400/20 rounded-lg"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{key}</span>
              </m.div>
            ))}
          </div>
        ))}
        
        {/* Space bar */}
        <div className="flex justify-center mt-2">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              backgroundColor: animatingKeys.has(' ') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: animatingKeys.has(' ') ? 'rgba(34, 197, 94, 0.6)' : 'rgba(255, 255, 255, 0.1)',
              y: animatingKeys.has(' ') ? -4 : 0,
              scale: animatingKeys.has(' ') ? 1.05 : 1
            }}
            transition={{ 
              delay: 0.2,
              duration: animatingKeys.has(' ') ? 0.5 : 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            onClick={() => {
              const key = ' '
              // Clear any existing timeout for this key
              if (timeoutRefs.current.has(key)) {
                clearTimeout(timeoutRefs.current.get(key)!)
              }
              
              // Add to animating set
              setAnimatingKeys(prev => new Set(prev).add(key))
              
              // Set a timeout to remove from animating after animation completes
              const timeout = setTimeout(() => {
                setAnimatingKeys(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(key)
                  return newSet
                })
                timeoutRefs.current.delete(key)
              }, 600)
              
              timeoutRefs.current.set(key, timeout)
            }}
            className={`w-64 h-12 border rounded-lg flex items-center justify-center font-medium text-sm transition-all relative overflow-hidden cursor-pointer ${
              animatingKeys.has(' ') 
                ? 'text-green-400 shadow-lg shadow-green-500/30' 
                : 'text-white/50 hover:border-white/20'
            }`}
          >
            {/* Ripple effect when pressed */}
            {animatingKeys.has(' ') && (
              <m.div
                className="absolute inset-0 bg-green-400/20 rounded-lg"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
            <span className="relative z-10">SPACE</span>
          </m.div>
        </div>
      </div>
      
      <p className="text-white/50 text-center max-w-md mx-auto text-sm leading-relaxed">
        Each key is a binary switch: <span className="text-red-400">OFF (0)</span> when released, 
        <span className="text-green-400"> ON (1)</span> when pressed. 
        The computer checks this thousands of times per second!
      </p>
    </div>
  )
}

// Binary Display Component
function BinaryDisplay({ value, label }: { value: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <m.div 
        whileHover={{ scale: 1.05 }}
        className={`w-20 h-20 rounded-lg border flex items-center justify-center transition-all duration-300 ${
        value 
          ? 'bg-green-500/10 border-green-400/50 shadow-lg shadow-green-500/10'
          : 'bg-red-500/10 border-red-400/50 shadow-lg shadow-red-500/10'
      }`}>
        <span className={`text-3xl font-semibold ${value ? 'text-green-400' : 'text-red-400'}`}>
          {value ? '1' : '0'}
        </span>
      </m.div>
      <span className="text-xs text-white/50">{label}</span>
    </div>
  )
}

// Interactive Binary Switch
function BinarySwitch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-white/60 text-xs uppercase tracking-wider">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-24 h-12 rounded-full transition-all duration-300 ${
          value ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50' : 'bg-white/5 border border-white/10'
        }`}
      >
        <m.div
          animate={{ x: value ? 48 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 left-0.5 w-11 h-11 rounded-full shadow-lg flex items-center justify-center ${
            value ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-gray-600 to-gray-700'
          }`}
        >
          <span className="text-lg font-bold text-white">
            {value ? '1' : '0'}
          </span>
        </m.div>
      </button>
      <div className="flex gap-6 text-xs">
        <span className={`transition-all ${!value ? 'text-red-400 font-medium' : 'text-white/20'}`}>OFF</span>
        <span className={`transition-all ${value ? 'text-green-400 font-medium' : 'text-white/20'}`}>ON</span>
      </div>
    </div>
  )
}

function OnOffLesson() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const { unlockConcept } = useUnlockedConcepts()
  const { isCompleted, completeLesson } = useLessonCompletion('on-off')
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-1')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [stardustParticles, setStardustParticles] = useState<Array<{ id: number; x: number; y: number; collected: boolean }>>([])
  const [isCollectingStardust, setIsCollectingStardust] = useState(false)
  const [binaryStatesUnlocked, setBinaryStatesUnlocked] = useState(false)
  const stardustTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  
  // Interactive states
  const [binaryValue1, setBinaryValue1] = useState(false)
  const [binaryValue2, setBinaryValue2] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Notebook & Concepts
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [showNotebook, setShowNotebook] = useState(false)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  
  // Main concept for this lesson
  const binaryConcept: Concept = {
    id: 'binary-states',
    name: 'Binary States',
    description: 'The foundation of digital logic - everything is either ON or OFF',
    whyItMatters: 'Binary states are how computers make decisions. Every calculation, every pixel on your screen, every character you type - it all comes down to millions of ON/OFF decisions happening billions of times per second.',
    examples: [
      {
        id: 'on-state',
        name: 'ON State',
        description: 'Represents true, YES, or 1',
        whyItMatters: 'The presence of electrical current in a circuit.',
        demonstration: (
          <div className="flex flex-col items-center gap-4">
            <BinaryDisplay value={true} label="ON = 1 = true" />
            <p className="text-green-400 text-sm">Current is flowing</p>
          </div>
        )
      },
      {
        id: 'off-state',
        name: 'OFF State',
        description: 'Represents false, NO, or 0',
        whyItMatters: 'The absence of electrical current in a circuit.',
        demonstration: (
          <div className="flex flex-col items-center gap-4">
            <BinaryDisplay value={false} label="OFF = 0 = false" />
            <p className="text-red-400 text-sm">No current flowing</p>
          </div>
        )
      }
    ]
  }
  
  // Dialog phases
  const phaseDialogs = {
    'slide-1': [
      {
        speaker: 'Byte',
        text: "Welcome, explorer! I'm Byte, your guide through the digital universe.",
        animation: 'wave'
      },
      {
        speaker: 'Byte',
        text: "Today we're starting at the very beginning - the foundation of ALL computers.",
        animation: 'excited'
      },
      {
        speaker: 'Byte',
        text: "Everything in the digital world is built on just two states: ON and OFF.",
        animation: 'teaching'
      }
    ],
    'slide-2': [
      {
        speaker: 'Byte',
        text: "Look at this switch. Click it and watch what happens!",
        animation: 'pointing'
      },
      {
        speaker: 'Byte',
        text: "When it's ON, electricity flows. When it's OFF, it stops.",
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "This is how computers think - in ONs and OFFs, 1s and 0s.",
        animation: 'excited'
      }
    ],
    'slide-3': [
      {
        speaker: 'Byte',
        text: "In the physical world, ON means electricity is flowing through a circuit.",
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "OFF means no electricity. It's that simple, yet that powerful!",
        animation: 'excited'
      },
      {
        speaker: 'Byte',
        text: "Your entire computer is just billions of these tiny switches, turning on and off.",
        animation: 'mind-blown'
      }
    ],
    'slide-4': [
      {
        speaker: 'Byte',
        text: "We use different symbols to represent these states. Let me show you!",
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "ON can be written as: 1, true, YES, or HIGH voltage.",
        animation: 'listing'
      },
      {
        speaker: 'Byte',
        text: "OFF can be written as: 0, false, NO, or LOW voltage.",
        animation: 'listing'
      }
    ],
    'slide-5': [
      {
        speaker: 'Byte',
        text: "We can have multiple independent switches. Changing one doesn't change the other!",
        animation: 'pointing'
      },
      {
        speaker: 'Byte',
        text: "Each switch has exactly two states - no more, no less.",
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "This is called 'binary' - bi meaning two. Two states, two possibilities.",
        animation: 'excited'
      }
    ],
    'slide-6': [
      {
        speaker: 'Byte',
        text: "Real world example: Your keyboard!",
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "Each key is a switch. Press it = ON. Release it = OFF.",
        animation: 'demonstrating'
      },
      {
        speaker: 'Byte',
        text: "The computer checks thousands of times per second: Is this key ON or OFF?",
        animation: 'fast'
      }
    ],
    'slide-7': [
      {
        speaker: 'Byte',
        text: "Another example: Pixels on your screen!",
        animation: 'pointing'
      },
      {
        speaker: 'Byte',
        text: "Each pixel asks: Should I be on or off?",
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "Millions of pixels, each making binary decisions, create the images you see.",
        animation: 'mind-blown'
      }
    ],
    'slide-8': [
      {
        speaker: 'Byte',
        text: "But here's where it gets interesting - we can COMBINE these states!",
        animation: 'excited'
      },
      {
        speaker: 'Byte',
        text: "What if we wanted to check if TWO switches are on? Or if EITHER is on?",
        animation: 'thinking'
      },
      {
        speaker: 'Byte',
        text: "That's where binary logic comes in - our next lesson!",
        animation: 'wink'
      }
    ],
    'slide-9': [
      {
        speaker: 'Byte',
        text: "Congratulations! You now understand the fundamental building block of all computing!",
        animation: 'celebrate'
      },
      {
        speaker: 'Byte',
        text: "Every app, every game, every AI - they all start with ON and OFF.",
        animation: 'proud'
      },
      {
        speaker: 'Byte',
        text: "You've unlocked the 'Binary States' concept in your Archive. Check it out anytime!",
        animation: 'achievement'
      }
    ]
  }
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  // Calculate stardust counter position
  useEffect(() => {
    const calculateStardustPosition = () => {
      stardustTargetRef.current = getStardustCounterPosition()
    }
    
    calculateStardustPosition()
    window.addEventListener('resize', calculateStardustPosition)
    
    return () => window.removeEventListener('resize', calculateStardustPosition)
  }, [])
  
  // Unlock concept in archive
  useEffect(() => {
    if (currentPhase === 'slide-9') {
      // Unlock the binary states concept
      const unlockedConcepts = JSON.parse(localStorage.getItem('unlockedConcepts') || '[]')
      if (!unlockedConcepts.includes('binary-states')) {
        unlockedConcepts.push('binary-states')
        localStorage.setItem('unlockedConcepts', JSON.stringify(unlockedConcepts))
      }
      
      // Add to notebook
      addNotebookEntry({
        type: 'concept',
        title: 'Binary States',
        content: 'The foundation of digital logic - ON/OFF, 1/0, true/false'
      })
    }
  }, [currentPhase])
  
  // Notebook functions
  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
    const exists = notebookEntries.some(
      e => e.title === entry.title && e.type === entry.type
    )
    
    if (exists) return
    
    const newEntry: NotebookEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      timestamp: Date.now()
    }
    setNotebookEntries(prev => [...prev, newEntry])
  }
  
  const handleNotebookEntryClick = (entry: NotebookEntry) => {
    if (entry.title === 'Binary States') {
      // Open the concept in a new tab to show the full concept page
      window.open('/archive/binary-states', '_blank')
    }
  }
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
      
    } else {
      // Move to next phase
      const phases: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9']
      const currentIndex = phases.indexOf(currentPhase)
      if (currentIndex < phases.length - 1) {
        const nextPhase = phases[currentIndex + 1]
        
        // Unlock binary-states concept when finishing slide-5 (moving to slide-6)
        if (currentPhase === 'slide-5' && !binaryStatesUnlocked) {
          unlockConcept('binary-states')
          setBinaryStatesUnlocked(true)
          
          // Add to notebook
          const binaryConceptEntry: NotebookEntry = {
            id: 'binary-states-concept',
            type: 'concept',
            title: 'Binary States',
            content: 'The fundamental duality of existence - two states, two choices, two possibilities.',
            timestamp: Date.now(),
            conceptId: 'binary-states'
          }
          setNotebookEntries(prev => [...prev, binaryConceptEntry])
        }
        
        setCurrentPhase(nextPhase)
        setCurrentDialogIndex(0)
        
        // Trigger stardust animation when entering slide-9
        if (nextPhase === 'slide-9') {
          setTimeout(() => spawnStardustParticles(), 1000)
        }
      } else {
        handleLessonComplete()
      }
    }
  }
  
  // Stardust animation functions
  const spawnStardustParticles = useCallback(() => {
    if (isCollectingStardust) return
    
    // Recalculate the target position right before spawning particles
    stardustTargetRef.current = getStardustCounterPosition()
    
    setIsCollectingStardust(true)
    const particles: Array<{ id: number; x: number; y: number; collected: boolean }> = []
    const particleCount = 15 // Spawn 15 particles for 30 stardust (2 each)
    
    // Create particles in a burst pattern around the center of the screen
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 150 + Math.random() * 100
      particles.push({
        id: i,
        x: window.innerWidth / 2 + Math.cos(angle) * radius,
        y: window.innerHeight / 2 + Math.sin(angle) * radius,
        collected: false
      })
    }
    
    setStardustParticles(particles)
    
    // Start collecting particles after a brief delay
    setTimeout(() => {
      collectStardustParticles()
    }, 800)
  }, [isCollectingStardust])
  
  const collectStardustParticles = useCallback(() => {
    let collectedCount = 0
    const collectInterval = setInterval(() => {
      setStardustParticles(prev => {
        const updated = [...prev]
        const uncollected = updated.filter(p => !p.collected)
        
        if (uncollected.length > 0) {
          // Collect 2-3 particles at a time for faster collection
          const toCollect = Math.min(2 + Math.floor(Math.random() * 2), uncollected.length)
          for (let i = 0; i < toCollect; i++) {
            const particle = uncollected[i]
            particle.collected = true
            collectedCount++
            
            // Add stardust immediately when particle starts moving to counter
            // This creates the visual effect of the counter incrementing as particles arrive
            setTimeout(() => {
              addStardust(2) // Each particle is worth 2 stardust
              setEarnedStardust(prev => prev + 2)
            }, 1200) // 1200ms matches the particle animation duration
          }
        } else {
          clearInterval(collectInterval)
          // Clean up after animation
          setTimeout(() => {
            setStardustParticles([])
            setIsCollectingStardust(false)
          }, 2000)
        }
        
        return updated
      })
    }, 200)
  }, [addStardust])
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      const phases: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9']
      const currentIndex = phases.indexOf(currentPhase)
      if (currentIndex > 0) {
        const prevPhase = phases[currentIndex - 1]
        setCurrentPhase(prevPhase)
        const prevDialogs = phaseDialogs[prevPhase]
        setCurrentDialogIndex(prevDialogs.length - 1)
      }
    }
  }
  
  const handleLessonComplete = async () => {
    try {
      // Complete the lesson using the hook
      const result = await completeLesson(30)
      
      if (result.success) {
        if (result.firstCompletion) {
          // First time completing - show stardust animation
          setEarnedStardust(result.stardustEarned)
          setTimeout(() => spawnStardustParticles(), 500)
          
          // Refresh profile to get updated stardust count
          if (profile) {
            await addStardust(0) // This will trigger a profile refresh
          }
        } else {
          // Already completed before - just show completion screen
          setEarnedStardust(0)
        }
      }
      
      setShowCompletionScreen(true)
    } catch (err) {
      console.error('Error in lesson completion:', err)
      setShowCompletionScreen(true)
    }
  }
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar />
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-20 pb-32 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          
          {/* Slide 1 - Welcome */}
          {currentPhase === 'slide-1' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <m.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="inline-block cursor-pointer"
                >
                  <Binary className="w-24 h-24 text-purple-400 mx-auto mb-6" />
                </m.div>
                <h1 className="text-5xl md:text-6xl font-light text-white mb-4">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">ON</span>
                  <span className="mx-4 text-white/40">&</span>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">OFF</span>
                </h1>
                <p className="text-xl text-white/60 font-light">The foundation of all digital logic</p>
              </div>
            </m.div>
          )}
          
          {/* Slide 2 - Interactive Switch */}
          {currentPhase === 'slide-2' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-2xl font-light text-white/80">Your First Binary Switch</h2>
              <BinaryStateSwitch />
            </m.div>
          )}
          
          {/* Slide 3 - Physical Representation */}
          {currentPhase === 'slide-3' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="grid grid-cols-2 gap-8">
                {/* FALSE State */}
                <m.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-36 h-36 mx-auto mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                    <div>
                      <Power className="w-16 h-16 text-gray-600 mb-2" />
                      <p className="text-gray-500 text-sm font-medium">ELECTRICITY OFF</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-1">OFF State</h3>
                  <p className="text-white/40 text-sm">No current flowing</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400/50" />
                    <span className="text-red-400/60 text-xs">0 = OFF</span>
                  </div>
                </m.div>
                {/* TRUE State */}
                <m.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-36 h-36 mx-auto mb-3 rounded-xl bg-green-500/10 border border-green-400/30 flex items-center justify-center backdrop-blur-sm">
                    <div>
                      <m.div
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Power className="w-16 h-16 text-green-400 mb-2" />
                      </m.div>
                      <p className="text-green-400 text-sm font-medium">ELECTRICITY ON</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-1">ON State</h3>
                  <p className="text-white/40 text-sm">Current is flowing</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-green-400/60 text-xs">1 = ON</span>
                    <div className="w-2 h-2 rounded-full bg-green-400/50 animate-pulse" />
                  </div>
                </m.div>
              </div>
            </m.div>
          )}
          
          {/* Slide 4 - Different Representations */}
          {currentPhase === 'slide-4' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white text-center mb-8">Many Names, Same Concept</h2>
                <div className="grid grid-cols-2 gap-8">
                  {/* FALSE */}
                  <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-red-400 font-semibold text-lg">OFF</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-900/20 rounded-lg p-2 text-center">
                        <span className="text-xl font-semibold text-red-300">0</span>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-2 text-center">
                        <span className="text-lg font-medium text-red-300">FALSE</span>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-2 text-center">
                        <span className="text-lg font-medium text-red-300">NO</span>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-2 text-center">
                        <span className="text-lg font-medium text-red-300">LOW</span>
                      </div>
                    </div>
                  </div>
                  {/* TRUE */}
                  <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-green-400 font-semibold text-lg">ON</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-900/20 rounded-lg p-2 text-center">
                        <span className="text-xl font-semibold text-green-300">1</span>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-2 text-center">
                        <span className="text-lg font-medium text-green-300">TRUE</span>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-2 text-center">
                        <span className="text-lg font-medium text-green-300">YES</span>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-2 text-center">
                        <span className="text-lg font-medium text-green-300">HIGH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          )}
          
          {/* Slide 5 - Multiple Switches */}
          {currentPhase === 'slide-5' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-3xl font-bold text-white">Independent Binary States</h2>
              <div className="flex gap-12">
                <BinarySwitch 
                  value={binaryValue1} 
                  onChange={(v) => {setBinaryValue1(v); setHasInteracted(true)}} 
                  label="Switch A" 
                />
                <BinarySwitch 
                  value={binaryValue2} 
                  onChange={(v) => {setBinaryValue2(v); setHasInteracted(true)}} 
                  label="Switch B" 
                />
              </div>
            </m.div>
          )}
          
          {/* Slide 6 - Keyboard Example */}
          {currentPhase === 'slide-6' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <KeyboardExample />
            </m.div>
          )}
          
          {/* Slide 7 - Pixel Example */}
          {currentPhase === 'slide-7' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <PixelGrid />
            </m.div>
          )}
          
          {/* Slide 8 - Teaser for Logic Gates */}
          {currentPhase === 'slide-8' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center space-y-8">
                <h2 className="text-3xl font-bold text-white">What's Next?</h2>
                <div className="flex justify-center items-end gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <BinaryDisplay value={true} label="Input A" />
                  </div>
                  
                  <div className="flex items-center gap-6 pb-8">
                    <span className="text-3xl text-white/60 font-light">?</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <BinaryDisplay value={false} label="Input B" />
                  </div>
                  
                  <div className="flex items-center gap-6 pb-8">
                    <ArrowRight className="w-8 h-8 text-white/60" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-lg border-2 border-purple-400 flex items-center justify-center bg-purple-500/20">
                      <span className="text-3xl text-purple-400">?</span>
                    </div>
                    <span className="text-xs text-white/50">Output</span>
                  </div>
                </div>
              </div>
            </m.div>
          )}
          
          {/* Slide 9 - Completion */}
          {currentPhase === 'slide-9' && (
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center space-y-6">
                <CheckCircle2 className="w-32 h-32 text-green-400 mx-auto" />
                <h2 className="text-4xl font-bold text-white">Concept Unlocked!</h2>
                <div className="bg-purple-500/20 border-2 border-purple-400 rounded-2xl p-6 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-purple-300 mb-2">Binary States</h3>
                  <p className="text-white/60">
                    You've mastered the foundation of all computing! 
                    This concept has been added to your Archive.
                  </p>
                </div>
              </div>
            </m.div>
          )}
        </div>
      </div>
      
      {/* NPC Dialog */}
      {currentDialog && (
        <NPCDialog
          npcName="Byte"
          dialog={currentDialog}
          onNext={handleNextDialog}
          onBack={currentDialogIndex > 0 ? handleBackDialog : undefined}
          currentIndex={currentDialogIndex}
          totalDialogs={getCurrentDialogs().length}
        />
      )}
      
      {/* Notebook */}
      <AnimatePresence>
        {showNotebook && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LearningNotebook
              entries={notebookEntries}
              onClose={() => setShowNotebook(false)}
              onAddNote={(note) => addNotebookEntry({ type: 'note', title: 'Personal Note', content: note })}
              onEntryClick={handleNotebookEntryClick}
            />
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Concept Viewer */}
      <AnimatePresence>
        {showConceptViewer && viewingConcept && (
          <ConceptViewer
            concept={viewingConcept}
            onClose={() => {
              setShowConceptViewer(false)
              setViewingConcept(null)
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Stardust Particles Animation */}
      <AnimatePresence>
        {stardustParticles.map((particle) => {
          // Use the calculated position of stardust counter
          const targetX = stardustTargetRef.current.x
          const targetY = stardustTargetRef.current.y
          
          return (
            <m.div
              key={particle.id}
              className="fixed pointer-events-none z-[9999]"
              initial={{ 
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 0
              }}
              animate={particle.collected ? {
                x: targetX - 16, // Offset to center on the Star icon (half of w-8)
                y: targetY - 16, // Offset to center on the Star icon (half of h-8)
                scale: [1, 1.2, 0.8, 0.5],
                opacity: [1, 1, 1, 0.8]
              } : {
                x: particle.x,
                y: particle.y,
                scale: [0, 1.2],
                opacity: 1,
                rotate: [0, 360]
              }}
              exit={{ 
                scale: 0,
                opacity: 0
              }}
              transition={particle.collected ? {
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1],
                scale: {
                  times: [0, 0.6, 0.9, 1],
                  ease: "easeOut"
                },
                opacity: {
                  times: [0, 0.7, 0.95, 1],
                  ease: "easeOut"
                }
              } : {
                duration: 0.5,
                scale: { type: "spring", stiffness: 260, damping: 20 },
                rotate: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 w-8 h-8 bg-yellow-400/30 rounded-full blur-lg" />
                
                {/* Star icon */}
                <Star 
                  className="w-8 h-8 text-yellow-400 fill-yellow-400"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))',
                  }}
                />
                
                {/* Sparkle particles */}
                {!particle.collected && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <m.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 40],
                          y: [0, (Math.random() - 0.5) * 40],
                          opacity: [0, 1, 0],
                          scale: 1.5
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </m.div>
          )
        })}
      </AnimatePresence>
      
      {/* Notebook Toggle */}
      <m.button
        onClick={() => setShowNotebook(!showNotebook)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-purple-500/20 border-2 border-purple-400 rounded-full flex items-center justify-center hover:bg-purple-500/30 transition-all z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <BookOpen className="w-6 h-6 text-purple-300" />
      </m.button>
      
      {/* Completion Screen */}
      <AnimatePresence>
        {showCompletionScreen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <m.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border-2 border-green-400 rounded-2xl p-8 max-w-md text-center"
            >
              <Award className="w-24 h-24 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
              <p className="text-white/60 mb-6">
                You've mastered Binary States - the foundation of all digital logic!
              </p>
              <div className="bg-green-500/20 border border-green-400 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-lg font-bold">+{earnedStardust} Stardust</p>
              </div>
              <button
                onClick={() => router.push('/courses/computer-science')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Continue Learning
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function OnOffPage() {
  return (
    <ProtectedRoute>
      <OnOffLesson />
    </ProtectedRoute>
  )
}