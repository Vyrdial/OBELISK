'use client'

import { m } from 'framer-motion'

interface CrownOverlayProps {
  style?: 'premium-crown' | 'hard-hat' | 'golden-crown' | 'diamond-tiara' | 'cosmic-halo' | string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'
  scaleMultiplier?: number
}

const crownStyles = {
  'premium-crown': {
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
    shadow: '0 0 20px rgba(255, 215, 0, 0.6)',
    tilt: -30,
    type: 'crown'
  },
  'hard-hat': {
    color: '#FFA500',
    gradient: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 50%, #FFA500 100%)',
    shadow: '0 0 15px rgba(255, 165, 0, 0.5)',
    tilt: 0,
    type: 'hardhat'
  },
  'golden-crown': {
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
    shadow: '0 0 25px rgba(255, 215, 0, 0.8)',
    tilt: -25,
    type: 'crown'
  },
  'diamond-tiara': {
    color: '#E0E0E0',
    gradient: 'linear-gradient(135deg, #E0E0E0 0%, #FFFFFF 50%, #E0E0E0 100%)',
    shadow: '0 0 20px rgba(224, 224, 224, 0.7)',
    tilt: -20,
    type: 'tiara'
  },
  'cosmic-halo': {
    color: '#9B59B6',
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 50%, #9B59B6 100%)',
    shadow: '0 0 30px rgba(155, 89, 182, 0.6)',
    tilt: 0,
    type: 'halo'
  }
}

const sizeScale = {
  xs: 0.3,
  sm: 0.35,
  md: 0.4,
  lg: 0.45,
  xl: 0.5,
  xxl: 0.55,
  xxxl: 0.6
}

export default function CrownOverlay({ style = 'premium-crown', size = 'md', scaleMultiplier = 1 }: CrownOverlayProps) {
  const crown = crownStyles[style as keyof typeof crownStyles] || crownStyles['premium-crown']
  const scale = sizeScale[size] * scaleMultiplier
  
  const renderCrownSVG = () => {
    if (crown.type === 'hardhat') {
      // Hard Hat design
      return (
        <svg
          width="28"
          height="20"
          viewBox="0 0 28 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: `drop-shadow(${crown.shadow})` }}
        >
          {/* Hard Hat Dome */}
          <ellipse
            cx="14"
            cy="12"
            rx="12"
            ry="8"
            fill={crown.color}
          />
          {/* Hard Hat Brim */}
          <ellipse
            cx="14"
            cy="14"
            rx="13"
            ry="3"
            fill={crown.color}
            opacity="0.8"
          />
          {/* Front Shield/Badge */}
          <rect
            x="11"
            y="8"
            width="6"
            height="4"
            rx="1"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </svg>
      )
    } else if (crown.type === 'halo') {
      // Halo design
      return (
        <svg
          width="30"
          height="12"
          viewBox="0 0 30 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: `drop-shadow(${crown.shadow})` }}
        >
          <ellipse
            cx="15"
            cy="6"
            rx="14"
            ry="5"
            fill="none"
            stroke={crown.color}
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Glow effect */}
          <ellipse
            cx="15"
            cy="6"
            rx="12"
            ry="4"
            fill={crown.color}
            opacity="0.2"
          />
        </svg>
      )
    } else {
      // Default crown design
      return (
        <svg
          width="24"
          height="20"
          viewBox="0 0 24 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: `drop-shadow(${crown.shadow})` }}
        >
          {/* Crown Shape */}
          <path
            d="M2 16L4 6L8 12L12 4L16 12L20 6L22 16H2Z"
            fill={crown.color}
            stroke="none"
          />
          
          {/* Crown Base Band */}
          <rect
            x="2"
            y="16"
            width="20"
            height="3"
            fill={crown.color}
          />
          
          {/* Central Gem */}
          <circle 
            cx="12" 
            cy="10" 
            r="1.5" 
            fill="#FFFFFF" 
            opacity="0.9" 
          />
        </svg>
      )
    }
  }
  
  return (
    <m.div
      className="absolute pointer-events-none"
      style={{
        top: `-${scale * 50}%`,
        left: `-${scale * 15}%`,
        transform: `scale(${scale * 1.0})`,
        transformOrigin: 'bottom center',
        zIndex: 10
      }}
      initial={{ y: -5, rotate: crown.tilt - 5 }}
      animate={{ 
        y: [-5, -8, -5],
        rotate: [crown.tilt - 5, crown.tilt + 5, crown.tilt - 5]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {renderCrownSVG()}
      
      {/* Sparkle Effects */}
      {[...Array(3)].map((_, i) => (
        <m.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${15 + i * 10}px`,
            top: `${8 + i * 4}px`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: 1.5
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeInOut"
          }}
        />
      ))}
    </m.div>
  )
}