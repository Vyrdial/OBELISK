'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createUserProfile } from '@/lib/profileSystem'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithProvider: (provider: 'google' | 'discord') => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Check if this is a new browser session and we had a temporary session
    const checkTemporarySession = async () => {
      if (typeof window !== 'undefined') {
        const isTemporary = window.sessionStorage.getItem('obelisk_session_temporary')
        const wasRemembered = window.localStorage.getItem('obelisk_remember_me')
        
        // If there's no session storage flag but there was a temporary session before,
        // it means the browser was closed and reopened - clear the session
        if (!isTemporary && !wasRemembered) {
          // Check if we have a stored session that should have been temporary
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            // This session should have been temporary, clear it
            await supabase.auth.signOut()
            return null
          }
        }
        
        return true
      }
      return true
    }
    
    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
        // First check if we should clear a temporary session
        const shouldContinue = await checkTemporarySession()
        if (!shouldContinue) {
          if (mounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }
        
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
        
        const result: any = await Promise.race([sessionPromise, timeoutPromise])
        if (!mounted) return
        const { data: { session } } = result
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        // Auth session error - silent fail for better UX
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }
    
    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      try {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Create profile on signup or initial sign in
        if ((event === 'SIGNED_IN' || event === 'SIGNED_UP' || event === 'TOKEN_REFRESHED') && session?.user) {
          // Check if account is marked for deletion
          const userMetadata = session.user.user_metadata || {}
          if (userMetadata.account_deleted) {
            await supabase.auth.signOut()
            return
          }

          // Only create profile on SIGNED_IN or SIGNED_UP events
          if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
            // Check if profile exists, create if not (don't block UI)
            setTimeout(async () => {
              try {
                // Double-check we still have a valid session
                const { data: { session: currentSession } } = await supabase.auth.getSession()
                if (!currentSession?.user) {
                  console.log('No session found, skipping profile creation')
                  return
                }
                
                const { data: existingProfile, error } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('user_id', currentSession.user.id)
                  .maybeSingle()
                
                console.log('Profile check:', { existingProfile, error, userId: currentSession.user.id })
                
                if (!error && !existingProfile) {
                  console.log('Creating profile for user:', currentSession.user.id)
                  const newProfile = await createUserProfile(currentSession.user.id)
                  console.log('Profile creation result:', newProfile)
                }
              } catch (error) {
                console.error('Profile creation error in AuthContext:', error)
              }
            }, 100) // Small delay to ensure auth is fully settled
          }
        }
      } catch (error) {
        // Auth state change error - silent fail
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    // Set session storage based on rememberMe preference
    if (!rememberMe) {
      // Use session storage for this sign-in (expires when browser closes)
      await supabase.auth.updateUser({
        data: { session_expires_at: 'session' }
      }).catch(() => {}) // Ignore errors from this call
    }
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // If rememberMe is false, we'll store a flag to clear session on browser close
    if (!rememberMe && data?.session) {
      // Store in sessionStorage (not localStorage) so it clears on browser close
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('obelisk_session_temporary', 'true')
        // Remove any persistent session flag
        window.localStorage.removeItem('obelisk_remember_me')
      }
    } else if (rememberMe && data?.session) {
      // Store in localStorage to persist
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('obelisk_remember_me', 'true')
        window.sessionStorage.removeItem('obelisk_session_temporary')
      }
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    // Use NEXT_PUBLIC_SITE_URL in production, fallback to window.location.origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        // Clear local state immediately
        setUser(null)
        setSession(null)
      }
      return { error }
    } catch (error) {
      // Force clear local state even if signout fails
      setUser(null)
      setSession(null)
      return { error: error as AuthError }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'discord') => {
    // Use NEXT_PUBLIC_SITE_URL in production, fallback to window.location.origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback`
      }
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
  }

  // Add emergency timeout for auth loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 1000) // Reduced from 2000 to 1000ms
    
    return () => clearTimeout(timeout)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cosmic-starlight/20 animate-pulse"></div>
          <p className="text-white/60">Loading OBELISK...</p>
          <button 
            onClick={() => setLoading(false)} 
            className="mt-4 px-4 py-2 text-sm text-white/60 hover:text-white/80 underline"
          >
            Continue anyway
          </button>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}