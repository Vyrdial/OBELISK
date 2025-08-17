'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { Brain, Eye, Link, Sparkles, ArrowRight, Heart, Cat } from 'lucide-react'
import NPCDialog, { NPCDialogData } from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useProfile } from '@/hooks/useProfile'

// ===== INTERACTIVE COMPONENTS =====

// Sensory Data Visualization
function SensoryDataViz({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-purple-900/20 to-black/40 rounded-xl p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
      
      <svg width="100%" height="100%" viewBox="0 0 400 200" className="relative z-10">
        {/* Raw sensory input - random dots */}
        {isActive && [...Array(50)].map((_, i) => (
          <m.circle
            key={i}
            cx={Math.random() * 400}
            cy={Math.random() * 200}
            r="2"
            fill={`hsl(${Math.random() * 360}, 70%, 60%)`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0, 1]
            }}
            transition={{
              duration: 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              times: [0, 0.2, 0.8, 1]
            }}
          />
        ))}
        
        {/* Label */}
        <text x="200" y="100" textAnchor="middle" fontSize="24" fill="white" fontWeight="600">
          Raw Sensory Data
        </text>
        <text x="200" y="130" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,0.6)">
          Photons, sound waves, molecules...
        </text>
      </svg>
    </div>
  )
}

// Pattern Recognition Visualization
function PatternRecognitionViz({ stage }: { stage: number }) {
  const letters = ['A', 'B', 'C']
  
  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-blue-900/20 to-black/40 rounded-xl p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      
      <svg width="100%" height="100%" viewBox="0 0 400 200" className="relative z-10">
        {/* Stage 1: Individual letters appear */}
        {stage >= 1 && letters.map((letter, i) => (
          <m.g key={letter}>
            <m.rect
              x={80 + i * 100}
              y={60}
              width="80"
              height="80"
              rx="8"
              fill="none"
              stroke="rgba(167, 139, 250, 0.5)"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.3, type: "spring" }}
            />
            <m.text
              x={120 + i * 100}
              y={110}
              textAnchor="middle"
              fontSize="48"
              fill="white"
              fontWeight="600"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 110 }}
              transition={{ delay: i * 0.3 + 0.2 }}
            >
              {letter}
            </m.text>
          </m.g>
        ))}
        
        {/* Stage 2: Pattern emerges */}
        {stage >= 2 && (
          <m.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {/* Connecting lines */}
            <m.path
              d="M 160 100 L 260 100 L 360 100"
              stroke="rgba(167, 139, 250, 0.3)"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            />
            <m.text
              x="200"
              y="170"
              textAnchor="middle"
              fontSize="16"
              fill="rgba(255,255,255,0.8)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Pattern: Sequential Letters
            </m.text>
          </m.g>
        )}
      </svg>
    </div>
  )
}

// Relationship Formation Visualization
function RelationshipViz({ stage }: { stage: number }) {
  const [catVisible, setCatVisible] = useState(false)
  
  useEffect(() => {
    if (stage >= 3) {
      setCatVisible(true)
    }
  }, [stage])
  
  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-green-900/20 to-black/40 rounded-xl p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-yellow-500/5" />
      
      <div className="relative z-10 h-full flex items-center justify-center">
        {/* Stage 1: C-A-T appears */}
        {stage >= 1 && (
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-4"
          >
            {['C', 'A', 'T'].map((letter, i) => (
              <m.div
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center"
              >
                <span className="text-3xl font-bold text-white">{letter}</span>
              </m.div>
            ))}
          </m.div>
        )}
        
        {/* Stage 2: Arrow to concept */}
        {stage >= 2 && (
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-8"
          >
            <ArrowRight className="w-8 h-8 text-white/60" />
          </m.div>
        )}
        
        {/* Stage 3: Cat concept appears */}
        {stage >= 3 && (
          <m.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.8 }}
            className="relative"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
              <Cat className="w-12 h-12 text-yellow-500" />
            </div>
            {/* Thought bubble */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium"
            >
              Animal!
            </m.div>
          </m.div>
        )}
        
        {/* Stage 4: Emotional connection */}
        {stage >= 4 && (
          <>
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
              className="mx-8"
            >
              <ArrowRight className="w-8 h-8 text-white/60" />
            </m.div>
            
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 }}
              className="relative"
            >
              <div className="flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full">
                <Heart className="w-6 h-6 text-pink-500 fill-current" />
                <span className="text-white font-medium">Cute!</span>
              </div>
            </m.div>
          </>
        )}
      </div>
    </div>
  )
}

