'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Clock, 
  Calendar,
  Sparkles,
  Sunrise,
  Sun,
  Moon,
  Zap,
  Brain,
  BookOpen,
  Dumbbell,
  Coffee,
  ChevronRight
} from 'lucide-react'
import NPCAvatar from '@/components/npcs/NPCAvatar'
import { 
  LearningSession, 
  getCurrentDate, 
  formatDate, 
  findAvailableSlots,
  formatDuration
} from '@/lib/timeUtils'
import { 
  suggestDuration, 
  getConstellationRecommendations 
} from '@/lib/sessionTypes'

interface LagomPlanningAssistantProps {
  onClose: () => void
  currentDate: Date
  existingSessions: LearningSession[]
  onSessionCreate?: (session: Partial<LearningSession>) => void
}

type PlanningStep = 'intro' | 'preferences' | 'suggestions'

// Simplified quick options for better UX
const QUICK_TIME_OPTIONS = [
  { value: 30, label: '30 min', description: 'Quick & focused' },
  { value: 60, label: '1 hour', description: 'Standard session' },
  { value: 90, label: '1.5 hours', description: 'Deep learning' }
]

const TIME_PREFERENCES = [
  { id: 'morning', label: 'Morning', icon: Sunrise, hours: [9, 10, 11], color: 'cosmic-aurora' },
  { id: 'afternoon', label: 'Afternoon', icon: Sun, hours: [14, 15, 16], color: 'cosmic-quasar' },
  { id: 'evening', label: 'Evening', icon: Moon, hours: [19, 20], color: 'cosmic-nebula' }
]

const SESSION_FOCUS = [
  { id: 'learning', label: 'New Concepts', icon: Brain, description: 'Learn something new' },
  { id: 'practice', label: 'Practice', icon: Dumbbell, description: 'Reinforce knowledge' },
  { id: 'review', label: 'Review', icon: BookOpen, description: 'Revisit past topics' },
  { id: 'mixed', label: 'Balanced', icon: Coffee, description: 'Mix of everything' }
]

const lagomMessages = {
  intro: "Welcome, cosmic learner! I'll help you create the perfect schedule. Just a few quick questions to optimize your learning journey.",
  preferences: "Great choices! When you're ready, I'll generate your personalized learning schedule.",
  suggestions: "Perfect! I've crafted sessions that align with your energy patterns. Each one is optimized for maximum retention."
}

