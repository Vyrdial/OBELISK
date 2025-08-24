'use client'

import LogicGateWorkspace from '@/components/sandbox/LogicGateWorkspace'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Zap, CheckCircle, Binary, ChevronRight } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

function WiringNotGateContent() {
  const router = useRouter()
  const [circuitWired, setCircuitWired] = useState(false)
  const [puzzleComplete, setPuzzleComplete] = useState(false)
  const workspaceRef = useRef<any>(null)
  const [objective, setObjective] = useState("Place your components: Switch, NOT gate, and Output!")
  const [isNavigating, setIsNavigating] = useState(false)
  
  // Check circuit completion from workspace
  const handleCircuitUpdate = (gates: any[], connections: any[]) => {
    // Check if we have the right components
    const switches = gates.filter(g => g.type === 'SWITCH')
    const notGates = gates.filter(g => g.type === 'NOT')
    const outputs = gates.filter(g => g.type === 'OUTPUT')
    
    // Update objective based on components placed (any order)
    if (!circuitWired) {
      const totalComponents = switches.length + notGates.length + outputs.length
      
      if (totalComponents === 0) {
        setObjective("Place your components: Switch, NOT gate, and Output!")
      } else if (totalComponents === 3) {
        // All components placed
        if (connections.length === 0) {
          setObjective("Now wire them together!")
        }
      } else {
        // Some components placed, figure out what's missing
        const missing = []
        if (switches.length === 0) {
          missing.push("a switch")
        }
        if (notGates.length === 0) {
          missing.push("a NOT gate")
        }
        if (outputs.length === 0) {
          missing.push("an output")
        }
        
        // Create encouraging message based on what's placed and what's missing
        if (totalComponents === 1) {
          setObjective(`Good start! Add ${missing.join(" and ")}`)
        } else if (totalComponents === 2) {
          setObjective(`Almost there! Add ${missing[0]}`)
        }
      }
    }
    
    if (switches.length === 1 && notGates.length === 1 && outputs.length === 1) {
      // Check if properly wired
      const switchGate = switches[0]
      const notGate = notGates[0]
      const output = outputs[0]
      
      // Check connection from switch to NOT gate
      const switchToNot = connections.filter(c => 
        c.from.gateId === switchGate.id &&
        c.to.gateId === notGate.id
      )
      
      // Check connection from NOT to output
      const notToOutput = connections.filter(c =>
        c.from.gateId === notGate.id &&
        c.to.gateId === output.id
      )
      
      if (switchToNot.length === 1 && notToOutput.length === 1 && !circuitWired) {
        setCircuitWired(true)
        setObjective("Flip the switch to see NOT in action!")
      }
      
      // Mark as complete once they've toggled the switch at least once after wiring
      if (circuitWired && !puzzleComplete) {
        // Auto-complete after a short delay to let them see the NOT gate behavior
        setTimeout(() => {
          setPuzzleComplete(true)
          setObjective("Complete! 🎉")
        }, 2000)
      }
    }
  }

  return (
    <div className="h-screen relative overflow-hidden bg-cosmic-void">
      <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      <TopNavigationBar />
      
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
                  <h3 className="text-2xl font-bold text-white mb-2">Circuit Complete!</h3>
                  <p className="text-white/80">Perfect! The NOT gate inverts its input.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isNavigating) {
                    setIsNavigating(true)
                    router.push('/binary-logic/gate-challenges')
                  }
                }}
                disabled={isNavigating}
                className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next Puzzle
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </m.div>
      )}

      {/* Logic Gate Workspace */}
      <div className="relative z-10 h-[calc(100vh-4rem)]">
        <LogicGateWorkspace 
          ref={workspaceRef}
          availableGates={['NOT', 'SWITCH', 'OUTPUT']}
          enableFileOperations={false}
          componentLimits={{ 'NOT': 1, 'SWITCH': 1, 'OUTPUT': 1 }}
          onCircuitUpdate={handleCircuitUpdate}
          objective={objective}
          puzzleComplete={puzzleComplete}
          enableZoom={false}
          enablePan={false}
        />
      </div>
    </div>
  )
}

export default function WiringNotGatePage() {
  return (
    <ProtectedRoute>
      <WiringNotGateContent />
    </ProtectedRoute>
  )
}