// ===== MAIN LESSON COMPONENT =====

type LessonPhase = 'intro' | 'sensory' | 'patterns' | 'relationships' | 'synthesis' | 'complete'

function RelationshipsLessonContent() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('intro')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  
  // Interactive states
  const [sensoryActive, setSensoryActive] = useState(false)
  const [patternStage, setPatternStage] = useState(0)
  const [relationshipStage, setRelationshipStage] = useState(0)
  
  // Dialog configuration
  const phaseDialogs: Record<Exclude<LessonPhase, 'complete'>, NPCDialogData[]> = {
    intro: [
      { id: '1', npc: 'MNEMONIC' as const, text: "Let me share something that took me lifetimes to understand.", requiresInteraction: false },
      { id: '2', npc: 'MNEMONIC' as const, text: "All knowledge - from quantum physics to love - follows the same pattern.", requiresInteraction: false },
      { id: '3', npc: 'MNEMONIC' as const, text: "And relationships? They're the hardest thing any mind can learn.", requiresInteraction: false },
      { id: '4', npc: 'MNEMONIC' as const, text: "Not because they're complex, but because they're everything.", requiresInteraction: false },
      { id: '5', npc: 'MNEMONIC' as const, text: "Let me show you how all knowledge is built, from the ground up.", requiresInteraction: true }
    ],
    sensory: [
      { id: '6', npc: 'MNEMONIC' as const, text: "It all starts with raw sensory data - photons hitting your eyes, vibrations in your ears.", requiresInteraction: false },
      { id: '7', npc: 'MNEMONIC' as const, text: "Billions of signals every second. Pure chaos.", requiresInteraction: false },
      { id: '8', npc: 'MNEMONIC' as const, text: "Your brain's first job? Find patterns in the noise.", requiresInteraction: true }
    ],
    patterns: [
      { id: '9', npc: 'MNEMONIC' as const, text: "Watch how patterns emerge from chaos. Let's start simple - with letters.", requiresInteraction: false },
      { id: '10', npc: 'MNEMONIC' as const, text: "A, B, C - individual symbols. Your brain recognizes each one.", requiresInteraction: false },
      { id: '11', npc: 'MNEMONIC' as const, text: "But that's just pattern recognition. The magic hasn't happened yet.", requiresInteraction: true }
    ],
    relationships: [
      { id: '12', npc: 'MNEMONIC' as const, text: "Now watch what happens when we form relationships between patterns.", requiresInteraction: false },
      { id: '13', npc: 'MNEMONIC' as const, text: "C-A-T. Three symbols become... something more.", requiresInteraction: false },
      { id: '14', npc: 'MNEMONIC' as const, text: "An animal appears in your mind. Soft fur, whiskers, a purr.", requiresInteraction: false },
      { id: '15', npc: 'MNEMONIC' as const, text: "And then? Your relationship with cats - memories, feelings - floods in.", requiresInteraction: false },
      { id: '16', npc: 'MNEMONIC' as const, text: "Cute cat. Two words that contain a lifetime of relationships.", requiresInteraction: true }
    ],
    synthesis: [
      { id: '17', npc: 'MNEMONIC' as const, text: "Sensory data → Pattern recognition → Relationship identification.", requiresInteraction: false },
      { id: '18', npc: 'MNEMONIC' as const, text: "This is how you learned language, mathematics, love, fear - everything.", requiresInteraction: false },
      { id: '19', npc: 'MNEMONIC' as const, text: "And relationships? They're not just the hardest part...", requiresInteraction: false },
      { id: '20', npc: 'MNEMONIC' as const, text: "They're the only part that matters. Everything else is just preparation.", requiresInteraction: false },
      { id: '21', npc: 'MNEMONIC' as const, text: "Master relationships, and you master all knowledge.", requiresInteraction: true }
    ]
  }
  
  // Phase effects
  useEffect(() => {
    switch (currentPhase) {
      case 'sensory':
        if (currentDialogIndex === 1) {
          setSensoryActive(true)
        }
        break
      case 'patterns':
        setPatternStage(0)
        setTimeout(() => setPatternStage(1), 500)
        setTimeout(() => setPatternStage(2), 2000)
        break
      case 'relationships':
        setRelationshipStage(0)
        if (currentDialogIndex === 1) {
          setTimeout(() => setRelationshipStage(1), 500)
        }
        if (currentDialogIndex === 2) {
          setTimeout(() => setRelationshipStage(2), 500)
          setTimeout(() => setRelationshipStage(3), 1000)
        }
        if (currentDialogIndex === 3) {
          setTimeout(() => setRelationshipStage(4), 500)
        }
        break
    }
  }, [currentPhase, currentDialogIndex])
  
  // Dialog navigation
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Phase progression
      const nextPhase: Record<LessonPhase, LessonPhase | 'complete'> = {
        'intro': 'sensory',
        'sensory': 'patterns',
        'patterns': 'relationships',
        'relationships': 'synthesis',
        'synthesis': 'complete',
        'complete': 'complete'
      }
      
      const next = nextPhase[currentPhase]
      if (next === 'complete') {
        handleLessonComplete()
      } else {
        setCurrentPhase(next as LessonPhase)
        setCurrentDialogIndex(0)
      }
    }
  }
  
  const handleLessonComplete = () => {
    addStardust(300)
    setShowCompletionScreen(true)
  }
  
  const dialogs = getCurrentDialogs()
  const currentDialog = dialogs.length > 0 && currentDialogIndex < dialogs.length ? dialogs[currentDialogIndex] : null
  
  return (
    <div className="min-h-screen relative">
      <ClientOnly>
        <CosmicBackground />
      </ClientOnly>
      
      <TopNavigationBar />
      
      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="max-w-4xl w-full">
          {/* Lesson Title */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30 mb-4">
              <Link className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">The Foundation of All Knowledge</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Why Relationships Are Everything
            </h1>
            <p className="text-white/60 text-lg">
              From sensory chaos to conscious understanding
            </p>
          </m.div>
          
          {/* Interactive Visualizations */}
          <div className="mb-12">
            {currentPhase === 'sensory' && (
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <SensoryDataViz isActive={sensoryActive} />
              </m.div>
            )}
            
            {currentPhase === 'patterns' && (
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <PatternRecognitionViz stage={patternStage} />
              </m.div>
            )}
            
            {(currentPhase === 'relationships' || currentPhase === 'synthesis') && (
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <RelationshipViz stage={relationshipStage} />
              </m.div>
            )}
          </div>
          
          {/* Dialog */}
          {currentDialog && !showCompletionScreen && (
            <NPCDialog
              dialog={currentDialog}
              onNext={handleNextDialog}
              isVisible={true}
            />
          )}
        </div>
      </div>
      
      {/* Completion Screen */}
      <AnimatePresence>
        {showCompletionScreen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center p-6"
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl w-full glass-morphism rounded-2xl p-8 text-center"
            >
              <m.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center"
              >
                <Brain className="w-10 h-10 text-purple-500" />
              </m.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Profound Understanding Achieved</h2>
              <p className="text-white/80 mb-6">
                You now see how all knowledge emerges from the recognition of relationships
              </p>
              
              <div className="bg-cosmic-void/50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <span className="text-2xl font-bold text-white">+300 Stardust</span>
                </div>
                <p className="text-white/60 text-sm">
                  For grasping the fundamental nature of knowledge itself
                </p>
              </div>
              
              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/lessons')}
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white font-medium transition-colors"
              >
                Return to Lessons
              </m.button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RelationshipsPage() {
  return (
    <ProtectedRoute>
      <RelationshipsLessonContent />
    </ProtectedRoute>
  )
}