export default function LagomPlanningAssistant({
  onClose,
  currentDate,
  existingSessions,
  onSessionCreate
}: LagomPlanningAssistantProps) {
  const [step, setStep] = useState<PlanningStep>('intro')
  const [availableTime, setAvailableTime] = useState(60)
  const [preferredTimes, setPreferredTimes] = useState<string[]>(['morning'])
  const [sessionFocus, setSessionFocus] = useState('learning')
  const [suggestions, setSuggestions] = useState<LearningSession[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Typing effect for Lagom's messages
  useEffect(() => {
    const message = lagomMessages[step]
    if (!message) return

    setIsTyping(true)
    setTypedText('')
    
    let currentIndex = 0
    const typeChar = () => {
      if (currentIndex < message.length) {
        setTypedText(message.slice(0, currentIndex + 1))
        currentIndex++
        setTimeout(typeChar, 20) // Fast typing
      } else {
        setIsTyping(false)
      }
    }

    const startDelay = setTimeout(typeChar, 300)
    return () => clearTimeout(startDelay)
  }, [step])

  // Generate suggestions based on preferences
  const generateSuggestions = async () => {
    setIsGenerating(true)
    setStep('suggestions')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newSuggestions: LearningSession[] = []
    const today = getCurrentDate()
    
    // Get preferred hours based on time preferences
    const preferredHours = preferredTimes.flatMap(timeId => 
      TIME_PREFERENCES.find(t => t.id === timeId)?.hours || []
    )
    
    // Generate sessions for next 3 days
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const sessionDate = new Date(today)
      sessionDate.setDate(sessionDate.getDate() + dayOffset)
      
      const dayExistingSessions = existingSessions.filter(s => 
        s.startTime.toDateString() === sessionDate.toDateString()
      )
      
      // Find available slots
      const availableSlots = findAvailableSlots(
        sessionDate,
        availableTime,
        dayExistingSessions,
        Math.min(...preferredHours),
        Math.max(...preferredHours) + 1
      )
      
      if (availableSlots.length > 0) {
        const slot = availableSlots[0]
        const sessionType = sessionFocus === 'learning' ? 'focused-learning' :
                          sessionFocus === 'practice' ? 'practice-problems' :
                          sessionFocus === 'review' ? 'review-session' : 'mixed-session'
        
        newSuggestions.push({
          id: `suggestion-${dayOffset}`,
          title: `${sessionFocus === 'mixed' ? 'Balanced' : sessionFocus.charAt(0).toUpperCase() + sessionFocus.slice(1)} Session`,
          description: `Optimized ${availableTime}-minute session for ${preferredTimes.join(' & ')} learner`,
          startTime: slot.start,
          endTime: slot.end,
          type: {
            id: sessionType,
            name: sessionFocus === 'mixed' ? 'Balanced Session' : `${sessionFocus.charAt(0).toUpperCase() + sessionFocus.slice(1)} Session`,
            color: 'cosmic-aurora',
            icon: '🎯',
            defaultDuration: availableTime,
            description: `${sessionFocus} focused session`
          },
          constellationId: 'systems-thinking',
          difficulty: 'medium',
          estimatedDuration: availableTime,
          completed: false,
          reminders: [{ minutesBefore: 15, enabled: true }],
          tags: [sessionFocus],
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
    
    setSuggestions(newSuggestions)
    setIsGenerating(false)
  }

  const handleCreateSessions = () => {
    suggestions.forEach(session => onSessionCreate?.(session))
    onClose()
  }

  const allPreferencesSet = preferredTimes.length > 0

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <m.div
        className="bg-cosmic-gradient rounded-3xl border border-cosmic-aurora/30 max-w-2xl w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <NPCAvatar npc="LAGOM" size="md" />
              <div>
                <h3 className="text-xl font-bold text-white cosmic-heading">
                  LAGOM Planning Assistant
                </h3>
                <p className="text-cosmic-aurora text-sm">
                  Your cosmic learning companion
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full glass-morphism border border-white/20 hover:border-white/40 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Lagom's Message Box */}
          <div className="bg-npc-lagom/10 border border-npc-lagom/30 rounded-2xl rounded-tl-sm p-4">
            <div className="text-white text-sm leading-relaxed">
              {typedText}
              {isTyping && (
                <m.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1"
                >
                  |
                </m.span>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step !== 'suggestions' ? (
            <m.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 pt-2 space-y-5"
            >
              {/* Time Available */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">
                  How much time do you have?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_TIME_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setAvailableTime(option.value)}
                      className={`p-3 rounded-xl border transition-all ${
                        availableTime === option.value
                          ? 'bg-cosmic-aurora/20 border-cosmic-aurora text-white'
                          : 'border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-60">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">
                  When do you learn best?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_PREFERENCES.map(pref => {
                    const isSelected = preferredTimes.includes(pref.id)
                    return (
                      <button
                        key={pref.id}
                        onClick={() => {
                          setPreferredTimes(prev =>
                            prev.includes(pref.id)
                              ? prev.filter(t => t !== pref.id)
                              : [...prev, pref.id]
                          )
                        }}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? `bg-${pref.color}/20 border-${pref.color} text-white`
                            : 'border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        <pref.icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm">{pref.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Session Focus */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">
                  What's your focus?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_FOCUS.map(focus => (
                    <button
                      key={focus.id}
                      onClick={() => setSessionFocus(focus.id)}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        sessionFocus === focus.id
                          ? 'bg-cosmic-starlight/20 border-cosmic-starlight text-white'
                          : 'border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <focus.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{focus.label}</span>
                      </div>
                      <div className="text-xs opacity-60">{focus.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <m.button
                onClick={() => {
                  setStep('preferences')
                  generateSuggestions()
                }}
                disabled={!allPreferencesSet}
                className="w-full py-3 bg-cosmic-aurora text-white font-medium rounded-xl hover:bg-cosmic-aurora/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Generate My Schedule
              </m.button>
            </m.div>
          ) : (
            <m.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 pt-2 space-y-4"
            >
              {isGenerating ? (
                <div className="text-center py-8">
                  <m.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Sparkles className="w-12 h-12 text-cosmic-aurora" />
                  </m.div>
                  <p className="text-white/60 mt-3">Creating your optimal schedule...</p>
                </div>
              ) : (
                <>
                  {/* Suggestions List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {suggestions.map((session, index) => (
                      <m.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 glass-morphism rounded-xl border border-white/10"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-white text-sm">{session.title}</h5>
                            <p className="text-xs text-white/60 mt-1">
                              {formatDate(session.startTime, 'daydate')} at {formatDate(session.startTime, 'time')}
                            </p>
                          </div>
                          <span className="text-sm text-cosmic-aurora font-medium">
                            {formatDuration(session.estimatedDuration)}
                          </span>
                        </div>
                      </m.div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setStep('intro')
                        setSuggestions([])
                      }}
                      className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors text-sm"
                    >
                      Adjust Preferences
                    </button>
                    <m.button
                      onClick={handleCreateSessions}
                      className="flex-1 py-3 bg-cosmic-aurora text-white font-medium rounded-xl hover:bg-cosmic-aurora/80 transition-colors flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Calendar className="w-4 h-4" />
                      Add to Calendar
                    </m.button>
                  </div>
                </>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </m.div>
  )
}