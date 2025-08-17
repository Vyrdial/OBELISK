'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Star, Sparkles, Zap, Crown, Gem, Rocket,
  Check, ArrowRight, CreditCard, Shield,
  Gift, TrendingUp, Award, Heart
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import StardustCounter from '@/components/ui/StardustCounter'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'
// Stardust packages with gorgeous styling
const stardustPackages = [
  {
    id: 'starter',
    name: 'Cosmic Dust',
    amount: 1000,
    price: 4.99,
    originalPrice: 6.99,
    savings: 29,
    icon: Sparkles,
    popular: false,
    description: 'Perfect for getting started',
    bonus: '+ 100 bonus stardust',
    gradient: 'from-blue-400 via-purple-400 to-pink-400',
    glow: 'shadow-blue-500/30',
    rarity: 'common'
  },
  {
    id: 'explorer',
    name: 'Stellar Collection',
    amount: 2500,
    price: 9.99,
    originalPrice: 14.99,
    savings: 33,
    icon: Star,
    popular: true,
    description: 'Most popular choice',
    bonus: '+ 500 bonus stardust',
    gradient: 'from-purple-400 via-pink-400 to-red-400',
    glow: 'shadow-purple-500/40',
    rarity: 'rare'
  },
  {
    id: 'voyager',
    name: 'Nebula Harvest',
    amount: 5500,
    price: 19.99,
    originalPrice: 29.99,
    savings: 33,
    icon: Gem,
    popular: false,
    description: 'Serious cosmic power',
    bonus: '+ 1000 bonus stardust',
    gradient: 'from-yellow-400 via-orange-400 to-red-500',
    glow: 'shadow-orange-500/40',
    rarity: 'epic'
  },
  {
    id: 'cosmic',
    name: 'Galactic Treasury',
    amount: 12000,
    price: 39.99,
    originalPrice: 59.99,
    savings: 33,
    icon: Crown,
    popular: false,
    description: 'Ultimate cosmic wealth',
    bonus: '+ 3000 bonus stardust',
    gradient: 'from-yellow-300 via-yellow-400 to-amber-500',
    glow: 'shadow-yellow-500/50',
    rarity: 'legendary'
  }
]

// Helper functions for dynamic aura colors (defined locally to avoid import issues)
function getAuraGradientColors(aura: string) {
  const gradients: { [key: string]: { from: string, via: string, to: string } } = {
    'cosmic-aurora': { from: 'from-orange-500', via: 'via-red-500', to: 'to-pink-500' },
    'stellar-blue': { from: 'from-blue-500', via: 'via-cyan-400', to: 'to-blue-600' },
    'mystic-purple': { from: 'from-purple-600', via: 'via-purple-500', to: 'to-indigo-600' },
    'emerald-life': { from: 'from-emerald-500', via: 'via-green-400', to: 'to-teal-500' },
    'crimson-flame': { from: 'from-red-600', via: 'via-orange-500', to: 'to-red-500' },
    'golden-majesty': { from: 'from-yellow-500', via: 'via-amber-400', to: 'to-orange-500' },
    'frost-crystal': { from: 'from-cyan-400', via: 'via-blue-300', to: 'to-cyan-500' },
    'void-darkness': { from: 'from-gray-900', via: 'via-purple-900', to: 'to-black' },
    'rainbow-prism': { from: 'from-pink-500', via: 'via-purple-500', to: 'to-indigo-500' },
    'plasma-storm': { from: 'from-pink-600', via: 'via-purple-500', to: 'to-blue-600' }
  }
  return gradients[aura] || gradients['cosmic-aurora']
}

function getAuraSingleColor(aura: string) {
  const colors: { [key: string]: string } = {
    'cosmic-aurora': 'orange-500',
    'stellar-blue': 'blue-500',
    'mystic-purple': 'purple-600',
    'emerald-life': 'emerald-500',
    'crimson-flame': 'red-600',
    'golden-majesty': 'yellow-500',
    'frost-crystal': 'cyan-400',
    'void-darkness': 'gray-900',
    'rainbow-prism': 'pink-500',
    'plasma-storm': 'pink-600'
  }
  return colors[aura] || 'orange-500'
}

