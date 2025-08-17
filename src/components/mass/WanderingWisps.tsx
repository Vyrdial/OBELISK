'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { WanderingWisp } from '@/types/mass'
import { WispSystem } from '@/utils/massSystem'

interface WanderingWispsProps {
  wisps: WanderingWisp[]
  onWispClick: (wisp: WanderingWisp) => void
  onWispUpdate: (wisps: WanderingWisp[]) => void
}

export default function WanderingWisps({
  wisps,
  onWispClick,
  onWispUpdate
}: WanderingWispsProps) {
  const [hoveredWisp, setHoveredWisp] = useState<string | null>(null)

  // Update wisps position and age
  useEffect(() => {
    const interval = setInterval(() => {
      const deltaTime = 16 // ~60fps
      const updatedWisps = wisps
        .map(wisp => WispSystem.updateWisp(wisp, deltaTime))
        .filter(Boolean) as WanderingWisp[]
      
      if (updatedWisps.length !== wisps.length) {
        onWispUpdate(updatedWisps)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [wisps, onWispUpdate])

  const handleWispHover = useCallback((wisp: WanderingWisp) => {
    setHoveredWisp(wisp.id)
    const updatedWisp = WispSystem.onWispHover(wisp)
    const updatedWisps = wisps.map(w => w.id === wisp.id ? updatedWisp : w)
    onWispUpdate(updatedWisps)
  }, [wisps, onWispUpdate])

  const handleWispLeave = useCallback(() => {
    setHoveredWisp(null)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {wisps.map((wisp) => (
          <WispVisualization
            key={wisp.id}
            wisp={wisp}
            isHovered={hoveredWisp === wisp.id}
            onHover={() => handleWispHover(wisp)}
            onLeave={handleWispLeave}
            onClick={() => onWispClick(wisp)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function WispVisualization({
  wisp,
  isHovered,
  onHover,
  onLeave,
  onClick
}: {
  wisp: WanderingWisp
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}) {
  const [showWhisper, setShowWhisper] = useState(false)
  const [currentWhisper, setCurrentWhisper] = useState('')

  useEffect(() => {
    if (isHovered) {
      setShowWhisper(true)
      setCurrentWhisper(WispSystem.getNextWhisper(wisp))
      
      const timer = setTimeout(() => {
        setShowWhisper(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isHovered, wisp])

  const wispSize = 20 + wisp.mass * 0.5
  const [pulseScale, setPulseScale] = useState(1)
  
  useEffect(() => {
    const updatePulse = () => {
      setPulseScale(1 + Math.sin(Date.now() * 0.001 * wisp.pulseIntensity) * 0.1)
    }
    const interval = setInterval(updatePulse, 50)
    return () => clearInterval(interval)
  }, [wisp.pulseIntensity])

  return (
    <m.div
      className="absolute pointer-events-auto cursor-pointer"
      style={{
        left: wisp.position.x - wispSize / 2,
        top: wisp.position.y - wispSize / 2,
        width: wispSize,
        height: wispSize
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: wisp.opacity,
        scale: pulseScale,
        rotate: wisp.age * 0.01 // Slow rotation based on age
      }}
      exit={{ 
        opacity: 0, 
        scale: 0,
        transition: { duration: 1 }
      }}
      whileHover={{ scale: pulseScale * 1.2 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={onClick}
    >
      {/* Wisp Core */}
      <m.div
        className="relative w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle, 
            rgba(138, 43, 226, ${wisp.opacity}) 0%, 
            rgba(75, 0, 130, ${wisp.opacity * 0.7}) 40%, 
            rgba(25, 25, 112, ${wisp.opacity * 0.3}) 70%, 
            transparent 100%
          )`,
          boxShadow: `
            0 0 ${wispSize * 0.5}px rgba(138, 43, 226, ${wisp.opacity}),
            inset 0 0 ${wispSize * 0.3}px rgba(255, 255, 255, 0.1)
          `
        }}
        animate={{
          boxShadow: [
            `0 0 ${wispSize * 0.5}px rgba(138, 43, 226, ${wisp.opacity})`,
            `0 0 ${wispSize * 0.8}px rgba(138, 43, 226, ${wisp.opacity * 1.2})`,
            `0 0 ${wispSize * 0.5}px rgba(138, 43, 226, ${wisp.opacity})`
          ]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Inner Glow */}
        <m.div
          className="absolute inset-1 rounded-full"
          style={{
            background: `radial-gradient(circle, 
              rgba(255, 255, 255, ${wisp.opacity * 0.3}) 0%, 
              transparent 60%
            )`
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Wisp Particles */}
        {useMemo(() => {
          const particles = []
          for (let i = 0; i < 3; i++) {
            const left = 30 + (i * 15) % 40
            const top = 30 + (i * 20) % 40
            const xOffset = ((i + 1) * 7 % 10 - 5) * wispSize * 0.4
            const yOffset = ((i + 2) * 11 % 10 - 5) * wispSize * 0.4
            const duration = 3 + (i * 0.7)
            
            particles.push(
              <m.div
                key={i}
                className="absolute w-1 h-1 bg-purple-300 rounded-full"
                style={{
                  left: `${left}%`,
                  top: `${top}%`
                }}
                animate={{
                  scale: 1,
                  opacity: [0, wisp.opacity, 0],
                  x: [0, xOffset],
                  y: [0, yOffset]
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut"
                }}
              />
            )
          }
          return particles
        }, [wisp.opacity, wispSize])}

        {/* Spectral Trails */}
        <m.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(
              ${wisp.age * 0.1}deg,
              transparent 0%, 
              rgba(138, 43, 226, ${wisp.opacity * 0.2}) 30%, 
              transparent 60%
            )`
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </m.div>

      {/* Whisper Bubble */}
      <AnimatePresence>
        {showWhisper && (
          <m.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative bg-black/90 rounded-lg px-3 py-2 border border-purple-500/50 shadow-lg max-w-xs">
              <p className="text-purple-200 text-sm font-medium italic text-center leading-tight">
                {currentWhisper}
              </p>
              
              {/* Speech Bubble Tail */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              
              {/* Mystical Glow */}
              <m.div
                className="absolute inset-0 rounded-lg border border-purple-400/30"
                animate={{
                  boxShadow: [
                    '0 0 5px rgba(138, 43, 226, 0.3)',
                    '0 0 15px rgba(138, 43, 226, 0.6)',
                    '0 0 5px rgba(138, 43, 226, 0.3)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Challenge Info Tooltip */}
      {isHovered && (
        <m.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-black/80 rounded-lg px-2 py-1 border border-white/20 text-xs text-white whitespace-nowrap">
            <div className="font-semibold text-purple-300">{wisp.challengeName}</div>
            <div className="text-white/60">Age: {Math.floor(wisp.age / 1000)}s</div>
            <div className="text-white/60">Mass: {Math.floor(wisp.mass)}</div>
            <div className="text-cosmic-stardust text-center mt-1">Click to reclaim!</div>
          </div>
        </m.div>
      )}

      {/* Age-based Visual Decay */}
      {wisp.age > wisp.maxAge * 0.8 && (
        <m.div
          className="absolute inset-0 rounded-full border-2 border-red-500/30"
          animate={{
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        />
      )}
    </m.div>
  )
}

// Hook for managing wisps in components
export function useWanderingWisps() {
  const [wisps, setWisps] = useState<WanderingWisp[]>([])

  const spawnWisp = useCallback((challengeId: string, challengeName: string, failureReason: string) => {
    const newWisp = WispSystem.createWisp(challengeId, challengeName, failureReason)
    setWisps(prev => [...prev, newWisp])
  }, [])

  const removeWisp = useCallback((wispId: string) => {
    setWisps(prev => prev.filter(w => w.id !== wispId))
  }, [])

  const handleWispClick = useCallback((wisp: WanderingWisp) => {
    const reward = WispSystem.onWispClick(wisp)
    removeWisp(wisp.id)
    return reward
  }, [removeWisp])

  return {
    wisps,
    setWisps,
    spawnWisp,
    removeWisp,
    handleWispClick
  }
}