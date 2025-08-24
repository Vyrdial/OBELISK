'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileNavigation } from '@/lib/profileNavigation'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, ShoppingBag, Star, Palette, 
  Zap, Crown, Diamond, Gem, Circle,
  Check, X, ArrowRight, Shield, Lock, RefreshCw, Plus, Smile
} from 'lucide-react'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import StardustCounter from '@/components/ui/StardustCounter'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import EquippedAvatar from '@/components/ui/EquippedAvatar'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: 'singularity' | 'faces' | 'auras' | 'treasures' | 'crowns'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon?: React.ReactNode
  preview?: React.ReactNode
  owned?: boolean
  equipped?: boolean
  locked?: boolean
  unlockCondition?: string
}

const shopItems: ShopItem[] = [
  // Singularity Styles (Avatar Dots + Node Styles combined)
  {
    id: 'classic-singularity',
    name: 'The Point',
    description: 'Pure, timeless design. Your avatar and all nodes appear as simple, elegant dots.',
    price: 0,
    category: 'singularity',
    rarity: 'common',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-white rounded-full" />
    </div>,
    owned: true,
    equipped: true
  },
  {
    id: 'cosmic-glow',
    name: 'Slushy',
    description: 'Deep space energy radiates from within. Pulsing with the heartbeat of the universe.',
    price: 100,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Outer cosmic glow ring */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-400/60" style={{
          animation: 'cosmic-breathe 3s ease-in-out infinite'
        }} />
        {/* Swirling energy bands */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(99,102,241,0.8), transparent, rgba(168,85,247,0.8), transparent, rgba(236,72,153,0.8), transparent)',
          animation: 'cosmic-swirl 4s linear infinite'
        }} />
        {/* Inner pulsing core */}
        <div className="absolute inset-[30%] bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 rounded-full" style={{
          animation: 'cosmic-pulse 2s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(168,85,247,0.6)'
        }} />
        {/* Energy particles */}
        <div className="absolute top-1 left-1 w-1 h-1 bg-pink-300 rounded-full" style={{
          animation: 'particle-orbit 3s linear infinite'
        }} />
        <div className="absolute bottom-1 right-1 w-1 h-1 bg-indigo-300 rounded-full" style={{
          animation: 'particle-orbit 3s linear infinite reverse'
        }} />
        {/* Central bright core */}
        <div className="absolute inset-[40%] bg-white rounded-full opacity-90" />
      </div>
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
          from { transform: rotate(0deg) translateX(12px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(12px) rotate(-360deg); }
        }
      `}</style>
    </div>
  },
  {
    id: 'stellar-core',
    name: 'Starburst',
    description: 'Radiates stellar power. Your avatar and nodes glow with the intensity of a thousand stars.',
    price: 250,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Main stellar body */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full shadow-lg shadow-yellow-400/80" style={{
          animation: 'stellar-pulse 2s ease-in-out infinite'
        }} />
        
        {/* Solar flares erupting */}
        <div className="absolute -top-1 left-1/2 w-1 h-3 bg-gradient-to-t from-orange-400 via-yellow-300 to-transparent" style={{
          animation: 'solar-flare 3s ease-out infinite',
          transformOrigin: 'bottom center'
        }} />
        <div className="absolute -right-1 top-1/2 w-3 h-1 bg-gradient-to-r from-orange-400 via-yellow-300 to-transparent" style={{
          animation: 'solar-flare 3s ease-out infinite 0.75s',
          transformOrigin: 'left center'
        }} />
        <div className="absolute -bottom-1 left-1/2 w-1 h-3 bg-gradient-to-b from-orange-400 via-yellow-300 to-transparent" style={{
          animation: 'solar-flare 3s ease-out infinite 1.5s',
          transformOrigin: 'top center'
        }} />
        <div className="absolute -left-1 top-1/2 w-3 h-1 bg-gradient-to-l from-orange-400 via-yellow-300 to-transparent" style={{
          animation: 'solar-flare 3s ease-out infinite 2.25s',
          transformOrigin: 'right center'
        }} />
        
        {/* Corona effect */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(255,215,0,0.3) 50%, transparent 70%)',
          animation: 'corona-wave 2.5s ease-in-out infinite'
        }} />
        
        {/* Orbiting stars */}
        <Star className="absolute w-2 h-2 text-white" style={{
          animation: 'star-orbit 4s linear infinite',
          transformOrigin: '16px 16px',
          left: '8px',
          top: '-4px'
        }} />
        <Star className="absolute w-1.5 h-1.5 text-yellow-200" style={{
          animation: 'star-orbit 3s linear infinite reverse',
          transformOrigin: '16px 16px',
          right: '0px',
          bottom: '-2px'
        }} />
        <Star className="absolute w-1 h-1 text-white" style={{
          animation: 'star-orbit 5s linear infinite 1s',
          transformOrigin: '16px 16px',
          left: '-2px',
          top: '12px'
        }} />
        
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
        @keyframes stellar-core-glow {
          0%, 100% { transform: scale(1); filter: brightness(1) blur(0px); }
          50% { transform: scale(1.1); filter: brightness(1.5) blur(2px); }
        }
        @keyframes stellar-brightness {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  },
  {
    id: 'void-essence',
    name: 'Void',
    description: 'Mysterious dark singularity. Your avatar and nodes bend light itself with purple void energy.',
    price: 200,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Dark void base */}
        <div className="absolute inset-0 bg-purple-900 rounded-full border-2 border-purple-400 shadow-lg shadow-purple-400/60" />
        {/* Void distortion effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-[-50%] bg-gradient-to-br from-purple-900 via-black to-purple-700 rounded-full" style={{
            animation: 'void-distort 4s ease-in-out infinite'
          }} />
        </div>
        {/* Void particles being pulled in */}
        <div className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-purple-300" style={{
          animation: 'void-absorb-top 2s ease-in infinite'
        }} />
        <div className="absolute bottom-0 left-1/2 w-0.5 h-0.5 bg-purple-300" style={{
          animation: 'void-absorb-bottom 2s ease-in infinite 0.5s'
        }} />
        <div className="absolute left-0 top-1/2 w-0.5 h-0.5 bg-purple-300" style={{
          animation: 'void-absorb-left 2s ease-in infinite 1s'
        }} />
        <div className="absolute right-0 top-1/2 w-0.5 h-0.5 bg-purple-300" style={{
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
      <style jsx>{`
        @keyframes void-distort {
          0%, 100% { transform: rotate(0deg) scale(1); }
          33% { transform: rotate(120deg) scale(1.2); }
          66% { transform: rotate(240deg) scale(0.9); }
        }
        @keyframes void-absorb-top {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(15px) scale(0); opacity: 0; }
        }
        @keyframes void-absorb-bottom {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-15px) scale(0); opacity: 0; }
        }
        @keyframes void-absorb-left {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(15px) scale(0); opacity: 0; }
        }
        @keyframes void-absorb-right {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(-15px) scale(0); opacity: 0; }
        }
        @keyframes event-horizon {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  },
  {
    id: 'golden-majesty',
    name: 'Midas',
    description: 'Pure golden radiance. Transform your avatar and all nodes into gleaming celestial gold.',
    price: 150,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Golden base with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-full border-2 border-yellow-300 shadow-lg shadow-yellow-500/60" />
        {/* Shimmering effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent" style={{
            animation: 'golden-shimmer 2s linear infinite',
            transform: 'translateX(-100%)'
          }} />
        </div>
        {/* Royal rays emanating */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(250,204,21,0.4) 15deg, transparent 30deg, transparent, rgba(250,204,21,0.4) 105deg, transparent 120deg, transparent, rgba(250,204,21,0.4) 195deg, transparent 210deg, transparent, rgba(250,204,21,0.4) 285deg, transparent 300deg)',
          animation: 'royal-rays 6s linear infinite'
        }} />
        {/* Golden sparkles */}
        <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-200 rounded-full" style={{
          animation: 'sparkle-twinkle 1.5s ease-in-out infinite'
        }} />
        <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-yellow-100 rounded-full" style={{
          animation: 'sparkle-twinkle 1.5s ease-in-out infinite 0.3s'
        }} />
        <div className="absolute top-2 left-1.5 w-0.5 h-0.5 bg-amber-200 rounded-full" style={{
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
      <style jsx>{`
        @keyframes golden-shimmer {
          to { transform: translateX(100%); }
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
    </div>
  },
  {
    id: 'crystal-essence',
    name: 'Frosty',
    description: 'Crystalline perfection. Your avatar and nodes become crystalline structures that refract cosmic light.',
    price: 180,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Crystal base */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-400 rounded-full border-2 border-cyan-200 shadow-lg shadow-cyan-400/60" />
        {/* Crystalline facets */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
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
        {/* Inner crystal core with prismatic effect */}
        <div className="absolute inset-[25%] rounded-full" style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(34,211,238,0.6) 50%, rgba(59,130,246,0.4) 100%)',
          animation: 'crystal-pulse 2s ease-in-out infinite',
          boxShadow: '0 0 15px rgba(34,211,238,0.8)'
        }} />
        {/* Light refraction spots */}
        <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-white rounded-full opacity-80" style={{
          animation: 'light-sparkle 1.5s ease-in-out infinite'
        }} />
        <div className="absolute bottom-2 left-1.5 w-0.5 h-0.5 bg-cyan-100 rounded-full" style={{
          animation: 'light-sparkle 1.5s ease-in-out infinite 0.5s'
        }} />
      </div>
      <style jsx>{`
        @keyframes crystal-refract {
          from { transform: translateX(-100%) translateY(-100%); }
          to { transform: translateX(100%) translateY(100%); }
        }
        @keyframes shard-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(5deg); }
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
    </div>
  },
  {
    id: 'plasma-core',
    name: 'Plasma Core',
    description: 'Chaotic plasma energy. Your avatar and nodes vibrate with unstable cosmic force.',
    price: 300,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Unstable plasma base */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full border-2 border-pink-300 shadow-lg shadow-pink-500/60" style={{
          animation: 'plasma-vibrate 0.2s linear infinite'
        }} />
        
        {/* Plasma tendrils */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-[-20%] bg-gradient-to-r from-transparent via-pink-400 to-transparent" style={{
            animation: 'plasma-flow 1s linear infinite',
            transform: 'rotate(0deg)'
          }} />
          <div className="absolute inset-[-20%] bg-gradient-to-r from-transparent via-purple-400 to-transparent" style={{
            animation: 'plasma-flow 0.8s linear infinite reverse',
            transform: 'rotate(45deg)'
          }} />
          <div className="absolute inset-[-20%] bg-gradient-to-r from-transparent via-blue-400 to-transparent" style={{
            animation: 'plasma-flow 1.2s linear infinite',
            transform: 'rotate(90deg)'
          }} />
        </div>
        
        {/* Electric arcs */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent 85%, rgba(236,72,153,0.8) 87%, transparent 89%, transparent 175%, rgba(147,51,234,0.8) 177%, transparent 179%, transparent 265%, rgba(59,130,246,0.8) 267%, transparent 269%, transparent 355%, rgba(236,72,153,0.8) 357%, transparent 359%)',
          animation: 'plasma-arc 0.5s linear infinite'
        }} />
        
        {/* Unstable energy bursts */}
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-pink-300 rounded-full" style={{
          animation: 'plasma-burst 1.5s ease-out infinite',
          filter: 'blur(1px)'
        }} />
        <div className="absolute bottom-0 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full" style={{
          animation: 'plasma-burst 1.5s ease-out infinite 0.5s',
          filter: 'blur(1px)'
        }} />
        <div className="absolute left-0 top-1/3 w-1 h-1 bg-blue-300 rounded-full" style={{
          animation: 'plasma-burst 1.5s ease-out infinite 1s',
          filter: 'blur(1px)'
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
          50% { transform: scale(1.5) translate(var(--tx, 5px), var(--ty, -5px)); opacity: 0.5; }
          100% { transform: scale(0) translate(var(--tx, 10px), var(--ty, -10px)); opacity: 0; }
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
    </div>
  },
  {
    id: 'aurora',
    name: 'Borealis',
    description: 'Dancing northern lights. Your avatar and nodes shimmer with shifting aurora colors.',
    price: 120,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Base aurora gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-full shadow-lg shadow-green-400/50" style={{
          animation: 'aurora-shift 4s ease-in-out infinite'
        }} />
        
        {/* Dancing aurora curtains */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-green-300 to-transparent" style={{
            animation: 'aurora-dance 3s ease-in-out infinite',
            transform: 'translateY(50%)'
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-300 to-transparent" style={{
            animation: 'aurora-dance 3.5s ease-in-out infinite 0.5s',
            transform: 'translateY(50%)'
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-300 to-transparent" style={{
            animation: 'aurora-dance 4s ease-in-out infinite 1s',
            transform: 'translateY(50%)'
          }} />
        </div>
        
        {/* Shimmering waves */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(74,222,128,0.4), rgba(59,130,246,0.4), rgba(147,51,234,0.4), transparent, rgba(74,222,128,0.4), rgba(59,130,246,0.4), rgba(147,51,234,0.4), transparent)',
          animation: 'aurora-rotate 8s linear infinite'
        }} />
        
        {/* Aurora particles */}
        <div className="absolute top-1 left-2 w-0.5 h-3 bg-gradient-to-t from-green-400 to-transparent" style={{
          animation: 'aurora-particle 2s ease-in-out infinite',
          filter: 'blur(0.5px)'
        }} />
        <div className="absolute top-1.5 right-2 w-0.5 h-2.5 bg-gradient-to-t from-blue-400 to-transparent" style={{
          animation: 'aurora-particle 2.5s ease-in-out infinite 0.5s',
          filter: 'blur(0.5px)'
        }} />
        <div className="absolute top-2 left-1/2 w-0.5 h-2 bg-gradient-to-t from-purple-400 to-transparent" style={{
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
          50% { transform: translateY(-5px) scaleY(1.5); opacity: 0.8; }
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
    </div>
  },
  {
    id: 'lightning',
    name: 'Voltaic Surge',
    description: 'Electric storm energy. Your avatar and nodes crackle with pure electrical power.',
    price: 500,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-r from-blue-300 to-white rounded-full border-2 border-blue-200 shadow-lg shadow-blue-300/80">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(45deg, transparent 30%, #60a5fa 35%, transparent 40%, transparent 60%, #60a5fa 65%, transparent 70%)',
          animation: 'lightning-arc 0.8s ease-in-out infinite'
        }} />
        <div className="absolute inset-1 rounded-full" style={{
          background: 'linear-gradient(-45deg, transparent 20%, #93c5fd 25%, transparent 30%, transparent 70%, #93c5fd 75%, transparent 80%)',
          animation: 'lightning-arc 0.6s ease-in-out infinite reverse'
        }} />
        <div className="absolute inset-2 rounded-full" style={{
          background: 'linear-gradient(135deg, transparent 40%, #60a5fa 45%, transparent 50%)',
          animation: 'lightning-arc 0.7s ease-in-out infinite'
        }} />
        <div className="absolute inset-3 rounded-full" style={{
          background: 'linear-gradient(225deg, transparent 30%, #60a5fa 35%, transparent 40%)',
          animation: 'lightning-arc 0.5s ease-in-out infinite'
        }} />
      </div>
    </div>
  },
  {
    id: 'flame',
    name: 'Infernal Heart',
    description: 'Eternal fire burns within. Your avatar and nodes flicker with living flame.',
    price: 450,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 rounded-full shadow-lg shadow-orange-400/70">
        <div className="absolute inset-0 bg-red-600 rounded-full" />
        <div className="absolute inset-0.5 bg-orange-500 rounded-full" style={{animation: 'flame-flicker 1.2s ease-in-out infinite'}} />
        <div className="absolute inset-1 bg-yellow-400 rounded-full" style={{animation: 'flame-flicker 0.8s ease-in-out infinite reverse'}} />
        <div className="absolute inset-1.5 bg-yellow-200 rounded-full opacity-80" style={{animation: 'flame-flicker 0.6s ease-in-out infinite'}} />
        <div className="absolute inset-2 bg-white rounded-full opacity-60" style={{animation: 'flame-flicker 0.4s ease-in-out infinite'}} />
      </div>
    </div>
  },
  {
    id: 'frost',
    name: 'Arctic Reverie',
    description: 'Crystalline ice energy. Your avatar and nodes emanate cold, sharp beauty.',
    price: 280,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-blue-200 via-cyan-300 to-white rounded-full shadow-lg shadow-cyan-300/60">
        <div className="absolute inset-1 bg-gradient-to-br from-cyan-100 to-white rounded-full opacity-80" style={{animation: 'frost-crystallize 2s ease-in-out infinite'}} />
        <div className="absolute inset-0 rounded-full border border-cyan-200" style={{animation: 'frost-crystallize 1.5s ease-in-out infinite reverse'}} />
        <div className="absolute inset-2 bg-white rounded-full opacity-70" style={{animation: 'frost-crystallize 1.3s ease-in-out infinite'}} />
      </div>
    </div>
  },
  {
    id: 'grass',
    name: 'Verdant Pulse',
    description: 'Living nature energy. Your avatar and nodes pulse with the growth of life.',
    price: 80,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full shadow-lg shadow-green-400/60">
        <div className="absolute inset-1 bg-gradient-to-br from-green-300 to-green-400 rounded-full" style={{animation: 'grass-sway 2.5s ease-in-out infinite'}} />
        <div className="absolute inset-2 bg-green-200 rounded-full opacity-70" style={{animation: 'grass-sway 2s ease-in-out infinite reverse'}} />
        <div className="absolute inset-3 bg-green-100 rounded-full opacity-50" style={{animation: 'grass-sway 2.2s ease-in-out infinite'}} />
      </div>
    </div>
  },
  {
    id: 'wind',
    name: 'Zephyr Drift',
    description: 'Flowing air currents. Your avatar and nodes drift with ethereal grace.',
    price: 150,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-gray-200 via-white to-gray-100 rounded-full shadow-lg shadow-gray-300/50">
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
      </div>
    </div>
  },
  {
    id: 'sand',
    name: 'Mirage Veil',
    description: 'Desert essence flows. Your avatar and nodes shift like dunes in the wind.',
    price: 100,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200 rounded-full shadow-lg shadow-amber-300/50">
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
      </div>
    </div>
  },
  {
    id: 'stone',
    name: 'Titan\'s Embrace',
    description: 'Ancient rock strength. Your avatar and nodes stand immovable and eternal.',
    price: 120,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-lg shadow-gray-500/60 border border-gray-300">
        <div className="absolute inset-1 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full opacity-80" />
        <div className="absolute inset-2 bg-gray-200 rounded-full opacity-60" />
        <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-90" />
        <div className="absolute bottom-2 right-1.5 w-0.5 h-0.5 bg-gray-100 rounded-full" />
        <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-white rounded-full opacity-70" />
        <div className="absolute bottom-1 left-2.5 w-0.5 h-0.5 bg-gray-100 rounded-full opacity-80" />
      </div>
    </div>
  },
  {
    id: 'leaf',
    name: 'Sylvan Echo',
    description: 'Forest whispers. Your avatar and nodes rustle with ancient woodland magic.',
    price: 350,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-green-300 via-emerald-400 to-green-500 rounded-full shadow-lg shadow-emerald-400/60">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(135deg, transparent 30%, rgba(34,197,94,0.7) 35%, transparent 40%, transparent 60%, rgba(34,197,94,0.5) 65%, transparent 70%)',
          animation: 'leaf-rustle 2.8s ease-in-out infinite'
        }} />
        <div className="absolute inset-1 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full opacity-70" style={{animation: 'leaf-rustle 2.3s ease-in-out infinite reverse'}} />
        <div className="absolute top-1.5 left-2 w-1 h-2 bg-green-600 rounded-full opacity-60 transform rotate-45" />
        <div className="absolute top-2.5 left-3 w-0.5 h-1.5 bg-green-600 rounded-full opacity-50 transform rotate-45" />
        <div className="absolute top-3 left-1.5 w-0.5 h-1 bg-green-600 rounded-full opacity-40 transform rotate-45" />
      </div>
    </div>
  },

  // Epic New Singularity Styles
  {
    id: 'quantum-nexus',
    name: 'Quantum Nexus',
    description: 'Reality fractures around this impossible geometry. Exists in multiple dimensions simultaneously.',
    price: 1000,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-cyan-200 via-blue-400 to-purple-600 rounded-full border-2 border-cyan-300 shadow-2xl shadow-cyan-400/80">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(59,130,246,0.8), transparent, rgba(147,51,234,0.8), transparent)',
          animation: 'quantum-spin 3s linear infinite'
        }} />
        <div className="absolute inset-1 bg-gradient-to-br from-white via-cyan-100 to-blue-200 rounded-full opacity-60" style={{animation: 'quantum-pulse 2s ease-in-out infinite'}} />
        <div className="absolute inset-2 bg-white rounded-full opacity-80" />
        <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-cyan-300 transform -translate-x-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite'}} />
        <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-purple-300 transform -translate-x-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite 0.5s'}} />
        <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-blue-300 transform -translate-y-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite 1s'}} />
        <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-cyan-300 transform -translate-y-1/2" style={{animation: 'quantum-spike 1.5s ease-in-out infinite 1.5s'}} />
      </div>
    </div>
  },
  {
    id: 'temporal-vortex',
    name: 'Temporal Vortex',
    description: 'Time spirals endlessly around this chronomorphic singularity. Past and future converge.',
    price: 1200,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 rounded-full shadow-2xl shadow-purple-500/70">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(139,69,19,0.8) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(75,0,130,0.8) 0%, transparent 40%)',
          animation: 'temporal-swirl 4s ease-in-out infinite'
        }} />
        <div className="absolute inset-0.5 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(219,39,119,0.6), transparent, rgba(147,51,234,0.6), transparent, rgba(59,130,246,0.6), transparent)',
          animation: 'temporal-swirl 3s linear infinite reverse'
        }} />
        <div className="absolute inset-1.5 bg-gradient-to-br from-purple-200 via-pink-300 to-indigo-200 rounded-full opacity-70" style={{animation: 'temporal-pulse 2.5s ease-in-out infinite'}} />
        <div className="absolute inset-2.5 bg-white rounded-full opacity-90" />
        <div className="absolute inset-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full" style={{animation: 'temporal-shimmer 1.8s ease-in-out infinite'}} />
      </div>
    </div>
  },
  {
    id: 'cosmic-forge',
    name: 'Cosmic Forge',
    description: 'Where stars are born and galaxies are shaped. The fundamental force of creation itself.',
    price: 800,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* Main forge core - molten metal/lava base */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-700 to-yellow-600 rounded-full shadow-2xl shadow-orange-500/80">
          {/* Inner molten core with animated glow */}
          <div className="absolute inset-0.5 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full" style={{
            animation: 'forge-pulse 1.2s ease-in-out infinite'
          }} />
          
          {/* Bubbling lava effect */}
          <div className="absolute bottom-1 left-1.5 w-1.5 h-1.5 bg-yellow-300 rounded-full" style={{
            animation: 'lava-bubble 2s ease-in-out infinite'
          }} />
          <div className="absolute bottom-0.5 right-2 w-1 h-1 bg-orange-300 rounded-full" style={{
            animation: 'lava-bubble 2.5s ease-in-out infinite 0.5s'
          }} />
          <div className="absolute bottom-1.5 left-2.5 w-0.5 h-0.5 bg-yellow-200 rounded-full" style={{
            animation: 'lava-bubble 1.8s ease-in-out infinite 1s'
          }} />
          
          {/* Central white-hot core */}
          <div className="absolute inset-2 bg-gradient-to-br from-yellow-100 via-white to-orange-200 rounded-full opacity-90" style={{
            animation: 'forge-core 0.8s ease-in-out infinite'
          }} />
          
          {/* Flame sparks jumping out */}
          <div className="absolute -top-1 left-2 w-0.5 h-2 bg-gradient-to-t from-orange-400 to-transparent" style={{
            animation: 'flame-spark 1.5s ease-out infinite'
          }} />
          <div className="absolute -top-1 right-1.5 w-0.5 h-1.5 bg-gradient-to-t from-yellow-400 to-transparent" style={{
            animation: 'flame-spark 1.8s ease-out infinite 0.3s'
          }} />
          <div className="absolute -top-0.5 left-3.5 w-0.5 h-1 bg-gradient-to-t from-red-400 to-transparent" style={{
            animation: 'flame-spark 2s ease-out infinite 0.6s'
          }} />
          
          {/* Side flames */}
          <div className="absolute -left-1 top-2 w-1.5 h-2 bg-gradient-to-l from-orange-500 to-transparent rounded-full" style={{
            animation: 'side-flame 1.3s ease-in-out infinite',
            transform: 'rotate(-30deg)'
          }} />
          <div className="absolute -right-1 top-1.5 w-1.5 h-2 bg-gradient-to-r from-yellow-500 to-transparent rounded-full" style={{
            animation: 'side-flame 1.5s ease-in-out infinite 0.4s',
            transform: 'rotate(30deg)'
          }} />
          
          {/* Forge ring - hammered metal edge */}
          <div className="absolute inset-0 rounded-full border-2 border-orange-800/60" style={{
            animation: 'forge-ring 3s linear infinite',
            boxShadow: 'inset 0 0 4px rgba(255,140,0,0.6)'
          }} />
          
          {/* Spark particles */}
          <div className="absolute top-0 left-1/2 w-px h-px bg-yellow-200 rounded-full" style={{
            animation: 'spark-fly 1.2s ease-out infinite'
          }} />
          <div className="absolute top-1 right-1 w-px h-px bg-orange-200 rounded-full" style={{
            animation: 'spark-fly 1.5s ease-out infinite 0.2s'
          }} />
          <div className="absolute top-0.5 left-1 w-px h-px bg-yellow-300 rounded-full" style={{
            animation: 'spark-fly 1.8s ease-out infinite 0.4s'
          }} />
        </div>
        
        {/* Heat distortion effect overlay */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(255,69,0,0.2) 60%, transparent 100%)',
          animation: 'heat-wave 2s ease-in-out infinite'
        }} />
      </div>
      
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
    </div>
  },
  {
    id: 'shadow-monarch',
    name: 'Shadow Monarch',
    description: 'Absolute darkness given form. Light bends away, reality kneels before the void sovereign.',
    price: 1500,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-gray-900 via-black to-purple-900 rounded-full border-2 border-purple-800 shadow-2xl shadow-purple-900/90">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(75,0,130,0.8) 40%, rgba(139,69,19,0.6) 70%, transparent 90%)',
          animation: 'shadow-consume 3s ease-in-out infinite'
        }} />
        <div className="absolute inset-0.5 rounded-full border border-purple-600 opacity-60" style={{animation: 'shadow-ring 4s linear infinite'}} />
        <div className="absolute inset-1 bg-gradient-to-br from-purple-900 via-black to-gray-800 rounded-full" style={{animation: 'shadow-writhe 2.5s ease-in-out infinite'}} />
        <div className="absolute inset-2 bg-black rounded-full" />
        <div className="absolute inset-2.5 bg-purple-900 rounded-full opacity-40" style={{animation: 'shadow-pulse 1.5s ease-in-out infinite'}} />
        <div className="absolute -top-1 left-1/2 w-1 h-3 bg-purple-400 transform -translate-x-1/2 opacity-60" style={{animation: 'shadow-tendril 2s ease-in-out infinite'}} />
        <div className="absolute -bottom-1 left-1/2 w-1 h-3 bg-purple-400 transform -translate-x-1/2 opacity-60" style={{animation: 'shadow-tendril 2s ease-in-out infinite 1s'}} />
      </div>
    </div>
  },
  {
    id: 'prism-matrix',
    name: 'Iridescence',
    description: 'Pure light fractalized into infinite geometries. Every photon tells a different story.',
    price: 600,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-white via-cyan-200 to-pink-200 rounded-full border border-cyan-300 shadow-lg shadow-cyan-300/60">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, rgba(255,0,255,0.6), rgba(0,255,255,0.6), rgba(255,255,0,0.6), rgba(255,0,255,0.6))',
          animation: 'prism-rotate 4s linear infinite'
        }} />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.8) 25%, transparent 30%, transparent 70%, rgba(255,255,255,0.8) 75%, transparent 80%)',
          animation: 'prism-refract 3s ease-in-out infinite'
        }} />
        <div className="absolute inset-1 bg-gradient-to-br from-white via-cyan-100 to-pink-100 rounded-full opacity-80" style={{animation: 'prism-shimmer 2s ease-in-out infinite'}} />
        <div className="absolute inset-2 bg-white rounded-full opacity-90" />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(59,130,246,0.3) 45%, transparent 50%, transparent 60%, rgba(236,72,153,0.3) 65%, transparent 70%)',
          animation: 'prism-spectrum 2.5s ease-in-out infinite'
        }} />
      </div>
    </div>
  },
  {
    id: 'nebula-heart',
    name: 'Nebula Heart',
    description: 'The beating core of a stellar nursery. Where cosmic dust dances into new worlds.',
    price: 550,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 rounded-full shadow-lg shadow-purple-400/60">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(ellipse at 30% 30%, rgba(147,51,234,0.7) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(236,72,153,0.7) 0%, transparent 50%)',
          animation: 'nebula-drift 6s ease-in-out infinite'
        }} />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(59,130,246,0.5) 0%, transparent 40%)',
          animation: 'nebula-drift 5s ease-in-out infinite reverse'
        }} />
        <div className="absolute inset-1 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-full opacity-70" style={{animation: 'nebula-pulse 3s ease-in-out infinite'}} />
        <div className="absolute inset-2 bg-white rounded-full opacity-60" />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at center, transparent 60%, rgba(255,255,255,0.8) 65%, transparent 70%)',
          animation: 'nebula-sparkle 4s ease-in-out infinite'
        }} />
      </div>
    </div>
  },

  // Face Cosmetics
  {
    id: 'happy-face',
    name: 'Happy Face',
    description: 'A cheerful expression that radiates positivity.',
    price: 100,
    category: 'faces',
    rarity: 'common',
    preview: (
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <circle cx="16" cy="20" r="2" fill="black" />
          <circle cx="32" cy="20" r="2" fill="black" />
          <path d="M 12 28 Q 24 36 36 28" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    )
  },
  {
    id: 'cool-face',
    name: 'Cool Face',
    description: 'Too cool for the cosmic school.',
    price: 150,
    category: 'faces',
    rarity: 'rare',
    preview: (
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="18" width="12" height="8" rx="2" fill="black" opacity="0.9" />
          <rect x="28" y="18" width="12" height="8" rx="2" fill="black" opacity="0.9" />
          <rect x="20" y="20" width="8" height="2" fill="black" opacity="0.9" />
          <path d="M 16 32 Q 28 34 32 30" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    )
  },
  {
    id: 'starry-eyes',
    name: 'Starry Eyes',
    description: 'Eyes filled with cosmic wonder.',
    price: 200,
    category: 'faces',
    rarity: 'rare',
    preview: (
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path d="M 16 16 L 17 20 L 20 18 L 17 22 L 16 26 L 15 22 L 12 18 L 15 20 Z" fill="black" />
          <path d="M 32 16 L 33 20 L 36 18 L 33 22 L 32 26 L 31 22 L 28 18 L 31 20 Z" fill="black" />
          <path d="M 12 28 Q 24 38 36 28" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    )
  },
  {
    id: 'winking-face',
    name: 'Winking Face',
    description: 'A playful wink for your cosmic adventures.',
    price: 120,
    category: 'faces',
    rarity: 'common',
    preview: (
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <circle cx="16" cy="20" r="2" fill="black" />
          <path d="M 28 20 L 36 20" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <path d="M 14 28 Q 24 34 34 28" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    )
  },
  {
    id: 'thinking-face',
    name: 'Thinking Face',
    description: 'For when you\'re pondering the mysteries of the universe.',
    price: 180,
    category: 'faces',
    rarity: 'rare',
    preview: (
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path d="M 10 16 Q 16 14 20 16" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="15" cy="22" r="2" fill="black" />
          <circle cx="32" cy="20" r="2" fill="black" />
          <path d="M 16 32 L 28 32" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="36" r="3" fill="none" stroke="black" strokeWidth="1.5" />
        </svg>
      </div>
    )
  },
  {
    id: 'cosmic-face',
    name: 'Cosmic Face',
    description: 'A face touched by the stars themselves.',
    price: 500,
    category: 'faces',
    rarity: 'legendary',
    preview: (
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <defs>
            <radialGradient id="cosmicGradShop">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
          <path d="M 16 16 L 18 22 L 24 20 L 18 24 L 16 30 L 14 24 L 8 20 L 14 22 Z" fill="url(#cosmicGradShop)" />
          <path d="M 32 16 L 34 22 L 40 20 L 34 24 L 32 30 L 30 24 L 24 20 L 30 22 Z" fill="url(#cosmicGradShop)" />
          <path d="M 12 30 Q 24 36 36 30" stroke="url(#cosmicGradShop)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="10" cy="12" r="1" fill="white" opacity="0.8" />
          <circle cx="38" cy="10" r="1" fill="white" opacity="0.8" />
          <circle cx="40" cy="36" r="1" fill="white" opacity="0.8" />
          <circle cx="8" cy="38" r="1" fill="white" opacity="0.8" />
        </svg>
      </div>
    )
  },

  // Aura System
  {
    id: 'none',
    name: 'No Aura',
    description: 'Clean and minimal appearance with no aura effects.',
    price: 0,
    category: 'auras',
    rarity: 'common',
    preview: <div className="w-8 h-8 bg-white rounded-full" />,
    owned: true
  },
  {
    id: 'cosmic-aurora',
    name: 'Cosmic Aurora',
    description: 'Classic orange cosmic glow that pulses with universal energy.',
    price: 50,
    category: 'auras',
    rarity: 'common',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-orange-400/30 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'stellar-blue',
    name: 'Stellar Blue',
    description: 'Deep blue stellar energy that resonates with distant stars.',
    price: 150,
    category: 'auras',
    rarity: 'rare',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-blue-400/40 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-cyan-300/25 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'mystic-purple',
    name: 'Mystic Purple',
    description: 'Mysterious purple void energy from the cosmic depths.',
    price: 300,
    category: 'auras',
    rarity: 'epic',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-purple-500/35 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-indigo-400/22 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'emerald-life',
    name: 'Emerald Life',
    description: 'Vibrant green life force that pulses with natural energy.',
    price: 200,
    category: 'auras',
    rarity: 'rare',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-emerald-500/38 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-green-400/24 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    description: 'Fiery red burning energy that flickers with intense heat.',
    price: 350,
    category: 'auras',
    rarity: 'epic',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-red-500/42 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-orange-400/28 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'golden-majesty',
    name: 'Midas',
    description: 'Royal golden radiance that shines with divine light.',
    price: 600,
    category: 'auras',
    rarity: 'legendary',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-yellow-400/45 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-amber-300/30 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'frost-crystal',
    name: 'Frost Crystal',
    description: 'Icy crystalline aura that sparkles with frozen beauty.',
    price: 250,
    category: 'auras',
    rarity: 'rare',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-cyan-400/40 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-blue-200/25 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'void-darkness',
    name: 'Void Darkness',
    description: 'Dark matter distortion field that bends reality itself.',
    price: 800,
    category: 'auras',
    rarity: 'legendary',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-gray-600/50 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-purple-900/35 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'rainbow-prism',
    name: 'Rainbow Prism',
    description: 'Prismatic light spectrum that cycles through rainbow colors.',
    price: 1000,
    category: 'auras',
    rarity: 'legendary',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-pink-400/35 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-11 h-11 -top-1.5 -left-1.5 border border-purple-400/30 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-blue-400/25 rounded-full animate-pulse" />
    </div>
  },
  {
    id: 'plasma-storm',
    name: 'Plasma Storm',
    description: 'Chaotic electrical energy that crackles with unstable power.',
    price: 1200,
    category: 'auras',
    rarity: 'legendary',
    preview: <div className="relative w-8 h-8">
      <div className="w-8 h-8 bg-white rounded-full" />
      <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-pink-500/40 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-11 h-11 -top-1.5 -left-1.5 border border-purple-400/30 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-14 h-14 -top-3 -left-3 border border-blue-300/20 rounded-full animate-pulse" />
    </div>
  },

  // Crowns/Accessories
  {
    id: 'hard-hat',
    name: 'Hard Hat',
    description: 'Safety first! A sturdy construction helmet for cosmic builders.',
    price: 150,
    category: 'crowns',
    rarity: 'common',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-white rounded-full relative">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-yellow-500 rounded-t-lg border-2 border-yellow-600">
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-yellow-300"></div>
        </div>
      </div>
    </div>
  },


  // Treasures (special earned items)
  {
    id: 'aegis-exo',
    name: '⚙️ Aegis Exo',
    description: 'The Soul of Armor. This is not for battle. This is for standing where you once fled.',
    price: 0,
    category: 'treasures',
    rarity: 'legendary',
    icon: <Shield className="w-5 h-5" />,
    locked: true,
    unlockCondition: 'Complete 7 consecutive days of learning'
  }
]

