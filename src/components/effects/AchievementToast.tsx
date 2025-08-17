'use client'

import { m, AnimatePresence } from 'framer-motion'
import { Star, Award, Sparkles, Target, Zap, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface Achievement {
  id: string
  title: string
  description: string
  type: 'lesson_complete' | 'quiz_perfect' | 'streak' | 'constellation' | 'speed' | 'mastery'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  reward: {
    xp: number
    stardust: number
  }
  icon?: 'star' | 'award' | 'sparkles' | 'target' | 'zap' | 'crown'
}

interface AchievementToastProps {
  achievement: Achievement | null
  onComplete: () => void
  onClose?: () => void
  duration?: number
}

const achievementIcons = {
  star: Star,
  award: Award,
  sparkles: Sparkles,
  target: Target,
  zap: Zap,
  crown: Crown
}

const rarityConfig = {
  common: {
    gradient: 'from-gray-400 to-gray-600',
    glow: 'rgba(156, 163, 175, 0.5)',
    border: 'border-gray-400/50',
    particle: '#9CA3AF'
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'rgba(59, 130, 246, 0.5)',
    border: 'border-blue-400/50',
    particle: '#3B82F6'
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'rgba(147, 51, 234, 0.5)',
    border: 'border-purple-400/50',
    particle: '#9333EA'
  },
  legendary: {
    gradient: 'from-yellow-400 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.5)',
    border: 'border-yellow-400/50',
    particle: '#F59E0B'
  }
}

export default function AchievementToast({ 
  achievement, 
  onComplete, 
  duration = 5000 
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onComplete, 500) // Wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [achievement, duration, onComplete])

  if (!achievement) return null

  const IconComponent = achievementIcons[achievement.icon || 'star']
  const config = rarityConfig[achievement.rarity]

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        >
          {/* Achievement Toast */}
          <m.div
            className={`relative bg-cosmic-void/95 backdrop-blur-lg rounded-2xl border-2 ${config.border} p-6 max-w-md mx-auto shadow-2xl`}
            style={{
              boxShadow: `0 20px 40px ${config.glow}, 0 0 30px ${config.glow}`
            }}
            animate={{
              boxShadow: [
                `0 20px 40px ${config.glow}, 0 0 30px ${config.glow}`,
                `0 25px 50px ${config.glow}, 0 0 40px ${config.glow}`,
                `0 20px 40px ${config.glow}, 0 0 30px ${config.glow}`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Header */}
            <m.div
              className="text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <m.div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${config.gradient} mb-3`}
                animate={{
                  scale: 1.1,
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </m.div>
              
              <m.h3
                className="text-xl font-bold cosmic-text-gradient cosmic-heading"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(233, 69, 96, 0.5)',
                    '0 0 20px rgba(233, 69, 96, 0.8)',
                    '0 0 10px rgba(233, 69, 96, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Achievement Unlocked!
              </m.h3>
            </m.div>

            {/* Achievement Details */}
            <m.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-lg font-semibold text-white mb-2">
                {achievement.title}
              </h4>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                {achievement.description}
              </p>

              {/* Rarity Badge */}
              <m.div
                className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-white text-xs font-bold uppercase tracking-wider mb-4`}
                animate={{ scale: 1.05 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {achievement.rarity}
              </m.div>

              {/* Rewards */}
              <div className="flex justify-center gap-4">
                <m.div
                  className="flex items-center gap-1 px-3 py-1 glass-morphism rounded-full border border-cosmic-aurora/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <div className="w-3 h-3 bg-cosmic-aurora rounded-full" />
                  <span className="text-cosmic-aurora text-sm font-bold">
                    +{achievement.reward.xp} XP
                  </span>
                </m.div>

                <m.div
                  className="flex items-center gap-1 px-3 py-1 glass-morphism rounded-full border border-cosmic-stardust/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                >
                  <Sparkles className="w-3 h-3 text-cosmic-stardust" />
                  <span className="text-cosmic-stardust text-sm font-bold">
                    +{achievement.reward.stardust}
                  </span>
                </m.div>
              </div>
            </m.div>

            {/* Celebration Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <m.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: config.particle,
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 200],
                    y: [0, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    scale: 1,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            {/* Shooting Stars */}
            {achievement.rarity === 'legendary' && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <m.div
                    key={`star-${i}`}
                    className="absolute w-1 h-8 bg-gradient-to-b from-yellow-400 to-transparent rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, 200],
                      x: [0, 50],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 1 + i * 0.2,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}
          </m.div>

          {/* Close instruction */}
          <m.p
            className="text-white/60 text-xs text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            Auto-closes in {Math.ceil(duration / 1000)} seconds
          </m.p>
        </m.div>
      )}
    </AnimatePresence>
  )
}

// Predefined achievements for the OBELISK platform
export const achievements: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'Cosmic Initiation',
    description: 'Complete your first lesson in the cosmos of knowledge',
    type: 'lesson_complete',
    rarity: 'common',
    reward: { xp: 50, stardust: 25 },
    icon: 'star'
  },
  {
    id: 'perfect_quiz',
    title: 'Stellar Performance',
    description: 'Achieve a perfect score on any quiz',
    type: 'quiz_perfect',
    rarity: 'rare',
    reward: { xp: 100, stardust: 75 },
    icon: 'target'
  },
  {
    id: 'speed_learner',
    title: 'Lightspeed Scholar',
    description: 'Complete a lesson in under 5 minutes',
    type: 'speed',
    rarity: 'epic',
    reward: { xp: 150, stardust: 100 },
    icon: 'zap'
  },
  {
    id: 'constellation_master',
    title: 'Constellation Keeper',
    description: 'Master an entire constellation with 90%+ completion',
    type: 'constellation',
    rarity: 'legendary',
    reward: { xp: 500, stardust: 300 },
    icon: 'crown'
  },
  {
    id: 'centurion-dots',
    title: 'Null Core Centurion',
    description: 'Place all 100 markers in the interactive demo',
    type: 'mastery',
    rarity: 'epic',
    reward: { xp: 100, stardust: 25 },
    icon: 'sparkles'
  }
]