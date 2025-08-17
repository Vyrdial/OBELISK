// Centralized lesson data for the cosmic planner
export interface LessonData {
  id: string
  title: string
  description: string
  constellationId: string
  constellationTitle: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedDuration: number // in minutes
  xpReward: number
  stardustReward: number
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  prerequisites: string[]
  route: string
}

export const SYSTEMS_THINKING_LESSONS: LessonData[] = [
  {
    id: 'singularity',
    title: 'The Singularity',
    description: 'The absence of variation - something that can never change',
    constellationId: 'systems-thinking',
    constellationTitle: 'Systems Thinking',
    difficulty: 1,
    estimatedDuration: 20, // Shorter, foundational concept
    xpReward: 30,
    stardustReward: 35,
    status: 'available',
    prerequisites: [],
    route: '/singularity'
  },
  {
    id: 'making-points',
    title: 'Making Points',
    description: 'How we create reference points from the unreachable singularity',
    constellationId: 'systems-thinking',
    constellationTitle: 'Systems Thinking',
    difficulty: 2,
    estimatedDuration: 25,
    xpReward: 40,
    stardustReward: 45,
    status: 'available',
    prerequisites: ['singularity'],
    route: '/making-points'
  },
  {
    id: 'axes',
    title: 'Axes',
    description: 'The fundamental ways things can vary',
    constellationId: 'systems-thinking',
    constellationTitle: 'Systems Thinking',
    difficulty: 3,
    estimatedDuration: 30,
    xpReward: 60,
    stardustReward: 55,
    status: 'available',
    prerequisites: ['making-points'],
    route: '/axes'
  },
  {
    id: 'space-fundamentals',
    title: 'Space Fundamentals',
    description: 'How axes create space and enable simultaneous movement',
    constellationId: 'systems-thinking',
    constellationTitle: 'Systems Thinking',
    difficulty: 3,
    estimatedDuration: 25,
    xpReward: 65,
    stardustReward: 60,
    status: 'available',
    prerequisites: ['axes'],
    route: '/space-fundamentals'
  },
  {
    id: 'universal-relativity',
    title: 'Universal Relativity',
    description: 'How perspective shapes observation and truth',
    constellationId: 'systems-thinking',
    constellationTitle: 'Systems Thinking',
    difficulty: 2,
    estimatedDuration: 35,
    xpReward: 75,
    stardustReward: 65,
    status: 'available',
    prerequisites: ['making-points'],
    route: '/universal-relativity'
  },
]

// All available lessons (easy to extend with more constellations)
export const ALL_LESSONS: LessonData[] = [
  ...SYSTEMS_THINKING_LESSONS
]

// Helper functions
export function getLessonById(id: string): LessonData | undefined {
  return ALL_LESSONS.find(lesson => lesson.id === id)
}

export function getLessonsByConstellation(constellationId: string): LessonData[] {
  return ALL_LESSONS.filter(lesson => lesson.constellationId === constellationId)
}

export function getAvailableLessons(): LessonData[] {
  return ALL_LESSONS.filter(lesson => lesson.status === 'available')
}

export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1: return 'Beginner'
    case 2: return 'Easy'
    case 3: return 'Medium'
    case 4: return 'Hard'
    case 5: return 'Expert'
    default: return 'Unknown'
  }
}

export function getDifficultyColor(difficulty: number): string {
  switch (difficulty) {
    case 1: return 'cosmic-starlight'
    case 2: return 'cosmic-aurora'
    case 3: return 'cosmic-quasar'
    case 4: return 'cosmic-nebula'
    case 5: return 'cosmic-void'
    default: return 'cosmic-starlight'
  }
}