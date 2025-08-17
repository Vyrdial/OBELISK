'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { Search, Filter, BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { ConceptDefinition, conceptArchive } from '@/lib/conceptArchive'
import dynamic from 'next/dynamic'

// Dynamically import demo components
const demoComponents: Record<string, any> = {
  SingularityDemo: dynamic(() => import('./demos/SingularityDemo'), { ssr: false }),
  NullityDemo: dynamic(() => import('./demos/NullityDemo'), { ssr: false }),
  MultiplicityDemo: dynamic(() => import('./demos/MultiplicityDemo'), { ssr: false }),
  TraversalDemo: dynamic(() => import('./demos/TraversalDemo'), { ssr: false }),
  RepulsionDemo: dynamic(() => import('./demos/RepulsionDemo'), { ssr: false }),
  AttractionDemo: dynamic(() => import('./demos/AttractionDemo'), { ssr: false }),
  CombinationDemo: dynamic(() => import('./demos/CombinationDemo'), { ssr: false }),
  ContradictionDemo: dynamic(() => import('./demos/ContradictionDemo'), { ssr: false }),
  EvolutionDemo: dynamic(() => import('./demos/EvolutionDemo'), { ssr: false }),
  SeparationDemo: dynamic(() => import('./demos/SeparationDemo'), { ssr: false }),
  ReversalDemo: dynamic(() => import('./demos/ReversalDemo'), { ssr: false }),
  EmergenceDemo: dynamic(() => import('./demos/EmergenceDemo'), { ssr: false }),
  ContactDemo: dynamic(() => import('./demos/ContactDemo'), { ssr: false }),
  InversionDemo: dynamic(() => import('./demos/InversionDemo'), { ssr: false }),
  OrbitDemo: dynamic(() => import('./demos/OrbitDemo'), { ssr: false }),
  CommunicateDemo: dynamic(() => import('./demos/CommunicateDemo'), { ssr: false }),
  DiscoveryDemo: dynamic(() => import('./demos/DiscoveryDemo'), { ssr: false }),
  FollowDemo: dynamic(() => import('./demos/FollowDemo'), { ssr: false }),
  TargetDemo: dynamic(() => import('./demos/TargetDemo'), { ssr: false }),
  AttendDemo: dynamic(() => import('./demos/AttendDemo'), { ssr: false }),
  HoldDemo: dynamic(() => import('./demos/HoldDemo'), { ssr: false }),
  ExtendDemo: dynamic(() => import('./demos/ExtendDemo'), { ssr: false }),
  SubmergeDemo: dynamic(() => import('./demos/SubmergeDemo'), { ssr: false }),
  NameDemo: dynamic(() => import('./demos/NameDemo'), { ssr: false }),
  GenerateDemo: dynamic(() => import('./demos/GenerateDemo'), { ssr: false }),
  SequenceDemo: dynamic(() => import('./demos/SequenceDemo'), { ssr: false }),
  StasisDemo: dynamic(() => import('./demos/StasisDemo'), { ssr: false }),
  AxisDemo: dynamic(() => import('./demos/AxisDemo'), { ssr: false }),
  ChangeDemo: dynamic(() => import('./demos/ChangeDemo'), { ssr: false }),
  IdentityDemo: dynamic(() => import('./demos/IdentityDemo'), { ssr: false }),
  ImposeDemo: dynamic(() => import('./demos/ImposeDemo'), { ssr: false })
}

export default function ConceptArchive() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set())

  const filteredConcepts = conceptArchive.filter(concept =>
    concept.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    concept.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleExpanded = (conceptId: string) => {
    const newExpanded = new Set(expandedConcepts)
    if (newExpanded.has(conceptId)) {
      newExpanded.delete(conceptId)
    } else {
      newExpanded.add(conceptId)
    }
    setExpandedConcepts(newExpanded)
  }

  return (
    <div>
      {/* Clean Search Bar */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-cosmic-starlight/40 focus:bg-white/10 transition-all text-sm"
          />
        </div>
      </div>

      {/* Concepts List */}
      <div className="space-y-3">
        {filteredConcepts.map((concept, index) => {
          const isExpanded = expandedConcepts.has(concept.id)
          const DemoComponent = concept.demo ? demoComponents[concept.demo.component] : null

          return (
            <m.div
              key={concept.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="glass-morphism rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
            >
              {/* Concept Header - Always Visible */}
              <div className="flex">
                <button
                  onClick={() => router.push(`/archive/${concept.id}`)}
                  className="flex-1 p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white mb-1 hover:text-cosmic-starlight transition-colors">
                        {concept.term}
                      </h2>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {concept.definition}
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => toggleExpanded(concept.id)}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/60" />
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-4 space-y-4">
                      {/* Interactive Demo */}
                      {DemoComponent && (
                        <div>
                          <h3 className="text-sm font-medium text-cosmic-starlight mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Interactive Demo
                          </h3>
                          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                            <DemoComponent />
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <h3 className="text-sm font-medium text-cosmic-aurora mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Notes
                        </h3>
                        <div className="space-y-2">
                          {concept.notes.map((note, noteIndex) => (
                            <div
                              key={noteIndex}
                              className="flex items-start gap-2"
                            >
                              <div className="w-1 h-1 rounded-full bg-cosmic-starlight/60 mt-2 flex-shrink-0" />
                              <p className="text-white/70 text-sm leading-relaxed">
                                {note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Related Concepts */}
                      {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-xs text-white/50">
                            <span className="font-medium">Related:</span>{' '}
                            {concept.relatedConcepts.map((related, i) => (
                              <span key={related}>
                                <button
                                  onClick={() => {
                                    const element = document.getElementById(related)
                                    element?.scrollIntoView({ behavior: 'smooth' })
                                  }}
                                  className="text-cosmic-starlight/80 hover:text-cosmic-starlight transition-colors"
                                >
                                  {related}
                                </button>
                                {i < concept.relatedConcepts!.length - 1 && ', '}
                              </span>
                            ))}
                          </p>
                        </div>
                      )}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredConcepts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/50 text-sm">
            No concepts found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  )
}