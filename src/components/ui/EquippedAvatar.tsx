'use client'

import { useState, useEffect } from 'react'
import { m, LazyMotion, domAnimation } from 'framer-motion'
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
        <div className={`${sizeClass} bg-white rounded-full shadow-2xl relative overflow-hidden`}>
          <div className="absolute inset-[8%] bg-white rounded-full" />
          {equippedSingularity !== 'classic-singularity' && (
            <div className={`absolute inset-[8%] rounded-full ${singularityStyle.base} opacity-80`} />
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
      
      {/* Main avatar - glassy orb style */}
      <m.div
        className={`
          ${sizeClass} 
          ${clickable || onClick ? 'cursor-pointer' : ''}
          bg-white rounded-full shadow-2xl relative overflow-hidden
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
        {/* Animated gradient overlay */}
        <m.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-green-300/10 to-purple-400/5"
          initial={{ rotate: 0 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        />
        
        {/* Inner white core */}
        <div className="absolute inset-[8%] bg-white rounded-full" />
        
        {/* Singularity color overlay */}
        {equippedSingularity !== 'classic-singularity' && (
          <div className={`absolute inset-[8%] rounded-full ${singularityStyle.base} opacity-80`} />
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