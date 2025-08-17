'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/useProfile'

export default function ProfileRedirect() {
  const router = useRouter()
  const { profile, loading } = useProfile()

  useEffect(() => {
    if (!loading && profile?.profile_id) {
      // Redirect to the user's profile with their profile ID
      router.replace(`/profile/${profile.profile_id}`)
    } else if (!loading && !profile) {
      // No profile found, redirect to home
      router.replace('/')
    }
  }, [profile, loading, router])

  // Return null to avoid showing anything during redirect
  return null
}