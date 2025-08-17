// Time and timezone utilities for the cosmic planner
export interface TimeSlot {
  start: Date
  end: Date
  duration: number // in minutes
}

export interface LearningSession {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: SessionType
  constellationId?: string
  lessonId?: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDuration: number // in minutes
  actualDuration?: number
  completed: boolean
  recurring?: RecurringPattern
  reminders: ReminderTime[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface SessionType {
  id: string
  name: string
  color: string
  icon: string
  defaultDuration: number
  description: string
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval: number // every N days/weeks/months
  daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  endDate?: Date
  maxOccurrences?: number
}

export interface ReminderTime {
  minutesBefore: number
  enabled: boolean
}

// Get user's timezone automatically
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Get current date in user's timezone
export function getCurrentDate(): Date {
  return new Date()
}

// Format date for display
export function formatDate(date: Date, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string {
  const timezone = getUserTimezone()
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { timeZone: timezone })
    case 'long':
      return date.toLocaleDateString('en-US', { 
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'time':
      return date.toLocaleTimeString('en-US', { 
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    case 'datetime':
      return date.toLocaleString('en-US', { 
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric'
      })
    default:
      return date.toLocaleDateString('en-US', { timeZone: timezone })
  }
}

// Get start of day
export function getStartOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

// Get end of day
export function getEndOfDay(date: Date): Date {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

// Get start of week (Sunday)
export function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
  return getStartOfDay(start)
}

// Get end of week (Saturday)
export function getEndOfWeek(date: Date): Date {
  const end = new Date(date)
  const day = end.getDay()
  end.setDate(end.getDate() + (6 - day))
  return getEndOfDay(end)
}

// Get start of month
export function getStartOfMonth(date: Date): Date {
  const start = new Date(date)
  start.setDate(1)
  return getStartOfDay(start)
}

// Get end of month
export function getEndOfMonth(date: Date): Date {
  const end = new Date(date)
  end.setMonth(end.getMonth() + 1, 0)
  return getEndOfDay(end)
}

// Check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// Check if date is today
export function isToday(date: Date): boolean {
  return isSameDay(date, getCurrentDate())
}

// Check if date is tomorrow
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return isSameDay(date, tomorrow)
}

// Check if date is in the past (before today, excluding today)
export function isPastDate(date: Date): boolean {
  const today = getStartOfDay(getCurrentDate())
  const targetDate = getStartOfDay(date)
  return targetDate < today
}

// Check if time is in the past (before current time)
export function isPastTime(date: Date): boolean {
  return date < getCurrentDate()
}

// Generate time slots for a day
export function generateTimeSlots(date: Date, intervalMinutes: number = 30): TimeSlot[] {
  const slots: TimeSlot[] = []
  const start = getStartOfDay(date)
  start.setHours(6) // Start at 6 AM
  
  const end = getEndOfDay(date)
  end.setHours(23) // End at 11 PM
  
  let current = new Date(start)
  
  while (current < end) {
    const slotEnd = new Date(current)
    slotEnd.setMinutes(slotEnd.getMinutes() + intervalMinutes)
    
    slots.push({
      start: new Date(current),
      end: slotEnd,
      duration: intervalMinutes
    })
    
    current = slotEnd
  }
  
  return slots
}

// Check if time slots overlap
export function timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.start < slot2.end && slot2.start < slot1.end
}

// Find available time slots
export function findAvailableSlots(
  date: Date, 
  duration: number, 
  existingSessions: LearningSession[],
  preferredStartHour: number = 9,
  preferredEndHour: number = 21
): TimeSlot[] {
  const allSlots = generateTimeSlots(date, 30)
  const availableSlots: TimeSlot[] = []
  
  // Filter slots within preferred hours
  const preferredSlots = allSlots.filter(slot => {
    const hour = slot.start.getHours()
    return hour >= preferredStartHour && hour < preferredEndHour
  })
  
  // Check each slot against existing sessions
  for (let i = 0; i <= preferredSlots.length - Math.ceil(duration / 30); i++) {
    const startSlot = preferredSlots[i]
    const endTime = new Date(startSlot.start)
    endTime.setMinutes(endTime.getMinutes() + duration)
    
    const proposedSlot: TimeSlot = {
      start: startSlot.start,
      end: endTime,
      duration
    }
    
    // Check if this slot conflicts with any existing session
    const hasConflict = existingSessions.some(session => {
      const sessionSlot: TimeSlot = {
        start: session.startTime,
        end: session.endTime,
        duration: (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      }
      return timeSlotsOverlap(proposedSlot, sessionSlot)
    })
    
    if (!hasConflict) {
      availableSlots.push(proposedSlot)
    }
  }
  
  return availableSlots
}

// Calculate optimal study times based on learning research
export function getOptimalStudyTimes(): { hour: number; label: string; effectiveness: number }[] {
  return [
    { hour: 9, label: 'Morning Focus', effectiveness: 0.95 },
    { hour: 10, label: 'Peak Morning', effectiveness: 1.0 },
    { hour: 11, label: 'Late Morning', effectiveness: 0.9 },
    { hour: 14, label: 'Post-Lunch', effectiveness: 0.7 },
    { hour: 15, label: 'Afternoon', effectiveness: 0.8 },
    { hour: 16, label: 'Late Afternoon', effectiveness: 0.85 },
    { hour: 19, label: 'Evening Review', effectiveness: 0.75 },
    { hour: 20, label: 'Night Study', effectiveness: 0.6 }
  ]
}

// Get duration in human readable format
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

// Generate smart session suggestions
export function generateSessionSuggestions(
  availableTime: number, // in minutes
  currentProgress: any, // user's learning progress
  preferences: any // user preferences
): LearningSession[] {
  // This will be implemented with LAGOM's intelligence
  return []
}