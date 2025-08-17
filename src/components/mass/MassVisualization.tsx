'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { MassState, OrbitalBody } from '@/types/mass'

interface MassVisualizationProps {
  massState: MassState
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  showOrbitals?: boolean
  onMassClick?: () => void
}

export default function MassVisualization({
  massState,
  size = 'md',
  interactive = false,
  showOrbitals = true,
  onMassClick
}: MassVisualizationProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [massState.mass])

  const sizeConfig = {
    sm: { container: 100, core: 20, orbital: 8 },
    md: { container: 150, core: 30, orbital: 12 },
    lg: { container: 200, core: 40, orbital: 16 },
    xl: { container: 300, core: 60, orbital: 24 }
  }

  const config = sizeConfig[size]
  const { evolutionStage } = massState

  // Calculate scaled mass for visualization (logarithmic scale)
  const visualMass = Math.min(config.core * 2, config.core * (1 + Math.log10(massState.mass / 10)))

  return (
    <div 
      className={`relative flex items-center justify-center`}
      style={{ 
        width: config.container, 
        height: config.container 
      }}
    >
      {/* Orbital Bodies */}
      {showOrbitals && (
        <AnimatePresence>
          {massState.orbitalBodies.map((orbital) => (
            <OrbitalVisualization
              key={orbital.id}
              orbital={orbital}
              centerSize={visualMass}
              containerSize={config.container}
              orbitalSize={config.orbital}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Main Mass Body */}
      <m.div
        className={`
          relative rounded-full cursor-pointer flex items-center justify-center
          ${interactive ? 'hover:scale-110 transition-transform duration-300' : ''}
        `}
        style={{
          width: visualMass,
          height: visualMass,
          background: `radial-gradient(circle, ${evolutionStage.visualEffects.glow}, transparent 70%)`,
          boxShadow: `
            0 0 ${visualMass * 0.3}px ${evolutionStage.visualEffects.glow},
            inset 0 0 ${visualMass * 0.2}px rgba(255, 255, 255, 0.1)
          `
        }}
        animate={{
          scale: animate ? [0.95, 1.05, 1] : 1,
          rotate: massState.velocity > 0 ? 360 : 0
        }}
        transition={{
          scale: { duration: 0.5, ease: "easeOut" },
          rotate: { 
            duration: Math.max(10, 100 / massState.velocity), 
            repeat: Infinity, 
            ease: "linear" 
          }
        }}
        onClick={onMassClick}
        whileHover={interactive ? { scale: 1.1 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
      >
        {/* Core Particle Effects */}
        <AnimatePresence>
          {evolutionStage.visualEffects.particles.map((particleType, index) => (
            <ParticleEffect
              key={`${particleType}-${index}`}
              type={particleType}
              size={visualMass}
              delay={index * 0.2}
            />
          ))}
        </AnimatePresence>

        {/* Mass Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-white font-bold cosmic-heading text-center leading-tight"
            style={{ fontSize: Math.max(8, visualMass * 0.2) }}
          >
            {massState.evolutionStage.current.split(' ').map((word, i) => (
              <div key={i} className="text-shadow-cosmic">
                {word}
              </div>
            ))}
          </span>
        </div>

        {/* Aura Effect */}
        <m.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, transparent 40%, ${evolutionStage.visualEffects.glow}40 60%, transparent 80%)`,
            width: visualMass * 1.5,
            height: visualMass * 1.5,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: 1.1
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </m.div>

      {/* Evolution Progress Ring */}
      {evolutionStage.next && (
        <m.div
          className="absolute inset-0 rounded-full border-2 border-white/20"
          style={{
            width: config.container * 0.9,
            height: config.container * 0.9
          }}
        >
          <m.div
            className="absolute inset-0 rounded-full border-2 border-cosmic-starlight"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${
                50 + 50 * Math.sin((evolutionStage.progressToNext / 100) * 2 * Math.PI)
              }% ${
                50 - 50 * Math.cos((evolutionStage.progressToNext / 100) * 2 * Math.PI)
              }%, 50% 50%)`
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </m.div>
      )}

      {/* Mass Stats Tooltip */}
      {interactive && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-2 text-xs text-white whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div>Mass: {Math.floor(massState.mass)}</div>
          <div>Stardust: {massState.stardust.toLocaleString()}</div>
          <div>Velocity: {Math.floor(massState.velocity)}</div>
          <div>Orbitals: {massState.orbitalBodies.length}</div>
        </div>
      )}
    </div>
  )
}

function OrbitalVisualization({
  orbital,
  centerSize,
  containerSize,
  orbitalSize
}: {
  orbital: OrbitalBody
  centerSize: number
  containerSize: number
  orbitalSize: number
}) {
  const orbitRadius = Math.min(
    (containerSize - centerSize) / 2 - orbitalSize,
    orbital.distance
  )

  const x = Math.cos((orbital.angle * Math.PI) / 180) * orbitRadius
  const y = Math.sin((orbital.angle * Math.PI) / 180) * orbitRadius

  return (
    <m.div
      className="absolute rounded-full border border-white/30 flex items-center justify-center"
      style={{
        width: orbitalSize,
        height: orbitalSize,
        backgroundColor: orbital.color,
        boxShadow: `0 0 ${orbitalSize * 0.5}px ${orbital.color}`,
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.5 }}
      title={orbital.name}
    >
      {/* Orbital trail */}
      <m.div
        className="absolute rounded-full border border-white/10"
        style={{
          width: orbitRadius * 2,
          height: orbitRadius * 2,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% - ${x}px), calc(-50% - ${y}px))`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.5 }}
      />

      {/* Orbital type indicator */}
      <div className="text-xs text-white font-bold">
        {orbital.type === 'concept' && '🧠'}
        {orbital.type === 'memory' && '💭'}
        {orbital.type === 'skill' && '⚡'}
        {orbital.type === 'wisp' && '👻'}
      </div>
    </m.div>
  )
}

function ParticleEffect({
  size,
  delay
}: {
  type: string
  size: number
  delay: number
}) {
  const particleCount = Math.min(6, Math.floor(size / 10))

  return (
    <m.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {Array.from({ length: particleCount }).map((_, i) => (
        <m.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`
          }}
          animate={{
            scale: 1,
            opacity: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * size],
            y: [0, (Math.random() - 0.5) * size]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        />
      ))}
    </m.div>
  )
}