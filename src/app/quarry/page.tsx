'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Pickaxe, Mountain, Gem, ArrowRight, Lightbulb, Target, CheckCircle } from 'lucide-react'
import LandingBackground from '@/components/effects/LandingBackground'
import NPCDialog from '@/components/npcs/NPCDialog'

interface LessonSection {
  id: string
  title: string
  icon: React.ReactNode
  content: string
  revelation: string
  interactive?: {
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }
}

const QUARRY_LESSONS: LessonSection[] = [
  {
    id: 'foundation',
    title: 'The Foundation of All Knowledge',
    icon: <Mountain className="w-6 h-6" />,
    content: "Before we ascend to the stars, we must understand the ground beneath our feet. Knowledge is not a tower built in the air—it is a mountain carved from bedrock. Every concept, every idea, every breakthrough begins with foundation stones.",
    revelation: "Foundation Truth: All complex understanding is built upon simple, solid principles. Master the basics, and you master the cosmos."
  },
  {
    id: 'names',
    title: 'The Clear Name Principle',
    icon: <Lightbulb className="w-6 h-6" />,
    content: "In ancient times, humans named the stars after gods and heroes. But a star is not Zeus—it is a nuclear furnace of hydrogen becoming helium. When we name things by what they ARE rather than who discovered them, understanding becomes crystal clear.",
    revelation: "Naming Truth: Concepts named by their true nature are easier to understand, remember, and apply.",
    interactive: {
      question: "Which name better describes what happens when you heat water until it becomes gas?",
      options: [
        "Boiling (describes the action)",
        "The Celsius Effect (named after Anders Celsius)",
        "Thermodynamic Phase Transition (technical jargon)",
        "Heat-Induced State Change (describes what actually happens)"
      ],
      correctAnswer: 3,
      explanation: "OBELISK chooses 'Heat-Induced State Change' because it tells you exactly what's happening: heat causes the water to change from liquid to gas. Clear names create clear understanding."
    }
  },
  {
    id: 'connection',
    title: 'The Web of Understanding',
    icon: <Gem className="w-6 h-6" />,
    content: "Knowledge is not isolated facts floating in space. It is a cosmic web where every concept connects to others. When you learn about gravity, you also learn about time, space, mass, and energy. Everything touches everything.",
    revelation: "Connection Truth: Isolated facts are forgotten. Connected knowledge becomes wisdom.",
    interactive: {
      question: "How does learning about gravity help you understand other concepts?",
      options: [
        "It doesn't—gravity is just about falling objects",
        "Gravity connects to time dilation, planetary motion, and the structure of spacetime",
        "Gravity only applies to physics, nothing else",
        "Gravity is too complex to connect to other ideas"
      ],
      correctAnswer: 1,
      explanation: "Gravity isn't just 'things fall down.' It's the curvature of spacetime that affects how time flows, how planets orbit, how light bends, and how the universe itself is structured. One concept, infinite connections."
    }
  },
  {
    id: 'growth',
    title: 'Growing Like a Celestial Body',
    icon: <Target className="w-6 h-6" />,
    content: "You begin as a grain of sand—tiny, seemingly insignificant. But even the mightiest stars began as cosmic dust. Through learning, you accumulate mass (Stardust), grow in size and influence, and eventually become a force that shapes the space around you.",
    revelation: "Growth Truth: Small, consistent accumulation of knowledge creates gravitational pull that attracts even more understanding."
  }
]

