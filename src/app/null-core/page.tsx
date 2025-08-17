'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { dictionaryService, predefinedEntries } from '@/lib/dictionaryService'
import { m, AnimatePresence } from 'framer-motion'
import { BookOpen, Award, MousePointer, RefreshCw, ChevronRight, X, Sparkles, Clock, Brain, ArrowRight } from 'lucide-react'
import NPCDialog from '@/components/npcs/NPCDialog'
import NPCAvatar from '@/components/npcs/NPCAvatar'
import QuizInterface from '@/components/lesson/QuizInterface'
import StardustCounter from '@/components/ui/StardustCounter'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import AchievementToast, { achievements, Achievement } from '@/components/effects/AchievementToast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import EquippedAvatar from '@/components/ui/EquippedAvatar'

type LessonPhase = 'intro' | 'zoom' | 'truth' | 'interactive' | 'summary' | 'quiz' | 'quiz-complete' | 'complete'

// Dot component with zoom animation
function ZoomingDot({ zoomLevel, onZoomComplete }: { zoomLevel: number; onZoomComplete?: () => void }) {
  const [scale, setScale] = useState(1)
  const animationRef = useRef<number>()
  const startScale = useRef(1)
  const targetScales = [1, 3, 10, 100] // Different zoom levels

  useEffect(() => {
    const targetScale = targetScales[zoomLevel] || 1
    startScale.current = scale
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / 2000, 1) // 2 second transitions
      
      // Ease out animation
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)
      const currentScale = startScale.current + (targetScale - startScale.current) * easeOutProgress
      setScale(currentScale)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        if (onZoomComplete) {
          onZoomComplete()
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [zoomLevel, onZoomComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20">
      <div style={{ transform: `scale(${scale})` }}>
        <EquippedAvatar size="lg" crownScaleMultiplier={0} />
      </div>
    </div>
  )
}

// Interactive click demo
function InteractiveDemo({ onComplete }: { onComplete: () => void }) {
  const [clicks, setClicks] = useState<{ x: number; y: number; id: string }[]>([])
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [unlockedCenturionAchievement, setUnlockedCenturionAchievement] = useState<Achievement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { addStardust, addAchievement, profile } = useProfile()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || clicks.length >= 100) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newClick = { x, y, id: `${x}-${y}-${Date.now()}` }
    const newClicks = [...clicks, newClick]
    setClicks(newClicks)
    
    // Check for 100 dots achievement
    if (newClicks.length === 100) {
      handleCenturionAchievement()
    }
  }

  const handleCenturionAchievement = async () => {
    // Award secret achievement and stardust for placing 100 dots
    const centurionAchievement = achievements.find(a => a.id === 'centurion-dots')
    if (centurionAchievement && !profile?.achievements?.includes('centurion-dots')) {
      await addAchievement('centurion-dots')
      await addStardust(25) // Bonus stardust for the secret achievement
      setUnlockedCenturionAchievement(centurionAchievement)
    }
  }

  const handleDotHover = (clickId: string, x: number, y: number) => {
    setShowTooltip(clickId)
  }

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black z-30 flex items-center justify-center p-8"
    >
      <div className="max-w-6xl w-full h-full flex flex-col">
        <div className="text-center mb-6">
          <MousePointer className="w-12 h-12 text-cosmic-aurora mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Try it yourself</h2>
          <p className="text-white/80">Click anywhere in the box to place markers (max 100)</p>
          {clicks.length >= 90 && clicks.length < 100 && (
            <p className="text-cosmic-aurora text-sm mt-2">
              {100 - clicks.length} more for a secret achievement...
            </p>
          )}
        </div>
        
        <div className="flex-1 relative mb-6">
          <div
            ref={containerRef}
            onClick={handleClick}
            className="relative w-full h-full bg-black/50 border-2 border-dashed border-white/20 rounded-xl cursor-crosshair overflow-hidden"
          >
            <AnimatePresence>
              {clicks.map(click => (
                <m.div
                  key={click.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-10"
                  style={{ left: click.x - 4, top: click.y - 4 }}
                  onMouseEnter={() => handleDotHover(click.id, click.x, click.y)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <EquippedAvatar size="xs" crownScaleMultiplier={0} />
                  
                  {/* Tooltip - only show on hover and position it better */}
                  {showTooltip === click.id && (
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: -40 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50"
                      style={{
                        // Adjust position if near edges
                        left: click.x > containerRef.current!.clientWidth - 120 ? 'auto' : '50%',
                        right: click.x > containerRef.current!.clientWidth - 120 ? '0' : 'auto',
                        transform: click.x > containerRef.current!.clientWidth - 120 ? 'none' : 'translateX(-50%)'
                      }}
                    >
                      <div>Marker {clicks.indexOf(click) + 1} at ({Math.round(click.x)}, {Math.round(click.y)})</div>
                      <div className="text-cosmic-aurora text-[10px]">Null core exists here (invisible)</div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                    </m.div>
                  )}
                </m.div>
              ))}
            </AnimatePresence>
            
            {clicks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                Click to place markers
              </div>
            )}
            
            {clicks.length === 100 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-cosmic-aurora">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Maximum Reached!</h3>
                  <p className="text-white/80">100 null core markers placed</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            {clicks.length}/100 markers placed
          </div>
          
          <div className="flex items-center gap-4">
            {clicks.length > 0 && (
              <button
                onClick={() => setClicks([])}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/80"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All
              </button>
            )}
            
            <m.button
              onClick={onComplete}
              disabled={clicks.length < 3}
              className={`px-6 py-3 font-medium rounded-xl transition-colors flex items-center gap-2 ${
                clicks.length >= 3 
                  ? 'bg-cosmic-aurora text-white hover:bg-cosmic-aurora/80 cursor-pointer' 
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
              whileHover={{ scale: clicks.length >= 3 ? 1.05 : 1 }}
              whileTap={{ scale: clicks.length >= 3 ? 0.95 : 1 }}
            >
              Continue ({clicks.length >= 3 ? '✓' : `${clicks.length}/3`})
              <ChevronRight className="w-4 h-4" />
            </m.button>
          </div>
        </div>
      </div>
      
      {/* Achievement Toast for Centurion */}
      <AnimatePresence>
        {unlockedCenturionAchievement && (
          <AchievementToast
            achievement={unlockedCenturionAchievement}
            onClose={() => setUnlockedCenturionAchievement(null)}
          />
        )}
      </AnimatePresence>
    </m.div>
  )
}

// Minimized lesson progress
function MinimizedProgress({ currentPhase, onExpand }: { currentPhase: LessonPhase; onExpand: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-20 left-4 z-40 glass-morphism rounded-xl p-3 border border-white/20"
    >
      <button
        onClick={onExpand}
        className="flex items-center gap-3 text-sm hover:bg-white/5 rounded-lg transition-colors p-1"
      >
        <NPCAvatar npc="ERRATA" size="sm" />
        <div className="text-left">
          <p className="text-white/60">Learning in Progress</p>
          <p className="text-cosmic-aurora font-medium">The Null Core</p>
        </div>
      </button>
    </m.div>
  )
}

const quiz = {
  id: 'null-core-quiz',
  questions: [
    {
      id: 'q1',
      question: "What is the relationship between a dot and a null core?",
      options: [
        "They are exactly the same thing",
        "The dot shows where the null core exists",
        "The null core exists inside the dot",
        "The dot physically creates the null core"
      ],
      correctAnswer: 1,
      explanation: "Dot = marker. Null core = invisible (no size).",
      hint: "Markers show invisible things."
    },
    {
      id: 'q2',
      question: "Why can't you see a null core directly?",
      options: [
        "It's far too small to see clearly",
        "It's completely transparent to light",
        "It has no size or extent to be visible",
        "It moves around too fast to track"
      ],
      correctAnswer: 2,
      explanation: "No size = invisible.",
      hint: "Position, no extent."
    },
    {
      id: 'q3',
      question: "Which statement best describes a null core?",
      options: [
        "A very tiny particle at a specific location",
        "Empty space that has been clearly marked",
        "A location where nothing can change or vary",
        "The exact center point of any visible dot"
      ],
      correctAnswer: 2,
      partialCredit: { 3: "Close. Null core = invisible point, no size." },
      explanation: "Absence of variation at a position.",
      hint: "No variation, no extent."
    }
  ],
  passingScore: 2,
  stardustReward: 50
}

function NullCoreLessonContent() {
  const router = useRouter()
  const { profile, addStardust, addAchievement } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('intro')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(0)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(60) // 60 seconds cooldown
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizTotalQuestions, setQuizTotalQuestions] = useState(0)

  // Phase-specific dialogs
  const phaseDialogs = {
    intro: [
      { id: '1', npc: 'ERRATA' as const, text: "In math, we often use dots like this to show constants, variables, numbers, and positions.", requiresInteraction: false },
      { id: '2', npc: 'ERRATA' as const, text: "But what if we zoom in on the dot?", requiresInteraction: true }
    ],
    zoom: [
      { id: '3', npc: 'ERRATA' as const, text: "Let's get even closer.", requiresInteraction: true },
      { id: '4', npc: 'ERRATA' as const, text: "Even closer!", requiresInteraction: true },
      { id: '5', npc: 'ERRATA' as const, text: "Strange. I'm still zooming, but nothing is changing.", requiresInteraction: true },
      { id: '6', npc: 'ERRATA' as const, text: "Even if we keep zooming, we can't reach the center! Let's zoom back out and see why.", requiresInteraction: true }
    ],
    truth: [
      { id: '7', npc: 'ERRATA' as const, text: "We need to realize that the dot is just a marker for something else: the null core.", requiresInteraction: false },
      { id: '8', npc: 'ERRATA' as const, text: "At the exact center of where we mark... is nothing. Not 'empty space', but truly 'nothing'.", requiresInteraction: false },
      { id: '9', npc: 'ERRATA' as const, text: "To illustrate, we can show just the edge of our marker and draw arrows towards the center.", requiresInteraction: true },
      { id: '10', npc: 'ERRATA' as const, text: "The arrows can point towards the null core, but they can never reach it.", requiresInteraction: true },
      { id: '11', npc: 'ERRATA' as const, text: "Why? It's a dimensional incompatibility - you can't have a 1D/2D arrow \"reach\" a 0D point.", requiresInteraction: true },
      { id: '12', npc: 'ERRATA' as const, text: "No size, no shape, just pure position. This is what we call the Null Core.", requiresInteraction: false },
      { id: '13', npc: 'ERRATA' as const, text: "Null Core: A zero dimensional position.", requiresInteraction: true },
      { id: '14', npc: 'ERRATA' as const, text: "You can't see what has no size. You can't reach what allows no change. The null core is invisible — always.", requiresInteraction: false },
      { id: '15', npc: 'ERRATA' as const, text: "So we use markers — dots — to show WHERE null cores exist. The dot isn't the point itself, just a visual indicator.", requiresInteraction: false },
      { id: '16', npc: 'ERRATA' as const, text: "Every dot you see in mathematics is really saying: 'A null core exists here, but I can't show it to you directly.'", requiresInteraction: false },
      { id: '17', npc: 'ERRATA' as const, text: "This is why zooming didn't work — we were zooming on the marker, not the null core itself!", requiresInteraction: false }
    ],
    interactive: [
      { id: '18', npc: 'ERRATA' as const, text: "Now, let's experiment. Try placing some markers yourself.", requiresInteraction: true }
    ],
    summary: [
      { id: '19', npc: 'ERRATA' as const, text: "Every 'point' you've ever seen is just a location marker. The real position - the null core - is invisible at the center.", requiresInteraction: false },
      { id: '20', npc: 'ERRATA' as const, text: "Points have no size because null cores have no extent.", requiresInteraction: false },
      { id: '21', npc: 'ERRATA' as const, text: "We see dots because we need markers for invisible things. Zooming fails because you're zooming on the marker, not the null core.", requiresInteraction: false },
      { id: '22', npc: 'ERRATA' as const, text: "Remember: Null core = actual, invisible point. Dot = just showing WHERE it is. Every point is really an invisible null core at a position.", requiresInteraction: false },
      { id: '23', npc: 'MNEMONIC' as const, text: "Well, well! Ready to test your understanding of the null core? Let's see if you truly grasp what cannot be grasped!", requiresInteraction: false }
    ],
    'quiz-complete': [] // Will be populated dynamically based on score
  }

  const getCurrentDialogs = () => {
    if (currentPhase === 'quiz-complete') {
      // Generate dynamic commentary based on quiz score
      const percentage = (quizScore / quizTotalQuestions) * 100
      
      if (percentage === 100) {
        return [
          { id: 'qc1', npc: 'MNEMONIC' as const, text: "Perfect!", requiresInteraction: false },
          { id: 'qc2', npc: 'MNEMONIC' as const, text: "You understand null cores.", requiresInteraction: false },
          { id: 'qc3', npc: 'MNEMONIC' as const, text: "Ready for more.", requiresInteraction: false }
        ]
      } else if (percentage >= 80) {
        return [
          { id: 'qc1', npc: 'MNEMONIC' as const, text: `Good! ${quizScore}/${quizTotalQuestions} correct.`, requiresInteraction: false },
          { id: 'qc2', npc: 'MNEMONIC' as const, text: "You grasp the basics.", requiresInteraction: false },
          { id: 'qc3', npc: 'MNEMONIC' as const, text: "Foundation is solid.", requiresInteraction: false }
        ]
      } else if (percentage >= 60) {
        return [
          { id: 'qc1', npc: 'MNEMONIC' as const, text: `${quizScore}/${quizTotalQuestions} correct.`, requiresInteraction: false },
          { id: 'qc2', npc: 'MNEMONIC' as const, text: "Concept is challenging.", requiresInteraction: false },
          { id: 'qc3', npc: 'MNEMONIC' as const, text: "Dots mark invisible cores.", requiresInteraction: false }
        ]
      } else {
        // Failed quiz (score < 60%)
        const needsToPass = quizScore < quiz.passingScore
        return [
          { id: 'qc1', npc: 'MNEMONIC' as const, text: `${quizScore}/${quizTotalQuestions}. Try again.`, requiresInteraction: false },
          { id: 'qc2', npc: 'MNEMONIC' as const, text: "Challenging concept.", requiresInteraction: false },
          { id: 'qc3', npc: 'MNEMONIC' as const, text: needsToPass ? `Need ${quiz.passingScore} to pass.` : "Try again later.", requiresInteraction: false }
        ]
      }
    }
    return phaseDialogs[currentPhase] || []
  }

  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    // Special handling for intro to zoom transition
    if (currentPhase === 'intro' && currentDialogIndex === 1) {
      // Start first zoom when user clicks after "But what if we zoom in?"
      setCurrentPhase('zoom')
      setCurrentDialogIndex(0)
      setZoomLevel(1)
      setIsMinimized(true)
      return
    }
    
    // Handle zoom progression
    if (currentPhase === 'zoom') {
      if (currentDialogIndex === 0) {
        // "Let's get even closer" - zoom to level 2
        setZoomLevel(2)
        setCurrentDialogIndex(1)
        return
      } else if (currentDialogIndex === 1) {
        // "Even closer!" - zoom to level 3
        setZoomLevel(3)
        setCurrentDialogIndex(2)
        return
      } else if (currentDialogIndex === 2) {
        // "Strange. I'm still zooming..." - stay at zoom level 3
        setCurrentDialogIndex(3)
        return
      } else if (currentDialogIndex === 3) {
        // "Let's zoom back out" - animate zoom back to 0
        setZoomLevel(0)
        // Don't change phase yet - let the zoom animation complete
        return
      }
    }
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Move to next phase
      switch (currentPhase) {
        case 'truth':
          setCurrentPhase('interactive')
          setCurrentDialogIndex(0)
          setIsMinimized(true)
          break
        case 'interactive':
          // Handled by interactive component
          break
        case 'summary':
          if (currentDialogIndex === dialogs.length - 1) {
            setShowQuiz(true)
          }
          break
        case 'quiz-complete':
          if (currentDialogIndex === dialogs.length - 1) {
            if (quizScore >= quiz.passingScore) {
              setShowCompletionScreen(true)
            } else {
              // Failed quiz - go back to quiz
              setCurrentPhase('summary')
              setCurrentDialogIndex(dialogs.length - 1) // Show Mnemonic's quiz intro again
            }
          }
          break
      }
    }
  }

  const handleInteractiveComplete = () => {
    setIsMinimized(false)
    setCurrentPhase('summary')
    setCurrentDialogIndex(0)
  }

  const handleQuizComplete = async (totalQuestions: number) => {
    // Store score and total questions for Mnemonic's commentary
    setQuizScore(0) // Will need to be calculated elsewhere
    setQuizTotalQuestions(totalQuestions)
    
    // Always show Mnemonic's commentary after quiz
    setShowQuiz(false)
    setCurrentPhase('quiz-complete')
    setCurrentDialogIndex(0)
  }

  // Cooldown timer effect
  useEffect(() => {
    if (!showCompletionScreen) return
    
    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [showCompletionScreen])

  const currentDialog = getCurrentDialogs()[currentDialogIndex]

  return (
    <div className="min-h-screen bg-black relative">
      <TopNavigationBar />

      {/* Main content based on phase */}
      {/* Show dot for intro phase only */}
      {currentPhase === 'intro' && (
        <div className="fixed inset-0 flex items-center justify-center z-20">
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <EquippedAvatar size="lg" crownScaleMultiplier={0} />
          </m.div>
          {/* Bouncing arrow pointing to the dot */}
          {currentDialogIndex === 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 0.5 },
                y: { 
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none"
            >
              <div className="mt-20 text-white text-3xl">
                ↑
              </div>
            </m.div>
          )}
        </div>
      )}

      {/* Zoom animation when active */}
      {currentPhase === 'zoom' && (
        <ZoomingDot 
          zoomLevel={zoomLevel}
          onZoomComplete={() => {
            // Show dialog after zoom completes
            if (zoomLevel > 0) {
              setTimeout(() => {
                setIsMinimized(false)
              }, 500)
            } else {
              // Zoom level is 0, we've zoomed back out - transition to truth phase
              setTimeout(() => {
                setIsMinimized(false)
                setCurrentPhase('truth')
                setCurrentDialogIndex(0)
              }, 500)
            }
          }}
        />
      )}

      {currentPhase === 'truth' && (
        <div className="fixed inset-0 flex items-center justify-center z-20 p-8">
          <div className="max-w-4xl w-full">
            {/* Show dot throughout most of truth phase */}
            {currentDialogIndex <= 1 && (
              <div className="fixed inset-0 flex items-center justify-center z-20">
                <EquippedAvatar size="lg" crownScaleMultiplier={0} />
              </div>
            )}
            
            {/* Show circle with fading marker and arrows for dialog 9 */}
            {currentDialogIndex === 2 && (
              <div className="relative mx-auto w-64 h-64 mb-32">
                {/* Fading marker */}
                <m.div
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0.2, scale: 0.8 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <EquippedAvatar size="lg" crownScaleMultiplier={0} />
                </m.div>
                {/* Circle edge appearing */}
                <m.div
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-0 border-2 border-white/60 rounded-full"
                />
              </div>
            )}
            
            {/* Show circle with arrows for dialogs 10, 11, and 12 */}
            {(currentDialogIndex === 3 || currentDialogIndex === 4 || currentDialogIndex === 5) && (
              <div className="relative mx-auto w-64 h-64 mb-32">
                {/* Circle edge */}
                <div className="absolute inset-0 border-2 border-white/60 rounded-full" />
                
                {/* Arrows starting from circumference pointing toward center */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
                  <m.div
                    key={angle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    }}
                  >
                    <m.div
                      animate={{ 
                        y: [-120, -15, -120],
                        scale: 1.2,
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5 + index * 0.1
                      }}
                      className="text-white text-4xl"
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))',
                        transformOrigin: 'center'
                      }}
                    >
                      ↓
                    </m.div>
                  </m.div>
                ))}
              </div>
            )}
            
            {/* Show dot with label for final dialogs */}
            {(currentDialogIndex >= 8 && currentDialogIndex <= 10) && (
              <div className="relative mx-auto w-8 h-8 mb-32">
                <EquippedAvatar size="lg" crownScaleMultiplier={0} />
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/60 text-sm whitespace-nowrap"
                >
                  ↑ marker (what you see)
                </m.div>
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cosmic-aurora text-xs"
                >
                  •
                </m.div>
              </div>
            )}
            
            {/* Definition unlock animation on dialog 13 (index 6) */}
            {currentDialogIndex === 6 && (
              <m.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                onAnimationComplete={() => {
                  // Add to dictionary when animation completes
                  dictionaryService.addEntry(predefinedEntries['null-core'])
                }}
                className="bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border-2 border-cosmic-aurora rounded-xl p-6 mb-32"
              >
                <div className="flex items-center gap-2 mb-3">
                  <m.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkles className="w-6 h-6 text-cosmic-aurora" />
                  </m.div>
                  <h3 className="text-cosmic-aurora font-bold text-xl">DEFINITION UNLOCKED!</h3>
                </div>
                <p className="text-white font-medium mb-2">Null Core</p>
                <p className="text-white/80">
                  A zero dimensional position.
                </p>
                <m.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-cosmic-starlight text-sm mt-3"
                >
                  ✨ Added to the Archive
                </m.p>
              </m.div>
            )}
          </div>
        </div>
      )}

      {currentPhase === 'interactive' && currentDialog?.requiresInteraction && (
        <InteractiveDemo onComplete={handleInteractiveComplete} />
      )}

      {currentPhase === 'summary' && (
        <div className="fixed inset-0 flex items-center justify-center z-20 p-8">
          <div className="max-w-2xl w-full">
            {currentDialogIndex >= 2 && (
              <div className="grid grid-cols-2 gap-8 mb-32">
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-4">What you see</h3>
                  <div className="relative flex justify-center">
                    <EquippedAvatar size="md" crownScaleMultiplier={0} />
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm whitespace-nowrap"
                    >
                      ↑ marker (what you see)
                    </m.div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-4">What's really there</h3>
                  <div className="h-16 flex items-center justify-center">
                    <p className="text-white/40 italic text-sm">(invisible)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog system - shown when not minimized */}
      {!isMinimized && currentDialog && !showQuiz && !showCompletionScreen && (
        <NPCDialog
          dialog={currentDialog}
          onNext={handleNextDialog}
          isVisible={true}
          canGoBack={!(currentPhase === 'intro' && currentDialogIndex === 0) && currentPhase !== 'quiz-complete'}
          onBack={() => {
            if (currentDialogIndex > 0) {
              setCurrentDialogIndex(currentDialogIndex - 1)
            } else {
              // Go back to previous phase
              switch (currentPhase) {
                case 'truth':
                  setCurrentPhase('zoom')
                  setCurrentDialogIndex(phaseDialogs.zoom.length - 1)
                  break
                case 'interactive':
                  setCurrentPhase('truth')
                  setCurrentDialogIndex(phaseDialogs.truth.length - 1)
                  setIsMinimized(false)
                  break
                case 'summary':
                  setCurrentPhase('interactive')
                  setCurrentDialogIndex(0)
                  setIsMinimized(true) // Interactive phase should be minimized to show the demo
                  break
              }
            }
          }}
          textColorClass={currentPhase === 'zoom' && zoomLevel === 3 && currentDialogIndex >= 2 ? 'text-black' : undefined}
        />
      )}

      {/* Minimized progress indicator */}
      {isMinimized && (
        <MinimizedProgress 
          currentPhase={currentPhase} 
          onExpand={() => setIsMinimized(false)} 
        />
      )}

      {/* Quiz */}
      {showQuiz && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-30 p-6"
        >
          <div className="max-w-4xl mx-auto">
            <QuizInterface
              quiz={quiz}
              onComplete={handleQuizComplete}
            />
          </div>
        </m.div>
      )}

      {/* Completion Screen */}
      {showCompletionScreen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center p-6"
        >
          <div className="max-w-2xl w-full">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-2xl p-8 text-center"
            >
              <m.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-cosmic-aurora/20 rounded-full flex items-center justify-center"
              >
                <Award className="w-10 h-10 text-cosmic-aurora" />
              </m.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
              <p className="text-white/80 mb-6">You've mastered the concept of the Null Core</p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 text-cosmic-starlight mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">+{earnedStardust} Stardust earned</span>
                </div>
                <p className="text-sm text-white/60">
                  Remember: Every dot is just a marker for an invisible null core
                </p>
              </div>

              {/* Cooldown Timer */}
              <div className="bg-cosmic-void/50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-cosmic-aurora" />
                  <h3 className="text-xl font-semibold text-white">Learning Cooldown</h3>
                </div>
                <p className="text-white/70 mb-4">
                  Take a moment to let the concepts sink in before proceeding
                </p>
                <div className="relative w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <m.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 60, ease: "linear" }}
                    className="absolute h-full bg-cosmic-aurora"
                  />
                </div>
                <p className="text-cosmic-aurora text-2xl font-bold mt-3">
                  {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/sanctuary?activity=review')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-cosmic-aurora" />
                  <span className="text-white/80 text-sm">Review Notes</span>
                </m.button>

                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/sanctuary?activity=meditate')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <Brain className="w-6 h-6 text-cosmic-starlight" />
                  <span className="text-white/80 text-sm">Meditate</span>
                </m.button>

                <m.button
                  whileHover={{ scale: cooldownTime === 0 ? 1.05 : 1 }}
                  whileTap={{ scale: cooldownTime === 0 ? 0.95 : 1 }}
                  onClick={() => cooldownTime === 0 && router.push('/universal-relativity')}
                  disabled={cooldownTime > 0}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    cooldownTime === 0 
                      ? 'bg-cosmic-aurora hover:bg-cosmic-aurora/80 cursor-pointer' 
                      : 'bg-cosmic-void/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                  <span className="text-white text-sm font-medium">
                    {cooldownTime === 0 ? 'Continue' : 'Wait...'}
                  </span>
                </m.button>
              </div>
            </m.div>
          </div>
        </m.div>
      )}

      {/* Achievement Toast */}
      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementToast
            achievement={unlockedAchievement}
            onClose={() => setUnlockedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function NullCorePage() {
  return (
    <ProtectedRoute>
      <NullCoreLessonContent />
    </ProtectedRoute>
  )
}