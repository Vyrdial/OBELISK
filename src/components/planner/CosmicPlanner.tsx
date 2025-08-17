'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock,
  List,
  Grid3x3,
  Target,
  Sparkles
} from 'lucide-react'
import { 
  getCurrentDate, 
  formatDate, 
  getStartOfWeek, 
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  LearningSession 
} from '@/lib/timeUtils'
import LagomPlanningAssistant from './LagomPlanningAssistant'
import WeekViewImproved from './WeekViewImproved'
import DayView from './DayView'
import MonthView from './MonthView'
import AgendaView from './AgendaView'

type ViewMode = 'day' | 'week' | 'month' | 'agenda'

interface CosmicPlannerProps {
  onSessionCreate?: (session: Partial<LearningSession>) => void
  onSessionEdit?: (session: LearningSession) => void
  onSessionDelete?: (sessionId: string) => void
  sessions?: LearningSession[]
  className?: string
}

export default function CosmicPlanner({
  onSessionCreate,
  onSessionEdit,
  onSessionDelete,
  sessions = [],
  className = ''
}: CosmicPlannerProps) {
  const [currentDate, setCurrentDate] = useState(getCurrentDate())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showLagomAssistant, setShowLagomAssistant] = useState(false)

  // Auto-update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(getCurrentDate())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'day':
        return formatDate(currentDate, 'long')
      case 'week':
        const weekStart = getStartOfWeek(currentDate)
        const weekEnd = getEndOfWeek(currentDate)
        return `${formatDate(weekStart, 'short')} - ${formatDate(weekEnd, 'short')}`
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'agenda':
        return 'Upcoming Sessions'
      default:
        return ''
    }
  }

  const getViewIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'day': return Clock
      case 'week': return Calendar
      case 'month': return Grid3x3
      case 'agenda': return List
    }
  }

  return (
    <div className={`cosmic-planner bg-cosmic-gradient rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <m.h1 
            className="text-2xl font-bold text-white cosmic-heading"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Planner
          </m.h1>
          <m.div
            className="text-sm text-cosmic-starlight"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatDate(getCurrentDate(), 'datetime')}
          </m.div>
        </div>

        <div className="flex items-center gap-2">
          {/* LAGOM Assistant */}
          <m.button
            onClick={() => setShowLagomAssistant(true)}
            className="p-2 rounded-full glass-morphism border border-cosmic-aurora/30 hover:border-cosmic-aurora/60 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5 text-cosmic-aurora" />
          </m.button>

          {/* Add Session */}
          <m.button
            onClick={() => onSessionCreate?.({})}
            className="p-2 rounded-full glass-morphism border border-cosmic-starlight/30 hover:border-cosmic-starlight/60 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 text-cosmic-starlight" />
          </m.button>
        </div>
      </div>

      {/* Navigation & View Controls */}
      <div className="flex items-center justify-between mb-6">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <m.button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg glass-morphism border border-white/20 hover:border-white/40 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </m.button>

          <m.div 
            className="px-4 py-2 text-white font-medium min-w-[200px] text-center"
            key={getViewTitle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {getViewTitle()}
          </m.div>

          <m.button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg glass-morphism border border-white/20 hover:border-white/40 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </m.button>

          <m.button
            onClick={() => setCurrentDate(getCurrentDate())}
            className="px-3 py-1 text-sm rounded-lg glass-morphism border border-cosmic-aurora/30 hover:border-cosmic-aurora/60 text-cosmic-aurora transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Today
          </m.button>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg glass-morphism border border-white/20">
          {(['day', 'week', 'month', 'agenda'] as ViewMode[]).map((mode) => {
            const Icon = getViewIcon(mode)
            const isActive = viewMode === mode
            
            return (
              <m.button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                  isActive 
                    ? 'bg-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{mode}</span>
              </m.button>
            )
          })}
        </div>
      </div>

      {/* Calendar Views */}
      <AnimatePresence mode="wait">
        <m.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="calendar-view"
        >
          {viewMode === 'day' && (
            <DayView 
              date={currentDate}
              sessions={sessions}
              onSessionEdit={onSessionEdit}
              onSessionDelete={onSessionDelete}
              onSessionCreate={(startTime) => onSessionCreate?.({ startTime })}
            />
          )}
          
          {viewMode === 'week' && (
            <WeekViewImproved 
              date={currentDate}
              sessions={sessions}
              onSessionEdit={onSessionEdit}
              onSessionDelete={onSessionDelete}
              onSessionCreate={(startTime) => onSessionCreate?.({ startTime })}
            />
          )}
          
          {viewMode === 'month' && (
            <MonthView 
              date={currentDate}
              sessions={sessions}
              onDateSelect={setSelectedDate}
              onSessionCreate={(startTime) => onSessionCreate?.({ startTime })}
            />
          )}
          
          {viewMode === 'agenda' && (
            <AgendaView 
              sessions={sessions}
              onSessionEdit={onSessionEdit}
              onSessionDelete={onSessionDelete}
              onSessionStart={(session) => {
                // TODO: Navigate to lesson if it has lessonId
                console.log('Starting session:', session)
              }}
            />
          )}
        </m.div>
      </AnimatePresence>

      {/* LAGOM Assistant Modal */}
      <AnimatePresence>
        {showLagomAssistant && (
          <LagomPlanningAssistant 
            onClose={() => setShowLagomAssistant(false)}
            currentDate={currentDate}
            existingSessions={sessions}
            onSessionCreate={onSessionCreate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