export default function StardustPage() {
  const router = useRouter()
  const { profile } = useProfile()
  const { equippedAura } = useCosmetics()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePurchase = async (packageId: string) => {
    setSelectedPackage(packageId)
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setShowSuccess(true)
    
    // Hide success after 3 seconds
    setTimeout(() => {
      setShowSuccess(false)
      setSelectedPackage(null)
    }, 3000)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden bg-cosmic-gradient">
        <TopNavigationBar />

        {/* Dynamic Aura Background */}
        {equippedAura !== 'none' && (
          <>
            {/* Main cosmic background */}
            <div className={`absolute inset-0 opacity-20`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).via} ${getAuraGradientColors(equippedAura).to} blur-3xl`} />
            </div>
            
            {/* Floating stardust particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <m.div
                  key={i}
                  className={`absolute w-1 h-1 bg-${getAuraSingleColor(equippedAura)} rounded-full opacity-60`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                    scale: 1
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 8,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Title with floating stardust */}
            <div className="relative inline-block mb-6">
              <m.h1 
                className="text-5xl md:text-7xl font-bold cosmic-text-gradient cosmic-heading"
                animate={{ 
                  textShadow: [
                    '0 0 20px rgba(255, 255, 255, 0.3)',
                    '0 0 40px rgba(255, 255, 255, 0.6)',
                    '0 0 20px rgba(255, 255, 255, 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                STARDUST
              </m.h1>
              
              {/* Floating particles around title */}
              {[...Array(8)].map((_, i) => (
                <m.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: 1
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/80 mb-4 font-light max-w-3xl mx-auto"
            >
              Fuel your cosmic journey with premium stardust
            </m.p>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Unlock exclusive cosmetics, accelerate your progress, and customize your singularity with the universe's most precious resource.
            </m.p>

            {/* Current balance */}
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="inline-flex items-center gap-3 glass-morphism rounded-2xl px-6 py-3 border border-white/20"
            >
              <span className="text-white/80">Current Balance:</span>
              <StardustCounter count={profile?.stardust ?? 0} size="lg" />
            </m.div>
          </m.div>

          {/* Packages Grid */}
          <m.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {stardustPackages.map((pkg, index) => (
              <m.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative glass-morphism rounded-3xl p-6 border-2 transition-all duration-300 ${
                  pkg.popular 
                    ? 'border-yellow-400/50 shadow-2xl shadow-yellow-400/20' 
                    : 'border-white/20 hover:border-white/30'
                } ${pkg.glow}`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <m.div
                      animate={{ 
                        scale: 1.05
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                      }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg"
                    >
                      🔥 MOST POPULAR
                    </m.div>
                  </div>
                )}

                {/* Savings badge */}
                {pkg.savings > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <m.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                    >
                      -{pkg.savings}%
                    </m.div>
                  </div>
                )}

                {/* Package icon with glow */}
                <div className="text-center mb-6">
                  <m.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: 1.1
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${pkg.gradient} p-4 shadow-2xl mb-3`}
                  >
                    <pkg.icon className="w-8 h-8 text-white" />
                  </m.div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-white/60 text-sm">{pkg.description}</p>
                </div>

                {/* Amount display */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-3xl font-bold text-white">{pkg.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-green-400 font-medium">{pkg.bonus}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-white">${pkg.price}</span>
                    {pkg.originalPrice > pkg.price && (
                      <span className="text-lg text-white/50 line-through">${pkg.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/60">One-time purchase</p>
                </div>

                {/* Purchase button */}
                <m.button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isProcessing && selectedPackage === pkg.id}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-lg shadow-yellow-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <m.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Purchase Now
                    </div>
                  )}
                </m.button>

                {/* Floating particles around card */}
                {[...Array(3)].map((_, i) => (
                  <m.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 bg-white/40 rounded-full pointer-events-none"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0, 1, 0],
                      scale: 1
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 4,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </m.div>
            ))}
          </m.div>

        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <m.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="glass-morphism rounded-3xl p-8 border border-white/20 text-center max-w-md w-full"
              >
                <m.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: 1.2
                  }}
                  transition={{ 
                    rotate: { duration: 2, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </m.div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h3>
                <p className="text-white/70 mb-6">Your stardust has been added to your account.</p>
                
                <div className="flex items-center justify-center gap-2">
                  <StardustCounter count={profile?.stardust ?? 0} size="lg" />
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}