export default function QuarryPage() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set())
  const [showInteractive, setShowInteractive] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showFinalDialog, setShowFinalDialog] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)

  const finalDialog = {
    id: 'quarry-complete',
    npc: 'ERRATA' as const,
    text: "Excellent work, young Singularity! You've excavated the foundational truths from the Quarry of Knowledge. You've earned your first 100 Stardust and are ready to begin your cosmic journey. The Constellation Map awaits you!",
    requiresInteraction: true
  }

  const currentLesson = QUARRY_LESSONS[currentSection]
  const isLastSection = currentSection === QUARRY_LESSONS.length - 1

  const handleSectionComplete = () => {
    const newCompleted = new Set(completedSections)
    newCompleted.add(currentSection)
    setCompletedSections(newCompleted)

    if (currentLesson.interactive && !showInteractive) {
      setShowInteractive(true)
    } else {
      handleNextSection()
    }
  }

  const handleInteractiveComplete = () => {
    setShowInteractive(false)
    if (selectedAnswer === currentLesson.interactive!.correctAnswer) {
      setEarnedStardust(prev => prev + 25) // Bonus stardust for correct answers
    }
    handleNextSection()
  }

  const handleNextSection = () => {
    if (isLastSection) {
      setEarnedStardust(prev => prev + 100) // Base completion reward
      setShowFinalDialog(true)
    } else {
      setCurrentSection(currentSection + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handleFinalDialogComplete = () => {
    setShowFinalDialog(false)
    router.push('/constellations')
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowExplanation(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LandingBackground />
      
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 p-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <m.div
            className="flex items-center justify-center gap-3 mb-4"
            animate={{ 
              textShadow: [
                '0 0 10px rgba(233, 69, 96, 0.3)',
                '0 0 20px rgba(233, 69, 96, 0.6)',
                '0 0 10px rgba(233, 69, 96, 0.3)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Pickaxe className="w-8 h-8 text-cosmic-starlight" />
            <h1 className="text-4xl font-bold cosmic-text-gradient cosmic-heading">
              Enter the Quarry
            </h1>
            <Pickaxe className="w-8 h-8 text-cosmic-aurora" />
          </m.div>
          <p className="text-white/80 text-lg leading-relaxed">
            Where the foundations of knowledge are excavated
          </p>
        </div>
      </m.div>

      {/* Progress Bar */}
      <div className="relative z-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Progress</span>
            <span className="text-white/60 text-sm">
              {completedSections.size} / {QUARRY_LESSONS.length} completed
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <m.div
              className="bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(completedSections.size / QUARRY_LESSONS.length) * 100}%`
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <AnimatePresence mode="wait">
          {!showInteractive ? (
            /* Lesson Content */
            <m.div
              key={`lesson-${currentSection}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl"
            >
              <div className="glass-morphism rounded-3xl p-8 border border-white/20 shadow-cosmic">
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-full bg-gradient-to-r from-cosmic-starlight/20 to-cosmic-aurora/20 border border-white/20">
                    {currentLesson.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white cosmic-heading">
                      {currentLesson.title}
                    </h2>
                    <p className="text-cosmic-starlight text-sm">
                      Section {currentSection + 1} of {QUARRY_LESSONS.length}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <m.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/80 text-lg leading-relaxed"
                  >
                    {currentLesson.content}
                  </m.p>

                  {/* Revelation Box */}
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-cosmic-starlight/10 to-cosmic-aurora/10 rounded-xl p-6 border border-cosmic-starlight/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Gem className="w-5 h-5 text-cosmic-starlight" />
                      <span className="text-cosmic-starlight font-semibold">Cosmic Revelation</span>
                    </div>
                    <p className="text-white/90 italic leading-relaxed">
                      {currentLesson.revelation}
                    </p>
                  </m.div>

                  {/* Continue Button */}
                  <m.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={handleSectionComplete}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora text-white font-semibold cosmic-button shadow-cosmic hover:shadow-stardust transition-all duration-75 duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {currentLesson.interactive ? (
                        <>
                          <Target className="w-5 h-5" />
                          Test Your Understanding
                        </>
                      ) : isLastSection ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Complete the Quarry
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          Continue Excavating
                        </>
                      )}
                    </span>
                  </m.button>
                </div>
              </div>
            </m.div>
          ) : (
            /* Interactive Question */
            <m.div
              key={`interactive-${currentSection}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl"
            >
              <div className="glass-morphism rounded-3xl p-8 border border-white/20 shadow-cosmic">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white cosmic-heading mb-4">
                    Test Your Understanding
                  </h2>
                  <p className="text-white/80 text-lg">
                    {currentLesson.interactive!.question}
                  </p>
                </div>

                <div className="space-y-4">
                  {currentLesson.interactive!.options.map((option, index) => (
                    <m.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-75 duration-300 ${
                        selectedAnswer === null
                          ? 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-cosmic-starlight/50'
                          : selectedAnswer === index
                          ? index === currentLesson.interactive!.correctAnswer
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : index === currentLesson.interactive!.correctAnswer && showExplanation
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-white/5 opacity-50'
                      }`}
                      whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                      whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                    >
                      <span className="text-white font-medium">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </m.button>
                  ))}
                </div>

                {showExplanation && (
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-xl bg-gradient-to-r from-cosmic-starlight/10 to-cosmic-aurora/10 border border-white/20"
                  >
                    <h3 className="text-white font-semibold mb-3">
                      {selectedAnswer === currentLesson.interactive!.correctAnswer
                        ? '🎉 Excellent reasoning!'
                        : '🤔 Not quite, but great attempt!'}
                    </h3>
                    <p className="text-white/80 leading-relaxed mb-4">
                      {currentLesson.interactive!.explanation}
                    </p>
                    <button
                      onClick={handleInteractiveComplete}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora text-white font-semibold cosmic-button transition-all duration-75 duration-300"
                    >
                      Continue
                    </button>
                  </m.div>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stardust Earned Display */}
      {earnedStardust > 0 && (
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <div className="glass-morphism rounded-xl p-4 border border-cosmic-stardust">
            <div className="flex items-center gap-2 text-cosmic-stardust">
              <Gem className="w-5 h-5" />
              <span className="font-bold">+{earnedStardust} Stardust</span>
            </div>
          </div>
        </m.div>
      )}

      {/* Final Dialog */}
      {showFinalDialog && (
        <NPCDialog
          dialog={finalDialog}
          onNext={handleFinalDialogComplete}
          isVisible={showFinalDialog}
        />
      )}
    </div>
  )
}