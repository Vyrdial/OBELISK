'use client'

import { useState, Suspense } from 'react'
import { m } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import EquippedAvatar from '@/components/ui/EquippedAvatar'
import SessionCreator from '@/components/planner/SessionCreator'
import SuspenseFallback from '@/components/loading/SuspenseFallback'
import ErrorBoundary from '@/components/error/ErrorBoundary'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import { LazyCosmicPlanner } from '@/utils/dynamicImports'
import { LearningSession } from '@/lib/timeUtils'

function PlannerContent() {
  const router = useRouter()
  const [sessions, setSessions] = useState<LearningSession[]>([])
  const [showSessionCreator, setShowSessionCreator] = useState(false)
  const [editingSession, setEditingSession] = useState<LearningSession | null>(null)
  const [creatorStartTime, setCreatorStartTime] = useState<Date | undefined>()

  const handleSessionCreate = (sessionData: Partial<LearningSession>) => {
    if (sessionData.startTime && sessionData.endTime && sessionData.type) {
      const newSession: LearningSession = {
        id: sessionData.id || `session-${Date.now()}`,
        title: sessionData.title || `${sessionData.type.name}`,
        description: sessionData.description,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        type: sessionData.type,
        constellationId: sessionData.constellationId,
        lessonId: sessionData.lessonId,
        difficulty: sessionData.difficulty || 'medium',
        estimatedDuration: sessionData.estimatedDuration || 45,
        actualDuration: sessionData.actualDuration,
        completed: sessionData.completed || false,
        recurring: sessionData.recurring,
        reminders: sessionData.reminders || [],
        tags: sessionData.tags || [],
        createdAt: sessionData.createdAt || new Date(),
        updatedAt: new Date()
      }
      
      setSessions(prev => [...prev, newSession])
      setShowSessionCreator(false)
      setCreatorStartTime(undefined)
    } else {
      // Show session creator modal
      if (sessionData.startTime) {
        setCreatorStartTime(sessionData.startTime)
      }
      setShowSessionCreator(true)
    }
  }

  const handleSessionSave = (sessionData: Partial<LearningSession>) => {
    if (editingSession) {
      // Update existing session
      setSessions(prev => prev.map(s => 
        s.id === editingSession.id 
          ? { ...s, ...sessionData, updatedAt: new Date() }
          : s
      ))
      setEditingSession(null)
    } else {
      // Create new session
      handleSessionCreate(sessionData)
    }
  }

  const handleSessionEdit = (session: LearningSession) => {
    setEditingSession(session)
    setShowSessionCreator(true)
  }

  const handleSessionDelete = (sessionId: string) => {
    console.log('Deleting session:', sessionId)
    // TODO: Integrate with database
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  return (
    <div className="min-h-screen relative">

      <TopNavigationBar />

      {/* Main Content */}
      <div className="relative z-20 flex-1 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Back Button */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-8"
          >
            <m.button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </m.button>
            
            <div>
              <p className="text-white/60 text-sm">
                Back to Dashboard
              </p>
            </div>
          </m.div>

          {/* Planner */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ErrorBoundary>
              <Suspense fallback={<SuspenseFallback message="Loading planner..." />}>
                <LazyCosmicPlanner
                  sessions={sessions}
                  onSessionCreate={handleSessionCreate}
                  onSessionEdit={handleSessionEdit}
                  onSessionDelete={handleSessionDelete}
                  className="glass-morphism border border-white/10"
                />
              </Suspense>
            </ErrorBoundary>
          </m.div>

        </div>
      </div>

      {/* Session Creator Modal */}
      {showSessionCreator && (
        <SessionCreator
          onClose={() => {
            setShowSessionCreator(false)
            setEditingSession(null)
            setCreatorStartTime(undefined)
          }}
          onSave={handleSessionSave}
          initialStartTime={creatorStartTime}
          editingSession={editingSession}
        />
      )}
    </div>
  )
}

export default function PlannerPage() {
  return (
    <ProtectedRoute>
      <PlannerContent />
    </ProtectedRoute>
  )
}