'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { 
  Sparkles, Star, Crown, Diamond,
  Check, ShoppingBag, TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProfileNavigation } from '@/lib/profileNavigation'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import StardustCounter from '@/components/ui/StardustCounter'
import EquippedAvatar from '@/components/ui/EquippedAvatar'
import StripeCheckout from '@/components/payments/StripeCheckout'
import { useProfile } from '@/hooks/useProfile'

const stardustPackages = [
  {
    id: 'starter',
    name: 'Cosmic Dust',
    amount: 1000,
    bonus: 100,
    price: 4.99,
    icon: Sparkles,
    color: 'from-blue-500 to-purple-500',
    popular: false
  },
  {
    id: 'explorer',
    name: 'Stellar Collection',
    amount: 2500,
    bonus: 500,
    price: 9.99,
    icon: Star,
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    id: 'voyager',
    name: 'Nebula Harvest',
    amount: 5500,
    bonus: 1000,
    price: 19.99,
    icon: Diamond,
    color: 'from-pink-500 to-orange-500',
    popular: false
  },
  {
    id: 'cosmic',
    name: 'Galactic Treasury',
    amount: 12000,
    bonus: 3000,
    price: 39.99,
    icon: Crown,
    color: 'from-orange-500 to-yellow-500',
    popular: false
  }
]

function StardustContent() {
  const router = useRouter()
  const { profile } = useProfile()
  const { goToProfile } = useProfileNavigation()
  const [selectedPackage, setSelectedPackage] = useState(stardustPackages[1])

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <OptimizedCosmicBackground intensity="low" />
      </ClientOnly>
      
      <TopNavigationBar />
      
      <div className="relative z-10 pt-16 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Avatar */}
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 inline-block"
            >
              <EquippedAvatar 
                size="xl" 
                showPulse={true} 
                showAura={true}
                showEffects={true}
                clickable={true}
                onClick={() => goToProfile()}
              />
            </m.div>

            <m.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-4 cosmic-heading"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Stardust Shop
            </m.h1>
            
            <m.p 
              className="text-white/60 text-lg mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Fuel your journey with premium stardust
            </m.p>

            {/* Current Balance */}
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 glass-morphism rounded-xl px-6 py-3 border border-white/20"
            >
              <span className="text-white/80">Current Balance:</span>
              <StardustCounter count={profile?.stardust ?? 0} size="lg" />
            </m.div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stardustPackages.map((pkg, index) => (
              <m.button
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative glass-morphism rounded-2xl p-6 border-2 transition-all duration-200 ${
                  selectedPackage.id === pkg.id 
                    ? 'border-white/40 shadow-lg' 
                    : 'border-white/20 hover:border-white/30'
                } ${pkg.popular ? 'transform scale-105' : ''}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/30">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-4 mx-auto`}>
                  <pkg.icon className="w-6 h-6 text-white" />
                </div>

                {/* Package name */}
                <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>

                {/* Amount */}
                <div className="space-y-1 mb-4">
                  <p className="text-2xl font-bold text-white">
                    {pkg.amount.toLocaleString()}
                    <span className="text-sm text-white/60 ml-1">stardust</span>
                  </p>
                  <p className="text-sm text-green-400">
                    +{pkg.bonus.toLocaleString()} bonus
                  </p>
                </div>

                {/* Price */}
                <p className="text-xl font-bold text-white">
                  ${pkg.price}
                </p>

                {/* Selected indicator */}
                {selectedPackage.id === pkg.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </m.button>
            ))}
          </div>

          {/* Purchase Section */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="glass-morphism rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Purchase Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-white/80">
                  <span>{selectedPackage.name}</span>
                  <span>{selectedPackage.amount.toLocaleString()} stardust</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Bonus</span>
                  <span>+{selectedPackage.bonus.toLocaleString()} stardust</span>
                </div>
                <div className="border-t border-white/20 pt-3 flex justify-between text-white font-bold">
                  <span>Total</span>
                  <span>{(selectedPackage.amount + selectedPackage.bonus).toLocaleString()} stardust</span>
                </div>
              </div>

              <StripeCheckout
                userId={profile?.id || ''}
                type="stardust"
                packageType={selectedPackage.id}
                className="w-full"
              >
                <m.button
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Purchase for ${selectedPackage.price}
                </m.button>
              </StripeCheckout>

              <p className="text-white/40 text-xs mt-4">
                Secure payment powered by Stripe
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-white/60">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Support ongoing development</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Unlock exclusive cosmetics</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Accelerate your progress</span>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </div>
  )
}

export default function StardustPage() {
  return (
    <ProtectedRoute>
      <StardustContent />
    </ProtectedRoute>
  )
}