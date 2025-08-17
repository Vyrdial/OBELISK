'use client'

import LogicGateWorkspace from '@/components/sandbox/LogicGateWorkspace'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CosmicBackground from '@/components/effects/CosmicBackground'

function LogicPlaygroundContent() {
  return (
    <div className="h-screen relative overflow-hidden bg-cosmic-void">
      <CosmicBackground intensity="medium" enableMeteors={true} enableNebula={true} enablePlanets={false} />
      <TopNavigationBar />
      <div className="relative z-10 h-[calc(100vh-4rem)]">
        <LogicGateWorkspace />
      </div>
    </div>
  )
}

export default function LogicPlaygroundPage() {
  return (
    <ProtectedRoute>
      <LogicPlaygroundContent />
    </ProtectedRoute>
  )
}