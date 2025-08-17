'use client'

import { useState, useMemo } from 'react'
import { m } from 'framer-motion'
import { Plus, Clock, Edit3, Trash2, MoreHorizontal, Calendar } from 'lucide-react'
import { 
  LearningSession, 
  formatDate, 
  formatDuration,
  isSameDay,
  isToday,
  getStartOfWeek,
  isPastTime 
} from '@/lib/timeUtils'
import { DEFAULT_SESSION_TYPES } from '@/lib/sessionTypes'

interface WeekViewImprovedProps {
  date: Date
  sessions: LearningSession[]
  onSessionEdit?: (session: LearningSession) => void
  onSessionDelete?: (sessionId: string) => void
  onSessionCreate?: (startTime: Date) => void
}

export default function WeekViewImproved({ 
  date, 
  sessions, 
  onSessionEdit, 
  onSessionDelete,
  onSessionCreate 
}: WeekViewImprovedProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; hour: number; quarter: number } | null>(null)
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null)

  // Generate week dates
  const weekStart = getStartOfWeek(date)
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    return days
  }, [weekStart])

  // Generate hour slots (6 AM to 11 PM)
  const hourSlots = useMemo(() => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(hour)
    }
    return slots
  }, [])

  // Get sessions for a specific day
  const getSessionsForDay = (day: Date) => {
    return sessions.filter(session => isSameDay(session.startTime, day))
  }

  // Get session position and height
  const getSessionStyle = (session: LearningSession) => {
    const startHour = session.startTime.getHours()
    const startMinute = session.startTime.getMinutes()
    const endHour = session.endTime.getHours()
    const endMinute = session.endTime.getMinutes()
    
    // Convert to grid position (each hour is 80px tall now for better clicking)
    const top = (startHour - 6) * 80 + (startMinute / 60) * 80
    const height = ((endHour - startHour) * 80) + ((endMinute - startMinute) / 60) * 80
    
    return { top: `${top}px`, height: `${Math.max(height, 40)}px` } // Minimum height for visibility
  }

  // Get session type color
  const getSessionColor = (session: LearningSession) => {
    const sessionType = DEFAULT_SESSION_TYPES.find(t => t.id === session.type.id)
    return sessionType?.color || 'cosmic-starlight'
  }

  // Format time for display
  const formatTime = (hour: number) => {
    if (hour === 0) return '12:00 am'
    if (hour < 12) return `${hour}:00 am`
    if (hour === 12) return '12:00 pm'
    return `${hour - 12}:00 pm`
  }

  // Format time with minutes for display
  const formatTimeWithMinutes = (hour: number, minutes: number) => {
    const hourPart = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? 'am' : 'pm'
    const minutesFormatted = minutes === 0 ? '00' : minutes.toString().padStart(2, '0')
    return `${hourPart}:${minutesFormatted} ${ampm}`
  }

  const handleSlotClick = (day: Date, hour: number, quarter: number) => {
    const startTime = new Date(day)
    startTime.setHours(hour, quarter * 15, 0, 0)
    
    // Don't allow creating sessions in the past
    if (isPastTime(startTime)) return
    
    onSessionCreate?.(startTime)
  }

  // Check if a time slot is in the past
  const isSlotInPast = (day: Date, hour: number, quarter: number) => {
    const slotTime = new Date(day)
    slotTime.setHours(hour, quarter * 15, 0, 0)
    return isPastTime(slotTime)
  }

  return (
    <div className="week-view bg-cosmic-gradient/30 rounded-xl border border-white/10 overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-white/10 sticky top-0 z-20 bg-cosmic-gradient/90 backdrop-blur-sm">
        {/* Time column header */}
        <div className="p-4 border-r border-white/10">
          <div className="text-sm font-medium text-white/60 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time
          </div>
        </div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <m.div
            key={day.toISOString()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 text-center border-r border-white/10 last:border-r-0 ${
              isToday(day) ? 'bg-cosmic-aurora/10' : ''
            }`}
          >
            <div className="text-sm font-medium text-white/80">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-bold mt-1 ${
              isToday(day) ? 'text-cosmic-aurora' : 'text-white'
            }`}>
              {day.getDate()}
            </div>
          </m.div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="relative overflow-y-auto" style={{ maxHeight: '600px' }}>
        <div className="grid grid-cols-8">
          {/* Time labels column */}
          <div className="border-r border-white/10 sticky left-0 bg-cosmic-gradient/50 backdrop-blur-sm z-10">
            {hourSlots.map(hour => (
              <div key={hour} className="h-20 flex items-start justify-end pr-3 pt-2 border-b border-white/5">
                <span className="text-xs text-white/50 font-mono bg-cosmic-gradient/80 px-2 py-1 rounded">
                  {formatTime(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={day.toISOString()} className="relative border-r border-white/10 last:border-r-0">
              {/* Hour slots - now divided into 15-minute quarters */}
              {hourSlots.map((hour) => (
                <div key={hour} className="h-20 border-b border-white/5 relative">
                  {/* 15-minute slots for better granularity */}
                  {[0, 1, 2, 3].map((quarter) => {
                    const isSlotPast = isSlotInPast(day, hour, quarter)
                    const isHovered = hoveredSlot?.day === dayIndex && 
                                    hoveredSlot?.hour === hour && 
                                    hoveredSlot?.quarter === quarter
                    
                    return (
                      <m.div
                        key={`${dayIndex}-${hour}-${quarter}`}
                        className={`h-5 border-b border-white/[0.02] transition-all ${
                          isSlotPast
                            ? 'bg-white/[0.02] cursor-not-allowed opacity-50'
                            : `cursor-pointer ${
                                isHovered
                                  ? 'bg-cosmic-aurora/20 shadow-lg shadow-cosmic-aurora/20'
                                  : 'hover:bg-white/5'
                              }`
                        }`}
                        onMouseEnter={() => !isSlotPast && setHoveredSlot({ day: dayIndex, hour, quarter })}
                        onMouseLeave={() => setHoveredSlot(null)}
                        onClick={() => handleSlotClick(day, hour, quarter)}
                        whileHover={!isSlotPast ? { scale: 1.02 } : {}}
                      >
                        {/* Add button on hover with time display */}
                        {isHovered && !isSlotPast && (
                          <m.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cosmic-aurora/30 border border-cosmic-aurora/60 backdrop-blur-sm">
                              <Plus className="w-4 h-4 text-cosmic-aurora" />
                              <span className="text-xs font-medium text-cosmic-aurora">
                                {formatTimeWithMinutes(hour, quarter * 15)}
                              </span>
                            </div>
                          </m.div>
                        )}
                        
                        {/* Visual indicator for quarter hours */}
                        {quarter === 0 && (
                          <div className="absolute left-0 w-full h-px bg-white/10 top-0" />
                        )}
                      </m.div>
                    )
                  })}
                </div>
              ))}

              {/* Render sessions for this day */}
              {getSessionsForDay(day).map((session, sessionIndex) => {
                const style = getSessionStyle(session)
                const colorClass = getSessionColor(session)
                
                return (
                  <m.div
                    key={session.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: sessionIndex * 0.1 }}
                    className={`absolute left-1 right-1 z-10 rounded-lg p-3 cursor-pointer group overflow-hidden backdrop-blur-sm bg-${colorClass}/20 border border-${colorClass}/40`}
                    style={style}
                    onClick={() => setSelectedSession(session)}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    {/* Session content */}
                    <div className="h-full flex flex-col">
                      <div className="flex items-start justify-between mb-1">
                        <div className={`text-sm font-semibold text-white truncate flex-1`}>
                          {session.title}
                        </div>
                        
                        {/* Action buttons (always visible for better UX) */}
                        <div className="flex gap-1 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSessionEdit?.(session)
                            }}
                            className="p-1.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
                            title="Edit session"
                          >
                            <Edit3 className="w-3 h-3 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSessionDelete?.(session.id)
                            }}
                            className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Time display */}
                      <div className="text-xs text-white/80 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(session.startTime, 'time')} - {formatDate(session.endTime, 'time')}
                      </div>
                      
                      {/* Duration badge */}
                      <div className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 self-start">
                        <Calendar className="w-3 h-3" />
                        {formatDuration(session.estimatedDuration)}
                      </div>
                      
                      {/* Show description if there's space */}
                      {parseInt(style.height) > 80 && session.description && (
                        <div className="text-xs text-white/70 line-clamp-2 mt-2">
                          {session.description}
                        </div>
                      )}
                    </div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                  </m.div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Current time indicator */}
        <CurrentTimeIndicator weekDays={weekDays} />
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onEdit={onSessionEdit}
          onDelete={onSessionDelete}
        />
      )}
    </div>
  )
}

