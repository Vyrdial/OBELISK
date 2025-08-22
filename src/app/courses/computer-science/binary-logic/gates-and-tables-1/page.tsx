'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, X, Binary, Circle, Square, CheckCircle2, Zap, ToggleLeft, ToggleRight, Power, Star, Plus, MousePointer2, Table, Shield, Cpu, Activity } from 'lucide-react'
import { dictionaryService } from '@/lib/dictionaryService'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept } from '@/components/lesson/ConceptViewer'

type LessonPhase = 'slide-1' | 'slide-wiring' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9'
type GateType = 'AND' | 'OR' | 'NOT'

// Interactive Logic Gate Component
function InteractiveGate({ type, inputs, onInputChange, size = 'normal' }: { 
  type: GateType
  inputs: boolean[]
  onInputChange?: (index: number, value: boolean) => void
  size?: 'normal' | 'large'
}) {
  const calculateOutput = () => {
    switch (type) {
      case 'AND':
        return inputs[0] && inputs[1]
      case 'OR':
        return inputs[0] || inputs[1]
      case 'NOT':
        return !inputs[0]
      default:
        return false
    }
  }

  const output = calculateOutput()
  
  const gateColors = {
    AND: { 
      bg: 'from-violet-500/20 to-violet-600/20', 
      border: 'border-violet-500/50', 
      text: 'text-violet-400',
      shadow: 'shadow-violet-500/20'
    },
    OR: { 
      bg: 'from-blue-500/20 to-blue-600/20', 
      border: 'border-blue-500/50', 
      text: 'text-blue-400',
      shadow: 'shadow-blue-500/20'
    },
    NOT: { 
      bg: 'from-rose-500/20 to-rose-600/20', 
      border: 'border-rose-500/50', 
      text: 'text-rose-400',
      shadow: 'shadow-rose-500/20'
    }
  }
  
  const colors = gateColors[type]
  const isLarge = size === 'large'
  const gateSize = isLarge ? 'w-32 h-32' : 'w-24 h-24'
  const inputSize = isLarge ? 'w-16 h-16' : 'w-14 h-14'
  const fontSize = isLarge ? 'text-2xl' : 'text-xl'
  const gateFontSize = isLarge ? 'text-2xl' : 'text-lg'
  
  return (
    <div className="flex items-center justify-center gap-8">
      {/* Input Section */}
      <div className="flex flex-col gap-4">
        {inputs.map((input, index) => (
          <m.button
            key={index}
            onClick={() => onInputChange?.(index, !input)}
            className={`${inputSize} rounded-xl border-2 transition-all flex items-center justify-center ${
              input 
                ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30' 
                : 'bg-gray-800/50 border-gray-600/50'
            } cursor-pointer`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`${fontSize} font-bold ${input ? 'text-green-400' : 'text-gray-500'}`}>
              {input ? '1' : '0'}
            </span>
          </m.button>
        ))}
      </div>
      
      {/* Gate Visual */}
      <div className="relative">
        {/* Connection Wires - Behind the gate */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: '-60%', width: '220%', top: '-10%', height: '120%' }}>
          {/* Input wires */}
          {inputs.map((input, index) => {
            const y = type === 'NOT' ? '50%' : index === 0 ? '35%' : '65%'
            return (
              <g key={`input-${index}`}>
                <line
                  x1="20%"
                  y1={y}
                  x2="50%"
                  y2={y}
                  stroke={input ? '#4ade80' : '#6b7280'}
                  strokeWidth={isLarge ? "4" : "3"}
                  className="transition-all duration-300"
                  strokeLinecap="round"
                />
                {input && (
                  <m.circle
                    cx="32%"
                    cy={y}
                    r={isLarge ? "3" : "2"}
                    fill="#4ade80"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </g>
            )
          })}
          
          {/* Connect wires to center point inside gate */}
          {type !== 'NOT' && inputs.map((input, index) => {
            const startY = index === 0 ? '35%' : '65%'
            return (
              <line
                key={`converge-${index}`}
                x1="50%"
                y1={startY}
                x2="50%"
                y2="50%"
                stroke={input ? '#4ade80' : '#6b7280'}
                strokeWidth={isLarge ? "4" : "3"}
                className="transition-all duration-300"
                strokeLinecap="round"
              />
            )
          })}
          
          {/* Output wire */}
          <line
            x1="50%"
            y1="50%"
            x2="80%"
            y2="50%"
            stroke={output ? '#4ade80' : '#6b7280'}
            strokeWidth={isLarge ? "4" : "3"}
            className="transition-all duration-300"
            strokeLinecap="round"
          />
          {output && (
            <m.circle
              cx="68%"
              cy="50%"
              r={isLarge ? "3" : "2"}
              fill="#4ade80"
              initial={{ scale: 0 }}
              animate={{ scale: 1.5 }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            />
          )}
        </svg>
        
        {/* Gate Box - Now Square */}
        <m.div
          className={`relative ${gateSize} rounded-2xl bg-gradient-to-br ${colors.bg} border-2 ${colors.border} flex items-center justify-center backdrop-blur-sm overflow-hidden`}
          animate={{
            boxShadow: output 
              ? `0 0 40px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.2)` 
              : `0 0 20px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.2)`
          }}
          transition={{ duration: 0.3 }}
        >
          
          {/* Gate name - in front of everything */}
          <span className={`${gateFontSize} font-bold ${colors.text} relative z-10`}>
            {type}
          </span>
          
          {/* Animated pulse when output is true */}
          {output && (
            <m.div
              className="absolute inset-0 rounded-3xl border-2 border-green-400/50"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </m.div>
      </div>
      
      {/* Output Display */}
      <m.div
        className={`${inputSize} rounded-xl border-2 flex items-center justify-center transition-all ${
          output 
            ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30' 
            : 'bg-gray-800/50 border-gray-600/50'
        }`}
        animate={output ? { 
          scale: 1.1,
          rotate: [0, 5, -5, 0]
        } : { scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className={`${fontSize} font-bold ${output ? 'text-green-400' : 'text-gray-500'}`}>
          {output ? '1' : '0'}
        </span>
      </m.div>
    </div>
  )
}

// State Table Component
function StateTable({ gateType, currentInputs = [], revealed = false }: { 
  gateType: GateType; 
  currentInputs?: boolean[];
  revealed?: boolean 
}) {
  const getRows = () => {
    switch (gateType) {
      case 'AND':
        return [
          { inputs: [false, false], output: false },
          { inputs: [false, true], output: false },
          { inputs: [true, false], output: false },
          { inputs: [true, true], output: true }
        ]
      case 'OR':
        return [
          { inputs: [false, false], output: false },
          { inputs: [false, true], output: true },
          { inputs: [true, false], output: true },
          { inputs: [true, true], output: true }
        ]
      case 'NOT':
        return [
          { inputs: [false], output: true },
          { inputs: [true], output: false }
        ]
      default:
        return []
    }
  }
  
  const rows = getRows()
  
  // Find which row matches current inputs
  const getHighlightedRow = () => {
    if (currentInputs.length === 0) return null
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      let matches = true
      for (let j = 0; j < row.inputs.length; j++) {
        if (row.inputs[j] !== currentInputs[j]) {
          matches = false
          break
        }
      }
      if (matches) return i
    }
    return null
  }
  
  const highlightedRow = getHighlightedRow()
  
  const gateColor = {
    AND: 'border-violet-500/50 bg-violet-500/10',
    OR: 'border-blue-500/50 bg-blue-500/10',
    NOT: 'border-rose-500/50 bg-rose-500/10'
  }[gateType]
  
  const highlightColor = {
    AND: 'bg-violet-500/20',
    OR: 'bg-blue-500/20',
    NOT: 'bg-rose-500/20'
  }[gateType]
  
  const highlightBorderColor = {
    AND: '#a78bfa', // violet-400
    OR: '#60a5fa',  // blue-400
    NOT: '#fb7185'  // rose-400
  }[gateType]
  
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/40 rounded-xl border-2 ${gateColor} overflow-hidden backdrop-blur-sm min-w-[220px]`}
    >
      <div className="p-4">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Table className="w-5 h-5" />
          {gateType} State Table
        </h3>
        <table className="w-full">
          <thead>
            <tr className="text-white/80 text-sm border-b border-white/10">
              {gateType !== 'NOT' && <th className="pb-2 px-3 text-left">A</th>}
              <th className="pb-2 px-3 text-left">{gateType === 'NOT' ? 'Input' : 'B'}</th>
              <th className="pb-2 px-3 text-center">Output</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isHighlighted = highlightedRow === index
              return (
                <tr
                  key={index}
                  className={`transition-colors duration-200 ${
                    isHighlighted ? highlightColor : ''
                  }`}
                  style={{
                    borderLeft: isHighlighted ? `4px solid ${highlightBorderColor}` : '4px solid transparent'
                  }}
                >
                  {row.inputs.map((input, i) => (
                    <td key={i} className="py-2 px-3">
                      <span
                        className={`font-mono text-base inline-block transition-all duration-200 ${
                          isHighlighted 
                            ? (input ? 'text-green-300 font-bold' : 'text-gray-300 font-bold') 
                            : (input ? 'text-green-400' : 'text-gray-500')
                        }`}
                      >
                        {input ? '1' : '0'}
                      </span>
                    </td>
                  ))}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`font-mono text-base inline-block font-bold transition-all duration-200 ${
                        isHighlighted
                          ? (row.output ? 'text-green-300' : 'text-gray-300')
                          : (row.output ? 'text-green-400' : 'text-gray-500')
                      }`}
                    >
                      {row.output ? '1' : '0'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </m.div>
  )
}

// Real-world examples component
function RealWorldExample({ type }: { type: 'security' | 'cpu' | 'game' }) {
  const examples = {
    security: {
      icon: Shield,
      title: 'Password Check',
      description: 'AND gate: Password correct AND username correct = Login',
      color: 'text-violet-400'
    },
    cpu: {
      icon: Cpu,
      title: 'CPU Operations',
      description: 'Billions of gates switching billions of times per second',
      color: 'text-blue-400'
    },
    game: {
      icon: Activity,
      title: 'Game Logic',
      description: 'OR gate: Press SPACE OR click mouse = Jump',
      color: 'text-green-400'
    }
  }
  
  const example = examples[type]
  const Icon = example.icon
  
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-2"
    >
      <Icon className={`w-6 h-6 ${example.color}`} />
      <h3 className="text-lg font-bold text-white">{example.title}</h3>
      <p className="text-white/60 text-sm">{example.description}</p>
    </m.div>
  )
}

function LogicGatesLessonContent() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-1')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [stardustParticles, setStardustParticles] = useState<Array<{ id: number; x: number; y: number; collected: boolean }>>([])
  const [isCollectingStardust, setIsCollectingStardust] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Interactive states for gates
  const [andInputs, setAndInputs] = useState([false, false])
  const [orInputs, setOrInputs] = useState([false, false])
  const [notInput, setNotInput] = useState([false])
  const [hasInteractedAnd, setHasInteractedAnd] = useState(false)
  const [hasInteractedOr, setHasInteractedOr] = useState(false)
  const [hasInteractedNot, setHasInteractedNot] = useState(false)
  
  // State tracking for progression - initialize with '00' already visited
  const [andVisitedStates, setAndVisitedStates] = useState<Set<string>>(() => new Set(['00']))
  const [orVisitedStates, setOrVisitedStates] = useState<Set<string>>(() => new Set(['00']))
  const [notVisitedStates, setNotVisitedStates] = useState<Set<string>>(() => new Set(['0']))
  
  // Helper to get state key
  const getStateKey = (inputs: boolean[]) => inputs.map(i => i ? '1' : '0').join('')
  
  // Notebook & Concepts
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [showNotebook, setShowNotebook] = useState(false)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [hasUnlockedConcept, setHasUnlockedConcept] = useState(false)
  
  // Dialog system
  const phaseDialogs = {
    'slide-1': [
      {
        speaker: 'Byte',
        text: "Welcome back! Ready to discover how computers make decisions?",
        animation: 'wave'
      },
      {
        speaker: 'Byte',
        text: "Last time, we learned about individual switches - ON and OFF.",
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "But what happens when we combine multiple switches together?",
        animation: 'thinking'
      }
    ],
    'slide-wiring': [
      {
        speaker: 'Byte',
        text: "Look! We can connect two switches together to create a single output!",
        animation: 'excited'
      },
      {
        speaker: 'Byte',
        text: "The wires from both switches merge into one. But how do we decide what the output should be?",
        animation: 'thinking'
      },
      {
        speaker: 'Byte',
        text: "That's where Logic Gates come in - they're the rules for combining signals!",
        animation: 'explain'
      }
    ],
    'slide-2': [
      {
        speaker: 'Byte',
        text: "This is an AND gate. The rule? It only outputs ON when BOTH inputs are ON.",
        animation: 'explain'
      },
      {
        speaker: 'Byte',
        text: (
          <div className="flex items-center gap-2">
            <span>Look at the state table above</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
              <span className="w-2.5 h-2.5 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
            </span>
            <span>it shows ALL possible combinations!</span>
          </div>
        ),
        animation: 'teaching'
      },
      {
        speaker: 'Byte',
        text: "Try clicking the inputs! It's like asking 'Do you have your keys AND your wallet?'",
        animation: 'point'
      }
    ],
    'slide-3': [
      {
        speaker: 'Byte',
        text: "This is an OR gate. The rule? It outputs ON if AT LEAST ONE input is ON.",
        animation: 'explain'
      },
      {
        speaker: 'Byte',
        text: "Click the inputs! It's like 'Press W OR UP arrow to move forward' in a game.",
        animation: 'happy'
      }
    ],
    'slide-4': [
      {
        speaker: 'Byte',
        text: "This is a NOT gate. The rule? It INVERTS the input - ON becomes OFF, OFF becomes ON.",
        animation: 'explain'
      },
      {
        speaker: 'Byte',
        text: "It's like a light switch - whatever goes in, the opposite comes out!",
        animation: 'point'
      }
    ],
    'slide-5': [
      {
        speaker: 'Byte',
        text: "State tables show every possible combination! They're like instruction manuals for gates.",
        animation: 'explain'
      },
      {
        speaker: 'Byte',
        text: "Watch how each row shows what happens with different inputs.",
        animation: 'point'
      }
    ],
    'slide-6': [
      {
        speaker: 'Byte',
        text: (
          <div className="flex flex-col gap-3">
            <span>Gates can connect to each other!</span>
            <div className="flex items-center gap-2 justify-center">
              <m.div 
                className="px-3 py-1 bg-violet-500/20 border border-violet-400/50 rounded-lg text-violet-300 text-sm font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                AND
              </m.div>
              <m.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <ArrowRight className="w-5 h-5 text-white/60" />
              </m.div>
              <m.div 
                className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-lg text-blue-300 text-sm font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                OR
              </m.div>
              <m.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <ArrowRight className="w-5 h-5 text-white/60" />
              </m.div>
              <m.div 
                className="px-3 py-1 bg-rose-500/20 border border-rose-400/50 rounded-lg text-rose-300 text-sm font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
              >
                NOT
              </m.div>
            </div>
            <span className="text-sm text-white/70">The output of one becomes the input of another!</span>
          </div>
        ),
        animation: 'explain'
      },
      {
        speaker: 'Byte',
        text: "This is how simple gates create complex operations - like math, graphics, and AI!",
        animation: 'amazed'
      }
    ],
    'slide-7': [
      {
        speaker: 'Byte',
        text: "Logic gates are EVERYWHERE in technology! Let me show you some real examples.",
        animation: 'explain'
      },
      {
        speaker: 'Byte',
        text: "From security systems to video games, it's all logic gates working together!",
        animation: 'excited'
      }
    ],
    'slide-8': [
      {
        speaker: 'Byte',
        text: "Modern processors contain BILLIONS of these gates, switching billions of times per second!",
        animation: 'explain'
      },
      {
        speaker: 'Byte',
        text: "Every pixel on your screen, every character you type - it all flows through logic gates!",
        animation: 'amazed'
      }
    ],
    'slide-9': [
      {
        speaker: 'Byte',
        text: "Incredible! You've mastered Logic Gates - the fundamental building blocks of computation!",
        animation: 'celebrate'
      },
      {
        speaker: 'Byte',
        text: "You now understand how computers think. Next, we'll explore how gates create memory!",
        animation: 'excited'
      }
    ]
  }
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  // Notebook entry management
  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
    const newEntry: NotebookEntry = {
      ...entry,
      id: Math.random().toString(),
      timestamp: Date.now()
    }
    setNotebookEntries(prev => [...prev, newEntry])
  }
  
  // Add concept definitions when reaching certain slides
  useEffect(() => {
    switch (currentPhase) {
      case 'slide-2':
        if (!hasInteractedAnd) {
          addNotebookEntry({
            type: 'definition',
            title: 'AND Gate',
            content: 'Outputs ON only when ALL inputs are ON. Essential for checking multiple conditions.'
          })
          setHasInteractedAnd(true)
        }
        break
      case 'slide-3':
        if (!hasInteractedOr) {
          addNotebookEntry({
            type: 'definition',
            title: 'OR Gate',
            content: 'Outputs ON when AT LEAST ONE input is ON. Used for alternative options.'
          })
          setHasInteractedOr(true)
        }
        break
      case 'slide-4':
        if (!hasInteractedNot) {
          addNotebookEntry({
            type: 'definition',
            title: 'NOT Gate',
            content: 'Inverts the input signal. ON becomes OFF, OFF becomes ON.'
          })
          setHasInteractedNot(true)
        }
        break
    }
  }, [currentPhase, hasInteractedAnd, hasInteractedOr, hasInteractedNot])
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    // Check if we're at the end of a gate slide that requires all states to be visited
    const isGateSlideComplete = () => {
      if (currentPhase === 'slide-2' && andVisitedStates.size < 4) return false
      if (currentPhase === 'slide-3' && orVisitedStates.size < 4) return false
      if (currentPhase === 'slide-4' && notVisitedStates.size < 2) return false
      return true
    }
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Check if we can proceed from gate slides
      if (!isGateSlideComplete()) {
        // Don't proceed if not all states are visited
        return
      }
      
      // Move to next phase
      const phases: LessonPhase[] = ['slide-1', 'slide-wiring', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9']
      const currentIndex = phases.indexOf(currentPhase)
      if (currentIndex < phases.length - 1) {
        const nextPhase = phases[currentIndex + 1]
        setCurrentPhase(nextPhase)
        setCurrentDialogIndex(0)
        
        // Trigger stardust animation when entering final slide
        if (nextPhase === 'slide-9') {
          setTimeout(() => spawnStardustParticles(), 1000)
        }
      } else {
        handleLessonComplete()
      }
    }
  }
  
  // Stardust animation functions (same as before)
  const spawnStardustParticles = useCallback(() => {
    if (isCollectingStardust) return
    
    setIsCollectingStardust(true)
    const particles: Array<{ id: number; x: number; y: number; collected: boolean }> = []
    const particleCount = 20
    
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
          const toCollect = Math.min(2 + Math.floor(Math.random() * 2), uncollected.length)
          for (let i = 0; i < toCollect; i++) {
            const particle = uncollected[i]
            particle.collected = true
            collectedCount++
            
            setTimeout(() => {
              addStardust(2)
              setEarnedStardust(prev => prev + 2)
            }, i * 100)
          }
        } else {
          clearInterval(collectInterval)
          setTimeout(() => {
            setStardustParticles([])
            setIsCollectingStardust(false)
          }, 1000)
        }
        
        return updated
      })
    }, 200)
  }, [addStardust])
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      const phases: LessonPhase[] = ['slide-1', 'slide-wiring', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9']
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
    const stardustEarned = 40
    
    // Unlock the logic-gates concept
    if (!hasUnlockedConcept) {
      const unlockedConcepts = JSON.parse(localStorage.getItem('unlockedConcepts') || '[]')
      if (!unlockedConcepts.includes('logic-gates')) {
        unlockedConcepts.push('logic-gates')
        localStorage.setItem('unlockedConcepts', JSON.stringify(unlockedConcepts))
      }
      setHasUnlockedConcept(true)
      
      // Add to notebook
      addNotebookEntry({
        type: 'concept',
        title: 'Logic Gates',
        content: 'Fundamental building blocks that perform logical operations on binary inputs'
      })
    }
    
    if (profile) {
      await addStardust(stardustEarned)
      await dictionaryService.markConceptLearned(profile.id, 'logic-gates')
    }
    
    setEarnedStardust(stardustEarned)
    setShowCompletionScreen(true)
    
    setTimeout(() => {
      router.push('/courses/computer-science/binary-logic')
    }, 3000)
  }
  
  const handleNotebookEntryClick = (entry: NotebookEntry) => {
    if (entry.title === 'Logic Gates') {
      // Open the concept in a new tab to show the full concept page
      window.open('/archive/logic-gates', '_blank')
    }
  }
  
  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="fixed inset-0 bg-black" />
        <TopNavigationBar />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-white/50">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar />
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-20 pb-32 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          {/* Slide 1 - Introduction */}
          {currentPhase === 'slide-1' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <m.div
                  className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center border border-purple-500/30 backdrop-blur-sm mx-auto mb-8 cursor-pointer"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    boxShadow: '0 0 40px rgba(147, 51, 234, 0.5)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Zap className="w-16 h-16 text-purple-400" />
                </m.div>
                <h1 className="text-5xl md:text-6xl font-light text-white mb-4">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">Logic Gates</span>
                </h1>
                <p className="text-xl text-white/60 font-light mb-8">
                  The tiny switches that make all computation possible
                </p>
                <div className="flex gap-4 justify-center">
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-violet-500/20 border border-violet-400 rounded-xl flex items-center justify-center hover:bg-violet-500/30 transition-all"
                  >
                    <span className="text-sm font-bold text-violet-400">AND</span>
                  </m.div>
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-blue-500/20 border border-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-500/30 transition-all"
                  >
                    <span className="text-sm font-bold text-blue-400">OR</span>
                  </m.div>
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-rose-500/20 border border-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500/30 transition-all"
                  >
                    <span className="text-sm font-bold text-rose-400">NOT</span>
                  </m.div>
                </div>
              </div>
            </m.div>
          )}
          
          {/* Slide Wiring - How Switches Connect */}
          {currentPhase === 'slide-wiring' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full"
            >
              <div className="flex flex-col items-center gap-8">
                <h2 className="text-3xl font-light text-white/90">Connecting Switches Together</h2>
                
                {/* Visual demonstration of switches merging */}
                <div className="relative">
                  <svg width="600" height="300" className="overflow-visible">
                    {/* Switch A */}
                    <g 
                      onClick={() => setAndInputs([!andInputs[0], andInputs[1]])}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect x="50" y="50" width="80" height="80" rx="12" 
                        fill={andInputs[0] ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"} 
                        stroke={andInputs[0] ? "#22c55e" : "#6b7280"} 
                        strokeWidth="2"
                        className="transition-all hover:opacity-80"
                      />
                      <text x="90" y="95" textAnchor="middle" 
                        fill={andInputs[0] ? "#22c55e" : "#6b7280"} 
                        fontSize="32" fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                      >
                        {andInputs[0] ? '1' : '0'}
                      </text>
                      <text x="90" y="115" textAnchor="middle" fill="white" fontSize="14" opacity="0.6"
                        style={{ pointerEvents: 'none' }}
                      >
                        Switch A
                      </text>
                    </g>
                    
                    {/* Switch B */}
                    <g 
                      onClick={() => setAndInputs([andInputs[0], !andInputs[1]])}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect x="50" y="170" width="80" height="80" rx="12" 
                        fill={andInputs[1] ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"} 
                        stroke={andInputs[1] ? "#22c55e" : "#6b7280"} 
                        strokeWidth="2"
                        className="transition-all hover:opacity-80"
                      />
                      <text x="90" y="215" textAnchor="middle" 
                        fill={andInputs[1] ? "#22c55e" : "#6b7280"} 
                        fontSize="32" fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                      >
                        {andInputs[1] ? '1' : '0'}
                      </text>
                      <text x="90" y="235" textAnchor="middle" fill="white" fontSize="14" opacity="0.6"
                        style={{ pointerEvents: 'none' }}
                      >
                        Switch B
                      </text>
                    </g>
                    
                    {/* Wires from switches */}
                    <m.line x1="130" y1="90" x2="250" y2="90" 
                      stroke={andInputs[0] ? "#22c55e" : "#6b7280"} 
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    <m.line x1="130" y1="210" x2="250" y2="210" 
                      stroke={andInputs[1] ? "#22c55e" : "#6b7280"} 
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                    
                    {/* Merge point animation */}
                    <m.line x1="250" y1="90" x2="270" y2="150" 
                      stroke={andInputs[0] ? "#22c55e" : "#6b7280"} 
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    />
                    <m.line x1="250" y1="210" x2="270" y2="150" 
                      stroke={andInputs[1] ? "#22c55e" : "#6b7280"} 
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    />
                    
                    {/* Mystery box at the exact intersection point */}
                    <m.g
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 2 }}
                    >
                      <rect x="240" y="120" width="60" height="60" rx="8"
                        fill="rgba(147, 51, 234, 0.15)"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                      />
                      <text x="270" y="160" textAnchor="middle" fill="#e9d5ff" fontSize="36" fontWeight="bold">
                        ?
                      </text>
                    </m.g>
                    
                    {/* Output wire */}
                    <m.line x1="300" y1="150" x2="470" y2="150" 
                      stroke="#6b7280" 
                      strokeWidth="3"
                      strokeDasharray="5 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 2.5 }}
                    />
                    
                    {/* Output */}
                    <m.g
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 3 }}
                    >
                      <rect x="470" y="110" width="80" height="80" rx="12" 
                        fill="rgba(147, 51, 234, 0.1)" 
                        stroke="#9333ea" 
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <text x="510" y="155" textAnchor="middle" fill="#9333ea" fontSize="32" fontWeight="bold">
                        ?
                      </text>
                      <text x="510" y="175" textAnchor="middle" fill="white" fontSize="14" opacity="0.6">
                        Output
                      </text>
                    </m.g>
                  </svg>
                </div>
                
                {/* Instruction text */}
                <p className="text-white/50 text-sm mt-4">Click the switches above to toggle them!</p>
              </div>
            </m.div>
          )}
        
          {/* Slide 2 - AND Gate */}
          {currentPhase === 'slide-2' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-3xl font-light text-white/90">The <span className="font-bold text-violet-400">AND</span> Gate</h2>
                {/* Progress indicator */}
                <div className="flex items-center gap-2 bg-violet-500/10 px-4 py-2 rounded-full border border-violet-500/30">
                  <span className="text-violet-400 font-medium">States Explored:</span>
                  <span className="text-white font-bold">{andVisitedStates.size}/4</span>
                  {andVisitedStates.size === 4 && (
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </m.div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-16">
                <div className="flex flex-col items-center space-y-6">
                  <InteractiveGate 
                    type="AND" 
                    inputs={andInputs}
                    size="large"
                    onInputChange={(index, value) => {
                      const newInputs = [...andInputs]
                      newInputs[index] = value
                      setAndInputs(newInputs)
                      // Track visited state
                      const stateKey = getStateKey(newInputs)
                      setAndVisitedStates(prev => new Set([...prev, stateKey]))
                    }}
                  />
                  
                  {/* Visual state tracker */}
                  {mounted && (
                    <div className="grid grid-cols-4 gap-2">
                      {['00', '01', '10', '11'].map(state => (
                        <m.div
                          key={state}
                          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm transition-all ${
                            andVisitedStates.has(state)
                              ? 'bg-green-500/20 border-green-400'
                              : 'bg-gray-800/50 border-gray-600/50 text-gray-500'
                          }`}
                          animate={andVisitedStates.has(state) ? { scale: 1.1 } : {}}
                        >
                          {andVisitedStates.has(state) ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            state
                          )}
                        </m.div>
                      ))}
                    </div>
                  )}
                </div>
                <StateTable gateType="AND" currentInputs={andInputs} revealed={true} />
              </div>
            </m.div>
          )}
        
          {/* Slide 3 - OR Gate */}
          {currentPhase === 'slide-3' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-3xl font-light text-white/90">The <span className="font-bold text-blue-400">OR</span> Gate</h2>
                {/* Progress indicator */}
                <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/30">
                  <span className="text-blue-400 font-medium">States Explored:</span>
                  <span className="text-white font-bold">{orVisitedStates.size}/4</span>
                  {orVisitedStates.size === 4 && (
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </m.div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-16">
                <div className="flex flex-col items-center space-y-6">
                  <InteractiveGate 
                    type="OR" 
                    inputs={orInputs}
                    size="large"
                    onInputChange={(index, value) => {
                      const newInputs = [...orInputs]
                      newInputs[index] = value
                      setOrInputs(newInputs)
                      // Track visited state
                      const stateKey = getStateKey(newInputs)
                      setOrVisitedStates(prev => new Set([...prev, stateKey]))
                    }}
                  />
                  
                  {/* Visual state tracker */}
                  {mounted && (
                    <div className="grid grid-cols-4 gap-2">
                      {['00', '01', '10', '11'].map(state => (
                        <m.div
                          key={state}
                          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm transition-all ${
                            orVisitedStates.has(state)
                              ? 'bg-green-500/20 border-green-400'
                              : 'bg-gray-800/50 border-gray-600/50 text-gray-500'
                          }`}
                          animate={orVisitedStates.has(state) ? { scale: 1.1 } : {}}
                        >
                          {orVisitedStates.has(state) ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            state
                          )}
                        </m.div>
                      ))}
                    </div>
                  )}
                </div>
                <StateTable gateType="OR" currentInputs={orInputs} revealed={true} />
              </div>
            </m.div>
          )}
        
          {/* Slide 4 - NOT Gate */}
          {currentPhase === 'slide-4' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-3xl font-light text-white/90">The <span className="font-bold text-rose-400">NOT</span> Gate</h2>
                {/* Progress indicator */}
                <div className="flex items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/30">
                  <span className="text-rose-400 font-medium">States Explored:</span>
                  <span className="text-white font-bold">{notVisitedStates.size}/2</span>
                  {notVisitedStates.size === 2 && (
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </m.div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-16">
                <div className="flex flex-col items-center space-y-6">
                  <InteractiveGate 
                    type="NOT" 
                    inputs={notInput}
                    size="large"
                    onInputChange={(index, value) => {
                      setNotInput([value])
                      // Track visited state
                      const stateKey = getStateKey([value])
                      setNotVisitedStates(prev => new Set([...prev, stateKey]))
                    }}
                  />
                  
                  {/* Visual state tracker */}
                  {mounted && (
                    <div className="grid grid-cols-2 gap-2">
                      {['0', '1'].map(state => (
                        <m.div
                          key={state}
                          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm transition-all ${
                            notVisitedStates.has(state)
                              ? 'bg-green-500/20 border-green-400'
                              : 'bg-gray-800/50 border-gray-600/50 text-gray-500'
                          }`}
                          animate={notVisitedStates.has(state) ? { scale: 1.1 } : {}}
                        >
                          {notVisitedStates.has(state) ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            state
                          )}
                        </m.div>
                      ))}
                    </div>
                  )}
                </div>
                <StateTable gateType="NOT" currentInputs={notInput} revealed={true} />
              </div>
            </m.div>
          )}
        
          {/* Slide 5 - State Tables */}
          {currentPhase === 'slide-5' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-3xl font-light text-white/90">Understanding <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-rose-400">State Tables</span></h2>
              <div className="grid grid-cols-3 gap-6 max-w-5xl">
                <StateTable gateType="AND" currentInputs={andInputs} revealed={true} />
                <StateTable gateType="OR" currentInputs={orInputs} revealed={true} />
                <StateTable gateType="NOT" currentInputs={notInput} revealed={true} />
              </div>
            </m.div>
          )}
        
          {/* Slide 6 - Combining Gates */}
          {currentPhase === 'slide-6' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-3xl font-light text-white/90">Building <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Complex Circuits</span></h2>
              <div className="flex items-center gap-4">
                <InteractiveGate type="AND" inputs={[true, false]} />
                <m.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight className="w-8 h-8 text-white/60" />
                </m.div>
                <InteractiveGate type="NOT" inputs={[false]} />
              </div>
              <p className="text-xl text-white/70 text-center max-w-2xl font-light">
                This creates a <span className="font-bold text-purple-400">NAND</span> gate! Complex circuits are just many simple gates connected together.
              </p>
            </m.div>
          )}
        
          {/* Slide 7 - Real World Examples */}
          {currentPhase === 'slide-7' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-3xl font-light text-white/90">Logic Gates <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">In Action</span></h2>
              <div className="grid grid-cols-3 gap-6 max-w-4xl">
                <RealWorldExample type="security" />
                <RealWorldExample type="cpu" />
                <RealWorldExample type="game" />
              </div>
            </m.div>
          )}
        
          {/* Slide 8 - Scale */}
          {currentPhase === 'slide-8' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-3xl font-light text-white/90">The <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Scale</span> of Modern Computing</h2>
              <div className="relative w-full max-w-3xl h-80">
                {/* Static grid with subtle glow - reduced from 96 animated elements */}
                <div className="absolute inset-0 grid grid-cols-8 gap-2">
                  {[...Array(32)].map((_, i) => (
                    <m.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 0.3 + (Math.sin(i * 0.5) * 0.2)
                      }}
                      transition={{ 
                        duration: 0.5,
                        delay: i * 0.02
                      }}
                      className="w-full h-8 bg-purple-500/20 rounded-lg border border-purple-500/30"
                    />
                  ))}
                </div>
                {/* Single pulsing overlay instead of individual animations */}
                <m.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg"
                  animate={{
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 text-center border border-purple-500/30">
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">10,000,000,000+</p>
                    <p className="text-white/70 text-lg mt-2 font-light">Logic gates in your CPU</p>
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
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <m.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <CheckCircle2 className="w-32 h-32 text-green-400" />
              </m.div>
              <h2 className="text-4xl font-light text-white">Gates <span className="font-bold text-green-400">Mastered!</span></h2>
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border-2 border-purple-400/30 rounded-3xl p-8 max-w-lg">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">Achievement Unlocked</h3>
                <p className="text-lg text-white/80 font-light leading-relaxed">
                  You now understand the fundamental building blocks of all digital computation!
                </p>
              </div>
            </m.div>
          )}
        </div>
      </div>
      
      {/* NPC Dialog */}
      {currentDialog && (
        <>
          <NPCDialog
            npcName="Byte"
            dialog={currentDialog}
            onNext={handleNextDialog}
            onBack={currentDialogIndex > 0 ? handleBackDialog : undefined}
            currentIndex={currentDialogIndex}
            totalDialogs={getCurrentDialogs().length}
          />
          {/* Show message if trying to proceed without exploring all states */}
          {currentDialogIndex === getCurrentDialogs().length - 1 && (
            <>
              {(currentPhase === 'slide-2' && andVisitedStates.size < 4) && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-violet-500/20 border border-violet-400/50 rounded-lg px-4 py-2 text-violet-300 text-sm whitespace-nowrap"
                >
                  Explore all 4 input combinations to continue! ({andVisitedStates.size}/4 visited)
                </m.div>
              )}
              {(currentPhase === 'slide-3' && orVisitedStates.size < 4) && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-blue-500/20 border border-blue-400/50 rounded-lg px-4 py-2 text-blue-300 text-sm whitespace-nowrap"
                >
                  Explore all 4 input combinations to continue! ({orVisitedStates.size}/4 visited)
                </m.div>
              )}
              {(currentPhase === 'slide-4' && notVisitedStates.size < 2) && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-rose-500/20 border border-rose-400/50 rounded-lg px-4 py-2 text-rose-300 text-sm whitespace-nowrap"
                >
                  Try both input states to continue! ({notVisitedStates.size}/2 visited)
                </m.div>
              )}
            </>
          )}
        </>
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
      
      {/* Stardust Particles Animation */}
      <AnimatePresence>
        {stardustParticles.map((particle) => {
          const targetX = 100
          const targetY = 30
          
          return (
            <m.div
              key={particle.id}
              className="fixed pointer-events-none z-[100]"
              initial={{ 
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 0
              }}
              animate={particle.collected ? {
                x: targetX,
                y: targetY,
                scale: [1, 1.5],
                opacity: [1, 1, 0]
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
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
              } : {
                duration: 0.5,
                scale: { type: "spring", stiffness: 260, damping: 20 },
                rotate: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 w-8 h-8 bg-yellow-400/30 rounded-full blur-lg" />
                <Star 
                  className="w-8 h-8 text-yellow-400 fill-yellow-400"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))',
                  }}
                />
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
              className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center space-y-6 border border-purple-500/30"
            >
              <CheckCircle2 className="w-24 h-24 text-green-400 mx-auto" />
              <h2 className="text-3xl font-bold text-white">Lesson Complete!</h2>
              <p className="text-white/70">
                You've earned {earnedStardust} Stardust!
              </p>
              <div className="flex justify-center gap-3">
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </m.div>
                <m.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </m.div>
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </m.div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LogicGatesLesson() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="fixed inset-0 bg-black" />
        <TopNavigationBar />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-white/50">Loading...</div>
        </div>
      </div>
    }>
      <LogicGatesLessonContent />
    </ClientOnly>
  )
}