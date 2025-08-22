'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/useProfile'

export default function ProfileRedirect() {
  const router = useRouter()
  const { profile, loading } = useProfile()

  useEffect(() => {
    console.log('Profile redirect - loading:', loading, 'profile:', profile)
    if (!loading && profile?.profile_id) {
      // Redirect to the user's profile with their profile ID
      router.replace(`/profile/${profile.profile_id}`)
    } else if (!loading && !profile) {
      // No profile found, redirect to home
      router.replace('/')
    }
  }, [profile, loading, router])

  // Show loading while checking profile
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading profile...</div>
    </div>
  )
}