'use client'

import { appConfig } from '@/config/app'

// Client-side auth utilities for managing remember me functionality

export const authStorage = {
  // Set remember me preference
  setRememberMe: (remember: boolean) => {
    if (typeof window === 'undefined') return
    
    if (remember) {
      // Store in localStorage to persist
      window.localStorage.setItem('obelisk_remember_me', 'true')
      
      // Also set a cookie for server-side checks
      const maxAge = appConfig.features.rememberMe.maxAgeDays * 24 * 60 * 60
      const domain = appConfig.cookies.domain ? `; Domain=${appConfig.cookies.domain}` : ''
      const secure = appConfig.cookies.secure ? '; Secure' : ''
      document.cookie = `obelisk_remember_me=true; path=/; max-age=${maxAge}; SameSite=${appConfig.cookies.sameSite}${domain}${secure}`
    } else {
      // Remove from localStorage
      window.localStorage.removeItem('obelisk_remember_me')
      
      // Set cookie to false
      const domain = appConfig.cookies.domain ? `; Domain=${appConfig.cookies.domain}` : ''
      const secure = appConfig.cookies.secure ? '; Secure' : ''
      document.cookie = `obelisk_remember_me=false; path=/; SameSite=${appConfig.cookies.sameSite}${domain}${secure}`
    }
  },
  
  // Get remember me preference
  getRememberMe: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('obelisk_remember_me') === 'true'
  },
  
  // Clear all auth-related storage
  clearAuth: () => {
    if (typeof window === 'undefined') return
    
    // Clear localStorage
    window.localStorage.removeItem('obelisk_remember_me')
    window.localStorage.removeItem('obelisk-auth-token')
    
    // Clear sessionStorage
    window.sessionStorage.removeItem('obelisk-auth-token')
    window.sessionStorage.removeItem('obelisk_session_active')
    
    // Clear cookies
    document.cookie = 'obelisk_remember_me=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'obelisk_session_active=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'obelisk-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  },
  
  // Check if session should persist
  shouldPersistSession: (): boolean => {
    if (typeof window === 'undefined') return false
    
    // Check if remember me is enabled
    const rememberMe = window.localStorage.getItem('obelisk_remember_me') === 'true'
    
    // Check if we have an active session marker (for non-remembered sessions)
    const hasSessionMarker = window.sessionStorage.getItem('obelisk_session_active') === 'true'
    
    return rememberMe || hasSessionMarker
  }
}