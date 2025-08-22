'use client'

import { useParams, useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react'
import { conceptArchive } from '@/lib/conceptArchive'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import dynamic from 'next/dynamic'

// Dynamically import demo components
const demoComponents: Record<string, any> = {
  BinaryStatesDemo: dynamic(() => import('@/components/archive/demos/BinaryStatesDemo'), { ssr: false }),
  LogicGatesDemo: dynamic(() => import('@/components/archive/demos/LogicGatesDemo'), { ssr: false }),
  StateTablesDemo: dynamic(() => import('@/components/archive/demos/StateTablesDemo'), { ssr: false }),
  SingularityDemo: dynamic(() => import('@/components/archive/demos/SingularityDemo'), { ssr: false }),
  NullityDemo: dynamic(() => import('@/components/archive/demos/NullityDemo'), { ssr: false }),
  MultiplicityDemo: dynamic(() => import('@/components/archive/demos/MultiplicityDemo'), { ssr: false }),
  TraversalDemo: dynamic(() => import('@/components/archive/demos/TraversalDemo'), { ssr: false }),
  RepulsionDemo: dynamic(() => import('@/components/archive/demos/RepulsionDemo'), { ssr: false }),
  AttractionDemo: dynamic(() => import('@/components/archive/demos/AttractionDemo'), { ssr: false }),
  CombinationDemo: dynamic(() => import('@/components/archive/demos/CombinationDemo'), { ssr: false }),
  ContradictionDemo: dynamic(() => import('@/components/archive/demos/ContradictionDemo'), { ssr: false }),
  EvolutionDemo: dynamic(() => import('@/components/archive/demos/EvolutionDemo'), { ssr: false }),
  SeparationDemo: dynamic(() => import('@/components/archive/demos/SeparationDemo'), { ssr: false }),
  ReversalDemo: dynamic(() => import('@/components/archive/demos/ReversalDemo'), { ssr: false }),
  EmergenceDemo: dynamic(() => import('@/components/archive/demos/EmergenceDemo'), { ssr: false }),
  ContactDemo: dynamic(() => import('@/components/archive/demos/ContactDemo'), { ssr: false }),
  InversionDemo: dynamic(() => import('@/components/archive/demos/InversionDemo'), { ssr: false }),
  OrbitDemo: dynamic(() => import('@/components/archive/demos/OrbitDemo'), { ssr: false }),
  CommunicateDemo: dynamic(() => import('@/components/archive/demos/CommunicateDemo'), { ssr: false }),
  DiscoveryDemo: dynamic(() => import('@/components/archive/demos/DiscoveryDemo'), { ssr: false }),
  FollowDemo: dynamic(() => import('@/components/archive/demos/FollowDemo'), { ssr: false }),
  TargetDemo: dynamic(() => import('@/components/archive/demos/TargetDemo'), { ssr: false }),
  AttendDemo: dynamic(() => import('@/components/archive/demos/AttendDemo'), { ssr: false }),
  HoldDemo: dynamic(() => import('@/components/archive/demos/HoldDemo'), { ssr: false }),
  ExtendDemo: dynamic(() => import('@/components/archive/demos/ExtendDemo'), { ssr: false }),
  SubmergeDemo: dynamic(() => import('@/components/archive/demos/SubmergeDemo'), { ssr: false }),
  NameDemo: dynamic(() => import('@/components/archive/demos/NameDemo'), { ssr: false }),
  GenerateDemo: dynamic(() => import('@/components/archive/demos/GenerateDemo'), { ssr: false }),
  SequenceDemo: dynamic(() => import('@/components/archive/demos/SequenceDemo'), { ssr: false }),
  StasisDemo: dynamic(() => import('@/components/archive/demos/StasisDemo'), { ssr: false }),
  AxisDemo: dynamic(() => import('@/components/archive/demos/AxisDemo'), { ssr: false }),
  ChangeDemo: dynamic(() => import('@/components/archive/demos/ChangeDemo'), { ssr: false }),
  IdentityDemo: dynamic(() => import('@/components/archive/demos/IdentityDemo'), { ssr: false }),
  ImposeDemo: dynamic(() => import('@/components/archive/demos/ImposeDemo'), { ssr: false })
}

function ConceptPageContent() {
  const params = useParams()
  const router = useRouter()
  const conceptId = params.concept as string

  const concept = conceptArchive.find(c => c.id === conceptId)

  if (!concept) {
    return (
      <div className="min-h-screen bg-cosmic-gradient relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Concept Not Found</h1>
          <button
            onClick={() => router.push('/learn')}
            className="px-4 py-2 bg-cosmic-starlight/20 hover:bg-cosmic-starlight/30 border border-cosmic-starlight/40 rounded-lg text-cosmic-starlight transition-colors"
          >
            Return to Archive
          </button>
        </div>
      </div>
    )
  }

  const DemoComponent = concept.demo ? demoComponents[concept.demo.component] : null

  return (
    <div className="min-h-screen bg-cosmic-gradient relative">
      <ClientOnly fallback={<div className="fixed inset-0 bg-nebula-gradient opacity-30" />}>
        <CosmicBackground intensity="low" enableMeteors={true} enableNebula={true} />
      </ClientOnly>

      <TopNavigationBar />

      {/* Main Content */}
      <main className="relative z-20 p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Back Button */}
          <m.button
            onClick={() => router.push('/learn')}
            className="flex items-center gap-2 mb-6 p-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Archive</span>
          </m.button>

          {/* Concept Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-6xl font-bold text-white cosmic-heading mb-4">
              {concept.term}
            </h1>
            <p className="text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              {concept.definition}
            </p>
          </m.div>

          {/* Interactive Demo */}
          {DemoComponent && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold text-cosmic-starlight mb-6 flex items-center gap-3 justify-center">
                <Sparkles className="w-6 h-6" />
                Interactive Demonstration
              </h2>
              <div className="glass-morphism rounded-2xl p-8 border border-white/20">
                <DemoComponent />
              </div>
            </m.div>
          )}

          {/* Notes & Contemplations */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-cosmic-aurora mb-6 flex items-center gap-3 justify-center">
              <BookOpen className="w-6 h-6" />
              Notes & Contemplations
            </h2>
            <div className="glass-morphism rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                {concept.notes.map((note, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-3 h-3 rounded-full bg-cosmic-starlight/60 mt-2 flex-shrink-0" />
                    <p className="text-white/80 text-lg leading-relaxed">
                      {note}
                    </p>
                  </m.div>
                ))}
              </div>
            </div>
          </m.div>

          {/* Related Concepts */}
          {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold text-white mb-4 text-center">
                Related Concepts
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {concept.relatedConcepts.map((relatedId) => {
                  const relatedConcept = conceptArchive.find(c => c.id === relatedId)
                  if (!relatedConcept) return null
                  
                  return (
                    <m.button
                      key={relatedId}
                      onClick={() => router.push(`/archive/${relatedId}`)}
                      className="px-4 py-2 bg-white/10 hover:bg-cosmic-starlight/20 border border-white/20 hover:border-cosmic-starlight/40 rounded-lg text-white hover:text-cosmic-starlight transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {relatedConcept.term}
                    </m.button>
                  )
                })}
              </div>
            </m.div>
          )}

        </div>
      </main>
    </div>
  )
}

export default function ConceptPage() {
  return (
    <ProtectedRoute>
      <ConceptPageContent />
    </ProtectedRoute>
  )
}