'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MassState, MassGrowthEvent } from '@/types/mass'
import { MassSystem } from '@/utils/massSystem'
import MassVisualization from './MassVisualization'
import { Zap, TrendingUp, Orbit, Atom, Star } from 'lucide-react'

interface MassGrowthDisplayProps {
  massState: MassState
  onMassStateUpdate: (newState: MassState) => void
  recentGrowthEvents?: MassGrowthEvent[]
  showStats?: boolean
  interactive?: boolean
}

export default function MassGrowthDisplay({
  massState,
  onMassStateUpdate,
  recentGrowthEvents = [],
  showStats = true,
  interactive = true
}: MassGrowthDisplayProps) {
  const [growthAnimations, setGrowthAnimations] = useState<MassGrowthEvent[]>([])
  const [selectedStat, setSelectedStat] = useState<string | null>(null)

  // Handle growth events and trigger animations
  useEffect(() => {
    if (recentGrowthEvents.length > 0) {
      const latestEvent = recentGrowthEvents[recentGrowthEvents.length - 1]
      setGrowthAnimations(prev => [...prev, latestEvent])
      
      // Remove animation after duration
      setTimeout(() => {
        setGrowthAnimations(prev => prev.filter(e => e !== latestEvent))
      }, 3000)
    }
  }, [recentGrowthEvents])

  const handleMassClick = () => {
    if (!interactive) return
    
    // Create a small growth event from interaction
    const growthEvent = MassSystem.createGrowthEvent(
      'absorption',
      10,
      'User Interaction',
      massState.mass
    )
    
    const newMassState = MassSystem.updateMassState(massState, growthEvent.effects.stardustGain)
    onMassStateUpdate(newMassState)
  }

  const massGrowthRate = massState.stardust > 0 ? 
    (massState.mass / Math.sqrt(massState.stardust)) * 100 : 0

  return (
    <div className="relative">
      {/* Main Mass Display */}
      <div className="relative flex flex-col items-center">
        <MassVisualization
          massState={massState}
          size="xl"
          interactive={interactive}
          showOrbitals={true}
          onMassClick={handleMassClick}
        />

        {/* Evolution Stage Info */}
        <m.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-2xl font-bold text-white cosmic-heading mb-2">
            {massState.evolutionStage.current}
          </h3>
          
          {massState.evolutionStage.next && (
            <div className="text-sm text-white/70 mb-3">
              Evolving to: <span className="text-cosmic-starlight font-semibold">
                {massState.evolutionStage.next}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {massState.evolutionStage.next && (
            <div className="w-64 bg-white/10 rounded-full h-2 mb-4">
              <m.div
                className="bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${massState.evolutionStage.progressToNext}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          )}
        </m.div>
      </div>

      {/* Growth Animations */}
      <AnimatePresence>
        {growthAnimations.map((event, index) => (
          <GrowthEventAnimation
            key={`${event.timestamp.getTime()}-${index}`}
            event={event}
          />
        ))}
      </AnimatePresence>

      {/* Mass Statistics */}
      {showStats && (
        <m.div
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            icon={<Atom className="w-5 h-5" />}
            label="Mass"
            value={Math.floor(massState.mass).toLocaleString()}
            color="text-cosmic-starlight"
            isSelected={selectedStat === 'mass'}
            onClick={() => setSelectedStat(selectedStat === 'mass' ? null : 'mass')}
          />
          
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Stardust"
            value={massState.stardust.toLocaleString()}
            color="text-cosmic-stardust"
            isSelected={selectedStat === 'stardust'}
            onClick={() => setSelectedStat(selectedStat === 'stardust' ? null : 'stardust')}
          />
          
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Velocity"
            value={Math.floor(massState.velocity)}
            color="text-cosmic-aurora"
            isSelected={selectedStat === 'velocity'}
            onClick={() => setSelectedStat(selectedStat === 'velocity' ? null : 'velocity')}
          />
          
          <StatCard
            icon={<Orbit className="w-5 h-5" />}
            label="Orbitals"
            value={massState.orbitalBodies.length}
            color="text-cosmic-quasar"
            isSelected={selectedStat === 'orbitals'}
            onClick={() => setSelectedStat(selectedStat === 'orbitals' ? null : 'orbitals')}
          />
        </m.div>
      )}

      {/* Detailed Stat View */}
      <AnimatePresence>
        {selectedStat && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white/5 rounded-xl p-4 border border-white/20"
          >
            <StatDetailView 
              stat={selectedStat} 
              massState={massState} 
              growthRate={massGrowthRate}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* Growth Rate Indicator */}
      <m.div
        className="absolute top-4 right-4 bg-black/60 rounded-lg p-2 border border-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-cosmic-aurora" />
          <span className="text-white/80">Growth Rate:</span>
          <span className="text-cosmic-aurora font-bold">
            {massGrowthRate.toFixed(1)}%
          </span>
        </div>
      </m.div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  isSelected,
  onClick
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <m.div
      className={`
        glass-morphism rounded-xl p-4 border cursor-pointer transition-all duration-75 duration-300
        ${isSelected ? 'border-cosmic-starlight bg-white/10' : 'border-white/20 hover:border-white/40'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`${color}`}>
          {icon}
        </div>
        <div>
          <div className="text-white/60 text-xs font-medium">{label}</div>
          <div className={`text-lg font-bold ${color}`}>
            {value}
          </div>
        </div>
      </div>
    </m.div>
  )
}

function StatDetailView({
  stat,
  massState,
  growthRate
}: {
  stat: string
  massState: MassState
  growthRate: number
}) {
  const getStatDetails = () => {
    switch (stat) {
      case 'mass':
        return {
          title: 'Mass',
          description: 'Your accumulated knowledge and understanding, growing through learning and absorption.',
          details: [
            `Current Mass: ${Math.floor(massState.mass)}`,
            `Gravitational Pull: ${massState.gravitationalPull.toFixed(3)}`,
            `Density: ${(massState.mass / (massState.orbitalBodies.length + 1)).toFixed(1)}`,
            `Growth Rate: ${growthRate.toFixed(2)}% efficiency`
          ]
        }
      case 'stardust':
        return {
          title: 'Stardust Reserve',
          description: 'Raw cosmic energy accumulated through challenges, quizzes, and discoveries.',
          details: [
            `Total Stardust: ${massState.stardust.toLocaleString()}`,
            `Conversion Rate: ${(massState.mass / Math.max(1, massState.stardust) * 100).toFixed(2)}% to mass`,
            `Rank Progress: Based on stardust accumulation`,
            `Evolution Fuel: Powers your cosmic transformation`
          ]
        }
      case 'velocity':
        return {
          title: 'Velocity',
          description: 'How quickly you move through the cosmos of knowledge. Larger masses move more deliberately.',
          details: [
            `Current Velocity: ${Math.floor(massState.velocity)}`,
            `Agility Factor: ${(1000 / massState.velocity).toFixed(1)}x`,
            `Learning Speed: Inversely related to mass`,
            `Navigation: Affects orbital mechanics`
          ]
        }
      case 'orbitals':
        return {
          title: 'Orbital Bodies',
          description: 'Concepts, memories, and skills that orbit your cosmic consciousness.',
          details: [
            `Active Orbitals: ${massState.orbitalBodies.length}`,
            `Capture Threshold: ${Math.floor(massState.gravitationalPull * 100)} units`,
            `Types: ${[...new Set(massState.orbitalBodies.map(o => o.type))].join(', ') || 'None'}`,
            `Total Orbital Mass: ${massState.orbitalBodies.reduce((sum, o) => sum + o.mass, 0).toFixed(1)}`
          ]
        }
      default:
        return { title: '', description: '', details: [] }
    }
  }

  const { title, description, details } = getStatDetails()

  return (
    <div>
      <h4 className="text-lg font-bold text-white cosmic-heading mb-2">{title}</h4>
      <p className="text-white/70 text-sm mb-4 leading-relaxed">{description}</p>
      <div className="space-y-2">
        {details.map((detail, index) => (
          <div key={index} className="text-white/80 text-sm flex items-center gap-2">
            <div className="w-1 h-1 bg-cosmic-starlight rounded-full"></div>
            {detail}
          </div>
        ))}
      </div>
    </div>
  )
}

function GrowthEventAnimation({ event }: { event: MassGrowthEvent }) {
  return (
    <m.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2],
        y: [0, -50, -100]
      }}
      transition={{ duration: 3, ease: "easeOut" }}
    >
      <div className="bg-cosmic-starlight/90 rounded-lg px-3 py-2 border border-white/30 shadow-lg">
        <div className="text-white font-bold text-sm">
          +{event.effects.stardustGain} Stardust
        </div>
        {event.effects.massChange > 0 && (
          <div className="text-cosmic-aurora text-xs">
            +{event.effects.massChange.toFixed(1)} Mass
          </div>
        )}
      </div>
      
      {/* Growth particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <m.div
          key={i}
          className="absolute w-1 h-1 bg-cosmic-starlight rounded-full"
          style={{
            left: '50%',
            top: '50%'
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, (Math.random() - 0.5) * 100],
            opacity: [1, 0],
            scale: [1, 0]
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </m.div>
  )
}