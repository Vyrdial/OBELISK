'use client'

import React from 'react'
import { Star } from 'lucide-react'
import EquippedAvatar from '@/components/ui/EquippedAvatar'

interface ShopItemPreviewProps {
  itemId: string
  category: string
}

export default function ShopItemPreview({ itemId, category }: ShopItemPreviewProps) {
  // Singularity previews
  if (category === 'singularity') {
    switch (itemId) {
      case 'classic-singularity':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
        )
      
      case 'cosmic-glow':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg shadow-purple-400/60" />
          </div>
        )
      
      case 'stellar-core':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/80">
              <Star className="absolute top-0 left-1 w-2 h-2 text-white animate-pulse" />
              <Star className="absolute top-1 right-0 w-1.5 h-1.5 text-yellow-200 animate-pulse" />
              <Star className="absolute bottom-0 left-2 w-1 h-1 text-white animate-pulse" />
              <Star className="absolute bottom-1 right-1 w-1 h-1 text-yellow-200 animate-pulse" />
              <Star className="absolute top-2 left-0 w-1 h-1 text-white animate-pulse" />
            </div>
          </div>
        )
      
      case 'void-essence':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-900 rounded-full border-2 border-purple-400 animate-pulse shadow-lg shadow-purple-400/60" />
          </div>
        )
      
      case 'golden-majesty':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-yellow-300 shadow-lg shadow-yellow-500/60" />
          </div>
        )
      
      case 'crystal-essence':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-cyan-400 rounded-full border-2 border-cyan-200 animate-pulse shadow-lg shadow-cyan-400/60" />
          </div>
        )
      
      case 'plasma-core':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-pink-300 shadow-lg shadow-pink-500/60 animate-pulse" />
          </div>
        )
      
      case 'aurora':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
          </div>
        )
      
      case 'lightning':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-r from-blue-300 to-white rounded-full border-2 border-blue-200 shadow-lg shadow-blue-300/80 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
            </div>
          </div>
        )
      
      case 'flame':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 rounded-full shadow-lg shadow-orange-400/70 overflow-hidden">
              <div className="absolute inset-0 bg-red-600 rounded-full" />
              <div className="absolute inset-0.5 bg-orange-500 rounded-full animate-pulse" />
              <div className="absolute inset-1 bg-yellow-400 rounded-full animate-pulse" />
              <div className="absolute inset-1.5 bg-yellow-200 rounded-full opacity-80" />
              <div className="absolute inset-2 bg-white rounded-full opacity-60" />
            </div>
          </div>
        )
      
      case 'frost':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-blue-200 via-cyan-300 to-white rounded-full shadow-lg shadow-cyan-300/60">
              <div className="absolute inset-1 bg-gradient-to-br from-cyan-100 to-white rounded-full opacity-80" />
              <div className="absolute inset-0 rounded-full border border-cyan-200" />
              <div className="absolute inset-2 bg-white rounded-full opacity-70" />
            </div>
          </div>
        )
      
      case 'grass':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full shadow-lg shadow-green-400/60">
              <div className="absolute inset-1 bg-gradient-to-br from-green-300 to-green-400 rounded-full" />
              <div className="absolute inset-2 bg-green-200 rounded-full opacity-70" />
              <div className="absolute inset-3 bg-green-100 rounded-full opacity-50" />
            </div>
          </div>
        )
      
      case 'wind':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-gray-200 via-white to-gray-100 rounded-full shadow-lg shadow-gray-300/50 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
            </div>
          </div>
        )
      
      case 'sand':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200 rounded-full shadow-lg shadow-amber-300/50 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-40 animate-pulse" />
            </div>
          </div>
        )
      
      case 'stone':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-lg shadow-gray-500/60 border border-gray-300">
              <div className="absolute inset-1 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full opacity-80" />
              <div className="absolute inset-2 bg-gray-200 rounded-full opacity-60" />
              <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-90" />
              <div className="absolute bottom-2 right-1.5 w-0.5 h-0.5 bg-gray-100 rounded-full" />
              <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-white rounded-full opacity-70" />
              <div className="absolute bottom-1 left-2.5 w-0.5 h-0.5 bg-gray-100 rounded-full opacity-80" />
            </div>
          </div>
        )
      
      case 'leaf':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-green-300 via-emerald-400 to-green-500 rounded-full shadow-lg shadow-emerald-400/60 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-emerald-500 to-transparent opacity-50 animate-pulse" />
              <div className="absolute inset-1 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full opacity-70" />
              <div className="absolute top-1.5 left-2 w-1 h-2 bg-green-600 rounded-full opacity-60 transform rotate-45" />
              <div className="absolute top-2.5 left-3 w-0.5 h-1.5 bg-green-600 rounded-full opacity-50 transform rotate-45" />
              <div className="absolute top-3 left-1.5 w-0.5 h-1 bg-green-600 rounded-full opacity-40 transform rotate-45" />
            </div>
          </div>
        )
      
      case 'quantum-nexus':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-cyan-200 via-blue-400 to-purple-600 rounded-full border-2 border-cyan-300 shadow-2xl shadow-cyan-400/80 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
              <div className="absolute inset-1 bg-gradient-to-br from-white via-cyan-100 to-blue-200 rounded-full opacity-60" />
              <div className="absolute inset-2 bg-white rounded-full opacity-80" />
            </div>
          </div>
        )
      
      case 'temporal-vortex':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 rounded-full shadow-2xl shadow-purple-500/70 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-transparent to-pink-600 animate-pulse" />
              <div className="absolute inset-1.5 bg-gradient-to-br from-purple-200 via-pink-300 to-indigo-200 rounded-full opacity-70" />
              <div className="absolute inset-2.5 bg-white rounded-full opacity-90" />
              <div className="absolute inset-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full" />
            </div>
          </div>
        )
      
      case 'cosmic-forge':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-orange-400 via-red-500 to-yellow-300 rounded-full shadow-2xl shadow-orange-500/80 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-transparent to-yellow-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-yellow-300" />
              <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 rounded-full" />
              <div className="absolute inset-2 bg-white rounded-full opacity-80" />
            </div>
          </div>
        )
      
      case 'shadow-monarch':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-gray-900 via-black to-purple-900 rounded-full border-2 border-purple-800 shadow-2xl shadow-purple-900/90 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-900 via-transparent to-black animate-pulse" />
              <div className="absolute inset-0.5 rounded-full border border-purple-600 opacity-60" />
              <div className="absolute inset-1 bg-gradient-to-br from-purple-900 via-black to-gray-800 rounded-full" />
              <div className="absolute inset-2 bg-black rounded-full" />
              <div className="absolute inset-2.5 bg-purple-900 rounded-full opacity-40" />
            </div>
          </div>
        )
      
      case 'prism-matrix':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-white via-cyan-200 to-pink-200 rounded-full border border-cyan-300 shadow-lg shadow-cyan-300/60 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-300 via-cyan-300 to-yellow-300 opacity-60 animate-pulse" />
              <div className="absolute inset-1 bg-gradient-to-br from-white via-cyan-100 to-pink-100 rounded-full opacity-80" />
              <div className="absolute inset-2 bg-white rounded-full opacity-90" />
            </div>
          </div>
        )
      
      case 'nebula-heart':
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-8 h-8 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 rounded-full shadow-lg shadow-purple-400/60 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-transparent to-pink-500 opacity-70 animate-pulse" />
              <div className="absolute inset-1 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-full opacity-70" />
              <div className="absolute inset-2 bg-white rounded-full opacity-60" />
            </div>
          </div>
        )
    }
  }
  
  // Face previews
  if (category === 'faces') {
    switch (itemId) {
      case 'happy-face':
        return (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <circle cx="16" cy="20" r="2" fill="black" />
              <circle cx="32" cy="20" r="2" fill="black" />
              <path d="M 12 28 Q 24 36 36 28" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )
      
      case 'cool-face':
        return (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="18" width="12" height="8" rx="2" fill="black" opacity="0.9" />
              <rect x="28" y="18" width="12" height="8" rx="2" fill="black" opacity="0.9" />
              <rect x="20" y="20" width="8" height="2" fill="black" opacity="0.9" />
              <path d="M 16 32 Q 28 34 32 30" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )
      
      case 'starry-eyes':
        return (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <path d="M 16 16 L 17 20 L 20 18 L 17 22 L 16 26 L 15 22 L 12 18 L 15 20 Z" fill="black" />
              <path d="M 32 16 L 33 20 L 36 18 L 33 22 L 32 26 L 31 22 L 28 18 L 31 20 Z" fill="black" />
              <path d="M 12 28 Q 24 38 36 28" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )
      
      case 'winking-face':
        return (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <circle cx="16" cy="20" r="2" fill="black" />
              <path d="M 28 20 L 36 20" stroke="black" strokeWidth="2" strokeLinecap="round" />
              <path d="M 14 28 Q 24 34 34 28" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )
      
      case 'thinking-face':
        return (
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
      
      case 'cosmic-face':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <defs>
                <radialGradient id="cosmicGradShopPreview">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </radialGradient>
              </defs>
              <path d="M 16 16 L 18 22 L 24 20 L 18 24 L 16 30 L 14 24 L 8 20 L 14 22 Z" fill="url(#cosmicGradShopPreview)" />
              <path d="M 32 16 L 34 22 L 40 20 L 34 24 L 32 30 L 30 24 L 24 20 L 30 22 Z" fill="url(#cosmicGradShopPreview)" />
              <path d="M 12 30 Q 24 36 36 30" stroke="url(#cosmicGradShopPreview)" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="10" cy="12" r="1" fill="white" opacity="0.8" />
              <circle cx="38" cy="10" r="1" fill="white" opacity="0.8" />
              <circle cx="40" cy="36" r="1" fill="white" opacity="0.8" />
              <circle cx="8" cy="38" r="1" fill="white" opacity="0.8" />
            </svg>
          </div>
        )
    }
  }
  
  // Aura previews
  if (category === 'auras') {
    switch (itemId) {
      case 'none':
        return <div className="w-8 h-8 bg-white rounded-full" />
      
      case 'cosmic-aurora':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-orange-400/30 rounded-full animate-pulse" />
          </div>
        )
      
      case 'stellar-blue':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-blue-400/40 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-cyan-300/25 rounded-full animate-pulse" />
          </div>
        )
      
      case 'mystic-purple':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-purple-500/35 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-indigo-400/22 rounded-full animate-pulse" />
          </div>
        )
      
      case 'emerald-life':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-emerald-500/38 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-green-400/24 rounded-full animate-pulse" />
          </div>
        )
      
      case 'crimson-flame':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-red-500/42 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-orange-400/28 rounded-full animate-pulse" />
          </div>
        )
      
      case 'golden-majesty':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-yellow-400/45 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-amber-300/30 rounded-full animate-pulse" />
          </div>
        )
      
      case 'frost-crystal':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-cyan-400/40 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-blue-200/25 rounded-full animate-pulse" />
          </div>
        )
      
      case 'void-darkness':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-gray-600/50 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-purple-900/35 rounded-full animate-pulse" />
          </div>
        )
      
      case 'rainbow-prism':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-pink-400/35 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-11 h-11 -top-1.5 -left-1.5 border border-purple-400/30 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 -top-2 -left-2 border border-blue-400/25 rounded-full animate-pulse" />
          </div>
        )
      
      case 'plasma-storm':
        return (
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-white rounded-full" />
            <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 border border-pink-500/40 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-11 h-11 -top-1.5 -left-1.5 border border-purple-400/30 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-14 h-14 -top-3 -left-3 border border-blue-300/20 rounded-full animate-pulse" />
          </div>
        )
    }
  }
  
  // Crowns/accessories
  if (category === 'crowns') {
    switch (itemId) {
      case 'hard-hat':
        return (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-yellow-500 rounded-t-lg border-2 border-yellow-600">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-yellow-300"></div>
              </div>
            </div>
          </div>
        )
    }
  }
  
  // Default fallback
  return <EquippedAvatar size="md" showPulse={false} showAura={false} showEffects={false} />
}