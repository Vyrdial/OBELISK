'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Clock, 
  Calendar, 
  Tag, 
  Brain, 
  Target, 
  RefreshCw,
  Compass,
  Eye,
  Wrench,
  Coffee,
  Plus,
  Minus,
  Bell,
  Repeat
} from 'lucide-react'
import { 
  LearningSession, 
  formatDate, 
  formatDuration,
  getCurrentDate,
  isPastTime 
} from '@/lib/timeUtils'
import { 
  DEFAULT_SESSION_TYPES, 
  suggestDuration 
} from '@/lib/sessionTypes'
import { 
  ALL_LESSONS, 
  LessonData, 
  getDifficultyLabel, 
  getDifficultyColor 
} from '@/lib/lessonData'

interface SessionCreatorProps {
  onClose: () => void
  onSave: (session: Partial<LearningSession>) => void
  initialStartTime?: Date
  editingSession?: LearningSession
}

const ICON_MAP = {
  Brain,
  RefreshCw,
  Target,
  Compass,
  Eye,
  Wrench,
  Coffee
}

const CONSTELLATION_OPTIONS = [
  { id: 'systems-thinking', name: 'Systems Thinking', color: 'cosmic-starlight' },
  { id: 'mathematics', name: 'Mathematics', color: 'cosmic-aurora' },
  { id: 'language', name: 'Language', color: 'cosmic-nebula' },
  { id: 'science', name: 'Science', color: 'cosmic-quasar' },
  { id: 'philosophy', name: 'Philosophy', color: 'cosmic-void' }
]