// Component to show current time line
function CurrentTimeIndicator({ weekDays }: { weekDays: Date[] }) {
  const now = new Date()
  const currentDayIndex = weekDays.findIndex(day => isToday(day))
  
  if (currentDayIndex === -1) return null
  
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Only show if within our time range (6 AM - 11 PM)
  if (currentHour < 6 || currentHour > 23) return null
  
  const top = (currentHour - 6) * 80 + (currentMinute / 60) * 80
  const left = `${(currentDayIndex + 1) * (100 / 8)}%` // +1 to account for time column
  const width = `${100 / 8}%`
  
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute z-20 pointer-events-none"
      style={{ top: `${top}px`, left, width }}
    >
      <div className="relative">
        {/* Time dot */}
        <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
        
        {/* Time line */}
        <div className="h-0.5 bg-red-500 shadow-lg shadow-red-500/50" />
        
        {/* Current time label */}
        <div className="absolute -top-8 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded shadow-lg">
          {formatDate(now, 'time')}
        </div>
      </div>
    </m.div>
  )
}

// Session detail modal
function SessionDetailModal({ 
  session, 
  onClose, 
  onEdit, 
  onDelete 
}: {
  session: LearningSession
  onClose: () => void
  onEdit?: (session: LearningSession) => void
  onDelete?: (sessionId: string) => void
}) {
  const colorClass = DEFAULT_SESSION_TYPES.find(t => t.id === session.type.id)?.color || 'cosmic-starlight'
  
  return (
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <m.div
        className="bg-cosmic-gradient p-6 rounded-2xl border border-white/20 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{session.title}</h3>
            <span className={`text-sm px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20`}>
              {session.type.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>

        {session.description && (
          <p className="text-white/70 mb-4">{session.description}</p>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-cosmic-starlight" />
            <div className="text-white">
              <div className="font-medium">
                {formatDate(session.startTime, 'datetime')} - {formatDate(session.endTime, 'time')}
              </div>
              <div className="text-sm text-white/60">
                Duration: {formatDuration(session.estimatedDuration)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit?.(session)}
            className="flex-1 px-4 py-2 rounded-lg bg-cosmic-aurora/20 border border-cosmic-aurora/40 text-cosmic-aurora hover:bg-cosmic-aurora/30 transition-colors font-medium"
          >
            Edit Session
          </button>
          <button
            onClick={() => {
              onDelete?.(session.id)
              onClose()
            }}
            className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </m.div>
    </m.div>
  )
}