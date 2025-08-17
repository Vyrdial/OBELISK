'use client'

import { useState, useMemo } from 'react'
import { m } from 'framer-motion'
import { Plus, Clock, Edit3, Trash2, MoreHorizontal } from 'lucide-react'
import { 
  LearningSession, 
  generateTimeSlots, 
  formatDate, 
  formatDuration,
  isSameDay,
  isToday,
  getStartOfWeek,
  isPastTime 
} from '@/lib/timeUtils'
import { DEFAULT_SESSION_TYPES } from '@/lib/sessionTypes'

interface WeekViewProps {
  date: Date
  sessions: LearningSession[]
  onSessionEdit?: (session: LearningSession) => void
  onSessionDelete?: (sessionId: string) => void
  onSessionCreate?: (startTime: Date) => void
}

export default function WeekView({ 
  date, 
  sessions, 
  onSessionEdit, 
  onSessionDelete,
  onSessionCreate 
}: WeekViewProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; hour: number } | null>(null)
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
    
    // Convert to grid position (each hour is 60px)
    const top = (startHour - 6) * 60 + (startMinute / 60) * 60
    const height = ((endHour - startHour) * 60) + ((endMinute - startMinute) / 60) * 60
    
    return { top: `${top}px`, height: `${height}px` }
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

  const handleSlotClick = (day: Date, hour: number) => {
    const startTime = new Date(day)
    startTime.setHours(hour, 0, 0, 0)
    
    // Don't allow creating sessions in the past
    if (isPastTime(startTime)) return
    
    onSessionCreate?.(startTime)
  }

  // Check if a time slot is in the past
  const isSlotInPast = (day: Date, hour: number) => {
    const slotTime = new Date(day)
    slotTime.setHours(hour, 0, 0, 0)
    return isPastTime(slotTime)
  }

  return (
    <div className="week-view bg-cosmic-gradient/30 rounded-xl border border-white/10 overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-white/10">
        {/* Time column header */}
        <div className="p-4 border-r border-white/10">
          <div className="text-sm font-medium text-white/60">Time</div>
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
      <div className="relative">
        <div className="grid grid-cols-8">
          {/* Time labels column */}
          <div className="border-r border-white/10">
            {hourSlots.map(hour => (
              <div key={hour} className="h-15 flex items-start justify-end pr-3 pt-2 border-b border-white/5">
                <span className="text-xs text-white/50 font-mono">
                  {formatTime(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={day.toISOString()} className="relative border-r border-white/10 last:border-r-0">
              {/* Hour slots */}
              {hourSlots.map((hour, hourIndex) => {
                const isSlotPast = isSlotInPast(day, hour)
                
                return (
                  <m.div
                    key={`${dayIndex}-${hour}`}
                    className={`h-15 border-b border-white/5 transition-colors relative ${
                      isSlotPast
                        ? 'bg-white/5 cursor-not-allowed opacity-50'
                        : `cursor-pointer ${
                            hoveredSlot?.day === dayIndex && hoveredSlot?.hour === hour
                              ? 'bg-cosmic-aurora/10'
                              : 'hover:bg-white/5'
                          }`
                    }`}
                    onMouseEnter={() => !isSlotPast && setHoveredSlot({ day: dayIndex, hour })}
                    onMouseLeave={() => setHoveredSlot(null)}
                    onClick={() => handleSlotClick(day, hour)}
                    whileHover={!isSlotPast ? { scale: 1.01 } : {}}
                  >
                    {/* Add button on hover (only for future slots) */}
                    {hoveredSlot?.day === dayIndex && hoveredSlot?.hour === hour && !isSlotPast && (
                      <m.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="p-2 rounded-lg bg-cosmic-aurora/20 border border-cosmic-aurora/40">
                          <Plus className="w-4 h-4 text-cosmic-aurora" />
                        </div>
                      </m.div>
                    )}
                  </m.div>
                )
              })}

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
                    className={`absolute left-1 right-1 z-10 bg-${colorClass}/20 border border-${colorClass}/40 rounded-lg p-2 cursor-pointer group overflow-hidden`}
                    style={style}
                    onClick={() => setSelectedSession(session)}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    {/* Session content */}
                    <div className="h-full flex flex-col">
                      <div className={`text-xs font-semibold text-${colorClass} mb-1 truncate`}>
                        {session.title}
                      </div>
                      
                      {/* Show time if there's space */}
                      {session.estimatedDuration >= 45 && (
                        <div className="text-xs text-white/60 mb-1">
                          {formatDate(session.startTime, 'time')}
                        </div>
                      )}
                      
                      {/* Show description if there's space */}
                      {session.estimatedDuration >= 60 && session.description && (
                        <div className="text-xs text-white/50 line-clamp-2 flex-1">
                          {session.description}
                        </div>
                      )}
                      
                      {/* Duration badge */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-white/60">
                          {formatDuration(session.estimatedDuration)}
                        </span>
                        
                        {/* Action buttons (visible on hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSessionEdit?.(session)
                            }}
                            className="p-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSessionDelete?.(session.id)
                            }}
                            className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-${colorClass}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg`} />
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
  
  const top = (currentHour - 6) * 60 + (currentMinute / 60) * 60
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
        <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg" />
        
        {/* Time line */}
        <div className="h-0.5 bg-red-500 shadow-lg" />
        
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <m.div
        className="bg-cosmic-gradient p-6 rounded-2xl border border-white/20 max-w-md w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{session.title}</h3>
            <span className={`text-sm px-2 py-1 rounded bg-${colorClass}/20 text-${colorClass}`}>
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
            className="flex-1 px-4 py-2 rounded-lg bg-cosmic-aurora/20 border border-cosmic-aurora/40 text-cosmic-aurora hover:bg-cosmic-aurora/30 transition-colors"
          >
            Edit Session
          </button>
          <button
            onClick={() => onDelete?.(session.id)}
            className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </m.div>
    </m.div>
  )
}