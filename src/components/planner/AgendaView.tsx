'use client'

import { useState, useMemo } from 'react'
import { m } from 'framer-motion'
import { 
  Clock, 
  Play, 
  Edit3, 
  Trash2, 
  Calendar,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { 
  LearningSession, 
  formatDate, 
  formatDuration,
  isToday,
  isTomorrow,
  getCurrentDate
} from '@/lib/timeUtils'
import { DEFAULT_SESSION_TYPES } from '@/lib/sessionTypes'

interface AgendaViewProps {
  sessions: LearningSession[]
  onSessionEdit?: (session: LearningSession) => void
  onSessionDelete?: (sessionId: string) => void
  onSessionStart?: (session: LearningSession) => void
}

export default function AgendaView({ 
  sessions, 
  onSessionEdit, 
  onSessionDelete,
  onSessionStart 
}: AgendaViewProps) {
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null)

  // Group sessions by relative time periods
  const groupedSessions = useMemo(() => {
    const now = getCurrentDate()
    const groups: Record<string, { sessions: LearningSession[]; label: string; color: string }> = {}
    
    // Sort sessions by start time
    const sortedSessions = [...sessions].sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    )

    sortedSessions.forEach(session => {
      const sessionDate = session.startTime
      let groupKey = ''
      let label = ''
      let color = 'white'

      // Determine time grouping
      if (sessionDate < now) {
        // Past sessions
        if (isToday(sessionDate)) {
          groupKey = 'earlier-today'
          label = 'Earlier Today'
          color = 'cosmic-void'
        } else {
          groupKey = 'past'
          label = 'Past Sessions'
          color = 'white/40'
        }
      } else {
        // Future sessions
        const timeDiff = sessionDate.getTime() - now.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

        if (hoursDiff < 2) {
          groupKey = 'next-2-hours'
          label = 'Next 2 Hours'
          color = 'cosmic-aurora'
        } else if (isToday(sessionDate)) {
          groupKey = 'later-today'
          label = 'Later Today'
          color = 'cosmic-starlight'
        } else if (isTomorrow(sessionDate)) {
          groupKey = 'tomorrow'
          label = 'Tomorrow'
          color = 'cosmic-nebula'
        } else if (daysDiff <= 7) {
          groupKey = 'this-week'
          label = 'This Week'
          color = 'cosmic-quasar'
        } else if (daysDiff <= 30) {
          groupKey = 'this-month'
          label = 'This Month'
          color = 'cosmic-stardust'
        } else {
          groupKey = 'future'
          label = 'Future'
          color = 'white/60'
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = { sessions: [], label, color }
      }
      groups[groupKey].sessions.push(session)
    })

    return groups
  }, [sessions])

  // Get session type color
  const getSessionColor = (session: LearningSession) => {
    const sessionType = DEFAULT_SESSION_TYPES.find(t => t.id === session.type.id)
    return sessionType?.color || 'cosmic-starlight'
  }

  // Get session status
  const getSessionStatus = (session: LearningSession) => {
    const now = getCurrentDate()
    if (session.completed) return 'completed'
    if (session.startTime < now && session.endTime < now) return 'missed'
    if (session.startTime <= now && session.endTime > now) return 'active'
    return 'upcoming'
  }

  // Get relative time description
  const getRelativeTime = (date: Date) => {
    const now = getCurrentDate()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      if (diffMinutes === 0) return 'Now'
      if (diffMinutes > 0) return `In ${diffMinutes}m`
      return `${Math.abs(diffMinutes)}m ago`
    }

    if (Math.abs(diffHours) < 24) {
      const hours = Math.round(Math.abs(diffHours))
      if (diffHours > 0) return `In ${hours}h`
      return `${hours}h ago`
    }

    const days = Math.round(Math.abs(diffDays))
    if (diffDays > 0) return `In ${days}d`
    return `${days}d ago`
  }

  const groupOrder = [
    'next-2-hours',
    'later-today', 
    'tomorrow',
    'this-week',
    'this-month',
    'future',
    'earlier-today',
    'past'
  ]

  const orderedGroups = groupOrder
    .filter(key => groupedSessions[key])
    .map(key => ({ key, ...groupedSessions[key] }))

  return (
    <div className="agenda-view bg-cosmic-gradient/30 rounded-xl border border-white/10 overflow-hidden">
      {/* Agenda Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white cosmic-heading">
              Learning Agenda
            </h2>
            <p className="text-white/60 mt-1">
              Your upcoming cosmic learning journey
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="text-right">
            <div className="text-lg font-semibold text-white">
              {sessions.filter(s => s.startTime > getCurrentDate()).length} upcoming
            </div>
            <div className="text-sm text-white/60">
              {sessions.filter(s => getSessionStatus(s) === 'completed').length} completed
            </div>
          </div>
        </div>
      </div>

      {/* Session Groups */}
      <div className="max-h-[600px] overflow-y-auto">
        {orderedGroups.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              No sessions scheduled
            </h3>
            <p className="text-white/40">
              Create your first learning session to get started!
            </p>
          </div>
        ) : (
          orderedGroups.map(({ key, sessions: groupSessions, label, color }) => (
            <div key={key} className="p-6 border-b border-white/5 last:border-b-0">
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full bg-${color}`} />
                <h3 className={`text-lg font-semibold text-${color}`}>
                  {label}
                </h3>
                <span className="text-sm text-white/50">
                  ({groupSessions.length})
                </span>
              </div>

              {/* Sessions in Group */}
              <div className="space-y-3">
                {groupSessions.map((session, index) => {
                  const colorClass = getSessionColor(session)
                  const status = getSessionStatus(session)
                  const relativeTime = getRelativeTime(session.startTime)
                  
                  return (
                    <m.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border cursor-pointer group transition-all duration-200 ${
                        status === 'completed'
                          ? 'bg-green-500/10 border-green-500/30'
                          : status === 'missed'
                          ? 'bg-red-500/10 border-red-500/30'
                          : status === 'active'
                          ? 'bg-cosmic-aurora/20 border-cosmic-aurora/40'
                          : `bg-${colorClass}/10 border-${colorClass}/30 hover:bg-${colorClass}/20`
                      }`}
                      onClick={() => setSelectedSession(session)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        {/* Session Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {/* Status Icon */}
                            {status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            )}
                            {status === 'missed' && (
                              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            )}
                            {status === 'active' && (
                              <div className="w-5 h-5 rounded-full bg-cosmic-aurora animate-pulse flex-shrink-0" />
                            )}
                            
                            {/* Title and Type */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold truncate ${
                                status === 'completed' ? 'text-green-400' :
                                status === 'missed' ? 'text-red-400' :
                                status === 'active' ? 'text-cosmic-aurora' :
                                `text-${colorClass}`
                              }`}>
                                {session.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded bg-${colorClass}/20 text-${colorClass}`}>
                                  {session.type.name}
                                </span>
                                {session.lessonId && (
                                  <span className="text-xs px-2 py-1 rounded bg-cosmic-nebula/20 text-cosmic-nebula">
                                    Lesson
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Time and Duration */}
                          <div className="flex items-center gap-4 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(session.startTime, 'datetime')}</span>
                            </div>
                            <span>•</span>
                            <span>{formatDuration(session.estimatedDuration)}</span>
                            <span>•</span>
                            <span className={`font-medium ${
                              status === 'active' ? 'text-cosmic-aurora' : 'text-white/80'
                            }`}>
                              {relativeTime}
                            </span>
                          </div>

                          {/* Description */}
                          {session.description && (
                            <p className="text-sm text-white/60 mt-2 line-clamp-2">
                              {session.description}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          {session.lessonId && status === 'upcoming' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onSessionStart?.(session)
                              }}
                              className="p-2 rounded-lg bg-cosmic-nebula/20 hover:bg-cosmic-nebula/30 transition-colors"
                              title="Start Lesson"
                            >
                              <Play className="w-4 h-4 text-cosmic-nebula" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSessionEdit?.(session)
                            }}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            title="Edit Session"
                          >
                            <Edit3 className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSessionDelete?.(session.id)
                            }}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </m.div>
                  )
                })}
              </div>
            </div>
          ))
        )}
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

// Session detail modal (reuse pattern)
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