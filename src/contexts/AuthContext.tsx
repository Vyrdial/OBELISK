'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createUserProfile } from '@/lib/profileSystem'
import { authStorage } from '@/lib/clientAuth'
import { appConfig } from '@/config/app'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signOutAllSessions: () => Promise<{ error: AuthError | null }>
  signInWithProvider: (provider: 'google' | 'discord') => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
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
    // Set the remember me preference using our utility
    authStorage.setRememberMe(rememberMe)
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // If sign in was successful and rememberMe is false, 
    // we need to move the session to sessionStorage
    if (!error && data?.session && !rememberMe) {
      // Get the auth token key that Supabase uses
      const authKey = 'obelisk-auth-token'
      const authData = window.localStorage.getItem(authKey)
      
      if (authData) {
        // Move from localStorage to sessionStorage
        window.sessionStorage.setItem(authKey, authData)
        window.localStorage.removeItem(authKey)
        
        // Set session active marker
        window.sessionStorage.setItem('obelisk_session_active', 'true')
      }
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: appConfig.getAuthCallbackUrl()
      }
    })
    return { error }
  }

  const signOut = async () => {
    try {
      // Clear all auth-related storage
      authStorage.clearAuth()
      
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

  const signOutAllSessions = async () => {
    try {
      // Clear all auth-related storage
      authStorage.clearAuth()
      
      // Sign out from all sessions using Supabase's global sign out
      // This invalidates all refresh tokens for the user
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (!error) {
        // Clear local state immediately
        setUser(null)
        setSession(null)
      }
      
      return { error }
    } catch (error) {
      // Force clear local state even if sign out fails
      setUser(null)
      setSession(null)
      return { error: error as AuthError }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'discord') => {
    // OAuth providers always remember the user by default
    authStorage.setRememberMe(true)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: appConfig.getAuthCallbackUrl()
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
    signOutAllSessions,
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