'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'

interface SingularityNodeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'available' | 'locked' | 'in-progress' | 'completed'
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

// Unified singularity styles (matches EquippedAvatar exactly)
const singularityStyles = {
  'classic-singularity': {
    base: 'bg-white',
    effects: ''
  },
  'cosmic-glow': {
    base: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400',
    effects: 'animate-pulse shadow-lg shadow-purple-400/60'
  },
  'stellar-core': {
    base: 'bg-yellow-400',
    effects: 'animate-pulse shadow-lg shadow-yellow-400/80'
  },
  'void-essence': {
    base: 'bg-purple-900 border-2 border-purple-400',
    effects: 'animate-pulse shadow-lg shadow-purple-400/60'
  },
  'golden-majesty': {
    base: 'bg-yellow-500 border-2 border-yellow-300',
    effects: 'shadow-lg shadow-yellow-500/60'
  },
  'crystal-essence': {
    base: 'bg-cyan-400 border-2 border-cyan-200',
    effects: 'animate-pulse shadow-lg shadow-cyan-400/60'
  },
  'plasma-storm': {
    base: 'bg-pink-500 border-2 border-pink-300',
    effects: 'shadow-lg shadow-pink-500/60'
  },
  'aurora': {
    base: 'bg-gradient-to-br from-green-400 via-blue-400 to-purple-400',
    effects: 'animate-pulse shadow-lg shadow-green-400/50'
  },
  'lightning': {
    base: 'bg-gradient-to-r from-blue-300 to-white border-2 border-blue-200',
    effects: 'shadow-lg shadow-blue-300/80'
  },
  'flame': {
    base: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400',
    effects: 'shadow-lg shadow-orange-400/70'
  },
  'frost': {
    base: 'bg-gradient-to-br from-blue-200 via-cyan-300 to-white',
    effects: 'shadow-lg shadow-cyan-300/60'
  },
  'grass': {
    base: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
    effects: 'shadow-lg shadow-green-400/60'
  },
  'wind': {
    base: 'bg-gradient-to-br from-gray-200 via-white to-gray-100',
    effects: 'shadow-lg shadow-gray-300/50'
  },
  'sand': {
    base: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200',
    effects: 'shadow-lg shadow-amber-300/50'
  },
  'stone': {
    base: 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 border border-gray-300',
    effects: 'shadow-lg shadow-gray-500/60'
  },
  'leaf': {
    base: 'bg-gradient-to-br from-green-300 via-emerald-400 to-green-500',
    effects: 'shadow-lg shadow-emerald-400/60'
  },
  // Epic New Singularity Styles
  'quantum-nexus': {
    base: 'bg-gradient-to-br from-cyan-200 via-blue-400 to-purple-600 border-2 border-cyan-300',
    effects: 'shadow-2xl shadow-cyan-400/80 animate-pulse'
  },
  'temporal-vortex': {
    base: 'bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500',
    effects: 'shadow-2xl shadow-purple-500/70 animate-pulse'
  },
  'cosmic-forge': {
    base: 'bg-gradient-to-br from-orange-400 via-red-500 to-yellow-300',
    effects: 'shadow-2xl shadow-orange-500/80 animate-pulse'
  },
  'shadow-monarch': {
    base: 'bg-gradient-to-br from-gray-900 via-black to-purple-900 border-2 border-purple-800',
    effects: 'shadow-2xl shadow-purple-900/90'
  },
  'prism-matrix': {
    base: 'bg-gradient-to-br from-white via-cyan-200 to-pink-200 border border-cyan-300',
    effects: 'shadow-lg shadow-cyan-300/60'
  },
  'nebula-heart': {
    base: 'bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400',
    effects: 'shadow-lg shadow-purple-400/60'
  },
  'plasma-core': {
    base: 'bg-pink-500 border-2 border-pink-300',
    effects: 'shadow-lg shadow-pink-500/60'
  }
}

const sizeConfig = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const statusConfig = {
  available: {
    opacity: 'opacity-100',
    filter: 'brightness(1)',
    cursor: 'cursor-pointer'
  },
  'in-progress': {
    opacity: 'opacity-90',
    filter: 'brightness(1.1)',
    cursor: 'cursor-pointer'
  },
  completed: {
    opacity: 'opacity-80',
    filter: 'brightness(0.8) saturate(0.7)',
    cursor: 'cursor-pointer'
  },
  locked: {
    opacity: 'opacity-30',
    filter: 'brightness(0.5) grayscale(1)',
    cursor: 'cursor-not-allowed'
  }
}

export default function SingularityNode({
  size = 'md',
  status = 'available',
  className = '',
  onClick,
  children
}: SingularityNodeProps) {
  const { } = useProfile()
  const { equippedSingularity, forceUpdate } = useCosmetics()
  const [localUpdate, setLocalUpdate] = useState(0)
  
  // Force re-render when cosmetics change
  useEffect(() => {
    setLocalUpdate(prev => prev + 1)
  }, [equippedSingularity, forceUpdate])
  
  const singularityStyle = singularityStyles[equippedSingularity as keyof typeof singularityStyles] || singularityStyles['classic-singularity']
  const sizeClass = sizeConfig[size]
  const statusStyle = statusConfig[status]
  
  const isInteractive = status !== 'locked' && onClick

  return (
    <m.div
      className={`
        ${sizeClass} 
        ${singularityStyle.base} 
        ${singularityStyle.effects}
        ${statusStyle.opacity}
        ${statusStyle.cursor}
        ${className}
        rounded-full relative overflow-visible transition-all duration-300
      `}
      style={{
        filter: statusStyle.filter
      }}
      whileHover={isInteractive ? { scale: 1.1 } : {}}
      whileTap={isInteractive ? { scale: 0.95 } : {}}
      onClick={status !== 'locked' ? onClick : undefined}
    >
      {/* Inner glow for special singularity styles */}
      {equippedSingularity !== 'classic-singularity' && status !== 'locked' && (
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
      )}
      
      {/* Status indicators */}
      {status === 'completed' && (
        <div className="absolute inset-0 rounded-full border-2 border-green-400/50" />
      )}
      
      {status === 'in-progress' && (
        <m.div
          className="absolute inset-0 rounded-full border-2 border-blue-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {children}
    </m.div>
  )
}

// Export the singularity styles for use in other components
export { singularityStyles }