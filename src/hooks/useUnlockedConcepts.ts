'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface UnlockedConcept {
  concept_id: string
  unlocked_at: string
}

export function useUnlockedConcepts() {
  const [unlockedConcepts, setUnlockedConcepts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch unlocked concepts from Supabase
  const fetchUnlockedConcepts = useCallback(async () => {
    if (!user) {
      setUnlockedConcepts([])
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/concepts/unlock')
      if (response.ok) {
        const data = await response.json()
        const conceptIds = data.concepts.map((c: UnlockedConcept) => c.concept_id)
        setUnlockedConcepts(conceptIds)
        
        // Also update localStorage for offline access
        localStorage.setItem('obelisk_unlocked_concepts', JSON.stringify(conceptIds))
      }
    } catch (error) {
      console.error('Error fetching unlocked concepts:', error)
      // Fall back to localStorage
      const stored = localStorage.getItem('obelisk_unlocked_concepts')
      if (stored) {
        setUnlockedConcepts(JSON.parse(stored))
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Unlock a concept
  const unlockConcept = useCallback(async (conceptId: string) => {
    if (!user) {
      // Store in localStorage for non-authenticated users
      const current = JSON.parse(localStorage.getItem('obelisk_unlocked_concepts') || '[]')
      if (!current.includes(conceptId)) {
        current.push(conceptId)
        localStorage.setItem('obelisk_unlocked_concepts', JSON.stringify(current))
        setUnlockedConcepts(current)
      }
      return
    }

    try {
      const response = await fetch('/api/concepts/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId })
      })

      if (response.ok) {
        setUnlockedConcepts(prev => {
          if (!prev.includes(conceptId)) {
            const updated = [...prev, conceptId]
            localStorage.setItem('obelisk_unlocked_concepts', JSON.stringify(updated))
            return updated
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Error unlocking concept:', error)
      // Still update locally on error
      setUnlockedConcepts(prev => {
        if (!prev.includes(conceptId)) {
          const updated = [...prev, conceptId]
          localStorage.setItem('obelisk_unlocked_concepts', JSON.stringify(updated))
          return updated
        }
        return prev
      })
    }
  }, [user])

  // Check if a concept is unlocked
  const isConceptUnlocked = useCallback((conceptId: string) => {
    return unlockedConcepts.includes(conceptId)
  }, [unlockedConcepts])

  // Initial fetch
  useEffect(() => {
    fetchUnlockedConcepts()
  }, [fetchUnlockedConcepts])

  return {
    unlockedConcepts,
    unlockConcept,
    isConceptUnlocked,
    loading,
    refetch: fetchUnlockedConcepts
  }
}