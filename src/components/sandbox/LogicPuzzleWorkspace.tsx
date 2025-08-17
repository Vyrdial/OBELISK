'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, MousePointer2, X, Play, Pause, SkipForward, 
  AlertCircle, ChevronRight, Grid, CheckCircle2, Trophy, 
  Lightbulb, RefreshCw, Lock, Star, Target, Zap, Users,
  Calculator, Shield, Gauge, Timer, HelpCircle
} from 'lucide-react'

// Import types from the original workspace
type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'SWITCH' | 'OUTPUT'
type ConnectionPoint = 'input1' | 'input2' | 'output'

interface LogicGate {
  id: string
  type: GateType
  x: number
  y: number
  inputs: { input1?: boolean; input2?: boolean }
  output: boolean
  label?: string
  locked?: boolean // For puzzle mode - some gates can't be moved/deleted
}

interface Connection {
  id: string
  from: { gateId: string; point: ConnectionPoint }
  to: { gateId: string; point: ConnectionPoint }
}

// Puzzle-specific types
interface PuzzleDefinition {
  id: string
  name: string
  description: string
  difficulty: 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert'
  category: string
  inventory: { type: GateType; count: number }[] // Available gates
  initialGates?: LogicGate[] // Pre-placed gates (locked)
  initialConnections?: Connection[] // Pre-placed connections
  testCases: TestCase[] // Input/output combinations to check
  hints: string[]
  solution?: { gates: LogicGate[]; connections: Connection[] } // For hint system
  stars: { moves: number; gates: number; time: number } // Thresholds for star ratings
}

interface TestCase {
  inputs: { [switchId: string]: boolean }
  expectedOutputs: { [outputId: string]: boolean }
  description?: string // e.g., "Both players vote yes"
}

// Gate configurations (same as original)
const GATE_CONFIG = {
  AND: { 
    symbol: 'AND', 
    color: 'from-violet-500/20 to-violet-600/20',
    borderColor: 'border-violet-500/50',
    glowColor: 'violet',
    logic: (a: boolean, b: boolean) => a && b,
    inputs: 2
  },
  OR: { 
    symbol: 'OR', 
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/50',
    glowColor: 'blue',
    logic: (a: boolean, b: boolean) => a || b,
    inputs: 2
  },
  NOT: { 
    symbol: 'NOT', 
    color: 'from-rose-500/20 to-rose-600/20',
    borderColor: 'border-rose-500/50',
    glowColor: 'rose',
    logic: (a: boolean) => !a,
    inputs: 1
  },
  XOR: { 
    symbol: 'XOR', 
    color: 'from-teal-500/20 to-teal-600/20',
    borderColor: 'border-teal-500/50',
    glowColor: 'teal',
    logic: (a: boolean, b: boolean) => a !== b,
    inputs: 2
  },
  NAND: { 
    symbol: 'NAND', 
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'purple',
    logic: (a: boolean, b: boolean) => !(a && b),
    inputs: 2
  },
  NOR: { 
    symbol: 'NOR', 
    color: 'from-indigo-500/20 to-indigo-600/20',
    borderColor: 'border-indigo-500/50',
    glowColor: 'indigo',
    logic: (a: boolean, b: boolean) => !(a || b),
    inputs: 2
  },
  SWITCH: {
    symbol: 'IN',
    color: 'from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/50',
    glowColor: 'amber',
    logic: (state: boolean) => state,
    inputs: 0
  },
  OUTPUT: {
    symbol: 'OUT',
    color: 'from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/50',
    glowColor: 'emerald',
    logic: (a: boolean) => a,
    inputs: 1
  }
}

