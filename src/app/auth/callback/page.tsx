'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createUserProfile } from '@/lib/profileSystem'

function AuthCallbackContent() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started, URL:', window.location.href)
        
        // Wait for Supabase to process the URL tokens
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Session check:', { session, error })
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
          return
        }

        if (session?.user) {
          console.log('User authenticated:', session.user.id)
          
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle()
          
          console.log('Profile check:', { profile, profileError })

          if (!profile && !profileError) {
            console.log('No profile found, creating one...')
            const newProfile = await createUserProfile(session.user.id)
            console.log('Profile creation result:', newProfile)
          }

          // Redirect to home
          console.log('Redirecting to /home')
          router.push('/home')
        } else {
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cosmic-starlight/20 animate-pulse"></div>
        <p className="text-white/60">Completing authentication...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cosmic-starlight/20 animate-pulse"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}