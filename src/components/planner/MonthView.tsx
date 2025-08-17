'use client'

import { useState, useMemo } from 'react'
import { m } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  LearningSession, 
  formatDate, 
  formatDuration,
  isSameDay,
  isToday,
  getStartOfMonth,
  getEndOfMonth,
  getCurrentDate,
  isPastDate
} from '@/lib/timeUtils'
import { DEFAULT_SESSION_TYPES } from '@/lib/sessionTypes'

interface MonthViewProps {
  date: Date
  sessions: LearningSession[]
  onDateSelect?: (date: Date) => void
  onSessionCreate?: (startTime: Date) => void
}

export default function MonthView({ 
  date, 
  sessions, 
  onDateSelect,
  onSessionCreate 
}: MonthViewProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = getStartOfMonth(date)
    const monthEnd = getEndOfMonth(date)
    
    // Get first day of the week containing month start
    const calendarStart = new Date(monthStart)
    calendarStart.setDate(calendarStart.getDate() - monthStart.getDay())
    
    // Get last day of the week containing month end
    const calendarEnd = new Date(monthEnd)
    calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()))
    
    const days = []
    const current = new Date(calendarStart)
    
    while (current <= calendarEnd) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [date])

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, LearningSession[]> = {}
    
    sessions.forEach(session => {
      const dateKey = session.startTime.toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(session)
    })
    
    return grouped
  }, [sessions])

  // Get sessions for a specific date
  const getSessionsForDate = (targetDate: Date): LearningSession[] => {
    const dateKey = targetDate.toISOString().split('T')[0]
    return sessionsByDate[dateKey] || []
  }

  // Check if date is in current month
  const isCurrentMonth = (targetDate: Date): boolean => {
    return targetDate.getMonth() === date.getMonth() && 
           targetDate.getFullYear() === date.getFullYear()
  }

  // Get session type color
  const getSessionColor = (session: LearningSession) => {
    const sessionType = DEFAULT_SESSION_TYPES.find(t => t.id === session.type.id)
    return sessionType?.color || 'cosmic-starlight'
  }

  // Handle day click
  const handleDayClick = (clickedDate: Date) => {
    onDateSelect?.(clickedDate)
    
    // Don't allow creating sessions on past dates
    if (isPastDate(clickedDate)) return
    
    // If the day has no sessions, offer to create one
    const daySessions = getSessionsForDate(clickedDate)
    if (daySessions.length === 0) {
      const startTime = new Date(clickedDate)
      startTime.setHours(9, 0, 0, 0) // Default to 9 AM
      onSessionCreate?.(startTime)
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className="month-view bg-cosmic-gradient/30 rounded-xl border border-white/10 overflow-hidden">
      {/* Month Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white cosmic-heading">
            {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          {/* Month Stats */}
          <div className="text-right">
            <div className="text-lg font-semibold text-white">
              {sessions.filter(s => 
                s.startTime.getMonth() === date.getMonth() && 
                s.startTime.getFullYear() === date.getFullYear()
              ).length} sessions
            </div>
            <div className="text-sm text-white/60">
              this month
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center py-2">
              <span className="text-sm font-medium text-white/60">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Weeks */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                const daySessions = getSessionsForDate(day)
                const isCurrentMonthDay = isCurrentMonth(day)
                const isTodayDay = isToday(day)
                const isHovered = hoveredDate && isSameDay(hoveredDate, day)
                const isPastDay = isPastDate(day)
                
                return (
                  <m.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.02 }}
                    className={`relative p-3 rounded-lg border transition-all duration-200 min-h-[100px] ${
                      isPastDay && isCurrentMonthDay
                        ? 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
                        : isTodayDay
                        ? 'bg-cosmic-aurora/20 border-cosmic-aurora/40 shadow-lg cursor-pointer'
                        : isCurrentMonthDay
                        ? 'glass-morphism border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer'
                        : 'bg-white/5 border-white/10 hover:border-white/20 cursor-pointer'
                    }`}
                    onMouseEnter={() => !isPastDay && setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => handleDayClick(day)}
                    whileHover={!isPastDay ? { scale: 1.02 } : {}}
                    whileTap={!isPastDay ? { scale: 0.98 } : {}}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isTodayDay
                          ? 'text-cosmic-aurora'
                          : isCurrentMonthDay
                          ? 'text-white'
                          : 'text-white/40'
                      }`}>
                        {day.getDate()}
                      </span>
                      
                      {/* Add button on hover for empty future days */}
                      {isHovered && daySessions.length === 0 && isCurrentMonthDay && !isPastDay && (
                        <m.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-1 rounded bg-cosmic-aurora/20 border border-cosmic-aurora/40"
                        >
                          <Plus className="w-3 h-3 text-cosmic-aurora" />
                        </m.div>
                      )}
                    </div>

                    {/* Session Indicators */}
                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map((session, sessionIndex) => {
                        const colorClass = getSessionColor(session)
                        
                        return (
                          <m.div
                            key={session.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sessionIndex * 0.05 }}
                            className={`p-1.5 rounded text-xs bg-${colorClass}/20 border border-${colorClass}/40 truncate group`}
                            title={`${session.title} - ${formatDate(session.startTime, 'time')}`}
                          >
                            <div className={`font-medium text-${colorClass} truncate`}>
                              {session.title}
                            </div>
                            <div className="text-white/60 text-xs">
                              {formatDate(session.startTime, 'time')}
                            </div>
                          </m.div>
                        )
                      })}
                      
                      {/* More sessions indicator */}
                      {daySessions.length > 3 && (
                        <div className="text-xs text-white/60 text-center py-1">
                          +{daySessions.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Today indicator */}
                    {isTodayDay && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-cosmic-aurora rounded-full animate-pulse" />
                      </div>
                    )}

                    {/* Session count badge */}
                    {daySessions.length > 0 && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-5 h-5 bg-cosmic-starlight/80 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {daySessions.length}
                        </div>
                      </div>
                    )}
                  </m.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Month Summary */}
      <div className="p-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Sessions */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cosmic-aurora">
              {sessions.filter(s => 
                s.startTime.getMonth() === date.getMonth() && 
                s.startTime.getFullYear() === date.getFullYear()
              ).length}
            </div>
            <div className="text-sm text-white/60">Total Sessions</div>
          </div>

          {/* Total Hours */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cosmic-starlight">
              {Math.round(
                sessions
                  .filter(s => 
                    s.startTime.getMonth() === date.getMonth() && 
                    s.startTime.getFullYear() === date.getFullYear()
                  )
                  .reduce((total, session) => total + session.estimatedDuration, 0) / 60
              )}h
            </div>
            <div className="text-sm text-white/60">Planned Hours</div>
          </div>

          {/* Lessons */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cosmic-nebula">
              {sessions.filter(s => 
                s.startTime.getMonth() === date.getMonth() && 
                s.startTime.getFullYear() === date.getFullYear() &&
                s.lessonId
              ).length}
            </div>
            <div className="text-sm text-white/60">Lessons</div>
          </div>

          {/* Active Days */}
          <div className="text-center">
            <div className="text-2xl font-bold text-cosmic-quasar">
              {new Set(
                sessions
                  .filter(s => 
                    s.startTime.getMonth() === date.getMonth() && 
                    s.startTime.getFullYear() === date.getFullYear()
                  )
                  .map(s => s.startTime.toDateString())
              ).size}
            </div>
            <div className="text-sm text-white/60">Active Days</div>
          </div>
        </div>
      </div>
    </div>
  )
}