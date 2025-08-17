'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, X, Binary, Circle, Square, CheckCircle2, Table2, Grid3x3 } from 'lucide-react'
import { dictionaryService } from '@/lib/dictionaryService'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept } from '@/components/lesson/ConceptViewer'

type LessonPhase = 'slide-1' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9' | 'slide-10' | 'complete'

// Interactive Truth Table Component
function InteractiveTruthTable({ 
  inputs,
  onInputChange,
  operation,
  showOutput = true,
  highlighted = false,
  editable = true
}: { 
  inputs: { A: boolean, B: boolean }[]
  onInputChange?: (index: number, input: 'A' | 'B', value: boolean) => void
  operation?: (a: boolean, b: boolean) => boolean
  showOutput?: boolean
  highlighted?: boolean
  editable?: boolean
}) {
  return (
    <div className={`relative ${highlighted ? 'scale-105' : ''} transition-transform`}>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="px-6 py-3 text-left text-sm font-medium text-white/80">A</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/80">B</th>
              {showOutput && <th className="px-6 py-3 text-left text-sm font-medium text-white/80">Output</th>}
            </tr>
          </thead>
          <tbody>
            {inputs.map((row, index) => {
              const output = operation ? operation(row.A, row.B) : false
              return (
                <m.tr 
                  key={index}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="px-6 py-4">
                    {editable && onInputChange ? (
                      <button
                        onClick={() => onInputChange(index, 'A', !row.A)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all font-bold ${
                          row.A 
                            ? 'bg-green-500/20 border-green-400 text-green-400' 
                            : 'bg-red-500/20 border-red-400 text-red-400'
                        }`}
                      >
                        {row.A ? '1' : '0'}
                      </button>
                    ) : (
                      <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold ${
                        row.A 
                          ? 'bg-green-500/20 border-green-400 text-green-400' 
                          : 'bg-red-500/20 border-red-400 text-red-400'
                      }`}>
                        {row.A ? '1' : '0'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editable && onInputChange ? (
                      <button
                        onClick={() => onInputChange(index, 'B', !row.B)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all font-bold ${
                          row.B 
                            ? 'bg-green-500/20 border-green-400 text-green-400' 
                            : 'bg-red-500/20 border-red-400 text-red-400'
                        }`}
                      >
                        {row.B ? '1' : '0'}
                      </button>
                    ) : (
                      <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold ${
                        row.B 
                          ? 'bg-green-500/20 border-green-400 text-green-400' 
                          : 'bg-red-500/20 border-red-400 text-red-400'
                      }`}>
                        {row.B ? '1' : '0'}
                      </div>
                    )}
                  </td>
                  {showOutput && (
                    <td className="px-6 py-4">
                      <m.div 
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold ${
                          output 
                            ? 'bg-green-500/20 border-green-400 text-green-400' 
                            : 'bg-red-500/20 border-red-400 text-red-400'
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {output ? '1' : '0'}
                      </m.div>
                    </td>
                  )}
                </m.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Single Input Truth Table (for NOT gate)
function SingleInputTruthTable({ 
  inputs,
  operation,
  showOutput = true
}: { 
  inputs: boolean[]
  operation?: (a: boolean) => boolean
  showOutput?: boolean
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/20">
            <th className="px-6 py-3 text-left text-sm font-medium text-white/80">Input</th>
            {showOutput && <th className="px-6 py-3 text-left text-sm font-medium text-white/80">Output</th>}
          </tr>
        </thead>
        <tbody>
          {inputs.map((input, index) => {
            const output = operation ? operation(input) : false
            return (
              <m.tr 
                key={index}
                className="border-b border-white/10 hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <td className="px-6 py-4">
                  <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold ${
                    input 
                      ? 'bg-green-500/20 border-green-400 text-green-400' 
                      : 'bg-red-500/20 border-red-400 text-red-400'
                  }`}>
                    {input ? '1' : '0'}
                  </div>
                </td>
                {showOutput && (
                  <td className="px-6 py-4">
                    <m.div 
                      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold ${
                        output 
                          ? 'bg-green-500/20 border-green-400 text-green-400' 
                          : 'bg-red-500/20 border-red-400 text-red-400'
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {output ? '1' : '0'}
                    </m.div>
                  </td>
                )}
              </m.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Pattern Visualization Component
function PatternVisualization({ pattern }: { pattern: 'AND' | 'OR' | 'NOT' | 'XOR' }) {
  const getPatternDescription = () => {
    switch (pattern) {
      case 'AND':
        return { text: "All inputs must be TRUE", color: "text-blue-400" }
      case 'OR':
        return { text: "At least one input must be TRUE", color: "text-green-400" }
      case 'NOT':
        return { text: "Output is opposite of input", color: "text-purple-400" }
      case 'XOR':
        return { text: "Exactly one input must be TRUE", color: "text-yellow-400" }
    }
  }

  const { text, color } = getPatternDescription()

  return (
    <m.div 
      className="text-center p-6 bg-white/5 rounded-lg border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={`text-2xl font-bold mb-2 ${color}`}>{pattern} Pattern</h3>
      <p className="text-white/80 text-lg">{text}</p>
    </m.div>
  )
}

function TruthTablesContent() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-1')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  
  // Interactive states
  const [tableInputs, setTableInputs] = useState([
    { A: false, B: false },
    { A: false, B: true },
    { A: true, B: false },
    { A: true, B: true }
  ])
  const [showTruthTableCard, setShowTruthTableCard] = useState(false)
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  
  // Phase dialogs
  const phaseDialogs = {
    'slide-1': [
      { id: '1', npc: 'ECHELON' as const, text: "Welcome back! Now that you understand TRUE and FALSE, let's learn how to organize them.", requiresInteraction: true }
    ],
    'slide-2': [
      { id: '2a', npc: 'ECHELON' as const, text: "When we have binary values and operations, we need a way to see all possible outcomes.", requiresInteraction: false },
      { id: '2b', npc: 'ECHELON' as const, text: "Truth tables are like maps that show us every possible combination of inputs and their results.", requiresInteraction: false },
      { id: '2c', npc: 'ECHELON' as const, text: "They're essential for understanding how digital systems behave.", requiresInteraction: true }
    ],
    'slide-3': [
      { id: '3a', npc: 'ECHELON' as const, text: "Let's start simple. With two inputs, A and B, we have four possible combinations.", requiresInteraction: false },
      { id: '3b', npc: 'ECHELON' as const, text: "Try clicking on the inputs to see how they change. Each row represents a different scenario.", requiresInteraction: true }
    ],
    'slide-4': [
      { id: '4a', npc: 'ECHELON' as const, text: "Now let's see how AND logic works in a truth table.", requiresInteraction: false },
      { id: '4b', npc: 'ECHELON' as const, text: "AND only outputs TRUE (1) when both inputs are TRUE. It's like needing two keys to open a door.", requiresInteraction: true }
    ],
    'slide-5': [
      { id: '5a', npc: 'ECHELON' as const, text: "Here's the OR operation. It's more forgiving than AND.", requiresInteraction: false },
      { id: '5b', npc: 'ECHELON' as const, text: "OR outputs TRUE (1) when at least one input is TRUE. Like having multiple ways to turn on a light.", requiresInteraction: true }
    ],
    'slide-6': [
      { id: '6a', npc: 'ECHELON' as const, text: "The NOT operation is special - it only has one input.", requiresInteraction: false },
      { id: '6b', npc: 'ECHELON' as const, text: "NOT simply flips the value. TRUE becomes FALSE, FALSE becomes TRUE. It's the digital equivalent of 'opposite day'!", requiresInteraction: true }
    ],
    'slide-7': [
      { id: '7a', npc: 'ECHELON' as const, text: "Let me show you a special one - XOR (exclusive OR).", requiresInteraction: false },
      { id: '7b', npc: 'ECHELON' as const, text: "XOR is TRUE when inputs are different, FALSE when they're the same. It's like a 'difference detector'.", requiresInteraction: true }
    ],
    'slide-8': [
      { id: '8a', npc: 'ECHELON' as const, text: "Truth tables help us predict behavior without building circuits.", requiresInteraction: false },
      { id: '8b', npc: 'ECHELON' as const, text: "Engineers use them to design everything from simple switches to complex processors.", requiresInteraction: true }
    ],
    'slide-9': [
      { id: '9a', npc: 'ECHELON' as const, text: "Notice the patterns? Each operation has its own 'fingerprint' in the truth table.", requiresInteraction: false },
      { id: '9b', npc: 'ECHELON' as const, text: "These patterns are the foundation of digital logic design.", requiresInteraction: true }
    ],
    'slide-10': [
      { id: '10a', npc: 'ECHELON' as const, text: "Excellent work! You now understand truth tables - the language of digital logic.", requiresInteraction: false },
      { id: '10b', npc: 'ECHELON' as const, text: "Next, we'll use these tables to build actual logic gates and create circuits!", requiresInteraction: true }
    ]
  }
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  // Concept definitions
  const truthTableConcept: Concept = {
    id: 'truth-table',
    name: 'Truth Table',
    definition: 'A mathematical table that shows all possible combinations of inputs and their corresponding outputs for a logical operation.',
    whyItMatters: 'Truth tables are fundamental tools in digital logic, computer science, and mathematics. They allow us to analyze and design logical systems systematically.',
    demonstration: (
      <div className="flex justify-center">
        <InteractiveTruthTable 
          inputs={[
            { A: false, B: false },
            { A: false, B: true },
            { A: true, B: false },
            { A: true, B: true }
          ]}
          operation={(a, b) => a && b}
          showOutput={true}
          editable={false}
        />
      </div>
    ),
    properties: [
      {
        id: 'completeness',
        name: 'Completeness',
        description: 'Shows every possible combination of inputs',
        whyItMatters: 'Ensures no edge cases are missed in logical analysis.',
        demonstration: (
          <div className="text-center">
            <p className="text-white/60 mb-2">2 inputs = 2² = 4 combinations</p>
            <p className="text-white/60">3 inputs = 2³ = 8 combinations</p>
          </div>
        )
      },
      {
        id: 'systematic',
        name: 'Systematic Organization',
        description: 'Inputs are arranged in a predictable pattern',
        whyItMatters: 'Makes it easy to verify correctness and spot patterns.',
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
    if (entry.title === 'Truth Table') {
      setViewingConcept(truthTableConcept)
      setShowConceptViewer(true)
    }
  }
  
  const handleTableInputChange = (index: number, input: 'A' | 'B', value: boolean) => {
    const newInputs = [...tableInputs]
    newInputs[index][input] = value
    setTableInputs(newInputs)
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
      const phaseOrder: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10']
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
    const stardustEarned = 30
    await addStardust(stardustEarned)
    setEarnedStardust(stardustEarned)
    setShowCompletionScreen(true)
  }
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  // Effects for showing concept cards
  useEffect(() => {
    if (currentPhase === 'slide-2' && currentDialogIndex === 2) {
      setShowTruthTableCard(true)
      setTimeout(() => setShowTruthTableCard(false), 5000)
    }
  }, [currentPhase, currentDialogIndex])
  
  // Add notebook entries
  useEffect(() => {
    if (currentPhase === 'slide-2' && currentDialogIndex === 1) {
      addNotebookEntry({
        type: 'definition',
        title: 'Truth Table',
        content: 'A table showing all possible input combinations and their outputs'
      })
    }
    if (currentPhase === 'slide-4' && currentDialogIndex === 0) {
      addNotebookEntry({
        type: 'property',
        title: 'AND Pattern',
        content: 'Output is 1 only when all inputs are 1'
      })
    }
    if (currentPhase === 'slide-5' && currentDialogIndex === 0) {
      addNotebookEntry({
        type: 'property',
        title: 'OR Pattern',
        content: 'Output is 1 when at least one input is 1'
      })
    }
    if (currentPhase === 'slide-6' && currentDialogIndex === 0) {
      addNotebookEntry({
        type: 'property',
        title: 'NOT Pattern',
        content: 'Output is opposite of input'
      })
    }
    if (currentPhase === 'slide-7' && currentDialogIndex === 0) {
      addNotebookEntry({
        type: 'property',
        title: 'XOR Pattern',
        content: 'Output is 1 when inputs are different'
      })
    }
  }, [currentPhase, currentDialogIndex])
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto p-6 pt-24">
        <AnimatePresence mode="wait">
          <m.div
            key={currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Title */}
            {currentPhase === 'slide-1' && (
              <div className="text-center space-y-4">
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-32 h-32 mx-auto"
                >
                  <Table2 className="w-full h-full text-purple-500" />
                </m.div>
                <h1 className="text-4xl font-bold text-white">Truth Tables</h1>
                <p className="text-white/60 max-w-md mx-auto">
                  Mapping all possibilities in binary logic
                </p>
              </div>
            )}
            
            {/* Basic Truth Table Introduction */}
            {currentPhase === 'slide-2' && (
              <div className="text-center space-y-6">
                <Grid3x3 className="w-24 h-24 mx-auto text-purple-500" />
                <h2 className="text-3xl font-bold text-white">What is a Truth Table?</h2>
                <p className="text-white/60 max-w-lg mx-auto">
                  A systematic way to show all possible input combinations and their outputs
                </p>
              </div>
            )}
            
            {/* Interactive Basic Table */}
            {currentPhase === 'slide-3' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white text-center">Exploring Input Combinations</h2>
                <InteractiveTruthTable 
                  inputs={tableInputs}
                  onInputChange={handleTableInputChange}
                  showOutput={false}
                  editable={true}
                />
                <p className="text-white/60 text-center">Click the inputs to toggle between 0 and 1</p>
              </div>
            )}
            
            {/* AND Truth Table */}
            {currentPhase === 'slide-4' && (
              <div className="space-y-6">
                <PatternVisualization pattern="AND" />
                <InteractiveTruthTable 
                  inputs={[
                    { A: false, B: false },
                    { A: false, B: true },
                    { A: true, B: false },
                    { A: true, B: true }
                  ]}
                  operation={(a, b) => a && b}
                  showOutput={true}
                  editable={false}
                />
              </div>
            )}
            
            {/* OR Truth Table */}
            {currentPhase === 'slide-5' && (
              <div className="space-y-6">
                <PatternVisualization pattern="OR" />
                <InteractiveTruthTable 
                  inputs={[
                    { A: false, B: false },
                    { A: false, B: true },
                    { A: true, B: false },
                    { A: true, B: true }
                  ]}
                  operation={(a, b) => a || b}
                  showOutput={true}
                  editable={false}
                />
              </div>
            )}
            
            {/* NOT Truth Table */}
            {currentPhase === 'slide-6' && (
              <div className="space-y-6">
                <PatternVisualization pattern="NOT" />
                <SingleInputTruthTable 
                  inputs={[false, true]}
                  operation={(a) => !a}
                  showOutput={true}
                />
              </div>
            )}
            
            {/* XOR Truth Table */}
            {currentPhase === 'slide-7' && (
              <div className="space-y-6">
                <PatternVisualization pattern="XOR" />
                <InteractiveTruthTable 
                  inputs={[
                    { A: false, B: false },
                    { A: false, B: true },
                    { A: true, B: false },
                    { A: true, B: true }
                  ]}
                  operation={(a, b) => a !== b}
                  showOutput={true}
                  editable={false}
                />
              </div>
            )}
            
            {/* Practical Applications */}
            {currentPhase === 'slide-8' && (
              <div className="text-center space-y-6">
                <Binary className="w-24 h-24 mx-auto text-purple-500" />
                <h2 className="text-3xl font-bold text-white">Real-World Applications</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Circuit Design</h3>
                    <p className="text-white/60 text-sm">Engineers use truth tables to design digital circuits</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Programming</h3>
                    <p className="text-white/60 text-sm">Programmers use them to verify logical conditions</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Problem Solving</h3>
                    <p className="text-white/60 text-sm">Helps visualize all possible scenarios</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Pattern Recognition */}
            {currentPhase === 'slide-9' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white text-center">Recognizing Patterns</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-blue-400 font-semibold mb-2">AND Pattern</h3>
                    <p className="text-white/60 text-sm">Only one TRUE output (1,1)</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-green-400 font-semibold mb-2">OR Pattern</h3>
                    <p className="text-white/60 text-sm">Three TRUE outputs</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-purple-400 font-semibold mb-2">NOT Pattern</h3>
                    <p className="text-white/60 text-sm">Always opposite</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-yellow-400 font-semibold mb-2">XOR Pattern</h3>
                    <p className="text-white/60 text-sm">TRUE when different</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Completion */}
            {currentPhase === 'slide-10' && (
              <div className="text-center space-y-6">
                <CheckCircle2 className="w-24 h-24 mx-auto text-green-500" />
                <h2 className="text-3xl font-bold text-white">Truth Tables Mastered!</h2>
                <p className="text-white/60 max-w-lg mx-auto">
                  You now understand how to map and analyze all possible logical outcomes
                </p>
              </div>
            )}
          </m.div>
        </AnimatePresence>
      </div>
      
      {/* Dialog System */}
      {currentDialog && !showCompletionScreen && (
        <NPCDialog
          dialog={currentDialog}
          onNext={handleNextDialog}
          isVisible={true}
          canGoBack={!(currentPhase === 'slide-1' && currentDialogIndex === 0)}
          onBack={handleBackDialog}
        />
      )}
      
      {/* Learning Notebook */}
      <LearningNotebook
        entries={notebookEntries}
        onAddNote={addUserNote}
        onEntryClick={handleNotebookEntryClick}
      />
      
      {/* Truth Table Concept Card */}
      {showTruthTableCard && (
        <m.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
        >
          <m.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
              // Add to dictionary and notebook
              dictionaryService.addEntry({
                id: 'truth-table',
                term: 'Truth Table',
                definition: 'A table showing all possible input combinations and their outputs',
                category: 'computer-science',
                relatedTerms: ['binary', 'logic', 'AND', 'OR', 'NOT'],
                examples: ['A 2-input truth table has 4 rows'],
                visualAid: 'Table with inputs and outputs'
              })
              addNotebookEntry({
                type: 'definition',
                title: 'Truth Table',
                content: 'A systematic way to show all logical possibilities'
              })
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto"
          >
            <div className="glass-morphism rounded-2xl p-8 relative">
              <button
                onClick={() => setShowTruthTableCard(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cosmic-aurora/20 rounded-xl">
                  <Table2 className="w-8 h-8 text-cosmic-aurora" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Truth Table</h3>
                  <p className="text-white/60 text-sm">New Concept Unlocked</p>
                </div>
              </div>
              <div className="relative px-6 pb-6">
                <p className="text-white/80 mb-4">
                  A systematic representation of all possible logical outcomes
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
      
      {/* Concept Viewer */}
      <ConceptViewer
        concept={viewingConcept}
        isOpen={showConceptViewer}
        onClose={() => {
          setShowConceptViewer(false)
          setViewingConcept(null)
        }}
      />
      
      {/* Completion Screen */}
      {showCompletionScreen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
        >
          <div className="max-w-2xl w-full">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-2xl p-8 text-center"
            >
              <m.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-cosmic-aurora/20 rounded-full flex items-center justify-center"
              >
                <Award className="w-10 h-10 text-cosmic-aurora" />
              </m.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
              <p className="text-white/80 mb-6">You've mastered Truth Tables!</p>
              
              {/* Rewards */}
              <div className="bg-cosmic-void/50 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-cosmic-starlight" />
                  <span className="text-white font-medium">Rewards Earned</span>
                </div>
                <div className="text-cosmic-starlight text-2xl font-bold">
                  +{earnedStardust} Stardust
                </div>
              </div>
              
              {/* Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/review')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-cosmic-aurora" />
                  <span className="text-white/80 text-sm">Review Notes</span>
                </m.button>
                
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/unwind')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <Brain className="w-6 h-6 text-cosmic-starlight" />
                  <span className="text-white/80 text-sm">Meditate</span>
                </m.button>
                
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/lessons')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-aurora/20 rounded-xl hover:bg-cosmic-aurora/30 transition-colors"
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                  <span className="text-white text-sm font-medium">Continue</span>
                </m.button>
              </div>
            </m.div>
          </div>
        </m.div>
      )}
    </div>
  )
}

export default function TruthTablesPage() {
  return (
    <ProtectedRoute>
      <TruthTablesContent />
    </ProtectedRoute>
  )
}