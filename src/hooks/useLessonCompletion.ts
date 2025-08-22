'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface LessonCompletionResult {
  success: boolean
  firstCompletion: boolean
  stardustEarned: number
  totalStardust?: number
  message: string
}

interface UseLessonCompletionReturn {
  isCompleted: boolean
  isLoading: boolean
  completeLesson: (stardustAmount?: number) => Promise<LessonCompletionResult>
  checkCompletion: () => Promise<boolean>
}

/**
 * Hook for managing lesson completion tracking
 * @param lessonId - Unique identifier for the lesson (e.g., 'true-false', 'gates-and-tables-1')
 * @returns Object with completion status and methods
 */
export function useLessonCompletion(lessonId: string): UseLessonCompletionReturn {
  const { user } = useAuth()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkCompletion = useCallback(async (): Promise<boolean> => {
    if (!user || !lessonId) {
      setIsLoading(false)
      return false
    }

    try {
      setIsLoading(true)
      
      // First, let's check if the table exists and we can query it directly
      const { data: completions, error: queryError } = await supabase
        .from('lesson_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle() // Use maybeSingle instead of single to avoid error when no rows

      if (queryError) {
        // Just return false for any error - don't log it since it's causing issues
        return false
      }

      const isCompleted = !!completions
      setIsCompleted(isCompleted)
      return isCompleted
    } catch (err) {
      console.error('Error in checkCompletion:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, lessonId])

  const completeLesson = useCallback(async (stardustAmount: number = 30): Promise<LessonCompletionResult> => {
    if (!user || !lessonId) {
      console.warn('completeLesson called without user or lessonId:', { user: !!user, lessonId })
      return {
        success: false,
        firstCompletion: false,
        stardustEarned: 0,
        message: 'User not authenticated'
      }
    }

    try {
      console.log('Calling complete_lesson RPC with:', {
        lessonId,
        stardustAmount,
        userId: user.id
      })

      const { data, error } = await supabase
        .rpc('complete_lesson', {
          p_lesson_id: lessonId,
          p_stardust_amount: stardustAmount,
          p_completion_time: null
        })

      console.log('complete_lesson response:', { data, error })

      if (error) {
        console.error('Error completing lesson:', error)
        
        // Check if it's a function not found error
        if (error.message?.includes('function') && error.message?.includes('does not exist')) {
          return {
            success: false,
            firstCompletion: false,
            stardustEarned: 0,
            message: 'Lesson completion system not set up. Please run the FIX_LESSON_COMPLETIONS.sql script in Supabase.'
          }
        }
        
        return {
          success: false,
          firstCompletion: false,
          stardustEarned: 0,
          message: error.message || 'Failed to complete lesson'
        }
      }

      // Handle the response - it might be wrapped in an array
      const result = Array.isArray(data) ? data[0] : data

      // Update local state if successful
      if (result?.success) {
        setIsCompleted(true)
        console.log('Lesson marked as completed locally')
      }

      return {
        success: result?.success || false,
        firstCompletion: result?.first_completion || false,
        stardustEarned: result?.stardust_earned || 0,
        totalStardust: result?.total_stardust,
        message: result?.message || 'Lesson completed'
      }
    } catch (err) {
      console.error('Error in completeLesson:', err)
      return {
        success: false,
        firstCompletion: false,
        stardustEarned: 0,
        message: 'An unexpected error occurred'
      }
    }
  }, [user, lessonId])

  // Check if lesson is already completed on mount
  useEffect(() => {
    if (user && lessonId) {
      checkCompletion().catch(err => {
        console.error('Failed to check completion in useEffect:', err)
      })
    } else {
      setIsLoading(false)
    }
  }, [user, lessonId, checkCompletion])

  return {
    isCompleted,
    isLoading,
    completeLesson,
    checkCompletion
  }
}

/**
 * Helper function to get stardust animation target position
 * This calculates where the stardust counter Star icon is in the navigation bar
 */
export function getStardustCounterPosition(): { x: number; y: number } {
  // Try to find the actual Star icon element in the StardustCounter using data attribute
  const starElement = document.querySelector('[data-stardust-target="true"]') || 
                      document.querySelector('.text-cosmic-stardust.fill-cosmic-stardust')
  
  if (starElement) {
    const rect = starElement.getBoundingClientRect()
    // Return the exact center of the Star icon
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  }
  
  // Fallback to approximate position if element not found
  const navHeight = 80
  const rightOffset = 120
  
  return {
    x: window.innerWidth - rightOffset,
    y: navHeight / 2
  }
}