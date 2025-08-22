'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useUnlockedConcepts } from '@/hooks/useUnlockedConcepts'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, Clock, Brain, ArrowRight, BookOpen, X, Binary, Circle, Square, CheckCircle2, Zap, ToggleLeft, ToggleRight, Power, Star, Plus, MousePointer2, Table, Shield, Cpu, Activity } from 'lucide-react'
import { dictionaryService } from '@/lib/dictionaryService'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept } from '@/components/lesson/ConceptViewer'

type LessonPhase = 'slide-1' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9' | 'slide-10' | 'slide-11' | 'complete'
type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR'

// Interactive Logic Gate Component from gates-and-tables-1
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
      case 'XOR':
        return inputs[0] !== inputs[1]
      case 'NAND':
        return !(inputs[0] && inputs[1])
      case 'NOR':
        return !(inputs[0] || inputs[1])
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
    },
    XOR: {
      bg: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-500/50',
      text: 'text-purple-400',
      shadow: 'shadow-purple-500/20'
    },
    NAND: {
      bg: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      shadow: 'shadow-green-500/20'
    },
    NOR: {
      bg: 'from-amber-500/20 to-amber-600/20',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      shadow: 'shadow-amber-500/20'
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

// State Table Component from gates-and-tables-1
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
      case 'XOR':
        return [
          { inputs: [false, false], output: false },
          { inputs: [false, true], output: true },
          { inputs: [true, false], output: true },
          { inputs: [true, true], output: false }
        ]
      case 'NAND':
        return [
          { inputs: [false, false], output: true },
          { inputs: [false, true], output: true },
          { inputs: [true, false], output: true },
          { inputs: [true, true], output: false }
        ]
      case 'NOR':
        return [
          { inputs: [false, false], output: true },
          { inputs: [false, true], output: false },
          { inputs: [true, false], output: false },
          { inputs: [true, true], output: false }
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
    NOT: 'border-rose-500/50 bg-rose-500/10',
    XOR: 'border-purple-500/50 bg-purple-500/10',
    NAND: 'border-green-500/50 bg-green-500/10',
    NOR: 'border-amber-500/50 bg-amber-500/10'
  }[gateType]
  
  const highlightColor = {
    AND: 'bg-violet-500/20',
    OR: 'bg-blue-500/20',
    NOT: 'bg-rose-500/20',
    XOR: 'bg-purple-500/20',
    NAND: 'bg-green-500/20',
    NOR: 'bg-amber-500/20'
  }[gateType]
  
  const highlightBorderColor = {
    AND: '#a78bfa', // violet-400
    OR: '#60a5fa',  // blue-400
    NOT: '#fb7185',  // rose-400
    XOR: '#c084fc',  // purple-400
    NAND: '#4ade80', // green-400
    NOR: '#fbbf24'   // amber-400
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

// XOR Gate Interactive Component using the new system
function XORGateDemo() {
  const [xorInputs, setXorInputs] = useState([false, false])
  const [xorVisitedStates, setXorVisitedStates] = useState<Set<string>>(() => new Set(['00']))
  
  const getStateKey = (inputs: boolean[]) => inputs.map(i => i ? '1' : '0').join('')
  
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full gap-6"
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl font-light text-white/90">The <span className="font-bold text-purple-400">XOR</span> Gate</h2>
        <p className="text-white/60 text-center max-w-md">
          Output is TRUE only when inputs are different
        </p>
        {/* Progress indicator */}
        <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/30">
          <span className="text-purple-400 font-medium">States Explored:</span>
          <span className="text-white font-bold">{xorVisitedStates.size}/4</span>
          {xorVisitedStates.size === 4 && (
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
            type="XOR" 
            inputs={xorInputs}
            size="large"
            onInputChange={(index, value) => {
              const newInputs = [...xorInputs]
              newInputs[index] = value
              setXorInputs(newInputs)
              // Track visited state
              const stateKey = getStateKey(newInputs)
              setXorVisitedStates(prev => new Set([...prev, stateKey]))
            }}
          />
          
          {/* Visual state tracker */}
          <div className="grid grid-cols-4 gap-2">
            {['00', '01', '10', '11'].map(state => (
              <m.div
                key={state}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm transition-all ${
                  xorVisitedStates.has(state)
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-gray-800/50 border-gray-600/50 text-gray-500'
                }`}
                animate={xorVisitedStates.has(state) ? { scale: 1.1 } : {}}
              >
                {xorVisitedStates.has(state) ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  state
                )}
              </m.div>
            ))}
          </div>
        </div>
        <StateTable gateType="XOR" currentInputs={xorInputs} revealed={true} />
      </div>
    </m.div>
  )
}

// NAND Gate Interactive Component using the new system
function NANDGateDemo() {
  const [nandInputs, setNandInputs] = useState([false, false])
  const [nandVisitedStates, setNandVisitedStates] = useState<Set<string>>(() => new Set(['00']))
  
  const getStateKey = (inputs: boolean[]) => inputs.map(i => i ? '1' : '0').join('')
  
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full gap-6"
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl font-light text-white/90">The <span className="font-bold text-green-400">NAND</span> Gate</h2>
        <p className="text-white/60 text-center max-w-md">
          Output is FALSE only when both inputs are TRUE
        </p>
        {/* Progress indicator */}
        <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/30">
          <span className="text-green-400 font-medium">States Explored:</span>
          <span className="text-white font-bold">{nandVisitedStates.size}/4</span>
          {nandVisitedStates.size === 4 && (
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
            type="NAND" 
            inputs={nandInputs}
            size="large"
            onInputChange={(index, value) => {
              const newInputs = [...nandInputs]
              newInputs[index] = value
              setNandInputs(newInputs)
              // Track visited state
              const stateKey = getStateKey(newInputs)
              setNandVisitedStates(prev => new Set([...prev, stateKey]))
            }}
          />
          
          {/* Visual state tracker */}
          <div className="grid grid-cols-4 gap-2">
            {['00', '01', '10', '11'].map(state => (
              <m.div
                key={state}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm transition-all ${
                  nandVisitedStates.has(state)
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-gray-800/50 border-gray-600/50 text-gray-500'
                }`}
                animate={nandVisitedStates.has(state) ? { scale: 1.1 } : {}}
              >
                {nandVisitedStates.has(state) ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  state
                )}
              </m.div>
            ))}
          </div>
        </div>
        <StateTable gateType="NAND" currentInputs={nandInputs} revealed={true} />
      </div>
    </m.div>
  )
}

// NOR Gate Interactive Component using the new system
function NORGateDemo() {
  const [norInputs, setNorInputs] = useState([false, false])
  const [norVisitedStates, setNorVisitedStates] = useState<Set<string>>(() => new Set(['00']))
  
  const getStateKey = (inputs: boolean[]) => inputs.map(i => i ? '1' : '0').join('')
  
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full gap-6"
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl font-light text-white/90">The <span className="font-bold text-amber-400">NOR</span> Gate</h2>
        <p className="text-white/60 text-center max-w-md">
          Output is TRUE only when both inputs are FALSE
        </p>
        {/* Progress indicator */}
        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30">
          <span className="text-amber-400 font-medium">States Explored:</span>
          <span className="text-white font-bold">{norVisitedStates.size}/4</span>
          {norVisitedStates.size === 4 && (
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
            type="NOR" 
            inputs={norInputs}
            size="large"
            onInputChange={(index, value) => {
              const newInputs = [...norInputs]
              newInputs[index] = value
              setNorInputs(newInputs)
              // Track visited state
              const stateKey = getStateKey(newInputs)
              setNorVisitedStates(prev => new Set([...prev, stateKey]))
            }}
          />
          
          {/* Visual state tracker */}
          <div className="grid grid-cols-4 gap-2">
            {['00', '01', '10', '11'].map(state => (
              <m.div
                key={state}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm transition-all ${
                  norVisitedStates.has(state)
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-gray-800/50 border-gray-600/50 text-gray-500'
                }`}
                animate={norVisitedStates.has(state) ? { scale: 1.1 } : {}}
              >
                {norVisitedStates.has(state) ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  state
                )}
              </m.div>
            ))}
          </div>
        </div>
        <StateTable gateType="NOR" currentInputs={norInputs} revealed={true} />
      </div>
    </m.div>
  )
}

// XOR Introduction Animation Component
function XORIntroAnimation() {
  const [sameInputState, setSameInputState] = useState(0) // 0 for 00, 1 for 11
  const [diffInputState, setDiffInputState] = useState(0) // 0 for 01, 1 for 10
  
  // Alternate between same input states (00 and 11)
  useEffect(() => {
    const interval = setInterval(() => {
      setSameInputState(prev => prev === 0 ? 1 : 0)
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  // Alternate between different input states (01 and 10)
  useEffect(() => {
    const interval = setInterval(() => {
      setDiffInputState(prev => prev === 0 ? 1 : 0)
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  const sameInputs = sameInputState === 0 ? [false, false] : [true, true]
  const diffInputs = diffInputState === 0 ? [false, true] : [true, false]
  
  return (
    <div className="flex justify-center gap-8 mb-8">
      {/* Same Inputs Box */}
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 min-w-[180px]"
      >
        <div className="text-sm text-gray-400 mb-3">Same Inputs</div>
        <div className="flex gap-2 justify-center mb-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
              sameInputs[0] 
                ? 'bg-green-500/20 border border-green-500' 
                : 'bg-gray-700/50 border border-gray-600'
            }`}
          >
            <span className={`font-bold transition-all duration-300 ${sameInputs[0] ? 'text-green-400' : 'text-gray-500'}`}>
              {sameInputs[0] ? '1' : '0'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
              sameInputs[1] 
                ? 'bg-green-500/20 border border-green-500' 
                : 'bg-gray-700/50 border border-gray-600'
            }`}
          >
            <span className={`font-bold transition-all duration-300 ${sameInputs[1] ? 'text-green-400' : 'text-gray-500'}`}>
              {sameInputs[1] ? '1' : '0'}
            </span>
          </div>
        </div>
        <div className="text-2xl text-gray-500">↓</div>
        <div className="w-16 h-16 bg-gray-800/50 border-2 border-gray-600 rounded-xl flex items-center justify-center mx-auto mt-3">
          <span className="text-2xl text-gray-500 font-bold">0</span>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center transition-all duration-300">
          {sameInputs[0] ? '1,1' : '0,0'} → FALSE
        </div>
      </m.div>
      
      {/* Different Inputs Box */}
      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/50 min-w-[180px]"
      >
        <div className="text-sm text-purple-300 mb-3">Different Inputs</div>
        <div className="flex gap-2 justify-center mb-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
              diffInputs[0] 
                ? 'bg-green-500/20 border border-green-500' 
                : 'bg-gray-700/50 border border-gray-600'
            }`}
          >
            <span className={`font-bold transition-all duration-300 ${diffInputs[0] ? 'text-green-400' : 'text-gray-500'}`}>
              {diffInputs[0] ? '1' : '0'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
              diffInputs[1] 
                ? 'bg-green-500/20 border border-green-500' 
                : 'bg-gray-700/50 border border-gray-600'
            }`}
          >
            <span className={`font-bold transition-all duration-300 ${diffInputs[1] ? 'text-green-400' : 'text-gray-500'}`}>
              {diffInputs[1] ? '1' : '0'}
            </span>
          </div>
        </div>
        <div className="text-2xl text-purple-400">↓</div>
        <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-xl flex items-center justify-center mx-auto mt-3">
          <span className="text-2xl text-green-400 font-bold">1</span>
        </div>
        <div className="text-xs text-purple-300 mt-2 text-center transition-all duration-300">
          {diffInputs[0] ? '1,0' : '0,1'} → TRUE
        </div>
      </m.div>
    </div>
  )
}

// Simplified Functional Completeness Demo
function FunctionalCompletenessDemo() {
  const [selectedExample, setSelectedExample] = useState<'NOT' | 'AND' | 'OR'>('NOT')
  const [selectedGate, setSelectedGate] = useState<'NAND' | 'NOR'>('NAND')
  
  const examples = {
    NAND: {
      NOT: 'NAND(A, A)',
      AND: 'NAND(NAND(A, B), NAND(A, B))',
      OR: 'NAND(NAND(A, A), NAND(B, B))'
    },
    NOR: {
      NOT: 'NOR(A, A)',
      OR: 'NOR(NOR(A, B), NOR(A, B))',
      AND: 'NOR(NOR(A, A), NOR(B, B))'
    }
  }
  
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full gap-6"
    >
      <h3 className="text-2xl font-light text-white/90">Building Gates from <span className="font-bold">{selectedGate}</span></h3>
      
      {/* Gate Selector */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedGate('NAND')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedGate === 'NAND' 
              ? 'bg-green-500/20 border border-green-400 text-green-400' 
              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
          }`}
        >
          Use NAND
        </button>
        <button
          onClick={() => setSelectedGate('NOR')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedGate === 'NOR' 
              ? 'bg-amber-500/20 border border-amber-400 text-amber-400' 
              : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
          }`}
        >
          Use NOR
        </button>
      </div>
      
      {/* Example Selector */}
      <div className="flex gap-3">
        {(['NOT', 'AND', 'OR'] as const).map(gate => (
          <button
            key={gate}
            onClick={() => setSelectedExample(gate)}
            className={`px-6 py-3 rounded-lg transition-all ${
              selectedExample === gate
                ? 'bg-purple-500/20 border border-purple-400 text-purple-400'
                : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
            }`}
          >
            Build {gate}
          </button>
        ))}
      </div>
      
      {/* Formula Display */}
      <div className="bg-black/40 rounded-xl p-6 border border-white/10">
        <p className="text-white/60 text-sm mb-2">Formula:</p>
        <p className={`font-mono text-lg ${selectedGate === 'NAND' ? 'text-green-400' : 'text-amber-400'}`}>
          {selectedExample}(A, B) = {examples[selectedGate][selectedExample]}
        </p>
      </div>
    </m.div>
  )
}

function GatesAndTables2Lesson() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const { unlockConcept } = useUnlockedConcepts()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-1')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [stardustParticles, setStardustParticles] = useState<Array<{ id: number; x: number; y: number; collected: boolean }>>([])
  const [isCollectingStardust, setIsCollectingStardust] = useState(false)
  
  // Notebook state
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [showNotebook, setShowNotebook] = useState(false)
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  
  // Track unlocked concepts
  const [xorUnlocked, setXorUnlocked] = useState(false)
  const [universalGatesUnlocked, setUniversalGatesUnlocked] = useState(false)
  
  // Dialog system - using Byte NPC
  const dialogs = {
    'slide-1': [
      { speaker: 'Byte', text: "Welcome back! You've mastered AND, OR, and NOT gates.", animation: 'wave' },
      { speaker: 'Byte', text: "Now let's explore the more sophisticated gates: XOR, NAND, and NOR.", animation: 'teaching' },
      { speaker: 'Byte', text: "These gates have special properties that make them incredibly powerful!", animation: 'excited' }
    ],
    'slide-2': [
      { speaker: 'Byte', text: "First up: XOR - the Exclusive OR gate.", animation: 'explain' },
      { speaker: 'Byte', text: "The XOR rule: Output is TRUE when inputs are DIFFERENT (one TRUE, one FALSE).", animation: 'teaching' },
      { speaker: 'Byte', text: "Think of it as asking: 'Either this OR that, but NOT both!'", animation: 'thinking' }
    ],
    'slide-3': [
      { speaker: 'Byte', text: "XOR is perfect for detecting differences!", animation: 'excited' },
      { speaker: 'Byte', text: "It's used in error detection, encryption, and arithmetic circuits.", animation: 'teaching' },
      { speaker: 'Byte', text: "Try all four combinations and notice the pattern!", animation: 'point' }
    ],
    'slide-4': [
      { speaker: 'Byte', text: "Now let's build a NAND gate - it's just AND with a NOT attached!", animation: 'explain' },
      { speaker: 'Byte', text: "Watch how we connect an AND gate to a NOT gate...", animation: 'teaching' },
      { speaker: 'Byte', text: "This combination is so common, we gave it its own name: NAND!", animation: 'happy' }
    ],
    'slide-5': [
      { speaker: 'Byte', text: "The NAND rule: Output is FALSE only when BOTH inputs are TRUE. Otherwise it's TRUE!", animation: 'teaching' },
      { speaker: 'Byte', text: "It's literally the opposite of AND - NOT AND = NAND!", animation: 'explain' },
      { speaker: 'Byte', text: "But here's the amazing part: NAND is a universal gate!", animation: 'amazed' }
    ],
    'slide-6': [
      { speaker: 'Byte', text: "Similarly, let's build a NOR gate - it's OR with a NOT attached.", animation: 'explain' },
      { speaker: 'Byte', text: "Watch the OR gate connect to the NOT gate...", animation: 'teaching' },
      { speaker: 'Byte', text: "This gives us NOR - NOT OR!", animation: 'happy' }
    ],
    'slide-7': [
      { speaker: 'Byte', text: "The NOR rule: Output is TRUE only when BOTH inputs are FALSE. Any TRUE input makes it FALSE!", animation: 'teaching' },
      { speaker: 'Byte', text: "It's the opposite of OR - if either input is TRUE, NOR outputs FALSE.", animation: 'explain' },
      { speaker: 'Byte', text: "And guess what? NOR is also a universal gate!", animation: 'excited' }
    ],
    'slide-8': [
      { speaker: 'Byte', text: "Universal gates are special - you can build ANY logic circuit using just one type!", animation: 'amazed' },
      { speaker: 'Byte', text: "Every computer chip could theoretically be made from only NAND gates.", animation: 'teaching' },
      { speaker: 'Byte', text: "This is called 'functional completeness' - one gate to rule them all!", animation: 'excited' }
    ],
    'slide-9': [
      { speaker: 'Byte', text: "Let me show you how to build other gates from just NAND or NOR.", animation: 'teaching' },
      { speaker: 'Byte', text: "This isn't just theory - real processors use this principle!", animation: 'explain' },
      { speaker: 'Byte', text: "It simplifies manufacturing and reduces costs.", animation: 'happy' }
    ],
    'slide-10': [
      { speaker: 'Byte', text: "Why use XOR, NAND, and NOR in real circuits?", animation: 'thinking' },
      { speaker: 'Byte', text: "XOR: Perfect for comparison and arithmetic operations.", animation: 'explain' },
      { speaker: 'Byte', text: "NAND/NOR: Simpler to manufacture, more efficient in silicon.", animation: 'teaching' }
    ],
    'slide-11': [
      { speaker: 'Byte', text: "Congratulations! You now understand all the fundamental logic gates!", animation: 'celebrate' },
      { speaker: 'Byte', text: "From simple switches to universal gates - you've come far!", animation: 'proud' },
      { speaker: 'Byte', text: "Next, we'll combine these gates to build actual computing circuits!", animation: 'excited' }
    ]
  }
  
  const getCurrentDialog = () => {
    const phaseDialogs = dialogs[currentPhase as keyof typeof dialogs]
    if (phaseDialogs && phaseDialogs[currentDialogIndex]) {
      return phaseDialogs[currentDialogIndex]
    }
    return null
  }
  
  // Add notebook entry helper
  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
    const newEntry: NotebookEntry = {
      ...entry,
      id: Math.random().toString(),
      timestamp: Date.now()
    }
    setNotebookEntries(prev => [...prev, newEntry])
  }
  
  // Handle phase transitions
  const handleNext = () => {
    const currentDialog = getCurrentDialog()
    const phaseDialogs = dialogs[currentPhase as keyof typeof dialogs]
    
    if (currentDialogIndex < phaseDialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Move to next phase
      const phases: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10', 'slide-11']
      const currentIndex = phases.indexOf(currentPhase)
      if (currentIndex < phases.length - 1) {
        const nextPhase = phases[currentIndex + 1]
        
        // Unlock concepts at specific points
        if (currentPhase === 'slide-3' && !xorUnlocked) {
          unlockConcept('xor-gate')
          setXorUnlocked(true)
          addNotebookEntry({
            type: 'concept',
            title: 'XOR Gate',
            content: 'The Exclusive OR gate - outputs true when inputs differ.',
            conceptId: 'xor-gate'
          })
        }
        
        if (currentPhase === 'slide-9' && !universalGatesUnlocked) {
          unlockConcept('universal-gates')
          setUniversalGatesUnlocked(true)
          addNotebookEntry({
            type: 'concept',
            title: 'Universal Gates',
            content: 'NAND and NOR gates can build any logic circuit - functional completeness!',
            conceptId: 'universal-gates'
          })
        }
        
        setCurrentPhase(nextPhase)
        setCurrentDialogIndex(0)
        
        // Trigger completion on last slide
        if (nextPhase === 'slide-11') {
          setTimeout(() => spawnStardustParticles(), 1000)
        }
      } else {
        handleLessonComplete()
      }
    }
  }
  
  const handleBack = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      const phases: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10', 'slide-11']
      const currentIndex = phases.indexOf(currentPhase)
      if (currentIndex > 0) {
        const prevPhase = phases[currentIndex - 1]
        setCurrentPhase(prevPhase)
        const prevDialogs = dialogs[prevPhase as keyof typeof dialogs]
        setCurrentDialogIndex(prevDialogs.length - 1)
      }
    }
  }
  
  // Stardust animation
  const spawnStardustParticles = useCallback(() => {
    if (isCollectingStardust) return
    
    setIsCollectingStardust(true)
    const particles: Array<{ id: number; x: number; y: number; collected: boolean }> = []
    const particleCount = 20
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const radius = 150 + Math.random() * 100
      particles.push({
        id: i,
        x: window.innerWidth / 2 + Math.cos(angle) * radius,
        y: window.innerHeight / 2 + Math.sin(angle) * radius,
        collected: false
      })
    }
    
    setStardustParticles(particles)
    
    // Auto-collect particles
    particles.forEach((particle, index) => {
      setTimeout(() => {
        setStardustParticles(prev => prev.map(p => 
          p.id === particle.id ? { ...p, collected: true } : p
        ))
        setEarnedStardust(prev => prev + 2)
      }, 100 + index * 100)
    })
    
    setTimeout(() => {
      setIsCollectingStardust(false)
      setShowCompletionScreen(true)
    }, 100 + particles.length * 100 + 500)
  }, [isCollectingStardust])
  
  const handleLessonComplete = async () => {
    const totalEarned = earnedStardust
    if (totalEarned > 0) {
      await addStardust(totalEarned)
    }
    
    await dictionaryService.markLessonComplete('gates-and-tables-2')
    
    setTimeout(() => {
      router.push('/courses/computer-science')
    }, 2000)
  }
  
  // Handle notebook entry click
  const handleNotebookEntryClick = (entry: NotebookEntry) => {
    if (entry.title === 'XOR Gate' || entry.title === 'Universal Gates') {
      // Open the concept in a new tab to show the full concept page
      const conceptId = entry.title === 'XOR Gate' ? 'xor-gate' : 'universal-gates'
      window.open(`/archive/${conceptId}`, '_blank')
    }
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
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">Advanced Gates</span>
                </h1>
                <p className="text-xl text-white/60 font-light mb-8">
                  XOR, NAND, NOR - The gates that power modern computing
                </p>
                <div className="flex gap-4 justify-center">
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-purple-500/20 border border-purple-400 rounded-xl flex items-center justify-center hover:bg-purple-500/30 transition-all"
                  >
                    <span className="text-sm font-bold text-purple-400">XOR</span>
                  </m.div>
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-green-500/20 border border-green-400 rounded-xl flex items-center justify-center hover:bg-green-500/30 transition-all"
                  >
                    <span className="text-sm font-bold text-green-400">NAND</span>
                  </m.div>
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-amber-500/20 border border-amber-400 rounded-xl flex items-center justify-center hover:bg-amber-500/30 transition-all"
                  >
                    <span className="text-sm font-bold text-amber-400">NOR</span>
                  </m.div>
                </div>
              </div>
            </m.div>
          )}
          
          {/* Slide 2 - XOR Introduction */}
          {currentPhase === 'slide-2' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <m.div
                  className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center border border-purple-500/30 backdrop-blur-sm mx-auto mb-8"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span className="text-4xl font-bold text-purple-400">XOR</span>
                </m.div>
                <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
                  The <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Exclusive OR</span> Gate
                </h1>
                <p className="text-xl text-white/60 font-light mb-8 max-w-2xl mx-auto">
                  Detects when inputs are different
                </p>
                
                {/* Visual Rule Display with Alternating States */}
                <XORIntroAnimation />
                
                <m.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-white/70 italic mt-8"
                >
                  "Either this OR that, but NOT both"
                </m.p>
              </div>
            </m.div>
          )}
          
          {/* Slide 3 - XOR Interactive */}
          {currentPhase === 'slide-3' && <XORGateDemo />}
          
          {/* Slide 4 - NAND Introduction - Showing AND + NOT */}
          {currentPhase === 'slide-4' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light text-white mb-8">
                  Building the <span className="font-bold text-green-400">NAND</span> Gate
                </h1>
                <p className="text-xl text-white/60 mb-12">Combining AND with NOT</p>
                
                {/* Visual showing AND + NOT = NAND */}
                <div className="flex items-center justify-center gap-8">
                  {/* AND Gate */}
                  <m.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-violet-500/20 to-violet-600/20 rounded-2xl border-2 border-violet-500/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-violet-400">AND</span>
                    </div>
                    <div className="text-sm text-violet-300 mt-2">Familiar AND Gate</div>
                  </m.div>
                  
                  {/* Plus Sign */}
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Plus className="w-8 h-8 text-white/40" />
                  </m.div>
                  
                  {/* NOT Gate */}
                  <m.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-2xl border-2 border-rose-500/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-rose-400">NOT</span>
                    </div>
                    <div className="text-sm text-rose-300 mt-2">Familiar NOT Gate</div>
                  </m.div>
                  
                  {/* Equals Sign */}
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-3xl text-white/40 mx-4"
                  >
                    =
                  </m.div>
                  
                  {/* NAND Gate */}
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl border-2 border-green-500/50 flex items-center justify-center shadow-lg shadow-green-500/20">
                      <span className="text-2xl font-bold text-green-400">NAND</span>
                    </div>
                    <div className="text-sm text-green-300 mt-2">New NAND Gate!</div>
                  </m.div>
                </div>
                
                {/* Connection Diagram */}
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-12 bg-black/40 rounded-2xl p-6 max-w-2xl mx-auto border border-white/10"
                >
                  <p className="text-white/80">The output of AND feeds directly into NOT</p>
                  <p className="text-green-400 font-semibold mt-2">This inverts the AND result!</p>
                </m.div>
              </div>
            </m.div>
          )}
          
          {/* Slide 5 - NAND Interactive */}
          {currentPhase === 'slide-5' && <NANDGateDemo />}
          
          {/* Slide 6 - NOR Introduction - Showing OR + NOT */}
          {currentPhase === 'slide-6' && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light text-white mb-8">
                  Building the <span className="font-bold text-amber-400">NOR</span> Gate
                </h1>
                <p className="text-xl text-white/60 mb-12">Combining OR with NOT</p>
                
                {/* Visual showing OR + NOT = NOR */}
                <div className="flex items-center justify-center gap-8">
                  {/* OR Gate */}
                  <m.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl border-2 border-blue-500/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-400">OR</span>
                    </div>
                    <div className="text-sm text-blue-300 mt-2">Familiar OR Gate</div>
                  </m.div>
                  
                  {/* Plus Sign */}
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Plus className="w-8 h-8 text-white/40" />
                  </m.div>
                  
                  {/* NOT Gate */}
                  <m.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-2xl border-2 border-rose-500/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-rose-400">NOT</span>
                    </div>
                    <div className="text-sm text-rose-300 mt-2">Familiar NOT Gate</div>
                  </m.div>
                  
                  {/* Equals Sign */}
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-3xl text-white/40 mx-4"
                  >
                    =
                  </m.div>
                  
                  {/* NOR Gate */}
                  <m.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl border-2 border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <span className="text-2xl font-bold text-amber-400">NOR</span>
                    </div>
                    <div className="text-sm text-amber-300 mt-2">New NOR Gate!</div>
                  </m.div>
                </div>
                
                {/* Connection Diagram */}
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-12 bg-black/40 rounded-2xl p-6 max-w-2xl mx-auto border border-white/10"
                >
                  <p className="text-white/80">The output of OR feeds directly into NOT</p>
                  <p className="text-amber-400 font-semibold mt-2">This inverts the OR result!</p>
                </m.div>
              </div>
            </m.div>
          )}
          
          {/* Slide 7 - NOR Interactive */}
          {currentPhase === 'slide-7' && <NORGateDemo />}
          
          {/* Slide 8 - Universal Gates Introduction - Minimal */}
          {currentPhase === 'slide-8' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-3xl font-light text-white/90">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-amber-400">Universal Gates</span>
              </h2>
              
              <p className="text-white/60 text-center max-w-md">
                You can build ANY logic gate using just NAND or just NOR
              </p>
              
              {/* Simple Interactive Demo */}
              <div className="flex gap-12">
                <m.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6"
                >
                  <InteractiveGate type="NAND" inputs={[true, true]} size="normal" />
                  <p className="text-green-400 text-sm mt-4 text-center">NAND Only</p>
                </m.div>
                
                <m.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6"
                >
                  <InteractiveGate type="NOR" inputs={[false, false]} size="normal" />
                  <p className="text-amber-400 text-sm mt-4 text-center">NOR Only</p>
                </m.div>
              </div>
            </m.div>
          )}
          
          {/* Slide 9 - Functional Completeness Demo */}
          {currentPhase === 'slide-9' && <FunctionalCompletenessDemo />}
          
          {/* Slide 10 - Real World Applications - Minimal */}
          {currentPhase === 'slide-10' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <h2 className="text-3xl font-light text-white/90">Where These Gates <span className="font-bold">Live</span></h2>
              
              <div className="flex flex-col gap-4 text-center">
                <m.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-purple-500/20 border border-purple-400 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-400">XOR</span>
                  </div>
                  <p className="text-white/70">Encryption & Error Detection</p>
                </m.div>
                
                <m.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-green-500/20 border border-green-400 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-green-400">NAND</span>
                  </div>
                  <p className="text-white/70">CPU Processors (billions of them!)</p>
                </m.div>
                
                <m.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-amber-500/20 border border-amber-400 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-400">NOR</span>
                  </div>
                  <p className="text-white/70">Flash Memory & SSDs</p>
                </m.div>
              </div>
            </m.div>
          )}
          
          {/* Slide 11 - Completion - Minimal */}
          {currentPhase === 'slide-11' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <CheckCircle2 className="w-24 h-24 text-green-400" />
              <h2 className="text-3xl font-light text-white">Advanced Gates <span className="font-bold text-green-400">Complete!</span></h2>
              <p className="text-white/60 text-center max-w-md">
                You've mastered XOR, NAND, and NOR gates - the building blocks of modern computing!
              </p>
            </m.div>
          )}
        </div>
      </div>
      
      {/* Dialog System */}
      {getCurrentDialog() && !showCompletionScreen && (
        <NPCDialog
          npcName="Byte"
          dialog={getCurrentDialog()}
          onNext={handleNext}
          onBack={currentDialogIndex > 0 || currentPhase !== 'slide-1' ? handleBack : undefined}
          currentIndex={currentDialogIndex}
          totalDialogs={dialogs[currentPhase as keyof typeof dialogs]?.length || 0}
        />
      )}
      
      {/* Stardust Particles */}
      <AnimatePresence>
        {stardustParticles.map(particle => (
          <m.div
            key={particle.id}
            className="fixed w-3 h-3 pointer-events-none z-50"
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 0
            }}
            animate={{
              scale: particle.collected ? 0 : [0, 1.5, 1],
              opacity: particle.collected ? 0 : 1,
              x: particle.collected ? window.innerWidth - 100 : particle.x,
              y: particle.collected ? 60 : particle.y,
            }}
            transition={{
              duration: particle.collected ? 0.5 : 0.3,
              ease: particle.collected ? "easeIn" : "easeOut"
            }}
          >
            <Star className="w-full h-full text-yellow-400 fill-yellow-400" />
          </m.div>
        ))}
      </AnimatePresence>
      
      {/* Completion Screen - Matching gates-and-tables-1 */}
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
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </m.div>
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </m.div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Notebook Toggle - matching original style */}
      <m.button
        onClick={() => setShowNotebook(!showNotebook)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-purple-500/20 border-2 border-purple-400 rounded-full flex items-center justify-center hover:bg-purple-500/30 transition-all z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <BookOpen className="w-6 h-6 text-purple-300" />
      </m.button>
      
      {/* Learning Notebook */}
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
      <ConceptViewer
        concept={viewingConcept}
        isOpen={showConceptViewer}
        onClose={() => {
          setShowConceptViewer(false)
          setViewingConcept(null)
        }}
      />
    </div>
  )
}

export default function GatesAndTables2Page() {
  return (
    <ProtectedRoute>
      <GatesAndTables2Lesson />
    </ProtectedRoute>
  )
}