// Puzzle definitions
const PUZZLES: PuzzleDefinition[] = [
  // Tutorial puzzles
  {
    id: 'tut-1',
    name: 'Wire an AND Gate',
    description: 'Connect two switches to an AND gate, then to the output.',
    difficulty: 'tutorial',
    category: 'Basics',
    inventory: [{ type: 'AND', count: 1 }],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 100, y: 150, inputs: {}, output: false, label: 'A', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 100, y: 250, inputs: {}, output: false, label: 'B', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 500, y: 200, inputs: { input1: false }, output: false, label: 'Result', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false }, expectedOutputs: { out1: false } },
      { inputs: { sw1: true, sw2: false }, expectedOutputs: { out1: false } },
      { inputs: { sw1: false, sw2: true }, expectedOutputs: { out1: false } },
      { inputs: { sw1: true, sw2: true }, expectedOutputs: { out1: true } }
    ],
    hints: [
      'Place the AND gate between the switches and output',
      'Connect both switches to the AND gate inputs',
      'Connect the AND gate output to the result'
    ],
    stars: { moves: 10, gates: 1, time: 60 }
  },
  {
    id: 'tut-2',
    name: 'Wire an OR Gate',
    description: 'Either switch should activate the output.',
    difficulty: 'tutorial',
    category: 'Basics',
    inventory: [{ type: 'OR', count: 1 }],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 100, y: 150, inputs: {}, output: false, label: 'A', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 100, y: 250, inputs: {}, output: false, label: 'B', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 500, y: 200, inputs: { input1: false }, output: false, label: 'Result', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false }, expectedOutputs: { out1: false } },
      { inputs: { sw1: true, sw2: false }, expectedOutputs: { out1: true } },
      { inputs: { sw1: false, sw2: true }, expectedOutputs: { out1: true } },
      { inputs: { sw1: true, sw2: true }, expectedOutputs: { out1: true } }
    ],
    hints: [
      'OR gates output true when at least one input is true',
      'Connect both switches to the OR gate'
    ],
    stars: { moves: 10, gates: 1, time: 60 }
  },
  {
    id: 'tut-3',
    name: 'Invert a Signal',
    description: 'Make the output opposite of the input.',
    difficulty: 'tutorial',
    category: 'Basics',
    inventory: [{ type: 'NOT', count: 1 }],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 100, y: 200, inputs: {}, output: false, label: 'Input', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 500, y: 200, inputs: { input1: false }, output: false, label: 'Inverted', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false }, expectedOutputs: { out1: true } },
      { inputs: { sw1: true }, expectedOutputs: { out1: false } }
    ],
    hints: [
      'NOT gates flip the input signal',
      'Place the NOT gate between input and output'
    ],
    stars: { moves: 6, gates: 1, time: 30 }
  },
  
  // Easy puzzles
  {
    id: 'easy-1',
    name: 'Majority Vote',
    description: 'Output true when at least 2 out of 3 inputs are true.',
    difficulty: 'easy',
    category: 'Democracy',
    inventory: [
      { type: 'AND', count: 3 },
      { type: 'OR', count: 2 }
    ],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 50, y: 100, inputs: {}, output: false, label: 'Vote A', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 50, y: 200, inputs: {}, output: false, label: 'Vote B', locked: true },
      { id: 'sw3', type: 'SWITCH', x: 50, y: 300, inputs: {}, output: false, label: 'Vote C', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 600, y: 200, inputs: { input1: false }, output: false, label: 'Passed', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false, sw3: false }, expectedOutputs: { out1: false }, description: 'No votes' },
      { inputs: { sw1: true, sw2: false, sw3: false }, expectedOutputs: { out1: false }, description: 'One vote' },
      { inputs: { sw1: true, sw2: true, sw3: false }, expectedOutputs: { out1: true }, description: 'Two votes' },
      { inputs: { sw1: true, sw2: true, sw3: true }, expectedOutputs: { out1: true }, description: 'All votes' }
    ],
    hints: [
      'Check all pairs of inputs with AND gates',
      'Combine the AND results with OR gates',
      'A∧B ∨ A∧C ∨ B∧C'
    ],
    stars: { moves: 20, gates: 5, time: 120 }
  },
  {
    id: 'easy-2',
    name: 'Security System',
    description: 'Alarm triggers if door opens AND motion detected, OR if window breaks.',
    difficulty: 'easy',
    category: 'Real World',
    inventory: [
      { type: 'AND', count: 1 },
      { type: 'OR', count: 1 }
    ],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 50, y: 100, inputs: {}, output: false, label: 'Door', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 50, y: 200, inputs: {}, output: false, label: 'Motion', locked: true },
      { id: 'sw3', type: 'SWITCH', x: 50, y: 300, inputs: {}, output: false, label: 'Window', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 600, y: 200, inputs: { input1: false }, output: false, label: 'Alarm', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false, sw3: false }, expectedOutputs: { out1: false } },
      { inputs: { sw1: true, sw2: false, sw3: false }, expectedOutputs: { out1: false } },
      { inputs: { sw1: true, sw2: true, sw3: false }, expectedOutputs: { out1: true } },
      { inputs: { sw1: false, sw2: false, sw3: true }, expectedOutputs: { out1: true } }
    ],
    hints: [
      'Door AND Motion should trigger alarm',
      'Window alone should trigger alarm',
      '(Door ∧ Motion) ∨ Window'
    ],
    stars: { moves: 15, gates: 2, time: 90 }
  },
  
  // Medium puzzles
  {
    id: 'med-1',
    name: 'XOR from Scratch',
    description: 'Build an XOR gate using only AND, OR, and NOT gates.',
    difficulty: 'medium',
    category: 'Construction',
    inventory: [
      { type: 'AND', count: 2 },
      { type: 'OR', count: 1 },
      { type: 'NOT', count: 2 }
    ],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 50, y: 150, inputs: {}, output: false, label: 'A', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 50, y: 250, inputs: {}, output: false, label: 'B', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 600, y: 200, inputs: { input1: false }, output: false, label: 'A⊕B', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false }, expectedOutputs: { out1: false } },
      { inputs: { sw1: true, sw2: false }, expectedOutputs: { out1: true } },
      { inputs: { sw1: false, sw2: true }, expectedOutputs: { out1: true } },
      { inputs: { sw1: true, sw2: true }, expectedOutputs: { out1: false } }
    ],
    hints: [
      'XOR is true when inputs are different',
      'Try: (A OR B) AND NOT(A AND B)',
      'Or: (A AND NOT B) OR (NOT A AND B)'
    ],
    stars: { moves: 25, gates: 5, time: 180 }
  },
  {
    id: 'med-2',
    name: 'Half Adder',
    description: 'Create a circuit that adds two bits, producing sum and carry.',
    difficulty: 'medium',
    category: 'Arithmetic',
    inventory: [
      { type: 'XOR', count: 1 },
      { type: 'AND', count: 1 }
    ],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 50, y: 150, inputs: {}, output: false, label: 'Bit A', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 50, y: 250, inputs: {}, output: false, label: 'Bit B', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 600, y: 150, inputs: { input1: false }, output: false, label: 'Sum', locked: true },
      { id: 'out2', type: 'OUTPUT', x: 600, y: 250, inputs: { input1: false }, output: false, label: 'Carry', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false }, expectedOutputs: { out1: false, out2: false }, description: '0+0=0' },
      { inputs: { sw1: true, sw2: false }, expectedOutputs: { out1: true, out2: false }, description: '1+0=1' },
      { inputs: { sw1: false, sw2: true }, expectedOutputs: { out1: true, out2: false }, description: '0+1=1' },
      { inputs: { sw1: true, sw2: true }, expectedOutputs: { out1: false, out2: true }, description: '1+1=10' }
    ],
    hints: [
      'Sum is XOR of the inputs',
      'Carry is AND of the inputs',
      'This is the basis of binary addition!'
    ],
    stars: { moves: 10, gates: 2, time: 90 }
  },
  
  // Hard puzzles
  {
    id: 'hard-1',
    name: 'Priority Encoder',
    description: 'Output the highest priority input that is active (C > B > A).',
    difficulty: 'hard',
    category: 'Encoding',
    inventory: [
      { type: 'AND', count: 2 },
      { type: 'NOT', count: 2 },
      { type: 'OR', count: 1 }
    ],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 50, y: 100, inputs: {}, output: false, label: 'A (Low)', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 50, y: 200, inputs: {}, output: false, label: 'B (Med)', locked: true },
      { id: 'sw3', type: 'SWITCH', x: 50, y: 300, inputs: {}, output: false, label: 'C (High)', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 600, y: 150, inputs: { input1: false }, output: false, label: 'Bit 0', locked: true },
      { id: 'out2', type: 'OUTPUT', x: 600, y: 250, inputs: { input1: false }, output: false, label: 'Bit 1', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false, sw3: false }, expectedOutputs: { out1: false, out2: false }, description: 'None: 00' },
      { inputs: { sw1: true, sw2: false, sw3: false }, expectedOutputs: { out1: true, out2: false }, description: 'A: 01' },
      { inputs: { sw1: true, sw2: true, sw3: false }, expectedOutputs: { out1: false, out2: true }, description: 'B wins: 10' },
      { inputs: { sw1: true, sw2: true, sw3: true }, expectedOutputs: { out1: true, out2: true }, description: 'C wins: 11' }
    ],
    hints: [
      'Higher priority inputs override lower ones',
      'Use NOT gates to disable lower priorities',
      'Think about how to encode the winner'
    ],
    stars: { moves: 30, gates: 5, time: 240 }
  },
  
  // Expert puzzle
  {
    id: 'expert-1',
    name: 'Universal NAND',
    description: 'Build AND, OR, and NOT gates using only NAND gates.',
    difficulty: 'expert',
    category: 'Theory',
    inventory: [
      { type: 'NAND', count: 7 }
    ],
    initialGates: [
      { id: 'sw1', type: 'SWITCH', x: 50, y: 100, inputs: {}, output: false, label: 'A', locked: true },
      { id: 'sw2', type: 'SWITCH', x: 50, y: 200, inputs: {}, output: false, label: 'B', locked: true },
      { id: 'out1', type: 'OUTPUT', x: 600, y: 100, inputs: { input1: false }, output: false, label: 'NOT A', locked: true },
      { id: 'out2', type: 'OUTPUT', x: 600, y: 200, inputs: { input1: false }, output: false, label: 'A AND B', locked: true },
      { id: 'out3', type: 'OUTPUT', x: 600, y: 300, inputs: { input1: false }, output: false, label: 'A OR B', locked: true }
    ],
    testCases: [
      { inputs: { sw1: false, sw2: false }, expectedOutputs: { out1: true, out2: false, out3: false } },
      { inputs: { sw1: true, sw2: false }, expectedOutputs: { out1: false, out2: false, out3: true } },
      { inputs: { sw1: false, sw2: true }, expectedOutputs: { out1: true, out2: false, out3: true } },
      { inputs: { sw1: true, sw2: true }, expectedOutputs: { out1: false, out2: true, out3: true } }
    ],
    hints: [
      'NAND with both inputs tied together makes NOT',
      'NAND followed by NOT makes AND',
      'De Morgan\'s law: NOT(A AND B) = NOT A OR NOT B'
    ],
    stars: { moves: 40, gates: 7, time: 300 }
  }
]

