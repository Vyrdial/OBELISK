'use client'

import LogicGateWorkspace from '@/components/sandbox/LogicGateWorkspace'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, HelpCircle, SkipForward } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

function SmartLockContent() {
  const router = useRouter()
  const [puzzleComplete, setPuzzleComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)
  const workspaceRef = useRef<any>(null)
  const [objective, setObjective] = useState("Build a smart lock: Opens with code 1-0-1 (ON-OFF-ON)")

  // Check circuit completion from workspace
  const handleCircuitUpdate = (gates: any[], connections: any[]) => {
    // We need: 3 switches (code inputs), NOT gate for middle, AND gates to combine, 1 output
    const switches = gates.filter(g => g.type === 'SWITCH')
    const notGates = gates.filter(g => g.type === 'NOT')
    const andGates = gates.filter(g => g.type === 'AND')
    const outputs = gates.filter(g => g.type === 'OUTPUT')
    
    // Check if we have minimum required components
    if (switches.length >= 3 && notGates.length >= 1 && andGates.length >= 2 && outputs.length >= 1) {
      // Check if there are enough connections
      if (connections.length >= 5) {
        // Test the logic - lock opens when Switch1=ON, Switch2=OFF, Switch3=ON
        const switch1 = switches[0]?.output || false
        const switch2 = switches[1]?.output || false
        const switch3 = switches[2]?.output || false
        
        // Expected: switch1 AND (NOT switch2) AND switch3
        const expectedOutput = switch1 && !switch2 && switch3
        
        // Simple validation
        const outputGate = outputs[0]
        if (outputGate && !puzzleComplete) {
          // Check basic structure - AND gate should connect to output
          const andToOutput = connections.some(c => 
            andGates.some(a => a.id === c.from.gateId) &&
            c.to.gateId === outputGate.id
          )
          
          // Check if NOT gate is connected (for inverting middle switch)
          const hasNotConnection = connections.some(c =>
            notGates.some(n => n.id === c.from.gateId || n.id === c.to.gateId)
          )
          
          if (andToOutput && hasNotConnection) {
            setPuzzleComplete(true)
            setObjective("Perfect! Your smart lock recognizes the code 1-0-1!")
          }
        }
      }
    }
  }

  const handleGiveUp = () => {
    setGaveUp(true)
    setShowHint(false)
    setObjective("Solution revealed - see how to detect a specific pattern!")
  }

  const handleFinish = () => {
    router.push('/binary-logic/gates-and-tables-2')
  }

  const handleBackToChallenges = () => {
    router.push('/binary-logic/gate-challenges')
  }

  return (
    <div className="h-screen relative overflow-hidden bg-cosmic-void">
      <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      <TopNavigationBar />
      
      {/* Challenge Header */}
      <div className="absolute top-20 left-0 right-0 z-20 text-center">
        <div className="inline-block bg-purple-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl px-6 py-3">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-yellow-400" />
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
          onClick={handleFinish}
          className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all border border-gray-500/30 flex items-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Skip to Next Lesson
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
                💡 The code is 1-0-1 (ON-OFF-ON). You need Switch1 to be ON, Switch2 to be OFF, 
                and Switch3 to be ON. How can you check if a switch is OFF? What gate inverts signals?
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
                <li>1. Connect Switch2 to a NOT gate (to detect when it's OFF)</li>
                <li>2. Connect Switch1 and the NOT gate output to an AND gate</li>
                <li>3. Connect that AND gate output and Switch3 to another AND gate</li>
                <li>4. Connect the final AND gate to the Output</li>
              </ol>
              <p className="text-orange-200/80 mt-4 text-sm">
                Formula: Switch1 AND (NOT Switch2) AND Switch3 = Lock Opens
              </p>
              <p className="text-orange-200/60 mt-2 text-xs">
                This checks that all three conditions are met: first is ON, second is OFF, third is ON
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
                  <h3 className="text-2xl font-bold text-white mb-2">All Challenges Complete!</h3>
                  <p className="text-white/80">Amazing work! You've mastered combining logic gates.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBackToChallenges}
                  className="px-6 py-3 bg-purple-500/30 text-purple-200 font-semibold rounded-xl hover:bg-purple-500/40 transition-all duration-300 border border-purple-400/30"
                >
                  Back to Challenges
                </button>
                <button
                  onClick={handleFinish}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                >
                  Continue Course
                </button>
              </div>
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

export default function SmartLockPage() {
  return (
    <ProtectedRoute>
      <SmartLockContent />
    </ProtectedRoute>
  )
}