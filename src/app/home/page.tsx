'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowRight, BookOpen, Star, Crown, Store, Mountain, Book, Sparkles, Zap, Brain, Rocket, Compass, Target, TrendingUp, Users, Heart, Trophy, CheckCircle2, Clock, Layers } from 'lucide-react'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import EquippedAvatar from '@/components/ui/EquippedAvatar'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'
import { useProfileNavigation } from '@/lib/profileNavigation'
import ProgressiveHydration from '@/components/hydration/ProgressiveHydration'
import { HydrationTracker } from '@/components/hydration/HydrationProvider'
import { getAuraGradientColors, getAuraSingleColor, getAuraGradientColorsReduced } from '@/utils/auraColors'

// Cosmic flavor texts - like Minecraft splash text!
const flavorTexts = [
  "Learning through the cosmos!",
  "Where concepts have clear names!",
  "No jargon, just clarity!",
  "ERRATA knows best!",
  "Change trends > derivatives!",
  "Systems thinking activated!",
  "Knowledge without confusion!",
  "Cosmic clarity awaits!",
  "Think like a singularity!",
  "Every star is a lesson!",
  "Metaphors make it click!",
  "Understanding over memorization!",
  "Wisdom flows like stardust!",
  "Connect the cosmic dots!",
  "Embrace the learning journey!",
  "Simplicity is genius!",
  "Make learning your superpower!",
  "Curiosity fuels the cosmos!",
  "Every question leads to insight!",
  "The universe is your classroom!",
  "Knowledge transcends boundaries!",
  "Learn. Understand. Become.",
  "Patterns reveal the truth!",
  "Concepts click, not just stick!",
  "Your potential is infinite!"
]

// Mock data for demo - would come from profile/database
const mockStats = {
  currentStreak: 7,
  totalLessons: 24,
  stardustEarned: 1250,
  conceptsMastered: 18,
  friendsLearning: 3,
  nextMilestone: 30
}

const mockAchievements = [
  { id: 1, name: 'First Steps', icon: Rocket, unlocked: true, description: 'Complete your first lesson' },
  { id: 2, name: 'Week Warrior', icon: Trophy, unlocked: true, description: '7 day learning streak' },
  { id: 3, name: 'Systems Sage', icon: Brain, unlocked: false, description: 'Master Systems Thinking', progress: 0.7 },
  { id: 4, name: 'Social Scholar', icon: Users, unlocked: false, description: 'Learn with 5 friends', progress: 0.6 }
]

const mockRecentActivity = [
  { id: 1, type: 'lesson', title: 'Universal Relativity', time: '2 hours ago', icon: BookOpen },
  { id: 2, type: 'achievement', title: 'Earned Week Warrior', time: '1 day ago', icon: Trophy },
  { id: 3, type: 'friend', title: 'StarSeeker joined!', time: '3 days ago', icon: Users }
]