const categories = [
  { id: 'all', name: 'Featured', icon: ShoppingBag },
  { id: 'singularity', name: 'Styles', icon: Circle },
  { id: 'auras', name: 'Auras', icon: Zap },
  { id: 'crowns', name: 'Accessories', icon: Crown },
  { id: 'faces', name: 'Faces', icon: Smile },
  { id: 'treasures', name: 'Treasures', icon: Shield }
]

const rarityColors = {
  common: 'border-gray-400 text-gray-400',
  rare: 'border-blue-400 text-blue-400', 
  epic: 'border-purple-400 text-purple-400',
  legendary: 'border-yellow-400 text-yellow-400'
}

function ShopContent() {
  const router = useRouter()
  const { profile } = useProfile()
  const { goToProfile } = useProfileNavigation()
  const { 
    purchaseCosmetic, 
    equipCosmetic, 
    unequipCosmetic, 
    isOwned, 
    isEquipped,
    loading,
    equippedSingularity,
    equippedAura,
    forceUpdate
  } = useCosmetics()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Helper function to map shop categories to cosmetics hook types
  const getCosmeticType = (category: string) => {
    switch (category) {
      case 'faces': return 'face'
      case 'auras': return 'aura'
      case 'singularity': return 'singularity'
      case 'crowns': return 'crown'
      default: return category
    }
  }


  const featuredItemIds = ['stellar-core', 'cosmic-glow', 'void-essence', 'prism-matrix']
  
  const filteredItems = selectedCategory === 'all' 
    ? shopItems.filter(item => featuredItemIds.includes(item.id))
    : shopItems.filter(item => item.category === selectedCategory)

  const handlePurchase = async (item: ShopItem) => {
    if (!profile || profile.stardust < item.price || isOwned(item.id) || loading) return

    setActionLoading(item.id)
    const result = await purchaseCosmetic(item.id, item.price)
    
    if (result.success) {
      setPurchaseSuccess(item.name)
      setTimeout(() => setPurchaseSuccess(null), 3000)
    } else {
      alert(result.error || 'Purchase failed')
    }
    
    setActionLoading(null)
  }

  const handleEquip = async (item: ShopItem) => {
    const alwaysOwned = ['none', 'cosmic-aurora', 'classic-singularity']
    if (!(isOwned(item.id) || item.owned || alwaysOwned.includes(item.id)) || loading) return

    setActionLoading(item.id)
    const cosmeticType = getCosmeticType(item.category)
    const result = await equipCosmetic(item.id, cosmeticType)
    
    if (!result.success) {
      alert(result.error || 'Failed to equip item')
    }
    
    setActionLoading(null)
  }

  const handleUnequip = async (item: ShopItem) => {
    const cosmeticType = getCosmeticType(item.category)
    if (!isEquipped(item.id, cosmeticType) || loading) return

    setActionLoading(item.id)
    const result = await unequipCosmetic(item.id, cosmeticType)
    
    if (!result.success) {
      alert(result.error || 'Failed to unequip item')
    }
    
    setActionLoading(null)
  }

  return (
    <div className="min-h-screen relative bg-black">
      {/* Cosmic Background - same as home page */}
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <CosmicBackground 
          intensity="low" 
          enableMeteors={false}
          enableNebula={false}
          enablePlanets={false}
        />
      </ClientOnly>
      
      {/* Subtle dark gradient overlay with purple tint for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-indigo-950/30 pointer-events-none z-10" />
      
      <TopNavigationBar />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {/* Enhanced Avatar */}
            <m.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto mb-2 inline-block"
              style={{ padding: '40px' }}
            >
              <EquippedAvatar 
                key={`${equippedSingularity}-${equippedAura}`}
                size="xl" 
                showPulse={true} 
                showAura={true}
                showEffects={true}
                clickable={true}
                onClick={() => goToProfile()}
              />
            </m.div>
            <h1 className="text-5xl md:text-7xl font-bold text-white cosmic-heading">
              Shop
            </h1>
          </m.div>
        </div>


        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-black/40 border border-white/20 rounded-2xl p-2">
            {categories.map((category) => (
              <m.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <category.icon className="w-5 h-5" />
                {category.name}
              </m.button>
            ))}
          </div>
        </div>

        {/* Shop Items Grid */}
        <m.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <m.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.03, ease: "easeOut" }}
                className={`glass-morphism rounded-2xl p-6 border-2 ${rarityColors[item.rarity]} hover:shadow-lg relative`}
              >
                {/* Item Preview - Much Larger */}
                <div className="flex justify-center mb-4 py-4">
                  <div className="w-32 h-32 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center transform scale-150">
                    {item.preview || item.icon || <EquippedAvatar size="lg" showPulse={false} showAura={false} showEffects={false} />}
                  </div>
                </div>

                {/* Rarity Badge - Below preview */}
                <div className="flex justify-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rarityColors[item.rarity]} bg-black/80 backdrop-blur-sm`}>
                    {item.rarity.toUpperCase()}
                  </span>
                </div>

                {/* Item Info - No Description */}
                <div className="text-center mb-4">
                  <h3 className="text-white font-bold text-lg">{item.name}</h3>
                </div>


                {/* Price & Purchase */}
                <div className="space-y-3">
                  {item.category === 'treasures' && item.locked ? (
                    <>
                      <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold">
                        <Lock className="w-4 h-4" />
                        <span>Treasure</span>
                      </div>
                      <div className="py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 font-medium text-center text-sm">
                        <Lock className="w-4 h-4 mx-auto mb-1" />
                        <div className="px-2">
                          {item.unlockCondition || 'Unlock condition hidden'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-cosmic-stardust/30 rounded-lg">
                        <Star className="w-4 h-4 text-cosmic-stardust fill-cosmic-stardust drop-shadow-[0_0_4px_rgba(241,196,64,0.5)]" />
                        <span className="text-cosmic-stardust font-bold font-mono">{item.price.toLocaleString()}</span>
                      </div>

                      {isOwned(item.id) || item.owned || ['none', 'cosmic-aurora', 'classic-singularity'].includes(item.id) ? (
                        isEquipped(item.id, getCosmeticType(item.category)) || (item.id === 'classic-singularity' && !profile?.equipped_singularity) ? (
                          <div className="flex items-center justify-center gap-2 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-medium">
                            <Check className="w-4 h-4" />
                            Equipped
                          </div>
                        ) : (
                          <m.button
                            onClick={() => handleEquip(item)}
                            disabled={actionLoading === item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            {actionLoading === item.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            {actionLoading === item.id ? 'Equipping...' : 'Equip'}
                          </m.button>
                        )
                      ) : (
                        <m.button
                          onClick={() => handlePurchase(item)}
                          disabled={!profile || profile.stardust < item.price || actionLoading === item.id}
                          whileHover={{ scale: profile && profile.stardust >= item.price && !actionLoading ? 1.05 : 1 }}
                          whileTap={{ scale: profile && profile.stardust >= item.price && !actionLoading ? 0.95 : 1 }}
                          className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            profile && profile.stardust >= item.price && !actionLoading
                              ? 'bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          {actionLoading === item.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Purchasing...
                            </>
                          ) : profile && profile.stardust >= item.price ? (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              Purchase
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Insufficient Stardust
                            </>
                          )}
                        </m.button>
                      )}
                    </>
                  )}
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>

        {/* Purchase Success Toast */}
        <AnimatePresence>
          {purchaseSuccess && (
            <m.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-8 right-8 bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-400 font-medium flex items-center gap-3 shadow-lg z-50"
            >
              <Check className="w-5 h-5" />
              <span>Successfully purchased {purchaseSuccess}!</span>
            </m.div>
          )}
        </AnimatePresence>

        {/* Shop Footer */}
        <div className="text-center mt-16 text-white/60">
          <p className="mb-2">✨ Earn more stardust by completing lessons and achieving perfect quiz scores!</p>
          <p className="text-sm">New cosmic items added regularly • All purchases are cosmetic only</p>
        </div>
      </div>

    </div>
  )
}

export default function ShopPage() {
  return (
    <ProtectedRoute>
      <ShopContent />
    </ProtectedRoute>
  )
}