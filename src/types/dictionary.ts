export interface DictionaryEntry {
  id: string
  term: string
  definition: string
  detailedExplanation: string
  lessonId: string
  unlockedAt: Date
  relatedConcepts?: string[]
  examples?: string[]
  interactiveDemo?: {
    type: 'visualization' | 'simulation' | 'quiz'
    component: string // Component name to render
  }
}

export interface PersonalDictionary {
  entries: DictionaryEntry[]
  lastUpdated: Date
}