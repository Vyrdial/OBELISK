'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Zap, RefreshCw, Target, Users, Trophy } from 'lucide-react'
import MassVisualization from '@/components/mass/MassVisualization'
import MassGrowthDisplay from '@/components/mass/MassGrowthDisplay'
import WanderingWisps from '@/components/mass/WanderingWisps'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { useMassSystem } from '@/hooks/useMassSystem'

function MassDemoContent() {
  const router = useRouter()
  const massSystem = useMassSystem()
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const demoActions = [
    {
      id: 'add-stardust',
      title: 'Add Stardust',
      description: 'Gain cosmic energy and grow your mass',
      icon: Sparkles,
      color: 'cosmic-starlight',
      action: () => massSystem.addStardust(25, 'Demo Action')
    },
    {
      id: 'absorb-matter',
      title: 'Absorb Matter',
      description: 'Consume cosmic material efficiently',
      icon: Zap,
      color: 'cosmic-aurora',
      action: () => massSystem.absorbMatter(50, 'Demo Absorption')
    },
    {
      id: 'spawn-wisp',
      title: 'Spawn Wisp',
      description: 'Create a wandering wisp from failure',
      icon: RefreshCw,
      color: 'cosmic-quasar',
      action: () => massSystem.spawnWisp('demo-challenge', 'Demo Challenge', 'Testing wisp creation')
    },
    {
      id: 'fusion-event',
      title: 'Fusion Event',
      description: 'Attempt nuclear fusion for massive growth',
      icon: Target,
      color: 'cosmic-pulsar',
      action: () => massSystem.performFusion(200)
    },
    {
      id: 'study-group',
      title: 'Study Group',
      description: 'Collaborate with others for temporary boost',
      icon: Users,
      color: 'cosmic-nebula',
      action: () => massSystem.joinStudyGroup([150, 300, 75], 10000)
    },
    {
      id: 'debate-challenge',
      title: 'Debate Challenge',
      description: 'Engage in intellectual combat',
      icon: Trophy,
      color: 'cosmic-supernova',
      action: () => massSystem.performDebate(250, 'win')
    }
  ]

  const handleActionClick = (action: typeof demoActions[0]) => {
    setSelectedAction(action.id)
    action.action()
    
    // Clear selection after a delay
    setTimeout(() => setSelectedAction(null), 1000)
  }

  const systemStats = massSystem.getSystemStats()

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-nebula-gradient opacity-50" />}>
        <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} />
      </ClientOnly>

      {/* Header */}
      <m.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-30 p-4 border-b border-white/10 glass-morphism"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <m.button
              onClick={() => router.push('/constellations')}
              className="p-2 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-75 cosmic-focus"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </m.button>
            
            <div>
              <h1 className="text-2xl font-bold text-white cosmic-heading">
                Mass System Demo
              </h1>
              <p className="text-cosmic-starlight text-sm">
                Explore the Agar.io-style mass growth system
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-cosmic-aurora font-bold text-lg">
              {massSystem.massState.evolutionStage.current}
            </div>
            <div className="text-white/60 text-sm">Current Evolution</div>
          </div>
        </div>
      </m.header>

      <div className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Mass Visualization */}
            <div className="space-y-6">
              <m.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-morphism rounded-3xl p-8 border border-white/20"
              >
                <h2 className="text-xl font-bold text-white cosmic-heading mb-6">
                  Your Cosmic Mass
                </h2>
                
                <div className="flex items-center justify-center mb-6">
                  <ClientOnly fallback={
                    <div className="w-48 h-48 rounded-full bg-cosmic-starlight/20 animate-pulse" />
                  }>
                    <MassVisualization 
                      massState={massSystem.massState}
                      size="xl"
                      interactive={true}
                    />
                  </ClientOnly>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="glass-morphism rounded-xl p-4">
                    <div className="text-cosmic-starlight font-bold text-2xl">
                      {Math.floor(massSystem.massState.stardust)}
                    </div>
                    <div className="text-white/60 text-sm">Stardust</div>
                  </div>
                  <div className="glass-morphism rounded-xl p-4">
                    <div className="text-cosmic-aurora font-bold text-2xl">
                      {Math.floor(massSystem.massState.mass)}
                    </div>
                    <div className="text-white/60 text-sm">Mass</div>
                  </div>
                  <div className="glass-morphism rounded-xl p-4">
                    <div className="text-cosmic-quasar font-bold text-2xl">
                      {massSystem.massState.orbitalBodies.length}
                    </div>
                    <div className="text-white/60 text-sm">Orbitals</div>
                  </div>
                  <div className="glass-morphism rounded-xl p-4">
                    <div className="text-cosmic-pulsar font-bold text-2xl">
                      {massSystem.wisps.length}
                    </div>
                    <div className="text-white/60 text-sm">Wisps</div>
                  </div>
                </div>
              </m.div>

              {/* Growth Events */}
              <m.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-morphism rounded-3xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-bold text-white cosmic-heading mb-4">
                  Recent Growth Events
                </h3>
                <ClientOnly fallback={<div className="text-white/60">Loading events...</div>}>
                  <MassGrowthDisplay 
                    massState={massSystem.massState}
                    onMassStateUpdate={massSystem.setMassState}
                    recentGrowthEvents={massSystem.growthEvents.slice(-5)}
                    showStats={false}
                    interactive={false}
                  />
                </ClientOnly>
              </m.div>
            </div>

            {/* Right Column - Actions & Stats */}
            <div className="space-y-6">
              <m.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-morphism rounded-3xl p-8 border border-white/20"
              >
                <h2 className="text-xl font-bold text-white cosmic-heading mb-6">
                  Mass Actions
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {demoActions.map((action, index) => {
                    const Icon = action.icon
                    const isSelected = selectedAction === action.id
                    
                    return (
                      <m.button
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleActionClick(action)}
                        disabled={isSelected}
                        className={`p-4 rounded-xl border transition-all duration-75 cosmic-focus ${
                          isSelected 
                            ? 'border-white/40 bg-white/10 scale-95' 
                            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                        }`}
                        whileHover={{ scale: isSelected ? 0.95 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${action.color}/20`}>
                            <Icon className={`w-5 h-5 text-${action.color}`} />
                          </div>
                          <div className="text-left">
                            <div className="text-white font-semibold text-sm">
                              {action.title}
                            </div>
                            <div className="text-white/60 text-xs">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </m.button>
                    )
                  })}
                </div>
              </m.div>

              {/* System Stats */}
              <m.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-morphism rounded-3xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-bold text-white cosmic-heading mb-4">
                  System Statistics
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Orbital Mass:</span>
                    <span className="text-cosmic-aurora font-semibold">
                      {Math.floor(systemStats.totalOrbitalMass)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Growth Efficiency:</span>
                    <span className="text-cosmic-starlight font-semibold">
                      {systemStats.growthEfficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Can Perform Fusion:</span>
                    <span className={`font-semibold ${
                      systemStats.canPerformFusion ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {systemStats.canPerformFusion ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Can Capture Orbitals:</span>
                    <span className={`font-semibold ${
                      systemStats.canCaptureOrbitals ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {systemStats.canCaptureOrbitals ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Velocity:</span>
                    <span className="text-cosmic-quasar font-semibold">
                      {massSystem.massState.velocity.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Gravitational Pull:</span>
                    <span className="text-cosmic-pulsar font-semibold">
                      {massSystem.massState.gravitationalPull.toFixed(3)}
                    </span>
                  </div>
                </div>
              </m.div>
            </div>
          </div>
        </div>
      </div>

      {/* Wandering Wisps */}
      <ClientOnly fallback={null}>
        <WanderingWisps 
          wisps={massSystem.wisps}
          onWispClick={massSystem.captureWisp}
          onWispUpdate={massSystem.setWisps}
        />
      </ClientOnly>
    </div>
  )
}

export default function MassDemoPage() {
  return <MassDemoContent />
}