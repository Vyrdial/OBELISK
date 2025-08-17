import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'api'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: {
      getItem: (key: string) => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') return null
        
        // First check sessionStorage for temporary sessions
        const sessionItem = window.sessionStorage.getItem(key)
        if (sessionItem) return sessionItem
        
        // Then check localStorage for persistent sessions
        return window.localStorage.getItem(key)
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        
        // Check if this should be a temporary session
        const isTemporary = window.sessionStorage.getItem('obelisk_session_temporary')
        
        if (isTemporary === 'true') {
          // Store in sessionStorage for temporary sessions
          window.sessionStorage.setItem(key, value)
        } else {
          // Store in localStorage for persistent sessions
          window.localStorage.setItem(key, value)
        }
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return
        
        // Remove from both storages
        window.sessionStorage.removeItem(key)
        window.localStorage.removeItem(key)
      }
    }
  }
})

// Database types for OBELISK
export interface User {
  id: string
  username: string
  xp: number
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