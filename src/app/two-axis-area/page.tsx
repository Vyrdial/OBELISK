'use client'

import FreeTwoAxisArea from '@/components/sandbox/FreeTwoAxisArea'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function TwoAxisAreaContent() {
  return (
    <div className="h-screen relative overflow-hidden">
      <TopNavigationBar />
      <div className="relative z-10 px-6 pb-4 h-[calc(100vh-4rem)] overflow-hidden pt-2">
        <div className="max-w-7xl mx-auto h-full">
          <FreeTwoAxisArea />
        </div>
      </div>
    </div>
  )
}

export default function TwoAxisAreaPage() {
  return (
    <ProtectedRoute>
      <TwoAxisAreaContent />
    </ProtectedRoute>
  )
}