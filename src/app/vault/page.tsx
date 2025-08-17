'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Shield, ShoppingBag, Database, 
  BarChart3, TrendingUp, Clock, Target,
  Brain, Zap, Star, Award, Eye
} from 'lucide-react'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import EquippedAvatar from '@/components/ui/EquippedAvatar'
import NPCDialog from '@/components/npcs/NPCDialog'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'

type VaultSection = 'overview' | 'treasures' | 'cosmetics' | 'obelisk'

function VaultContent() {
  const router = useRouter()
  const { profile } = useProfile()
  const { equippedAura } = useCosmetics()
  const [activeSection, setActiveSection] = useState<VaultSection>('overview')
  const [showEchelonDialog, setShowEchelonDialog] = useState(false)
  const [echelonDialogIndex, setEchelonDialogIndex] = useState(0)

  // Function to get aura gradient colors
  const getAuraGradientColors = (auraName: string | null) => {
    const auraColorMap = {
      'cosmic-aurora': { from: 'from-cosmic-aurora', via: 'via-cosmic-starlight', to: 'to-cosmic-aurora' },
      'stellar-blue': { from: 'from-blue-500', via: 'via-cyan-400', to: 'to-blue-600' },
      'mystic-purple': { from: 'from-purple-600', via: 'via-cosmic-plasma', to: 'to-indigo-600' },
      'emerald-life': { from: 'from-emerald-500', via: 'via-green-400', to: 'to-teal-500' },
      'crimson-flame': { from: 'from-red-600', via: 'via-orange-500', to: 'to-red-500' },
      'golden-majesty': { from: 'from-yellow-500', via: 'via-cosmic-stardust', to: 'to-amber-500' },
      'frost-crystal': { from: 'from-cyan-400', via: 'via-blue-300', to: 'to-cyan-500' },
      'void-darkness': { from: 'from-gray-900', via: 'via-purple-900', to: 'to-black' },
      'rainbow-prism': { from: 'from-pink-500', via: 'via-purple-500', to: 'to-indigo-500' },
      'plasma-storm': { from: 'from-pink-600', via: 'via-cosmic-plasma', to: 'to-purple-600' }
    }
    
    return auraColorMap[auraName as keyof typeof auraColorMap] || auraColorMap['cosmic-aurora']
  }

  // Function to get aura single color
  const getAuraSingleColor = (auraName: string | null) => {
    const auraSingleColorMap = {
      'cosmic-aurora': 'cosmic-aurora',
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
    
    return auraSingleColorMap[auraName as keyof typeof auraSingleColorMap] || 'cosmic-aurora'
  }

  const echelonDialogs = [
    {
      id: '1',
      npc: 'ECHELON' as const,
      text: "Greetings, Singularity. I am ECHELON, guardian of patterns and keeper of the OBELISK's analytical core.",
      requiresInteraction: true
    },
    {
      id: '2',
      npc: 'ECHELON' as const,
      text: "The OBELISK observes, calculates, and reveals the hidden mathematics of your learning journey. Every choice, every pause, every breakthrough - all become data to optimize your path.",
      requiresInteraction: true
    },
    {
      id: '3',
      npc: 'ECHELON' as const,
      text: "Your vault contains more than possessions. It holds the essence of your cosmic evolution - treasures earned through persistence, cosmetics that reflect your journey, and analytical insights that illuminate your potential.",
      requiresInteraction: false
    }
  ]

  const handleEchelonNext = () => {
    if (echelonDialogIndex < echelonDialogs.length - 1) {
      setEchelonDialogIndex(echelonDialogIndex + 1)
    } else {
      setShowEchelonDialog(false)
      setEchelonDialogIndex(0)
    }
  }

  const vaultSections = [
    {
      id: 'treasures' as VaultSection,
      title: 'Treasures',
      description: 'Artifacts earned through dedication and consistency',
      icon: Shield,
      count: 1, // Placeholder
      accent: 'cosmic-aurora'
    },
    {
      id: 'cosmetics' as VaultSection,
      title: 'Cosmetics',
      description: 'Your purchased avatars, effects, and customizations',
      icon: ShoppingBag,
      count: 3, // Placeholder
      accent: 'cosmic-starlight'
    },
    {
      id: 'obelisk' as VaultSection,
      title: 'OBELISK',
      description: 'Statistical analysis and learning optimization',
      icon: Database,
      count: '∞',
      accent: 'cosmic-quasar'
    }
  ]

  const renderTreasures = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white cosmic-heading mb-2">
          Cosmic Treasures
        </h3>
        <p className="text-white/70">
          Legendary artifacts earned through dedication and persistence
        </p>
      </div>

      {/* Aegis Exo - locked for now */}
      <div className="glass-morphism rounded-2xl p-6 border-2 border-yellow-400/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center">
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-white mb-1">⚙️ Aegis Exo</h4>
            <p className="text-yellow-400 text-sm font-medium">The Soul of Armor</p>
          </div>
          <div className="text-yellow-400 opacity-50">
            <Eye className="w-6 h-6" />
          </div>
        </div>
        
        <p className="text-white/70 mb-4 italic">
          "This is not for battle. This is for standing where you once fled."
        </p>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
          <p className="text-yellow-300 text-sm font-medium">
            Unlocks after 7 consecutive days of learning
          </p>
          <p className="text-white/60 text-xs mt-1">
            Progress: 0/7 days
          </p>
        </div>
      </div>

      <div className="text-center text-white/60 py-8">
        <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>More treasures await discovery...</p>
      </div>
    </div>
  )

  const renderCosmetics = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white cosmic-heading mb-2">
          Cosmetic Collection
        </h3>
        <p className="text-white/70">
          Your avatars, effects, and visual customizations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder cosmetics */}
        <div className="glass-morphism rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white border-2 border-gray-300" />
            <h4 className="text-white font-medium">Classic Singularity</h4>
            <p className="text-white/60 text-sm">Equipped</p>
          </div>
        </div>
        
        <div className="glass-morphism rounded-xl p-4 border border-blue-400/50">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cosmic-aurora animate-pulse" />
            <h4 className="text-white font-medium">Cosmic Glow</h4>
            <p className="text-blue-400 text-sm">Owned</p>
          </div>
        </div>
        
        <div className="glass-morphism rounded-xl p-4 border border-purple-400/50">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-400 animate-pulse" />
            <h4 className="text-white font-medium">Stellar Core</h4>
            <p className="text-purple-400 text-sm">Owned</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderObelisk = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white cosmic-heading mb-2">
          OBELISK Analysis
        </h3>
        <p className="text-white/70">
          Statistical insights and learning optimization powered by ECHELON
        </p>
        <m.button
          onClick={() => setShowEchelonDialog(true)}
          className="mt-4 px-4 py-2 bg-cosmic-quasar/20 border border-cosmic-quasar/40 rounded-lg text-cosmic-quasar font-medium hover:bg-cosmic-quasar/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Speak with ECHELON
        </m.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Patterns */}
        <div className="glass-morphism rounded-xl p-6 border border-cosmic-quasar/30">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-cosmic-quasar" />
            <h4 className="text-lg font-bold text-white">Learning Patterns</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Peak Learning Hours</span>
              <span className="text-white font-medium">2-4 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Avg Session Length</span>
              <span className="text-white font-medium">23 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Consistency Score</span>
              <span className="text-cosmic-quasar font-medium">73%</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass-morphism rounded-xl p-6 border border-cosmic-aurora/30">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-cosmic-aurora" />
            <h4 className="text-lg font-bold text-white">Performance</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Quiz Accuracy</span>
              <span className="text-white font-medium">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Concepts Mastered</span>
              <span className="text-white font-medium">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Learning Velocity</span>
              <span className="text-cosmic-aurora font-medium">↗ Improving</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-morphism rounded-xl p-6 border border-cosmic-starlight/30">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-cosmic-starlight" />
            <h4 className="text-lg font-bold text-white">ECHELON's Insights</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Zap className="w-4 h-4 text-cosmic-starlight mt-0.5 flex-shrink-0" />
              <span className="text-white/80">Consider shorter, more frequent sessions for optimal retention</span>
            </div>
            <div className="flex gap-3">
              <Target className="w-4 h-4 text-cosmic-starlight mt-0.5 flex-shrink-0" />
              <span className="text-white/80">Focus on mathematics foundations to unlock advanced topics</span>
            </div>
            <div className="flex gap-3">
              <Clock className="w-4 h-4 text-cosmic-starlight mt-0.5 flex-shrink-0" />
              <span className="text-white/80">Your afternoon learning sessions show 34% better retention</span>
            </div>
          </div>
        </div>

        {/* Achievement Tracking */}
        <div className="glass-morphism rounded-xl p-6 border border-yellow-400/30">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-400" />
            <h4 className="text-lg font-bold text-white">Achievement Progress</h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-sm">Consistent Learner</span>
                <span className="text-white text-sm">0/7</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-sm">Perfect Scholar</span>
                <span className="text-white text-sm">2/5</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'treasures':
        return renderTreasures()
      case 'cosmetics':
        return renderCosmetics()
      case 'obelisk':
        return renderObelisk()
      default:
        return (
          <div className="text-center space-y-8">
            {/* User's Vault Avatar with Enhanced Aura Effects */}
            <div className="relative mb-16">
              {/* Massive Cosmic Background Pattern for XXL Avatar */}
              <div className="absolute inset-0 -inset-32 h-80 opacity-40">
                {equippedAura !== 'none' && (
                  <>
                    {/* Primary Aura Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).via} ${getAuraGradientColors(equippedAura).to} blur-3xl`} />
                    
                    {/* Secondary Layered Effects for XXL Size */}
                    <m.div
                      className={`absolute inset-4 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).to} rounded-full blur-2xl opacity-60`}
                      animate={{
                        scale: 1.2,
                        opacity: [0.6, 0.8, 0.6]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Pulsing Ring Effects */}
                    <m.div
                      className={`absolute inset-8 bg-gradient-to-r ${getAuraGradientColors(equippedAura).via} ${getAuraGradientColors(equippedAura).from} rounded-full blur-xl opacity-40`}
                      animate={{
                        scale: 1.3,
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </>
                )}
              </div>

              <div className="relative">
                {/* Outer Glow Ring for XXL Avatar */}
                {equippedAura !== 'none' && (
                  <m.div
                    className={`absolute -inset-8 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).via} ${getAuraGradientColors(equippedAura).from} rounded-full blur-2xl opacity-60`}
                    animate={{ 
                      rotate: 360,
                      scale: 1.15
                    }}
                    transition={{ 
                      rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                      scale: { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                    }}
                  />
                )}

                {/* Avatar Container with Float Animation */}
                <m.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex items-center justify-center"
                >
                  <EquippedAvatar 
                    size="xxl" 
                    showPulse={true} 
                    showAura={true}
                    showEffects={true}
                  />

                  {/* Spectacular Particle Effects around XXL Avatar */}
                  {equippedAura !== 'none' && (
                    <>
                      {/* Orbiting Sparkles */}
                      <m.div
                        className={`absolute w-2 h-2 bg-${getAuraSingleColor(equippedAura)} rounded-full blur-sm`}
                        animate={{
                          x: [40, 0, -40, 0, 40],
                          y: [0, -40, 0, 40, 0],
                          opacity: [0.8, 1, 0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <m.div
                        className={`absolute w-1.5 h-1.5 bg-${getAuraSingleColor(equippedAura)} rounded-full blur-sm`}
                        animate={{
                          x: [-50, -25, 25, 50, -50],
                          y: [25, -50, -25, 25, 25],
                          opacity: [0.6, 0.9, 0.6, 0.9, 0.6]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />
                      <m.div
                        className={`absolute w-1 h-1 bg-${getAuraSingleColor(equippedAura)} rounded-full blur-sm`}
                        animate={{
                          x: [30, -30, 30],
                          y: [-30, 30, -30],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 2
                        }}
                      />
                    </>
                  )}
                </m.div>
              </div>

              {/* Title and Description */}
              <div className="relative mt-8">
                <h2 className="text-4xl font-bold text-white cosmic-heading mb-3">
                  {profile?.display_name || 'Singularity'}'s Vault
                </h2>
                <p className="text-white/70 text-xl">
                  Your cosmic collection and analytical insights
                </p>
              </div>
            </div>

            {/* Section Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {vaultSections.map((section) => (
                <m.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`glass-morphism rounded-2xl p-6 border-2 transition-all duration-300 text-left group hover:border-${section.accent}/50`}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-16 h-16 rounded-xl bg-${section.accent}/20 border border-${section.accent}/40 flex items-center justify-center mb-4 group-hover:bg-${section.accent}/30 transition-colors`}>
                    <section.icon className={`w-8 h-8 text-${section.accent}`} />
                  </div>
                  
                  <h3 className={`text-xl font-bold text-white cosmic-heading mb-2 group-hover:text-${section.accent} transition-colors`}>
                    {section.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {section.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-${section.accent} font-bold text-lg`}>
                      {section.count} items
                    </span>
                    <ArrowLeft className={`w-5 h-5 text-${section.accent} transform rotate-180 group-hover:translate-x-1 transition-transform`} />
                  </div>
                </m.button>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-cosmic-gradient relative">
      <OptimizedCosmicBackground intensity="low" />
      <TopNavigationBar />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header with back button */}
        {activeSection !== 'overview' && (
          <div className="flex items-center gap-4 mb-8">
            <m.button
              onClick={() => setActiveSection('overview')}
              className="p-3 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </m.button>
            
            <div>
              <h1 className="text-3xl font-bold text-white cosmic-heading">
                {vaultSections.find(s => s.id === activeSection)?.title}
              </h1>
              <p className="text-white/60">
                {vaultSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <m.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </m.div>
      </div>

      {/* ECHELON Dialog */}
      {showEchelonDialog && (
        <NPCDialog
          dialog={echelonDialogs[echelonDialogIndex]}
          onNext={handleEchelonNext}
          isVisible={showEchelonDialog}
          onClose={() => setShowEchelonDialog(false)}
        />
      )}
    </div>
  )
}

export default function VaultPage() {
  return (
    <ProtectedRoute>
      <VaultContent />
    </ProtectedRoute>
  )
}