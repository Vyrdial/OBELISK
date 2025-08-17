'use client'

import { useState, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Timer, AlertCircle, Send, Loader2 } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  hint?: string
}

interface QuizData {
  id: string
  questions: QuizQuestion[]
  stardustReward: number
}

interface QuizInterfaceProps {
  quiz: QuizData
  onComplete: (totalQuestions: number) => void
  onFailure?: (questionId: string, questionText: string, reason: string) => void
}

export default function QuizInterface({ quiz, onComplete, onFailure }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0) // Count up from 0
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null)
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(new Set())
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [showAiResponse, setShowAiResponse] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  
  if (!currentQuestion) {
    return <div className="text-white">Loading question...</div>
  }

  const handleAnswer = useCallback((answerIndex: number | null) => {
    if (showResult) return

    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const newAnswers = [...answers, answerIndex ?? -1]
    setAnswers(newAnswers)

    // Add incorrect answer to eliminated options for wrong answers
    if (answerIndex !== currentQuestion.correctAnswer && answerIndex !== null) {
      setEliminatedOptions(prev => new Set([...prev, answerIndex]))
      // Spawn wisp for incorrect answer
      if (onFailure) {
        const failureReason = `Selected "${currentQuestion.options[answerIndex]}" instead of "${currentQuestion.options[currentQuestion.correctAnswer]}"`
        onFailure(currentQuestion.id, currentQuestion.question, failureReason)
      }
    }

    // Removed auto-advance - user must press continue
  }, [showResult, answers, currentQuestion, timeElapsed, onFailure])

  // Timer effect - Count UP
  useEffect(() => {
    if (showResult) return

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, showResult])

  // Reset timer when question changes
  useEffect(() => {
    setTimeElapsed(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowHint(false)
    setEliminatedOptions(new Set())
    setAiQuestion('')
    setAiResponse('')
    setShowAiResponse(false)
    setIsAiLoading(false)
    // Clear any existing auto-advance timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer)
      setAutoAdvanceTimer(null)
    }
  }, [currentQuestionIndex])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer)
      }
    }
  }, [autoAdvanceTimer])

  const toggleHint = () => {
    setShowHint(!showHint)
  }

  const handleContinue = useCallback(() => {
    // Clear auto-advance timer if it exists
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer)
      setAutoAdvanceTimer(null)
    }

    // If the answer was incorrect, reset for another try
    if (selectedAnswer !== null && selectedAnswer !== currentQuestion.correctAnswer) {
      setSelectedAnswer(null)
      setShowResult(false)
      return
    }

    if (isLastQuestion) {
      onComplete(quiz.questions.length)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }, [autoAdvanceTimer, isLastQuestion, onComplete, quiz.questions.length, currentQuestionIndex, selectedAnswer, currentQuestion])

  const getTimerColor = () => {
    if (timeElapsed < 120) return 'text-cosmic-aurora' // First 2 minutes - green
    if (timeElapsed < 300) return 'text-cosmic-stardust' // 2-5 minutes - yellow
    return 'text-cosmic-supernova' // Over 5 minutes - red warning
  }

  const getTimerMessage = () => {
    if (timeElapsed < 120) return 'Take your time!'
    if (timeElapsed < 300) return 'You\'re doing great!'
    return 'No rush, but consider moving on!'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAiQuestion = async () => {
    if (!aiQuestion.trim() || isAiLoading || selectedAnswer === null) return

    setIsAiLoading(true)
    setShowAiResponse(false)

    try {
      const response = await fetch('/api/quiz-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: selectedAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
          userQuestion: aiQuestion
        })
      })

      const data = await response.json()

      if (data.success) {
        setAiResponse(data.response)
        setShowAiResponse(true)
      } else {
        setAiResponse("I'm sorry, I'm having trouble responding right now. Please try asking your question again.")
        setShowAiResponse(true)
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      setAiResponse("I'm sorry, I'm having trouble responding right now. Please try asking your question again.")
      setShowAiResponse(true)
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleAiKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAiQuestion()
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Quiz Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="px-4 py-2 glass-morphism rounded-full border border-white/20">
              <span className="text-white/80 text-sm">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>
            
            <m.div
              className={`flex items-center gap-2 px-4 py-2 glass-morphism rounded-full border border-white/20 ${getTimerColor()}`}
              animate={timeElapsed >= 300 ? { scale: 1.05 } : {}}
              transition={{ duration: 1, repeat: timeElapsed >= 300 ? Infinity : 0 }}
            >
              <Timer className="w-4 h-4" />
              <div className="text-center">
                <div className="font-mono text-sm font-bold">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-xs opacity-75">
                  {getTimerMessage()}
                </div>
              </div>
            </m.div>

          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-6">
            <m.div
              className="bg-gradient-to-r from-cosmic-quasar to-cosmic-aurora h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentQuestionIndex + (showResult ? 1 : 0)) / quiz.questions.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <m.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-morphism rounded-2xl p-8 border border-white/20 mb-6"
        >
          <h2 className="text-2xl font-bold text-white cosmic-heading mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <AnimatePresence mode="wait">
            {!showResult ? (
              // Show all options before selection
              <m.div key={currentQuestionIndex} className="grid gap-4 mb-6">
                {currentQuestion?.options?.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isEliminated = eliminatedOptions.has(index)
                  
                  // Don't render eliminated options
                  if (isEliminated) return null
                  
                  return (
                    <m.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className={`p-4 rounded-xl text-left transition-all duration-300 cosmic-focus ${
                        isSelected 
                          ? 'bg-cosmic-quasar/20 border-2 border-cosmic-quasar' 
                          : 'glass-morphism border-2 border-white/20 hover:border-white/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                          isSelected ? 'bg-cosmic-quasar border-cosmic-quasar text-white' : 'border-white/40 text-white/80'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-white/90 text-lg flex-1">{option}</span>
                      </div>
                    </m.button>
                  )
                })}
              </m.div>
            ) : (
              // Show only selected answer (or correct answer if showing correct)
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                {/* Selected Answer */}
                {selectedAnswer !== null && (
                  <div className={`p-4 rounded-xl border-2 ${
                    selectedAnswer === currentQuestion.correctAnswer 
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-red-500/20 border-red-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                        selectedAnswer === currentQuestion.correctAnswer
                          ? 'bg-green-400 border-green-400 text-white'
                          : 'bg-red-400 border-red-400 text-white'
                      }`}>
                        {String.fromCharCode(65 + selectedAnswer)}
                      </div>
                      <span className="text-white/90 text-lg flex-1">
                        {currentQuestion.options[selectedAnswer]}
                      </span>
                      {selectedAnswer === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      )}
                      {selectedAnswer !== currentQuestion.correctAnswer && (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {/* Hint Button */}
          {currentQuestion.hint && !showResult && (
            <m.button
              onClick={toggleHint}
              className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-full border border-cosmic-aurora/30 hover:border-cosmic-aurora/50 transition-all duration-75 cosmic-focus mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lightbulb className="w-4 h-4 text-cosmic-aurora" />
              <span className="text-cosmic-aurora text-sm font-medium">
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </span>
            </m.button>
          )}

          {/* Hint Display */}
          <AnimatePresence>
            {showHint && currentQuestion.hint && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-cosmic-aurora/10 border border-cosmic-aurora/30 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-cosmic-aurora flex-shrink-0 mt-0.5" />
                  <p className="text-white/80 text-sm">
                    {currentQuestion.hint}
                  </p>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Mnemonic's Explanation */}
          <AnimatePresence mode="wait">
            {showResult && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Mnemonic appears with explanation */}
                <div className="bg-npc-mnemonic/10 border border-npc-mnemonic/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-npc-mnemonic/20 border border-npc-mnemonic/40 flex items-center justify-center flex-shrink-0">
                      <m.div
                        animate={{ rotate: [0, 90, 180, 270, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 bg-npc-mnemonic"
                        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-npc-mnemonic font-semibold mb-1">Mnemonic</h4>
                      <div className="text-white/80 leading-relaxed">
                        {/* Show different message based on answer correctness */}
                        {selectedAnswer === currentQuestion.correctAnswer ? (
                          <>
                            <p className="mb-2">Correct!</p>
                            <p>{currentQuestion.explanation}</p>
                          </>
                        ) : (
                          // Showing why their answer is wrong
                          <>
                            <p className="mb-2">Wrong.</p>
                            <p className="mt-3 text-cosmic-aurora">Option eliminated. Try again.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI Question Search Bar */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyPress={handleAiKeyPress}
                      placeholder="Ask Mnemonic a question about this topic..."
                      disabled={isAiLoading}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-npc-mnemonic/50 focus:bg-white/15 transition-all"
                    />
                    <m.button
                      onClick={handleAiQuestion}
                      disabled={!aiQuestion.trim() || isAiLoading}
                      className="px-4 py-3 bg-npc-mnemonic hover:bg-npc-mnemonic/80 disabled:bg-white/10 disabled:text-white/40 rounded-xl transition-colors flex items-center gap-2"
                      whileHover={{ scale: !aiQuestion.trim() || isAiLoading ? 1 : 1.05 }}
                      whileTap={{ scale: !aiQuestion.trim() || isAiLoading ? 1 : 0.95 }}
                    >
                      {isAiLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </m.button>
                  </div>
                </div>

                {/* AI Response as Mnemonic Dialog */}
                <AnimatePresence>
                  {showAiResponse && aiResponse && (
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-npc-mnemonic/10 border border-npc-mnemonic/30 rounded-xl p-6 mb-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-npc-mnemonic/20 border border-npc-mnemonic/40 flex items-center justify-center flex-shrink-0">
                          <m.div
                            animate={{ rotate: [0, 90, 180, 270, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 bg-npc-mnemonic"
                            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-npc-mnemonic font-semibold mb-2">Mnemonic</h4>
                          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                            {aiResponse}
                          </p>
                          <m.button
                            onClick={() => setShowAiResponse(false)}
                            className="mt-3 text-white/60 hover:text-white/80 text-sm transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            ✕ Close
                          </m.button>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Continue Button */}
                <div className="flex justify-end">
                  <m.button
                    onClick={handleContinue}
                    className="px-6 py-3 bg-cosmic-aurora text-white font-medium rounded-xl hover:bg-cosmic-aurora/80 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? (isLastQuestion ? 'Complete Quiz' : 'Continue')
                      : 'Try Again'}
                    <ArrowRight className="w-4 h-4" />
                  </m.button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>

      </m.div>
    </div>
  )
}