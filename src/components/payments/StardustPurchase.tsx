'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  ShoppingBag, 
  Star, 
  Crown, 
  Zap,
  X,
  Check 
} from 'lucide-react'
import StripeCheckout from './StripeCheckout'
import { useProfile } from '@/hooks/useProfile'

interface StardustPackage {
  id: string
  name: string
  amount: number
  price: number
  priceFormatted: string
  bestValue: boolean
}

interface StardustPurchaseProps {
  isOpen: boolean
  onClose: () => void
}

export default function StardustPurchase({ isOpen, onClose }: StardustPurchaseProps) {
  const { profile } = useProfile()
  const [packages, setPackages] = useState<StardustPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchPackages()
    }
  }, [isOpen])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/payments/stardust')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error('Failed to fetch stardust packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'small': return <Star className="w-8 h-8" />
      case 'medium': return <Sparkles className="w-8 h-8" />
      case 'large': return <Crown className="w-8 h-8" />
      case 'mega': return <Zap className="w-8 h-8" />
      default: return <Star className="w-8 h-8" />
    }
  }

  const getPackageColor = (packageId: string) => {
    switch (packageId) {
      case 'small': return 'from-blue-400 to-blue-600'
      case 'medium': return 'from-purple-400 to-purple-600'
      case 'large': return 'from-yellow-400 to-yellow-600'
      case 'mega': return 'from-pink-400 to-pink-600'
      default: return 'from-blue-400 to-blue-600'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="glass-morphism rounded-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cosmic-aurora to-cosmic-plasma rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Purchase Stardust</h2>
                  <p className="text-white/70">Fuel your cosmic journey</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full glass-morphism border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-cosmic-aurora border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg) => (
                  <m.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * packages.indexOf(pkg) }}
                    className={`relative p-6 rounded-xl border-2 backdrop-blur-sm ${
                      pkg.bestValue
                        ? 'border-yellow-400/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
                        : 'border-white/20 glass-morphism'
                    } hover:border-cosmic-aurora/50 transition-all duration-300`}
                  >
                    {pkg.bestValue && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                          ⭐ BEST VALUE
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${getPackageColor(pkg.id)} rounded-full flex items-center justify-center text-white`}>
                        {getPackageIcon(pkg.id)}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-cosmic-aurora mb-1">
                        {pkg.priceFormatted}
                      </div>
                      <div className="text-white/70 text-sm">
                        {(pkg.amount / (pkg.price / 100)).toFixed(0)} stardust per $
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-white/80">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>{pkg.amount.toLocaleString()} Stardust</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Instant delivery</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Secure payment</span>
                      </div>
                    </div>

                    <StripeCheckout
                      type="stardust"
                      packageType={pkg.id}
                      userId={profile?.id || ''}
                      disabled={!profile}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        pkg.bestValue
                          ? 'cosmic-button-premium text-white transform hover:scale-105'
                          : 'cosmic-button text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Purchase
                      </div>
                    </StripeCheckout>
                  </m.div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/20 text-center">
              <p className="text-white/60 text-sm mb-2">
                ✨ Stardust is used to purchase cosmetic items and customizations
              </p>
              <p className="text-white/40 text-xs">
                Secure payments powered by Stripe • All purchases are final
              </p>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}