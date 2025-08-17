'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, Eye, Brain, Heart, Zap, Crown, Compass } from 'lucide-react'

interface Question {
  id: string
  title: string
  subtitle: string
  question: string
  options: {
    id: string
    text: string
    icon: React.ReactNode
    description: string
    traits: string[]
  }[]
}

const ANCIENT_QUESTIONS: Question[] = [
  {
    id: 'approach',
    title: 'The Path Reveals Itself',
    subtitle: 'Ancient wisdom speaks through your choices',
    question: 'When faced with a concept that seems impossible to grasp, what is your instinct?',
    options: [
      {
        id: 'break-down',
        text: 'Shatter it into pieces',
        icon: <Zap className="w-5 h-5" />,
        description: 'Break the complex into simple fragments, then rebuild understanding',
        traits: ['analytical', 'systematic', 'methodical']
      },
      {
        id: 'dive-deep',
        text: 'Dive into its depths',
        icon: <Eye className="w-5 h-5" />,
        description: 'Immerse yourself completely, seeking the hidden truth within',
        traits: ['intuitive', 'deep-thinker', 'contemplative']
      },
      {
        id: 'find-connection',
        text: 'Seek its connections',
        icon: <Brain className="w-5 h-5" />,
        description: 'Map how this fits with everything you already know',
        traits: ['connector', 'holistic', 'pattern-seeker']
      },
      {
        id: 'feel-essence',
        text: 'Feel its essence',
        icon: <Heart className="w-5 h-5" />,
        description: 'Trust your instincts to guide you to understanding',
        traits: ['empathetic', 'emotional-learner', 'intuitive']
      }
    ]
  },
  {
    id: 'motivation',
    title: 'The Flame That Drives You',
    subtitle: 'What burns brightest in your cosmic soul?',
    question: 'In the vast cosmos of knowledge, what calls to you most powerfully?',
    options: [
      {
        id: 'mastery',
        text: 'Absolute mastery',
        icon: <Crown className="w-5 h-5" />,
        description: 'To become the ultimate authority in your chosen domain',
        traits: ['perfectionist', 'disciplined', 'ambitious']
      },
      {
        id: 'discovery',
        text: 'Endless discovery',
        icon: <Compass className="w-5 h-5" />,
        description: 'To explore unknown territories and push boundaries',
        traits: ['explorer', 'curious', 'adventurous']
      },
      {
        id: 'understanding',
        text: 'Deep understanding',
        icon: <Brain className="w-5 h-5" />,
        description: 'To truly comprehend the fundamental nature of things',
        traits: ['philosopher', 'contemplative', 'truth-seeker']
      },
      {
        id: 'impact',
        text: 'Meaningful impact',
        icon: <Heart className="w-5 h-5" />,
        description: 'To use knowledge to create positive change in the world',
        traits: ['altruistic', 'purpose-driven', 'collaborative']
      }
    ]
  },
  {
    id: 'challenge',
    title: 'When the Cosmic Winds Howl',
    subtitle: 'Every Singularity faces the storm of difficulty',
    question: 'When learning becomes painfully difficult, how do you respond?',
    options: [
      {
        id: 'persist',
        text: 'Persist like a neutron star',
        icon: <Zap className="w-5 h-5" />,
        description: 'Apply relentless force until the barrier breaks',
        traits: ['persistent', 'determined', 'strong-willed']
      },
      {
        id: 'adapt',
        text: 'Adapt like flowing water',
        icon: <Compass className="w-5 h-5" />,
        description: 'Find alternative paths around the obstacle',
        traits: ['flexible', 'creative', 'adaptable']
      },
      {
        id: 'reflect',
        text: 'Reflect like starlight',
        icon: <Eye className="w-5 h-5" />,
        description: 'Step back and examine from different angles',
        traits: ['reflective', 'strategic', 'patient']
      },
      {
        id: 'connect',
        text: 'Connect with others',
        icon: <Heart className="w-5 h-5" />,
        description: 'Seek wisdom and support from fellow travelers',
        traits: ['collaborative', 'social-learner', 'humble']
      }
    ]
  }
]

interface AncientRiteProps {
  onComplete: (profile: UserProfile) => void
}

