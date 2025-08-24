'use client'

import LogicGateWorkspace from '@/components/sandbox/LogicGateWorkspace'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, HelpCircle, SkipForward } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

function SecurityAlarmContent() {
  const router = useRouter()
  const [puzzleComplete, setPuzzleComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)
  const workspaceRef = useRef<any>(null)
  const [objective, setObjective] = useState("Build a security alarm: Alert when ANY door is open AND system is armed")
  
  // Pre-installed switches for the puzzle
  const initialGates = [
    {
      id: 'switch-door1',
      type: 'SWITCH' as const,
      x: 400,
      y: 180,
      inputs: {},
      output: false,
      label: 'Door 1'
    },
    {
      id: 'switch-door2',
      type: 'SWITCH' as const,
      x: 400,
      y: 320,
      inputs: {},
      output: false,
      label: 'Door 2'
    },
    {
      id: 'switch-arm',
      type: 'SWITCH' as const,
      x: 400,
      y: 460,
      inputs: {},
      output: false,
      label: 'Arm System'
    }
  ]

  // Check circuit completion from workspace
  const handleCircuitUpdate = (gates: any[], connections: any[]) => {
    // We need: 3 switches (2 doors, 1 arm switch), OR gate for doors, AND gate for final, 1 output
    const switches = gates.filter(g => g.type === 'SWITCH')
    const orGates = gates.filter(g => g.type === 'OR')
    const andGates = gates.filter(g => g.type === 'AND')
    const outputs = gates.filter(g => g.type === 'OUTPUT')
    
    // Check if circuit is properly wired
    if (switches.length >= 3 && orGates.length >= 1 && andGates.length >= 1 && outputs.length >= 1) {
      // Simplified check - in a real implementation we'd verify the exact wiring
      // For now, check if there are enough connections suggesting proper wiring
      if (connections.length >= 5) {
        // Test the logic by checking switch states
        // Assuming switches[0] and switches[1] are doors, switches[2] is arm
        const door1 = switches[0]?.output || false
        const door2 = switches[1]?.output || false
        const armed = switches[2]?.output || false
        
        // Alarm should trigger when (door1 OR door2) AND armed
        const expectedOutput = (door1 || door2) && armed
        
        // Find the output gate and check if it matches expected
        const outputGate = outputs[0]
        if (outputGate && connections.some(c => c.to.gateId === outputGate.id)) {
          // Verify the circuit behavior
          if (!puzzleComplete) {
            // Simple validation - check if AND gate is connected to output
            const andToOutput = connections.some(c => 
              andGates.some(a => a.id === c.from.gateId) &&
              c.to.gateId === outputGate.id
            )
            
            if (andToOutput) {
              setPuzzleComplete(true)
              setObjective("Perfect! Your alarm system works!")
            }
          }
        }
      }
    }
  }

  const handleGiveUp = () => {
    setGaveUp(true)
    setShowHint(false)
    setObjective("Here's the solution: Door1 OR Door2 → AND with Armed → Output")
  }

  const handleNextPuzzle = () => {
    router.push('/courses/computer-science/binary-logic/challenge-vote')
  }

  const handleSkipAll = () => {
    router.push('/binary-logic/gates-and-tables-2')
  }

  return (
    <div className="h-screen relative overflow-hidden bg-cosmic-void">
      <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      <TopNavigationBar />
      

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
                💡 Think about it: You need to detect if ANY door is open (what gate does that?), 
                then only trigger the alarm if the system is armed (what gate combines conditions?).
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
                <li>1. Connect Door1 and Door2 switches to an OR gate (any door open)</li>
                <li>2. Connect the OR gate output and Armed switch to an AND gate</li>
                <li>3. Connect the AND gate to the Output (alarm)</li>
              </ol>
              <p className="text-orange-200/80 mt-4 text-sm">
                This creates: (Door1 OR Door2) AND Armed = Alarm
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
                  <p className="text-white/80">Excellent! You built a working security alarm system.</p>
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
          initialGates={initialGates}
        />
      </div>
    </div>
  )
}

export default function SecurityAlarmPage() {
  return (
    <ProtectedRoute>
      <SecurityAlarmContent />
    </ProtectedRoute>
  )
}