'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, BookOpen, Sparkles, CheckCircle, Zap, Lock, Unlock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { useUnlockedConcepts } from '@/hooks/useUnlockedConcepts'

// Advanced gate visualization component (matching gates-and-tables-1 style)
function AdvancedGateVisualization({ gate, inputs, onInputChange, size = 'normal' }: { 
  gate: 'XOR' | 'NAND' | 'NOR', 
  inputs: { a: boolean, b: boolean },
  onInputChange: (input: 'a' | 'b') => void,
  size?: 'normal' | 'large'
}) {
  const operations = {
    XOR: (a: boolean, b: boolean) => a !== b,
    NAND: (a: boolean, b: boolean) => !(a && b),
    NOR: (a: boolean, b: boolean) => !(a || b)
  }

  const gateColors = {
    XOR: { 
      bg: 'from-cyan-500/20 to-cyan-600/20', 
      border: 'border-cyan-500/50', 
      text: 'text-cyan-400',
      shadow: 'shadow-cyan-500/20'
    },
    NAND: { 
      bg: 'from-purple-500/20 to-purple-600/20', 
      border: 'border-purple-500/50', 
      text: 'text-purple-400',
      shadow: 'shadow-purple-500/20'
    },
    NOR: { 
      bg: 'from-orange-500/20 to-orange-600/20', 
      border: 'border-orange-500/50', 
      text: 'text-orange-400',
      shadow: 'shadow-orange-500/20'
    }
  }

  const output = operations[gate](inputs.a, inputs.b)
  const colors = gateColors[gate]
  const isLarge = size === 'large'
  const gateSize = isLarge ? 'w-32 h-32' : 'w-24 h-24'
  const inputSize = isLarge ? 'w-16 h-16' : 'w-14 h-14'
  const fontSize = isLarge ? 'text-2xl' : 'text-xl'
  const gateFontSize = isLarge ? 'text-2xl' : 'text-lg'
  
  const inputArray = [inputs.a, inputs.b]

  return (
    <div className="flex items-center justify-center gap-8">
      {/* Input Section */}
      <div className="flex flex-col gap-4">
        <m.button
          onClick={() => onInputChange('a')}
          className={`${inputSize} rounded-xl border-2 transition-all flex items-center justify-center ${
            inputs.a
              ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30' 
              : 'bg-gray-800/50 border-gray-600/50'
          } cursor-pointer`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={`${fontSize} font-bold ${inputs.a ? 'text-green-400' : 'text-gray-500'}`}>
            {inputs.a ? '1' : '0'}
          </span>
        </m.button>
        <m.button
          onClick={() => onInputChange('b')}
          className={`${inputSize} rounded-xl border-2 transition-all flex items-center justify-center ${
            inputs.b
              ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30' 
              : 'bg-gray-800/50 border-gray-600/50'
          } cursor-pointer`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={`${fontSize} font-bold ${inputs.b ? 'text-green-400' : 'text-gray-500'}`}>
            {inputs.b ? '1' : '0'}
          </span>
        </m.button>
      </div>
      
      {/* Gate Visual */}
      <div className="relative">
        {/* Connection Wires - Behind the gate */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: '-60%', width: '220%', top: '-10%', height: '120%' }}>
          {/* Input wires */}
          {inputArray.map((input, index) => {
            const y = index === 0 ? '35%' : '65%'
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
          {inputArray.map((input, index) => {
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
          
          {/* Gate symbol - in front of everything */}
          <div className="relative z-10">
            {gate === 'XOR' && (
              <svg width={isLarge ? "80" : "60"} height={isLarge ? "80" : "60"} viewBox="0 0 60 60" fill="none">
                {/* XOR gate shape - curved with double input line */}
                <path d="M 10 15 Q 25 30 10 45" stroke="currentColor" strokeWidth="2" className={colors.text} fill="none"/>
                <path d="M 15 15 Q 30 30 15 45 L 35 45 Q 50 30 35 15 Z" stroke="currentColor" strokeWidth="2" className={colors.text} fill="none"/>
                <circle cx="52" cy="30" r="3" stroke="currentColor" strokeWidth="2" className={colors.text} fill="none"/>
              </svg>
            )}
            {gate === 'NAND' && (
              <svg width={isLarge ? "80" : "60"} height={isLarge ? "80" : "60"} viewBox="0 0 60 60" fill="none">
                {/* NAND gate - AND with bubble */}
                <path d="M 10 15 L 10 45 L 30 45 Q 45 45 45 30 Q 45 15 30 15 Z" stroke="currentColor" strokeWidth="2" className={colors.text} fill="none"/>
                <circle cx="48" cy="30" r="3" stroke="currentColor" strokeWidth="2" className={colors.text} fill="none"/>
              </svg>
            )}
            {gate === 'NOR' && (
              <svg width={isLarge ? "80" : "60"} height={isLarge ? "80" : "60"} viewBox="0 0 60 60" fill="none">
                {/* NOR gate - OR with bubble */}
                <path d="M 10 15 Q 20 15 25 15 Q 45 15 50 30 Q 45 45 25 45 Q 20 45 10 45 Q 20 30 10 15 Z" stroke="currentColor" strokeWidth="2" className={colors.text} fill="none"/>
                <circle cx="53" cy="30" r="3" stroke="currentColor" strokeWidth="2" className={colors.text} fill="none"/>
              </svg>
            )}
          </div>
          
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

// Truth table with pattern highlighting (matching gates-and-tables-1 style)
function EnhancedTruthTable({ gate, currentInputs = [] }: { 
  gate: 'XOR' | 'NAND' | 'NOR',
  currentInputs?: boolean[]
}) {
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null)
  
  const operations = {
    XOR: (a: boolean, b: boolean) => a !== b,
    NAND: (a: boolean, b: boolean) => !(a && b),
    NOR: (a: boolean, b: boolean) => !(a || b)
  }

  const rows = [
    { inputs: [false, false] },
    { inputs: [false, true] },
    { inputs: [true, false] },
    { inputs: [true, true] }
  ]

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
  
  const autoHighlightedRow = getHighlightedRow()
  const activeRow = highlightedRow !== null ? highlightedRow : autoHighlightedRow
  
  const gateColor = {
    XOR: 'border-cyan-500/50 bg-cyan-500/10',
    NAND: 'border-purple-500/50 bg-purple-500/10',
    NOR: 'border-orange-500/50 bg-orange-500/10'
  }[gate]
  
  const highlightColor = {
    XOR: 'bg-cyan-500/20',
    NAND: 'bg-purple-500/20',
    NOR: 'bg-orange-500/20'
  }[gate]

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/40 rounded-xl border-2 ${gateColor} overflow-hidden backdrop-blur-sm`}
    >
      <div className="p-4">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span>
          {gate} Truth Table
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/60 border-b border-white/10">
              <th className="px-3 py-2 text-left font-medium">A</th>
              <th className="px-3 py-2 text-left font-medium">B</th>
              <th className="px-3 py-2 text-left font-medium text-white">{gate}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const result = operations[gate](row.inputs[0], row.inputs[1])
              const isActive = activeRow === index
              
              return (
                <m.tr
                  key={index}
                  className={`transition-all ${
                    isActive ? highlightColor : ''
                  }`}
                  onMouseEnter={() => setHighlightedRow(index)}
                  onMouseLeave={() => setHighlightedRow(null)}
                  animate={isActive ? {
                    x: [0, 2, 0],
                    transition: { duration: 0.3 }
                  } : {}}
                >
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      row.inputs[0] ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                    }`}>
                      {row.inputs[0] ? '1' : '0'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      row.inputs[1] ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                    }`}>
                      {row.inputs[1] ? '1' : '0'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <m.span 
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        result ? 'bg-green-500/30 text-green-400' : 'bg-gray-500/30 text-gray-400'
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {result ? '1' : '0'}
                    </m.span>
                  </td>
                </m.tr>
              )
            })}
          </tbody>
        </table>
        
        {/* Pattern Description */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-white/60">
            {gate === 'XOR' && (
              <>Output is <span className="text-cyan-400">1</span> when inputs are different</>
            )}
            {gate === 'NAND' && (
              <>Output is <span className="text-purple-400">0</span> only when both inputs are 1</>
            )}
            {gate === 'NOR' && (
              <>Output is <span className="text-orange-400">1</span> only when both inputs are 0</>
            )}
          </p>
        </div>
      </div>
    </m.div>
  )
}

// Functional completeness demonstration
function FunctionalCompletenessDemo() {
  const [selectedGate, setSelectedGate] = useState<'NAND' | 'NOR'>('NAND')
  const [showDerivation, setShowDerivation] = useState(false)

  const derivations = {
    NAND: {
      NOT: "NAND(A, A) = NOT(A)",
      AND: "NAND(NAND(A, B), NAND(A, B)) = AND(A, B)",
      OR: "NAND(NAND(A, A), NAND(B, B)) = OR(A, B)"
    },
    NOR: {
      NOT: "NOR(A, A) = NOT(A)",
      OR: "NOR(NOR(A, B), NOR(A, B)) = OR(A, B)",
      AND: "NOR(NOR(A, A), NOR(B, B)) = AND(A, B)"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-purple-400 mb-2">Functional Completeness</h3>
        <p className="text-white/60 text-sm">
          {selectedGate} is functionally complete - all logic can be built from it!
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setSelectedGate('NAND')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedGate === 'NAND'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          NAND Gate
        </button>
        <button
          onClick={() => setSelectedGate('NOR')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedGate === 'NOR'
              ? 'bg-orange-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          NOR Gate
        </button>
      </div>

      <m.button
        onClick={() => setShowDerivation(!showDerivation)}
        className="mx-auto block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showDerivation ? 'Hide' : 'Show'} Derivations
      </m.button>

      <AnimatePresence>
        {showDerivation && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/30 rounded-xl p-6 space-y-4"
          >
            {Object.entries(derivations[selectedGate]).map(([gate, formula]) => (
              <m.div
                key={gate}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <span className="text-purple-400 font-medium">{gate}:</span>
                <code className="text-white/80 text-sm font-mono">{formula}</code>
              </m.div>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdvancedGatesLesson() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [showNotebook, setShowNotebook] = useState(false)
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [currentGate, setCurrentGate] = useState<'XOR' | 'NAND' | 'NOR'>('XOR')
  const [gateInputs, setGateInputs] = useState({ a: false, b: false })
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set())
  const { unlockConcept } = useUnlockedConcepts()

  const sections = [
    {
      title: "XOR Gate - Exclusive OR",
      content: "The XOR gate outputs true when inputs are different. It's the foundation of binary addition and error detection.",
      interactive: true,
      gate: 'XOR' as const
    },
    {
      title: "NAND Gate - Universal Logic",
      content: "NAND (NOT AND) is functionally complete - any logic circuit can be built using only NAND gates!",
      interactive: true,
      gate: 'NAND' as const
    },
    {
      title: "NOR Gate - Alternative Universal",
      content: "NOR (NOT OR) is also functionally complete. Both NAND and NOR can create any logic function.",
      interactive: true,
      gate: 'NOR' as const
    },
    {
      title: "Functional Completeness",
      content: "Some gates can build all others. This principle powers modern computing - billions of transistors acting as NAND gates.",
      interactive: false
    }
  ]

  useEffect(() => {
    // Add initial notebook entry
    const initialEntry: NotebookEntry = {
      id: 'intro',
      type: 'note',
      title: 'Advanced Logic Gates',
      content: 'Exploring XOR, NAND, and NOR gates - the building blocks of complex digital systems.',
      timestamp: Date.now()
    }
    setNotebookEntries([initialEntry])
  }, [])

  const handleSectionComplete = () => {
    setCompletedSections(prev => new Set([...prev, currentSection]))
    
    // Add notebook entry for completed section
    const section = sections[currentSection]
    const entry: NotebookEntry = {
      id: `section-${currentSection}`,
      type: 'concept',
      title: section.title,
      content: section.content,
      timestamp: Date.now(),
      conceptId: section.gate?.toLowerCase()
    }
    setNotebookEntries(prev => [...prev, entry])

    // Unlock concepts when completing specific sections
    if (currentSection === 0) unlockConcept('xor-gate')
    if (currentSection === 1) unlockConcept('nand-gate')
    if (currentSection === 2) unlockConcept('nor-gate')
    if (currentSection === 3) unlockConcept('functional-completeness')

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setCurrentGate(sections[currentSection + 1].gate || 'XOR')
    }
  }

  const handleInputChange = (input: 'a' | 'b') => {
    setGateInputs(prev => ({
      ...prev,
      [input]: !prev[input]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmic-void via-purple-950/50 to-cosmic-void relative">
      <CosmicBackground intensity="low" />
      <TopNavigationBar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 cosmic-heading">
            Advanced Logic Gates
          </h1>
          <p className="text-xl text-purple-300/80">
            Discover the universal gates that power all computation
          </p>
        </m.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-purple-300/60">Progress</span>
            <span className="text-sm text-purple-300/60">
              {completedSections.size} / {sections.length} completed
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <m.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Explanation */}
          <m.div
            key={currentSection}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {sections[currentSection].title}
              </h2>
            </div>

            <p className="text-white/80 leading-relaxed mb-6">
              {sections[currentSection].content}
            </p>

            {currentSection < 3 && (
              <EnhancedTruthTable gate={currentGate} currentInputs={[gateInputs.a, gateInputs.b]} />
            )}

            {currentSection === 3 && (
              <FunctionalCompletenessDemo />
            )}
          </m.div>

          {/* Right Panel - Interactive */}
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Interactive Demo</h3>
              <button
                onClick={() => setShowNotebook(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Notebook
              </button>
            </div>

            {sections[currentSection].interactive ? (
              <AdvancedGateVisualization 
                gate={currentGate}
                inputs={gateInputs}
                onInputChange={handleInputChange}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Unlock className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Functional Completeness Unlocked!
                  </h4>
                  <p className="text-white/60 text-sm max-w-xs mx-auto">
                    You now understand how simple gates can create infinite complexity
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 text-center text-white/40 text-sm">
              {sections[currentSection].interactive && (
                <>Click the inputs to toggle them and see how the gate responds</>
              )}
            </div>
          </m.div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => {
              if (currentSection > 0) {
                setCurrentSection(currentSection - 1)
                setCurrentGate(sections[currentSection - 1].gate || 'XOR')
              }
            }}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index <= currentSection || completedSections.has(index - 1)) {
                    setCurrentSection(index)
                    setCurrentGate(sections[index].gate || 'XOR')
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSection
                    ? 'w-8 bg-purple-400'
                    : completedSections.has(index)
                    ? 'bg-purple-400/60'
                    : index <= currentSection
                    ? 'bg-white/40'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {currentSection < sections.length - 1 ? (
            <button
              onClick={handleSectionComplete}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30 rounded-lg text-white font-medium transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                handleSectionComplete()
                router.push('/learn')
              }}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 rounded-lg text-white font-medium transition-all"
            >
              Complete Lesson
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Learning Notebook */}
      <AnimatePresence>
        {showNotebook && (
          <LearningNotebook
            entries={notebookEntries}
            onClose={() => setShowNotebook(false)}
            onAddNote={(note) => {
              const entry: NotebookEntry = {
                id: `note-${Date.now()}`,
                type: 'note',
                title: 'Personal Note',
                content: note,
                timestamp: Date.now()
              }
              setNotebookEntries(prev => [...prev, entry])
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}