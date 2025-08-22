'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { useRouter } from 'next/navigation'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { Puzzle, Brain, Zap, Trophy, Lock, Star, ChevronRight, Clock, Target, Sparkles } from 'lucide-react'

interface PuzzleChallenge {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  category: 'Logic' | 'Pattern' | 'Circuit' | 'State Tables' | 'Boolean'
  xpReward: number
  stardustReward: number
  completed: boolean
  locked: boolean
  requiredLevel?: number
  route?: string
  icon: React.ElementType
}

const puzzles: PuzzleChallenge[] = [
  {
    id: 'logic-gates-intro',
    title: 'Gate Master',
    description: 'Build your first working logic circuit',
    difficulty: 'Easy',
    category: 'Circuit',
    xpReward: 100,
    stardustReward: 10,
    completed: false,
    locked: false,
    route: '/logic-playground',
    icon: Zap
  },
  {
    id: 'truth-table-challenge',
    title: 'Truth Seeker',
    description: 'Complete state tables for complex boolean expressions',
    difficulty: 'Medium',
    category: 'State Tables',
    xpReward: 250,
    stardustReward: 25,
    completed: false,
    locked: false,
    route: '/truth-tables',
    icon: Brain
  },
  {
    id: 'pattern-recognition',
    title: 'Pattern Prophet',
    description: 'Identify and continue cosmic patterns',
    difficulty: 'Medium',
    category: 'Pattern',
    xpReward: 200,
    stardustReward: 20,
    completed: false,
    locked: false,
    icon: Sparkles
  },
  {
    id: 'circuit-optimization',
    title: 'Circuit Optimizer',
    description: 'Simplify complex circuits to their minimal form',
    difficulty: 'Hard',
    category: 'Circuit',
    xpReward: 500,
    stardustReward: 50,
    completed: false,
    locked: true,
    requiredLevel: 5,
    icon: Target
  },
  {
    id: 'boolean-master',
    title: 'Boolean Sage',
    description: 'Master advanced boolean algebra transformations',
    difficulty: 'Expert',
    category: 'Boolean',
    xpReward: 1000,
    stardustReward: 100,
    completed: false,
    locked: true,
    requiredLevel: 10,
    icon: Star
  }
]

const difficultyColors = {
  Easy: 'from-green-400 to-emerald-500',
  Medium: 'from-yellow-400 to-amber-500',
  Hard: 'from-orange-400 to-red-500',
  Expert: 'from-purple-400 to-pink-500'
}

const categoryColors = {
  Logic: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  Pattern: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  Circuit: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
  'State Tables': 'bg-green-500/20 text-green-300 border-green-400/30',
  Boolean: 'bg-pink-500/20 text-pink-300 border-pink-400/30'
}

function PuzzlesContent() {
  const router = useRouter()
  const [hoveredPuzzle, setHoveredPuzzle] = useState<string | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    setCompletedCount(puzzles.filter(p => p.completed).length)
  }, [])

  return (
    <div className="min-h-screen bg-cosmic-void relative overflow-hidden">
      <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      <TopNavigationBar />
      
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
              <Puzzle className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Cosmic Puzzles</h1>
              <p className="text-white/60">Challenge your mind with logic puzzles and earn rewards</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">Overall Progress</span>
              <span className="text-cosmic-aurora font-medium">{completedCount} / {puzzles.length} Completed</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <m.div
                className="h-full bg-gradient-to-r from-cosmic-aurora to-cosmic-starlight rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / puzzles.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </m.div>

        {/* Puzzle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {puzzles.map((puzzle, index) => {
            const Icon = puzzle.icon
            return (
              <m.div
                key={puzzle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredPuzzle(puzzle.id)}
                onMouseLeave={() => setHoveredPuzzle(null)}
                className={`relative group ${puzzle.locked ? 'opacity-60' : ''}`}
              >
                <div className={`
                  relative bg-white/5 backdrop-blur-sm rounded-xl border transition-all duration-300
                  ${puzzle.locked 
                    ? 'border-white/10 cursor-not-allowed' 
                    : 'border-white/20 hover:border-cosmic-aurora/50 cursor-pointer hover:bg-white/10'
                  }
                `}
                onClick={() => {
                  if (!puzzle.locked && puzzle.route) {
                    router.push(puzzle.route)
                  }
                }}>
                  {/* Completed Badge */}
                  {puzzle.completed && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-green-500 rounded-full p-2">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Lock Overlay */}
                  {puzzle.locked && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-cosmic-void/50 rounded-xl">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/40 text-sm">Requires Level {puzzle.requiredLevel}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-white/5">
                        <Icon className="w-6 h-6 text-cosmic-aurora" />
                      </div>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${difficultyColors[puzzle.difficulty]} text-white text-xs font-medium`}>
                        {puzzle.difficulty}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-white mb-2">{puzzle.title}</h3>
                    <p className="text-white/60 text-sm mb-4">{puzzle.description}</p>

                    {/* Category Tag */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${categoryColors[puzzle.category]}`}>
                        {puzzle.category}
                      </span>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-white/80 text-sm">{puzzle.xpReward} XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-cosmic-starlight" />
                          <span className="text-white/80 text-sm">{puzzle.stardustReward}</span>
                        </div>
                      </div>
                      {!puzzle.locked && (
                        <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${
                          hoveredPuzzle === puzzle.id ? 'translate-x-1' : ''
                        }`} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                {!puzzle.locked && hoveredPuzzle === puzzle.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cosmic-aurora/10 to-cosmic-starlight/10 pointer-events-none" />
                )}
              </m.div>
            )
          })}
        </div>

        {/* Coming Soon Section */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-8 border border-purple-400/20">
            <Clock className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">More Puzzles Coming Soon!</h3>
            <p className="text-white/60 max-w-2xl mx-auto">
              We're constantly creating new mind-bending challenges. Check back regularly for fresh puzzles
              and even greater rewards!
            </p>
          </div>
        </m.div>
      </div>
    </div>
  )
}

export default function PuzzlesPage() {
  return (
    <ProtectedRoute>
      <PuzzlesContent />
    </ProtectedRoute>
  )
}