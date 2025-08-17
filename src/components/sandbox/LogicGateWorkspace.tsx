'use client'

import { useState, useRef, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, MousePointer2, X, Table, Calculator, FileText, Copy, Check, Trash, Play, Pause, SkipForward, Gauge, AlertCircle, ChevronRight, Grid, Save, FolderOpen, Share2, Download, Upload, ChevronDown, ZoomIn, ZoomOut, Maximize2, RotateCcw, Lock, Binary } from 'lucide-react'

// Types
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
}

interface Connection {
  id: string
  from: { gateId: string; point: ConnectionPoint }
  to: { gateId: string; point: ConnectionPoint }
}

interface WireSegment {
  from: { x: number; y: number }
  to: { x: number; y: number }
  active: boolean
}

// Mini Byte Objective Component
const MiniByteObjective = ({ objective, puzzleComplete }: { objective: string; puzzleComplete?: boolean }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [binaryMatrix, setBinaryMatrix] = useState(['0', '1', '1', '0'])
  
  // Binary animation effect for Byte
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setBinaryMatrix([
          Math.random() > 0.5 ? '1' : '0',
          Math.random() > 0.5 ? '1' : '0',
          Math.random() > 0.5 ? '1' : '0',
          Math.random() > 0.5 ? '1' : '0'
        ])
      }, 150)
      
      return () => clearInterval(interval)
    } else {
      setBinaryMatrix(['0', '1', '1', '0'])
    }
  }, [isTyping])
  
  // Typing animation
  useEffect(() => {
    setDisplayedText('')
    setIsTyping(true)
    let currentIndex = 0
    
    const typeInterval = setInterval(() => {
      if (currentIndex < objective.length) {
        setDisplayedText(objective.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 30)
    
    return () => clearInterval(typeInterval)
  }, [objective])
  
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-full px-4 py-2 border border-purple-400/30 min-w-[260px] backdrop-blur-sm shadow-lg shadow-purple-500/10">
      {/* Animated Byte Avatar with glow */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md animate-pulse" />
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-0.5">
          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center relative">
            {/* Binary matrix animation */}
            <div className="grid grid-cols-2 gap-0">
              {binaryMatrix.map((bit, index) => (
                <m.div
                  key={`${index}-${bit}`}
                  animate={{ 
                    scale: isTyping ? [0.95, 1.05, 0.95] : 1,
                    opacity: bit === '1' ? 1 : 0.6,
                    color: bit === '1' ? '#c084fc' : '#9ca3af'
                  }}
                  transition={{ 
                    scale: isTyping ? { duration: 2, repeat: Infinity, delay: index * 0.1 } : { duration: 0.2 },
                    opacity: { duration: 0.1 },
                    color: { duration: 0.1 }
                  }}
                  className="text-[8px] font-mono font-bold w-3.5 h-3.5 flex items-center justify-center"
                  style={{
                    textShadow: bit === '1' && isTyping ? '0 0 4px rgba(192, 132, 252, 0.5)' : 'none'
                  }}
                >
                  {bit}
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Typing text with speech bubble feel */}
      <div className="flex-1 flex items-center">
        <span className={`text-sm font-medium ${
          puzzleComplete ? 'text-green-400' : 'text-purple-200'
        }`}>
          {displayedText}
          {isTyping && (
            <m.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-purple-300 ml-0.5"
            >
              |
            </m.span>
          )}
        </span>
      </div>
    </div>
  )
}

// Gate configurations
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
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'purple',
    logic: (a: boolean, b: boolean) => a !== b,
    inputs: 2
  },
  NAND: { 
    symbol: 'NAND', 
    color: 'from-green-500/20 to-green-600/20',
    borderColor: 'border-green-500/50',
    glowColor: 'green',
    logic: (a: boolean, b: boolean) => !(a && b),
    inputs: 2
  },
  NOR: { 
    symbol: 'NOR', 
    color: 'from-orange-500/20 to-orange-600/20',
    borderColor: 'border-orange-500/50',
    glowColor: 'orange',
    logic: (a: boolean, b: boolean) => !(a || b),
    inputs: 2
  },
  SWITCH: {
    symbol: 'SW',
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

// Spacey name generator
const generateSpaceyName = () => {
  const prefixes = [
    'Cosmic', 'Stellar', 'Nebula', 'Quantum', 'Astral', 'Celestial', 
    'Galactic', 'Lunar', 'Solar', 'Orbital', 'Void', 'Nova', 
    'Pulsar', 'Quasar', 'Photon', 'Plasma', 'Aurora', 'Zenith',
    'Eclipse', 'Comet', 'Meteor', 'Starlight', 'Moonbeam', 'Stardust'
  ]
  
  const suffixes = [
    'Circuit', 'Gate', 'Logic', 'Flow', 'Path', 'Network', 
    'Matrix', 'Array', 'System', 'Core', 'Node', 'Link',
    'Bridge', 'Portal', 'Nexus', 'Relay', 'Channel', 'Stream',
    'Cascade', 'Fusion', 'Engine', 'Drive', 'Field', 'Grid'
  ]
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  
  return `${prefix} ${suffix}`
}

interface LogicGateWorkspaceProps {
  availableGates?: GateType[]
  enableFileOperations?: boolean
  componentLimits?: Record<GateType, number>
  onCircuitUpdate?: (gates: LogicGate[], connections: Connection[]) => void
  objective?: string
  puzzleComplete?: boolean
}

const LogicGateWorkspace = forwardRef<any, LogicGateWorkspaceProps>(({ 
  availableGates = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'SWITCH', 'OUTPUT'],
  enableFileOperations = true,
  componentLimits,
  onCircuitUpdate,
  objective,
  puzzleComplete
}: LogicGateWorkspaceProps = {}, ref) => {
  const [gates, setGates] = useState<LogicGate[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<{ gateId: string; point: ConnectionPoint } | null>(null)
  const [selectedTool, setSelectedTool] = useState<GateType>('SWITCH')
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [draggingGate, setDraggingGate] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredGate, setHoveredGate] = useState<string | null>(null)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  
  // Calculate component usage
  const componentUsage = useMemo(() => {
    const usage: Record<GateType, number> = {
      'AND': 0, 'OR': 0, 'NOT': 0, 'XOR': 0, 'NAND': 0, 'NOR': 0, 'SWITCH': 0, 'OUTPUT': 0
    }
    gates.forEach(gate => {
      usage[gate.type] = (usage[gate.type] || 0) + 1
    })
    return usage
  }, [gates])
  
  // Notify parent about circuit updates
  useEffect(() => {
    if (onCircuitUpdate) {
      onCircuitUpdate(gates, connections)
    }
  }, [gates, connections, onCircuitUpdate])
  
  // History state for undo functionality
  const [history, setHistory] = useState<Array<{ gates: LogicGate[], connections: Connection[] }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const MAX_HISTORY_SIZE = 50
  const [hasDragged, setHasDragged] = useState(false)
  const [showTruthTable, setShowTruthTable] = useState(false)
  const [truthTableScale, setTruthTableScale] = useState(1)
  const [truthTablePos, setTruthTablePos] = useState({ x: 400, y: 200 })
  const [isDraggingTable, setIsDraggingTable] = useState(false)
  const [tableDragStart, setTableDragStart] = useState({ x: 0, y: 0 })
  const [showEquation, setShowEquation] = useState(false)
  const [equationMode, setEquationMode] = useState<'generate' | 'parse'>('generate')
  const [equationFormat, setEquationFormat] = useState<'SOP' | 'POS' | 'SIMPLIFIED'>('SIMPLIFIED')
  const [equationInput, setEquationInput] = useState('')
  const [syntaxError, setSyntaxError] = useState<string | null>(null)
  const [bracketSuggestion, setBracketSuggestion] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [equationPos, setEquationPos] = useState({ x: 50, y: 100 })
  const [isDraggingEquation, setIsDraggingEquation] = useState(false)
  const [equationDragStart, setEquationDragStart] = useState({ x: 0, y: 0 })
  const [showStepwise, setShowStepwise] = useState(false)
  const [isStepwiseMode, setIsStepwiseMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const stepInterval = 300 // Fixed animation speed in milliseconds
  const [currentStep, setCurrentStep] = useState(0)
  const [animatingGates, setAnimatingGates] = useState<Set<string>>(new Set())
  const [animatingConnections, setAnimatingConnections] = useState<Set<string>>(new Set())
  const [stepwiseSwitchStates, setStepwiseSwitchStates] = useState<Record<string, boolean>>({})
  const [stepwisePos, setStepwisePos] = useState({ x: 400, y: 100 })
  const [isDraggingStepwise, setIsDraggingStepwise] = useState(false)
  const [stepwiseDragStart, setStepwiseDragStart] = useState({ x: 0, y: 0 })
  const [stepwiseMessage, setStepwiseMessage] = useState<string | null>(null)
  
  // New state for proper step-by-step propagation with levels
  const [propagationQueue, setPropagationQueue] = useState<Array<Array<{
    type: 'wire' | 'gate'
    id: string
    from?: string
    to?: string
    value?: boolean
  }>>>([])
  const [stepwiseGateStates, setStepwiseGateStates] = useState<Record<string, { 
    inputs: Record<string, boolean>, 
    output: boolean,
    inputsReceived: Set<string> // Track which inputs have been received
  }>>({})
  const [stepHistory, setStepHistory] = useState<Array<{
    gates: LogicGate[],
    animatingGates: Set<string>,
    animatingConnections: Set<string>
  }>>([])
  const [processedElements, setProcessedElements] = useState<Set<string>>(new Set())
  const [showProjects, setShowProjects] = useState(false)
  const [projectName, setProjectName] = useState(() => generateSpaceyName())
  const [savedProjects, setSavedProjects] = useState<Array<{name: string, data: string, timestamp: number}>>([])
  const workspaceRef = useRef<HTMLDivElement>(null)
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const MIN_ZOOM = 0.1  // Can zoom out to see more
  const MAX_ZOOM = 1    // Max zoom is the default view we had before
  
  // Grid size for snapping (matches the visual grid)
  const GRID_SIZE = 40
  
  // Snap position to grid
  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y }
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE
    }
  }
  
  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom
    }
  }, [pan, zoom])
  
  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * zoom + pan.x,
      y: worldY * zoom + pan.y
    }
  }, [pan, zoom])
  
  
  // History management functions
  const saveToHistory = useCallback(() => {
    // Create a deep copy of the current state
    const currentState = {
      gates: gates.map(g => ({ ...g, inputs: { ...g.inputs } })),
      connections: connections.map(c => ({ ...c, from: { ...c.from }, to: { ...c.to } }))
    }
    
    // If we're not at the end of history, remove everything after current index
    const newHistory = history.slice(0, historyIndex + 1)
    
    // Add new state
    newHistory.push(currentState)
    
    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift()
    }
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [gates, connections, history, historyIndex])
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1
      const previousState = history[targetIndex]
      setGates(previousState.gates.map(g => ({ ...g, inputs: { ...g.inputs } })))
      setConnections(previousState.connections.map(c => ({ ...c, from: { ...c.from }, to: { ...c.to } })))
      setHistoryIndex(targetIndex)
    }
  }, [history, historyIndex])
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1
      const nextState = history[targetIndex]
      setGates(nextState.gates.map(g => ({ ...g, inputs: { ...g.inputs } })))
      setConnections(nextState.connections.map(c => ({ ...c, from: { ...c.from }, to: { ...c.to } })))
      setHistoryIndex(targetIndex)
    }
  }, [history, historyIndex])

  // Save circuit to JSON
  const saveCircuit = useCallback(() => {
    const circuitData = {
      gates,
      connections,
      projectName,
      timestamp: Date.now(),
      version: '1.0'
    }
    const dataStr = JSON.stringify(circuitData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [gates, connections, projectName])
  
  // Load circuit from JSON
  const loadCircuit = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setGates(data.gates || [])
        setConnections(data.connections || [])
        setProjectName(data.projectName || 'Loaded Circuit')
        // Save to history after loading file
        setTimeout(() => saveToHistory(), 0)
      } catch (error) {
        alert('Failed to load circuit file')
      }
    }
    reader.readAsText(file)
  }, [])
  
  // Share circuit (copy to clipboard)
  const shareCircuit = useCallback(() => {
    const circuitData = {
      gates,
      connections,
      projectName
    }
    const encoded = btoa(JSON.stringify(circuitData))
    const shareUrl = `${window.location.origin}${window.location.pathname}?circuit=${encoded}`
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy share link')
    })
  }, [gates, connections, projectName])

  // Load saved projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('logic-gate-projects')
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved projects')
      }
    }
  }, [])
  
  // Save project to localStorage
  const saveToProjects = useCallback(() => {
    const circuitData = {
      gates,
      connections,
      projectName
    }
    const newProject = {
      name: projectName,
      data: JSON.stringify(circuitData),
      timestamp: Date.now()
    }
    const updated = [...savedProjects, newProject].slice(-10) // Keep last 10 projects
    setSavedProjects(updated)
    localStorage.setItem('logic-gate-projects', JSON.stringify(updated))
  }, [gates, connections, projectName, savedProjects])
  
  // Load from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const circuitData = params.get('circuit')
    if (circuitData) {
      try {
        const decoded = JSON.parse(atob(circuitData))
        setGates(decoded.gates || [])
        setConnections(decoded.connections || [])
        setProjectName(decoded.projectName || 'Shared Circuit')
      } catch (e) {
        console.error('Failed to load shared circuit')
      }
    }
  }, [])

  // Cancel wire connection on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectingFrom) {
        setConnectingFrom(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [connectingFrom])

  // Initialize stepwise mode with selected switch states
  const initializeStepwise = useCallback((preserveStep = false) => {
    // Reset all gate states
    const initialStates: Record<string, { 
      inputs: Record<string, boolean>, 
      output: boolean,
      inputsReceived: Set<string>
    }> = {}
    
    // Build propagation queue
    const queue: Array<Array<{ type: 'wire' | 'gate', id: string, from?: string, to?: string, value?: boolean }>> = []
    
    // First, collect all switches that are ON
    const activeSwitches: Array<{ type: 'wire' | 'gate', id: string, from?: string, to?: string, value?: boolean }> = []
    
    gates.forEach(gate => {
      if (gate.type === 'SWITCH') {
        const switchValue = stepwiseSwitchStates[gate.id] || false
        initialStates[gate.id] = { 
          inputs: {}, 
          output: switchValue,
          inputsReceived: new Set()
        }
        
        // If switch is ON, add it to first frame for illumination
        if (switchValue) {
          activeSwitches.push({
            type: 'gate',
            id: gate.id,
            value: switchValue
          })
        }
      } else {
        // Initialize other gates
        initialStates[gate.id] = { 
          inputs: gate.type === 'NOT' || gate.type === 'OUTPUT' 
            ? { input1: false } 
            : { input1: false, input2: false }, 
          output: false,
          inputsReceived: new Set()
        }
      }
    })
    
    // First frame is wires from switches (switches are already on at step 0)
    if (activeSwitches.length > 0) {
      // Wires from switches as first animation frame
      const wiresFromSwitches: Array<{ type: 'wire' | 'gate', id: string, from?: string, to?: string, value?: boolean }> = []
      activeSwitches.forEach(switchElement => {
        connections.forEach(conn => {
          if (conn.from.gateId === switchElement.id && conn.from.point === 'output') {
            wiresFromSwitches.push({
              type: 'wire',
              id: conn.id,
              from: switchElement.id,
              to: conn.to.gateId,
              value: switchElement.value
            })
          }
        })
      })
      
      if (wiresFromSwitches.length > 0) {
        queue.push(wiresFromSwitches)
      }
      setStepwiseMessage(null)
    } else {
      // No switches are on - show helpful message
      setStepwiseMessage('Turn on at least one switch to start the simulation')
    }
    
    // Update visual state
    const updatedGates = gates.map(gate => ({
      ...gate,
      inputs: gate.type === 'SWITCH' ? {} : initialStates[gate.id].inputs,
      output: initialStates[gate.id].output
    }))
    setGates(updatedGates)
    
    setStepwiseGateStates(initialStates)
    setPropagationQueue(queue)
    setProcessedElements(new Set())
    // Animate switches that are ON at step 0
    setAnimatingGates(new Set(activeSwitches.map(s => s.id)))
    setAnimatingConnections(new Set())
    if (!preserveStep) {
      setCurrentStep(0)
      setStepHistory([{
        gates: [...updatedGates],
        animatingGates: new Set(activeSwitches.map(s => s.id)),
        animatingConnections: new Set()
      }])
    }
  }, [gates, connections, stepwiseSwitchStates])

  // Calculate gate outputs based on connections
  const calculateOutputs = useCallback(() => {
    setGates(currentGates => {
      const newGates = [...currentGates]
      const connectionMap = new Map<string, boolean>()
      
      // First pass: collect all outputs (including switches)
      newGates.forEach(gate => {
        if (gate.type === 'SWITCH' || gate.output) {
          connections.forEach(conn => {
            if (conn.from.gateId === gate.id && conn.from.point === 'output') {
              connectionMap.set(`${conn.to.gateId}-${conn.to.point}`, gate.output)
            }
          })
        }
      })
      
      // Update gate inputs and outputs in topological order
      let changed = true
      let iterations = 0
      while (changed && iterations < 20) { // Prevent infinite loops
        changed = false
        iterations++
        
        newGates.forEach(gate => {
          if (gate.type === 'SWITCH') {
            // Switches maintain their own state, just propagate their output
            return
          }
          
          const oldInputs = { ...gate.inputs }
          const oldOutput = gate.output
          
          // Update inputs from connections
          const input1Key = `${gate.id}-input1`
          const input2Key = `${gate.id}-input2`
          
          if (connectionMap.has(input1Key)) {
            gate.inputs.input1 = connectionMap.get(input1Key)!
          } else {
            gate.inputs.input1 = false // Default to false if not connected
          }
          
          if (gate.type !== 'NOT' && gate.type !== 'OUTPUT') {
            if (connectionMap.has(input2Key)) {
              gate.inputs.input2 = connectionMap.get(input2Key)!
            } else {
              gate.inputs.input2 = false // Default to false if not connected
            }
          }
          
          // Calculate output
          const config = GATE_CONFIG[gate.type]
          if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
            gate.output = config.logic(gate.inputs.input1 || false)
          } else {
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
    if (!isStepwiseMode) {
      calculateOutputs()
    }
  }, [calculateOutputs, isStepwiseMode])
  
  // Save initial state to history
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory()
    }
  }, [])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Redo: Ctrl+Y or Cmd+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
               ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // Handle wheel events with passive: false for trackpad support
  useEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const rect = workspace.getBoundingClientRect()
      const centerX = e.clientX - rect.left
      const centerY = e.clientY - rect.top
      
      // More gradual zoom speed that feels natural
      // Use multiplicative zoom for consistent feel at all zoom levels
      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor))
      
      if (newZoom !== zoom) {
        // Zoom around the mouse position
        const worldPos = screenToWorld(centerX, centerY)
        setZoom(newZoom)
        // Adjust pan to keep the same world position under the mouse
        setPan({
          x: centerX - worldPos.x * newZoom,
          y: centerY - worldPos.y * newZoom
        })
      }
    }

    // Add with passive: false to allow preventDefault on trackpads
    workspace.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      workspace.removeEventListener('wheel', handleWheel)
    }
  }, [zoom, screenToWorld])

  // Proper step-by-step propagation with gate illumination as separate frames
  const calculateStepwise = useCallback((forceStep = false, direction = 'forward') => {
    if (!isPlaying && !forceStep) return
    
    if (direction === 'backward') {
      // Go back one step using history
      if (currentStep > 0 && stepHistory[currentStep - 1]) {
        const previousState = stepHistory[currentStep - 1]
        setGates(previousState.gates)
        setAnimatingGates(previousState.animatingGates)
        setAnimatingConnections(previousState.animatingConnections)
        setCurrentStep(prev => prev - 1)
      }
      return
    }
    
    if (propagationQueue.length === 0) {
      setIsPlaying(false)
      // Indicate completion with a subtle pulse
      setAnimatingGates(new Set(gates.filter(g => g.type === 'OUTPUT' && g.output).map(g => g.id)))
      setTimeout(() => setAnimatingGates(new Set()), 1000)
      return
    }
    
    // Process current level
    const currentLevel = propagationQueue[0]
    const remainingLevels = propagationQueue.slice(1)
    const nextLevel: Array<{ type: 'wire' | 'gate', id: string, from?: string, to?: string, value?: boolean }> = []
    
    // Don't clear animations - let them persist
    const newAnimatingGates = new Set(animatingGates)
    const newAnimatingConnections = new Set(animatingConnections)
    
    // Track gates that receive input from wires in this step
    const gatesReceivingInput = new Map<string, Set<string>>()
    
    // Local copy of gate states for this step
    let localGateStates = { ...stepwiseGateStates }
    
    // Process all elements in current level
    currentLevel.forEach(element => {
      if (element.type === 'wire') {
        // Signal traveling through a wire
        const connection = connections.find(c => c.id === element.id)
        if (!connection) return
        
        // Animate this wire
        newAnimatingConnections.add(element.id)
        
        // Update the target gate's input
        const targetGateId = connection.to.gateId
        const targetInput = connection.to.point as 'input1' | 'input2'
        
        // Update local gate state
        if (!localGateStates[targetGateId]) {
          const targetGate = gates.find(g => g.id === targetGateId)
          localGateStates[targetGateId] = { 
            inputs: targetGate?.type === 'NOT' || targetGate?.type === 'OUTPUT' 
              ? { input1: false }
              : { input1: false, input2: false }, 
            output: false,
            inputsReceived: new Set()
          }
        }
        localGateStates[targetGateId].inputs[targetInput] = element.value || false
        localGateStates[targetGateId].inputsReceived.add(targetInput)
        
        // Track this gate as receiving input
        if (!gatesReceivingInput.has(targetGateId)) {
          gatesReceivingInput.set(targetGateId, new Set())
        }
        gatesReceivingInput.get(targetGateId)!.add(targetInput)
        
        // Update visual gate state
        setGates(currentGates => currentGates.map(gate => {
          if (gate.id === targetGateId) {
            return {
              ...gate,
              inputs: {
                ...gate.inputs,
                [targetInput]: element.value || false
              }
            }
          }
          return gate
        }))
        
      } else if (element.type === 'gate') {
        // Gate illuminating and evaluating its inputs
        const gate = gates.find(g => g.id === element.id)
        if (!gate) return
        
        const gateState = localGateStates[gate.id]
        if (!gateState) return
        
        const config = GATE_CONFIG[gate.type]
        
        // Calculate new output
        let newOutput = false
        if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
          newOutput = config.logic(gateState.inputs.input1)
        } else if (gate.type === 'SWITCH') {
          newOutput = gateState.output // Switches maintain their state
        } else {
          newOutput = config.logic(gateState.inputs.input1, gateState.inputs.input2 || false)
        }
        
        // Update local state
        localGateStates[gate.id] = { ...gateState, output: newOutput }
        
        // Update visual state and animate this gate
        setGates(currentGates => currentGates.map(g => 
          g.id === gate.id ? { ...g, output: newOutput } : g
        ))
        
        // Animate this gate (illumination)
        newAnimatingGates.add(gate.id)
        
        // If gate has output connections, add them to next level
        const outgoingConnections = connections.filter(conn => 
          conn.from.gateId === gate.id && conn.from.point === 'output'
        )
        
        if (outgoingConnections.length > 0) {
          // Add wires as next level (will propagate in parallel)
          outgoingConnections.forEach(conn => {
            nextLevel.push({
              type: 'wire',
              id: conn.id,
              from: gate.id,
              to: conn.to.gateId,
              value: newOutput
            })
          })
        }
      }
    })
    
    // After processing wires, check which gates are ready to evaluate
    // These will be processed as a separate step (gate illumination)
    if (currentLevel.every(el => el.type === 'wire')) {
      // Just processed wires, now check which gates are ready
      gatesReceivingInput.forEach((inputsReceived, gateId) => {
        const gate = gates.find(g => g.id === gateId)
        if (!gate || gate.type === 'SWITCH') return
        
        const gateState = localGateStates[gateId]
        if (!gateState) return
        
        // Check if gate has all required inputs
        const needsBothInputs = !['NOT', 'OUTPUT'].includes(gate.type)
        const incomingConnections = connections.filter(c => c.to.gateId === gateId)
        const hasInput1Connection = incomingConnections.some(c => c.to.point === 'input1')
        const hasInput2Connection = incomingConnections.some(c => c.to.point === 'input2')
        
        let hasAllRequiredInputs = false
        
        if (needsBothInputs) {
          if (hasInput1Connection && hasInput2Connection) {
            hasAllRequiredInputs = inputsReceived.has('input1') && inputsReceived.has('input2')
          } else if (hasInput1Connection || hasInput2Connection) {
            hasAllRequiredInputs = (hasInput1Connection && inputsReceived.has('input1')) ||
                                   (hasInput2Connection && inputsReceived.has('input2'))
          }
        } else {
          hasAllRequiredInputs = hasInput1Connection && inputsReceived.has('input1')
        }
        
        // Add ready gates to next level (will illuminate in parallel)
        if (hasAllRequiredInputs && !processedElements.has(gateId)) {
          nextLevel.push({
            type: 'gate',
            id: gateId,
            value: false
          })
          setProcessedElements(prev => new Set([...prev, gateId]))
        }
      })
    }
    
    // Update the actual state with local changes
    setStepwiseGateStates(localGateStates)
    
    // Build new queue
    const newQueue = [...remainingLevels]
    if (nextLevel.length > 0) {
      newQueue.push(nextLevel)
    }
    
    setPropagationQueue(newQueue)
    setCurrentStep(prev => prev + 1)
    
    // Set animations
    setAnimatingGates(newAnimatingGates)
    setAnimatingConnections(newAnimatingConnections)
    
    // Save state to history
    setStepHistory(prev => {
      const newHistory = prev.slice(0, currentStep + 1)
      newHistory.push({
        gates: [...gates],
        animatingGates: new Set(newAnimatingGates),
        animatingConnections: new Set(newAnimatingConnections)
      })
      return newHistory
    })
  }, [isPlaying, propagationQueue, connections, gates, stepwiseGateStates, processedElements, currentStep, animatingGates, animatingConnections, stepHistory])

  // Handle stepwise playback
  useEffect(() => {
    if (isPlaying && isStepwiseMode) {
      const timer = setTimeout(() => {
        calculateStepwise()
      }, stepInterval)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isPlaying, isStepwiseMode, calculateStepwise, stepInterval, currentStep])

  const handleWorkspaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we're connecting a wire, cancel the wire placement on misclick
    if (connectingFrom) {
      setConnectingFrom(null)
      return
    }
    
    // Don't place gates if we're in wire/delete mode, panning, or if shift is held
    if (!workspaceRef.current || selectedTool === 'wire' || selectedTool === 'delete' || isPanning || e.shiftKey) return
    
    // Check component limits if they exist
    if (componentLimits && componentLimits[selectedTool]) {
      const currentUsage = componentUsage[selectedTool] || 0
      const limit = componentLimits[selectedTool]
      if (currentUsage >= limit) {
        // Don't add more components if limit is reached
        return
      }
    }
    
    const rect = workspaceRef.current.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    
    // Convert to world coordinates
    const worldPos = screenToWorld(screenX, screenY)
    
    // Snap to grid if enabled
    const { x, y } = snapToGridPosition(worldPos.x, worldPos.y)
    
    // Add new gate
    const newGate: LogicGate = {
      id: `gate-${Date.now()}`,
      type: selectedTool as GateType,
      x,
      y,
      inputs: { input1: false, input2: false },
      output: false
    }
    
    // If it's a switch, assign a unique label
    if (selectedTool === 'SWITCH') {
      // Get all existing switch labels
      const existingLabels = new Set(
        gates
          .filter(g => g.type === 'SWITCH' && g.label)
          .map(g => g.label!)
      )
      
      // Find next available letter
      let labelIndex = 0
      let label = ''
      do {
        label = String.fromCharCode(65 + labelIndex) // A, B, C, etc.
        if (labelIndex >= 26) {
          // If we run out of single letters, use A1, A2, etc.
          const letterIndex = Math.floor((labelIndex - 26) / 10)
          const numberIndex = (labelIndex - 26) % 10 + 1
          label = String.fromCharCode(65 + letterIndex) + numberIndex
        }
        labelIndex++
      } while (existingLabels.has(label))
      
      newGate.label = label
    }
    
    // If it's an output, assign a unique number
    if (selectedTool === 'OUTPUT') {
      // Get all existing output labels
      const existingNumbers = new Set(
        gates
          .filter(g => g.type === 'OUTPUT' && g.label)
          .map(g => parseInt(g.label!) || 0)
      )
      
      // Find next available number
      let outputNumber = 1
      while (existingNumbers.has(outputNumber)) {
        outputNumber++
      }
      
      newGate.label = outputNumber.toString()
    }
    
    setGates([...gates, newGate])
    // Save to history after adding a gate
    setTimeout(() => saveToHistory(), 0)
  }

  const handleGateClick = (gateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const gate = gates.find(g => g.id === gateId)
    
    // Only process click if it wasn't a drag
    if (!hasDragged) {
      if (gate && gate.type === 'SWITCH') {
        // In stepwise mode, don't allow switch toggling during playback
        if (isStepwiseMode && isPlaying) {
          return
        }
        
        // Always allow toggling switches regardless of selected tool
        const newGates = gates.map(g => 
          g.id === gateId 
            ? { ...g, output: !g.output }
            : g
        )
        setGates(newGates)
        
        // In stepwise mode, also update the stepwise switch states
        if (isStepwiseMode) {
          setStepwiseSwitchStates(prev => ({
            ...prev,
            [gateId]: !gate.output
          }))
          setCurrentStep(0)
          setIsPlaying(true)
          setAnimatingGates(new Set())
          setAnimatingConnections(new Set())
        } else {
          // Trigger output recalculation after state update
          setTimeout(() => calculateOutputs(), 0)
        }
        return
      }
      
      setSelectedGate(gateId)
    }
  }

  const handleGateMouseDown = (gateId: string, e: React.MouseEvent) => {
    const gate = gates.find(g => g.id === gateId)
    
    if (gate && workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      
      // Calculate where the mouse is relative to the gate's world position
      const worldMousePos = screenToWorld(screenX, screenY)
      
      setDraggingGate(gateId)
      setDragOffset({
        x: worldMousePos.x - gate.x,
        y: worldMousePos.y - gate.y
      })
      // Track the start position to detect drags
      setDragStartPos({ x: e.clientX, y: e.clientY })
      setHasDragged(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!workspaceRef.current) return
    
    const rect = workspaceRef.current.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    
    // Update mouse position for wire preview
    const worldPos = screenToWorld(screenX, screenY)
    setMousePosition(worldPos)
    
    // Handle panning
    if (isPanning) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
      setPan({
        x: pan.x + deltaX,
        y: pan.y + deltaY
      })
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    
    // Handle dragging gates
    if (draggingGate) {
      // Detect if user has dragged more than 5 pixels
      if (dragStartPos && !hasDragged) {
        const distance = Math.sqrt(
          Math.pow(e.clientX - dragStartPos.x, 2) + 
          Math.pow(e.clientY - dragStartPos.y, 2)
        )
        if (distance > 5) {
          setHasDragged(true)
        }
      }

      // Convert to world coordinates
      const worldPos = screenToWorld(screenX - dragOffset.x, screenY - dragOffset.y)
      
      // Snap to grid if enabled
      const { x: newX, y: newY } = snapToGridPosition(worldPos.x, worldPos.y)
      
      setGates(gates.map(gate => 
        gate.id === draggingGate 
          ? { ...gate, x: newX, y: newY }
          : gate
      ))
    }
  }

  // Global mouse move for panel dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingTable) {
        setTruthTablePos({
          x: e.clientX - tableDragStart.x,
          y: e.clientY - tableDragStart.y
        })
      }
      if (isDraggingEquation) {
        setEquationPos({
          x: e.clientX - equationDragStart.x,
          y: e.clientY - equationDragStart.y
        })
      }
      if (isDraggingStepwise) {
        setStepwisePos({
          x: e.clientX - stepwiseDragStart.x,
          y: e.clientY - stepwiseDragStart.y
        })
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDraggingTable) {
        setIsDraggingTable(false)
      }
      if (isDraggingEquation) {
        setIsDraggingEquation(false)
      }
      if (isDraggingStepwise) {
        setIsDraggingStepwise(false)
      }
    }

    if (isDraggingTable || isDraggingEquation || isDraggingStepwise) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDraggingTable, tableDragStart, isDraggingEquation, equationDragStart, isDraggingStepwise, stepwiseDragStart])

  const handleMouseUp = () => {
    if (draggingGate && hasDragged) {
      // Save to history after moving a gate
      setTimeout(() => saveToHistory(), 0)
    }
    setDraggingGate(null)
    setDragStartPos(null)
    // Reset hasDragged after a short delay to prevent click interference
    setTimeout(() => setHasDragged(false), 50)
  }

  const handleConnectionPointClick = (gateId: string, point: ConnectionPoint, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Allow wire creation from any mode
    if (!connectingFrom) {
      setConnectingFrom({ gateId, point })
    } else {
      // Check if clicking the same pin to cancel
      if (connectingFrom.gateId === gateId && connectingFrom.point === point) {
        setConnectingFrom(null)
        return
      }
      
      // Create connection
      if (connectingFrom.gateId !== gateId && 
          ((connectingFrom.point === 'output' && point !== 'output') ||
           (connectingFrom.point !== 'output' && point === 'output'))) {
        
        // Check if the target input already has a connection
        const targetInput = connectingFrom.point === 'output' ? { gateId, point } : connectingFrom
        const hasExistingConnection = connections.some(c => 
          c.to.gateId === targetInput.gateId && c.to.point === targetInput.point
        )
        
        if (!hasExistingConnection) {
          const newConnection: Connection = {
            id: `conn-${Date.now()}`,
            from: connectingFrom.point === 'output' ? connectingFrom : { gateId, point },
            to: connectingFrom.point === 'output' ? { gateId, point } : connectingFrom
          }
          setConnections([...connections, newConnection])
          // Save to history after adding a connection
          setTimeout(() => saveToHistory(), 0)
        }
      }
      setConnectingFrom(null)
    }
  }

  const toggleGateInput = (gateId: string, input: 'input1' | 'input2') => {
    const newGates = gates.map(gate => {
      if (gate.id === gateId) {
        // Only toggle if no connection exists
        const hasConnection = connections.some(c => 
          c.to.gateId === gateId && c.to.point === input
        )
        if (!hasConnection) {
          return {
            ...gate,
            inputs: {
              ...gate.inputs,
              [input]: !gate.inputs[input]
            }
          }
        }
      }
      return gate
    })
    setGates(newGates)
    
    // Recalculate outputs after input change
    setTimeout(() => calculateOutputs(), 0)
  }

  const getConnectionPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Create control points for a smooth bezier curve
    const controlDistance = Math.min(distance * 0.5, 100)
    const c1x = from.x + controlDistance
    const c1y = from.y
    const c2x = to.x - controlDistance
    const c2y = to.y
    
    return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`
  }

  const getConnectionPoint = (gate: LogicGate, point: ConnectionPoint) => {
    const gateSize = 80
    const halfSize = gateSize / 2
    
    switch (point) {
      case 'input1':
        // NOT and OUTPUT gates have single centered input
        return { x: gate.x - halfSize, y: gate.y - ((gate.type === 'NOT' || gate.type === 'OUTPUT') ? 0 : 13.33) }
      case 'input2':
        return { x: gate.x - halfSize, y: gate.y + 13.33 }
      case 'output':
        return { x: gate.x + halfSize, y: gate.y }
    }
  }

  // Evaluate circuit for given switch states
  const evaluateCircuit = useCallback((testGates: LogicGate[], testConnections: Connection[], outputIds: string[]): boolean[] => {
    const gateMap = new Map(testGates.map(g => [g.id, g]))
    const connectionMap = new Map<string, boolean>()
    
    // Initialize connection map with switch outputs
    testGates.forEach(gate => {
      if (gate.type === 'SWITCH') {
        testConnections.forEach(conn => {
          if (conn.from.gateId === gate.id && conn.from.point === 'output') {
            connectionMap.set(`${conn.to.gateId}-${conn.to.point}`, gate.output)
          }
        })
      }
    })
    
    // Propagate signals through the circuit
    let changed = true
    let iterations = 0
    while (changed && iterations < 20) {
      changed = false
      iterations++
      
      testGates.forEach(gate => {
        if (gate.type === 'SWITCH') return
        
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
          gate.output = config.logic(gate.inputs.input1)
        } else if (gate.type !== 'SWITCH') {
          gate.output = config.logic(gate.inputs.input1, gate.inputs.input2)
        }
        
        // Update connection map if output changed
        if (gate.output !== oldOutput) {
          changed = true
          testConnections.forEach(conn => {
            if (conn.from.gateId === gate.id && conn.from.point === 'output') {
              connectionMap.set(`${conn.to.gateId}-${conn.to.point}`, gate.output)
            }
          })
        }
      })
    }
    
    // Extract output states
    return outputIds.map(id => {
      const outputGate = testGates.find(g => g.id === id)
      return outputGate?.output || false
    })
  }, [])

  // Generate truth table for the current circuit
  const generateTruthTable = useCallback(() => {
    // Find all switches (inputs) and outputs - sort by ID for stable ordering
    const switches = gates.filter(g => g.type === 'SWITCH').sort((a, b) => a.id.localeCompare(b.id))
    const outputs = gates.filter(g => g.type === 'OUTPUT').sort((a, b) => a.id.localeCompare(b.id))
    
    if (switches.length === 0 || outputs.length === 0) {
      return { inputs: [], outputs: [], rows: [] }
    }
    
    // Generate all possible input combinations
    const numInputs = switches.length
    const numCombinations = Math.pow(2, numInputs)
    const rows = []
    
    for (let i = 0; i < numCombinations; i++) {
      // Set switch states based on binary representation
      const inputStates: boolean[] = []
      for (let j = 0; j < numInputs; j++) {
        const bitValue = Boolean((i >> (numInputs - 1 - j)) & 1)
        inputStates.push(bitValue)
      }
      
      // Create a copy of gates with updated switch states and reset all other gates
      const testGates = gates.map(g => {
        if (g.type === 'SWITCH') {
          const switchIndex = switches.findIndex(s => s.id === g.id)
          return { ...g, output: inputStates[switchIndex] }
        }
        // Reset all non-switch gates to ensure clean evaluation
        return { ...g, output: false, inputs: { input1: false, input2: false } }
      })
      
      // Calculate outputs for this input combination
      const outputStates = evaluateCircuit(testGates, connections, outputs.map(o => o.id))
      
      rows.push({
        inputs: inputStates,
        outputs: outputStates
      })
    }
    
    return {
      inputs: switches.map(s => s.label || 'S'),
      outputs: outputs.map(o => o.label || `OUT${outputs.indexOf(o) + 1}`),
      rows
    }
  }, [gates, connections, evaluateCircuit]);
  
  // Memoize truth table to prevent recalculation on switch changes
  const memoizedTruthTable = useMemo(() => {
    return generateTruthTable()
  }, [
    // Only depend on circuit structure, not gate states
    gates.map(g => `${g.id}-${g.type}-${g.x}-${g.y}`).sort().join(','),
    connections.map(c => `${c.from.gateId}-${c.from.point}-${c.to.gateId}-${c.to.point}`).sort().join(','),
    evaluateCircuit
  ]);

  // Generate both invariant and evaluated equations
  const generateEquations = useCallback(() => {
    const switches = gates.filter(g => g.type === 'SWITCH').sort((a, b) => a.id.localeCompare(b.id))
    const outputs = gates.filter(g => g.type === 'OUTPUT').sort((a, b) => a.id.localeCompare(b.id))
    
    if (switches.length === 0 || outputs.length === 0) {
      return { invariant: '', evaluated: '' }
    }

    // Build circuit graph to trace paths
    const buildCircuitExpression = (gateId: string, evaluated: boolean, visited = new Set<string>()): string => {
      if (visited.has(gateId)) return '1' // Prevent infinite loops
      visited.add(gateId)
      
      const gate = gates.find(g => g.id === gateId)
      if (!gate) return '1'
      
      if (gate.type === 'SWITCH') {
        const letter = gate.label || 'S'
        return evaluated ? (gate.output ? 'T' : 'F') : letter
      }
      
      // Find inputs to this gate
      const inputConnections = connections.filter(c => c.to.gateId === gateId)
      
      if (gate.type === 'OUTPUT') {
        if (inputConnections.length > 0) {
          return buildCircuitExpression(inputConnections[0].from.gateId, evaluated, visited)
        }
        return '0'
      }
      
      if (gate.type === 'NOT') {
        if (inputConnections.length > 0) {
          const input = buildCircuitExpression(inputConnections[0].from.gateId, evaluated, visited)
          return `¬${input.length > 1 ? `(${input})` : input}`
        }
        return '¬0'
      }
      
      
      // Two-input gates
      const input1Conn = inputConnections.find(c => c.to.point === 'input1')
      const input2Conn = inputConnections.find(c => c.to.point === 'input2')
      
      const input1 = input1Conn ? buildCircuitExpression(input1Conn.from.gateId, evaluated, visited) : '0'
      const input2 = input2Conn ? buildCircuitExpression(input2Conn.from.gateId, evaluated, visited) : '0'
      
      const wrapIfNeeded = (expr: string) => expr.length > 1 && !expr.match(/^[A-Z¬TF]$/) ? `(${expr})` : expr
      
      switch (gate.type) {
        case 'AND':
          return `${wrapIfNeeded(input1)} ∧ ${wrapIfNeeded(input2)}`
        case 'OR':
          return `${wrapIfNeeded(input1)} ∨ ${wrapIfNeeded(input2)}`
        case 'XOR':
          return `${wrapIfNeeded(input1)} ⊕ ${wrapIfNeeded(input2)}`
        case 'NAND':
          return `¬(${wrapIfNeeded(input1)} ∧ ${wrapIfNeeded(input2)})`
        case 'NOR':
          return `¬(${wrapIfNeeded(input1)} ∨ ${wrapIfNeeded(input2)})`
        default:
          return '0'
      }
    }
    
    // Generate invariant equations
    const invariantEquations = outputs.map((output, i) => {
      const expr = buildCircuitExpression(output.id, false)
      return `Y${i + 1} = ${expr}`
    })
    
    // Generate evaluated equations
    const evaluatedEquations = outputs.map((output, i) => {
      const expr = buildCircuitExpression(output.id, true)
      // Simplify the evaluated expression
      const result = output.output ? 'T' : 'F'
      return `Y${i + 1} = ${expr} = ${result}`
    })
    
    return {
      invariant: invariantEquations.join('\n'),
      evaluated: evaluatedEquations.join('\n')
    }
  }, [gates, connections])

  // Generate boolean equation from circuit
  const generateEquation = useCallback(() => {
    const switches = gates.filter(g => g.type === 'SWITCH').sort((a, b) => a.id.localeCompare(b.id))
    const outputs = gates.filter(g => g.type === 'OUTPUT').sort((a, b) => a.id.localeCompare(b.id))
    
    if (switches.length === 0 || outputs.length === 0) {
      return ''
    }

    // Build circuit graph to trace paths
    const buildCircuitExpression = (gateId: string, visited = new Set<string>()): string => {
      if (visited.has(gateId)) return '1' // Prevent infinite loops
      visited.add(gateId)
      
      const gate = gates.find(g => g.id === gateId)
      if (!gate) return '1'
      
      if (gate.type === 'SWITCH') {
        return gate.label || 'S'
      }
      
      // Find inputs to this gate
      const inputConnections = connections.filter(c => c.to.gateId === gateId)
      
      if (gate.type === 'OUTPUT') {
        if (inputConnections.length > 0) {
          return buildCircuitExpression(inputConnections[0].from.gateId, visited)
        }
        return '0'
      }
      
      if (gate.type === 'NOT') {
        if (inputConnections.length > 0) {
          const input = buildCircuitExpression(inputConnections[0].from.gateId, visited)
          return `¬${input.length > 1 ? `(${input})` : input}`
        }
        return '¬0'
      }
      
      
      // Two-input gates
      const input1Conn = inputConnections.find(c => c.to.point === 'input1')
      const input2Conn = inputConnections.find(c => c.to.point === 'input2')
      
      const input1 = input1Conn ? buildCircuitExpression(input1Conn.from.gateId, visited) : '0'
      const input2 = input2Conn ? buildCircuitExpression(input2Conn.from.gateId, visited) : '0'
      
      const wrapIfNeeded = (expr: string) => expr.length > 1 && !expr.match(/^[A-Z¬]$/) ? `(${expr})` : expr
      
      switch (gate.type) {
        case 'AND':
          return `${wrapIfNeeded(input1)} ∧ ${wrapIfNeeded(input2)}`
        case 'OR':
          return `${wrapIfNeeded(input1)} ∨ ${wrapIfNeeded(input2)}`
        case 'XOR':
          return `${wrapIfNeeded(input1)} ⊕ ${wrapIfNeeded(input2)}`
        case 'NAND':
          return `¬(${wrapIfNeeded(input1)} ∧ ${wrapIfNeeded(input2)})`
        case 'NOR':
          return `¬(${wrapIfNeeded(input1)} ∨ ${wrapIfNeeded(input2)})`
        default:
          return '0'
      }
    }
    
    // Generate equations for each output
    const equations = outputs.map((output, i) => {
      const expr = buildCircuitExpression(output.id)
      return `Y${i + 1} = ${expr}`
    })
    
    if (equationFormat === 'SOP' || equationFormat === 'POS') {
      // Generate from truth table for SOP/POS
      const truthTable = generateTruthTable()
      if (truthTable.rows.length === 0) return equations.join('\n')
      
      const sopTerms: string[][] = outputs.map(() => [])
      const posTerms: string[][] = outputs.map(() => [])
      
      truthTable.rows.forEach(row => {
        const inputVars = row.inputs.map((val, i) => ({
          name: switches[i]?.label || String.fromCharCode(65 + i),
          value: val
        }))
        
        row.outputs.forEach((output, outputIndex) => {
          if (output && equationFormat === 'SOP') {
            // Minterm for SOP
            const term = inputVars.map(v => v.value ? v.name : `¬${v.name}`).join(' ∧ ')
            sopTerms[outputIndex].push(term)
          } else if (!output && equationFormat === 'POS') {
            // Maxterm for POS
            const term = inputVars.map(v => v.value ? `¬${v.name}` : v.name).join(' ∨ ')
            posTerms[outputIndex].push(`(${term})`)
          }
        })
      })
      
      if (equationFormat === 'SOP') {
        return outputs.map((_, i) => 
          `Y${i + 1} = ${sopTerms[i].length > 0 ? sopTerms[i].join(' ∨ ') : '0'}`
        ).join('\n')
      } else {
        return outputs.map((_, i) => 
          `Y${i + 1} = ${posTerms[i].length > 0 ? posTerms[i].join(' ∧ ') : '1'}`
        ).join('\n')
      }
    }
    
    return equations.join('\n')
  }, [gates, connections, equationFormat, generateTruthTable])

  // Parse equation and generate circuit
  // Validate equation syntax
  const validateEquationSyntax = useCallback((equation: string) => {
    // Remove assignment part if present (e.g., "Y = ")
    const expr = equation.replace(/^[A-Z]\s*=\s*/, '').trim()
    
    if (!expr) {
      return { valid: false, error: 'Empty expression' }
    }
    
    // Track bracket balance
    let bracketCount = 0
    const validOperators = ['∧', '∨', '¬', '⊕', '&', '*', '·', '+', '|', '!', '~', '^', '↑', '↓', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR']
    const validVariables = /[A-Z][A-Z0-9]*/
    
    // Check bracket matching
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') bracketCount++
      else if (expr[i] === ')') bracketCount--
      
      if (bracketCount < 0) {
        return { valid: false, error: `Unexpected closing bracket at position ${i + 1}`, position: i }
      }
    }
    
    if (bracketCount > 0) {
      return { 
        valid: false, 
        error: `${bracketCount} unclosed bracket${bracketCount > 1 ? 's' : ''}`, 
        suggestion: ')'.repeat(bracketCount) 
      }
    }
    
    // Check for invalid operators
    const cleanExpr = expr.replace(/[()\s]/g, '')
    let lastWasOperator = true // Start as true to catch leading binary operators
    let i = 0
    
    while (i < cleanExpr.length) {
      const char = cleanExpr[i]
      
      // Check for variables
      if (validVariables.test(char)) {
        if (!lastWasOperator && i > 0) {
          return { valid: false, error: `Missing operator before '${char}' at position ${i + 1}` }
        }
        lastWasOperator = false
        i++
        continue
      }
      
      // Check for operators
      let foundOperator = false
      
      // Check multi-character operators first
      for (const op of ['AND', 'OR', 'NOT', 'XOR']) {
        if (cleanExpr.substring(i, i + op.length).toUpperCase() === op) {
          if (op !== 'NOT' && lastWasOperator) {
            return { valid: false, error: `Binary operator '${op}' requires operands at position ${i + 1}` }
          }
          lastWasOperator = true
          i += op.length
          foundOperator = true
          break
        }
      }
      
      if (!foundOperator) {
        // Check single-character operators
        for (const op of ['∧', '∨', '¬', '⊕', '&', '*', '·', '+', '|', '!', '~', '^']) {
          if (char === op) {
            const isUnary = op === '¬' || op === '!' || op === '~'
            if (!isUnary && lastWasOperator) {
              return { valid: false, error: `Binary operator '${op}' requires operands at position ${i + 1}` }
            }
            lastWasOperator = true
            foundOperator = true
            i++
            break
          }
        }
      }
      
      if (!foundOperator) {
        return { valid: false, error: `Invalid character '${char}' at position ${i + 1}` }
      }
    }
    
    if (lastWasOperator && cleanExpr.length > 0) {
      return { valid: false, error: 'Expression cannot end with an operator' }
    }
    
    return { valid: true }
  }, [])

  // Update syntax validation when equation changes
  useEffect(() => {
    if (equationInput.trim()) {
      const validation = validateEquationSyntax(equationInput)
      if (!validation.valid) {
        setSyntaxError(validation.error || null)
        setBracketSuggestion(validation.suggestion || '')
      } else {
        setSyntaxError(null)
        setBracketSuggestion('')
      }
    } else {
      setSyntaxError(null)
      setBracketSuggestion('')
    }
  }, [equationInput, validateEquationSyntax])

  const parseEquationToCircuit = useCallback((equation: string) => {
    // Validate syntax first
    const validation = validateEquationSyntax(equation)
    if (!validation.valid) {
      return
    }
    
    // Clear existing circuit
    setGates([])
    setConnections([])
    
    // Clean and prepare equation
    const cleanEquation = equation.replace(/\s+/g, ' ').trim()
    
    // Extract output name and expression - support multi-character output names
    const match = cleanEquation.match(/^([A-Z][A-Z0-9]*)\s*=\s*(.+)$/)
    if (!match) {
      alert('Invalid equation format. Use format like: Y = A ∧ B or OUT1 = A ∧ B')
      return
    }
    
    const [, outputName, expression] = match
    
    // Track created gates
    const createdGates: LogicGate[] = []
    const gateConnections: Connection[] = []
    let currentX = 100  // Start from left
    const baseY = 300   // Center vertically
    let gateLevel = new Map<string, number>() // Track depth level of each gate
    let maxLevel = 0
    
    // Create input switches for variables - support multi-character variable names
    const variables = new Set<string>()
    const varRegex = /[A-Z][A-Z0-9]*/g
    let varMatch
    while ((varMatch = varRegex.exec(expression)) !== null) {
      // Skip operator keywords
      if (!['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(varMatch[0])) {
        variables.add(varMatch[0])
      }
    }
    
    const switchMap = new Map<string, string>()
    const switchSpacing = 80
    const switchStartY = baseY - ((variables.size - 1) * switchSpacing) / 2
    
    Array.from(variables).sort().forEach((varName, i) => {
      const switchGate: LogicGate = {
        id: `switch-${varName}`,
        type: 'SWITCH',
        x: currentX,
        y: switchStartY + i * switchSpacing,
        inputs: {},
        output: false,
        label: varName
      }
      createdGates.push(switchGate)
      switchMap.set(varName, switchGate.id)
      gateLevel.set(switchGate.id, 0)
    })
    
    // Helper function to get next X position based on level
    const getXForLevel = (level: number) => {
      return 100 + level * 200 // 200px spacing between levels
    }
    
    // Helper to calculate Y position to center gates vertically
    const getYPosition = (gateCount: number, index: number) => {
      const spacing = 80
      return baseY - ((gateCount - 1) * spacing) / 2 + index * spacing
    }
    
    // Tokenize expression for deterministic parsing
    const tokenize = (expr: string) => {
      const tokens: Array<{type: 'VAR' | 'OP' | 'LPAREN' | 'RPAREN' | 'NOT', value: string}> = []
      let i = 0
      
      while (i < expr.length) {
        const char = expr[i]
        
        // Skip whitespace
        if (/\s/.test(char)) {
          i++
          continue
        }
        
        // Check for multi-character keywords first
        if (/[A-Z]/.test(char)) {
          let keyword = ''
          let j = i
          while (j < expr.length && /[A-Z0-9]/i.test(expr[j])) {
            keyword += expr[j]
            j++
          }
          
          // Check if it's an operator keyword
          const upperKeyword = keyword.toUpperCase()
          if (upperKeyword === 'AND') {
            tokens.push({ type: 'OP', value: 'AND' })
          } else if (upperKeyword === 'OR') {
            tokens.push({ type: 'OP', value: 'OR' })
          } else if (upperKeyword === 'XOR') {
            tokens.push({ type: 'OP', value: 'XOR' })
          } else if (upperKeyword === 'NAND') {
            tokens.push({ type: 'OP', value: 'NAND' })
          } else if (upperKeyword === 'NOR') {
            tokens.push({ type: 'OP', value: 'NOR' })
          } else if (upperKeyword === 'XNOR') {
            tokens.push({ type: 'OP', value: 'XNOR' })
          } else if (upperKeyword === 'NOT') {
            tokens.push({ type: 'NOT', value: 'NOT' })
          } else {
            // It's a variable
            tokens.push({ type: 'VAR', value: keyword })
          }
          i = j
          continue
        }
        
        // Single character operators
        if (char === '(') {
          tokens.push({ type: 'LPAREN', value: '(' })
        } else if (char === ')') {
          tokens.push({ type: 'RPAREN', value: ')' })
        } else if (char === '¬' || char === '!' || char === '~') {
          tokens.push({ type: 'NOT', value: char })
        } else if (char === '∧' || char === '&' || char === '*' || char === '·') {
          tokens.push({ type: 'OP', value: 'AND' })
        } else if (char === '∨' || char === '+' || char === '|') {
          tokens.push({ type: 'OP', value: 'OR' })
        } else if (char === '⊕' || char === '^') {
          tokens.push({ type: 'OP', value: 'XOR' })
        } else if (char === '↑') {
          tokens.push({ type: 'OP', value: 'NAND' })
        } else if (char === '↓') {
          tokens.push({ type: 'OP', value: 'NOR' })
        }
        
        i++
      }
      
      return tokens
    }
    
    // Parse tokens into gate structure
    const parseTokens = (tokens: ReturnType<typeof tokenize>): string => {
      if (tokens.length === 0) return ''
      
      // Declare tempGates at the beginning
      const tempGates = new Map<string, string>()
      
      // Handle single variable
      if (tokens.length === 1 && tokens[0].type === 'VAR') {
        const varName = tokens[0].value
        return tempGates.get(varName) || switchMap.get(varName) || ''
      }
      
      // Handle NOT prefix - only apply to the next token
      if (tokens[0].type === 'NOT') {
        // Check what follows the NOT
        if (tokens.length < 2) return ''
        
        let inputGateId = ''
        let remainingTokens: typeof tokens = []
        
        if (tokens[1].type === 'LPAREN') {
          // NOT applies to a bracketed expression
          let depth = 1
          let closeIndex = 2
          
          while (closeIndex < tokens.length && depth > 0) {
            if (tokens[closeIndex].type === 'LPAREN') depth++
            if (tokens[closeIndex].type === 'RPAREN') depth--
            closeIndex++
          }
          
          if (depth === 0) {
            const bracketTokens = tokens.slice(2, closeIndex - 1)
            inputGateId = parseTokens(bracketTokens)
            remainingTokens = tokens.slice(closeIndex)
          }
        } else if (tokens[1].type === 'VAR') {
          // NOT applies to a single variable
          const varName = tokens[1].value
          inputGateId = tempGates.get(varName) || switchMap.get(varName) || ''
          remainingTokens = tokens.slice(2)
        }
        
        if (!inputGateId) return ''
        
        // Create NOT gate
        const inputLevel = gateLevel.get(inputGateId) || 0
        const notLevel = inputLevel + 1
        maxLevel = Math.max(maxLevel, notLevel)
        
        const notGate: LogicGate = {
          id: `not-${Date.now()}-${Math.random()}`,
          type: 'NOT',
          x: getXForLevel(notLevel),
          y: baseY,
          inputs: { input1: false },
          output: false
        }
        createdGates.push(notGate)
        gateLevel.set(notGate.id, notLevel)
        
        gateConnections.push({
          id: `conn-${Date.now()}-${Math.random()}`,
          from: { gateId: inputGateId, point: 'output' },
          to: { gateId: notGate.id, point: 'input1' }
        })
        
        // If there are remaining tokens, we need to process them with the NOT result
        if (remainingTokens.length > 0) {
          // Replace the NOT and its operand with a placeholder
          const processedTokens = [
            { type: 'VAR' as const, value: `__not_result_${notGate.id}__` },
            ...remainingTokens
          ]
          tempGates.set(`__not_result_${notGate.id}__`, notGate.id)
          return parseTokens(processedTokens)
        }
        
        return notGate.id
      }
      
      // First, replace all bracketed expressions with temporary placeholders
      let processedTokens = [...tokens]
      let tempCounter = 0
      
      // Find and process all bracketed groups from innermost to outermost
      while (true) {
        let foundGroup = false
        let parenDepth = 0
        let groupStart = -1
        
        for (let i = 0; i < processedTokens.length; i++) {
          if (processedTokens[i].type === 'LPAREN') {
            if (parenDepth === 0) groupStart = i
            parenDepth++
          } else if (processedTokens[i].type === 'RPAREN') {
            parenDepth--
            if (parenDepth === 0 && groupStart !== -1) {
              // Process this group
              const groupTokens = processedTokens.slice(groupStart + 1, i)
              const groupResult = parseTokens(groupTokens)
              
              // Replace the group with a placeholder
              const tempName = `TEMP_${tempCounter++}`
              tempGates.set(tempName, groupResult)
              
              processedTokens.splice(groupStart, i - groupStart + 1, {
                type: 'VAR',
                value: tempName
              })
              
              foundGroup = true
              break
            }
          }
        }
        
        if (!foundGroup) break
      }
      
      // Now process the flattened expression
      if (processedTokens.length === 0) return ''
      if (processedTokens.length === 1 && processedTokens[0].type === 'VAR') {
        const varName = processedTokens[0].value
        return tempGates.get(varName) || switchMap.get(varName) || ''
      }
      
      // Process with operators using the flattened tokens
      const processWithOperators = (tokens: typeof processedTokens): string => {
        // Apply operator precedence: NOT > AND/NAND > OR/NOR/XOR/XNOR
        
        // Handle NOT prefix - only apply to next token
        if (tokens[0]?.type === 'NOT') {
          if (tokens.length < 2) return ''
          
          let inputGateId = ''
          let remainingTokens: typeof tokens = []
          
          // NOT only applies to the immediately following token
          if (tokens[1].type === 'VAR') {
            const varName = tokens[1].value
            inputGateId = tempGates.get(varName) || switchMap.get(varName) || ''
            remainingTokens = tokens.slice(2)
          } else {
            // NOT followed by something else - invalid
            return ''
          }
          
          if (!inputGateId) return ''
          
          // Create NOT gate
          const inputLevel = gateLevel.get(inputGateId) || 0
          const notLevel = inputLevel + 1
          maxLevel = Math.max(maxLevel, notLevel)
          
          const notGate: LogicGate = {
            id: `not-${Date.now()}-${Math.random()}`,
            type: 'NOT',
            x: getXForLevel(notLevel),
            y: baseY,
            inputs: { input1: false },
            output: false
          }
          createdGates.push(notGate)
          gateLevel.set(notGate.id, notLevel)
          
          gateConnections.push({
            id: `conn-${Date.now()}-${Math.random()}`,
            from: { gateId: inputGateId, point: 'output' },
            to: { gateId: notGate.id, point: 'input1' }
          })
          
          // If there are remaining tokens, process them with the NOT result
          if (remainingTokens.length > 0) {
            const newTokens = [
              { type: 'VAR' as const, value: `__not_${notGate.id}__` },
              ...remainingTokens
            ]
            tempGates.set(`__not_${notGate.id}__`, notGate.id)
            return processWithOperators(newTokens)
          }
          
          return notGate.id
        }
        
        // Find operators with proper precedence
        let opIndex = -1
        let opType = ''
        
        // Look for OR/NOR (lowest precedence)
        for (let i = tokens.length - 1; i >= 0; i--) {
          if (tokens[i].type === 'OP' && (tokens[i].value === 'OR' || tokens[i].value === 'NOR')) {
            opIndex = i
            opType = tokens[i].value
            break
          }
        }
        
        // If no OR/NOR, look for XOR/XNOR
        if (opIndex === -1) {
          for (let i = tokens.length - 1; i >= 0; i--) {
            if (tokens[i].type === 'OP' && (tokens[i].value === 'XOR' || tokens[i].value === 'XNOR')) {
              opIndex = i
              opType = tokens[i].value
              break
            }
          }
        }
        
        // If no OR/XOR, look for AND/NAND
        if (opIndex === -1) {
          for (let i = tokens.length - 1; i >= 0; i--) {
            if (tokens[i].type === 'OP' && (tokens[i].value === 'AND' || tokens[i].value === 'NAND')) {
              opIndex = i
              opType = tokens[i].value
              break
            }
          }
        }
        
        // If we found an operator, split and process
        if (opIndex !== -1) {
          const leftTokens = tokens.slice(0, opIndex)
          const rightTokens = tokens.slice(opIndex + 1)
          
          const leftGateId = processWithOperators(leftTokens)
          const rightGateId = processWithOperators(rightTokens)
          
          if (!leftGateId || !rightGateId) return leftGateId || rightGateId || ''
          
          // Create the appropriate gate
          if (['NAND', 'NOR', 'XNOR'].includes(opType)) {
            // Create compound gates
            const baseType = opType === 'NAND' ? 'AND' : opType === 'NOR' ? 'OR' : 'XOR'
            
            const leftLevel = gateLevel.get(leftGateId) || 0
            const rightLevel = gateLevel.get(rightGateId) || 0
            const baseLevel = Math.max(leftLevel, rightLevel) + 1
            const notLevel = baseLevel + 1
            maxLevel = Math.max(maxLevel, notLevel)
            
            const baseGate: LogicGate = {
              id: `${baseType.toLowerCase()}-${Date.now()}-${Math.random()}`,
              type: baseType as GateType,
              x: getXForLevel(baseLevel),
              y: baseY,
              inputs: {},
              output: false
            }
            createdGates.push(baseGate)
            gateLevel.set(baseGate.id, baseLevel)
            
            const notGate: LogicGate = {
              id: `not-${Date.now()}-${Math.random()}`,
              type: 'NOT',
              x: getXForLevel(notLevel),
              y: baseY,
              inputs: { input1: false },
              output: false
            }
            createdGates.push(notGate)
            gateLevel.set(notGate.id, notLevel)
            
            gateConnections.push(
              {
                id: `conn-${Date.now()}-${Math.random()}`,
                from: { gateId: leftGateId, point: 'output' },
                to: { gateId: baseGate.id, point: 'input1' }
              },
              {
                id: `conn-${Date.now()}-${Math.random()}`,
                from: { gateId: rightGateId, point: 'output' },
                to: { gateId: baseGate.id, point: 'input2' }
              },
              {
                id: `conn-${Date.now()}-${Math.random()}`,
                from: { gateId: baseGate.id, point: 'output' },
                to: { gateId: notGate.id, point: 'input1' }
              }
            )
            
            return notGate.id
          } else {
            // Create simple gate
            const leftLevel = gateLevel.get(leftGateId) || 0
            const rightLevel = gateLevel.get(rightGateId) || 0
            const gateLevel_ = Math.max(leftLevel, rightLevel) + 1
            maxLevel = Math.max(maxLevel, gateLevel_)
            
            const gate: LogicGate = {
              id: `${opType.toLowerCase()}-${Date.now()}-${Math.random()}`,
              type: opType as GateType,
              x: getXForLevel(gateLevel_),
              y: baseY,
              inputs: {},
              output: false
            }
            createdGates.push(gate)
            gateLevel.set(gate.id, gateLevel_)
            
            gateConnections.push(
              {
                id: `conn-${Date.now()}-${Math.random()}`,
                from: { gateId: leftGateId, point: 'output' },
                to: { gateId: gate.id, point: 'input1' }
              },
              {
                id: `conn-${Date.now()}-${Math.random()}`,
                from: { gateId: rightGateId, point: 'output' },
                to: { gateId: gate.id, point: 'input2' }
              }
            )
            
            return gate.id
          }
        }
        
        // No operators - check for implicit AND
        const varTokens = tokens.filter(t => t.type === 'VAR')
        if (varTokens.length === 0) return ''
        if (varTokens.length === 1) {
          const varName = varTokens[0].value
          return tempGates.get(varName) || switchMap.get(varName) || ''
        }
        
        // Multiple variables with no operators = implicit AND
        if (varTokens.length > 1) {
          // Chain AND gates for implicit AND operation
          let currentGateId = tempGates.get(varTokens[0].value) || switchMap.get(varTokens[0].value) || ''
          
          for (let i = 1; i < varTokens.length; i++) {
            const nextVarId = tempGates.get(varTokens[i].value) || switchMap.get(varTokens[i].value) || ''
            if (!currentGateId || !nextVarId) continue
            
            // Get max level of inputs
            const level1 = gateLevel.get(currentGateId) || 0
            const level2 = gateLevel.get(nextVarId) || 0
            const andLevel = Math.max(level1, level2) + 1
            maxLevel = Math.max(maxLevel, andLevel)
            
            const andGate: LogicGate = {
              id: `and-${Date.now()}-${Math.random()}`,
              type: 'AND',
              x: getXForLevel(andLevel),
              y: baseY,
              inputs: {},
              output: false
            }
            createdGates.push(andGate)
            gateLevel.set(andGate.id, andLevel)
            
            gateConnections.push(
              {
                id: `conn-${Date.now()}-${Math.random()}`,
                from: { gateId: currentGateId, point: 'output' },
                to: { gateId: andGate.id, point: 'input1' }
              },
              {
                id: `conn-${Date.now()}-${Math.random()}`,
                from: { gateId: nextVarId, point: 'output' },
                to: { gateId: andGate.id, point: 'input2' }
              }
            )
            
            currentGateId = andGate.id
          }
          
          return currentGateId
        }
        
        return ''
      }
      
      // Call processWithOperators to handle the flattened expression
      return processWithOperators(processedTokens)
    }
    
    // Process expression with explicit operators
    const processOperatorExpression = (tokens: ReturnType<typeof tokenize>): string => {
      // Apply operator precedence: NOT > AND/NAND > OR/NOR/XOR/XNOR
      
      // Find lowest precedence operator (rightmost OR/NOR/XOR/XNOR)
      let opIndex = -1
      let opType = ''
      
      // First look for OR/NOR (lowest precedence)
      for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].type === 'OP' && (tokens[i].value === 'OR' || tokens[i].value === 'NOR')) {
          opIndex = i
          opType = tokens[i].value
          break
        }
      }
      
      // If no OR/NOR, look for XOR/XNOR
      if (opIndex === -1) {
        for (let i = tokens.length - 1; i >= 0; i--) {
          if (tokens[i].type === 'OP' && (tokens[i].value === 'XOR' || tokens[i].value === 'XNOR')) {
            opIndex = i
            opType = tokens[i].value
            break
          }
        }
      }
      
      // If no OR/NOR/XOR/XNOR, look for AND/NAND
      if (opIndex === -1) {
        for (let i = tokens.length - 1; i >= 0; i--) {
          if (tokens[i].type === 'OP' && (tokens[i].value === 'AND' || tokens[i].value === 'NAND')) {
            opIndex = i
            opType = tokens[i].value
            break
          }
        }
      }
      
      if (opIndex === -1) {
        // No operator, process as single element
        return parseTokens(tokens)
      }
      
      // Split at operator and process recursively
      const leftTokens = tokens.slice(0, opIndex)
      const rightTokens = tokens.slice(opIndex + 1)
      
      const leftGateId = parseTokens(leftTokens)
      const rightGateId = parseTokens(rightTokens)
      
      if (!leftGateId || !rightGateId) return leftGateId || rightGateId || ''
      
      // Create gate for this operation
      if (['NAND', 'NOR', 'XNOR'].includes(opType)) {
        // Create compound gates (gate + NOT)
        const baseType = opType === 'NAND' ? 'AND' : opType === 'NOR' ? 'OR' : 'XOR'
        
        // Get input levels
        const leftLevel = gateLevel.get(leftGateId) || 0
        const rightLevel = gateLevel.get(rightGateId) || 0
        const baseLevel = Math.max(leftLevel, rightLevel) + 1
        const notLevel = baseLevel + 1
        maxLevel = Math.max(maxLevel, notLevel)
        
        // Create the base gate
        const baseGate: LogicGate = {
          id: `${baseType.toLowerCase()}-${Date.now()}-${Math.random()}`,
          type: baseType as GateType,
          x: getXForLevel(baseLevel),
          y: baseY,
          inputs: {},
          output: false
        }
        createdGates.push(baseGate)
        gateLevel.set(baseGate.id, baseLevel)
        
        // Create NOT gate
        const notGate: LogicGate = {
          id: `not-${Date.now()}-${Math.random()}`,
          type: 'NOT',
          x: getXForLevel(notLevel),
          y: baseY,
          inputs: { input1: false },
          output: false
        }
        createdGates.push(notGate)
        gateLevel.set(notGate.id, notLevel)
        
        // Connect inputs to base gate
        gateConnections.push(
          {
            id: `conn-${Date.now()}-${Math.random()}`,
            from: { gateId: leftGateId, point: 'output' },
            to: { gateId: baseGate.id, point: 'input1' }
          },
          {
            id: `conn-${Date.now()}-${Math.random()}`,
            from: { gateId: rightGateId, point: 'output' },
            to: { gateId: baseGate.id, point: 'input2' }
          },
          {
            id: `conn-${Date.now()}-${Math.random()}`,
            from: { gateId: baseGate.id, point: 'output' },
            to: { gateId: notGate.id, point: 'input1' }
          }
        )
        
        return notGate.id
      } else {
        // Create simple gate
        const leftLevel = gateLevel.get(leftGateId) || 0
        const rightLevel = gateLevel.get(rightGateId) || 0
        const gateLevel_ = Math.max(leftLevel, rightLevel) + 1
        maxLevel = Math.max(maxLevel, gateLevel_)
        
        const gateType = opType as GateType
        const gate: LogicGate = {
          id: `${gateType.toLowerCase()}-${Date.now()}-${Math.random()}`,
          type: gateType,
          x: getXForLevel(gateLevel_),
          y: baseY,
          inputs: {},
          output: false
        }
        createdGates.push(gate)
        gateLevel.set(gate.id, gateLevel_)
        
        gateConnections.push(
          {
            id: `conn-${Date.now()}-${Math.random()}`,
            from: { gateId: leftGateId, point: 'output' },
            to: { gateId: gate.id, point: 'input1' }
          },
          {
            id: `conn-${Date.now()}-${Math.random()}`,
            from: { gateId: rightGateId, point: 'output' },
            to: { gateId: gate.id, point: 'input2' }
          }
        )
        
        return gate.id
      }
    }
    
    // Parse the expression
    const tokens = tokenize(expression)
    const finalGateId = parseTokens(tokens)
    
    // Create output gate
    const outputLevel = finalGateId ? (gateLevel.get(finalGateId) || 0) + 1 : maxLevel + 1
    const outputGate: LogicGate = {
      id: `output-${outputName}`,
      type: 'OUTPUT',
      x: getXForLevel(outputLevel),
      y: baseY,
      inputs: { input1: false },
      output: false,
      label: outputName
    }
    createdGates.push(outputGate)
    gateLevel.set(outputGate.id, outputLevel)
    
    if (finalGateId) {
      gateConnections.push({
        id: `conn-${Date.now()}-${Math.random()}`,
        from: { gateId: finalGateId, point: 'output' },
        to: { gateId: outputGate.id, point: 'input1' }
      })
    }
    
    // Adjust Y positions to avoid overlaps
    // Group gates by level
    const gatesByLevel = new Map<number, LogicGate[]>()
    createdGates.forEach(gate => {
      if (gate.type === 'SWITCH') return // Skip switches, they're already positioned
      const level = gateLevel.get(gate.id) || 0
      if (!gatesByLevel.has(level)) {
        gatesByLevel.set(level, [])
      }
      gatesByLevel.get(level)!.push(gate)
    })
    
    // Adjust Y positions for each level
    gatesByLevel.forEach((gates, level) => {
      const yPositions = gates.map((gate, i) => getYPosition(gates.length, i))
      gates.forEach((gate, i) => {
        gate.y = yPositions[i]
      })
    })
    
    // Update state
    setGates(createdGates)
    setConnections(gateConnections)
    setShowEquation(false)
    setEquationInput('')
    // Save to history after parsing equation
    setTimeout(() => saveToHistory(), 0)
  }, [validateEquationSyntax])

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Epic Combined Navigation Bar */}
      <div className="absolute top-2 left-2 right-2 z-30">
        <div className="flex items-center gap-2 bg-cosmic-void/90 backdrop-blur-xl rounded-xl p-2 border border-white/10">
          {/* Switch Button with Visual */}
          <button
            onClick={() => availableGates.includes('SWITCH') && setSelectedTool('SWITCH')}
            disabled={!availableGates.includes('SWITCH')}
            className={`p-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
              !availableGates.includes('SWITCH')
                ? 'bg-gray-800/50 border border-gray-700/50 cursor-not-allowed'
                : selectedTool === 'SWITCH'
                ? `bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-500/50 shadow-lg shadow-amber-500/20`
                : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className={`flex flex-col items-center gap-1 ${!availableGates.includes('SWITCH') ? 'opacity-30' : ''}`}>
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-amber-600/30 rounded-md border border-amber-500/50">
                  <div className="absolute inset-1 bg-amber-500/20 rounded-sm" />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                </div>
              </div>
              <span className={`text-[9px] font-semibold select-none ${
                !availableGates.includes('SWITCH') ? 'text-gray-500' : 'text-amber-300'
              }`}>SWITCH</span>
              {componentLimits && componentLimits.SWITCH !== undefined && (
                <span className={`text-[8px] font-bold ${
                  componentUsage.SWITCH >= componentLimits.SWITCH ? 'text-red-400' : 'text-green-400'
                }`}>
                  x{componentLimits.SWITCH - componentUsage.SWITCH}
                </span>
              )}
            </div>
            {!availableGates.includes('SWITCH') && (
              <>
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              </>
            )}
          </button>

          {/* Output Button with Visual */}
          <button
            onClick={() => availableGates.includes('OUTPUT') && setSelectedTool('OUTPUT')}
            disabled={!availableGates.includes('OUTPUT')}
            className={`p-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
              !availableGates.includes('OUTPUT')
                ? 'bg-gray-800/50 border border-gray-700/50 cursor-not-allowed'
                : selectedTool === 'OUTPUT'
                ? `bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 border border-emerald-500/50 shadow-lg shadow-emerald-500/20`
                : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className={`flex flex-col items-center gap-1 ${!availableGates.includes('OUTPUT') ? 'opacity-30' : ''}`}>
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-full border border-emerald-500/50">
                  <div className="absolute inset-1.5 bg-emerald-500/20 rounded-full animate-pulse" />
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
              </div>
              <span className={`text-[9px] font-semibold select-none ${
                !availableGates.includes('OUTPUT') ? 'text-gray-500' : 'text-emerald-300'
              }`}>OUTPUT</span>
              {componentLimits && componentLimits.OUTPUT !== undefined && (
                <span className={`text-[8px] font-bold ${
                  componentUsage.OUTPUT >= componentLimits.OUTPUT ? 'text-red-400' : 'text-green-400'
                }`}>
                  x{componentLimits.OUTPUT - componentUsage.OUTPUT}
                </span>
              )}
            </div>
            {!availableGates.includes('OUTPUT') && (
              <>
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              </>
            )}
          </button>
          
          <div className="w-px h-12 bg-white/10 mx-1" />
          
          {/* Logic Gates with Visual Previews */}
          {['AND', 'OR', 'NAND', 'NOR', 'XOR', 'NOT'].map((type) => {
            const gateType = type as GateType
            const config = GATE_CONFIG[gateType]
            const isAvailable = availableGates.includes(gateType)
            // Define gate-specific visual representations
            const getGateVisual = () => {
              switch(type) {
                case 'AND':
                  return (
                    <div className="relative w-8 h-8">
                      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-lg border ${config.borderColor}`}>
                        <div className="absolute left-0.5 top-2 w-0.5 h-0.5 bg-violet-400 rounded-full" />
                        <div className="absolute left-0.5 bottom-2 w-0.5 h-0.5 bg-violet-400 rounded-full" />
                        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-violet-400 rounded-full" />
                        <div className="absolute inset-2 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-violet-400">=2</span>
                        </div>
                      </div>
                    </div>
                  )
                case 'OR':
                  return (
                    <div className="relative w-8 h-8">
                      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-lg border ${config.borderColor}`}>
                        <div className="absolute left-0.5 top-2 w-0.5 h-0.5 bg-blue-400 rounded-full" />
                        <div className="absolute left-0.5 bottom-2 w-0.5 h-0.5 bg-blue-400 rounded-full" />
                        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-blue-400 rounded-full" />
                        <div className="absolute inset-2 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-blue-400">≥1</span>
                        </div>
                      </div>
                    </div>
                  )
                case 'NOT':
                  return (
                    <div className="relative w-8 h-8">
                      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-lg border ${config.borderColor}`}>
                        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-rose-400 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-rose-400">⇄</span>
                        </div>
                      </div>
                    </div>
                  )
                case 'XOR':
                  return (
                    <div className="relative w-8 h-8">
                      <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/50`}>
                        <div className="absolute left-0.5 top-2 w-0.5 h-0.5 bg-purple-400 rounded-full" />
                        <div className="absolute left-0.5 bottom-2 w-0.5 h-0.5 bg-purple-400 rounded-full" />
                        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-purple-400 rounded-full" />
                        <div className="absolute inset-2 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-purple-400">=1</span>
                        </div>
                      </div>
                    </div>
                  )
                case 'NAND':
                  return (
                    <div className="relative w-8 h-8">
                      <div className={`absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-500/50`}>
                        <div className="absolute left-0.5 top-2 w-0.5 h-0.5 bg-green-400 rounded-full" />
                        <div className="absolute left-0.5 bottom-2 w-0.5 h-0.5 bg-green-400 rounded-full" />
                        <div className="absolute inset-2 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-green-400">≠2</span>
                        </div>
                      </div>
                    </div>
                  )
                case 'NOR':
                  return (
                    <div className="relative w-8 h-8">
                      <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-500/50`}>
                        <div className="absolute left-0.5 top-2 w-0.5 h-0.5 bg-orange-400 rounded-full" />
                        <div className="absolute left-0.5 bottom-2 w-0.5 h-0.5 bg-orange-400 rounded-full" />
                        <div className="absolute inset-2 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-orange-400">=0</span>
                        </div>
                      </div>
                    </div>
                  )
                default:
                  return null
              }
            }

            return (
              <button
                key={type}
                onClick={() => isAvailable && setSelectedTool(gateType)}
                disabled={!isAvailable}
                className={`p-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
                  !isAvailable
                    ? 'bg-gray-800/50 border border-gray-700/50 cursor-not-allowed'
                    : selectedTool === type
                    ? `bg-gradient-to-r ${config.color} border ${config.borderColor} shadow-lg`
                    : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className={`flex flex-col items-center gap-1 ${!isAvailable ? 'opacity-30' : ''}`}>
                  {getGateVisual()}
                  <span className={`text-[9px] font-semibold select-none ${
                    !isAvailable ? 'text-gray-500' : selectedTool === type ? 'text-white' : 'text-white/60'
                  }`}>{config.symbol}</span>
                  {componentLimits && componentLimits[gateType] !== undefined && (
                    <span className={`text-[8px] font-bold ${
                      componentUsage[gateType] >= componentLimits[gateType] ? 'text-red-400' : 'text-green-400'
                    }`}>
                      x{componentLimits[gateType] - componentUsage[gateType]}
                    </span>
                  )}
                </div>
                {!isAvailable && (
                  <>
                    {/* Grey overlay */}
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]" />
                    {/* Large centered lock */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  </>
                )}
              </button>
            )
          })}
          
          <div className="w-px h-12 bg-white/10 mx-1" />
          
          {/* Middle Section */}
          <div className="flex items-center gap-2 flex-1">
          
          {/* Left spacer */}
          <div className="flex-1" />
          
          {/* Objective Tracker (for puzzle mode) - Centered */}
          {objective && (
            <MiniByteObjective objective={objective} puzzleComplete={puzzleComplete} />
          )}
          
          {/* Right spacer to push tools to the right */}
          <div className="flex-1" />
          
          <button
            onClick={() => setShowTruthTable(!showTruthTable)}
            className={`px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
              showTruthTable
                ? 'bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border border-cosmic-aurora/50 text-cosmic-aurora shadow-lg shadow-cosmic-aurora/20'
                : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs select-none hidden lg:inline">Table</span>
          </button>

          <button
            onClick={() => setShowEquation(!showEquation)}
            className={`px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
              showEquation
                ? 'bg-gradient-to-r from-purple-500/30 to-purple-600/30 border border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/20'
                : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs select-none hidden lg:inline">Equation</span>
          </button>
          
          <button
            onClick={() => {
              if (!isStepwiseMode) {
                // Entering stepwise mode
                setIsStepwiseMode(true)
                setShowStepwise(true)
                // Initialize all switches to OFF
                const switchStates: Record<string, boolean> = {}
                gates.filter(g => g.type === 'SWITCH').forEach(s => {
                  switchStates[s.id] = false
                })
                setStepwiseSwitchStates(switchStates)
                // Initialize to step 0 with all gates off
                setGates(gates.map(g => ({
                  ...g,
                  output: false,
                  inputs: { input1: false, input2: false }
                })))
                setCurrentStep(0)
                setIsPlaying(false)
                setAnimatingGates(new Set())
                setAnimatingConnections(new Set())
              } else {
                // Exiting stepwise mode
                setIsStepwiseMode(false)
                setShowStepwise(false)
                setIsPlaying(false)
                setCurrentStep(0)
                setAnimatingGates(new Set())
                setAnimatingConnections(new Set())
                calculateOutputs()
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
              isStepwiseMode
                ? 'bg-gradient-to-r from-cyan-500/30 to-cyan-600/30 border border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs select-none hidden lg:inline">Step</span>
          </button>
          
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
              snapToGrid
                ? 'bg-gradient-to-r from-blue-500/30 to-blue-600/30 border border-blue-500/50 text-blue-300 shadow-lg shadow-blue-500/20'
                : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
            title={snapToGrid ? 'Disable snap to grid' : 'Enable snap to grid'}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs select-none hidden lg:inline">Grid</span>
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1" />
          
          <button
            onClick={() => {
              if (window.confirm('Clear the entire workspace?')) {
                setGates([])
                setConnections([])
                setSelectedGate(null)
                setConnectingFrom(null)
                setIsPlaying(false)
                setCurrentStep(0)
                setAnimatingGates(new Set())
                setAnimatingConnections(new Set())
                // Save to history after clearing
                setTimeout(() => saveToHistory(), 0)
              }
            }}
            className="px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 bg-white/5 border border-transparent text-white/60 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50"
          >
            <Trash className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs select-none hidden lg:inline">Clear</span>
          </button>
          </div>
          
          {/* Right Section: Project Management */}
          {enableFileOperations && (
            <div className="flex items-center gap-2">
              <div className="w-px h-12 bg-white/10 mx-1" />
              
              {/* Project Name Input */}
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/80 w-32 hover:border-white/20 focus:border-white/30 focus:outline-none transition-colors"
                placeholder="Project name"
              />
              
              {/* Save/Load */}
              <button
                onClick={saveCircuit}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                title="Export as file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              
              <label className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                title="Load from file"
              >
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) loadCircuit(file)
                  }}
                  className="hidden"
                />
              </label>
              
              {/* Projects Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProjects(!showProjects)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  title="Projects"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
              
              {showProjects && (
                <div className="absolute top-full mt-1 right-0 bg-cosmic-void/95 backdrop-blur-xl border border-white/10 rounded-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => {
                      saveToProjects()
                      setShowProjects(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm transition-colors mb-2 flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to projects</span>
                  </button>
                  
                  {savedProjects.length > 0 && (
                    <div className="border-t border-white/10 pt-2">
                      <div className="text-xs text-white/40 px-3 pb-1">Recent Projects</div>
                      {savedProjects.slice().reverse().map((project, i) => {
                        const actualIndex = savedProjects.length - 1 - i
                        return (
                          <div
                            key={i}
                            className="group flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 transition-colors"
                          >
                            <button
                              onClick={() => {
                                const data = JSON.parse(project.data)
                                setGates(data.gates || [])
                                setConnections(data.connections || [])
                                setProjectName(data.projectName || project.name)
                                setShowProjects(false)
                                setTimeout(() => saveToHistory(), 0)
                              }}
                              className="flex-1 text-left text-white/70 hover:text-white text-sm"
                            >
                              <div className="font-medium">{project.name}</div>
                              <div className="text-xs text-white/40">{new Date(project.timestamp).toLocaleString()}</div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm(`Delete project "${project.name}"?`)) {
                                  const newProjects = [...savedProjects]
                                  newProjects.splice(actualIndex, 1)
                                  setSavedProjects(newProjects)
                                  localStorage.setItem('logicGateProjects', JSON.stringify(newProjects))
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            
              {/* Share Button */}
              <button
                onClick={shareCircuit}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                title="Share circuit"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div
        ref={workspaceRef}
        className={`absolute inset-0 select-none ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onClick={handleWorkspaceClick}
        onMouseDown={(e) => {
          // Start panning with middle mouse button or space+left click
          if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            e.preventDefault()
            setIsPanning(true)
            setPanStart({ x: e.clientX, y: e.clientY })
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={(e) => {
          handleMouseUp()
          if (isPanning) {
            setIsPanning(false)
          }
        }}
        onMouseLeave={(e) => {
          handleMouseUp()
          if (isPanning) {
            setIsPanning(false)
          }
        }}
      >
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="grid" width={40 * zoom} height={40 * zoom} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % (40 * zoom)}, ${pan.y % (40 * zoom)})`}>
              <path d={`M ${40 * zoom} 0 L 0 0 0 ${40 * zoom}`} fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1.2" />
              <circle cx={0} cy={0} r="0.5" fill="white" fillOpacity="0.15" />
              <circle cx={40 * zoom} cy={0} r="0.5" fill="white" fillOpacity="0.15" />
              <circle cx={0} cy={40 * zoom} r="0.5" fill="white" fillOpacity="0.15" />
              <circle cx={40 * zoom} cy={40 * zoom} r="0.5" fill="white" fillOpacity="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: draggingGate ? 'none' : 'auto' }}>
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {connections.map(conn => {
            const fromGate = gates.find(g => g.id === conn.from.gateId)
            const toGate = gates.find(g => g.id === conn.to.gateId)
            if (!fromGate || !toGate) return null
            
            const from = getConnectionPoint(fromGate, conn.from.point)
            const to = getConnectionPoint(toGate, conn.to.point)
            const isActive = isStepwiseMode ? animatingConnections.has(conn.id) : fromGate.output
            const energyValue = fromGate.output // The actual boolean value being transmitted
            
            return (
              <g 
                key={conn.id}
                onMouseEnter={() => setHoveredConnection(conn.id)}
                onMouseLeave={() => setHoveredConnection(null)}
              >
                <path
                  d={getConnectionPath(from, to)}
                  fill="none"
                  stroke={isActive ? '#10b981' : '#ffffff33'}
                  strokeWidth={isActive ? "3" : "2"}
                  className={`${draggingGate ? "" : "transition-all duration-300"} ${animatingConnections.has(conn.id) ? 'animate-pulse' : ''}`}
                />
                {isActive && (
                  <>
                    <path
                      d={getConnectionPath(from, to)}
                      fill="none"
                      stroke='#10b981'
                      strokeWidth="8"
                      strokeOpacity="0.3"
                      filter="blur(16px)"
                      style={{ pointerEvents: 'none' }}
                    />
                    <path
                      d={getConnectionPath(from, to)}
                      fill="none"
                      stroke='#10b981'
                      strokeWidth="3"
                      strokeOpacity="0.8"
                      style={{ pointerEvents: 'none' }}
                    />
                  </>
                )}
                {animatingConnections.has(conn.id) && (
                  <>
                    <path
                      d={getConnectionPath(from, to)}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="6"
                      strokeOpacity="0.5"
                      filter="blur(8px)"
                      className="animate-pulse"
                      style={{ pointerEvents: 'none' }}
                    />
                    <circle r="4" fill="#10b981" className="animate-pulse">
                      <animateMotion dur="0.5s" repeatCount="indefinite">
                        <mpath href={`#path-${conn.id}`} />
                      </animateMotion>
                    </circle>
                    <path
                      id={`path-${conn.id}`}
                      d={getConnectionPath(from, to)}
                      fill="none"
                      stroke="none"
                    />
                  </>
                )}
                <path
                  d={getConnectionPath(from, to)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  style={{ pointerEvents: 'stroke', cursor: 'default' }}
                />
                {hoveredConnection === conn.id && (
                  <foreignObject
                    x={(from.x + to.x) / 2 - 12}
                    y={(from.y + to.y) / 2 - 12}
                    width="24"
                    height="24"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <button
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConnections(connections.filter(c => c.id !== conn.id))
                        setHoveredConnection(null)
                        // Save to history after deleting a connection
                        setTimeout(() => saveToHistory(), 0)
                      }}
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </foreignObject>
                )}
              </g>
            )
          })}
            
            {/* Wire preview while connecting */}
            {connectingFrom && (() => {
              const fromGate = gates.find(g => g.id === connectingFrom.gateId)
              if (!fromGate) return null
              
              const from = getConnectionPoint(fromGate, connectingFrom.point)
              const to = mousePosition
              
              return (
                <path
                  d={getConnectionPath(from, to)}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse pointer-events-none"
                  opacity="0.6"
                />
              )
            })()}
          </g>
        </svg>
        
        <AnimatePresence>
          {gates.map(gate => (
            <m.div
              key={gate.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute"
              style={{ 
                left: gate.x * zoom + pan.x - 40 * zoom, 
                top: gate.y * zoom + pan.y - 40 * zoom,
                width: 80 * zoom + 'px',
                height: 80 * zoom + 'px',
                cursor: gate.type === 'SWITCH' ? 'pointer' : 'move'
              }}
              onClick={(e) => handleGateClick(gate.id, e)}
              onMouseDown={(e) => handleGateMouseDown(gate.id, e)}
              onMouseEnter={() => setHoveredGate(gate.id)}
              onMouseLeave={() => setHoveredGate(null)}
            >
              <div className="relative w-full h-full">
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${GATE_CONFIG[gate.type].color} backdrop-blur-sm ${GATE_CONFIG[gate.type].borderColor} transition-all duration-500`}
                  style={{
                    borderRadius: 16 * zoom + 'px',
                    borderWidth: zoom + 'px',
                    borderStyle: 'solid',
                    boxShadow: gate.output ? `0 ${10*zoom}px ${25*zoom}px ${-5*zoom}px rgba(0,0,0,0.1), 0 ${4*zoom}px ${10*zoom}px ${-3*zoom}px rgba(0,0,0,0.07)` : `0 ${zoom}px ${3*zoom}px rgba(0,0,0,0.1)`,
                    ...(animatingGates.has(gate.id) ? {
                      boxShadow: `0 0 0 ${4*zoom}px rgba(34, 211, 238, 0.5), ${gate.output ? `0 ${10*zoom}px ${25*zoom}px ${-5*zoom}px rgba(0,0,0,0.1)` : `0 ${zoom}px ${3*zoom}px rgba(0,0,0,0.1)`}`
                    } : {})
                  }}>
                  {gate.output && (
                    <div 
                      className={`absolute bg-${GATE_CONFIG[gate.type].glowColor}-400/20`}
                      style={{
                        top: -4 * zoom + 'px',
                        left: -4 * zoom + 'px',
                        right: -4 * zoom + 'px',
                        bottom: -4 * zoom + 'px',
                        borderRadius: 16 * zoom + 'px',
                        filter: `blur(${12 * zoom}px)`
                      }} />
                  )}
                  {animatingGates.has(gate.id) && (
                    <div 
                      className="absolute bg-cyan-400/30 animate-pulse"
                      style={{
                        top: -8 * zoom + 'px',
                        left: -8 * zoom + 'px',
                        right: -8 * zoom + 'px',
                        bottom: -8 * zoom + 'px',
                        borderRadius: 16 * zoom + 'px',
                        filter: `blur(${24 * zoom}px)`
                      }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent" style={{ borderRadius: 16 * zoom + 'px' }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                    <span className={`font-medium tracking-wide ${
                      gate.output ? 'text-white' : 'text-white/70'
                    }`} style={{ fontSize: 12 * zoom + 'px' }}>
                      {gate.type === 'SWITCH' ? (gate.output ? 'ON' : 'OFF') : GATE_CONFIG[gate.type].symbol}
                    </span>
                    {gate.type !== 'SWITCH' && gate.type !== 'OUTPUT' && (
                      <span className={`${
                        gate.output ? 'text-white/80' : 'text-white/60'
                      }`} style={{ fontSize: 10 * zoom + 'px', marginTop: 2 * zoom + 'px', fontWeight: 500 }}>
                        {gate.type === 'AND' ? '=2' : 
                         gate.type === 'OR' ? '≥1' : 
                         gate.type === 'NOT' ? '⇄' : 
                         gate.type === 'XOR' ? '=1' : 
                         gate.type === 'NAND' ? '≠2' : 
                         gate.type === 'NOR' ? '=0' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                <AnimatePresence>
                  {hoveredGate === gate.id && (
                    <m.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors z-10"
                      style={{
                        top: -8 * zoom + 'px',
                        right: -8 * zoom + 'px',
                        width: 24 * zoom + 'px',
                        height: 24 * zoom + 'px',
                        borderRadius: '50%',
                        boxShadow: `0 ${4*zoom}px ${6*zoom}px rgba(0,0,0,0.1), 0 ${zoom}px ${2*zoom}px rgba(0,0,0,0.06)`
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setGates(gates.filter(g => g.id !== gate.id))
                        setConnections(connections.filter(c => c.from.gateId !== gate.id && c.to.gateId !== gate.id))
                        setHoveredGate(null)
                        // Save to history after deleting a gate
                        setTimeout(() => saveToHistory(), 0)
                      }}
                    >
                      <X className="text-white" style={{ width: 10 * zoom + 'px', height: 10 * zoom + 'px' }} />
                    </m.button>
                  )}
                </AnimatePresence>
                
                {gate.type === 'SWITCH' ? (
                  // Switch has no inputs, just shows its state
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className={`transition-all duration-300 ${
                          gate.output 
                            ? 'bg-emerald-500 border-emerald-400' 
                            : 'bg-gray-900 border-gray-700'
                        }`}
                        style={{
                          width: '60%',
                          height: '60%',
                          borderRadius: '15%',
                          borderWidth: gate.output ? '2.5%' : '1.25%',
                          borderStyle: 'solid',
                          boxShadow: gate.output ? `0 ${10*zoom}px ${30*zoom}px rgba(16, 185, 129, 0.5)` : 'none'
                        }} />
                    </div>
                    {/* Letter label for switch */}
                    <div className="absolute pointer-events-none" style={{ 
                      top: '12.5%', 
                      left: '12.5%',
                      fontSize: '15%',
                      lineHeight: 1
                    }}>
                      <span className="text-white/90 font-semibold select-none">
                        {gate.label || 'S'}
                      </span>
                    </div>
                  </>
                ) : gate.type === 'OUTPUT' ? (
                  // Output display - shows input state
                  <>
                    <div
                      className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all ${
                        connections.some(c => c.to.gateId === gate.id && c.to.point === 'input1')
                          ? 'border-cosmic-aurora bg-cosmic-aurora/20'
                          : gate.inputs.input1
                          ? 'border-green-400 bg-green-400'
                          : 'border-white/40 bg-cosmic-void hover:border-white'
                      }`}
                      style={{
                        width: 24 * zoom + 'px',
                        height: 24 * zoom + 'px',
                        borderWidth: 2 * zoom + 'px',
                        borderStyle: 'solid'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectionPointClick(gate.id, 'input1', e)
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className={`rounded-full ${gate.inputs.input1 ? 'bg-green-500/50' : 'bg-gray-500/30'} transition-all duration-300`}
                        style={{
                          width: '40%',
                          height: '40%'
                        }} />
                    </div>
                    {/* Label for output gate */}
                    {gate.label && (
                      <div className="absolute pointer-events-none" style={{ 
                        top: '12.5%', 
                        left: '12.5%',
                        fontSize: '15%',
                        lineHeight: 1
                      }}>
                        <span className="text-white/90 font-semibold select-none">
                          {gate.label}
                        </span>
                      </div>
                    )}
                  </>
                ) : gate.type !== 'NOT' ? (
                  <>
                    <div
                      className={`absolute left-0 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 ${
                        gate.inputs.input1
                          ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                      style={{
                        width: 20 * zoom + 'px',
                        height: 20 * zoom + 'px',
                        borderWidth: zoom + 'px',
                        borderStyle: 'solid',
                        boxShadow: connections.some(c => c.to.gateId === gate.id && c.to.point === 'input1') ? `0 0 ${6*zoom}px rgba(34, 211, 238, 0.2)` : gate.inputs.input1 ? `0 0 ${6*zoom}px rgba(52, 211, 153, 0.2)` : 'none'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectionPointClick(gate.id, 'input1', e)
                      }}
                    />
                    <div
                      className={`absolute left-0 top-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 ${
                        gate.inputs.input2
                          ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                      style={{
                        width: 20 * zoom + 'px',
                        height: 20 * zoom + 'px',
                        borderWidth: zoom + 'px',
                        borderStyle: 'solid',
                        boxShadow: connections.some(c => c.to.gateId === gate.id && c.to.point === 'input2') ? `0 0 ${6*zoom}px rgba(34, 211, 238, 0.2)` : gate.inputs.input2 ? `0 0 ${6*zoom}px rgba(52, 211, 153, 0.2)` : 'none'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectionPointClick(gate.id, 'input2', e)
                      }}
                    />
                  </>
                ) : (
                  <div
                    className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 ${
                      gate.inputs.input1
                        ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                    style={{
                      width: 20 * zoom + 'px',
                      height: 20 * zoom + 'px',
                      borderWidth: zoom + 'px',
                      borderStyle: 'solid',
                      boxShadow: connections.some(c => c.to.gateId === gate.id && c.to.point === 'input1') ? `0 0 ${6*zoom}px rgba(34, 211, 238, 0.2)` : gate.inputs.input1 ? `0 0 ${6*zoom}px rgba(52, 211, 153, 0.2)` : 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConnectionPointClick(gate.id, 'input1', e)
                    }}
                  />
                )}
                
                {gate.type !== 'OUTPUT' && (
                  <div
                    className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 ${
                      gate.output
                        ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                    style={{
                      width: 20 * zoom + 'px',
                      height: 20 * zoom + 'px',
                      borderWidth: zoom + 'px',
                      borderStyle: 'solid',
                      boxShadow: gate.output ? `0 0 ${6*zoom}px rgba(52, 211, 153, 0.2)` : 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConnectionPointClick(gate.id, 'output', e)
                    }}
                  />
                )}
              </div>
            </m.div>
          ))}
        </AnimatePresence>
        
        {connectingFrom && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bg-cosmic-aurora rounded-full animate-pulse"
              style={{
                width: 8 * zoom + 'px',
                height: 8 * zoom + 'px',
                left: gates.find(g => g.id === connectingFrom.gateId) 
                  ? getConnectionPoint(gates.find(g => g.id === connectingFrom.gateId)!, connectingFrom.point).x * zoom + pan.x - 4 * zoom
                  : 0,
                top: gates.find(g => g.id === connectingFrom.gateId)
                  ? getConnectionPoint(gates.find(g => g.id === connectingFrom.gateId)!, connectingFrom.point).y * zoom + pan.y - 4 * zoom
                  : 0
              }}
            />
          </div>
        )}
      </div>

      {showTruthTable && (
        <div
          className="absolute z-30"
          style={{
            left: truthTablePos.x,
            top: truthTablePos.y,
            transform: `scale(${truthTableScale})`,
            transformOrigin: 'top left'
          }}
        >
          <div 
            className="bg-cosmic-void/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl min-w-[400px] max-w-[800px]"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setIsDraggingTable(true)
              setTableDragStart({
                x: e.clientX - truthTablePos.x,
                y: e.clientY - truthTablePos.y
              })
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 cursor-move select-none">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Table className="w-4 h-4" />
                Truth Table
              </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setTruthTableScale(Math.max(0.5, truthTableScale - 0.1))
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-white/60 hover:text-white transition-colors px-2 py-1 hover:bg-white/10 rounded"
                  >
                    <span className="text-xs font-bold">−</span>
                  </button>
                  <span className="text-white/60 text-xs min-w-[3rem] text-center select-none">
                    {Math.round(truthTableScale * 100)}%
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setTruthTableScale(Math.min(1.5, truthTableScale + 0.1))
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-white/60 hover:text-white transition-colors px-2 py-1 hover:bg-white/10 rounded"
                  >
                    <span className="text-xs font-bold">+</span>
                  </button>
                  <div className="w-px h-4 bg-white/20 mx-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowTruthTable(false)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
              
              {(() => {
                const truthTable = memoizedTruthTable
                
                if (truthTable.inputs.length === 0 || truthTable.outputs.length === 0) {
                  return (
                    <div className="text-white/60 text-sm text-center py-8">
                      Add switches and outputs to see the truth table
                    </div>
                  )
                }
                
                // Current switch state for highlighting
                const switches = gates.filter(g => g.type === 'SWITCH').sort((a, b) => a.id.localeCompare(b.id))
                const currentStateIndex = truthTable.rows.findIndex(row => 
                  switches.every((sw, i) => sw.output === row.inputs[i])
                )
                
                return (
                  <div>
                    {currentStateIndex >= 0 && (
                      <div className="mb-3 text-xs bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="text-cyan-300 font-medium">Current state: Row {currentStateIndex + 1}</span>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          {truthTable.inputs.map((input, i) => (
                            <th key={`input-${i}`} className="text-white/80 font-medium px-3 py-2 text-center">
                              {input}
                            </th>
                          ))}
                          <th className="w-px" />
                          {truthTable.outputs.map((output, i) => (
                            <th key={`output-${i}`} className="text-white/80 font-medium px-3 py-2 text-center">
                              {output}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {truthTable.rows.map((row, rowIndex) => {
                          // Check if this row matches current switch states
                          const switches = gates.filter(g => g.type === 'SWITCH').sort((a, b) => a.id.localeCompare(b.id))
                          const isCurrentState = switches.every((sw, i) => sw.output === row.inputs[i])
                          
                          return (
                            <tr 
                              key={rowIndex} 
                              className={`border-b border-white/5 transition-all duration-300 ${
                                isCurrentState 
                                  ? 'bg-cyan-500/20 ring-2 ring-cyan-400/50 shadow-lg' 
                                  : 'hover:bg-white/5'
                              }`}
                            >
                            {row.inputs.map((input, i) => (
                              <td key={`input-${i}`} className="text-center px-3 py-2">
                                <div className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${
                                  input 
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                                }`}>
                                  {input ? '1' : '0'}
                                </div>
                              </td>
                            ))}
                            <td className="border-l border-white/10" />
                            {row.outputs.map((output, i) => (
                              <td key={`output-${i}`} className="text-center px-3 py-2">
                                <div className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${
                                  output 
                                    ? 'bg-cosmic-aurora text-white shadow-lg shadow-cosmic-aurora/30' 
                                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                                }`}>
                                  {output ? '1' : '0'}
                                </div>
                              </td>
                            ))}
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  </div>
                )
              })()}
              </div>
            </div>
          </div>
      )}

      {showEquation && (
        <div
          className="absolute z-30"
          style={{
            left: equationPos.x,
            top: equationPos.y,
          }}
        >
          <div 
            className="bg-cosmic-void/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl p-4 min-w-[400px] max-w-[500px]"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setIsDraggingEquation(true)
              setEquationDragStart({
                x: e.clientX - equationPos.x,
                y: e.clientY - equationPos.y
              })
            }}
          >
            <div className="flex items-center justify-between mb-4 cursor-move">
              <h3 className="text-white font-semibold flex items-center gap-2 select-none">
                <Calculator className="w-4 h-4" />
                Equation
              </h3>
              <button
                onClick={() => setShowEquation(false)}
                onMouseDown={(e) => e.stopPropagation()}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1" onMouseDown={(e) => e.stopPropagation()}>
              <button
                onClick={() => setEquationMode('generate')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  equationMode === 'generate'
                    ? 'bg-gradient-to-r from-purple-500/30 to-purple-600/30 border border-purple-500/50 text-purple-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setEquationMode('parse')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  equationMode === 'parse'
                    ? 'bg-gradient-to-r from-purple-500/30 to-purple-600/30 border border-purple-500/50 text-purple-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Parse
              </button>
            </div>
            
            {/* Generate Tab Content */}
            {equationMode === 'generate' && (
              <div onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setEquationFormat('SOP')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      equationFormat === 'SOP'
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    SOP
                  </button>
                  <button
                    onClick={() => setEquationFormat('POS')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      equationFormat === 'POS'
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    POS
                  </button>
                  <button
                    onClick={() => setEquationFormat('SIMPLIFIED')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      equationFormat === 'SIMPLIFIED'
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Simplified
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white/60 text-xs font-semibold mb-1">Invariant Expression</h4>
                    <div className="bg-white/5 rounded-lg p-2 font-mono text-sm text-white/90">
                      <pre className="whitespace-pre-wrap">{generateEquations().invariant || 'Add switches and outputs'}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white/60 text-xs font-semibold mb-1">Evaluated Expression</h4>
                    <div className="bg-white/5 rounded-lg p-2 font-mono text-sm text-white/90">
                      <pre className="whitespace-pre-wrap">{generateEquations().evaluated || 'Add switches and outputs'}</pre>
                    </div>
                  </div>
                  
                  {equationFormat !== 'SIMPLIFIED' && (
                    <div>
                      <h4 className="text-white/60 text-xs font-semibold mb-1">{equationFormat} Form</h4>
                      <div className="bg-white/5 rounded-lg p-2 font-mono text-sm text-white/90">
                        <pre className="whitespace-pre-wrap">{generateEquation() || 'Add switches and outputs'}</pre>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    const equations = generateEquations()
                    const sopPos = equationFormat !== 'SIMPLIFIED' ? generateEquation() : ''
                    const fullText = `Invariant Expression:\n${equations.invariant}\n\nEvaluated Expression:\n${equations.evaluated}${sopPos ? `\n\n${equationFormat} Form:\n${sopPos}` : ''}`
                    if (equations.invariant || equations.evaluated) {
                      navigator.clipboard.writeText(fullText)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }
                  }}
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-all text-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
              </div>
            )}
            
            {/* Parse Tab Content */}
            {equationMode === 'parse' && (
              <div className="space-y-3" onMouseDown={(e) => e.stopPropagation()}>
                <div>
                  <label className="text-white/60 text-xs block mb-1">Enter Boolean Equation</label>
                  <div className="relative">
                    <textarea
                      value={equationInput}
                      onChange={(e) => setEquationInput(e.target.value)}
                      placeholder="Y = A ∧ B ∨ ¬C"
                      className={`w-full bg-white/5 border rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none transition-colors font-mono text-sm ${
                        syntaxError 
                          ? 'border-red-500/50 focus:border-red-500/70' 
                          : 'border-white/20 focus:border-cosmic-aurora/50'
                      }`}
                      rows={3}
                    />
                    {bracketSuggestion && (
                      <span className="absolute bottom-2 right-3 text-white/30 font-mono text-sm pointer-events-none">
                        {bracketSuggestion}
                      </span>
                    )}
                  </div>
                  {syntaxError && (
                    <div className="mt-1 text-red-400 text-xs flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{syntaxError}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-white/40 text-xs space-y-1">
                  <p>Supported operators:</p>
                  <p className="font-mono">∧ AND (&, *, ·)</p>
                  <p className="font-mono">∨ OR (+, |)</p>
                  <p className="font-mono">¬ NOT (!, ~)</p>
                  <p className="font-mono">⊕ XOR (^)</p>
                  <p className="font-mono">↑ NAND</p>
                  <p className="font-mono">↓ NOR</p>
                  <p className="font-mono">XNOR</p>
                  <p className="mt-2">Variables: A-Z, A1, B2, OUT1... (auto-assigned to switches)</p>
                  <p className="mt-1">Examples: Y = (A ∧ B) ∨ C, OUT = A NAND B</p>
                </div>
                
                <button
                  onClick={() => parseEquationToCircuit(equationInput)}
                  disabled={!equationInput.trim() || !!syntaxError}
                  className={`w-full px-4 py-2 rounded-lg transition-all ${
                    !equationInput.trim() || syntaxError
                      ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500/30 to-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:from-indigo-500/40 hover:to-indigo-600/40 cursor-pointer'
                  }`}
                >
                  Generate Circuit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isStepwiseMode && (
        <div
          className="absolute z-30"
          style={{
            left: stepwisePos.x,
            top: stepwisePos.y,
          }}
        >
          <div 
            className="bg-cosmic-void/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl p-4 min-w-[300px]"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setIsDraggingStepwise(true)
              setStepwiseDragStart({
                x: e.clientX - stepwisePos.x,
                y: e.clientY - stepwisePos.y
              })
            }}
          >
            <div className="flex items-center justify-between mb-4 cursor-move">
              <h3 className="text-white font-semibold flex items-center gap-2 select-none">
                <Gauge className="w-4 h-4" />
                Stepwise Visualization
              </h3>
              <button
                onClick={() => {
                  // Exit stepwise mode
                  setIsStepwiseMode(false)
                  setShowStepwise(false)
                  setIsPlaying(false)
                  setCurrentStep(0)
                  setAnimatingGates(new Set())
                  setAnimatingConnections(new Set())
                  calculateOutputs()
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3" onMouseDown={(e) => e.stopPropagation()}>
                  {/* Switch Selection */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="space-y-2">
                      <h4 className="text-white/60 text-xs font-semibold">Select Switch States:</h4>
                      <div className="space-y-1">
                        {gates.filter(g => g.type === 'SWITCH').sort((a, b) => a.id.localeCompare(b.id)).map((switchGate, index) => (
                          <div key={switchGate.id} className="flex items-center justify-between">
                            <span className="text-white/80 text-xs">
                              {switchGate.label || 'S'}
                            </span>
                            <button
                              onClick={() => {
                                const newValue = !switchGate.output
                                // Update both the stepwise state and the actual switch state
                                setStepwiseSwitchStates(prev => ({
                                  ...prev,
                                  [switchGate.id]: newValue
                                }))
                                setGates(gates => gates.map(g => 
                                  g.id === switchGate.id 
                                    ? { ...g, output: newValue } 
                                    : g
                                ))
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                switchGate.output ? 'bg-emerald-500' : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  switchGate.output ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            setIsPlaying(false)
                          } else {
                            // Initialize circuit with selected switch states
                            initializeStepwise()
                            setCurrentStep(0)
                            setIsPlaying(true)
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="text-xs font-medium">{isPlaying ? 'Pause' : 'Auto'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (!isPlaying && currentStep > 0) {
                            calculateStepwise(true, 'backward')
                          }
                        }}
                        disabled={isPlaying || currentStep === 0}
                        className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                          isPlaying || currentStep === 0
                            ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                            : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer'
                        }`}
                      >
                        <SkipForward className="w-3.5 h-3.5 rotate-180" />
                        <span className="text-xs font-medium">Back</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (!isPlaying) {
                            // Manual step
                            if (currentStep === 0) {
                              initializeStepwise()
                            }
                            calculateStepwise(true)
                          }
                        }}
                        disabled={isPlaying}
                        className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                          isPlaying 
                            ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                            : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer'
                        }`}
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Step</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setCurrentStep(0)
                          setIsPlaying(false)
                          setAnimatingGates(new Set())
                          setAnimatingConnections(new Set())
                          initializeStepwise()
                        }}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Reset</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    {stepwiseMessage ? (
                      <div className="text-amber-400 text-xs flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {stepwiseMessage}
                      </div>
                    ) : (
                      <div className={`text-white/60 text-xs ${isPlaying ? 'animate-pulse' : ''}`}>
                        Step {currentStep}
                        {propagationQueue.length === 0 && currentStep > 0 && (
                          <span className="ml-2 text-emerald-400">✓ Complete</span>
                        )}
                      </div>
                    )}
                  </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Zoom Controls */}
      <div className="absolute top-28 right-4 z-20">
        <div className="bg-cosmic-void/90 backdrop-blur-xl rounded-xl p-2 border border-white/10 flex flex-col gap-2">
          <button
            onClick={() => {
              const rect = workspaceRef.current!.getBoundingClientRect()
              const centerX = rect.width / 2
              const centerY = rect.height / 2
              const newZoom = Math.min(MAX_ZOOM, zoom * 1.2)
              
              if (newZoom !== zoom) {
                const worldPos = screenToWorld(centerX, centerY)
                setZoom(newZoom)
                setPan({
                  x: centerX - worldPos.x * newZoom,
                  y: centerY - worldPos.y * newZoom
                })
              }
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Zoom In"
            disabled={zoom >= MAX_ZOOM}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              const rect = workspaceRef.current!.getBoundingClientRect()
              const centerX = rect.width / 2
              const centerY = rect.height / 2
              const newZoom = Math.max(MIN_ZOOM, zoom / 1.2)
              
              if (newZoom !== zoom) {
                const worldPos = screenToWorld(centerX, centerY)
                setZoom(newZoom)
                setPan({
                  x: centerX - worldPos.x * newZoom,
                  y: centerY - worldPos.y * newZoom
                })
              }
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Zoom Out"
            disabled={zoom <= MIN_ZOOM}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          <div className="text-center text-xs text-white/40 font-mono">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
      
      {/* Pan Instructions */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="text-xs text-white/40 bg-cosmic-void/80 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/5">
          <div>Shift+Drag or Middle Mouse to pan</div>
          <div>Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
})

LogicGateWorkspace.displayName = 'LogicGateWorkspace'

export default LogicGateWorkspace