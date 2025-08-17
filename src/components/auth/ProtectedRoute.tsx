'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || loading) return
    
    if (!user) {
      router.replace(redirectTo)
    }
  }, [user, loading, router, redirectTo, isClient])

  // Show loading while checking auth status or before client renders
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cosmic-starlight/20 animate-pulse"></div>
          <p className="text-white/60">Verifying cosmic access...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return <>{children}</>
}