function HomeContent() {
  const router = useRouter()
  const { profile } = useProfile()
  const { equippedAura } = useCosmetics()
  const { goToProfile } = useProfileNavigation()
  const [flavorText, setFlavorText] = useState(flavorTexts[0])
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState<string | null>(null)

  useEffect(() => {
    // Set random flavor text only after mount to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * flavorTexts.length)
    setFlavorText(flavorTexts[randomIndex])
    
    // Update time after mount
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      setCurrentTime(timeString)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  const primaryActions = [
    {
      title: 'Learn',
      description: 'Pick up where you left off',
      path: '/learn',
      icon: BookOpen,
      accent: 'cosmic-aurora',
      isPrimary: true
    },
    {
      title: 'Courses',
      description: 'Discover new realms of knowledge',
      path: '/courses',
      icon: Star,
      accent: 'cosmic-starlight',
      isPrimary: false
    },
    profile?.is_premium ? {
      title: 'Marketplace',
      description: 'Exclusive cosmetics await',
      path: '/shop',
      icon: Store,
      accent: 'cosmic-stardust',
      isPrimary: false
    } : {
      title: 'Upgrade Journey',
      description: 'Unlock unlimited cosmic potential',
      path: '/upgrade',
      icon: Crown,
      accent: 'cosmic-stardust',
      isPrimary: false
    }
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-black">
      {/* Cosmic Background with shooting stars - disabled nebula to prevent bright gradients */}
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

      {/* Main Content with Scrollable Sections */}
      <main className="relative z-20 overflow-visible">
        {/* Hero Section with Dynamic Greeting */}
        <section className="relative min-h-[80vh] flex items-center justify-center px-6 py-12 overflow-visible">
          <div className="max-w-7xl mx-auto w-full overflow-visible">
          
            {/* Hero Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-center overflow-visible">
              {/* Left Column - Dynamic Welcome */}
              <m.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                {/* Current Time Display */}
                <ClientOnly fallback={
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/20 mb-6 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Loading...</span>
                  </div>
                }>
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/20 mb-6 backdrop-blur-sm"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">{currentTime || 'Loading...'}</span>
                  </m.div>
                </ClientOnly>

                <h1 className="text-5xl md:text-7xl font-bold text-white cosmic-heading mb-6">
                  <m.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {profile?.display_name || 'Singularity'}
                  </m.span>
                </h1>

                {/* Animated Flavor Text */}
                <ClientOnly fallback={
                  <p className="text-xl text-white/70 mb-8 leading-relaxed">
                    {flavorTexts[0]}
                  </p>
                }>
                  <AnimatePresence mode="wait">
                    <m.p
                      key={flavorText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xl text-white/70 mb-8 leading-relaxed"
                    >
                      {flavorText}
                    </m.p>
                  </AnimatePresence>
                </ClientOnly>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
                  <m.button
                    onClick={() => router.push('/courses')}
                    className="group px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-[30ms] flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Rocket className="w-5 h-5" />
                    Continue Learning
                  </m.button>
                  
                  <m.button
                    onClick={() => router.push('/community')}
                    className="px-6 py-3 glass-morphism border border-purple-500/20 text-white rounded-full font-semibold hover:bg-purple-500/10 transition-all duration-[30ms] flex items-center gap-2 backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Users className="w-5 h-5" />
                    Find Friends
                  </m.button>
                </div>
              </m.div>

              {/* Right Column - Floating Avatar & Stats */}
              <ClientOnly fallback={
                <div className="relative overflow-visible">
                  <div className="relative mx-auto w-80 h-96 overflow-visible -mt-8">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <EquippedAvatar 
                        size="2xl" 
                        showPulse={false} 
                        showAura={false}
                        showEffects={false}
                        clickable={true}
                        onClick={goToProfile}
                      />
                    </div>
                  </div>
                </div>
              }>
                <m.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative overflow-visible"
                >
                  {/* Aura Visual Effects - Extra height for hats */}
                  <div className="relative mx-auto w-80 h-96 overflow-visible -mt-8">
                  {(() => {
                    // Simplified single-layer aura effects
                    switch(equippedAura) {
                      case 'cosmic-aurora':
                        return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="absolute rounded-full bg-gradient-to-t from-emerald-400/5 to-transparent blur-2xl"
                              style={{ 
                                width: '90%', 
                                height: '75%', 
                                top: '12.5%',
                                left: '5%',
                                opacity: 0.4
                              }}
                            />
                          </div>
                        )
                      case 'stellar-blue':
                        return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="absolute rounded-full bg-gradient-to-r from-blue-400/5 to-transparent blur-2xl"
                              style={{ 
                                width: '90%', 
                                height: '75%', 
                                top: '12.5%',
                                left: '5%',
                                opacity: 0.4
                              }}
                            />
                          </div>
                        )
                      case 'mystic-purple':
                        return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="absolute rounded-full bg-gradient-to-r from-purple-600/5 to-transparent blur-2xl"
                              style={{
                                width: '90%',
                                height: '75%',
                                top: '12.5%',
                                left: '5%',
                                opacity: 0.4
                              }}
                            />
                          </div>
                        )
                      case 'emerald-life':
                        return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="absolute rounded-full bg-gradient-to-r from-emerald-400/5 to-transparent blur-2xl"
                              style={{
                                width: '90%',
                                height: '75%',
                                top: '12.5%',
                                left: '5%',
                                opacity: 0.4
                              }}
                            />
                          </div>
                        )
                      case 'crimson-flame':
                        return (
                          <>
                            {/* Crimson flame glow - reduced opacity */}
                            <div
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/8 via-orange-500/8 to-red-500/8 blur-xl"
                              style={{
                                opacity: 0.3,
                                animation: 'pulse-subtle 6s ease-in-out infinite'
                              }}
                            />
                            <div
                              className="absolute inset-6 rounded-full bg-gradient-to-r from-red-600/6 to-orange-600/6 blur-2xl"
                              style={{
                                opacity: 0.2,
                                animation: 'pulse-subtle 7s ease-in-out infinite 0.4s'
                              }}
                            />
                          </>
                        )
                      case 'golden-majesty':
                        return (
                          <>
                            {/* Golden majesty glow - reduced opacity */}
                            <div
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/10 via-amber-400/10 to-yellow-400/10 blur-xl"
                              style={{
                                opacity: 0.35,
                                animation: 'pulse-subtle 8s ease-in-out infinite'
                              }}
                            />
                            <div
                              className="absolute inset-4 rounded-full bg-gradient-to-r from-yellow-500/8 to-amber-500/8 blur-2xl"
                              style={{
                                opacity: 0.25,
                                animation: 'pulse-subtle 7s ease-in-out infinite 1s'
                              }}
                            />
                          </>
                        )
                      case 'frost-crystal':
                        return (
                          <>
                            {/* Frost crystal glow - reduced opacity */}
                            <div
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/8 via-blue-300/8 to-cyan-400/8 blur-xl"
                              style={{
                                opacity: 0.25,
                                animation: 'pulse-subtle 9s ease-in-out infinite'
                              }}
                            />
                            <div
                              className="absolute inset-5 rounded-full bg-gradient-to-r from-cyan-300/6 to-blue-300/6 blur-2xl"
                              style={{
                                opacity: 0.2,
                                animation: 'pulse-subtle 8s ease-in-out infinite 0.8s'
                              }}
                            />
                          </>
                        )
                      case 'void-darkness':
                        return (
                          <>
                            {/* Void darkness shadow - reduced opacity */}
                            <div
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/12 via-purple-900/12 to-gray-900/12 blur-xl"
                              style={{
                                opacity: 0.35,
                                animation: 'pulse-subtle 10s ease-in-out infinite'
                              }}
                            />
                            <div
                              className="absolute inset-6 rounded-full bg-gradient-to-r from-black/8 to-purple-900/8 blur-2xl"
                              style={{
                                opacity: 0.25,
                                animation: 'pulse-subtle 9s ease-in-out infinite 1s'
                              }}
                            />
                          </>
                        )
                      case 'rainbow-prism':
                        return (
                          <>
                            {/* Rainbow prism spectrum - reduced opacity */}
                            <div
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/8 via-purple-400/8 to-indigo-400/8 blur-xl"
                              style={{
                                opacity: 0.25,
                                animation: 'pulse-subtle 10s ease-in-out infinite'
                              }}
                            />
                            <div
                              className="absolute inset-4 rounded-full bg-gradient-to-r from-red-400/4 via-yellow-400/4 via-green-400/4 via-blue-400/4 to-purple-400/4 blur-2xl"
                              style={{
                                opacity: 0.2,
                                animation: 'pulse-subtle 8s ease-in-out infinite 0.6s'
                              }}
                            />
                          </>
                        )
                      case 'plasma-storm':
                        return (
                          <>
                            {/* Plasma storm energy - reduced opacity */}
                            <div
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 blur-xl"
                              style={{
                                opacity: 0.3,
                                animation: 'pulse-subtle 6s ease-in-out infinite'
                              }}
                            />
                            <div
                              className="absolute inset-5 rounded-full bg-gradient-to-r from-pink-600/8 to-purple-600/8 blur-2xl"
                              style={{
                                opacity: 0.25,
                                animation: 'pulse-subtle 7s ease-in-out infinite 0.4s'
                              }}
                            />
                          </>
                        )
                      default:
                        return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/* Default subtle effect - centered for avatar with hat */}
                            <m.div
                              className="absolute rounded-full border border-white/10"
                              style={{ width: '100%', height: '83%', top: '8.5%' }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                        )
                    }
                  })()}

                  {/* Large outer ring - static, no animation */}
                  <div
                    className="absolute rounded-full border-2 border-white/5"
                    style={{
                      width: '120%',
                      height: '100%',
                      top: '0%',
                      left: '-10%'
                    }}
                  />
                  
                  {/* Second decorative ring - static, no animation */}
                  <div
                    className="absolute rounded-full border border-white/3"
                    style={{
                      width: '110%',
                      height: '92%',
                      top: '4%',
                      left: '-5%'
                    }}
                  />

                  {/* Central Avatar - static positioning */}
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      width: '100%',
                      height: '80%',
                      top: '10%',
                      left: '0'
                    }}
                  >
                    <div className="relative">
                      {/* Dynamic Aura Background */}
                      {equippedAura !== 'none' && (
                        <>
                          <div
                            className={`absolute -inset-4 bg-gradient-to-r ${getAuraGradientColorsReduced(equippedAura).from} ${getAuraGradientColorsReduced(equippedAura).via} ${getAuraGradientColorsReduced(equippedAura).to} rounded-full blur-xl`}
                            style={{
                              opacity: 0.5,
                              animation: 'pulse-subtle 8s ease-in-out infinite'
                            }}
                          />
                        </>
                      )}
                      
                      <EquippedAvatar 
                        size="2xl" 
                        showPulse={false} 
                        showAura={false}
                        showEffects={false}
                        clickable={true}
                        onClick={goToProfile}
                      />
                    </div>
                  </div>
                </div>
              </m.div>
              </ClientOnly>
            </div>
          </div>
          
        </section>

        {/* Active Learning Dashboard - Seamlessly Connected */}
        <section className="relative px-6 pb-20 -mt-24">
          
          <div className="max-w-7xl mx-auto relative">
            {/* Today's Focus - Immediate action items */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Today's Learning Focus
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Continue Where You Left Off */}
                <m.button
                  onClick={() => router.push('/courses/systems-thinking')}
                  className="glass-morphism rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-200 text-left group backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500/50 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">Resume: Universal Relativity</h3>
                      <p className="text-xs text-white/60">15 min left • 70% complete</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                  <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-gradient-to-r from-indigo-500 to-purple-500" />
                  </div>
                </m.button>

                {/* Review Reminder */}
                <m.button
                  onClick={() => router.push('/review')}
                  className="glass-morphism rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all duration-200 text-left group backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">Review: Null Core</h3>
                      <p className="text-xs text-white/60">Strengthen memory • Due today</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                </m.button>

                {/* New Challenge */}
                <m.button
                  onClick={() => router.push('/sandbox')}
                  className="glass-morphism rounded-xl p-4 border border-white/10 hover:border-purple-400/30 transition-all duration-200 text-left group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">Practice: Logic Gates</h3>
                      <p className="text-xs text-white/60">Interactive sandbox • 5 min</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                </m.button>
              </div>
            </m.div>

            {/* Learning Stats & Recommendations */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Learning Momentum */}
              <m.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-morphism rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Learning Momentum</h3>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                
                {/* Weekly Progress Chart */}
                <div className="flex items-end gap-1 h-20 mb-4">
                  {[40, 60, 45, 80, 70, 90, 100].map((height, idx) => (
                    <div key={idx} className="flex-1 bg-white/10 rounded-t relative overflow-hidden">
                      <m.div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-purple-500"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>Mon</span>
                  <span>Today</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">This week</span>
                    <span className="text-sm font-semibold text-green-400">+23% 📈</span>
                  </div>
                </div>
              </m.div>

              {/* Concept Map Progress */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-morphism rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Concept Mastery</h3>
                  <Layers className="w-5 h-5 text-purple-400" />
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Systems Thinking', progress: 0.7, color: 'purple-500' },
                    { name: 'Binary Logic', progress: 0.5, color: 'blue-500' },
                    { name: 'Set Theory', progress: 0.3, color: 'indigo-500' },
                    { name: 'Relativity', progress: 0.9, color: 'violet-500' }
                  ].map((concept) => (
                    <div key={concept.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/80">{concept.name}</span>
                        <span className="text-white/60">{Math.round(concept.progress * 100)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <m.div
                          className={`h-full bg-${concept.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${concept.progress * 100}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => router.push('/concepts')}
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View full concept map →
                </button>
              </m.div>

              {/* Smart Recommendations */}
              <m.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-morphism rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recommended Next</h3>
                  <Compass className="w-5 h-5 text-purple-400" />
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/axis-fundamentals')}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cosmic-aurora rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Axis Fundamentals</p>
                        <p className="text-xs text-white/60">Ready based on your progress</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => router.push('/truth-tables')}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Truth Tables</p>
                        <p className="text-xs text-white/60">Builds on Binary Logic</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                  </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50">Based on your learning patterns</p>
                </div>
              </m.div>
            </div>

            {/* Quick Tools Bar */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <button
                onClick={() => router.push('/planner')}
                className="px-4 py-2 glass-morphism rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <Mountain className="w-4 h-4" />
                Schedule Session
              </button>
              
              <button
                onClick={() => router.push('/archive')}
                className="px-4 py-2 glass-morphism rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <Book className="w-4 h-4" />
                Concept Archive
              </button>
              
              <button
                onClick={() => router.push('/community')}
                className="px-4 py-2 glass-morphism rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <Users className="w-4 h-4" />
                Study Groups
              </button>
              
              <button
                onClick={() => router.push('/help')}
                className="px-4 py-2 glass-morphism rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <Sparkles className="w-4 h-4" />
                Ask LAGOM
              </button>
            </m.div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  )
}