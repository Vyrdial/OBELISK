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
  category: 'singularity' | 'faces' | 'auras' | 'titles' | 'treasures' | 'crowns'
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
    name: 'Classic Singularity',
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
    name: 'Cosmic Glow',
    description: 'Deep space energy radiates from within. Pulsing with the heartbeat of the universe.',
    price: 150,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg shadow-purple-400/60" />
    </div>
  },
  {
    id: 'stellar-core',
    name: 'Stellar Core',
    description: 'Radiates stellar power. Your avatar and nodes glow with the intensity of a thousand stars.',
    price: 300,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/80">
        <Star className="absolute top-0 left-1 w-2 h-2 text-white animate-pulse" style={{animation: 'star-shimmer 2s ease-in-out infinite'}} />
        <Star className="absolute top-1 right-0 w-1.5 h-1.5 text-yellow-200 animate-pulse" style={{animation: 'star-shimmer 1.5s ease-in-out infinite 0.3s'}} />
        <Star className="absolute bottom-0 left-2 w-1 h-1 text-white animate-pulse" style={{animation: 'star-shimmer 1.8s ease-in-out infinite 0.6s'}} />
        <Star className="absolute bottom-1 right-1 w-1 h-1 text-yellow-200 animate-pulse" style={{animation: 'star-shimmer 1.2s ease-in-out infinite 0.2s'}} />
        <Star className="absolute top-2 left-0 w-1 h-1 text-white animate-pulse" style={{animation: 'star-shimmer 1.6s ease-in-out infinite 0.8s'}} />
      </div>
    </div>
  },
  {
    id: 'void-essence',
    name: 'Void Essence',
    description: 'Mysterious dark singularity. Your avatar and nodes bend light itself with purple void energy.',
    price: 500,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-purple-900 rounded-full border-2 border-purple-400 animate-pulse shadow-lg shadow-purple-400/60" />
    </div>
  },
  {
    id: 'golden-majesty',
    name: 'Golden Majesty',
    description: 'Pure golden radiance. Transform your avatar and all nodes into gleaming celestial gold.',
    price: 400,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-yellow-300 shadow-lg shadow-yellow-500/60" />
    </div>
  },
  {
    id: 'crystal-essence',
    name: 'Crystal Essence',
    description: 'Crystalline perfection. Your avatar and nodes become crystalline structures that refract cosmic light.',
    price: 600,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-cyan-400 rounded-full border-2 border-cyan-200 animate-pulse shadow-lg shadow-cyan-400/60" />
    </div>
  },
  {
    id: 'plasma-core',
    name: 'Plasma Core',
    description: 'Chaotic plasma energy. Your avatar and nodes vibrate with unstable cosmic force.',
    price: 800,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-pink-300 shadow-lg shadow-pink-500/60" style={{animation: 'vibrate 0.3s linear infinite'}} />
    </div>
  },
  {
    id: 'aurora',
    name: 'Borealis Crown',
    description: 'Dancing northern lights. Your avatar and nodes shimmer with shifting aurora colors.',
    price: 350,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="w-8 h-8 bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
    </div>
  },
  {
    id: 'lightning',
    name: 'Voltaic Surge',
    description: 'Electric storm energy. Your avatar and nodes crackle with pure electrical power.',
    price: 450,
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
    price: 400,
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
    price: 250,
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
    price: 200,
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
    price: 300,
    category: 'singularity',
    rarity: 'rare',
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
    price: 180,
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
    price: 220,
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
    price: 280,
    category: 'singularity',
    rarity: 'rare',
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
    price: 750,
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
    price: 950,
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
    price: 850,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 bg-gradient-to-br from-orange-400 via-red-500 to-yellow-300 rounded-full shadow-2xl shadow-orange-500/80">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at center, rgba(255,69,0,0.9) 0%, rgba(255,140,0,0.7) 30%, rgba(255,215,0,0.5) 60%, transparent 80%)',
          animation: 'forge-burn 2s ease-in-out infinite'
        }} />
        <div className="absolute inset-0 rounded-full border-2 border-yellow-300" style={{animation: 'forge-ring 3s linear infinite'}} />
        <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 rounded-full" style={{animation: 'forge-core 1.5s ease-in-out infinite'}} />
        <div className="absolute inset-2 bg-white rounded-full opacity-80" style={{animation: 'forge-heart 1s ease-in-out infinite'}} />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 0deg, transparent 80%, rgba(255,215,0,0.8) 85%, transparent 90%)',
          animation: 'forge-spark 2s linear infinite'
        }} />
      </div>
    </div>
  },
  {
    id: 'shadow-monarch',
    name: 'Shadow Monarch',
    description: 'Absolute darkness given form. Light bends away, reality kneels before the void sovereign.',
    price: 1200,
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
    name: 'Prism Matrix',
    description: 'Pure light fractalized into infinite geometries. Every photon tells a different story.',
    price: 680,
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
    price: 420,
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
    name: 'Golden Majesty',
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

  // Titles
  {
    id: 'null-seeker',
    name: 'Null Seeker',
    description: 'For those who understand the void.',
    price: 75,
    category: 'titles',
    rarity: 'common',
    icon: <Circle className="w-5 h-5" />
  },
  {
    id: 'systems-sage',
    name: 'Systems Sage',
    description: 'Master of interconnected knowledge.',
    price: 200,
    category: 'titles',
    rarity: 'rare',
    icon: <Crown className="w-5 h-5" />
  },
  {
    id: 'cosmic-architect',
    name: 'Cosmic Architect',
    description: 'Builder of universal understanding.',
    price: 500,
    category: 'titles',
    rarity: 'legendary',
    icon: <Diamond className="w-5 h-5" />
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
  { id: 'treasures', name: 'Treasures', icon: Shield },
  { id: 'titles', name: 'Titles', icon: Diamond }
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
      case 'titles': return 'title'
      case 'crowns': return 'crown'
      default: return category
    }
  }


  const featuredItemIds = ['flame', 'lightning', 'plasma-core', 'void-essence']
  
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
              className="relative mx-auto mb-8 inline-block"
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
            <h1 className="text-5xl md:text-7xl font-bold text-white cosmic-heading mb-4">
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
                {/* Rarity Badge - Top Left */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${rarityColors[item.rarity]} bg-black/60`}>
                    {item.rarity.toUpperCase()}
                  </span>
                </div>

                {/* Item Preview */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                    {item.preview || item.icon || <EquippedAvatar size="md" showPulse={false} showAura={false} showEffects={false} />}
                  </div>
                </div>

                {/* Item Info */}
                <div className="text-center mb-4">
                  <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
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
                      <div className="flex items-center justify-center gap-2 text-cosmic-starlight font-bold">
                        <Sparkles className="w-4 h-4" />
                        <span>{item.price} Stardust</span>
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