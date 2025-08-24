'use client'

import { useState, useEffect } from 'react'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { Star } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'
import { singularityStyles } from './SingularityNode'
import CrownOverlay from './CrownOverlay'
import dynamic from 'next/dynamic'

interface EquippedAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'xxl' | 'xxxl'
  showPulse?: boolean
  showTrail?: boolean
  showAura?: boolean
  showEffects?: boolean
  className?: string
  onClick?: () => void
  clickable?: boolean
  crownScaleMultiplier?: number
}


// Visual effects (trails and other effects)
const visualEffects = {
  'stardust-trail': 'after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-yellow-400/20 after:to-transparent after:blur-sm',
  'quantum-ripples': 'before:absolute before:inset-0 before:rounded-full before:border-2 before:border-blue-400/30 before:animate-ping'
}

// Aura system with different colors and effects
const auraStyles = {
  'none': {
    name: 'No Aura',
    description: 'Clean and minimal appearance',
    rings: [],
    gradient: null,
    rarity: 'common'
  },
  'cosmic-aurora': {
    name: 'Cosmic Aurora',
    description: 'Aurora borealis cosmic dance',
    rings: [
      { color: 'green-400', opacity: 30, size: 16, duration: 3 },
      { color: 'blue-500', opacity: 25, size: 24, duration: 3.5, delay: 0.3 },
      { color: 'purple-600', opacity: 20, size: 32, duration: 4, delay: 0.6 }
    ],
    gradient: 'radial-gradient(circle, rgba(74,222,128,0.15) 0%, rgba(59,130,246,0.12) 30%, rgba(147,51,234,0.1) 60%, transparent 80%)',
    rarity: 'common'
  },
  'stellar-blue': {
    name: 'Stellar Blue',
    description: 'Deep blue stellar energy',
    rings: [
      { color: 'blue-400', opacity: 40, size: 16, duration: 2.5 },
      { color: 'cyan-300', opacity: 25, size: 32, duration: 3.5, delay: 0.3 }
    ],
    gradient: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, rgba(103,232,249,0.1) 40%, transparent 70%)',
    rarity: 'rare'
  },
  'mystic-purple': {
    name: 'Mystic Purple',
    description: 'Mysterious purple void energy',
    rings: [
      { color: 'purple-500', opacity: 35, size: 16, duration: 3.2 },
      { color: 'indigo-400', opacity: 22, size: 32, duration: 4.2, delay: 0.4 }
    ],
    gradient: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(129,140,248,0.1) 40%, transparent 70%)',
    rarity: 'epic'
  },
  'emerald-life': {
    name: 'Emerald Life',
    description: 'Vibrant green life force',
    rings: [
      { color: 'emerald-500', opacity: 38, size: 16, duration: 2.8 },
      { color: 'green-400', opacity: 24, size: 32, duration: 3.8, delay: 0.2 }
    ],
    gradient: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(74,222,128,0.1) 40%, transparent 70%)',
    rarity: 'rare'
  },
  'crimson-flame': {
    name: 'Crimson Flame',
    description: 'Fiery red burning energy',
    rings: [
      { color: 'red-500', opacity: 42, size: 16, duration: 2.2 },
      { color: 'orange-400', opacity: 28, size: 32, duration: 3.2, delay: 0.1 }
    ],
    gradient: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(251,146,60,0.1) 40%, transparent 70%)',
    rarity: 'epic'
  },
  'golden-majesty': {
    name: 'Golden Majesty',
    description: 'Royal golden radiance',
    rings: [
      { color: 'yellow-400', opacity: 45, size: 16, duration: 2.7 },
      { color: 'amber-300', opacity: 30, size: 32, duration: 3.7, delay: 0.3 }
    ],
    gradient: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, rgba(252,211,77,0.1) 40%, transparent 70%)',
    rarity: 'legendary'
  },
  'frost-crystal': {
    name: 'Frost Crystal',
    description: 'Icy crystalline aura',
    rings: [
      { color: 'cyan-400', opacity: 40, size: 16, duration: 3.5 },
      { color: 'blue-200', opacity: 25, size: 32, duration: 4.5, delay: 0.6 }
    ],
    gradient: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(191,219,254,0.1) 40%, transparent 70%)',
    rarity: 'rare'
  },
  'void-darkness': {
    name: 'Void Darkness',
    description: 'Dark matter distortion field',
    rings: [
      { color: 'gray-600', opacity: 50, size: 16, duration: 4 },
      { color: 'purple-900', opacity: 35, size: 32, duration: 5, delay: 0.8 }
    ],
    gradient: 'radial-gradient(circle, rgba(75,85,99,0.2) 0%, rgba(88,28,135,0.15) 40%, transparent 70%)',
    rarity: 'legendary'
  },
  'rainbow-prism': {
    name: 'Rainbow Prism',
    description: 'Prismatic light spectrum',
    rings: [
      { color: 'pink-400', opacity: 35, size: 16, duration: 2 },
      { color: 'purple-400', opacity: 30, size: 24, duration: 2.5, delay: 0.2 },
      { color: 'blue-400', opacity: 25, size: 32, duration: 3, delay: 0.4 }
    ],
    gradient: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, rgba(192,132,252,0.1) 30%, rgba(96,165,250,0.08) 50%, transparent 70%)',
    rarity: 'legendary'
  },
  'plasma-storm': {
    name: 'Plasma Storm',
    description: 'Chaotic electrical energy',
    rings: [
      { color: 'pink-500', opacity: 40, size: 16, duration: 1.8 },
      { color: 'purple-400', opacity: 30, size: 28, duration: 2.3, delay: 0.1 },
      { color: 'blue-300', opacity: 20, size: 40, duration: 2.8, delay: 0.3 }
    ],
    gradient: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(192,132,252,0.1) 30%, rgba(147,197,253,0.08) 50%, transparent 70%)',
    rarity: 'legendary'
  }
}

const sizeConfig = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24',
  xxl: 'w-20 h-20',
  xxxl: 'w-32 h-32'
}

