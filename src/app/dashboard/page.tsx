'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProfileNavigation } from '@/lib/profileNavigation'
import { Mountain, Book } from 'lucide-react'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'
import EquippedAvatar from '@/components/ui/EquippedAvatar'

const dashboardActivities = [
  {
    id: 'plan',
    icon: Mountain,
    title: 'Plan',
    description: 'Chart your next cosmic learning steps',
    duration: '15-30 min',
    color: 'from-blue-400 via-indigo-500 to-purple-500'
  },
  {
    id: 'review',
    icon: Book,
    title: 'Review',
    description: 'Access your personal dictionary of learned concepts',
    duration: '10-20 min',
    color: 'from-amber-400 via-orange-500 to-red-500'
  }
]

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

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useProfile()
  const { equippedAura } = useCosmetics()
  const { goToProfile } = useProfileNavigation()
  const [showWelcome, setShowWelcome] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Pre-generate particle positions to prevent movement during re-renders
  const particlePositions = useState(() => 
    dashboardActivities.map(() => 
      Array.from({ length: 3 }, () => ({ // Reduced particles for performance
        top: 20 + Math.random() * 60,
        left: 15 + Math.random() * 70,
        xOffset: Math.random() * 20 - 10
      }))
    )
  )[0]


  // Handle activity query parameter
  useEffect(() => {
    const activity = searchParams.get('activity')
    
    if (activity === 'review') {
      router.push('/review')
    }
  }, [searchParams, router])

  useEffect(() => {
    setMounted(true)
  }, [])



  return (
    <div className="min-h-screen relative">
      
      <div className="relative z-10">
        <TopNavigationBar />
        
        <div className="container mx-auto p-6">
          {showWelcome ? (
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-6">
                <m.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block relative"
                >
                  {/* Subtle aura background effects */}
                  {equippedAura && equippedAura !== 'none' && (
                    <>
                      {/* Outer serene glow */}
                      <m.div
                        animate={{ 
                          scale: 1.1,
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ 
                          duration: 8, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`absolute inset-0 w-32 h-32 mx-auto -mt-6 rounded-full bg-gradient-radial ${getAuraGradientColors(equippedAura)} blur-xl`}
                        style={{
                          background: `radial-gradient(circle, ${getAuraSingleColor(equippedAura)} 0%, transparent 70%)`
                        }}
                      />
                      
                      {/* Inner peaceful emanation */}
                      <m.div
                        animate={{ 
                          scale: 1.05,
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ 
                          duration: 6, 
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                        className={`absolute inset-0 w-24 h-24 mx-auto -mt-2 rounded-full bg-gradient-radial ${getAuraGradientColors(equippedAura)} blur-lg`}
                        style={{
                          background: `radial-gradient(circle, ${getAuraSingleColor(equippedAura)} 0%, transparent 60%)`
                        }}
                      />
                      
                      {/* Floating particles for enhanced serenity */}
                      {[...Array(6)].map((_, i) => (
                        <m.div
                          key={i}
                          animate={{
                            y: [-10, -30, -10],
                            x: [0, Math.sin(i) * 15, 0],
                            opacity: [0, 0.6, 0]
                          }}
                          transition={{
                            duration: 4 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "easeInOut"
                          }}
                          className="absolute w-1 h-1 rounded-full"
                          style={{
                            backgroundColor: getAuraSingleColor(equippedAura).replace('0.05', '0.4'),
                            left: `${45 + Math.cos(i * Math.PI / 3) * 20}%`,
                            top: `${50 + Math.sin(i * Math.PI / 3) * 20}%`,
                            filter: 'blur(0.5px)'
                          }}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Your Singularity floating orb */}
                  {/* Enhanced Avatar */}
                  <m.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mx-auto mb-8 w-24 h-24 flex items-center justify-center"
                  >
                    {/* Dynamic Aura Background Elements */}
                    {equippedAura !== 'none' && (
                      <>
                        {/* Primary Outer Glow Ring */}
                        <m.div
                          className={`absolute -inset-2 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).via} ${getAuraGradientColors(equippedAura).to} rounded-full blur-lg opacity-40`}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                        
                        {/* Secondary Pulsing Ring */}
                        <m.div
                          className={`absolute -inset-4 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).to} rounded-full blur-xl opacity-20`}
                          animate={{ 
                            scale: 1.2,
                            opacity: [0.2, 0.3, 0.2]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        {/* Floating Aura Particles */}
                        {[...Array(6)].map((_, i) => (
                          <m.div
                            key={i}
                            className={`absolute w-1 h-1 bg-${getAuraSingleColor(equippedAura)} rounded-full`}
                            animate={{
                              x: [0, Math.cos(i * Math.PI / 3) * 40, 0],
                              y: [0, Math.sin(i * Math.PI / 3) * 40, 0],
                              opacity: [0, 0.8, 0],
                              scale: 1
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              delay: i * 0.5,
                              ease: "easeInOut"
                            }}
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        ))}
                        
                        {/* Radial Glow Effect */}
                        <m.div
                          className={`absolute -inset-6 bg-${getAuraSingleColor(equippedAura)} rounded-full blur-2xl opacity-10`}
                          animate={{ 
                            scale: 1.1,
                            opacity: [0.1, 0.15, 0.1]
                          }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </>
                    )}
                    
                    <EquippedAvatar 
                      size="xl" 
                      showPulse={true} 
                      showAura={true}
                      showEffects={true}
                      clickable={true}
                      onClick={() => goToProfile()}
                    />
                  </m.div>
                  
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-3 cosmic-heading">
                    Dashboard
                  </h1>
                  <p className="text-white/60 text-lg">
                    Where your singularity finds balance, reflection, and growth
                  </p>
                  
                </m.div>
              </div>

                
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
              >
                {dashboardActivities.map((activity, index) => (
                  <m.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                    transition={{ 
                      delay: 0.6 + index * 0.1, 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className="group relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-10 blur-2xl rounded-3xl transition-all duration-700 scale-110`} />
                    
                    <m.button
                      onClick={() => {
                        if (activity.id === 'plan') {
                          router.push('/planner')
                        } else if (activity.id === 'review') {
                          router.push('/review')
                        }
                      }}
                      className="w-full glass-morphism rounded-3xl p-6 border border-white/10 hover:border-white/40 transition-all duration-300 text-left relative overflow-hidden h-64 flex flex-col cosmic-focus"
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Subtle gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      <div className="relative z-10 flex-1 flex flex-col">
                        {/* Simplified icon */}
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${activity.color} mb-4 w-fit`}>
                          <activity.icon className="w-6 h-6 text-white" />
                        </div>
                        
                        {/* Clean typography */}
                        <h3 className="text-2xl font-bold text-white mb-2 cosmic-heading">
                          {activity.title}
                        </h3>
                        
                        <p className="text-white/70 text-base leading-relaxed mb-4 flex-1">
                          {activity.description}
                        </p>
                        
                        {/* Minimal footer */}
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm">
                            {activity.duration}
                          </span>
                        </div>
                      </div>
                    </m.button>
                  </m.div>
                ))}
              </m.div>
            </m.div>
          ) : null}

        </div>
        
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}