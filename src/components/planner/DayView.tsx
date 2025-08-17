'use client'

import { useState, useMemo } from 'react'
import { m } from 'framer-motion'
import { Plus, Clock, Edit3, Trash2, Play, Star } from 'lucide-react'
import { 
  LearningSession, 
  formatDate, 
  formatDuration,
  isSameDay,
  isToday,
  getCurrentDate,
  getOptimalStudyTimes,
  isPastDate,
  isPastTime
} from '@/lib/timeUtils'
import { DEFAULT_SESSION_TYPES } from '@/lib/sessionTypes'

interface DayViewProps {
  date: Date
  sessions: LearningSession[]
  onSessionEdit?: (session: LearningSession) => void
  onSessionDelete?: (sessionId: string) => void
  onSessionCreate?: (startTime: Date) => void
}

export default function DayView({ 
  date, 
  sessions, 
  onSessionEdit, 
  onSessionDelete,
  onSessionCreate 
}: DayViewProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null)

  // Generate hour slots (6 AM to 11 PM with 30-minute intervals)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({ hour, minute })
      }
    }
    return slots
  }, [])

  // Get sessions for this day
  const daySessions = useMemo(() => {
    return sessions.filter(session => isSameDay(session.startTime, date))
  }, [sessions, date])

  // Get optimal study times for visual indicators
  const optimalTimes = getOptimalStudyTimes()

  // Get session position and height
  const getSessionStyle = (session: LearningSession) => {
    const startHour = session.startTime.getHours()
    const startMinute = session.startTime.getMinutes()
    const endHour = session.endTime.getHours()
    const endMinute = session.endTime.getMinutes()
    
    // Each 30-minute slot is 80px tall
    const slotHeight = 80
    const startSlotIndex = (startHour - 6) * 2 + (startMinute >= 30 ? 1 : 0)
    const durationInSlots = session.estimatedDuration / 30
    
    const top = startSlotIndex * slotHeight
    const height = durationInSlots * slotHeight
    
    return { top: `${top}px`, height: `${height}px` }
  }

  // Get session type color
  const getSessionColor = (session: LearningSession) => {
    const sessionType = DEFAULT_SESSION_TYPES.find(t => t.id === session.type.id)
    return sessionType?.color || 'cosmic-starlight'
  }

  // Format time for display
  const formatTimeSlot = (hour: number, minute: number) => {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? 'pm' : 'am'
    const displayMinute = `:${minute.toString().padStart(2, '0')}`
    return `${displayHour}${displayMinute} ${period}`
  }

  // Check if time slot is optimal
  const isOptimalTime = (hour: number) => {
    return optimalTimes.some(time => time.hour === hour)
  }

  // Get optimal time effectiveness
  const getTimeEffectiveness = (hour: number) => {
    const optimal = optimalTimes.find(time => time.hour === hour)
    return optimal?.effectiveness || 0.5
  }

  const handleSlotClick = (hour: number, minute: number) => {
    const startTime = new Date(date)
    startTime.setHours(hour, minute, 0, 0)
    
    // Don't allow creating sessions in the past
    if (isPastTime(startTime)) return
    
    onSessionCreate?.(startTime)
  }

  // Check if a time slot is in the past
  const isSlotInPast = (hour: number, minute: number) => {
    const slotTime = new Date(date)
    slotTime.setHours(hour, minute, 0, 0)
    return isPastTime(slotTime)
  }

  return (
    <div className="day-view bg-cosmic-gradient/30 rounded-xl border border-white/10 overflow-hidden">
      {/* Day Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white cosmic-heading">
              {formatDate(date, 'long')}
            </h2>
            {isToday(date) && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-cosmic-aurora rounded-full animate-pulse" />
                <span className="text-sm text-cosmic-aurora font-medium">Today</span>
              </div>
            )}
          </div>
          
          {/* Day Stats */}
          <div className="text-right">
            <div className="text-lg font-semibold text-white">
              {daySessions.length} sessions
            </div>
            <div className="text-sm text-white/60">
              {daySessions.reduce((total, session) => total + session.estimatedDuration, 0)} minutes planned
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="relative">
        {/* Time labels and slots */}
        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r border-white/10">
            {timeSlots.map(({ hour, minute }, index) => (
              <div key={index} className="h-20 flex items-start justify-end pr-3 pt-2 border-b border-white/5">
                {minute === 0 && (
                  <div className="text-right">
                    <div className="text-sm text-white/80 font-mono">
                      {formatTimeSlot(hour, minute)}
                    </div>
                    {isOptimalTime(hour) && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-cosmic-aurora" />
                        <span className="text-xs text-cosmic-aurora">
                          {Math.round(getTimeEffectiveness(hour) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main content area */}
          <div className="flex-1 relative">
            {/* Time slot grid */}
            {timeSlots.map(({ hour, minute }, index) => {
              const isSlotPast = isSlotInPast(hour, minute)
              
              return (
                <m.div
                  key={index}
                  className={`h-20 border-b border-white/5 transition-colors relative ${
                    isSlotPast
                      ? 'bg-white/5 cursor-not-allowed opacity-50'
                      : `cursor-pointer ${
                          hoveredSlot === index
                            ? 'bg-cosmic-aurora/10'
                            : isOptimalTime(hour)
                            ? 'bg-cosmic-starlight/5 hover:bg-cosmic-starlight/10'
                            : 'hover:bg-white/5'
                        }`
                  }`}
                  onMouseEnter={() => !isSlotPast && setHoveredSlot(index)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  onClick={() => handleSlotClick(hour, minute)}
                  whileHover={!isSlotPast ? { scale: 1.01 } : {}}
                >
                {/* Add button on hover (only for future slots) */}
                {hoveredSlot === index && !isSlotPast && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="p-3 rounded-lg bg-cosmic-aurora/20 border border-cosmic-aurora/40">
                      <Plus className="w-5 h-5 text-cosmic-aurora" />
                    </div>
                  </m.div>
                )}

                {/* Optimal time indicator */}
                {isOptimalTime(hour) && minute === 0 && (
                  <div className="absolute left-2 top-2">
                    <div className="w-2 h-2 bg-cosmic-aurora rounded-full opacity-60" />
                  </div>
                )}
                </m.div>
              )
            })}

            {/* Render sessions */}
            {daySessions.map((session, sessionIndex) => {
              const style = getSessionStyle(session)
              const colorClass = getSessionColor(session)
              
              return (
                <m.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.95, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: sessionIndex * 0.1 }}
                  className={`absolute left-2 right-2 z-10 bg-${colorClass}/20 border border-${colorClass}/40 rounded-xl p-4 cursor-pointer group overflow-hidden shadow-lg`}
                  style={style}
                  onClick={() => setSelectedSession(session)}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  {/* Session content */}
                  <div className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-${colorClass} text-lg truncate`}>
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-white/60" />
                          <span className="text-sm text-white/80">
                            {formatDate(session.startTime, 'time')} - {formatDate(session.endTime, 'time')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Session type indicator */}
                      <div className={`px-2 py-1 rounded bg-${colorClass}/30 text-${colorClass} text-xs font-medium`}>
                        {session.type.name}
                      </div>
                    </div>
                    
                    {/* Description */}
                    {session.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2 flex-1">
                        {session.description}
                      </p>
                    )}
                    
                    {/* Session footer */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60">
                          {formatDuration(session.estimatedDuration)}
                        </span>
                        {session.lessonId && (
                          <span className="text-xs px-2 py-1 rounded bg-cosmic-nebula/20 text-cosmic-nebula">
                            Lesson
                          </span>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {session.lessonId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Navigate to lesson
                            }}
                            className="p-1.5 rounded bg-cosmic-nebula/20 hover:bg-cosmic-nebula/30 transition-colors"
                            title="Start Lesson"
                          >
                            <Play className="w-3 h-3 text-cosmic-nebula" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSessionEdit?.(session)
                          }}
                          className="p-1.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
                          title="Edit Session"
                        >
                          <Edit3 className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSessionDelete?.(session.id)
                          }}
                          className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-${colorClass}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`} />
                </m.div>
              )
            })}

            {/* Current time indicator */}
            {isToday(date) && <CurrentTimeIndicator />}
          </div>
        </div>
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

// Current time indicator for today
function CurrentTimeIndicator() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Only show if within our time range
  if (currentHour < 6 || currentHour > 23) return null
  
  const slotIndex = (currentHour - 6) * 2 + (currentMinute >= 30 ? 1 : 0)
  const minuteOffset = (currentMinute % 30) / 30
  const top = slotIndex * 80 + minuteOffset * 80
  
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="relative">
        {/* Time dot */}
        <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
        
        {/* Time line */}
        <div className="h-0.5 bg-red-500 shadow-lg" />
        
        {/* Current time label */}
        <div className="absolute left-4 -top-8 px-2 py-1 bg-red-500 text-white text-xs rounded shadow-lg">
          {formatDate(now, 'time')}
        </div>
      </div>
    </m.div>
  )
}

// Session detail modal (reuse from WeekView)
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
          {session.lessonId && (
            <button className="flex-1 px-4 py-2 rounded-lg bg-cosmic-nebula/20 border border-cosmic-nebula/40 text-cosmic-nebula hover:bg-cosmic-nebula/30 transition-colors">
              Start Lesson
            </button>
          )}
          <button
            onClick={() => onEdit?.(session)}
            className="flex-1 px-4 py-2 rounded-lg bg-cosmic-aurora/20 border border-cosmic-aurora/40 text-cosmic-aurora hover:bg-cosmic-aurora/30 transition-colors"
          >
            Edit
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