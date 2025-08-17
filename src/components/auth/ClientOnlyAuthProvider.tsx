'use client'

import { useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

export default function ClientOnlyAuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading authentication...</div>
      </div>
    )
  }

  return <AuthProvider>{children}</AuthProvider>
}