interface LogicPuzzleWorkspaceProps {
  puzzleId?: string
  onComplete?: (stars: number) => void
}

export default function LogicPuzzleWorkspace({ puzzleId, onComplete }: LogicPuzzleWorkspaceProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleDefinition>(
    PUZZLES.find(p => p.id === puzzleId) || PUZZLES[0]
  )
  
  // Core state
  const [gates, setGates] = useState<LogicGate[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<{ gateId: string; point: ConnectionPoint } | null>(null)
  const [draggingGate, setDraggingGate] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredGate, setHoveredGate] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Puzzle state
  const [inventory, setInventory] = useState<{ type: GateType; count: number }[]>([])
  const [testResults, setTestResults] = useState<{ passed: boolean; description?: string }[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState(Date.now())
  const [stars, setStars] = useState(0)
  
  const workspaceRef = useRef<HTMLDivElement>(null)
  const GRID_SIZE = 20
  
  // Initialize puzzle
  useEffect(() => {
    const puzzle = PUZZLES.find(p => p.id === puzzleId) || PUZZLES[0]
    setCurrentPuzzle(puzzle)
    setGates(puzzle.initialGates || [])
    setConnections(puzzle.initialConnections || [])
    setInventory([...puzzle.inventory])
    setTestResults([])
    setIsComplete(false)
    setShowHint(false)
    setCurrentHintIndex(0)
    setMoves(0)
    setStartTime(Date.now())
  }, [puzzleId])
  
  // Snap to grid
  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE
  
  // Calculate outputs
  const calculateOutputs = useCallback(() => {
    setGates(currentGates => {
      const newGates = [...currentGates]
      const connectionMap = new Map<string, boolean>()
      
      // First pass: collect all outputs
      newGates.forEach(gate => {
        if (gate.type === 'SWITCH' || gate.output) {
          connections.forEach(conn => {
            if (conn.from.gateId === gate.id && conn.from.point === 'output') {
              connectionMap.set(`${conn.to.gateId}-${conn.to.point}`, gate.output)
            }
          })
        }
      })
      
      // Update gates in topological order
      let changed = true
      let iterations = 0
      while (changed && iterations < 20) {
        changed = false
        iterations++
        
        newGates.forEach(gate => {
          if (gate.type === 'SWITCH') return
          
          const oldOutput = gate.output
          
          // Update inputs from connections
          const input1Key = `${gate.id}-input1`
          const input2Key = `${gate.id}-input2`
          
          gate.inputs.input1 = connectionMap.get(input1Key) || false
          if (gate.type !== 'NOT' && gate.type !== 'OUTPUT') {
            gate.inputs.input2 = connectionMap.get(input2Key) || false
          }
          
          // Calculate output
          const config = GATE_CONFIG[gate.type]
          if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
            gate.output = config.logic(gate.inputs.input1 || false)
          } else if (gate.type !== 'SWITCH') {
            gate.output = config.logic(gate.inputs.input1 || false, gate.inputs.input2 || false)
          }
          
          // Update connection map if output changed
          if (gate.output !== oldOutput) {
            changed = true
            connections.forEach(conn => {
              if (conn.from.gateId === gate.id && conn.from.point === 'output') {
                connectionMap.set(`${conn.to.gateId}-${conn.to.point}`, gate.output)
              }
            })
          }
        })
      }
      
      return newGates
    })
  }, [connections])
  
  useEffect(() => {
    calculateOutputs()
  }, [calculateOutputs])
  
  // Run tests
  const runTests = useCallback(() => {
    const results: { passed: boolean; description?: string }[] = []
    
    currentPuzzle.testCases.forEach(testCase => {
      // Set switch states
      const testGates = [...gates]
      Object.entries(testCase.inputs).forEach(([switchId, value]) => {
        const gate = testGates.find(g => g.id === switchId)
        if (gate) gate.output = value
      })
      
      // Calculate outputs with test inputs
      const connectionMap = new Map<string, boolean>()
      let changed = true
      let iterations = 0
      
      while (changed && iterations < 20) {
        changed = false
        iterations++
        
        testGates.forEach(gate => {
          if (gate.type === 'SWITCH') {
            connections.forEach(conn => {
              if (conn.from.gateId === gate.id && conn.from.point === 'output') {
                connectionMap.set(`${conn.to.gateId}-${conn.to.point}`, gate.output)
              }
            })
            return
          }
          
          const oldOutput = gate.output
          
          // Update inputs
          const input1Key = `${gate.id}-input1`
          const input2Key = `${gate.id}-input2`
          
          gate.inputs.input1 = connectionMap.get(input1Key) || false
          if (gate.type !== 'NOT' && gate.type !== 'OUTPUT') {
            gate.inputs.input2 = connectionMap.get(input2Key) || false
          }
          
          // Calculate output
          const config = GATE_CONFIG[gate.type]
          if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
            gate.output = config.logic(gate.inputs.input1 || false)
          } else if (gate.type !== 'SWITCH') {
            gate.output = config.logic(gate.inputs.input1 || false, gate.inputs.input2 || false)
          }
          
          if (gate.output !== oldOutput) {
            changed = true
            connections.forEach(conn => {
              if (conn.from.gateId === gate.id && conn.from.point === 'output') {
                connectionMap.set(`${conn.to.gateId}-${conn.to.point}`, gate.output)
              }
            })
          }
        })
      }
      
      // Check outputs
      let passed = true
      Object.entries(testCase.expectedOutputs).forEach(([outputId, expected]) => {
        const gate = testGates.find(g => g.id === outputId)
        if (!gate || gate.output !== expected) {
          passed = false
        }
      })
      
      results.push({ passed, description: testCase.description })
    })
    
    setTestResults(results)
    
    // Check if puzzle is complete
    if (results.every(r => r.passed)) {
      const timeElapsed = (Date.now() - startTime) / 1000
      const gatesUsed = gates.filter(g => !g.locked).length
      
      let earnedStars = 1 // Base star for completion
      if (moves <= currentPuzzle.stars.moves) earnedStars++
      if (gatesUsed <= currentPuzzle.stars.gates) earnedStars++
      if (timeElapsed <= currentPuzzle.stars.time) earnedStars++
      
      setStars(earnedStars)
      setIsComplete(true)
      onComplete?.(earnedStars)
    }
  }, [gates, connections, currentPuzzle, startTime, moves, onComplete])
  
  // Add gate from inventory
  const addGateFromInventory = (type: GateType, x: number, y: number) => {
    const inventoryItem = inventory.find(i => i.type === type && i.count > 0)
    if (!inventoryItem) return
    
    const newGate: LogicGate = {
      id: `gate-${Date.now()}`,
      type,
      x: snapToGrid(x),
      y: snapToGrid(y),
      inputs: {},
      output: false
    }
    
    setGates([...gates, newGate])
    setInventory(inv => inv.map(i => 
      i.type === type ? { ...i, count: i.count - 1 } : i
    ))
    setMoves(moves + 1)
  }
  
  // Delete gate (return to inventory)
  const deleteGate = (gateId: string) => {
    const gate = gates.find(g => g.id === gateId)
    if (!gate || gate.locked) return
    
    setGates(gates.filter(g => g.id !== gateId))
    setConnections(connections.filter(c => 
      c.from.gateId !== gateId && c.to.gateId !== gateId
    ))
    setInventory(inv => inv.map(i => 
      i.type === gate.type ? { ...i, count: i.count + 1 } : i
    ))
    setMoves(moves + 1)
  }
  
  // Handle connection creation
  const handleConnectionPoint = (gateId: string, point: ConnectionPoint, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (!connectingFrom) {
      // Start connection
      setConnectingFrom({ gateId, point })
    } else {
      // Complete connection
      if (connectingFrom.gateId === gateId && connectingFrom.point === point) {
        // Clicking same point cancels
        setConnectingFrom(null)
        return
      }
      
      // Validate connection
      const fromGate = gates.find(g => g.id === connectingFrom.gateId)
      const toGate = gates.find(g => g.id === gateId)
      
      if (!fromGate || !toGate) {
        setConnectingFrom(null)
        return
      }
      
      // Only allow output -> input connections
      if (connectingFrom.point === 'output' && point !== 'output') {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: { gateId, point }
        }
        setConnections([...connections, newConnection])
        setMoves(moves + 1)
      } else if (point === 'output' && connectingFrom.point !== 'output') {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: { gateId, point },
          to: connectingFrom
        }
        setConnections([...connections, newConnection])
        setMoves(moves + 1)
      }
      
      setConnectingFrom(null)
    }
  }
  
  // Reset puzzle
  const resetPuzzle = () => {
    setGates(currentPuzzle.initialGates || [])
    setConnections(currentPuzzle.initialConnections || [])
    setInventory([...currentPuzzle.inventory])
    setTestResults([])
    setIsComplete(false)
    setMoves(0)
    setStartTime(Date.now())
  }
  
  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white">{currentPuzzle.name}</h2>
          <p className="text-white/60 text-sm">{currentPuzzle.description}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/60">
            <Timer className="w-4 h-4" />
            <span className="text-sm">{Math.floor((Date.now() - startTime) / 1000)}s</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <MousePointer2 className="w-4 h-4" />
            <span className="text-sm">{moves} moves</span>
          </div>
          <button
            onClick={() => {
              setShowHint(true)
              setCurrentHintIndex(Math.min(currentHintIndex + 1, currentPuzzle.hints.length - 1))
            }}
            className="px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button
            onClick={resetPuzzle}
            className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Main workspace */}
      <div className="flex-1 flex">
        {/* Inventory */}
        <div className="w-24 border-r border-white/10 p-2 space-y-2">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Inventory</div>
          {inventory.map(item => (
            <div
              key={item.type}
              className={`relative ${item.count === 0 ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <div
                draggable={item.count > 0}
                onDragStart={(e) => {
                  e.dataTransfer.setData('gateType', item.type)
                }}
                className={`w-full aspect-square rounded-lg bg-gradient-to-br ${GATE_CONFIG[item.type].color} 
                  border ${GATE_CONFIG[item.type].borderColor} flex flex-col items-center justify-center 
                  cursor-move hover:scale-105 transition-transform`}
              >
                <span className="text-xs font-bold text-white/80">{GATE_CONFIG[item.type].symbol}</span>
                <span className="text-xs text-white/60">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Workspace */}
        <div
          ref={workspaceRef}
          className="flex-1 relative overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const gateType = e.dataTransfer.getData('gateType') as GateType
            if (gateType && workspaceRef.current) {
              const rect = workspaceRef.current.getBoundingClientRect()
              addGateFromInventory(gateType, e.clientX - rect.left, e.clientY - rect.top)
            }
          }}
          onMouseMove={(e) => {
            if (workspaceRef.current) {
              const rect = workspaceRef.current.getBoundingClientRect()
              setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
            }
          }}
        >
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                <circle cx={GRID_SIZE/2} cy={GRID_SIZE/2} r="1" fill="white" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(conn => {
              const fromGate = gates.find(g => g.id === conn.from.gateId)
              const toGate = gates.find(g => g.id === conn.to.gateId)
              if (!fromGate || !toGate) return null
              
              const fromX = fromGate.x + (conn.from.point === 'output' ? 80 : 0)
              const fromY = fromGate.y + (conn.from.point === 'input2' ? 50 : 25)
              const toX = toGate.x + (conn.to.point === 'output' ? 80 : 0)
              const toY = toGate.y + (conn.to.point === 'input2' ? 50 : 25)
              
              return (
                <line
                  key={conn.id}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={fromGate.output ? '#4ade80' : '#6b7280'}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              )
            })}
            
            {/* Drawing connection */}
            {connectingFrom && (
              <line
                x1={gates.find(g => g.id === connectingFrom.gateId)?.x || 0}
                y1={gates.find(g => g.id === connectingFrom.gateId)?.y || 0}
                x2={mousePosition.x}
                y2={mousePosition.y}
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>
          
          {/* Gates */}
          {gates.map(gate => (
            <div
              key={gate.id}
              className={`absolute ${gate.locked ? '' : 'cursor-move'}`}
              style={{ left: gate.x, top: gate.y }}
              onMouseDown={(e) => {
                if (gate.locked) return
                setDraggingGate(gate.id)
                setDragOffset({
                  x: e.clientX - gate.x,
                  y: e.clientY - gate.y
                })
              }}
            >
              <div
                className={`relative w-20 h-12 rounded-lg bg-gradient-to-br ${GATE_CONFIG[gate.type].color} 
                  border ${GATE_CONFIG[gate.type].borderColor} flex items-center justify-center
                  ${gate.output ? 'shadow-lg' : ''}`}
                style={{
                  boxShadow: gate.output ? `0 0 20px ${GATE_CONFIG[gate.type].glowColor}` : ''
                }}
              >
                {/* Input points */}
                {GATE_CONFIG[gate.type].inputs > 0 && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white/20 rounded-full border border-white/40 cursor-pointer hover:bg-white/30"
                    onClick={(e) => handleConnectionPoint(gate.id, 'input1', e)}
                  />
                )}
                {GATE_CONFIG[gate.type].inputs > 1 && (
                  <div
                    className="absolute left-0 bottom-2 -translate-x-1/2 w-3 h-3 bg-white/20 rounded-full border border-white/40 cursor-pointer hover:bg-white/30"
                    onClick={(e) => handleConnectionPoint(gate.id, 'input2', e)}
                  />
                )}
                
                {/* Output point */}
                {gate.type !== 'OUTPUT' && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white/20 rounded-full border border-white/40 cursor-pointer hover:bg-white/30"
                    onClick={(e) => handleConnectionPoint(gate.id, 'output', e)}
                  />
                )}
                
                {/* Gate label */}
                <span className="text-xs font-bold text-white/80">
                  {gate.label || GATE_CONFIG[gate.type].symbol}
                </span>
                
                {/* Lock indicator */}
                {gate.locked && (
                  <Lock className="absolute top-0 right-0 w-3 h-3 text-white/40" />
                )}
                
                {/* Delete button */}
                {!gate.locked && (
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteGate(gate.id)
                    }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
                
                {/* Switch toggle */}
                {gate.type === 'SWITCH' && (
                  <button
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 rounded text-xs text-white/60 hover:text-white"
                    onClick={() => {
                      setGates(gates.map(g => 
                        g.id === gate.id ? { ...g, output: !g.output } : g
                      ))
                    }}
                  >
                    {gate.output ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Test panel */}
        <div className="w-64 border-l border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Tests</h3>
            <button
              onClick={runTests}
              className="px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
          
          <div className="space-y-2">
            {currentPuzzle.testCases.map((testCase, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border ${
                  testResults[idx]?.passed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : testResults[idx] !== undefined
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">
                    {testCase.description || `Test ${idx + 1}`}
                  </span>
                  {testResults[idx]?.passed && (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {isComplete && (
            <div className="mt-4 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-center text-white font-bold mb-2">Complete!</div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hint overlay */}
      <AnimatePresence>
        {showHint && currentHintIndex < currentPuzzle.hints.length && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-md"
          >
            <div className="bg-purple-900/90 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white/90">{currentPuzzle.hints[currentHintIndex]}</p>
                  <p className="text-white/50 text-xs mt-1">
                    Hint {currentHintIndex + 1} of {currentPuzzle.hints.length}
                  </p>
                </div>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-white/50 hover:text-white/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}