function EquippedAvatarComponent({
  size = 'md',
  showPulse = false,
  showTrail = false,
  showAura = false,
  showEffects = false,
  className = '',
  onClick,
  clickable = false,
  crownScaleMultiplier = 1
}: EquippedAvatarProps) {
  const { profile } = useProfile()
  const { equippedSingularity, equippedEffects, equippedAura, equippedCrown, equippedFace, forceUpdate } = useCosmetics()
  
  // Use dedicated equipped aura
  const currentAura = equippedAura || (showAura ? 'cosmic-aurora' : 'none')
  const auraConfig = auraStyles[currentAura as keyof typeof auraStyles]
  const singularityStyle = singularityStyles[equippedSingularity as keyof typeof singularityStyles] || singularityStyles['classic-singularity']
  const sizeClass = sizeConfig[size]
  
  
  // Build effect classes
  let effectClasses = ''
  if (showEffects && equippedEffects.length > 0) {
    equippedEffects.forEach((effect: string) => {
      if (visualEffects[effect as keyof typeof visualEffects]) {
        effectClasses += ` ${visualEffects[effect as keyof typeof visualEffects]}`
      }
    })
  }
  
  // Get face SVG
  const getFaceSVG = (faceId: string, avatarSize: string) => {
    // Calculate SVG size based on avatar size
    const svgSizes: Record<string, number> = {
      xs: 16,
      sm: 24,
      md: 32,
      lg: 40,
      xl: 64,
      '2xl': 96,
      xxl: 80,
      xxxl: 128
    }
    const svgSize = svgSizes[avatarSize] || 24
    
    switch (faceId) {
      case 'happy-face':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 48 48" fill="none">
            <circle cx="16" cy="20" r="2" fill="currentColor" />
            <circle cx="32" cy="20" r="2" fill="currentColor" />
            <path d="M 12 28 Q 24 36 36 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'cool-face':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 48 48" fill="none">
            <rect x="8" y="18" width="12" height="8" rx="2" fill="currentColor" opacity="0.9" />
            <rect x="28" y="18" width="12" height="8" rx="2" fill="currentColor" opacity="0.9" />
            <rect x="20" y="20" width="8" height="2" fill="currentColor" opacity="0.9" />
            <path d="M 16 32 Q 28 34 32 30" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'starry-eyes':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 48 48" fill="none">
            <path d="M 16 16 L 17 20 L 20 18 L 17 22 L 16 26 L 15 22 L 12 18 L 15 20 Z" fill="currentColor" />
            <path d="M 32 16 L 33 20 L 36 18 L 33 22 L 32 26 L 31 22 L 28 18 L 31 20 Z" fill="currentColor" />
            <path d="M 12 28 Q 24 38 36 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'winking-face':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 48 48" fill="none">
            <circle cx="16" cy="20" r="2" fill="currentColor" />
            <path d="M 28 20 L 36 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M 14 28 Q 24 34 34 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'thinking-face':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 48 48" fill="none">
            <path d="M 10 16 Q 16 14 20 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="15" cy="22" r="2" fill="currentColor" />
            <circle cx="32" cy="20" r="2" fill="currentColor" />
            <path d="M 16 32 L 28 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="36" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )
      case 'cosmic-face':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 48 48" fill="none">
            <defs>
              <radialGradient id={`cosmicGradAvatar-${svgSize}`}>
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#a78bfa" />
              </radialGradient>
            </defs>
            <path d="M 16 16 L 18 22 L 24 20 L 18 24 L 16 30 L 14 24 L 8 20 L 14 22 Z" fill={`url(#cosmicGradAvatar-${svgSize})`} />
            <path d="M 32 16 L 34 22 L 40 20 L 34 24 L 32 30 L 30 24 L 24 20 L 30 22 Z" fill={`url(#cosmicGradAvatar-${svgSize})`} />
            <path d="M 12 30 Q 24 36 36 30" stroke={`url(#cosmicGradAvatar-${svgSize})`} strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="10" cy="12" r="1" fill="currentColor" opacity="0.8" />
            <circle cx="38" cy="10" r="1" fill="currentColor" opacity="0.8" />
            <circle cx="40" cy="36" r="1" fill="currentColor" opacity="0.8" />
            <circle cx="8" cy="38" r="1" fill="currentColor" opacity="0.8" />
          </svg>
        )
      default:
        return null
    }
  }
  
  // Special aura for larger sizes - removed as we now use gradient aura system

  // Use state to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Render static version during SSR
  if (!isMounted) {
    return (
      <div className={`relative ${className}`}>
        <div className={`${sizeClass} rounded-full shadow-2xl relative overflow-hidden`}>
          {equippedSingularity === 'classic-singularity' ? (
            <div className="absolute inset-0 bg-white rounded-full" />
          ) : (
            <div className={`absolute inset-0 rounded-full ${singularityStyle.base}`} />
          )}
          {equippedFace && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center text-black/80 z-10">
              {getFaceSVG(equippedFace, size)}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  const avatarElement = (
    <LazyMotion features={domAnimation}>
    <div className={`relative ${className}`}>
      {/* Crown - only render if scale > 0 */}
      {equippedCrown && crownScaleMultiplier > 0 && (
        <CrownOverlay style={equippedCrown as any} size={size} scaleMultiplier={crownScaleMultiplier} />
      )}
      {/* Stardust trail effect */}
      {showTrail && (
        <m.div
          className={`absolute ${sizeClass} rounded-full bg-yellow-400/20 blur-sm pointer-events-none`}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
      )}
      
      {/* Main avatar - matching shop preview style */}
      <m.div
        className={`
          ${sizeClass} 
          ${clickable || onClick ? 'cursor-pointer' : ''}
          rounded-full shadow-2xl relative ${equippedSingularity === 'stellar-core' ? 'overflow-visible' : 'overflow-hidden'}
        `}
        initial={{ scale: 1 }}
        animate={showPulse ? {
          scale: [1, 1.05, 1],
        } : { scale: 1 }}
        transition={showPulse ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse"
        } : {
          duration: 0.2,
          ease: "easeOut"
        }}
        whileHover={(clickable || onClick) ? { 
          scale: showPulse ? 1.1 : 1.15,
          transition: { duration: 0.2, ease: "easeOut" }
        } : {}}
        whileTap={(clickable || onClick) ? { scale: 0.95 } : {}}
        onClick={onClick}
      >
        {/* Render complex layered effects based on style - exactly matching shop previews */}
        {equippedSingularity === 'classic-singularity' && (
          <div className="absolute inset-0 bg-white rounded-full" />
        )}
        
        {equippedSingularity === 'cosmic-glow' && (
          <>
            <style jsx>{`
              @keyframes cosmic-breathe {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
              }
              @keyframes cosmic-swirl {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes cosmic-pulse {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.2); filter: brightness(1.3); }
              }
              @keyframes particle-orbit {
                0% { transform: rotate(0deg) translateX(12px) rotate(0deg); }
                100% { transform: rotate(360deg) translateX(12px) rotate(-360deg); }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Outer cosmic glow ring */}
              <div className="absolute w-full h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-400/60" style={{
                animation: 'cosmic-breathe 3s ease-in-out infinite'
              }} />
              {/* Swirling energy bands */}
              <div className="absolute w-full h-full rounded-full" style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(99,102,241,0.8), transparent, rgba(168,85,247,0.8), transparent, rgba(236,72,153,0.8), transparent)',
                animation: 'cosmic-swirl 4s linear infinite'
              }} />
              {/* Inner pulsing core */}
              <div className="absolute inset-[30%] bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 rounded-full" style={{
                animation: 'cosmic-pulse 2s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(168,85,247,0.6)'
              }} />
              {/* Energy particles orbiting */}
              <div className="absolute w-full h-full flex items-center justify-center">
                <div className="absolute w-[5%] h-[5%] bg-pink-300 rounded-full" style={{
                  animation: 'particle-orbit 3s linear infinite'
                }} />
                <div className="absolute w-[5%] h-[5%] bg-indigo-300 rounded-full" style={{
                  animation: 'particle-orbit 3s linear infinite reverse'
                }} />
              </div>
              {/* Central bright core */}
              <div className="absolute inset-[40%] bg-white rounded-full opacity-90" />
            </div>
          </>
        )}
        
        {equippedSingularity === 'stellar-core' && (
          <>
            <style jsx>{`
              @keyframes stellar-pulse {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.05); filter: brightness(1.2); }
              }
              @keyframes solar-flare {
                0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
                20% { transform: scale(1.2) rotate(10deg); opacity: 1; }
                80% { transform: scale(0.8) rotate(-5deg); opacity: 0.8; }
              }
              @keyframes corona-wave {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.3); opacity: 0.3; }
              }
              @keyframes star-orbit {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes star-wobble {
                0% { transform: translateY(0) scale(1); }
                25% { transform: translateY(-10%) scale(1.1); }
                50% { transform: translateY(0) scale(0.95); }
                75% { transform: translateY(10%) scale(1.05); }
                100% { transform: translateY(0) scale(1); }
              }
              @keyframes elliptical-orbit {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes golden-particle {
                0% { opacity: 0; transform: scale(0); }
                50% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0); }
              }
              @keyframes stellar-core-glow {
                0%, 100% { transform: scale(1); filter: brightness(1) blur(0px); }
                50% { transform: scale(1.1); filter: brightness(1.5) blur(2px); }
              }
              @keyframes stellar-brightness {
                0%, 100% { opacity: 0.9; }
                50% { opacity: 1; }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center overflow-visible">
              {/* Main stellar body */}
              <div className="absolute w-full h-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full shadow-lg shadow-yellow-400/80" style={{
                animation: 'stellar-pulse 2s ease-in-out infinite'
              }} />
              
              {/* Solar flares erupting */}
              <div className="absolute -top-[5%] left-[50%] w-[5%] h-[20%] bg-gradient-to-t from-orange-400 via-yellow-300 to-transparent" style={{
                animation: 'solar-flare 3s ease-out infinite',
                transformOrigin: 'bottom center'
              }} />
              <div className="absolute -right-[5%] top-[50%] w-[20%] h-[5%] bg-gradient-to-r from-orange-400 via-yellow-300 to-transparent" style={{
                animation: 'solar-flare 3s ease-out infinite 0.75s',
                transformOrigin: 'left center'
              }} />
              <div className="absolute -bottom-[5%] left-[50%] w-[5%] h-[20%] bg-gradient-to-b from-orange-400 via-yellow-300 to-transparent" style={{
                animation: 'solar-flare 3s ease-out infinite 1.5s',
                transformOrigin: 'top center'
              }} />
              <div className="absolute -left-[5%] top-[50%] w-[20%] h-[5%] bg-gradient-to-l from-orange-400 via-yellow-300 to-transparent" style={{
                animation: 'solar-flare 3s ease-out infinite 2.25s',
                transformOrigin: 'right center'
              }} />
              
              {/* Corona effect */}
              <div className="absolute w-full h-full rounded-full" style={{
                background: 'radial-gradient(circle at center, transparent 40%, rgba(255,215,0,0.3) 50%, transparent 70%)',
                animation: 'corona-wave 2.5s ease-in-out infinite'
              }} />
              
              {/* Orbiting stars with varied, less predictable trajectories */}
              <div className="absolute inset-[-50%] flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
                {/* First star - smooth orbit with wobble */}
                <div className="absolute w-full h-full" style={{
                  animation: 'elliptical-orbit 4.3s linear infinite',
                  transformOrigin: 'center'
                }}>
                  <Star className="absolute w-[8%] h-[8%] text-white fill-white drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]" 
                    style={{ 
                      top: '10%', 
                      left: '46%',
                      animation: 'star-wobble 1.7s ease-in-out infinite'
                    }} />
                </div>
                {/* Second star - reverse orbit with different speed */}
                <div className="absolute w-full h-full" style={{
                  animation: 'star-orbit 3.7s linear infinite reverse',
                  transformOrigin: 'center',
                  transform: 'rotate(45deg)'
                }}>
                  <Star className="absolute w-[7%] h-[7%] text-yellow-200 fill-yellow-200 drop-shadow-[0_0_3px_rgba(255,234,0,0.8)]" 
                    style={{ 
                      bottom: '12%', 
                      right: '46%',
                      animation: 'star-wobble 2.1s ease-in-out infinite reverse'
                    }} />
                </div>
                {/* Third star - tilted smooth orbit */}
                <div className="absolute w-full h-full" style={{
                  animation: 'elliptical-orbit 5.9s linear infinite',
                  animationDelay: '1s',
                  transformOrigin: 'center',
                  transform: 'rotate(-30deg)'
                }}>
                  <Star className="absolute w-[6%] h-[6%] text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" 
                    style={{ 
                      top: '45%', 
                      left: '8%',
                      animation: 'star-wobble 1.3s ease-in-out infinite'
                    }} />
                </div>
              </div>
              
              {/* Golden particles/flakes */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Larger golden particles extending to inner core */}
                <div className="absolute top-[20%] right-[20%] w-[3%] h-[3%] bg-yellow-200 rounded-full" style={{
                  animation: 'golden-particle 2s ease-in-out infinite'
                }} />
                <div className="absolute bottom-[20%] left-[20%] w-[2.5%] h-[2.5%] bg-yellow-100 rounded-full" style={{
                  animation: 'golden-particle 2s ease-in-out infinite 0.3s'
                }} />
                <div className="absolute top-[30%] left-[25%] w-[2%] h-[2%] bg-amber-200 rounded-full" style={{
                  animation: 'golden-particle 2s ease-in-out infinite 0.6s'
                }} />
                <div className="absolute bottom-[25%] right-[30%] w-[2.5%] h-[2.5%] bg-yellow-300 rounded-full" style={{
                  animation: 'golden-particle 2s ease-in-out infinite 0.9s'
                }} />
                <div className="absolute top-[40%] right-[35%] w-[1.5%] h-[1.5%] bg-amber-100 rounded-full" style={{
                  animation: 'golden-particle 2s ease-in-out infinite 1.2s'
                }} />
                <div className="absolute bottom-[35%] left-[40%] w-[2%] h-[2%] bg-yellow-200 rounded-full" style={{
                  animation: 'golden-particle 2s ease-in-out infinite 1.5s'
                }} />
                {/* Inner core particles */}
                <div className="absolute top-[45%] left-[48%] w-[1%] h-[1%] bg-yellow-100 rounded-full" style={{
                  animation: 'golden-particle 1.5s ease-in-out infinite 0.1s'
                }} />
                <div className="absolute bottom-[45%] right-[48%] w-[1%] h-[1%] bg-amber-100 rounded-full" style={{
                  animation: 'golden-particle 1.5s ease-in-out infinite 0.7s'
                }} />
              </div>
              
              {/* Bright stellar core */}
              <div className="absolute inset-[25%] bg-gradient-to-br from-white via-yellow-100 to-yellow-200 rounded-full" style={{
                animation: 'stellar-core-glow 1.5s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(255,255,255,0.8)'
              }} />
              
              {/* Inner bright spot */}
              <div className="absolute inset-[35%] bg-white rounded-full" style={{
                filter: 'blur(1px)',
                animation: 'stellar-brightness 2s ease-in-out infinite'
              }} />
            </div>
          </>
        )}
        
        {equippedSingularity === 'void-essence' && (
          <>
            <style jsx>{`
              @keyframes void-distort {
                0%, 100% { transform: rotate(0deg) scale(1); }
                33% { transform: rotate(120deg) scale(1.2); }
                66% { transform: rotate(240deg) scale(0.9); }
              }
              @keyframes void-absorb-top {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(40%) scale(0); opacity: 0; }
              }
              @keyframes void-absorb-bottom {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-40%) scale(0); opacity: 0; }
              }
              @keyframes void-absorb-left {
                0% { transform: translateX(0) scale(1); opacity: 1; }
                100% { transform: translateX(40%) scale(0); opacity: 0; }
              }
              @keyframes void-absorb-right {
                0% { transform: translateX(0) scale(1); opacity: 1; }
                100% { transform: translateX(-40%) scale(0); opacity: 0; }
              }
              @keyframes event-horizon {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Dark void base */}
              <div className="absolute w-full h-full bg-purple-900 rounded-full border-2 border-purple-400 shadow-lg shadow-purple-400/60" />
              {/* Void distortion effect */}
              <div className="absolute w-full h-full rounded-full overflow-hidden">
                <div className="absolute inset-[-50%] bg-gradient-to-br from-purple-900 via-black to-purple-700 rounded-full" style={{
                  animation: 'void-distort 4s ease-in-out infinite'
                }} />
              </div>
              {/* Void particles being pulled in */}
              <div className="absolute top-0 left-[50%] w-[2%] h-[2%] bg-purple-300" style={{
                animation: 'void-absorb-top 2s ease-in infinite'
              }} />
              <div className="absolute bottom-0 left-[50%] w-[2%] h-[2%] bg-purple-300" style={{
                animation: 'void-absorb-bottom 2s ease-in infinite 0.5s'
              }} />
              <div className="absolute left-0 top-[50%] w-[2%] h-[2%] bg-purple-300" style={{
                animation: 'void-absorb-left 2s ease-in infinite 1s'
              }} />
              <div className="absolute right-0 top-[50%] w-[2%] h-[2%] bg-purple-300" style={{
                animation: 'void-absorb-right 2s ease-in infinite 1.5s'
              }} />
              {/* Event horizon ring */}
              <div className="absolute inset-[15%] rounded-full border border-purple-500" style={{
                animation: 'event-horizon 3s linear infinite',
                boxShadow: 'inset 0 0 10px rgba(147,51,234,0.8)'
              }} />
              {/* Black hole center */}
              <div className="absolute inset-[30%] bg-black rounded-full" style={{
                boxShadow: '0 0 15px rgba(0,0,0,0.9) inset, 0 0 25px rgba(147,51,234,0.6)'
              }} />
            </div>
          </>
        )}
        
        {equippedSingularity === 'golden-majesty' && (
          <>
            <style jsx>{`
              @keyframes golden-shimmer {
                to { transform: translateX(200%); }
              }
              @keyframes royal-rays {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes sparkle-twinkle {
                0%, 100% { opacity: 0; transform: scale(0); }
                50% { opacity: 1; transform: scale(1); }
              }
              @keyframes golden-glow {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.1); filter: brightness(1.2); }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Golden base with gradient */}
              <div className="absolute w-full h-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-full border-2 border-yellow-300 shadow-lg shadow-yellow-500/60" />
              {/* Shimmering effect */}
              <div className="absolute w-full h-full rounded-full overflow-hidden">
                <div className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-yellow-200 to-transparent" style={{
                  animation: 'golden-shimmer 2s linear infinite',
                  transform: 'translateX(-100%)'
                }} />
              </div>
              {/* Royal rays emanating */}
              <div className="absolute w-full h-full rounded-full" style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(250,204,21,0.4) 15deg, transparent 30deg, transparent, rgba(250,204,21,0.4) 105deg, transparent 120deg, transparent, rgba(250,204,21,0.4) 195deg, transparent 210deg, transparent, rgba(250,204,21,0.4) 285deg, transparent 300deg)',
                animation: 'royal-rays 6s linear infinite'
              }} />
              {/* Golden sparkles */}
              <div className="absolute top-[15%] right-[15%] w-[5%] h-[5%] bg-yellow-200 rounded-full" style={{
                animation: 'sparkle-twinkle 1.5s ease-in-out infinite'
              }} />
              <div className="absolute bottom-[15%] left-[15%] w-[3%] h-[3%] bg-yellow-100 rounded-full" style={{
                animation: 'sparkle-twinkle 1.5s ease-in-out infinite 0.3s'
              }} />
              <div className="absolute top-[30%] left-[20%] w-[3%] h-[3%] bg-amber-200 rounded-full" style={{
                animation: 'sparkle-twinkle 1.5s ease-in-out infinite 0.6s'
              }} />
              {/* Inner golden glow */}
              <div className="absolute inset-[25%] bg-gradient-to-br from-yellow-200 to-amber-300 rounded-full" style={{
                animation: 'golden-glow 2s ease-in-out infinite',
                boxShadow: '0 0 10px rgba(250,204,21,0.8)'
              }} />
              {/* Bright center */}
              <div className="absolute inset-[40%] bg-yellow-100 rounded-full" />
            </div>
          </>
        )}
        
        {equippedSingularity === 'crystal-essence' && (
          <>
            <style jsx>{`
              @keyframes crystal-refract {
                from { transform: translateX(-100%) translateY(-100%); }
                to { transform: translateX(100%) translateY(100%); }
              }
              @keyframes shard-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-10%) rotate(5deg); }
              }
              @keyframes crystal-pulse {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.15); filter: brightness(1.3); }
              }
              @keyframes light-sparkle {
                0%, 100% { opacity: 0.4; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Crystal base */}
              <div className="absolute w-full h-full bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-400 rounded-full border-2 border-cyan-200 shadow-lg shadow-cyan-400/60" />
              {/* Crystalline facets */}
              <div className="absolute w-full h-full rounded-full overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.6) 35%, transparent 40%)',
                  animation: 'crystal-refract 3s linear infinite'
                }} />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.4) 42%, transparent 44%)',
                  animation: 'crystal-refract 2.5s linear infinite reverse'
                }} />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, transparent 35%, rgba(34,211,238,0.5) 38%, transparent 41%)',
                  animation: 'crystal-refract 2s linear infinite'
                }} />
              </div>
              {/* Crystal shards floating */}
              <div className="absolute -top-[5%] left-[50%] w-[5%] h-[10%] bg-gradient-to-t from-cyan-400 to-cyan-200" style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animation: 'shard-float 3s ease-in-out infinite'
              }} />
              <div className="absolute -bottom-[5%] right-[33%] w-[5%] h-[8%] bg-gradient-to-b from-blue-300 to-cyan-400" style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animation: 'shard-float 3s ease-in-out infinite 1s',
                transform: 'rotate(180deg)'
              }} />
              {/* Inner crystal core with prismatic effect */}
              <div className="absolute inset-[25%] rounded-full" style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(34,211,238,0.6) 50%, rgba(59,130,246,0.4) 100%)',
                animation: 'crystal-pulse 2s ease-in-out infinite',
                boxShadow: '0 0 15px rgba(34,211,238,0.8)'
              }} />
              {/* Light refraction spots */}
              <div className="absolute top-[20%] right-[20%] w-[5%] h-[5%] bg-white rounded-full opacity-80" style={{
                animation: 'light-sparkle 1.5s ease-in-out infinite'
              }} />
              <div className="absolute bottom-[25%] left-[20%] w-[3%] h-[3%] bg-cyan-100 rounded-full" style={{
                animation: 'light-sparkle 1.5s ease-in-out infinite 0.5s'
              }} />
            </div>
          </>
        )}
        
        {equippedSingularity === 'plasma-core' && (
          <>
            <style jsx>{`
              @keyframes plasma-vibrate {
                0% { transform: translate(0, 0) scale(1); }
                25% { transform: translate(0.5px, -0.5px) scale(1.01); }
                50% { transform: translate(-0.5px, 0.5px) scale(0.99); }
                75% { transform: translate(0.5px, 0.5px) scale(1.01); }
                100% { transform: translate(0, 0) scale(1); }
              }
              @keyframes plasma-flow {
                from { transform: rotate(var(--rotation, 0deg)) translateX(0); }
                to { transform: rotate(calc(var(--rotation, 0deg) + 360deg)) translateX(0); }
              }
              @keyframes plasma-arc {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes plasma-burst {
                0% { transform: scale(0) translate(0, 0); opacity: 1; }
                50% { transform: scale(1.5) translate(var(--tx, 20%), var(--ty, -20%)); opacity: 0.5; }
                100% { transform: scale(0) translate(var(--tx, 40%), var(--ty, -40%)); opacity: 0; }
              }
              @keyframes plasma-core-chaos {
                0%, 100% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg) blur(0.5px); }
                33% { transform: scale(1.1) rotate(120deg); filter: hue-rotate(60deg) blur(1px); }
                66% { transform: scale(0.95) rotate(240deg); filter: hue-rotate(-60deg) blur(0.5px); }
              }
              @keyframes plasma-flicker {
                0%, 100% { opacity: 0.9; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Unstable plasma base */}
              <div className="absolute w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full border-2 border-pink-300 shadow-lg shadow-pink-500/60" style={{
                animation: 'plasma-vibrate 0.2s linear infinite'
              }} />
              
              {/* Plasma tendrils */}
              <div className="absolute w-full h-full rounded-full overflow-hidden">
                <div className="absolute inset-[-20%] bg-gradient-to-r from-transparent via-pink-400 to-transparent" style={{
                  animation: 'plasma-flow 1s linear infinite',
                  '--rotation': '0deg'
                }} />
                <div className="absolute inset-[-20%] bg-gradient-to-r from-transparent via-purple-400 to-transparent" style={{
                  animation: 'plasma-flow 0.8s linear infinite reverse',
                  '--rotation': '45deg'
                }} />
                <div className="absolute inset-[-20%] bg-gradient-to-r from-transparent via-blue-400 to-transparent" style={{
                  animation: 'plasma-flow 1.2s linear infinite',
                  '--rotation': '90deg'
                }} />
              </div>
              
              {/* Electric arcs */}
              <div className="absolute w-full h-full rounded-full" style={{
                background: 'conic-gradient(from 0deg, transparent 85%, rgba(236,72,153,0.8) 87%, transparent 89%, transparent 175%, rgba(147,51,234,0.8) 177%, transparent 179%, transparent 265%, rgba(59,130,246,0.8) 267%, transparent 269%, transparent 355%, rgba(236,72,153,0.8) 357%, transparent 359%)',
                animation: 'plasma-arc 0.5s linear infinite'
              }} />
              
              {/* Unstable energy bursts */}
              <div className="absolute top-0 left-[50%] w-[10%] h-[10%] bg-pink-300 rounded-full" style={{
                animation: 'plasma-burst 1.5s ease-out infinite',
                filter: 'blur(1px)',
                '--tx': '20%',
                '--ty': '-20%'
              }} />
              <div className="absolute bottom-0 right-[33%] w-[8%] h-[8%] bg-purple-300 rounded-full" style={{
                animation: 'plasma-burst 1.5s ease-out infinite 0.5s',
                filter: 'blur(1px)',
                '--tx': '-15%',
                '--ty': '15%'
              }} />
              <div className="absolute left-0 top-[33%] w-[6%] h-[6%] bg-blue-300 rounded-full" style={{
                animation: 'plasma-burst 1.5s ease-out infinite 1s',
                filter: 'blur(1px)',
                '--tx': '25%',
                '--ty': '10%'
              }} />
              
              {/* Chaotic core */}
              <div className="absolute inset-[25%] rounded-full" style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(236,72,153,0.6) 33%, rgba(147,51,234,0.6) 66%, rgba(59,130,246,0.6) 100%)',
                animation: 'plasma-core-chaos 0.3s ease-in-out infinite',
                filter: 'blur(0.5px)'
              }} />
              
              {/* Bright unstable center */}
              <div className="absolute inset-[35%] bg-white rounded-full" style={{
                animation: 'plasma-flicker 0.1s linear infinite',
                opacity: 0.9
              }} />
            </div>
          </>
        )}
        
        {equippedSingularity === 'aurora' && (
          <>
            <style jsx>{`
              @keyframes aurora-shift {
                0%, 100% { filter: hue-rotate(0deg) brightness(1); }
                33% { filter: hue-rotate(30deg) brightness(1.1); }
                66% { filter: hue-rotate(-30deg) brightness(0.9); }
              }
              @keyframes aurora-dance {
                0%, 100% { transform: translateY(50%) scaleY(0.5); opacity: 0; }
                50% { transform: translateY(-50%) scaleY(1.5); opacity: 0.6; }
              }
              @keyframes aurora-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes aurora-particle {
                0%, 100% { transform: translateY(0) scaleY(1); opacity: 0; }
                50% { transform: translateY(-20%) scaleY(1.5); opacity: 0.8; }
              }
              @keyframes aurora-glow {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.2); opacity: 0.8; }
              }
              @keyframes aurora-center {
                0%, 100% { opacity: 0.7; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(1.1); }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Base aurora gradient */}
              <div className="absolute w-full h-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-full shadow-lg shadow-green-400/50" style={{
                animation: 'aurora-shift 4s ease-in-out infinite'
              }} />
              
              {/* Dancing aurora curtains */}
              <div className="absolute w-full h-full rounded-full overflow-hidden">
                <div className="absolute w-full h-full bg-gradient-to-t from-transparent via-green-300 to-transparent" style={{
                  animation: 'aurora-dance 3s ease-in-out infinite',
                  transform: 'translateY(50%)'
                }} />
                <div className="absolute w-full h-full bg-gradient-to-t from-transparent via-blue-300 to-transparent" style={{
                  animation: 'aurora-dance 3.5s ease-in-out infinite 0.5s',
                  transform: 'translateY(50%)'
                }} />
                <div className="absolute w-full h-full bg-gradient-to-t from-transparent via-purple-300 to-transparent" style={{
                  animation: 'aurora-dance 4s ease-in-out infinite 1s',
                  transform: 'translateY(50%)'
                }} />
              </div>
              
              {/* Shimmering waves */}
              <div className="absolute w-full h-full rounded-full" style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(74,222,128,0.4), rgba(59,130,246,0.4), rgba(147,51,234,0.4), transparent, rgba(74,222,128,0.4), rgba(59,130,246,0.4), rgba(147,51,234,0.4), transparent)',
                animation: 'aurora-rotate 8s linear infinite'
              }} />
              
              {/* Aurora particles */}
              <div className="absolute top-[10%] left-[25%] w-[2%] h-[20%] bg-gradient-to-t from-green-400 to-transparent" style={{
                animation: 'aurora-particle 2s ease-in-out infinite',
                filter: 'blur(0.5px)'
              }} />
              <div className="absolute top-[15%] right-[25%] w-[2%] h-[18%] bg-gradient-to-t from-blue-400 to-transparent" style={{
                animation: 'aurora-particle 2.5s ease-in-out infinite 0.5s',
                filter: 'blur(0.5px)'
              }} />
              <div className="absolute top-[20%] left-[50%] w-[2%] h-[15%] bg-gradient-to-t from-purple-400 to-transparent" style={{
                animation: 'aurora-particle 3s ease-in-out infinite 1s',
                filter: 'blur(0.5px)'
              }} />
              
              {/* Inner glow */}
              <div className="absolute inset-[25%] rounded-full" style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(74,222,128,0.3) 33%, rgba(59,130,246,0.3) 66%, rgba(147,51,234,0.3) 100%)',
                animation: 'aurora-glow 3s ease-in-out infinite',
                filter: 'blur(2px)'
              }} />
              
              {/* Bright center */}
              <div className="absolute inset-[35%] bg-white rounded-full opacity-70" style={{
                animation: 'aurora-center 2s ease-in-out infinite'
              }} />
            </div>
          </>
        )}
        
        {equippedSingularity === 'lightning' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer electric field */}
            <div className="absolute w-full h-full bg-gradient-to-r from-blue-300 to-white rounded-full border-2 border-blue-200 shadow-lg shadow-blue-300/80" />
            {/* Multiple lightning bolts */}
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'linear-gradient(45deg, transparent 30%, #60a5fa 35%, transparent 40%, transparent 60%, #60a5fa 65%, transparent 70%)',
              animation: 'lightning-arc 0.8s ease-in-out infinite',
              filter: 'drop-shadow(0 0 3px #60a5fa)'
            }} />
            <div className="absolute w-[95%] h-[95%] rounded-full" style={{
              background: 'linear-gradient(-45deg, transparent 20%, #93c5fd 25%, transparent 30%, transparent 70%, #93c5fd 75%, transparent 80%)',
              animation: 'lightning-arc 0.6s ease-in-out infinite reverse',
              filter: 'drop-shadow(0 0 2px #93c5fd)'
            }} />
            <div className="absolute w-[80%] h-[80%] rounded-full" style={{
              background: 'linear-gradient(135deg, transparent 40%, #60a5fa 45%, transparent 50%)',
              animation: 'lightning-arc 0.7s ease-in-out infinite',
              filter: 'drop-shadow(0 0 2px #60a5fa)'
            }} />
            <div className="absolute w-[60%] h-[60%] rounded-full" style={{
              background: 'linear-gradient(225deg, transparent 30%, #dbeafe 35%, transparent 40%)',
              animation: 'lightning-arc 0.5s ease-in-out infinite'
            }} />
            {/* Electric core */}
            <div className="absolute w-[40%] h-[40%] bg-white rounded-full animate-pulse" style={{
              boxShadow: '0 0 20px rgba(96,165,250,0.8), 0 0 40px rgba(96,165,250,0.4)'
            }} />
          </div>
        )}
        
        {equippedSingularity === 'flame' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer flame - full size */}
            <div className="absolute w-full h-full bg-red-600 rounded-full" />
            {/* Orange flame - 90% */}
            <div className="absolute w-[90%] h-[90%] bg-orange-500 rounded-full" style={{animation: 'flame-flicker 1.2s ease-in-out infinite'}} />
            {/* Yellow flame - 75% */}
            <div className="absolute w-[75%] h-[75%] bg-yellow-400 rounded-full" style={{animation: 'flame-flicker 0.8s ease-in-out infinite reverse'}} />
            {/* Light yellow - 60% */}
            <div className="absolute w-[60%] h-[60%] bg-yellow-200 rounded-full opacity-80" style={{animation: 'flame-flicker 0.6s ease-in-out infinite'}} />
            {/* White core - 40% */}
            <div className="absolute w-[40%] h-[40%] bg-white rounded-full opacity-60" style={{animation: 'flame-flicker 0.4s ease-in-out infinite'}} />
          </div>
        )}
        
        {equippedSingularity === 'frost' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer frost layer */}
            <div className="absolute w-full h-full bg-gradient-to-br from-blue-200 via-cyan-300 to-white rounded-full shadow-lg shadow-cyan-300/60" />
            {/* Crystalline layers */}
            <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-cyan-100 to-white rounded-full opacity-80" style={{
              animation: 'frost-crystallize 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.6))'
            }} />
            <div className="absolute w-full h-full rounded-full border-2 border-cyan-200" style={{
              animation: 'frost-crystallize 1.5s ease-in-out infinite reverse',
              boxShadow: 'inset 0 0 10px rgba(34,211,238,0.3)'
            }} />
            {/* Ice crystals */}
            <div className="absolute w-[70%] h-[70%] rounded-full" style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, transparent 30%), radial-gradient(circle at 70% 70%, rgba(34,211,238,0.4) 0%, transparent 40%)',
              animation: 'frost-crystallize 1.8s ease-in-out infinite'
            }} />
            {/* Frozen core */}
            <div className="absolute w-[50%] h-[50%] bg-white rounded-full opacity-90" style={{
              animation: 'frost-crystallize 1.3s ease-in-out infinite',
              boxShadow: '0 0 15px rgba(191,219,254,0.8), inset 0 0 10px rgba(34,211,238,0.2)'
            }} />
          </div>
        )}
        
        {equippedSingularity === 'prism-matrix' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Main iridescent gradient base */}
            <div className="absolute w-full h-full rounded-full overflow-hidden" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
              backgroundSize: '200% 200%',
              animation: 'iridescent-wave 4s ease infinite'
            }} />
            
            {/* Rainbow shimmer overlay */}
            <div className="absolute w-[95%] h-[95%] rounded-full" style={{
              background: 'conic-gradient(from 0deg, rgba(255,0,255,0.4), rgba(0,255,255,0.4), rgba(255,255,0,0.4), rgba(255,0,255,0.4))',
              animation: 'prism-rotate 8s linear infinite',
              opacity: 0.6
            }} />
            
            {/* Light refraction bands */}
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 35%, transparent 40%, transparent 60%, rgba(255,255,255,0.3) 65%, transparent 70%)',
              animation: 'prism-refract 2s ease-in-out infinite'
            }} />
            
            {/* Center crystal core */}
            <div className="absolute w-[60%] h-[60%] rounded-full" style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(173,216,230,0.5) 40%, rgba(255,192,203,0.3) 70%, transparent 100%)',
              boxShadow: '0 0 20px rgba(255,255,255,0.5)',
              animation: 'ethereal-float 3s ease-in-out infinite'
            }} />
            
            {/* Inner white core with iridescent edges */}
            <div className="absolute w-[40%] h-[40%] rounded-full" style={{
              background: 'radial-gradient(circle, white 0%, rgba(255,255,255,0.8) 60%, transparent 100%)',
              boxShadow: '0 0 15px rgba(147,197,253,0.8), 0 0 30px rgba(255,192,203,0.4)'
            }} />
          </div>
        )}
        
        {equippedSingularity === 'quantum-nexus' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer quantum ring */}
            <div className="absolute w-full h-full bg-gradient-to-br from-cyan-200 via-blue-400 to-purple-600 rounded-full border-2 border-cyan-300 shadow-2xl shadow-cyan-400/80" />
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(59,130,246,0.8), transparent, rgba(147,51,234,0.8), transparent)',
              animation: 'quantum-spin 3s linear infinite'
            }} />
            {/* Middle ring - 75% */}
            <div className="absolute w-[75%] h-[75%] bg-gradient-to-br from-white via-cyan-100 to-blue-200 rounded-full opacity-60" style={{animation: 'quantum-pulse 2s ease-in-out infinite'}} />
            {/* Inner core - 50% */}
            <div className="absolute w-[50%] h-[50%] bg-white rounded-full opacity-80" />
            {/* Quantum spikes - rendered on top */}
            <div className="absolute top-0 left-1/2 w-0.5 h-[40%] bg-cyan-300 transform -translate-x-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite'}} />
            <div className="absolute bottom-0 left-1/2 w-0.5 h-[40%] bg-purple-300 transform -translate-x-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite 0.5s'}} />
            <div className="absolute left-0 top-1/2 w-[40%] h-0.5 bg-blue-300 transform -translate-y-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite 1s'}} />
            <div className="absolute right-0 top-1/2 w-[40%] h-0.5 bg-cyan-300 transform -translate-y-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite 1.5s'}} />
          </div>
        )}
        
        {equippedSingularity === 'nebula-heart' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer glow layer */}
            <div className="absolute w-full h-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 rounded-full shadow-lg shadow-purple-400/60" />
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'radial-gradient(ellipse at 30% 30%, rgba(147,51,234,0.7) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(236,72,153,0.7) 0%, transparent 50%)',
              animation: 'nebula-drift 6s ease-in-out infinite'
            }} />
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'radial-gradient(circle at 50% 20%, rgba(59,130,246,0.5) 0%, transparent 40%)',
              animation: 'nebula-drift 5s ease-in-out infinite reverse'
            }} />
            {/* Middle nebula ring - 75% */}
            <div className="absolute w-[75%] h-[75%] bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-full opacity-70" style={{animation: 'nebula-pulse 3s ease-in-out infinite'}} />
            {/* Inner core - 50% */}
            <div className="absolute w-[50%] h-[50%] bg-white rounded-full opacity-60" />
            {/* Sparkle ring overlay */}
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'radial-gradient(circle at center, transparent 60%, rgba(255,255,255,0.8) 65%, transparent 70%)',
              animation: 'nebula-sparkle 4s ease-in-out infinite'
            }} />
          </div>
        )}
        
        {equippedSingularity === 'cosmic-forge' && (
          <>
            <style jsx>{`
              @keyframes forge-pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.85; transform: scale(0.98); }
              }
              
              @keyframes forge-core {
                0%, 100% { opacity: 0.9; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
              }
              
              @keyframes lava-bubble {
                0%, 100% { 
                  transform: translateY(0) scale(1); 
                  opacity: 0.8;
                }
                50% { 
                  transform: translateY(-3px) scale(1.2); 
                  opacity: 1;
                }
              }
              
              @keyframes flame-spark {
                0% {
                  opacity: 0;
                  transform: translateY(0) scale(1);
                }
                20% {
                  opacity: 1;
                  transform: translateY(-2px) scale(1.1);
                }
                100% {
                  opacity: 0;
                  transform: translateY(-8px) scale(0.3);
                }
              }
              
              @keyframes side-flame {
                0%, 100% { 
                  opacity: 0.6;
                  transform: scale(1) rotate(var(--rotation, 0deg));
                }
                50% { 
                  opacity: 0.9;
                  transform: scale(1.2) rotate(var(--rotation, 0deg));
                }
              }
              
              @keyframes forge-ring {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              
              @keyframes spark-fly {
                0% {
                  opacity: 1;
                  transform: translate(0, 0) scale(1);
                }
                100% {
                  opacity: 0;
                  transform: translate(var(--spark-x, 4px), var(--spark-y, -6px)) scale(0.2);
                }
              }
              
              @keyframes heat-wave {
                0%, 100% { 
                  opacity: 0.3;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.5;
                  transform: scale(1.1);
                }
              }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Main forge core - molten metal/lava base */}
              <div className="absolute w-full h-full bg-gradient-to-br from-orange-600 via-red-700 to-yellow-600 rounded-full shadow-2xl shadow-orange-500/80">
                {/* Inner molten core with animated glow */}
                <div className="absolute inset-[5%] bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full" style={{
                  animation: 'forge-pulse 1.2s ease-in-out infinite'
                }} />
                
                {/* Bubbling lava effect - scaled for avatar size */}
                <div className="absolute bottom-[15%] left-[20%] w-[8%] h-[8%] bg-yellow-300 rounded-full" style={{
                  animation: 'lava-bubble 2s ease-in-out infinite'
                }} />
                <div className="absolute bottom-[10%] right-[25%] w-[6%] h-[6%] bg-orange-300 rounded-full" style={{
                  animation: 'lava-bubble 2.5s ease-in-out infinite 0.5s'
                }} />
                <div className="absolute bottom-[20%] left-[35%] w-[4%] h-[4%] bg-yellow-200 rounded-full" style={{
                  animation: 'lava-bubble 1.8s ease-in-out infinite 1s'
                }} />
                
                {/* Central white-hot core */}
                <div className="absolute inset-[25%] bg-gradient-to-br from-yellow-100 via-white to-orange-200 rounded-full opacity-90" style={{
                  animation: 'forge-core 0.8s ease-in-out infinite'
                }} />
                
                {/* Flame sparks jumping out - scaled positions */}
                <div className="absolute -top-[5%] left-[40%] w-[2%] h-[15%] bg-gradient-to-t from-orange-400 to-transparent" style={{
                  animation: 'flame-spark 1.5s ease-out infinite'
                }} />
                <div className="absolute -top-[5%] right-[30%] w-[2%] h-[12%] bg-gradient-to-t from-yellow-400 to-transparent" style={{
                  animation: 'flame-spark 1.8s ease-out infinite 0.3s'
                }} />
                <div className="absolute -top-[3%] left-[60%] w-[2%] h-[10%] bg-gradient-to-t from-red-400 to-transparent" style={{
                  animation: 'flame-spark 2s ease-out infinite 0.6s'
                }} />
                
                {/* Side flames - adjusted for avatar */}
                <div className="absolute -left-[8%] top-[30%] w-[15%] h-[20%] bg-gradient-to-l from-orange-500 to-transparent rounded-full" style={{
                  animation: 'side-flame 1.3s ease-in-out infinite',
                  transform: 'rotate(-30deg)'
                }} />
                <div className="absolute -right-[8%] top-[25%] w-[15%] h-[20%] bg-gradient-to-r from-yellow-500 to-transparent rounded-full" style={{
                  animation: 'side-flame 1.5s ease-in-out infinite 0.4s',
                  transform: 'rotate(30deg)'
                }} />
                
                {/* Forge ring - hammered metal edge */}
                <div className="absolute inset-0 rounded-full border-2 border-orange-800/60" style={{
                  animation: 'forge-ring 3s linear infinite',
                  boxShadow: 'inset 0 0 4px rgba(255,140,0,0.6)'
                }} />
                
                {/* Spark particles - percentage based */}
                <div className="absolute top-0 left-[50%] w-[1%] h-[1%] bg-yellow-200 rounded-full" style={{
                  animation: 'spark-fly 1.2s ease-out infinite'
                }} />
                <div className="absolute top-[10%] right-[20%] w-[1%] h-[1%] bg-orange-200 rounded-full" style={{
                  animation: 'spark-fly 1.5s ease-out infinite 0.2s'
                }} />
                <div className="absolute top-[5%] left-[20%] w-[1%] h-[1%] bg-yellow-300 rounded-full" style={{
                  animation: 'spark-fly 1.8s ease-out infinite 0.4s'
                }} />
              </div>
              
              {/* Heat distortion effect overlay */}
              <div className="absolute inset-0 rounded-full" style={{
                background: 'radial-gradient(circle at center, transparent 30%, rgba(255,69,0,0.2) 60%, transparent 100%)',
                animation: 'heat-wave 2s ease-in-out infinite'
              }} />
            </div>
          </>
        )}
        
        {equippedSingularity === 'temporal-vortex' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer ring - full size */}
            <div className="absolute w-full h-full bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 rounded-full shadow-2xl shadow-purple-500/70" />
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(139,69,19,0.8) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(75,0,130,0.8) 0%, transparent 40%)',
              animation: 'temporal-swirl 4s ease-in-out infinite'
            }} />
            <div className="absolute w-[95%] h-[95%] rounded-full" style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(219,39,119,0.6), transparent, rgba(147,51,234,0.6), transparent, rgba(59,130,246,0.6), transparent)',
              animation: 'temporal-swirl 3s linear infinite reverse'
            }} />
            {/* Middle ring - 70% size */}
            <div className="absolute w-[70%] h-[70%] bg-gradient-to-br from-purple-200 via-pink-300 to-indigo-200 rounded-full opacity-70" style={{animation: 'temporal-pulse 2.5s ease-in-out infinite'}} />
            {/* Inner ring - 50% size */}
            <div className="absolute w-[50%] h-[50%] bg-white rounded-full opacity-90" />
            {/* Core - 40% size */}
            <div className="absolute w-[40%] h-[40%] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full" style={{animation: 'temporal-shimmer 1.8s ease-in-out infinite'}} />
          </div>
        )}
        
        {equippedSingularity === 'stone' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-lg shadow-gray-500/60 border border-gray-300" />
            <div className="absolute inset-1 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full opacity-80" />
            <div className="absolute inset-2 bg-gray-200 rounded-full opacity-60" />
            <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-90" />
            <div className="absolute bottom-2 right-1.5 w-0.5 h-0.5 bg-gray-100 rounded-full" />
            <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-white rounded-full opacity-70" />
            <div className="absolute bottom-1 left-2.5 w-0.5 h-0.5 bg-gray-100 rounded-full opacity-80" />
          </>
        )}
        
        {equippedSingularity === 'shadow-monarch' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer shadow layer */}
            <div className="absolute w-full h-full bg-gradient-to-br from-gray-900 via-black to-purple-900 rounded-full border-2 border-purple-800 shadow-2xl shadow-purple-900/90" />
            <div className="absolute w-full h-full rounded-full" style={{
              background: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(75,0,130,0.8) 40%, rgba(139,69,19,0.6) 70%, transparent 90%)',
              animation: 'shadow-consume 3s ease-in-out infinite'
            }} />
            <div className="absolute w-[95%] h-[95%] rounded-full border border-purple-600 opacity-60" style={{animation: 'shadow-ring 4s linear infinite'}} />
            {/* Middle shadow ring - 75% */}
            <div className="absolute w-[75%] h-[75%] bg-gradient-to-br from-purple-900 via-black to-gray-800 rounded-full" style={{animation: 'shadow-writhe 2.5s ease-in-out infinite'}} />
            {/* Inner core - 50% */}
            <div className="absolute w-[50%] h-[50%] bg-black rounded-full" />
            {/* Purple glow - 40% */}
            <div className="absolute w-[40%] h-[40%] bg-purple-900 rounded-full opacity-40" style={{animation: 'shadow-pulse 1.5s ease-in-out infinite'}} />
            {/* Shadow tendrils - on top */}
            <div className="absolute -top-[10%] left-1/2 w-1 h-[30%] bg-purple-400 transform -translate-x-1/2 opacity-60" style={{animation: 'shadow-tendril 2s ease-in-out infinite'}} />
            <div className="absolute -bottom-[10%] left-1/2 w-1 h-[30%] bg-purple-400 transform -translate-x-1/2 opacity-60" style={{animation: 'shadow-tendril 2s ease-in-out infinite 1s'}} />
          </div>
        )}
        
        {equippedSingularity === 'grass' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full shadow-lg shadow-green-400/60" />
            <div className="absolute inset-1 bg-gradient-to-br from-green-300 to-green-400 rounded-full" style={{animation: 'grass-sway 2.5s ease-in-out infinite'}} />
            <div className="absolute inset-2 bg-green-200 rounded-full opacity-70" style={{animation: 'grass-sway 2s ease-in-out infinite reverse'}} />
            <div className="absolute inset-3 bg-green-100 rounded-full opacity-50" style={{animation: 'grass-sway 2.2s ease-in-out infinite'}} />
          </>
        )}
        
        {equippedSingularity === 'wind' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-white to-gray-100 rounded-full shadow-lg shadow-gray-300/50" />
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.8) 25%, transparent 30%, transparent 70%, rgba(255,255,255,0.8) 75%, transparent 80%)',
              animation: 'wind-flow 3s ease-in-out infinite'
            }} />
            <div className="absolute inset-1 rounded-full" style={{
              background: 'linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.6) 35%, transparent 40%)',
              animation: 'wind-flow 2.5s ease-in-out infinite reverse'
            }} />
            <div className="absolute inset-2 rounded-full" style={{
              background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.7) 45%, transparent 50%)',
              animation: 'wind-flow 2.8s ease-in-out infinite'
            }} />
          </>
        )}
        
        {equippedSingularity === 'sand' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200 rounded-full shadow-lg shadow-amber-300/50" />
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(180deg, transparent 60%, rgba(251,191,36,0.6) 65%, transparent 70%)',
              animation: 'sand-drift 4s ease-in-out infinite'
            }} />
            <div className="absolute inset-1 rounded-full" style={{
              background: 'linear-gradient(0deg, transparent 50%, rgba(245,158,11,0.4) 55%, transparent 60%)',
              animation: 'sand-drift 3.5s ease-in-out infinite reverse'
            }} />
            <div className="absolute inset-2 rounded-full" style={{
              background: 'linear-gradient(90deg, transparent 40%, rgba(251,191,36,0.5) 45%, transparent 50%)',
              animation: 'sand-drift 3.8s ease-in-out infinite'
            }} />
          </>
        )}
        
        {equippedSingularity === 'leaf' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-green-300 via-emerald-400 to-green-500 rounded-full shadow-lg shadow-emerald-400/60" />
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(135deg, transparent 30%, rgba(34,197,94,0.7) 35%, transparent 40%, transparent 60%, rgba(34,197,94,0.5) 65%, transparent 70%)',
              animation: 'leaf-rustle 2.8s ease-in-out infinite'
            }} />
            <div className="absolute inset-1 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full opacity-70" style={{animation: 'leaf-rustle 2.3s ease-in-out infinite reverse'}} />
            <div className="absolute top-1.5 left-2 w-1 h-2 bg-green-600 rounded-full opacity-60 transform rotate-45" />
            <div className="absolute top-2.5 left-3 w-0.5 h-1.5 bg-green-600 rounded-full opacity-50 transform rotate-45" />
            <div className="absolute top-3 left-1.5 w-0.5 h-1 bg-green-600 rounded-full opacity-40 transform rotate-45" />
          </>
        )}
        
        {/* Fallback for any remaining styles */}
        {equippedSingularity && !['classic-singularity', 'cosmic-glow', 'stellar-core', 'void-essence', 'golden-majesty', 'crystal-essence', 'plasma-core', 'aurora', 'lightning', 'flame', 'frost', 'prism-matrix', 'quantum-nexus', 'nebula-heart', 'cosmic-forge', 'temporal-vortex', 'stone', 'shadow-monarch', 'grass', 'wind', 'sand', 'leaf'].includes(equippedSingularity) && (
          <div className={`absolute inset-0 rounded-full ${singularityStyle.base} ${singularityStyle.effects}`} />
        )}
        
        {/* Face overlay */}
        {equippedFace && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center text-black/80 z-10">
            {getFaceSVG(equippedFace, size)}
          </div>
        )}
      </m.div>

      {/* Dynamic aura system */}
      {showAura && auraConfig && (
        <>
          {/* Gradient background aura */}
          {auraConfig.gradient && (
            <m.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 'calc(100% + 60px)',
                height: 'calc(100% + 60px)', 
                top: '-30px',
                left: '-30px',
                background: auraConfig.gradient,
                zIndex: -1
              }}
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
          )}
          
          {/* Ring effects */}
          {auraConfig.rings && auraConfig.rings.length > 0 && auraConfig.rings.map((ring, index) => {
            // Map color names to actual CSS color values
            const colorMap: { [key: string]: string } = {
              'cosmic-aurora': '#f39c12',
              'cosmic-starlight': '#e94560',
              'blue-400': '#60a5fa',
              'cyan-300': '#67e8f9',
              'purple-500': '#a855f7',
              'indigo-400': '#818cf8',
              'emerald-500': '#10b981',
              'green-400': '#4ade80',
              'red-500': '#ef4444',
              'orange-400': '#fb923c',
              'yellow-400': '#facc15',
              'amber-300': '#fcd34d',
              'cyan-400': '#22d3ee',
              'blue-200': '#bfdbfe',
              'gray-600': '#4b5563',
              'purple-900': '#581c87',
              'pink-400': '#f472b6',
              'purple-400': '#c084fc',
              'pink-500': '#ec4899',
              'blue-300': '#93c5fd',
              'blue-500': '#3b82f6',
              'purple-600': '#9333ea'
            }
            
            const borderColor = colorMap[ring.color] || '#ffffff'
            const opacityValue = ring.opacity / 100
            
            return (
              <m.div
                key={`ring-${index}`}
                className={`absolute rounded-full pointer-events-none`}
                style={{ 
                  width: `calc(100% + ${ring.size}px)`, 
                  height: `calc(100% + ${ring.size}px)`,
                  top: `-${ring.size / 2}px`,
                  left: `-${ring.size / 2}px`,
                  border: `3px solid ${borderColor}`,
                  borderColor: borderColor,
                  boxShadow: `0 0 15px ${borderColor}`,
                  filter: 'blur(0.5px)'
                }}
                initial={{ scale: 1, opacity: opacityValue }}
                animate={{
                  scale: [1, 1.15, 1.2, 1.15, 1],
                  opacity: [opacityValue, opacityValue * 0.5, opacityValue * 0.3, opacityValue * 0.5, opacityValue]
                }}
                transition={{
                  duration: ring.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: ring.delay || 0,
                  repeatType: "reverse"
                }}
              />
            )
          })}
        </>
      )}
    </div>
    </LazyMotion>
  )

  return avatarElement
}

// Export as dynamic component with SSR disabled for animations
const EquippedAvatar = dynamic(() => Promise.resolve(EquippedAvatarComponent), {
  ssr: true,
  loading: () => {
    // Return a simple static placeholder during loading
    return (
      <div className="w-8 h-8 bg-white rounded-full shadow-2xl" />
    )
  }
})

export default EquippedAvatar