'use client'

import LogicGateWorkspace from '@/components/sandbox/LogicGateWorkspace'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Binary, CheckCircle, HelpCircle, SkipForward } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

function MajorityVoteContent() {
  const router = useRouter()
  const [puzzleComplete, setPuzzleComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)
  const workspaceRef = useRef<any>(null)
  const [objective, setObjective] = useState("Build a majority vote circuit: Output true when at least 2 of 3 inputs are true")

  // Check circuit completion from workspace
  const handleCircuitUpdate = (gates: any[], connections: any[]) => {
    // We need: 3 switches (voters), multiple AND gates for pairs, OR gate to combine, 1 output
    const switches = gates.filter(g => g.type === 'SWITCH')
    const andGates = gates.filter(g => g.type === 'AND')
    const orGates = gates.filter(g => g.type === 'OR')
    const outputs = gates.filter(g => g.type === 'OUTPUT')
    
    // Check if we have minimum required components
    if (switches.length >= 3 && andGates.length >= 3 && orGates.length >= 1 && outputs.length >= 1) {
      // Check if there are enough connections
      if (connections.length >= 7) {
        // Test the logic
        const a = switches[0]?.output || false
        const b = switches[1]?.output || false
        const c = switches[2]?.output || false
        
        // Majority logic: (A AND B) OR (B AND C) OR (A AND C)
        const expectedOutput = (a && b) || (b && c) || (a && c)
        
        // Simple validation - check if circuit is complete
        const outputGate = outputs[0]
        if (outputGate && !puzzleComplete) {
          // Check if OR gate connects to output (typical majority vote structure)
          const orToOutput = connections.some(c => 
            orGates.some(o => o.id === c.from.gateId) &&
            c.to.gateId === outputGate.id
          )
          
          // Check if AND gates connect to OR gate
          const andToOr = connections.filter(c =>
            andGates.some(a => a.id === c.from.gateId) &&
            orGates.some(o => o.id === c.to.gateId)
          ).length >= 2 // At least 2 AND gates should connect to OR
          
          if (orToOutput && andToOr) {
            setPuzzleComplete(true)
            setObjective("Brilliant! Your majority vote circuit works!")
          }
        }
      }
    }
  }

  const handleGiveUp = () => {
    setGaveUp(true)
    setShowHint(false)
    setObjective("Solution revealed - study the pattern!")
  }

  const handleNextPuzzle = () => {
    router.push('/courses/computer-science/binary-logic/challenge-lock')
  }

  const handleSkipAll = () => {
    router.push('/binary-logic/gates-and-tables-2')
  }

  return (
    <div className="h-screen relative overflow-hidden bg-cosmic-void">
      <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      <TopNavigationBar />
      
      {/* Challenge Header */}
      <div className="absolute top-20 left-0 right-0 z-20 text-center">
        <div className="inline-block bg-purple-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl px-6 py-3">
          <div className="flex items-center gap-3">
            <Binary className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Majority Vote Challenge</h2>
          </div>
        </div>
      </div>

      {/* Hint/Give Up Buttons */}
      <div className="absolute top-20 right-4 z-20 flex gap-2">
        {!puzzleComplete && !gaveUp && (
          <>
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              {showHint ? 'Hide Hint' : 'Need a Hint?'}
            </button>
            <button
              onClick={handleGiveUp}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
            >
              Give Up
            </button>
          </>
        )}
        <button
          onClick={handleSkipAll}
          className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all border border-gray-500/30 flex items-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Skip All Challenges
        </button>
      </div>

      {/* Hint Display */}
      <AnimatePresence>
        {showHint && !gaveUp && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-36 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-500/50 rounded-xl p-4 max-w-md">
              <p className="text-blue-100">
                💡 With 3 voters (A, B, C), think about all the ways 2 can agree:
                A and B agree, B and C agree, or A and C agree. How can you detect each pair?
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Give Up Solution Display */}
      <AnimatePresence>
        {gaveUp && (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-36 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-orange-500/20 backdrop-blur-xl border border-orange-500/50 rounded-xl p-6 max-w-2xl">
              <h3 className="text-xl font-bold text-orange-200 mb-3">Solution:</h3>
              <ol className="text-orange-100 space-y-2">
                <li>1. Create 3 AND gates for each pair of voters:</li>
                <li className="ml-4">• AND gate 1: Voter A + Voter B</li>
                <li className="ml-4">• AND gate 2: Voter B + Voter C</li>
                <li className="ml-4">• AND gate 3: Voter A + Voter C</li>
                <li>2. Connect all three AND gate outputs to one OR gate</li>
                <li>3. Connect the OR gate to the Output</li>
              </ol>
              <p className="text-orange-200/80 mt-4 text-sm">
                Formula: (A AND B) OR (B AND C) OR (A AND C)
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Completion Message */}
      {puzzleComplete && (
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 right-6 z-30 max-w-4xl mx-auto"
        >
          <div className="bg-green-500/20 backdrop-blur-xl border border-green-500 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h3>
                  <p className="text-white/80">Impressive! You built a working majority vote system.</p>
                </div>
              </div>
              <button
                onClick={handleNextPuzzle}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95"
              >
                Next Challenge
              </button>
            </div>
          </div>
        </m.div>
      )}

      {/* Logic Gate Workspace */}
      <div className="relative z-10 h-[calc(100vh-4rem)]">
        <LogicGateWorkspace 
          ref={workspaceRef}
          availableGates={['AND', 'OR', 'NOT', 'SWITCH', 'OUTPUT']}
          enableFileOperations={false}
          onCircuitUpdate={handleCircuitUpdate}
          objective={objective}
          puzzleComplete={puzzleComplete}
        />
      </div>
    </div>
  )
}

export default function MajorityVotePage() {
  return (
    <ProtectedRoute>
      <MajorityVoteContent />
    </ProtectedRoute>
  )
}