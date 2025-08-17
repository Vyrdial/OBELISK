'use client'

import MathematicalSpace3D from '@/components/sandbox/MathematicalSpace3D'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function MathSpaceContent() {
  return (
    <div className="h-screen relative overflow-hidden">
      <TopNavigationBar />
      <div className="relative z-10 px-6 pb-4 h-[calc(100vh-4rem)] overflow-hidden pt-2">
        <div className="max-w-7xl mx-auto h-full">
          <MathematicalSpace3D />
        </div>
      </div>
    </div>
  )
}

export default function MathSpacePage() {
  return (
    <ProtectedRoute>
      <MathSpaceContent />
    </ProtectedRoute>
  )
}