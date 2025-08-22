'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, X, Binary, Circle, Square, CheckCircle2, Zap } from 'lucide-react'
import { dictionaryService } from '@/lib/dictionaryService'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept } from '@/components/lesson/ConceptViewer'

type LessonPhase = 'slide-1' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9' | 'slide-10' | 'slide-11' | 'complete'

// Interactive Gate Component
function InteractiveGate({ 
  type, 
  inputs, 
  onInputChange,
  showOutput = false,
  highlighted = false
}: { 
  type: 'AND' | 'OR' | 'NOT'
  inputs: boolean[]
  onInputChange: (index: number, value: boolean) => void
  showOutput?: boolean
  highlighted?: boolean
}) {
  const getOutput = () => {
    switch (type) {
      case 'AND':
        return inputs[0] && inputs[1]
      case 'OR':
        return inputs[0] || inputs[1]
      case 'NOT':
        return !inputs[0]
    }
  }

  const output = getOutput()
  const gateColor = type === 'AND' ? 'blue' : type === 'OR' ? 'green' : 'purple'

  return (
    <div className={`relative ${highlighted ? 'scale-110' : ''} transition-transform`}>
      <svg width="200" height="120" viewBox="0 0 200 120" className="w-full max-w-[200px]">
        {/* Input wires */}
        {type !== 'NOT' && (
          <>
            <line x1="0" y1="30" x2="50" y2="30" stroke="white" strokeWidth="2" />
            <line x1="0" y1="90" x2="50" y2="90" stroke="white" strokeWidth="2" />
          </>
        )}
        {type === 'NOT' && (
          <line x1="0" y1="60" x2="50" y2="60" stroke="white" strokeWidth="2" />
        )}

        {/* Gate shape */}
        {type === 'AND' && (
          <path 
            d="M 50 20 L 100 20 C 120 20 140 40 140 60 C 140 80 120 100 100 100 L 50 100 Z" 
            fill={gateColor === 'blue' ? '#3b82f6' : gateColor === 'green' ? '#10b981' : '#a855f7'}
            fillOpacity="0.2"
            stroke={gateColor === 'blue' ? '#60a5fa' : gateColor === 'green' ? '#34d399' : '#c084fc'}
            strokeWidth="2"
          />
        )}
        {type === 'OR' && (
          <path 
            d="M 50 20 Q 70 20 90 20 C 120 20 140 40 140 60 C 140 80 120 100 90 100 Q 70 100 50 100 Q 70 60 50 20" 
            fill={gateColor === 'blue' ? '#3b82f6' : gateColor === 'green' ? '#10b981' : '#a855f7'}
            fillOpacity="0.2"
            stroke={gateColor === 'blue' ? '#60a5fa' : gateColor === 'green' ? '#34d399' : '#c084fc'}
            strokeWidth="2"
          />
        )}
        {type === 'NOT' && (
          <>
            <path 
              d="M 50 40 L 110 60 L 50 80 Z" 
              fill={gateColor === 'blue' ? '#3b82f6' : gateColor === 'green' ? '#10b981' : '#a855f7'}
              fillOpacity="0.2"
              stroke={gateColor === 'blue' ? '#60a5fa' : gateColor === 'green' ? '#34d399' : '#c084fc'}
              strokeWidth="2"
            />
            <circle 
              cx="120" 
              cy="60" 
              r="10" 
              fill={gateColor === 'blue' ? '#3b82f6' : gateColor === 'green' ? '#10b981' : '#a855f7'}
              fillOpacity="0.2"
              stroke={gateColor === 'blue' ? '#60a5fa' : gateColor === 'green' ? '#34d399' : '#c084fc'}
              strokeWidth="2"
            />
          </>
        )}

        {/* Output wire */}
        <line 
          x1={type === 'NOT' ? "130" : "140"} 
          y1="60" 
          x2="200" 
          y2="60" 
          stroke="white" 
          strokeWidth="2" 
        />

        {/* Gate label */}
        <text 
          x={type === 'NOT' ? "80" : "95"} 
          y="65" 
          textAnchor="middle" 
          fill="white" 
          className="text-lg font-bold"
        >
          {type}
        </text>

        {/* Output indicator */}
        {showOutput && (
          <circle
            cx="190"
            cy="60"
            r="8"
            fill={output ? '#10b981' : '#ef4444'}
            className={output ? 'animate-pulse' : ''}
          />
        )}
      </svg>

      {/* Input toggles */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-center">
        {type !== 'NOT' ? (
          <>
            <button
              onClick={() => onInputChange(0, !inputs[0])}
              className={`absolute -left-8 top-[15px] w-12 h-12 rounded-full border-2 transition-all ${
                inputs[0] 
                  ? 'bg-green-500/20 border-green-400 text-green-400' 
                  : 'bg-red-500/20 border-red-400 text-red-400'
              }`}
            >
              <span className="text-xs font-bold">{inputs[0] ? '1' : '0'}</span>
            </button>
            <button
              onClick={() => onInputChange(1, !inputs[1])}
              className={`absolute -left-8 bottom-[15px] w-12 h-12 rounded-full border-2 transition-all ${
                inputs[1] 
                  ? 'bg-green-500/20 border-green-400 text-green-400' 
                  : 'bg-red-500/20 border-red-400 text-red-400'
              }`}
            >
              <span className="text-xs font-bold">{inputs[1] ? '1' : '0'}</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onInputChange(0, !inputs[0])}
            className={`absolute -left-8 top-[48px] w-12 h-12 rounded-full border-2 transition-all ${
              inputs[0] 
                ? 'bg-green-500/20 border-green-400 text-green-400' 
                : 'bg-red-500/20 border-red-400 text-red-400'
            }`}
          >
            <span className="text-xs font-bold">{inputs[0] ? '1' : '0'}</span>
          </button>
        )}
      </div>

      {/* Output label */}
      {showOutput && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white">
          <p className="text-sm font-semibold">{output ? 'TRUE' : 'FALSE'}</p>
          <p className="text-xs text-white/60">{output ? '1' : '0'}</p>
        </div>
      )}
    </div>
  )
}

