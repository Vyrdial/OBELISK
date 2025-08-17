'use client'

import { m } from 'framer-motion'
import { Star, Sparkles, BarChart3, Moon } from 'lucide-react'
import { NPCType } from './NPCDialog'
import { useMemo } from 'react'

interface NPCAvatarProps {
  npc: NPCType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isActive?: boolean
  showGlow?: boolean
  customAnimation?: boolean
}

export default function NPCAvatar({ 
  npc, 
  size = 'md', 
  isActive = false, 
  showGlow = true,
  customAnimation = true 
}: NPCAvatarProps) {
  const sizeConfig = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6', particles: 3 },
    md: { container: 'w-16 h-16', icon: 'w-8 h-8', particles: 4 },
    lg: { container: 'w-24 h-24', icon: 'w-12 h-12', particles: 6 },
    xl: { container: 'w-32 h-32', icon: 'w-16 h-16', particles: 8 }
  }

  const config = sizeConfig[size]

  const npcData = {
    ERRATA: {
      name: 'Errata',
      color: 'npc-errata',
      icon: Star,
      gradient: 'from-red-500 to-pink-500',
      description: 'The Enlightened One',
      particles: () => (
        // Wisdom particles - gentle floating orbs
        <>
          {[...Array(config.particles)].map((_, i) => {
            const top = 20 + (i * 13) % 60
            const left = 20 + ((i + 3) * 17) % 60
            const duration = 3 + (i * 0.4)
            return (
              <m.div
                key={`wisdom-${i}`}
                className="absolute w-2 h-2 bg-npc-errata rounded-full opacity-60"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                }}
                animate={{
                  y: [-5, 5, -5],
                  x: [-3, 3, -3],
                  opacity: [0.3, 0.8, 0.3],
                  scale: 1.2,
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            )
          })}
        </>
      )
    },
    MNEMONIC: {
      name: 'Mnemonic',
      color: 'npc-mnemonic',
      icon: Sparkles,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'The Challenger',
      particles: () => (
        // Energy sparks - quick zipping particles
        <>
          {[...Array(config.particles)].map((_, i) => {
            const xOffset = ((i * 7) % 10 - 5) * 10
            const yOffset = ((i * 11) % 10 - 5) * 10
            return (
              <m.div
                key={`energy-${i}`}
                className="absolute w-1 h-1 bg-npc-mnemonic rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, xOffset],
                  y: [0, yOffset],
                  opacity: [1, 0],
                  scale: [0.5, 1.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
            )
          })}
        </>
      )
    },
    ECHELON: {
      name: 'Echelon',
      color: 'npc-echelon',
      icon: BarChart3,
      gradient: 'from-purple-500 to-indigo-500',
      description: 'The Archivist',
      particles: () => (
        // Data constellation - geometric patterns
        <>
          {[...Array(config.particles)].map((_, i) => (
            <m.div
              key={`data-${i}`}
              className="absolute border border-npc-echelon"
              style={{
                width: '3px',
                height: '3px',
                top: `${25 + (i * 15)}%`,
                right: `${20 + (i * 5) % 20}%`,
                transformOrigin: 'center',
              }}
              animate={{
                rotate: [0, 90, 180, 270, 360],
                opacity: [0.4, 1, 0.4],
                scale: 1,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear"
              }}
            />
          ))}
        </>
      )
    },
    LAGOM: {
      name: 'Lagom',
      color: 'npc-lagom',
      icon: Moon,
      gradient: 'from-yellow-500 to-orange-500',
      description: 'The Inner Orbit',
      particles: () => (
        // Serene mist - soft flowing particles
        <>
          {[...Array(config.particles)].map((_, i) => {
            const size = 4 + (i % 3) * 2
            const top = 30 + ((i * 13) % 40)
            const left = 30 + ((i * 17) % 40)
            const duration = 4 + (i * 0.5)
            return (
              <m.div
                key={`mist-${i}`}
                className="absolute bg-npc-lagom rounded-full opacity-40"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `${top}%`,
                  left: `${left}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  x: [-5, 5, -5],
                  opacity: [0.2, 0.6, 0.2],
                  scale: 1,
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut"
                }}
              />
            )
          })}
        </>
      )
    }
  }

  const character = npcData[npc]
  const IconComponent = character.icon

  return (
    <div className="relative">
      {/* Main Avatar Container */}
      <m.div
        key={`avatar-${npc}-${isActive}`}
        className={`${config.container} relative rounded-full border-2 bg-gradient-to-br ${character.gradient} bg-opacity-20 backdrop-blur-sm flex items-center justify-center overflow-hidden`}
        style={{
          borderColor: `var(--${character.color})30`
        }}
        animate={customAnimation ? {
          scale: isActive ? [1, 1.05, 1] : 1,
          boxShadow: isActive && showGlow
            ? [
                `0 0 15px var(--${character.color})`,
                `0 0 25px var(--${character.color})`,
                `0 0 15px var(--${character.color})`
              ]
            : showGlow
            ? `0 0 10px var(--${character.color})`
            : 'none'
        } : {}}
        transition={customAnimation ? {
          scale: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        } : {}}
      >
        {/* Background Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${character.gradient} opacity-20 rounded-full`} />
        
        {/* Main Icon */}
        <m.div
          animate={customAnimation ? 
            npc === 'MNEMONIC' 
              ? { rotate: [0, 10, -10, 0] }
              : npc === 'ECHELON'
              ? { y: [0, -2, 0] }
              : {}
            : {}
          }
          transition={customAnimation ? {
            duration: npc === 'MNEMONIC' ? 3 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        >
          <IconComponent 
            className={`${config.icon} relative z-10`} 
            style={{ color: `var(--${character.color})` }}
          />
        </m.div>

        {/* Character-specific particles */}
        {customAnimation && character.particles()}

        {/* Orbital Ring for Lagom */}
        {npc === 'LAGOM' && customAnimation && (
          <m.div
            className="absolute inset-2 border rounded-full"
            style={{ borderColor: 'var(--npc-lagom)40' }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-npc-lagom rounded-full" />
          </m.div>
        )}

        {/* Polyhedron effect for Mnemonic */}
        {npc === 'MNEMONIC' && customAnimation && (
          <>
            <m.div
              className="absolute inset-3 border"
              style={{ 
                borderColor: 'var(--npc-mnemonic)30',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' 
              }}
              animate={{ rotate: [0, 120, 240, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <m.div
              className="absolute inset-3 border"
              style={{ 
                borderColor: 'var(--npc-mnemonic)30',
                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' 
              }}
              animate={{ rotate: [0, -120, -240, -360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}
      </m.div>

      {/* Active indicator */}
      {isActive && (
        <m.div
          className="absolute -inset-1 rounded-full border-2 border-white/50"
          animate={{
            scale: 1.1,
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Floating name label */}
      {size === 'xl' && (
        <m.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="font-semibold text-sm" style={{ color: `var(--${character.color})` }}>
            {character.name}
          </div>
          <div className="text-white/60 text-xs">
            {character.description}
          </div>
        </m.div>
      )}
    </div>
  )
}