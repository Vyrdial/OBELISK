'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/profileSystem'

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchedUserId = useRef<string | null>(null)

  // Fetch profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return // Wait for auth to finish loading
      
      if (!user) {
        setProfile(null)
        setLoading(false)
        lastFetchedUserId.current = null
        return
      }

      // Skip if we already fetched for this user
      if (lastFetchedUserId.current === user.id) {
        return
      }

      try {
        setLoading(true)
        setError(null)
        lastFetchedUserId.current = user.id
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)
      } catch (err) {
        setError('Failed to load profile')
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading])

  // Update profile function
  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null

    try {
      setError(null)
      const updatedProfile = await updateUserProfile(user.id, updates)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      return updatedProfile
    } catch (err) {
      setError('Failed to update profile')
      console.error('Error updating profile:', err)
      return null
    }
  }

  // Add stardust
  const addStardust = async (amount: number) => {
    if (!profile) return null
    return updateProfile({ stardust: profile.stardust + amount })
  }

  // Add XP
  const addXP = async (amount: number) => {
    if (!profile) return null
    return updateProfile({ xp: profile.xp + amount })
  }

  // Add achievement
  const addAchievement = async (achievement: string) => {
    if (!profile || profile.achievements.includes(achievement)) return null
    return updateProfile({ achievements: [...profile.achievements, achievement] })
  }

  // Unlock cosmetic item
  const unlockCosmetic = async (cosmeticId: string) => {
    if (!profile || profile.unlocked_cosmetics.includes(cosmeticId)) return null
    return updateProfile({ unlocked_cosmetics: [...profile.unlocked_cosmetics, cosmeticId] })
  }

  // Unlock module
  const unlockModule = async (moduleId: string) => {
    if (!profile || profile.unlocked_modules?.includes(moduleId)) return null
    return updateProfile({ unlocked_modules: [...(profile.unlocked_modules || []), moduleId] })
  }

  const refreshProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      const userProfile = await getUserProfile(user.id)
      setProfile(userProfile)
    } catch (err) {
      setError('Failed to refresh profile')
      console.error('Error refreshing profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    addStardust,
    addXP,
    addAchievement,
    unlockCosmetic,
    unlockModule,
    refreshProfile,
    refetch: refreshProfile // Alias for backwards compatibility
  }
}