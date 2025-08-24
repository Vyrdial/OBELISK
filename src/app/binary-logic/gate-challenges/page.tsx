'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'
import { Zap, Lock, Unlock, AlertCircle, Binary, ChevronRight, X } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

interface Challenge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'easy' | 'medium' | 'hard'
  route: string
}

const challenges: Challenge[] = [
  {
    id: 'alarm',
    title: 'Security Alarm',
    description: 'Build a circuit that triggers when ANY door is open AND the system is armed',
    icon: <AlertCircle className="w-8 h-8" />,
    difficulty: 'easy',
    route: '/courses/computer-science/binary-logic/challenge-alarm'
  },
  {
    id: 'vote',
    title: 'Majority Vote',
    description: 'Create a circuit that outputs true when at least 2 out of 3 inputs are true',
    icon: <Binary className="w-8 h-8" />,
    difficulty: 'medium',
    route: '/courses/computer-science/binary-logic/challenge-vote'
  },
  {
    id: 'lock',
    title: 'Smart Lock',
    description: 'Design a lock that opens with the right combination of switches',
    icon: <Lock className="w-8 h-8" />,
    difficulty: 'medium',
    route: '/courses/computer-science/binary-logic/challenge-lock'
  }
]

function GateChallengesContent() {
  const router = useRouter()
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set())
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
  }

  const handleStartChallenge = () => {
    if (selectedChallenge) {
      router.push(selectedChallenge.route)
    }
  }

  const handleSkipAll = () => {
    setShowSkipConfirm(true)
  }

  const confirmSkip = () => {
    router.push('/binary-logic/gates-and-tables-2')
  }

  const difficultyColors = {
    easy: 'text-green-400 border-green-400/30 bg-green-400/10',
    medium: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    hard: 'text-red-400 border-red-400/30 bg-red-400/10'
  }

  return (
    <div className="h-screen relative overflow-hidden bg-cosmic-void">
      <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      <TopNavigationBar />
      
      <div className="relative z-10 h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Bonus Challenges
            </h1>
            <p className="text-xl text-purple-100">
              Test your skills with these optional puzzles using AND, OR, and NOT gates
            </p>
            <p className="text-sm text-purple-200/60 mt-2">
              These are harder! Feel free to skip if you want to continue the main lessons.
            </p>
          </m.div>

          {/* Challenge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {challenges.map((challenge, index) => (
              <m.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleChallengeSelect(challenge)}
                className={`
                  relative p-6 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedChallenge?.id === challenge.id 
                    ? 'border-purple-400 bg-purple-400/20' 
                    : 'border-purple-500/30 bg-purple-900/20 hover:bg-purple-800/30'
                  }
                  ${completedChallenges.has(challenge.id) ? 'opacity-50' : ''}
                `}
              >
                {/* Completed Badge */}
                {completedChallenges.has(challenge.id) && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Completed
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="text-purple-300 mb-4">
                  {challenge.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {challenge.title}
                </h3>

                {/* Description */}
                <p className="text-purple-100/80 text-sm mb-4">
                  {challenge.description}
                </p>

                {/* Difficulty Badge */}
                <div className={`
                  inline-block px-3 py-1 rounded-full text-xs font-semibold border
                  ${difficultyColors[challenge.difficulty]}
                `}>
                  {challenge.difficulty.toUpperCase()}
                </div>
              </m.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <AnimatePresence mode="wait">
              {selectedChallenge ? (
                <m.button
                  key="start"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleStartChallenge}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  Start Challenge
                  <ChevronRight className="w-5 h-5" />
                </m.button>
              ) : (
                <m.div
                  key="select"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-purple-200/60 italic"
                >
                  Select a challenge to begin
                </m.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSkipAll}
              className="px-8 py-3 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-700/70 transition-all duration-300 border border-gray-600/50 flex items-center gap-2"
            >
              Skip Challenges
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom hint */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-purple-200/40 text-sm"
          >
            💡 Stuck? Don't worry! You'll learn new techniques later that make these easier.
          </m.div>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipConfirm && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowSkipConfirm(false)}
            />
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4"
            >
              <div className="bg-purple-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">Skip Challenges?</h3>
                
                <p className="text-purple-100 mb-6">
                  These challenges help you develop problem-solving intuition. Wrestling with difficult puzzles—even 
                  unsuccessfully—builds the mental patterns you'll need for real programming.
                </p>
                
                <p className="text-purple-200/80 text-sm mb-6">
                  The struggle is where learning happens. Each attempt rewires your brain to think in new ways.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 px-4 py-3 bg-purple-500/30 text-purple-100 font-semibold rounded-xl hover:bg-purple-500/40 transition-all duration-300 border border-purple-400/30"
                  >
                    Try Challenges
                  </button>
                  <button
                    onClick={confirmSkip}
                    className="flex-1 px-4 py-3 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-700/70 transition-all duration-300 border border-gray-600/50"
                  >
                    Skip Anyway
                  </button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GateChallengesPage() {
  return (
    <ProtectedRoute>
      <GateChallengesContent />
    </ProtectedRoute>
  )
}