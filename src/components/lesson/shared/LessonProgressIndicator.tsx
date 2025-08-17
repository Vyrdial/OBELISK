'use client'

import { memo } from 'react'
import { m } from 'framer-motion'
import { Clock, Target, Award } from 'lucide-react'

interface LessonProgressIndicatorProps {
  currentPhase: string
  totalPhases: number
  currentPhaseIndex: number
  xpEarned?: number
  timeSpent?: number
}

const LessonProgressIndicator = memo(function LessonProgressIndicator({
  currentPhase,
  totalPhases,
  currentPhaseIndex,
  xpEarned = 0,
  timeSpent = 0
}: LessonProgressIndicatorProps) {
  const progressPercentage = ((currentPhaseIndex + 1) / totalPhases) * 100

  return (
    <div className="fixed top-20 left-4 right-4 z-20 max-w-sm mx-auto">
      <m.div 
        className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/90 text-sm font-medium">
            Phase: {currentPhase.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-white/70 text-xs">
            {currentPhaseIndex + 1}/{totalPhases}
          </span>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2 mb-3">
          <m.div 
            className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-2">
            <Award className="w-3 h-3" />
            <span>{xpEarned} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </m.div>
    </div>
  )
})

export default LessonProgressIndicator