'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Favorite {
  id: string
  user_id: string
  lesson_id: string
  lesson_title: string
  lesson_path: string
  lesson_description?: string
  created_at: string
}

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch favorites on mount and user change
  useEffect(() => {
    if (user?.id) {
      fetchFavorites()
    } else {
      setFavorites([])
      setFavoriteIds(new Set())
      setLoading(false)
    }
  }, [user?.id])

  const fetchFavorites = async () => {
    if (!user?.id) {
      return
    }

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching favorites:', error.message)
        return
      }

      setFavorites(data || [])
      setFavoriteIds(new Set((data || []).map(fav => fav.lesson_id)))
    } catch (error) {
      console.error('Exception fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = async (lesson: {
    id: string
    title: string
    path: string
    description?: string
  }) => {
    if (!user?.id) return false

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          lesson_path: lesson.path,
          lesson_description: lesson.description
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding to favorites:', error)
        return false
      }

      // Update local state
      setFavorites(prev => [data, ...prev])
      setFavoriteIds(prev => new Set([...prev, lesson.id]))
      return true
    } catch (error) {
      console.error('Error adding to favorites:', error)
      return false
    }
  }

  const removeFromFavorites = async (lessonId: string) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)

      if (error) {
        console.error('Error removing from favorites:', error)
        return false
      }

      // Update local state
      setFavorites(prev => prev.filter(fav => fav.lesson_id !== lessonId))
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(lessonId)
        return newSet
      })
      return true
    } catch (error) {
      console.error('Error removing from favorites:', error)
      return false
    }
  }

  const toggleFavorite = async (lesson: {
    id: string
    title: string
    path: string
    description?: string
  }) => {
    if (favoriteIds.has(lesson.id)) {
      return await removeFromFavorites(lesson.id)
    } else {
      return await addToFavorites(lesson)
    }
  }

  const isFavorite = (lessonId: string) => {
    return favoriteIds.has(lessonId)
  }

  return {
    favorites,
    favoriteIds,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  }
}