export default function SessionCreator({ 
  onClose, 
  onSave, 
  initialStartTime,
  editingSession 
}: SessionCreatorProps) {
  const [formData, setFormData] = useState({
    title: editingSession?.title || '',
    description: editingSession?.description || '',
    sessionTypeId: editingSession?.type.id || 'focus',
    constellationId: editingSession?.constellationId || 'systems-thinking',
    difficulty: editingSession?.difficulty || 'medium' as 'easy' | 'medium' | 'hard',
    startTime: initialStartTime || editingSession?.startTime || (() => {
      const now = new Date()
      now.setMinutes(0, 0, 0) // Round to nearest hour
      return now
    })(),
    duration: editingSession?.estimatedDuration || 45,
    reminders: editingSession?.reminders || [{ minutesBefore: 15, enabled: true }],
    tags: editingSession?.tags || [],
    recurring: editingSession?.recurring || null
  })
  
  const [newTag, setNewTag] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [sessionMode, setSessionMode] = useState<'general' | 'lesson'>('general')
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null)

  // Auto-suggest duration when session type or difficulty changes
  useEffect(() => {
    if (!editingSession && sessionMode === 'general') { // Only auto-suggest for new general sessions
      const timeOfDay = formData.startTime.getHours() < 12 ? 'morning' : 
                       formData.startTime.getHours() < 17 ? 'afternoon' : 'evening'
      const suggestedDuration = suggestDuration(
        formData.sessionTypeId,
        formData.difficulty,
        timeOfDay
      )
      setFormData(prev => ({ ...prev, duration: suggestedDuration }))
    }
  }, [formData.sessionTypeId, formData.difficulty, editingSession, sessionMode])

  // Auto-populate lesson data when lesson is selected
  useEffect(() => {
    if (selectedLesson && sessionMode === 'lesson') {
      const difficultyMap: Record<number, 'easy' | 'medium' | 'hard'> = {
        1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard'
      }
      
      setFormData(prev => ({
        ...prev,
        title: selectedLesson.title,
        description: selectedLesson.description,
        sessionTypeId: 'focus', // Lessons are focused learning
        constellationId: selectedLesson.constellationId,
        difficulty: difficultyMap[selectedLesson.difficulty],
        duration: selectedLesson.estimatedDuration,
        tags: [selectedLesson.constellationTitle, 'lesson']
      }))
    }
  }, [selectedLesson, sessionMode])

  const selectedSessionType = DEFAULT_SESSION_TYPES.find(t => t.id === formData.sessionTypeId)!
  const selectedConstellation = CONSTELLATION_OPTIONS.find(c => c.id === formData.constellationId)!

  const handleSave = () => {
    // Prevent saving sessions in the past (unless editing existing ones)
    if (!editingSession && isPastTime(formData.startTime)) {
      alert('Cannot create sessions in the past. Please select a future time.')
      return
    }

    const endTime = new Date(formData.startTime)
    endTime.setMinutes(endTime.getMinutes() + formData.duration)

    const sessionData: Partial<LearningSession> = {
      id: editingSession?.id || `session-${Date.now()}`,
      title: formData.title || (selectedLesson ? selectedLesson.title : `${selectedSessionType.name}: ${selectedConstellation.name}`),
      description: formData.description,
      startTime: formData.startTime,
      endTime,
      type: selectedSessionType,
      constellationId: formData.constellationId,
      lessonId: selectedLesson?.id,
      difficulty: formData.difficulty,
      estimatedDuration: formData.duration,
      completed: editingSession?.completed || false,
      recurring: formData.recurring,
      reminders: formData.reminders,
      tags: formData.tags,
      createdAt: editingSession?.createdAt || new Date(),
      updatedAt: new Date()
    }

    onSave(sessionData)
    onClose()
  }


  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const IconComponent = ICON_MAP[selectedSessionType.icon as keyof typeof ICON_MAP] || Brain

  return (
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <m.div
        className="bg-cosmic-gradient p-6 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-${selectedSessionType.color}/20 border border-${selectedSessionType.color}/40`}>
              <IconComponent className={`w-6 h-6 text-${selectedSessionType.color}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white cosmic-heading">
                {editingSession ? 'Edit Session' : 'Create Learning Session'}
              </h3>
              <p className="text-white/60 text-sm">
                Plan your cosmic learning journey
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

        <div className="space-y-6">
          {/* Session Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              What would you like to schedule?
            </label>
            <div className="flex gap-2 p-1 rounded-lg glass-morphism border border-white/20">
              <button
                onClick={() => {
                  setSessionMode('general')
                  setSelectedLesson(null)
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 text-sm font-medium ${
                  sessionMode === 'general'
                    ? 'bg-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                General Session
              </button>
              <button
                onClick={() => setSessionMode('lesson')}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 text-sm font-medium ${
                  sessionMode === 'lesson'
                    ? 'bg-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Specific Lesson
              </button>
            </div>
          </div>

          {/* Lesson Selector (only for lesson mode) */}
          {sessionMode === 'lesson' && (
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Choose a Lesson
              </label>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {ALL_LESSONS.map(lesson => (
                  <m.button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-cosmic-aurora/20 border-cosmic-aurora/40'
                        : 'glass-morphism border-white/20 hover:border-white/40'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${
                        selectedLesson?.id === lesson.id ? 'text-cosmic-aurora' : 'text-white'
                      }`}>
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded bg-${getDifficultyColor(lesson.difficulty)}/20 text-${getDifficultyColor(lesson.difficulty)}`}>
                          {getDifficultyLabel(lesson.difficulty)}
                        </span>
                        <span className="text-xs text-white/60">
                          {formatDuration(lesson.estimatedDuration)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white/60">
                      {lesson.description}
                    </p>
                  </m.button>
                ))}
              </div>
            </div>
          )}

          {/* Session Title (only for general mode or if lesson mode title is being overridden) */}
          {sessionMode === 'general' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Session Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={`${selectedSessionType.name}: ${selectedConstellation.name}`}
                className="w-full px-4 py-3 rounded-lg glass-morphism border border-white/20 text-white placeholder-white/50 focus:border-cosmic-aurora/50 focus:ring-1 focus:ring-cosmic-aurora/50 outline-none transition-colors"
              />
            </div>
          )}

          {/* Session Type (only for general mode) */}
          {sessionMode === 'general' && (
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Session Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DEFAULT_SESSION_TYPES.map(type => {
                  const TypeIcon = ICON_MAP[type.icon as keyof typeof ICON_MAP] || Brain
                  const isSelected = formData.sessionTypeId === type.id
                  
                  return (
                    <m.button
                      key={type.id}
                      onClick={() => setFormData(prev => ({ ...prev, sessionTypeId: type.id }))}
                      className={`p-3 rounded-lg border transition-all duration-300 text-center ${
                        isSelected
                          ? `bg-${type.color}/20 border-${type.color}/40`
                          : 'glass-morphism border-white/20 hover:border-white/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <TypeIcon className={`w-5 h-5 mx-auto mb-1 ${
                        isSelected ? `text-${type.color}` : 'text-white'
                      }`} />
                      <div className={`text-sm font-medium ${
                        isSelected ? `text-${type.color}` : 'text-white'
                      }`}>
                        {type.name}
                      </div>
                    </m.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Constellation & Difficulty (only for general mode) */}
          {sessionMode === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Learning Focus
                </label>
                <select
                  value={formData.constellationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, constellationId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg glass-morphism border border-white/20 text-white bg-transparent focus:border-cosmic-aurora/50 outline-none"
                >
                  {CONSTELLATION_OPTIONS.map(constellation => (
                    <option key={constellation.id} value={constellation.id} className="bg-gray-800">
                      {constellation.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => setFormData(prev => ({ ...prev, difficulty }))}
                      className={`flex-1 py-2 rounded-lg border transition-colors ${
                        formData.difficulty === difficulty
                          ? 'bg-cosmic-aurora/20 border-cosmic-aurora/40 text-cosmic-aurora'
                          : 'glass-morphism border-white/20 text-white hover:border-white/40'
                      }`}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Time & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Time
              </label>
              <div className="space-y-2">
                <input
                  type="datetime-local"
                  value={`${formData.startTime.getFullYear()}-${(formData.startTime.getMonth() + 1).toString().padStart(2, '0')}-${formData.startTime.getDate().toString().padStart(2, '0')}T${formData.startTime.getHours().toString().padStart(2, '0')}:${formData.startTime.getMinutes().toString().padStart(2, '0')}`}
                  onChange={(e) => {
                    const newTime = new Date(e.target.value)
                    setFormData(prev => ({ ...prev, startTime: newTime }))
                  }}
                  className={`w-full px-4 py-2 rounded-lg glass-morphism border text-white bg-transparent focus:border-cosmic-aurora/50 outline-none ${
                    !editingSession && isPastTime(formData.startTime)
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/20'
                  }`}
                />
                {!editingSession && isPastTime(formData.startTime) && (
                  <p className="text-red-400 text-xs mt-1">
                    ⚠️ This time is in the past. Please select a future time.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Duration
              </label>
              {sessionMode === 'lesson' ? (
                <div className="p-4 glass-morphism rounded-lg border border-white/20">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {formatDuration(formData.duration)}
                    </div>
                    <div className="text-xs text-white/60">
                      Estimated lesson duration
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      duration: Math.max(15, prev.duration - 15) 
                    }))}
                    className="p-2 rounded-lg glass-morphism border border-white/20 hover:border-white/40 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-lg font-semibold text-white">
                      {formatDuration(formData.duration)}
                    </div>
                    <div className="text-xs text-white/60">
                      {formData.duration} minutes
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      duration: Math.min(240, prev.duration + 15) 
                    }))}
                    className="p-2 rounded-lg glass-morphism border border-white/20 hover:border-white/40 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What will you focus on during this session?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg glass-morphism border border-white/20 text-white placeholder-white/50 focus:border-cosmic-aurora/50 focus:ring-1 focus:ring-cosmic-aurora/50 outline-none transition-colors resize-none"
            />
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-cosmic-starlight hover:text-cosmic-aurora transition-colors"
            >
              <span>Advanced Options</span>
              <m.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-4 h-4" />
              </m.div>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add a tag..."
                        className="flex-1 px-3 py-2 rounded-lg glass-morphism border border-white/20 text-white placeholder-white/50 focus:border-cosmic-aurora/50 outline-none"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 rounded-lg bg-cosmic-aurora/20 border border-cosmic-aurora/40 text-cosmic-aurora hover:bg-cosmic-aurora/30 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-cosmic-starlight/20 border border-cosmic-starlight/40 text-cosmic-starlight rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reminders */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Reminder
                    </label>
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-cosmic-starlight" />
                      <select
                        value={formData.reminders[0]?.minutesBefore || 15}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          reminders: [{ minutesBefore: parseInt(e.target.value), enabled: true }]
                        }))}
                        className="flex-1 px-3 py-2 rounded-lg glass-morphism border border-white/20 text-white bg-transparent focus:border-cosmic-aurora/50 outline-none"
                      >
                        <option value={5} className="bg-gray-800">5 minutes before</option>
                        <option value={15} className="bg-gray-800">15 minutes before</option>
                        <option value={30} className="bg-gray-800">30 minutes before</option>
                        <option value={60} className="bg-gray-800">1 hour before</option>
                      </select>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg glass-morphism border border-white/20 text-white hover:border-white/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-lg bg-cosmic-aurora text-white font-medium hover:bg-cosmic-aurora/80 transition-colors"
          >
            {editingSession ? 'Update Session' : 'Create Session'}
          </button>
        </div>
      </m.div>
    </m.div>
  )
}