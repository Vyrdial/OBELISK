'use client'

import LogicGateWorkspace from '@/components/sandbox/LogicGateWorkspace'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Zap, CheckCircle, Binary, ChevronRight, BookOpen } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

function WiringGatesContent() {
  const router = useRouter()
  const [circuitWired, setCircuitWired] = useState(false)
  const [puzzleComplete, setPuzzleComplete] = useState(false)
  const workspaceRef = useRef<any>(null)
  const [objective, setObjective] = useState("Let's wire an AND gate circuit!")
  const [showToolArrow, setShowToolArrow] = useState(false)
  const [toolsIntroduced, setToolsIntroduced] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showWiringHelp, setShowWiringHelp] = useState(false)
  const [wiringHelpText, setWiringHelpText] = useState('')
  const [lastConnectionCount, setLastConnectionCount] = useState(0)
  const [hasSelectedComponent, setHasSelectedComponent] = useState(false)

  // Start the tutorial immediately
  useEffect(() => {
    // Show tools immediately
    setShowToolArrow(true)
    setToolsIntroduced(true)
    setObjective("Select a component")
  }, [])
  
  // Check circuit completion from workspace
  const handleCircuitUpdate = (gates: any[], connections: any[]) => {
    // Check if we have the right components
    const switches = gates.filter(g => g.type === 'SWITCH')
    const andGates = gates.filter(g => g.type === 'AND')
    const outputs = gates.filter(g => g.type === 'OUTPUT')
    
    // Update objective based on components placed (any order)
    if (!circuitWired && toolsIntroduced) {
      const totalComponents = switches.length + andGates.length + outputs.length
      
      if (totalComponents === 0) {
        setObjective("Select a component")
      } else if (totalComponents === 4) {
        // All components placed
        if (connections.length === 0) {
          setObjective("Now wire them together!")
          setShowWiringHelp(true)
          setWiringHelpText('Click to start a wire')
        } else if (connections.length > 0 && connections.length < 3) {
          // Some wires placed but not all
          if (connections.length > lastConnectionCount) {
            // A new connection was made
            setLastConnectionCount(connections.length)
          }
          setObjective("Place all the wires")
          setShowWiringHelp(true)
          // Text will be set by onConnectionStateChange
        } else if (connections.length > lastConnectionCount) {
          // A new connection was made
          setLastConnectionCount(connections.length)
          // Keep showing the current objective
        }
      } else {
        // Some components placed but not all
        setObjective("Place all the components")
      }
    }
    
    if (switches.length === 2 && andGates.length === 1 && outputs.length === 1) {
      // Check if properly wired
      const andGate = andGates[0]
      const output = outputs[0]
      
      // Check connections between switches and AND gate (either direction)
      const switchToAnd = connections.filter(c => 
        (switches.some(s => s.id === c.from.gateId) && c.to.gateId === andGate.id) ||
        (switches.some(s => s.id === c.to.gateId) && c.from.gateId === andGate.id)
      )
      
      // Check connection between AND and output (either direction)
      const andToOutput = connections.filter(c =>
        (c.from.gateId === andGate.id && c.to.gateId === output.id) ||
        (c.from.gateId === output.id && c.to.gateId === andGate.id)
      )
      
      if (switchToAnd.length === 2 && andToOutput.length === 1 && !circuitWired) {
        setCircuitWired(true)
        setObjective("Power the switches")
        setShowWiringHelp(false)
      }
      
      // Check if switches are on and circuit is complete
      if (circuitWired && switches.every(s => s.output) && !puzzleComplete) {
        setPuzzleComplete(true)
        setObjective("Complete! 🎉")
      }
    }
  }

  return (
    <div className="h-screen relative overflow-hidden bg-cosmic-void">
      <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      <TopNavigationBar />
      
      {/* Tool Introduction */}
      <AnimatePresence>
        {showToolArrow && (
          <>
            {/* Dynamic box around available tools only */}
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute top-[5.2rem] left-2 z-40 pointer-events-none"
            >
              <div className="relative">
                {/* Glowing border box - tightly fits just the 3 available buttons */}
                <m.div 
                  className="absolute w-[210px] h-[100px] border-2 border-white rounded-xl"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                  }}
                />
              </div>
            </m.div>
            
            {/* Arrow pointing to tools - centered under the box */}
            <m.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -10, 0]
              }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{
                y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                scale: { type: "spring", stiffness: 260, damping: 20 }
              }}
              className="absolute top-48 left-[105px] z-40 pointer-events-none"
            >
              {/* Simple white arrow with purple glow */}
              <ArrowUp className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
            </m.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Click Instruction Overlay */}
      <AnimatePresence>
        {(objective === "Select a component" || objective === "Place all the components" || objective === "Place all the wires" || objective === "Power the switches" || showWiringHelp) && (
          <m.div
            initial={{ 
              opacity: 0,
              top: (objective === "Place all the components" || objective === "Place all the wires" || objective === "Power the switches" || showWiringHelp) ? "200px" : "50%"
            }}
            animate={{ 
              opacity: 1,
              top: (objective === "Place all the components" || objective === "Place all the wires" || objective === "Power the switches" || showWiringHelp) ? "200px" : "50%"
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 0.5 },
              top: { duration: 1.2, ease: "easeInOut", delay: objective === "Place all the components" && !showWiringHelp ? 1.5 : 0 }
            }}
            className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            style={{ 
              transform: (objective === "Place all the components" || objective === "Place all the wires" || objective === "Power the switches" || showWiringHelp)
                ? "translateX(-50%)" 
                : "translate(-50%, -50%)"
            }}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Mouse icon with click animation - only show for component selection states */}
              {(objective === "Select a component" || (hasSelectedComponent && objective === "Select a component")) && !showWiringHelp && (
                <m.div
                  animate={{ scale: [1, 0.9, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative"
                >
                  <svg 
                    width="60" 
                    height="80" 
                    viewBox="0 0 60 80" 
                    className="drop-shadow-[0_0_20px_rgba(192,132,252,0.6)]"
                  >
                    {/* Mouse body */}
                    <rect 
                      x="10" 
                      y="20" 
                      width="40" 
                      height="50" 
                      rx="20" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="3"
                    />
                    {/* Mouse wheel */}
                    <rect 
                      x="28" 
                      y="30" 
                      width="4" 
                      height="10" 
                      rx="2" 
                      fill="white"
                    />
                    {/* Click indicator - left button pressed */}
                    <m.path
                      d="M 10 40 L 30 40 L 30 20 Q 10 20 10 40"
                      fill="rgba(192, 132, 252, 0.8)"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </svg>
                </m.div>
              )}
              
              {/* Text instruction */}
              <m.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl font-medium text-white/90 tracking-wide"
                style={{
                  textShadow: '0 0 20px rgba(192, 132, 252, 0.8)'
                }}
              >
                {showWiringHelp ? wiringHelpText : (objective === "Power the switches" ? "Power the switches" : (objective === "Place all the wires" ? "Place all the wires" : (objective === "Place all the components" ? "Place all the components" : (hasSelectedComponent ? "Click anywhere to place" : "Select a component"))))}
              </m.p>
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
                  <h3 className="text-2xl font-bold text-white mb-2">Circuit Complete!</h3>
                  <p className="text-white/80">You've successfully wired your first logic gate!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isNavigating) {
                    setIsNavigating(true)
                    router.push('/binary-logic/wiring-not-gate')
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
          availableGates={['AND', 'SWITCH', 'OUTPUT']}
          enableFileOperations={false}
          componentLimits={{ 'AND': 1, 'SWITCH': 2, 'OUTPUT': 1 }}
          onCircuitUpdate={handleCircuitUpdate}
          objective={objective}
          puzzleComplete={puzzleComplete}
          enableZoom={false}
          enablePan={false}
          showWiringHelp={showWiringHelp}
          wiringHelpText={wiringHelpText}
          onConnectionStateChange={(isConnecting) => {
            if (showWiringHelp) {
              if (isConnecting) {
                setWiringHelpText('Click to end the wire')
              } else {
                setWiringHelpText('Click to start a wire')
              }
            }
          }}
          onToolSelect={() => {
            setHasSelectedComponent(true)
            setShowToolArrow(false)
          }}
        />
      </div>
    </div>
  )
}

export default function WiringGatesPage() {
  return (
    <ProtectedRoute>
      <WiringGatesContent />
    </ProtectedRoute>
  )
}