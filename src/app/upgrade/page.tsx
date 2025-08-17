'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Zap, 
  Star, 
  Crown, 
  Infinity, 
  Sparkles, 
  Rocket, 
  Brain, 
  Globe,
  Check,
  ArrowLeft,
  TreePine,
  AtSign
} from 'lucide-react'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import StripeCheckout from '@/components/payments/StripeCheckout'
import { useProfile } from '@/hooks/useProfile'

const pricingTiers = [
  {
    id: 'voyager',
    name: 'Free Explorer',
    price: 0,
    period: 'forever',
    icon: Star,
    color: 'cosmic-starlight',
    description: 'Begin your learning journey',
    features: [
      'Access to core lessons',
      'Basic NPC interactions',
      'Standard learning experience',
      'Community access'
    ],
    limitations: [
      'Limited personalization',
      'No specialized tutoring',
      'Basic statistics only'
    ]
  },
  {
    id: 'premium',
    name: 'Specialized Learning',
    price: 10,
    period: 'month',
    icon: Brain,
    color: 'cosmic-aurora',
    description: 'Unlock personalized education',
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
    features: [
      'Personal learning statistics',
      'Personalized tutoring from Mnemonic',
      'Special quizzes tailored to you',
      'Advanced progress tracking',
      'Custom learning pathways',
      'Custom username selection',
      'Priority support'
    ],
    limitations: []
  }
]

function UpgradeContent() {
  const router = useRouter()
  const { profile } = useProfile()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async (tierId: string) => {
    setIsProcessing(true)
    setSelectedTier(tierId)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Here you would integrate with Stripe or similar
    console.log(`Upgrading to tier: ${tierId}`)
    
    setIsProcessing(false)
    setSelectedTier(null)
  }

  const handleBack = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <TopNavigationBar />
      
      {/* Rainbow particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full cosmic-text-gradient animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full cosmic-text-gradient animate-pulse opacity-40 delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-3 h-3 rounded-full cosmic-text-gradient animate-pulse opacity-30 delay-2000"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 rounded-full cosmic-text-gradient animate-pulse opacity-50 delay-3000"></div>
        <div className="absolute top-3/4 left-1/2 w-1 h-1 rounded-full cosmic-text-gradient animate-pulse opacity-70 delay-4000"></div>
        <div className="absolute top-1/6 right-1/6 w-2 h-2 rounded-full cosmic-text-gradient animate-pulse opacity-40 delay-500"></div>
      </div>
      
      <div className="flex-1 relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Back Button - Top Left */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg border border-white/20 glass-morphism hover:rainbow-border hover:bg-gradient-to-r hover:from-yellow-500/10 hover:via-pink-500/10 hover:to-blue-500/10 transition-all duration-300 text-white cosmic-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          {/* Header */}
          <div className="text-center mb-16">
            
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Unlock <span className="cosmic-text-gradient">Specialized Learning</span>
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Get personalized education with <span className="cosmic-text-gradient font-semibold">advanced features</span> designed specifically for your learning style.
              </p>
            </m.div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <m.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => tier.popular && handleUpgrade(tier.id)}
                className={`relative p-8 rounded-2xl border backdrop-blur-sm ${
                  tier.popular 
                    ? 'rainbow-border bg-gradient-to-br from-yellow-500/10 via-pink-500/10 to-blue-500/10 scale-105 cursor-pointer' 
                    : 'border-white/20 glass-morphism'
                } hover:bg-white/10 transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="rainbow-border bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      ✨ RECOMMENDED ✨
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <tier.icon className={`w-12 h-12 mx-auto mb-4 ${
                    tier.popular 
                      ? 'cosmic-text-gradient' 
                      : `text-${tier.color}`
                  }`} />
                  <h3 className={`text-2xl font-bold mb-2 ${
                    tier.popular 
                      ? 'cosmic-text-gradient' 
                      : 'text-white'
                  }`}>{tier.name}</h3>
                  <p className="text-white/70 text-sm">{tier.description}</p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className={`text-4xl font-bold ${
                      tier.popular 
                        ? 'cosmic-text-gradient' 
                        : 'text-white'
                    }`}>
                      ${tier.price === 0 ? 'FREE' : tier.price}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-cosmic-starlight ml-2">/{tier.period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        tier.popular 
                          ? 'text-green-400' 
                          : 'text-cosmic-aurora'
                      }`} />
                      <span className="text-white text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {tier.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-60">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white/40 rounded-full" />
                      </div>
                      <span className="text-white text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                {tier.note && (
                  <p className="text-xs text-white/50 mb-4 text-center italic">
                    {tier.note}
                  </p>
                )}

{tier.price === 0 ? (
                  <m.button
                    className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 glass-morphism text-white hover:bg-white/10 border border-white/20 cosmic-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Current Plan
                  </m.button>
                ) : (
                  <StripeCheckout
                    priceId={tier.stripePriceId}
                    userId={profile?.id || ''}
                    type="premium"
                    disabled={!profile}
                    className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 cosmic-button-premium text-white font-bold transform hover:scale-105"
                  >
                    {profile?.premium ? 'Manage Subscription' : `Upgrade to ${tier.name}`}
                  </StripeCheckout>
                )}
              </m.div>
            ))}
          </div>

          {/* Benefits Section */}
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-12">
              What You Get with <span className="cosmic-text-gradient">Specialized Learning</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center p-6 rounded-xl glass-morphism border border-white/10 hover:rainbow-border hover:bg-gradient-to-br hover:from-yellow-500/5 hover:via-pink-500/5 hover:to-blue-500/5 transition-all duration-300">
                <Brain className="w-12 h-12 cosmic-text-gradient mx-auto mb-4" />
                <h3 className="text-lg font-bold cosmic-text-gradient mb-3">Personal Statistics</h3>
                <p className="text-white/70 text-sm">
                  Track your learning progress with detailed analytics and insights into your strengths and areas for improvement.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl glass-morphism border border-white/10 hover:rainbow-border hover:bg-gradient-to-br hover:from-yellow-500/5 hover:via-pink-500/5 hover:to-blue-500/5 transition-all duration-300">
                <Sparkles className="w-12 h-12 cosmic-text-gradient mx-auto mb-4" />
                <h3 className="text-lg font-bold cosmic-text-gradient mb-3">Personalized Tutoring</h3>
                <p className="text-white/70 text-sm">
                  Get one-on-one guidance from Mnemonic, your AI tutor who adapts to your learning style and pace.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl glass-morphism border border-white/10 hover:rainbow-border hover:bg-gradient-to-br hover:from-yellow-500/5 hover:via-pink-500/5 hover:to-blue-500/5 transition-all duration-300">
                <Zap className="w-12 h-12 cosmic-text-gradient mx-auto mb-4" />
                <h3 className="text-lg font-bold cosmic-text-gradient mb-3">Tailored Quizzes</h3>
                <p className="text-white/70 text-sm">
                  Challenge yourself with custom quizzes designed specifically for your knowledge level and learning goals.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl glass-morphism border border-white/10 hover:rainbow-border hover:bg-gradient-to-br hover:from-yellow-500/5 hover:via-pink-500/5 hover:to-blue-500/5 transition-all duration-300">
                <AtSign className="w-12 h-12 cosmic-text-gradient mx-auto mb-4" />
                <h3 className="text-lg font-bold cosmic-text-gradient mb-3">Custom Username</h3>
                <p className="text-white/70 text-sm">
                  Choose your unique @username to stand out in the cosmic community and personalize your identity.
                </p>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <ProtectedRoute>
      <UpgradeContent />
    </ProtectedRoute>
  )
}