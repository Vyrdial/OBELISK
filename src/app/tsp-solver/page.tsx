'use client'

import TSPSolver from '@/components/sandbox/TSPSolver'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useRouter } from 'next/navigation'

function TSPSolverContent() {
  const router = useRouter()
  
  return (
    <div className="h-screen relative overflow-hidden">
      <TopNavigationBar />
      <div className="relative z-10 h-[calc(100vh-4rem)]">
        <TSPSolver onBack={() => router.push('/sandbox')} />
      </div>
    </div>
  )
}

export default function TSPSolverPage() {
  return (
    <ProtectedRoute>
      <TSPSolverContent />
    </ProtectedRoute>
  )
}