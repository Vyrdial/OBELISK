import { cookies } from 'next/headers'

// Server-side cookie utilities for Next.js App Router
export async function setAuthCookie(token: string, rememberMe: boolean = true) {
  const cookieStore = await cookies()
  
  // Set cookie with appropriate expiration
  cookieStore.set('obelisk-auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // If rememberMe is true, set 30 days expiry, otherwise session cookie
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined,
    path: '/'
  })
}

export async function getAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.get('obelisk-auth')
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('obelisk-auth')
}

// Client-side cookie utilities
export const clientCookies = {
  set: (name: string, value: string, days?: number) => {
    if (typeof window === 'undefined') return
    
    let expires = ''
    if (days) {
      const date = new Date()
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
      expires = `; expires=${date.toUTCString()}`
    }
    // If no days specified, it becomes a session cookie
    
    document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`
  },
  
  get: (name: string) => {
    if (typeof window === 'undefined') return null
    
    const nameEQ = `${name}=`
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  },
  
  delete: (name: string) => {
    if (typeof window === 'undefined') return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
}