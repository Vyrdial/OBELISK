'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Waves, Circle } from 'lucide-react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR' | 'BUFFER'

interface GateConfig {
  name: string
  symbol: string
  description: string
  equation: string
  color: string
  glowColor: string
  hasInputB: boolean
  logic: (a: boolean, b?: boolean) => boolean
  truthTable: Array<Array<number | string>>
}

const GATE_CONFIGS: Record<GateType, GateConfig> = {
  AND: {
    name: 'AND Gate',
    symbol: '∧',
    description: 'Constructive interference - both waves must align',
    equation: '\\psi_{out} = \\psi_A \\cdot \\psi_B',
    color: 'from-violet-500/20 to-violet-600/20',
    glowColor: 'violet',
    hasInputB: true,
    logic: (a, b) => a && (b ?? false),
    truthTable: [
      ['A', 'B', 'OUT'],
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  OR: {
    name: 'OR Gate',
    symbol: '∨',
    description: 'Wave superposition - waves add together',
    equation: '\\psi_{out} = \\psi_A + \\psi_B',
    color: 'from-blue-500/20 to-blue-600/20',
    glowColor: 'blue',
    hasInputB: true,
    logic: (a, b) => a || (b ?? false),
    truthTable: [
      ['A', 'B', 'OUT'],
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1]
    ]
  },
  NOT: {
    name: 'NOT Gate',
    symbol: '¬',
    description: 'Phase inversion - π phase shift inverts signal',
    equation: '\\psi_{out} = -\\psi_{in}',
    color: 'from-rose-500/20 to-rose-600/20',
    glowColor: 'rose',
    hasInputB: false,
    logic: (a) => !a,
    truthTable: [
      ['A', 'OUT'],
      [0, 1],
      [1, 0]
    ]
  },
  XOR: {
    name: 'XOR Gate',
    symbol: '⊕',
    description: 'Destructive interference - difference of waves',
    equation: '\\psi_{out} = \\psi_A - \\psi_B',
    color: 'from-teal-500/20 to-teal-600/20',
    glowColor: 'teal',
    hasInputB: true,
    logic: (a, b) => a !== (b ?? false),
    truthTable: [
      ['A', 'B', 'OUT'],
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0]
    ]
  },
  NAND: {
    name: 'NAND Gate',
    symbol: '⊼',
    description: 'Inverted AND - phase-shifted constructive interference',
    equation: '\\psi_{out} = \\overline{\\psi_A \\cdot \\psi_B}',
    color: 'from-purple-500/20 to-purple-600/20',
    glowColor: 'purple',
    hasInputB: true,
    logic: (a, b) => !(a && (b ?? false)),
    truthTable: [
      ['A', 'B', 'OUT'],
      [0, 0, 1],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0]
    ]
  },
  NOR: {
    name: 'NOR Gate',
    symbol: '⊽',
    description: 'Inverted superposition - negated wave sum',
    equation: '\\psi_{out} = \\overline{\\psi_A + \\psi_B}',
    color: 'from-indigo-500/20 to-indigo-600/20',
    glowColor: 'indigo',
    hasInputB: true,
    logic: (a, b) => !(a || (b ?? false)),
    truthTable: [
      ['A', 'B', 'OUT'],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 0]
    ]
  },
  XNOR: {
    name: 'XNOR Gate',
    symbol: '⊙',
    description: 'Equivalence - inverted difference',
    equation: '\\psi_{out} = \\overline{\\psi_A - \\psi_B}',
    color: 'from-amber-500/20 to-amber-600/20',
    glowColor: 'amber',
    hasInputB: true,
    logic: (a, b) => a === (b ?? false),
    truthTable: [
      ['A', 'B', 'OUT'],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  BUFFER: {
    name: 'Buffer',
    symbol: '▷',
    description: 'Wave amplification - maintains signal integrity',
    equation: '\\psi_{out} = \\psi_{in}',
    color: 'from-emerald-500/20 to-emerald-600/20',
    glowColor: 'emerald',
    hasInputB: false,
    logic: (a) => a,
    truthTable: [
      ['A', 'OUT'],
      [0, 0],
      [1, 1]
    ]
  }
}

export default function BooleanWaves({ onBack }: { onBack?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [selectedGate, setSelectedGate] = useState<GateType>('AND')
  const [inputA, setInputA] = useState(false)
  const [inputB, setInputB] = useState(false)
  const [showTruthTable, setShowTruthTable] = useState(false)
  
  const gateConfig = GATE_CONFIGS[selectedGate]
  const output = gateConfig.logic(inputA, inputB)
  
  const drawWave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    const width = rect.width
    const height = rect.height
    
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 30, 1)'
    ctx.fillRect(0, 0, width, height)
    
    // Wave parameters
    const time = Date.now() / 1000
    const amplitude = height * 0.15  // Adjusted for full height usage
    const frequency = 0.02
    const waveSpeed = 2
    const boundaryX = width / 2
    
    // Draw input phase space function (left side only)
    const drawInputPhaseSpace = (index: number, totalInputs: number, label: string, waveColor: string, isActive: boolean) => {
      // Center inputs vertically on left side
      const leftSideHeight = height
      const inputSpaceHeight = leftSideHeight / totalInputs
      const yOffset = index * inputSpaceHeight
      const centerY = yOffset + inputSpaceHeight / 2
      
      // Background gradient for left side
      const bgGradient = ctx.createLinearGradient(0, yOffset, 0, yOffset + inputSpaceHeight)
      bgGradient.addColorStop(0, 'rgba(20, 20, 40, 0.3)')
      bgGradient.addColorStop(0.5, 'rgba(10, 10, 30, 0.5)')
      bgGradient.addColorStop(1, 'rgba(20, 20, 40, 0.3)')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, yOffset, boundaryX, inputSpaceHeight)
      
      // Draw unit grid (left side only)
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.03)'
      ctx.lineWidth = 1
      
      // Vertical grid lines (left side)
      for (let x = 0; x <= boundaryX; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, yOffset)
        ctx.lineTo(x, yOffset + inputSpaceHeight)
        ctx.stroke()
      }
      
      // Horizontal grid lines (left side)
      for (let y = yOffset; y <= yOffset + inputSpaceHeight; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(boundaryX, y)
        ctx.stroke()
      }
      
      // Draw y=0 axis (left side)
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(boundaryX, centerY)
      ctx.stroke()
      
      // Draw label
      ctx.font = '12px monospace'
      ctx.fillStyle = 'rgba(100, 255, 218, 0.6)'
      ctx.fillText(label, 15, yOffset + 20)
      
      // Draw wave if active (left side only)
      if (isActive) {
        // Glow effect
        ctx.strokeStyle = waveColor.replace('1)', '0.2)')
        ctx.lineWidth = 8
        ctx.beginPath()
        for (let x = 0; x <= boundaryX; x += 2) {
          const waveY = centerY + amplitude * Math.sin((x * frequency) + time * waveSpeed)
          if (x === 0) ctx.moveTo(x, waveY)
          else ctx.lineTo(x, waveY)
        }
        ctx.stroke()
        
        // Main wave
        ctx.strokeStyle = waveColor
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let x = 0; x <= boundaryX; x += 1) {
          const waveY = centerY + amplitude * Math.sin((x * frequency) + time * waveSpeed)
          if (x === 0) ctx.moveTo(x, waveY)
          else ctx.lineTo(x, waveY)
        }
        ctx.stroke()
      }
    }
    
    // Draw output phase space function (right side only)
    const drawOutputPhaseSpace = () => {
      // Center output vertically on right side
      const rightSideHeight = height
      const centerY = rightSideHeight / 2
      
      // Background gradient for right side
      const bgGradient = ctx.createLinearGradient(boundaryX, 0, width, 0)
      bgGradient.addColorStop(0, 'rgba(10, 10, 30, 0.5)')
      bgGradient.addColorStop(0.5, 'rgba(20, 20, 40, 0.3)')
      bgGradient.addColorStop(1, 'rgba(10, 10, 30, 0.5)')
      ctx.fillStyle = bgGradient
      ctx.fillRect(boundaryX, 0, width - boundaryX, height)
      
      // Draw unit grid (right side only)
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.03)'
      ctx.lineWidth = 1
      
      // Vertical grid lines (right side)
      for (let x = boundaryX; x <= width; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      
      // Horizontal grid lines (right side)
      for (let y = 0; y <= height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(boundaryX, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      
      // Draw y=0 axis (right side)
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(boundaryX, centerY)
      ctx.lineTo(width, centerY)
      ctx.stroke()
      
      // Draw label
      ctx.font = '12px monospace'
      ctx.fillStyle = 'rgba(100, 255, 218, 0.6)'
      ctx.fillText('OUTPUT', boundaryX + 15, 20)
    }
    
    // Draw output wave function (right side only, centered)
    const drawOutputWave = (phase: number = 0, ampMultiplier: number = 1, modulated: boolean = false) => {
      const centerY = height / 2  // Center vertically on right side
      const outputAmplitude = amplitude * ampMultiplier
      
      if (output || (selectedGate === 'NOT' && !inputA)) {
        // Glow effect
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)'
        ctx.lineWidth = 12
        ctx.beginPath()
        
        if (modulated) {
          // Special modulated wave for XOR
          for (let x = boundaryX; x <= width; x += 2) {
            const modulation = Math.sin((x * 0.01) + time)
            const waveY = centerY + outputAmplitude * modulation * Math.sin((x * frequency) + time * waveSpeed + phase)
            if (x === boundaryX) ctx.moveTo(x, waveY)
            else ctx.lineTo(x, waveY)
          }
        } else {
          for (let x = boundaryX; x <= width; x += 2) {
            const waveY = centerY + outputAmplitude * Math.sin((x * frequency) + time * waveSpeed + phase)
            if (x === boundaryX) ctx.moveTo(x, waveY)
            else ctx.lineTo(x, waveY)
          }
        }
        ctx.stroke()
        
        // Main wave
        const gradient = ctx.createLinearGradient(boundaryX, 0, width, 0)
        gradient.addColorStop(0, 'rgba(100, 255, 218, 1)')
        gradient.addColorStop(1, 'rgba(100, 255, 218, 0.4)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = 3
        ctx.beginPath()
        
        if (modulated) {
          for (let x = boundaryX; x <= width; x += 1) {
            const modulation = Math.sin((x * 0.01) + time)
            const waveY = centerY + outputAmplitude * modulation * Math.sin((x * frequency) + time * waveSpeed + phase)
            if (x === boundaryX) ctx.moveTo(x, waveY)
            else ctx.lineTo(x, waveY)
          }
        } else {
          for (let x = boundaryX; x <= width; x += 1) {
            const waveY = centerY + outputAmplitude * Math.sin((x * frequency) + time * waveSpeed + phase)
            if (x === boundaryX) ctx.moveTo(x, waveY)
            else ctx.lineTo(x, waveY)
          }
        }
        ctx.stroke()
      }
    }
    
    // Draw phase spaces based on gate type
    if (gateConfig.hasInputB) {
      // Draw Input A and B on left side, centered vertically
      drawInputPhaseSpace(0, 2, 'INPUT A', 'rgba(255, 100, 100, 1)', inputA)
      drawInputPhaseSpace(1, 2, 'INPUT B', 'rgba(100, 100, 255, 1)', inputB)
      
      // Draw output background on right side
      drawOutputPhaseSpace()
      
      // Draw output wave based on gate logic
      switch(selectedGate) {
        case 'AND':
          if (output) drawOutputWave(0, 1.5)
          break
        case 'OR':
          if (output) {
            const amp = (inputA && inputB) ? 1.4 : 1
            drawOutputWave(0, amp)
          }
          break
        case 'XOR':
          if (output) drawOutputWave(0, 1)
          break
        case 'NAND':
          const nandPhase = (inputA && inputB) ? Math.PI : 0
          drawOutputWave(nandPhase, output ? 1.2 : 0.3)
          break
        case 'NOR':
          if (output) drawOutputWave(Math.PI)
          break
        case 'XNOR':
          if (output) {
            const amp = (inputA === inputB) ? 1.4 : 0.5
            drawOutputWave(0, amp)
          }
          break
      }
    } else {
      // For single-input gates (NOT, BUFFER)
      // Draw single input on left side, centered vertically
      drawInputPhaseSpace(0, 1, 'INPUT', 'rgba(255, 100, 100, 1)', inputA)
      
      // Draw output background on right side
      drawOutputPhaseSpace()
      
      if (selectedGate === 'NOT') {
        const phase = inputA ? Math.PI : 0
        drawOutputWave(phase, output ? 1 : 0.3)
      } else if (selectedGate === 'BUFFER') {
        if (output) drawOutputWave(0, 1.2)
      }
    }
    
    // Draw boundary line with gate symbols
    const gateSymbol = gateConfig.symbol
    const symbolSpacing = 40 // Space between symbols
    
    // Draw vertical line of gate symbols
    ctx.save()
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Create gradient for symbols
    const symbolGradient = ctx.createLinearGradient(boundaryX - 20, 0, boundaryX + 20, 0)
    symbolGradient.addColorStop(0, 'rgba(100, 255, 218, 0.1)')
    symbolGradient.addColorStop(0.5, 'rgba(100, 255, 218, 0.8)')
    symbolGradient.addColorStop(1, 'rgba(100, 255, 218, 0.1)')
    
    // Draw gate symbols along the boundary
    for (let y = symbolSpacing / 2; y < height; y += symbolSpacing) {
      // Glow effect
      ctx.shadowColor = 'rgba(100, 255, 218, 0.5)'
      ctx.shadowBlur = 10
      ctx.fillStyle = symbolGradient
      ctx.fillText(gateSymbol, boundaryX, y)
      
      // Main symbol
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(100, 255, 218, 0.9)'
      ctx.fillText(gateSymbol, boundaryX, y)
    }
    ctx.restore()
    
    // Draw connecting lines between symbols (subtle)
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(boundaryX, 0)
    ctx.lineTo(boundaryX, height)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw section labels
    ctx.font = '11px monospace'
    ctx.fillStyle = 'rgba(100, 255, 218, 0.4)'
    ctx.fillText('PHASE PROPAGATION →', width - 140, height - 10)
  }, [selectedGate, inputA, inputB, output, gateConfig])
  
  useEffect(() => {
    const animate = () => {
      drawWave()
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [drawWave])
  
  return (
    <div className="fixed inset-0 bg-cosmic-void flex flex-col">
      {/* Header */}
      <div className="relative z-20 bg-cosmic-void/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <m.button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </m.button>
            )}
            <div className="flex items-center gap-3">
              <Waves className="w-6 h-6 text-cosmic-aurora" />
              <h1 className="text-xl font-medium text-white">Boolean Waves</h1>
            </div>
          </div>
          
          <button
            onClick={() => setShowTruthTable(!showTruthTable)}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-sm font-medium"
          >
            Truth Table
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-cosmic-void/50 border-r border-white/10 p-6 overflow-y-auto">
          {/* Gate Selector */}
          <div className="mb-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Select Gate</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(GATE_CONFIGS) as GateType[]).map((gate) => (
                <m.button
                  key={gate}
                  onClick={() => setSelectedGate(gate)}
                  className={`
                    relative p-3 rounded-lg border transition-all
                    ${selectedGate === gate 
                      ? `bg-gradient-to-br ${GATE_CONFIGS[gate].color} border-${GATE_CONFIGS[gate].glowColor}-500/50` 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl font-bold text-white/80 mb-1">
                    {GATE_CONFIGS[gate].symbol}
                  </div>
                  <div className="text-xs text-white/60">{gate}</div>
                  {selectedGate === gate && (
                    <m.div
                      layoutId="gateSelector"
                      className="absolute inset-0 rounded-lg border-2 border-cosmic-aurora/50"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </m.button>
              ))}
            </div>
          </div>
          
          {/* Inputs - Now right under gate selector */}
          <div className="mb-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Inputs</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <button
                  onClick={() => setInputA(!inputA)}
                  className={`
                    w-full p-4 rounded-lg font-mono font-bold text-lg transition-all
                    ${inputA 
                      ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 shadow-lg shadow-red-500/20' 
                      : 'bg-white/5 text-white/40 border-2 border-white/20 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="text-xs text-white/60 mb-1">A</div>
                  <div className="text-2xl">{inputA ? '1' : '0'}</div>
                </button>
              </div>
              
              {gateConfig.hasInputB && (
                <div className="flex-1">
                  <button
                    onClick={() => setInputB(!inputB)}
                    className={`
                      w-full p-4 rounded-lg font-mono font-bold text-lg transition-all
                      ${inputB 
                        ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 text-white/40 border-2 border-white/20 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="text-xs text-white/60 mb-1">B</div>
                    <div className="text-2xl">{inputB ? '1' : '0'}</div>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Output */}
          <div className="mb-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Output</h3>
            <div className="p-4 rounded-lg bg-gradient-to-br from-cosmic-aurora/10 to-cosmic-aurora/5 border-2 border-cosmic-aurora/30">
              <div className="text-center">
                <div className={`
                  text-4xl font-mono font-bold mb-2
                  ${output ? 'text-cosmic-aurora' : 'text-white/20'}
                `}>
                  {output ? '1' : '0'}
                </div>
                <div className={`w-4 h-4 rounded-full mx-auto ${output ? 'bg-cosmic-aurora animate-pulse' : 'bg-white/20'}`} />
              </div>
            </div>
          </div>
          
          {/* Gate Info */}
          <div className="mb-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Gate Properties</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-white font-medium mb-1">{gateConfig.name}</div>
                <div className="text-white/60 text-sm">{gateConfig.description}</div>
              </div>
              <div className="p-3 rounded-lg bg-cosmic-aurora/10 border border-cosmic-aurora/20">
                <div className="text-cosmic-aurora text-xs uppercase tracking-wider mb-1">Wave Equation</div>
                <div className="text-white/80">
                  <InlineMath math={gateConfig.equation} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 relative bg-gradient-to-br from-cosmic-void via-cosmic-void/95 to-cosmic-void">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Truth Table Overlay */}
          <AnimatePresence>
            {showTruthTable && (
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 right-4 p-4 rounded-lg bg-cosmic-void/95 backdrop-blur-xl border border-white/20"
              >
                <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Truth Table</h4>
                <table className="text-sm">
                  <thead>
                    <tr>
                      {gateConfig.truthTable[0].map((header, i) => (
                        <th key={i} className="px-3 py-1 text-cosmic-aurora font-medium border-b border-white/10">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gateConfig.truthTable.slice(1).map((row, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-1 text-white/60 text-center font-mono">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}