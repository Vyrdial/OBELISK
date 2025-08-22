'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileNavigation } from '@/lib/profileNavigation'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Lock, 
  Unlock,
  ArrowLeft,
  BookOpen,
  Cpu,
  Code2,
  Waves,
  Sliders,
  Route
} from 'lucide-react'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import EquippedAvatar from '@/components/ui/EquippedAvatar'
import { useCosmetics } from '@/hooks/useCosmetics'

// Module definitions
interface SandboxModule {
  id: string
  name: string
  description: string
  icon: React.ElementType
  route: string
  requiredLesson?: string
}

const SANDBOX_MODULES: SandboxModule[] = [
  {
    id: 'code-editor',
    name: 'Code Editor',
    description: 'Write and execute code in JavaScript, Python, SQL, and C',
    icon: Code2,
    route: '/code-editor'
  },
  {
    id: 'logic-playground',
    name: 'Logic Gate Playground',
    description: 'Build and experiment with logic circuits',
    icon: Cpu,
    route: '/logic-playground',
    requiredLesson: 'true-and-false'
  },
  {
    id: 'boolean-waves',
    name: 'Boolean Waves',
    description: 'Visualize logic gates as wave interference patterns',
    icon: Waves,
    route: '/boolean-waves'
  },
  {
    id: 'constraint-lab',
    name: 'Constraint Laboratory',
    description: 'Build and explore mathematical relationships through interactive constraint systems',
    icon: Sparkles,
    route: '/constraint-lab'
  },
  {
    id: 'axis-slider',
    name: 'Axis Slider',
    description: 'Single axis value manipulation and visualization',
    icon: Sliders,
    route: '/axis-slider'
  },
  {
    id: 'tsp-solver',
    name: 'TSP Rubber Band Solver',
    description: 'Solve the Traveling Salesman Problem using a rubber band analogy with path widening',
    icon: Route,
    route: '/tsp-solver'
  }
]

function SandboxContent() {
  const router = useRouter()
  const { profile } = useProfile()
  const { equippedAura } = useCosmetics()
  const { goToProfile } = useProfileNavigation()
  const [unlockedModules, setUnlockedModules] = useState<string[]>([])

  useEffect(() => {
    if (!profile) return

    // Use the actual unlocked_modules from the profile
    setUnlockedModules(profile.unlocked_modules || [])
  }, [profile])

  const isModuleUnlocked = (moduleId: string) => {
    // Most modules are always unlocked by default
    const alwaysUnlocked = [
      'code-editor', 'logic-playground', 'boolean-waves', 
      'constraint-lab', 'axis-slider', 'tsp-solver'
    ]
    if (alwaysUnlocked.includes(moduleId)) return true
    return unlockedModules.includes(moduleId)
  }

  return (
    <div className="h-screen relative overflow-hidden bg-black">
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
      
      <div className="relative z-10 px-6 pb-4 h-[calc(100vh-4rem)] overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto h-full">
          {/* Header */}
            <div className="text-center mb-6">
              {/* Avatar */}
              <m.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-2 inline-block relative"
                style={{ padding: '20px' }}
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
                Sandbox
              </m.h1>
              <m.p 
                className="text-white/60 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Experiment with unlocked modules from your lessons
              </m.p>
            </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SANDBOX_MODULES.map((module) => {
                const isUnlocked = isModuleUnlocked(module.id)
                const Icon = module.icon
                
                return (
                  <m.div
                    key={module.id}
                    whileHover={isUnlocked ? { scale: 1.02 } : {}}
                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                    className={`relative bg-cosmic-void/50 backdrop-blur-xl rounded-xl border ${
                      isUnlocked 
                        ? 'border-cosmic-aurora/30 cursor-pointer hover:border-cosmic-aurora/50' 
                        : 'border-white/10 opacity-60 cursor-not-allowed'
                    } p-6 transition-all duration-300 glass-morphism`}
                    onClick={() => isUnlocked && router.push(module.route)}
                  >
                    {/* Lock/Unlock indicator */}
                    <div className="absolute top-4 right-4">
                      {isUnlocked ? (
                        <Unlock className="w-5 h-5 text-cosmic-aurora" />
                      ) : (
                        <Lock className="w-5 h-5 text-white/40" />
                      )}
                    </div>

                    {/* Module content */}
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-xl ${
                        isUnlocked ? 'bg-cosmic-aurora/20' : 'bg-white/10'
                      } flex items-center justify-center mb-4`}>
                        <Icon className={`w-8 h-8 ${
                          isUnlocked ? 'text-cosmic-aurora' : 'text-white/40'
                        }`} />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {module.name}
                      </h3>
                      
                      <p className="text-white/60 text-sm">
                        {module.description}
                      </p>

                      {!isUnlocked && module.requiredLesson && (
                        <p className="text-white/40 text-xs mt-4 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Complete "{module.requiredLesson}" lesson
                        </p>
                      )}
                    </div>
                  </m.div>
                )
              })}
            </div>
        </div>
      </div>
    </div>
  )
}

export default function SandboxPage() {
  return (
    <ProtectedRoute>
      <SandboxContent />
    </ProtectedRoute>
  )
}