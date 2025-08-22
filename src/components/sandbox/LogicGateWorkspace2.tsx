'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Circle, Square, Triangle, Diamond, Zap, Plus, Trash2, MousePointer2, X, Table } from 'lucide-react'

// Types
type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'SWITCH' | 'OUTPUT'
type ConnectionPoint = 'input1' | 'input2' | 'output'

interface LogicGate {
  id: string
  type: GateType
  x: number
  y: number
  inputs: { input1?: boolean; input2?: boolean }
  output: boolean
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
    color: 'from-teal-500/20 to-teal-600/20',
    borderColor: 'border-teal-500/50',
    glowColor: 'teal',
    logic: (a: boolean, b: boolean) => a !== b,
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

export default function LogicGateWorkspace() {
  const [gates, setGates] = useState<LogicGate[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<{ gateId: string; point: ConnectionPoint } | null>(null)
  const [selectedTool, setSelectedTool] = useState<GateType>('SWITCH')
  const [draggingGate, setDraggingGate] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredGate, setHoveredGate] = useState<string | null>(null)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [hasDragged, setHasDragged] = useState(false)
  const [showStateTable, setShowStateTable] = useState(false)
  const [stateTableScale, setStateTableScale] = useState(1)
  const [stateTablePos, setStateTablePos] = useState({ x: 400, y: 200 })
  const [isDraggingTable, setIsDraggingTable] = useState(false)
  const [tableDragStart, setTableDragStart] = useState({ x: 0, y: 0 })
  const workspaceRef = useRef<HTMLDivElement>(null)

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
    calculateOutputs()
  }, [calculateOutputs])

  const handleWorkspaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!workspaceRef.current || selectedTool === 'wire' || selectedTool === 'delete') return
    
    const rect = workspaceRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Add new gate
    const newGate: LogicGate = {
      id: `gate-${Date.now()}`,
      type: selectedTool as GateType,
      x,
      y,
      inputs: { input1: false, input2: false },
      output: false
    }
    
    setGates([...gates, newGate])
  }

  const handleGateClick = (gateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const gate = gates.find(g => g.id === gateId)
    
    // Only process click if it wasn't a drag
    if (!hasDragged) {
      if (gate && gate.type === 'SWITCH') {
        // Always allow toggling switches regardless of selected tool
        const newGates = gates.map(g => 
          g.id === gateId 
            ? { ...g, output: !g.output }
            : g
        )
        setGates(newGates)
        // Trigger output recalculation after state update
        setTimeout(() => calculateOutputs(), 0)
        return
      }
      
      setSelectedGate(gateId)
    }
  }

  const handleGateMouseDown = (gateId: string, e: React.MouseEvent) => {
    const gate = gates.find(g => g.id === gateId)
    
    if (gate && workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect()
      setDraggingGate(gateId)
      setDragOffset({
        x: e.clientX - rect.left - gate.x,
        y: e.clientY - rect.top - gate.y
      })
      // Track the start position to detect drags
      setDragStartPos({ x: e.clientX, y: e.clientY })
      setHasDragged(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingGate && workspaceRef.current) {
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

      const rect = workspaceRef.current.getBoundingClientRect()
      const newX = e.clientX - rect.left - dragOffset.x
      const newY = e.clientY - rect.top - dragOffset.y
      
      setGates(gates.map(gate => 
        gate.id === draggingGate 
          ? { ...gate, x: newX, y: newY }
          : gate
      ))
    }
  }

  // Global mouse move for state table dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingTable) {
        setStateTablePos({
          x: e.clientX - tableDragStart.x,
          y: e.clientY - tableDragStart.y
        })
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDraggingTable) {
        setIsDraggingTable(false)
      }
    }

    if (isDraggingTable) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDraggingTable, tableDragStart])

  const handleMouseUp = () => {
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
      // Create connection
      if (connectingFrom.gateId !== gateId && 
          ((connectingFrom.point === 'output' && point !== 'output') ||
           (connectingFrom.point !== 'output' && point === 'output'))) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom.point === 'output' ? connectingFrom : { gateId, point },
          to: connectingFrom.point === 'output' ? { gateId, point } : connectingFrom
        }
        setConnections([...connections, newConnection])
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
        return { x: gate.x - halfSize, y: gate.y - ((gate.type === 'NOT' || gate.type === 'OUTPUT') ? 0 : 15) }
      case 'input2':
        return { x: gate.x - halfSize, y: gate.y + 15 }
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

  // Generate state table for the current circuit
  const generateStateTable = useCallback(() => {
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
      
      // Create a copy of gates with updated switch states
      const testGates = gates.map(g => {
        if (g.type === 'SWITCH') {
          const switchIndex = switches.findIndex(s => s.id === g.id)
          return { ...g, output: inputStates[switchIndex] }
        }
        return { ...g }
      })
      
      // Calculate outputs for this input combination
      const outputStates = evaluateCircuit(testGates, connections, outputs.map(o => o.id))
      
      rows.push({
        inputs: inputStates,
        outputs: outputStates
      })
    }
    
    return {
      inputs: switches.map((s, i) => `IN${i + 1}`),
      outputs: outputs.map((o, i) => `OUT${i + 1}`),
      rows
    }
  }, [gates, connections, evaluateCircuit]);

  return (
    <div className="relative w-full h-[600px] bg-cosmic-void/20 rounded-2xl border border-white/10 overflow-hidden select-none">
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-cosmic-void/90 backdrop-blur-xl rounded-xl p-3 border border-white/10">
          <button
            onClick={() => setSelectedTool('SWITCH')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              selectedTool === 'SWITCH'
                ? `bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/20`
                : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="font-semibold text-xs select-none">SWITCH</div>
          </button>
          <button
            onClick={() => setSelectedTool('OUTPUT')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              selectedTool === 'OUTPUT'
                ? `bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/20`
                : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="font-semibold text-xs select-none">OUTPUT</div>
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-1" />
          
          {Object.entries(GATE_CONFIG).filter(([type]) => !['SWITCH', 'OUTPUT'].includes(type)).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSelectedTool(type as GateType)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedTool === type
                  ? `bg-gradient-to-r ${config.color} border ${config.borderColor} text-white shadow-lg shadow-${config.glowColor}-500/20`
                  : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <div className="font-semibold text-xs select-none">{config.symbol}</div>
            </button>
          ))}
          
          <div className="flex-1" />
          
          <button
            onClick={() => setShowStateTable(!showStateTable)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              showStateTable
                ? 'bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border border-cosmic-aurora/50 text-cosmic-aurora shadow-lg shadow-cosmic-aurora/20'
                : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs select-none hidden md:inline">State Table</span>
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-1" />
          
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <MousePointer2 className="w-3 h-3" />
            <span className="hidden md:inline">Click to place • Drag to move • Connect nodes • Hover to delete</span>
            <span className="md:hidden">Place • Move • Connect</span>
          </div>
        </div>
      </div>
      
      <div
        ref={workspaceRef}
        className="absolute inset-0 cursor-crosshair select-none"
        onClick={handleWorkspaceClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: draggingGate ? 'none' : 'auto' }}>
          {connections.map(conn => {
            const fromGate = gates.find(g => g.id === conn.from.gateId)
            const toGate = gates.find(g => g.id === conn.to.gateId)
            if (!fromGate || !toGate) return null
            
            const from = getConnectionPoint(fromGate, conn.from.point)
            const to = getConnectionPoint(toGate, conn.to.point)
            const isActive = fromGate.output
            
            return (
              <g 
                key={conn.id}
                onMouseEnter={() => setHoveredConnection(conn.id)}
                onMouseLeave={() => setHoveredConnection(null)}
              >
                <path
                  d={getConnectionPath(from, to)}
                  fill="none"
                  stroke={isActive ? '#ffffff' : '#ffffff33'}
                  strokeWidth={isActive ? "3" : "2"}
                  className={draggingGate ? "" : "transition-all duration-300"}
                />
                {isActive && (
                  <>
                    <path
                      d={getConnectionPath(from, to)}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="8"
                      strokeOpacity="0.3"
                      filter="blur(16px)"
                      style={{ pointerEvents: 'none' }}
                    />
                    <path
                      d={getConnectionPath(from, to)}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeOpacity="0.8"
                      style={{ pointerEvents: 'none' }}
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
                      }}
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </foreignObject>
                )}
              </g>
            )
          })}
        </svg>
        
        <AnimatePresence>
          {gates.map(gate => (
            <m.div
              key={gate.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute"
              style={{ 
                left: gate.x - 40, 
                top: gate.y - 40,
                cursor: gate.type === 'SWITCH' ? 'pointer' : 'move'
              }}
              onClick={(e) => handleGateClick(gate.id, e)}
              onMouseDown={(e) => handleGateMouseDown(gate.id, e)}
              onMouseEnter={() => setHoveredGate(gate.id)}
              onMouseLeave={() => setHoveredGate(null)}
            >
              <div className="relative w-20 h-20">
                <div className={`absolute inset-0 bg-gradient-to-br ${GATE_CONFIG[gate.type].color} backdrop-blur-sm rounded-2xl border ${GATE_CONFIG[gate.type].borderColor} transition-all duration-500 ${
                  gate.output ? 'shadow-lg' : 'shadow-sm'
                }`}>
                  {gate.output && (
                    <div className={`absolute -inset-1 bg-${GATE_CONFIG[gate.type].glowColor}-400/20 rounded-2xl blur-xl`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent rounded-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center select-none">
                    <span className={`font-medium tracking-wide ${gate.type === 'SWITCH' ? 'text-xs' : 'text-xs'} ${
                      gate.output ? 'text-white' : 'text-white/70'
                    }`}>
                      {gate.type === 'SWITCH' ? (gate.output ? 'ON' : 'OFF') : GATE_CONFIG[gate.type].symbol}
                    </span>
                  </div>
                </div>
                
                <AnimatePresence>
                  {hoveredGate === gate.id && (
                    <m.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setGates(gates.filter(g => g.id !== gate.id))
                        setConnections(connections.filter(c => c.from.gateId !== gate.id && c.to.gateId !== gate.id))
                        setHoveredGate(null)
                      }}
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </m.button>
                  )}
                </AnimatePresence>
                
                {gate.type === 'SWITCH' ? (
                  // Switch has no inputs, just shows its state
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-12 h-12 rounded-xl transition-all duration-300 ${
                      gate.output 
                        ? 'bg-emerald-500 border-2 border-emerald-400 shadow-lg shadow-emerald-500/50' 
                        : 'bg-gray-900 border border-gray-700'
                    }`} />
                  </div>
                ) : gate.type === 'OUTPUT' ? (
                  // Output display - shows input state
                  <>
                    <div
                      className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 cursor-pointer transition-all ${
                        connections.some(c => c.to.gateId === gate.id && c.to.point === 'input1')
                          ? 'border-cosmic-aurora bg-cosmic-aurora/20'
                          : gate.inputs.input1
                          ? 'border-green-400 bg-green-400'
                          : 'border-white/40 bg-cosmic-void hover:border-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectionPointClick(gate.id, 'input1', e)
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-8 h-8 rounded-full ${gate.inputs.input1 ? 'bg-green-500/50' : 'bg-gray-500/30'} transition-all duration-300`} />
                    </div>
                  </>
                ) : gate.type !== 'NOT' ? (
                  <>
                    <div
                      className={`absolute left-0 top-1/3 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border cursor-pointer transition-all duration-300 ${
                        connections.some(c => c.to.gateId === gate.id && c.to.point === 'input1')
                          ? 'border-cosmic-aurora/60 bg-cosmic-aurora/10 shadow-sm shadow-cosmic-aurora/20'
                          : gate.inputs.input1
                          ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectionPointClick(gate.id, 'input1', e)
                      }}
                    />
                    <div
                      className={`absolute left-0 top-2/3 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border cursor-pointer transition-all duration-300 ${
                        connections.some(c => c.to.gateId === gate.id && c.to.point === 'input2')
                          ? 'border-cosmic-aurora/60 bg-cosmic-aurora/10 shadow-sm shadow-cosmic-aurora/20'
                          : gate.inputs.input2
                          ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectionPointClick(gate.id, 'input2', e)
                      }}
                    />
                  </>
                ) : (
                  <div
                    className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border cursor-pointer transition-all duration-300 ${
                      connections.some(c => c.to.gateId === gate.id && c.to.point === 'input1')
                        ? 'border-cosmic-aurora/60 bg-cosmic-aurora/10 shadow-sm shadow-cosmic-aurora/20'
                        : gate.inputs.input1
                        ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConnectionPointClick(gate.id, 'input1', e)
                    }}
                  />
                )}
                
                {gate.type !== 'OUTPUT' && (
                  <div
                    className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border cursor-pointer transition-all duration-300 ${
                      gate.output
                        ? 'border-emerald-400/60 bg-emerald-400/20 shadow-sm shadow-emerald-400/20'
                        : 'border-white/20 bg-white/5'
                    } hover:border-cosmic-aurora/60 hover:bg-cosmic-aurora/10`}
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
            <div className="absolute w-2 h-2 bg-cosmic-aurora rounded-full animate-pulse"
              style={{
                left: gates.find(g => g.id === connectingFrom.gateId) 
                  ? getConnectionPoint(gates.find(g => g.id === connectingFrom.gateId)!, connectingFrom.point).x - 4
                  : 0,
                top: gates.find(g => g.id === connectingFrom.gateId)
                  ? getConnectionPoint(gates.find(g => g.id === connectingFrom.gateId)!, connectingFrom.point).y - 4
                  : 0
              }}
            />
          </div>
        )}
      </div>

      {showStateTable && (
        <div
          className="absolute z-30"
          style={{
            left: stateTablePos.x,
            top: stateTablePos.y,
            transform: `scale(${stateTableScale})`,
            transformOrigin: 'top left'
          }}
        >
          <div 
            className="bg-cosmic-void/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl min-w-[400px] max-w-[800px]"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setIsDraggingTable(true)
              setTableDragStart({
                x: e.clientX - stateTablePos.x,
                y: e.clientY - stateTablePos.y
              })
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 cursor-move select-none">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Table className="w-4 h-4" />
                State Table
              </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setStateTableScale(Math.max(0.5, stateTableScale - 0.1))
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-white/60 hover:text-white transition-colors px-2 py-1 hover:bg-white/10 rounded"
                  >
                    <span className="text-xs font-bold">−</span>
                  </button>
                  <span className="text-white/60 text-xs min-w-[3rem] text-center select-none">
                    {Math.round(stateTableScale * 100)}%
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setStateTableScale(Math.min(1.5, stateTableScale + 0.1))
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
                      setShowStateTable(false)
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
                const stateTable = generateStateTable()
                
                if (stateTable.inputs.length === 0 || stateTable.outputs.length === 0) {
                  return (
                    <div className="text-white/60 text-sm text-center py-8">
                      Add switches and outputs to see the state table
                    </div>
                  )
                }
                
                // Find current state row - use exact same sorting as generateStateTable
                const orderedSwitches = gates.filter(g => g.type === 'SWITCH').sort((a, b) => a.id.localeCompare(b.id))
                const currentInputs = orderedSwitches.map(s => s.output)
                const activeRowIndex = stateTable.rows.findIndex(row => 
                  row.inputs.every((input, i) => input === currentInputs[i])
                )
                
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          {stateTable.inputs.map((input, i) => (
                            <th key={`input-${i}`} className="text-white/80 font-medium px-3 py-2 text-center">
                              {input}
                            </th>
                          ))}
                          <th className="w-px" />
                          {stateTable.outputs.map((output, i) => (
                            <th key={`output-${i}`} className="text-white/80 font-medium px-3 py-2 text-center">
                              {output}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stateTable.rows.map((row, rowIndex) => (
                          <tr 
                            key={rowIndex} 
                            className={`border-b border-white/5 transition-all duration-300 ${
                              rowIndex === activeRowIndex
                                ? 'bg-blue-400/20 border-blue-400/30 shadow-lg shadow-blue-400/10'
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}