// State Table Component
function StateTable({ gateType }: { gateType: 'AND' | 'OR' | 'NOT' }) {
  const getRows = () => {
    if (gateType === 'NOT') {
      return [
        { inputs: [false], output: true },
        { inputs: [true], output: false }
      ]
    } else if (gateType === 'AND') {
      return [
        { inputs: [false, false], output: false },
        { inputs: [false, true], output: false },
        { inputs: [true, false], output: false },
        { inputs: [true, true], output: true }
      ]
    } else { // OR
      return [
        { inputs: [false, false], output: false },
        { inputs: [false, true], output: true },
        { inputs: [true, false], output: true },
        { inputs: [true, true], output: true }
      ]
    }
  }

  const rows = getRows()

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/20">
            {gateType !== 'NOT' && <th className="px-4 py-2 text-white text-sm">A</th>}
            {gateType !== 'NOT' && <th className="px-4 py-2 text-white text-sm">B</th>}
            {gateType === 'NOT' && <th className="px-4 py-2 text-white text-sm">Input</th>}
            <th className="px-4 py-2 text-white text-sm">Output</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <m.tr 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border-b border-white/10"
            >
              {row.inputs.map((input, j) => (
                <td key={j} className="px-4 py-2 text-center">
                  <span className={`font-mono ${input ? 'text-green-400' : 'text-red-400'}`}>
                    {input ? '1' : '0'}
                  </span>
                </td>
              ))}
              <td className="px-4 py-2 text-center">
                <span className={`font-mono font-bold ${row.output ? 'text-green-400' : 'text-red-400'}`}>
                  {row.output ? '1' : '0'}
                </span>
              </td>
            </m.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Real World Example Component
function RealWorldExample({ 
  type 
}: { 
  type: 'security' | 'search' | 'alarm' 
}) {
  const [state, setState] = useState({
    security: { hasPassword: true, hasFingerprint: false },
    search: { hasName: false, hasEmail: true },
    alarm: { isSilent: false }
  })

  if (type === 'security') {
    const canAccess = state.security.hasPassword && state.security.hasFingerprint
    return (
      <div className="bg-white/5 rounded-xl p-6 max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Security System (AND Gate)</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.security.hasPassword}
              onChange={(e) => setState(prev => ({
                ...prev,
                security: { ...prev.security, hasPassword: e.target.checked }
              }))}
              className="w-5 h-5"
            />
            <span className="text-white">Correct Password</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.security.hasFingerprint}
              onChange={(e) => setState(prev => ({
                ...prev,
                security: { ...prev.security, hasFingerprint: e.target.checked }
              }))}
              className="w-5 h-5"
            />
            <span className="text-white">Valid Fingerprint</span>
          </label>
          <div className={`mt-4 p-4 rounded-lg text-center font-bold ${
            canAccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            Access {canAccess ? 'GRANTED' : 'DENIED'}
          </div>
          <p className="text-white/60 text-sm">Both conditions must be TRUE</p>
        </div>
      </div>
    )
  }

  if (type === 'search') {
    const hasResult = state.search.hasName || state.search.hasEmail
    return (
      <div className="bg-white/5 rounded-xl p-6 max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Search System (OR Gate)</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.search.hasName}
              onChange={(e) => setState(prev => ({
                ...prev,
                search: { ...prev.search, hasName: e.target.checked }
              }))}
              className="w-5 h-5"
            />
            <span className="text-white">Search by Name</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.search.hasEmail}
              onChange={(e) => setState(prev => ({
                ...prev,
                search: { ...prev.search, hasEmail: e.target.checked }
              }))}
              className="w-5 h-5"
            />
            <span className="text-white">Search by Email</span>
          </label>
          <div className={`mt-4 p-4 rounded-lg text-center font-bold ${
            hasResult ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {hasResult ? 'Results Found' : 'No Results'}
          </div>
          <p className="text-white/60 text-sm">Either condition can be TRUE</p>
        </div>
      </div>
    )
  }

  if (type === 'alarm') {
    const isLoud = !state.alarm.isSilent
    return (
      <div className="bg-white/5 rounded-xl p-6 max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Alarm System (NOT Gate)</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.alarm.isSilent}
              onChange={(e) => setState(prev => ({
                ...prev,
                alarm: { isSilent: e.target.checked }
              }))}
              className="w-5 h-5"
            />
            <span className="text-white">Silent Mode</span>
          </label>
          <div className={`mt-4 p-4 rounded-lg text-center font-bold ${
            isLoud ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {isLoud ? '🔊 LOUD ALARM' : '🔇 Silent'}
          </div>
          <p className="text-white/60 text-sm">Output is opposite of input</p>
        </div>
      </div>
    )
  }

  return null
}

// Combined Gates Visualization
function CombinedGatesDemo() {
  const [inputs, setInputs] = useState([false, false, false])
  
  // Calculate intermediate outputs
  const andOutput = inputs[0] && inputs[1]
  const finalOutput = andOutput || inputs[2]

  return (
    <div className="relative">
      <svg width="400" height="200" viewBox="0 0 400 200" className="w-full max-w-[400px]">
        {/* Input labels */}
        <text x="10" y="40" fill="white" className="text-sm">A</text>
        <text x="10" y="80" fill="white" className="text-sm">B</text>
        <text x="10" y="160" fill="white" className="text-sm">C</text>

        {/* Input wires to AND gate */}
        <line x1="30" y1="40" x2="80" y2="40" stroke="white" strokeWidth="2" />
        <line x1="30" y1="80" x2="80" y2="80" stroke="white" strokeWidth="2" />

        {/* AND Gate */}
        <g transform="translate(80, 20)">
          <path 
            d="M 0 0 L 40 0 C 60 0 80 20 80 40 C 80 60 60 80 40 80 L 0 80 Z" 
            fill="#3b82f6"
            fillOpacity="0.2"
            stroke="#60a5fa"
            strokeWidth="2"
          />
          <text x="40" y="45" textAnchor="middle" fill="white" className="text-sm font-bold">
            AND
          </text>
        </g>

        {/* Wire from AND to OR */}
        <line x1="160" y1="60" x2="200" y2="60" stroke="white" strokeWidth="2" />
        
        {/* Input wire C to OR gate */}
        <line x1="30" y1="160" x2="200" y2="120" stroke="white" strokeWidth="2" />

        {/* OR Gate */}
        <g transform="translate(200, 40)">
          <path 
            d="M 0 0 Q 20 0 40 0 C 70 0 90 20 90 40 C 90 60 70 80 40 80 Q 20 80 0 80 Q 20 40 0 0" 
            fill="#10b981"
            fillOpacity="0.2"
            stroke="#34d399"
            strokeWidth="2"
          />
          <text x="45" y="45" textAnchor="middle" fill="white" className="text-sm font-bold">
            OR
          </text>
        </g>

        {/* Output wire */}
        <line x1="290" y1="80" x2="350" y2="80" stroke="white" strokeWidth="2" />

        {/* Output indicator */}
        <circle
          cx="370"
          cy="80"
          r="12"
          fill={finalOutput ? '#10b981' : '#ef4444'}
          className={finalOutput ? 'animate-pulse' : ''}
        />
        <text x="370" y="85" textAnchor="middle" fill="white" className="text-xs font-bold">
          {finalOutput ? '1' : '0'}
        </text>

        {/* Intermediate output indicator */}
        <circle
          cx="180"
          cy="60"
          r="8"
          fill={andOutput ? '#10b981' : '#ef4444'}
          opacity="0.7"
        />
      </svg>

      {/* Input controls */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-around py-4">
        {['A', 'B', 'C'].map((label, i) => (
          <button
            key={label}
            onClick={() => {
              const newInputs = [...inputs]
              newInputs[i] = !newInputs[i]
              setInputs(newInputs)
            }}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              inputs[i] 
                ? 'bg-green-500/20 border-green-400 text-green-400' 
                : 'bg-red-500/20 border-red-400 text-red-400'
            }`}
          >
            <span className="text-xs font-bold">{inputs[i] ? '1' : '0'}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-white/80 text-sm">
          Output = (A AND B) OR C = {finalOutput ? 'TRUE' : 'FALSE'}
        </p>
      </div>
    </div>
  )
}

function LogicGatesContent() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-1')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  
  // Interactive states
  const [andInputs, setAndInputs] = useState([false, false])
  const [orInputs, setOrInputs] = useState([false, false])
  const [notInput, setNotInput] = useState([false])
  const [hasInteractedWithGate, setHasInteractedWithGate] = useState(false)
  const [currentGateType, setCurrentGateType] = useState<'AND' | 'OR' | 'NOT'>('AND')
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [showLogicGateCard, setShowLogicGateCard] = useState(true)
  const [showAndCard, setShowAndCard] = useState(true)
  const [showOrCard, setShowOrCard] = useState(true)
  const [showNotCard, setShowNotCard] = useState(true)
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  
  // Phase dialogs
  const phaseDialogs = {
    'slide-1': [
      { id: '1', npc: 'ECHELON' as const, text: "Now that you understand TRUE and FALSE, let's combine them!", requiresInteraction: true }
    ],
    'slide-2': [
      { id: '2a', npc: 'ECHELON' as const, text: "Logic gates are the building blocks of all digital circuits.", requiresInteraction: false },
      { id: '2b', npc: 'ECHELON' as const, text: "They take two separate binary inputs and produce one binary output based on simple rules.", requiresInteraction: false },
      { id: '2c', npc: 'ECHELON' as const, text: "Think of them as decision-makers that follow specific patterns.", requiresInteraction: true }
    ],
    'slide-3': [
      { id: '3a', npc: 'ECHELON' as const, text: "Let's start with the AND gate.", requiresInteraction: false },
      { id: '3b', npc: 'ECHELON' as const, text: "AND only outputs TRUE when ALL inputs are TRUE.", requiresInteraction: false },
      { id: '3c', npc: 'ECHELON' as const, text: "Try different input combinations and watch the output.", requiresInteraction: true }
    ],
    'slide-4': [
      { id: '4a', npc: 'ECHELON' as const, text: "See how AND works? Both inputs must be 1 to get 1 out.", requiresInteraction: false },
      { id: '4b', npc: 'ECHELON' as const, text: "It's like a security system - you need BOTH a password AND a fingerprint.", requiresInteraction: true }
    ],
    'slide-5': [
      { id: '5a', npc: 'ECHELON' as const, text: "Now let's explore the OR gate.", requiresInteraction: false },
      { id: '5b', npc: 'ECHELON' as const, text: "OR outputs TRUE when AT LEAST ONE input is TRUE.", requiresInteraction: false },
      { id: '5c', npc: 'ECHELON' as const, text: "Try it out - notice how it's more permissive than AND.", requiresInteraction: true }
    ],
    'slide-6': [
      { id: '6a', npc: 'ECHELON' as const, text: "OR is like a search function - find by name OR email.", requiresInteraction: false },
      { id: '6b', npc: 'ECHELON' as const, text: "As long as one condition is met, you get a result.", requiresInteraction: true }
    ],
    'slide-7': [
      { id: '7a', npc: 'ECHELON' as const, text: "The NOT gate is unique - it has only one input.", requiresInteraction: false },
      { id: '7b', npc: 'ECHELON' as const, text: "It simply flips the input: TRUE becomes FALSE, FALSE becomes TRUE.", requiresInteraction: false },
      { id: '7c', npc: 'ECHELON' as const, text: "Try toggling the input and see how it inverts.", requiresInteraction: true }
    ],
    'slide-8': [
      { id: '8a', npc: 'ECHELON' as const, text: "NOT is like a silent mode switch - when silent is ON, sound is OFF.", requiresInteraction: false },
      { id: '8b', npc: 'ECHELON' as const, text: "It always gives you the opposite of what goes in.", requiresInteraction: true }
    ],
    'slide-9': [
      { id: '9a', npc: 'ECHELON' as const, text: "Here's where it gets interesting - we can combine gates!", requiresInteraction: false },
      { id: '9b', npc: 'ECHELON' as const, text: "By connecting gates together, we create complex logic circuits.", requiresInteraction: false },
      { id: '9c', npc: 'ECHELON' as const, text: "Try this circuit: (A AND B) OR C", requiresInteraction: true }
    ],
    'slide-10': [
      { id: '10a', npc: 'ECHELON' as const, text: "Every computer chip contains millions of these gates.", requiresInteraction: false },
      { id: '10b', npc: 'ECHELON' as const, text: "They work together to process data, make decisions, and run programs.", requiresInteraction: false },
      { id: '10c', npc: 'ECHELON' as const, text: "From simple gates, we build the entire digital world!", requiresInteraction: true }
    ],
    'slide-11': [
      { id: '11a', npc: 'ECHELON' as const, text: "You've mastered the three fundamental logic gates!", requiresInteraction: false },
      { id: '11b', npc: 'ECHELON' as const, text: "AND requires all, OR requires any, NOT flips the input.", requiresInteraction: false },
      { id: '11c', npc: 'ECHELON' as const, text: "Next, we'll learn how to map out all possibilities with state tables!", requiresInteraction: true }
    ]
  }
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  // Concept definitions
  const logicGateConcept: Concept = {
    id: 'logic-gate',
    name: 'Logic Gate',
    definition: 'A digital circuit that performs a binary operation on one or more inputs to produce a single output.',
    whyItMatters: 'Logic gates are the fundamental building blocks of all digital electronics. Every computer, smartphone, and digital device is built from millions of these simple components working together.',
    demonstration: (
      <div className="flex justify-center">
        <InteractiveGate 
          type="AND" 
          inputs={[true, false]} 
          onInputChange={() => {}} 
          showOutput={true}
        />
      </div>
    ),
    properties: [
      {
        id: 'and-gate',
        name: 'AND Gate',
        description: 'Outputs TRUE only when ALL inputs are TRUE',
        whyItMatters: 'AND gates enforce strict requirements - perfect for security systems where multiple conditions must be met.',
        demonstration: (
          <div className="space-y-4">
            <StateTable gateType="AND" />
            <p className="text-white/60 text-sm text-center">All inputs must be 1 to output 1</p>
          </div>
        )
      },
      {
        id: 'or-gate',
        name: 'OR Gate',
        description: 'Outputs TRUE when AT LEAST ONE input is TRUE',
        whyItMatters: 'OR gates provide flexibility - useful for systems where any of several conditions can trigger an action.',
        demonstration: (
          <div className="space-y-4">
            <StateTable gateType="OR" />
            <p className="text-white/60 text-sm text-center">Any input of 1 produces output 1</p>
          </div>
        )
      },
      {
        id: 'not-gate',
        name: 'NOT Gate',
        description: 'Outputs the opposite of its input',
        whyItMatters: 'NOT gates invert signals - essential for creating complementary states and toggle functionality.',
        demonstration: (
          <div className="space-y-4">
            <StateTable gateType="NOT" />
            <p className="text-white/60 text-sm text-center">Always outputs the opposite</p>
          </div>
        )
      }
    ]
  }
  
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
  
  const addUserNote = (note: string) => {
    addNotebookEntry({
      type: 'note',
      title: 'Personal Note',
      content: note
    })
  }
  
  const handleNotebookEntryClick = (entry: NotebookEntry) => {
    if (entry.title === 'Logic Gate' || entry.title === 'AND Gate' || entry.title === 'OR Gate' || entry.title === 'NOT Gate') {
      setViewingConcept(logicGateConcept)
      setShowConceptViewer(true)
    }
  }
  
  const handleGateInteraction = (gateType: 'AND' | 'OR' | 'NOT') => {
    if (!hasInteractedWithGate) {
      setHasInteractedWithGate(true)
    }
    setCurrentGateType(gateType)
  }
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
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
          break
        case 'slide-8':
          setCurrentPhase('slide-9')
          setCurrentDialogIndex(0)
          break
        case 'slide-9':
          setCurrentPhase('slide-10')
          setCurrentDialogIndex(0)
          break
        case 'slide-10':
          setCurrentPhase('slide-11')
          setCurrentDialogIndex(0)
          break
        case 'slide-11':
          handleLessonComplete()
          break
      }
    }
  }
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      const phaseOrder: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10', 'slide-11']
      const currentIndex = phaseOrder.indexOf(currentPhase)
      if (currentIndex > 0) {
        const prevPhase = phaseOrder[currentIndex - 1]
        setCurrentPhase(prevPhase)
        const prevDialogs = phaseDialogs[prevPhase]
        setCurrentDialogIndex(prevDialogs.length - 1)
      }
    }
  }
  
  const handleLessonComplete = async () => {
    const stardustEarned = 25
    await addStardust(stardustEarned)
    setEarnedStardust(stardustEarned)
    setShowCompletionScreen(true)
  }
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar currentPage="Logic Gates" />
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          
          {/* Slide 1 - Welcome */}
          {currentPhase === 'slide-1' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <Zap className="w-32 h-32 text-cosmic-aurora mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-white mb-4">Logic Gates</h1>
                <p className="text-white/60 text-lg">Combining TRUE and FALSE to make decisions</p>
              </div>
            </m.div>
          )}
          
          {/* Slide 2 - Introduction */}
          {currentPhase === 'slide-2' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="grid grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="w-32 h-32 flex items-center justify-center mb-4">
                    <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                      <path 
                        d="M 30 20 L 60 20 C 80 20 100 40 100 60 C 100 80 80 100 60 100 L 30 100 Z" 
                        fill="#3b82f6"
                        fillOpacity="0.2"
                        stroke="#60a5fa"
                        strokeWidth="3"
                      />
                      <text x="60" y="65" textAnchor="middle" fill="#60a5fa" className="text-xl font-bold" transform="rotate(90 60 65)">
                        AND
                      </text>
                    </svg>
                  </div>
                  <p className="text-white/60">All must be true</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 flex items-center justify-center mb-4">
                    <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                      <path 
                        d="M 30 20 Q 40 20 50 20 C 75 20 100 40 100 60 C 100 80 75 100 50 100 Q 40 100 30 100 Q 45 60 30 20" 
                        fill="#10b981"
                        fillOpacity="0.2"
                        stroke="#34d399"
                        strokeWidth="3"
                      />
                      <text x="60" y="65" textAnchor="middle" fill="#34d399" className="text-xl font-bold" transform="rotate(90 60 65)">
                        OR
                      </text>
                    </svg>
                  </div>
                  <p className="text-white/60">Any can be true</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 flex items-center justify-center mb-4">
                    <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                      <path 
                        d="M 40 30 L 80 60 L 40 90 Z" 
                        fill="#a855f7"
                        fillOpacity="0.2"
                        stroke="#c084fc"
                        strokeWidth="3"
                      />
                      <circle 
                        cx="90" 
                        cy="60" 
                        r="10" 
                        fill="#a855f7"
                        fillOpacity="0.2"
                        stroke="#c084fc"
                        strokeWidth="3"
                      />
                      <text x="60" y="65" textAnchor="middle" fill="#c084fc" className="text-lg font-bold" transform="rotate(90 60 65)">
                        NOT
                      </text>
                    </svg>
                  </div>
                  <p className="text-white/60">Flips the value</p>
                </div>
              </div>
            </m.div>
          )}
          
          {/* Slide 3 - AND Gate Interactive */}
          {currentPhase === 'slide-3' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="space-y-8">
                <InteractiveGate
                  type="AND"
                  inputs={andInputs}
                  onInputChange={(index, value) => {
                    const newInputs = [...andInputs]
                    newInputs[index] = value
                    setAndInputs(newInputs)
                    handleGateInteraction('AND')
                  }}
                  showOutput={true}
                />
                <StateTable gateType="AND" />
              </div>
            </m.div>
          )}
          
          {/* Slide 4 - AND Real World */}
          {currentPhase === 'slide-4' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <RealWorldExample type="security" />
            </m.div>
          )}
          
          {/* Slide 5 - OR Gate Interactive */}
          {currentPhase === 'slide-5' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="space-y-8">
                <InteractiveGate
                  type="OR"
                  inputs={orInputs}
                  onInputChange={(index, value) => {
                    const newInputs = [...orInputs]
                    newInputs[index] = value
                    setOrInputs(newInputs)
                    handleGateInteraction('OR')
                  }}
                  showOutput={true}
                />
                <StateTable gateType="OR" />
              </div>
            </m.div>
          )}
          
          {/* Slide 6 - OR Real World */}
          {currentPhase === 'slide-6' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <RealWorldExample type="search" />
            </m.div>
          )}
          
          {/* Slide 7 - NOT Gate Interactive */}
          {currentPhase === 'slide-7' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="space-y-8">
                <InteractiveGate
                  type="NOT"
                  inputs={notInput}
                  onInputChange={(index, value) => {
                    setNotInput([value])
                    handleGateInteraction('NOT')
                  }}
                  showOutput={true}
                />
                <StateTable gateType="NOT" />
              </div>
            </m.div>
          )}
          
          {/* Slide 8 - NOT Real World */}
          {currentPhase === 'slide-8' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <RealWorldExample type="alarm" />
            </m.div>
          )}
          
          {/* Slide 9 - Combined Gates */}
          {currentPhase === 'slide-9' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <CombinedGatesDemo />
            </m.div>
          )}
          
          {/* Slide 10 - Real Applications */}
          {currentPhase === 'slide-10' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center max-w-2xl">
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[...Array(32)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded flex items-center justify-center text-xs font-mono ${
                        Math.random() > 0.5 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : Math.random() > 0.5
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {Math.random() > 0.5 ? 'AND' : Math.random() > 0.5 ? 'OR' : 'NOT'}
                    </div>
                  ))}
                </div>
                <p className="text-white/80 text-lg">
                  Billions of gates working together
                </p>
                <p className="text-white/60 mt-2">
                  create the technology we use every day
                </p>
              </div>
            </m.div>
          )}
          
          {/* Slide 11 - Summary */}
          {currentPhase === 'slide-11' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <CheckCircle2 className="w-24 h-24 text-green-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Gates Mastered!</h2>
                <div className="flex justify-center gap-8 mt-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-blue-400">AND</span>
                    </div>
                    <p className="text-white/60 text-sm">All inputs</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-green-400">OR</span>
                    </div>
                    <p className="text-white/60 text-sm">Any input</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-purple-400">NOT</span>
                    </div>
                    <p className="text-white/60 text-sm">Opposite</p>
                  </div>
                </div>
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
            (currentPhase === 'slide-2' && currentDialogIndex === 2 && showLogicGateCard) ||
            (currentPhase === 'slide-3' && currentDialogIndex === 1 && showAndCard) ||
            (currentPhase === 'slide-5' && currentDialogIndex === 1 && showOrCard) ||
            (currentPhase === 'slide-7' && currentDialogIndex === 1 && showNotCard) ? 3 : 0
          }
        />
      )}
      
      {/* Logic Gate concept card */}
      {currentPhase === 'slide-2' && currentDialogIndex === 2 && showLogicGateCard && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              // Add to dictionary and notebook without hiding the card
              dictionaryService.addEntry({
                id: 'logic-gate',
                term: 'Logic Gate',
                definition: 'A digital circuit that performs a binary operation on inputs to produce an output.',
                category: 'computer-science',
                relatedTerms: ['binary', 'circuit', 'AND', 'OR', 'NOT'],
                examples: ['AND gate outputs 1 only when all inputs are 1'],
                visualAid: 'Circuit symbols showing AND, OR, and NOT gates'
              })
              addNotebookEntry({
                type: 'definition',
                title: 'Logic Gate',
                content: 'A digital circuit that performs binary operations'
              })
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto"
          >
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-cosmic-aurora/50 shadow-xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={() => setShowLogicGateCard(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-cosmic-aurora/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-cosmic-aurora" />
                  </div>
                  <div className="flex-1">
                    <p className="text-cosmic-aurora text-sm font-medium mb-1">CONCEPT UNLOCKED</p>
                    <h3 className="text-white text-2xl font-bold">Logic Gate</h3>
                  </div>
                </div>
              </div>
              <div className="relative px-6 pb-6">
                <p className="text-white/80 mb-4">
                  Digital circuits that process binary values to make decisions
                </p>
                <div className="flex items-center gap-2 text-cosmic-aurora">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Added to Archive & Notebook</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* AND Gate card */}
      {currentPhase === 'slide-3' && currentDialogIndex === 1 && showAndCard && (
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
              addNotebookEntry({
                type: 'property',
                title: 'AND Gate',
                content: 'Outputs TRUE only when ALL inputs are TRUE'
              })
            }}
            className="relative max-w-xs w-full pointer-events-auto"
          >
            <div className="relative bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-blue-500/50 shadow-xl overflow-hidden">
              <button
                onClick={() => setShowAndCard(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">AND</span>
                  </div>
                  <div>
                    <p className="text-blue-400 text-xs font-medium">GATE TYPE</p>
                    <h3 className="text-white text-base font-bold">AND Gate</h3>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <p className="text-white/80 text-xs leading-relaxed">
                  All inputs must be TRUE for output to be TRUE
                </p>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* OR Gate card */}
      {currentPhase === 'slide-5' && currentDialogIndex === 1 && showOrCard && (
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
              addNotebookEntry({
                type: 'property',
                title: 'OR Gate',
                content: 'Outputs TRUE when AT LEAST ONE input is TRUE'
              })
            }}
            className="relative max-w-xs w-full pointer-events-auto"
          >
            <div className="relative bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-green-500/50 shadow-xl overflow-hidden">
              <button
                onClick={() => setShowOrCard(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">OR</span>
                  </div>
                  <div>
                    <p className="text-green-400 text-xs font-medium">GATE TYPE</p>
                    <h3 className="text-white text-base font-bold">OR Gate</h3>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <p className="text-white/80 text-xs leading-relaxed">
                  Any input being TRUE makes output TRUE
                </p>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* NOT Gate card */}
      {currentPhase === 'slide-7' && currentDialogIndex === 1 && showNotCard && (
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
              addNotebookEntry({
                type: 'property',
                title: 'NOT Gate',
                content: 'Outputs the opposite of its input'
              })
            }}
            className="relative max-w-xs w-full pointer-events-auto"
          >
            <div className="relative bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-purple-500/50 shadow-xl overflow-hidden">
              <button
                onClick={() => setShowNotCard(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-sm">NOT</span>
                  </div>
                  <div>
                    <p className="text-purple-400 text-xs font-medium">GATE TYPE</p>
                    <h3 className="text-white text-base font-bold">NOT Gate</h3>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <p className="text-white/80 text-xs leading-relaxed">
                  Inverts the input - TRUE becomes FALSE and vice versa
                </p>
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
              You've mastered the fundamental logic gates!
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-white/60 mb-2">Stardust Earned</p>
              <p className="text-2xl font-bold text-cosmic-aurora">+{earnedStardust}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/truth-tables')}
                className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-aurora to-cosmic-starlight text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Continue to State Tables
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

export default function LogicGatesPage() {
  return (
    <ProtectedRoute>
      <LogicGatesContent />
    </ProtectedRoute>
  )
}