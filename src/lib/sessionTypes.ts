// Pre-defined learning session types for the cosmic planner
import { SessionType } from './timeUtils'

export const DEFAULT_SESSION_TYPES: SessionType[] = [
  {
    id: 'focus',
    name: 'Focus',
    color: 'cosmic-aurora',
    icon: 'Brain',
    defaultDuration: 45,
    description: 'Deep learning session'
  },
  {
    id: 'review',
    name: 'Review',
    color: 'cosmic-starlight',
    icon: 'RefreshCw',
    defaultDuration: 20,
    description: 'Quick knowledge refresh'
  },
  {
    id: 'practice',
    name: 'Practice',
    color: 'cosmic-quasar',
    icon: 'Target',
    defaultDuration: 30,
    description: 'Apply what you learned'
  },
  {
    id: 'explore',
    name: 'Explore',
    color: 'cosmic-nebula',
    icon: 'Compass',
    defaultDuration: 60,
    description: 'Discover new concepts'
  }
]

// Difficulty-based duration adjustments
export const DIFFICULTY_MULTIPLIERS = {
  easy: 0.8,    // 20% less time
  medium: 1.0,  // Standard time
  hard: 1.3     // 30% more time
}

// Time of day effectiveness modifiers
export const TIME_EFFECTIVENESS = {
  morning: { focused: 1.2, review: 1.0, practice: 1.1 },
  afternoon: { focused: 0.9, review: 1.1, practice: 1.2 },
  evening: { focused: 0.8, review: 1.2, practice: 0.9 }
}

// Constellation-specific session recommendations
export const CONSTELLATION_SESSIONS = {
  'systems-thinking': [
    { type: 'focus', priority: 1, description: 'Understand core system concepts' },
    { type: 'practice', priority: 2, description: 'Apply systems thinking to problems' },
    { type: 'review', priority: 3, description: 'Connect systems to real-world examples' }
  ],
  'mathematics': [
    { type: 'focus', priority: 1, description: 'Learn new mathematical concepts' },
    { type: 'practice', priority: 1, description: 'Solve problems and exercises' },
    { type: 'review', priority: 2, description: 'Review formulas and methods' }
  ],
  'language': [
    { type: 'focus', priority: 1, description: 'Study grammar and vocabulary' },
    { type: 'practice', priority: 1, description: 'Practice speaking and writing' },
    { type: 'explore', priority: 2, description: 'Immerse in authentic content' }
  ]
}

// Smart duration suggestions based on session type and context
export function suggestDuration(
  sessionType: string,
  difficulty: 'easy' | 'medium' | 'hard',
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  availableTime?: number
): number {
  const baseType = DEFAULT_SESSION_TYPES.find(t => t.id === sessionType)
  if (!baseType) return 30 // fallback
  
  let duration = baseType.defaultDuration
  
  // Apply difficulty multiplier
  duration *= DIFFICULTY_MULTIPLIERS[difficulty]
  
  // Apply time of day effectiveness (if low effectiveness, suggest shorter sessions)
  const typeCategory = getSessionCategory(sessionType)
  const effectiveness = TIME_EFFECTIVENESS[timeOfDay][typeCategory] || 1.0
  if (effectiveness < 0.9) {
    duration *= 0.8 // Shorter sessions when effectiveness is low
  }
  
  // Respect available time constraint
  if (availableTime && duration > availableTime) {
    duration = Math.max(15, availableTime) // Minimum 15 minutes
  }
  
  return Math.round(duration)
}

function getSessionCategory(sessionType: string): 'focused' | 'review' | 'practice' {
  switch (sessionType) {
    case 'focus':
    case 'explore':
      return 'focused'
    case 'review':
      return 'review'
    case 'practice':
      return 'practice'
    default:
      return 'focused'
  }
}

// Generate session recommendations for a constellation
export function getConstellationRecommendations(
  constellationId: string,
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Array<{ sessionType: SessionType; priority: number; reason: string }> {
  const baseRecommendations = CONSTELLATION_SESSIONS[constellationId as keyof typeof CONSTELLATION_SESSIONS] || CONSTELLATION_SESSIONS['systems-thinking']
  
  return baseRecommendations.map((rec: any) => {
    const sessionType = DEFAULT_SESSION_TYPES.find(t => t.id === rec.type)!
    return {
      sessionType,
      priority: rec.priority,
      reason: rec.description
    }
  })
}