interface UserProfile {
  traits: string[]
  learningStyle: string
  motivation: string
  approach: string
  personalityType: string
}

export default function AncientRite({ onComplete }: AncientRiteProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isRevealing, setIsRevealing] = useState(false)

  const handleAnswer = (questionId: string, optionId: string) => {
    const newAnswers = { ...answers, [questionId]: optionId }
    setAnswers(newAnswers)

    if (currentQuestion < ANCIENT_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 500)
    } else {
      // Generate user profile
      setIsRevealing(true)
      setTimeout(() => {
        const profile = generateProfile(newAnswers)
        onComplete(profile)
      }, 3000)
    }
  }

  const generateProfile = (answers: Record<string, string>): UserProfile => {
    const allTraits: string[] = []
    let learningStyle = 'balanced'
    let motivation = 'knowledge'
    let approach = 'systematic'

    // Gather all traits from answers
    ANCIENT_QUESTIONS.forEach(question => {
      const answerId = answers[question.id]
      const selectedOption = question.options.find(opt => opt.id === answerId)
      if (selectedOption) {
        allTraits.push(...selectedOption.traits)
        
        // Determine primary characteristics
        if (question.id === 'approach') approach = answerId
        if (question.id === 'motivation') motivation = answerId
      }
    })

    // Determine learning style based on trait frequency
    const traitCounts = allTraits.reduce((acc, trait) => {
      acc[trait] = (acc[trait] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dominantTrait = Object.entries(traitCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    if (['analytical', 'systematic', 'methodical'].includes(dominantTrait)) {
      learningStyle = 'structured'
    } else if (['intuitive', 'creative', 'flexible'].includes(dominantTrait)) {
      learningStyle = 'adaptive'
    } else if (['collaborative', 'social-learner', 'empathetic'].includes(dominantTrait)) {
      learningStyle = 'social'
    } else if (['contemplative', 'reflective', 'deep-thinker'].includes(dominantTrait)) {
      learningStyle = 'contemplative'
    }

    const personalityType = `${approach}-${motivation}-${learningStyle}`

    return {
      traits: Array.from(new Set(allTraits)),
      learningStyle,
      motivation,
      approach,
      personalityType
    }
  }

  if (isRevealing) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <m.div
            className="text-6xl mb-6"
            animate={{ 
              rotate: 360,
              scale: 1.1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
            }}
          >
            🌌
          </m.div>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white cosmic-heading mb-4"
          >
            The Cosmos Recognizes You
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-white/80 text-lg"
          >
            Your cosmic profile is being inscribed in the stars...
          </m.p>
        </m.div>
      </div>
    )
  }

  const question = ANCIENT_QUESTIONS[currentQuestion]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Progress Indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-md">
        <div className="flex justify-center gap-2 mb-2">
          {ANCIENT_QUESTIONS.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-all duration-75 duration-500 ${
                index <= currentQuestion 
                  ? 'bg-cosmic-starlight' 
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-white/60 text-sm">
          {currentQuestion + 1} of {ANCIENT_QUESTIONS.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <m.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full max-w-2xl"
        >
          <div className="glass-morphism rounded-3xl p-8 border border-white/20 shadow-cosmic">
            {/* Question Header */}
            <div className="text-center mb-8">
              <m.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white cosmic-heading mb-2"
              >
                {question.title}
              </m.h2>
              <m.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-cosmic-starlight text-sm font-medium mb-4"
              >
                {question.subtitle}
              </m.p>
              <m.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-lg leading-relaxed"
              >
                {question.question}
              </m.p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {question.options.map((option, index) => (
                <m.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => handleAnswer(question.id, option.id)}
                  className="w-full p-6 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cosmic-starlight/50 transition-all duration-75 duration-300 group text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-cosmic-starlight/20 to-cosmic-aurora/20 border border-white/20 group-hover:border-cosmic-starlight/50 transition-all duration-75">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-cosmic-starlight transition-colors duration-75">
                        {option.text}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-cosmic-starlight transition-colors duration-75 opacity-0 group-hover:opacity-100" />
                  </div>
                </m.button>
              ))}
            </div>
          </div>
        </m.div>
      </AnimatePresence>
    </div>
  )
}