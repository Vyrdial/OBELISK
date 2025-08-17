'use client'

import { useState, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, Target, Award } from 'lucide-react'
import NPCDialog, { NPCDialogData } from '@/components/npcs/NPCDialog'
import QuizInterface from './QuizInterface'
import StardustCounter from '@/components/ui/StardustCounter'
import InteractiveChangeTrendGraph from './InteractiveChangeTrendGraph'

interface LessonData {
  id: string
  title: string
  constellationTitle: string
  dialogs: NPCDialogData[]
  quiz?: QuizData
  xpReward: number
  stardustReward: number
}

interface QuizData {
  id: string
  questions: QuizQuestion[]
  passingScore: number
  stardustReward: number
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  hint?: string
}

interface LessonInterfaceProps {
  lesson: LessonData
  onComplete: (score?: number) => void
  onBack: () => void
}

type LessonPhase = 'lesson' | 'quiz' | 'complete'

export default function LessonInterface({ lesson, onComplete, onBack }: LessonInterfaceProps) {
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('lesson')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showDialog, setShowDialog] = useState(true)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(0) // 0 = manual, 30000 = 30 seconds
  
  // Timer ref for cleanup
  const completionTimer = useRef<NodeJS.Timeout | null>(null)
  const [showInteractiveModule, setShowInteractiveModule] = useState(false)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (completionTimer.current) {
        clearTimeout(completionTimer.current)
      }
    }
  }, [])

  const handleNextDialog = () => {
    if (currentDialogIndex < lesson.dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
      // Show interactive module when LAGOM starts talking (dialog 6)
      if (currentDialogIndex === 5) { // Moving to dialog 6 (0-indexed)
        setShowInteractiveModule(true)
      }
    } else {
      setShowDialog(false)
      if (lesson.quiz) {
        setCurrentPhase('quiz')
      } else {
        setCurrentPhase('complete')
        handleLessonComplete()
      }
    }
  }

  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
      // Hide interactive module if going back from it
      if (currentDialogIndex === 6) { // Going back from dialog 6 (0-indexed)
        setShowInteractiveModule(false)
      }
    }
  }

  const handleQuizComplete = (totalQuestions: number) => {
    setQuizScore(0) // Will need to be calculated elsewhere
    
    const stardust = lesson.stardustReward + (lesson.quiz?.stardustReward || 0)
    setEarnedStardust(stardust)
    
    setCurrentPhase('complete')
    // Clear any existing timer
    if (completionTimer.current) {
      clearTimeout(completionTimer.current)
    }
    // Set new timer with cleanup
    completionTimer.current = setTimeout(() => {
      handleLessonComplete(0)
      completionTimer.current = null
    }, 2000)
  }

  const handleLessonComplete = (score?: number) => {
    onComplete(score)
  }

  const handleQuizFailure = (questionId: string, question: string, reason: string) => {
  }

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-nebula-gradient opacity-30 pointer-events-none" />
      
      {/* Header */}
      <m.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 p-4 border-b border-white/10 glass-morphism"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <m.button
              onClick={onBack}
              className="p-2 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-75 cosmic-focus"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </m.button>
            
            <div>
              <h1 className="text-xl font-bold text-white cosmic-heading">
                {lesson.title}
              </h1>
              <p className="text-cosmic-starlight text-sm">
                {lesson.constellationTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            <StardustCounter count={earnedStardust} showAnimation={earnedStardust > 0} />
            
          </div>
        </div>
      </m.header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {currentPhase === 'lesson' && (
              <div className="relative min-h-[60vh]">
                {/* Main Interactive Module Area */}
                {showInteractiveModule ? (
                  <m.div
                    key="interactive-module"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-[70vh] glass-morphism rounded-3xl border border-white/20 p-8 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white cosmic-heading mb-4">
                        Interactive Change Trend Explorer
                      </h3>
                      <p className="text-white/60 mb-8">
                        Drag the reference point and observe how change trends emerge around it
                      </p>
                      
                      {/* Interactive Graph Component */}
                      <div className="w-full h-96">
                        <InteractiveChangeTrendGraph 
                          onReferencePointChange={(x) => console.log('Reference point:', x)}
                          onObserverPositionChange={(x) => console.log('Observer position:', x)}
                        />
                      </div>
                    </div>
                  </m.div>
                ) : (
                  /* Learning in Progress - Main View */
                  <m.div
                    key="lesson-main"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="min-h-[60vh] flex items-center justify-center"
                  >
                    <div className="text-center max-w-2xl">
                      <m.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-cosmic-starlight to-cosmic-aurora shadow-cosmic flex items-center justify-center"
                      >
                        <BookOpen className="w-16 h-16 text-white" />
                      </m.div>
                      
                      <h2 className="text-3xl font-bold text-white cosmic-heading mb-4">
                        Learning in Progress
                      </h2>
                      
                      <p className="text-white/70 text-lg">
                        Follow along with your cosmic guide as they reveal the secrets of this concept.
                      </p>

                      <div className="mt-8 flex justify-center">
                        <div className="px-4 py-2 glass-morphism rounded-full border border-white/20">
                          <span className="text-white/60 text-sm">
                            Dialog {currentDialogIndex + 1} of {lesson.dialogs.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}

                {/* Minimized Learning Progress - Corner */}
                {showInteractiveModule && (
                  <m.div
                    initial={{ opacity: 0, x: 50, y: 50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    className="absolute top-4 right-4 w-64 glass-morphism rounded-xl border border-white/20 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <m.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-starlight to-cosmic-aurora flex items-center justify-center"
                      >
                        <BookOpen className="w-4 h-4 text-white" />
                      </m.div>
                      
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">Learning in Progress</p>
                        <p className="text-white/60 text-xs">
                          Dialog {currentDialogIndex + 1} of {lesson.dialogs.length}
                        </p>
                      </div>
                    </div>
                  </m.div>
                )}
              </div>
            )}

            {currentPhase === 'quiz' && lesson.quiz && (
              <QuizInterface
                quiz={lesson.quiz}
                onComplete={handleQuizComplete}
                onFailure={handleQuizFailure}
              />
            )}

            {currentPhase === 'complete' && (
              <m.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[60vh] flex items-center justify-center"
              >
                <div className="text-center max-w-2xl">
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-cosmic-aurora to-cosmic-stardust shadow-stardust flex items-center justify-center"
                  >
                    <Award className="w-16 h-16 text-white" />
                  </m.div>
                  
                  <m.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold cosmic-text-gradient cosmic-heading mb-4"
                  >
                    Constellation Mastered!
                  </m.h2>
                  
                  <m.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-white/70 text-lg mb-8"
                  >
                    You&apos;ve successfully completed &quot;{lesson.title}&quot; and earned your cosmic rewards.
                  </m.p>

                  {quizScore !== null && lesson.quiz && (
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="mb-8 p-4 glass-morphism rounded-xl border border-white/20"
                    >
                      <p className="text-white/80">
                        Quiz Score: <span className="font-bold text-cosmic-quasar">
                          {quizScore}/{lesson.quiz.questions.length}
                        </span>
                      </p>
                    </m.div>
                  )}

                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  >
                    <div className="px-6 py-3 glass-morphism rounded-full border border-cosmic-aurora/30">
                      <span className="text-cosmic-aurora font-semibold">
                        +{lesson.xpReward} XP
                      </span>
                    </div>
                    
                    <StardustCounter 
                      count={earnedStardust} 
                      showAnimation={true}
                      size="lg"
                    />
                  </m.div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* NPC Dialog Overlay */}
      {showDialog && currentPhase === 'lesson' && (
        <NPCDialog
          dialog={lesson.dialogs[currentDialogIndex]}
          onNext={handleNextDialog}
          onBack={handleBackDialog}
          isVisible={showDialog}
          autoAdvanceDelay={autoAdvanceDelay}
          canGoBack={currentDialogIndex > 0}
        />
      )}
    </div>
  )
}