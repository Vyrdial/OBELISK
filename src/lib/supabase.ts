import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage adapter that respects remember me preference
const customAuthStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null
    
    // Check both storages and return whichever has the value
    const sessionValue = window.sessionStorage.getItem(key)
    if (sessionValue) return sessionValue
    
    const localValue = window.localStorage.getItem(key)
    return localValue
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    
    // Determine storage based on remember me preference
    const rememberMe = window.localStorage.getItem('obelisk_remember_me') === 'true'
    
    if (rememberMe) {
      // Use localStorage for persistent sessions
      window.localStorage.setItem(key, value)
      // Clear from sessionStorage if it exists there
      window.sessionStorage.removeItem(key)
    } else {
      // Use sessionStorage for temporary sessions (cleared on browser close)
      window.sessionStorage.setItem(key, value)
      // Clear from localStorage if it exists there
      window.localStorage.removeItem(key)
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return
    
    // Remove from both storages
    window.sessionStorage.removeItem(key)
    window.localStorage.removeItem(key)
    
    // Also clear the remember me preference
    window.localStorage.removeItem('obelisk_remember_me')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'api'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: customAuthStorage,
    storageKey: 'obelisk-auth-token',
    flowType: 'pkce'
  }
})

// Database types for OBELISK
export interface User {
  id: string
  username: string
  stardust: number
  unlocked_cosmetics: string[]
  created_at: string
  updated_at: string
}

export interface Constellation {
  id: string
  title: string
  description: string
  completed: boolean
  mastery_level: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface QuizResult {
  id: string
  user_id: string
  quiz_id: string
  score: number
  total_questions: number
  timestamp: string
}

export interface ConceptLink {
  id: string
  term: string
  definition: string
  metaphor: string
  related_lessons: string[]
  visuals?: string
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  constellation_id: string
  title: string
  content: string
  npc_dialogs: NPCDialog[]
  order_index: number
  xp_reward: number
  stardust_reward: number
  created_at: string
  updated_at: string
}

export interface NPCDialog {
  id: string
  npc: 'ERRATA' | 'MNEMONIC' | 'ECHELON' | 'LAGOM'
  text: string
  order_index: number
  animation?: string
  requires_interaction: boolean
}

export interface Quiz {
  id: string
  lesson_id: string
  questions: QuizQuestion[]
  passing_score: number
  stardust_reward: number
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  hint?: string
}