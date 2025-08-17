'use client'

import ThreeDWorkspace from '@/components/sandbox/ThreeDWorkspace'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function ThreeDWorkspaceContent() {
  return (
    <div className="h-screen relative overflow-hidden">
      <TopNavigationBar />
      <div className="relative z-10 px-6 pb-4 h-[calc(100vh-4rem)] overflow-hidden pt-2">
        <div className="max-w-7xl mx-auto h-full">
          <ThreeDWorkspace />
        </div>
      </div>
    </div>
  )
}

export default function ThreeDWorkspacePage() {
  return (
    <ProtectedRoute>
      <ThreeDWorkspaceContent />
    </ProtectedRoute>
  )
}