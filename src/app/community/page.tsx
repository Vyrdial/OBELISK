'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, ShoppingBag, Star, Palette, 
  Zap, Crown, Diamond, Gem, Circle,
  Check, X, ArrowRight, Shield, Lock
} from 'lucide-react'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import StardustCounter from '@/components/ui/StardustCounter'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useProfile } from '@/hooks/useProfile'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: 'avatar' | 'nodes' | 'effects' | 'titles' | 'treasures'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon?: React.ReactNode
  preview?: React.ReactNode
  owned?: boolean
  equipped?: boolean
  locked?: boolean
  unlockCondition?: string
}

const shopItems: ShopItem[] = [
  // Avatar Dots (character singularities)
  {
    id: 'classic-dot',
    name: 'Classic Singularity',
    description: 'The pure, timeless dot. Simple perfection.',
    price: 0,
    category: 'avatar',
    rarity: 'common',
    preview: <div className="w-6 h-6 bg-white rounded-full" />,
    owned: true,
    equipped: true
  },
  {
    id: 'cosmic-glow',
    name: 'Cosmic Glow',
    description: 'A shimmering dot with ethereal cosmic energy.',
    price: 150,
    category: 'avatar',
    rarity: 'rare',
    preview: <div className="w-6 h-6 bg-cosmic-aurora rounded-full animate-pulse shadow-lg shadow-cosmic-aurora/50" />
  },
  {
    id: 'stellar-core',
    name: 'Stellar Core',
    description: 'Radiates the power of a thousand stars.',
    price: 300,
    category: 'avatar',
    rarity: 'epic',
    preview: <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
  },
  {
    id: 'void-essence',
    name: 'Void Essence',
    description: 'A mysterious dark singularity that bends light.',
    price: 500,
    category: 'avatar',
    rarity: 'legendary',
    preview: <div className="w-6 h-6 bg-purple-900 rounded-full border-2 border-purple-400 animate-pulse shadow-lg shadow-purple-400/60" />
  },

  // Node Cosmetics
  {
    id: 'golden-nodes',
    name: 'Golden Nodes',
    description: 'Transform all lesson nodes into gleaming gold.',
    price: 200,
    category: 'nodes',
    rarity: 'rare',
    preview: <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-yellow-300" />
  },
  {
    id: 'crystal-nodes',
    name: 'Crystal Nodes',
    description: 'Crystalline structures that refract cosmic light.',
    price: 350,
    category: 'nodes',
    rarity: 'epic',
    preview: <div className="w-5 h-5 bg-cyan-400 rounded-full border-2 border-cyan-200 animate-pulse" />
  },
  {
    id: 'plasma-nodes',
    name: 'Plasma Nodes',
    description: 'Supercharged plasma energy contained in perfect spheres.',
    price: 600,
    category: 'nodes',
    rarity: 'legendary',
    preview: <div className="w-5 h-5 bg-pink-500 rounded-full border-2 border-pink-300 animate-bounce" />
  },

  // Visual Effects
  {
    id: 'stardust-trail',
    name: 'Stardust Trail',
    description: 'Leave a trail of stardust wherever you go.',
    price: 100,
    category: 'effects',
    rarity: 'common',
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 'quantum-ripples',
    name: 'Quantum Ripples',
    description: 'Reality ripples around your singularity.',
    price: 250,
    category: 'effects',
    rarity: 'rare',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'cosmic-aura',
    name: 'Cosmic Aura',
    description: 'An otherworldly aura that pulses with universal energy.',
    price: 400,
    category: 'effects',
    rarity: 'epic',
    icon: <Star className="w-5 h-5" />
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
  { id: 'all', name: 'All Items', icon: ShoppingBag },
  { id: 'avatar', name: 'Avatar Dots', icon: Circle },
  { id: 'nodes', name: 'Node Styles', icon: Gem },
  { id: 'effects', name: 'Visual Effects', icon: Sparkles },
  { id: 'titles', name: 'Titles', icon: Crown },
  { id: 'treasures', name: 'Treasures', icon: Shield }
]

const rarityColors = {
  common: 'border-gray-400 text-gray-400',
  rare: 'border-blue-400 text-blue-400', 
  epic: 'border-purple-400 text-purple-400',
  legendary: 'border-yellow-400 text-yellow-400'
}

function ShopContent() {
  const { profile, addStardust } = useProfile()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null)

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory)

  const handlePurchase = async (item: ShopItem) => {
    if (!profile || profile.stardust < item.price) return

    // Simulate purchase
    await addStardust(-item.price)
    setPurchaseSuccess(item.name)
    setTimeout(() => setPurchaseSuccess(null), 3000)
  }

  return (
    <div className="min-h-screen relative">
      <TopNavigationBar />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cosmic-aurora to-cosmic-starlight shadow-lg shadow-cosmic-aurora/30 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white cosmic-heading mb-4">
              Cosmic Shop
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">
              Customize your singularity and enhance your cosmic journey with exclusive cosmetics
            </p>
          </m.div>

          {/* Stardust Display */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-black/40 border border-cosmic-starlight/30 rounded-full px-6 py-3"
          >
            <StardustCounter />
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
                    ? 'bg-cosmic-aurora text-white shadow-lg'
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
                className={`glass-morphism rounded-2xl p-6 border-2 transition-all duration-300 ${rarityColors[item.rarity]} hover:shadow-lg`}
              >
                {/* Item Preview */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                    {item.preview || item.icon || <Circle className="w-8 h-8 text-white/60" />}
                  </div>
                </div>

                {/* Item Info */}
                <div className="text-center mb-4">
                  <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                </div>

                {/* Rarity Badge */}
                <div className="flex justify-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${rarityColors[item.rarity]} bg-black/40`}>
                    {item.rarity.toUpperCase()}
                  </span>
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

                      {item.owned ? (
                        item.equipped ? (
                          <div className="flex items-center justify-center gap-2 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-medium">
                            <Check className="w-4 h-4" />
                            Equipped
                          </div>
                        ) : (
                          <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-2 bg-cosmic-aurora/20 border border-cosmic-aurora/50 rounded-lg text-cosmic-aurora font-medium hover:bg-cosmic-aurora/30 transition-colors"
                          >
                            Equip
                          </m.button>
                        )
                      ) : (
                        <m.button
                          onClick={() => handlePurchase(item)}
                          disabled={!profile || profile.stardust < item.price}
                          whileHover={{ scale: profile && profile.stardust >= item.price ? 1.05 : 1 }}
                          whileTap={{ scale: profile && profile.stardust >= item.price ? 0.95 : 1 }}
                          className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            profile && profile.stardust >= item.price
                              ? 'bg-cosmic-aurora hover:bg-cosmic-aurora/80 text-white'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          {profile && profile.stardust >= item.price ? (
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