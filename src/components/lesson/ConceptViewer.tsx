'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, Brain, Sparkles, Lightbulb } from 'lucide-react'

export interface ConceptProperty {
  id: string
  name: string
  description: string
  whyItMatters: string
  demonstration?: React.ReactNode
}

export interface Concept {
  id: string
  name: string
  definition: string
  whyItMatters?: string
  demonstration: React.ReactNode
  properties: ConceptProperty[]
}

interface ConceptViewerProps {
  concept: Concept | null
  isOpen: boolean
  onClose: () => void
  initialPropertyId?: string
}

export default function ConceptViewer({ concept, isOpen, onClose, initialPropertyId }: ConceptViewerProps) {
  const [activeProperty, setActiveProperty] = useState<string | null>(initialPropertyId || null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const whyItMattersRef = useRef<HTMLDivElement>(null)
  const scrollTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (initialPropertyId && isOpen) {
      setActiveProperty(initialPropertyId)
    }
  }, [initialPropertyId, isOpen])

  // Scroll to why it matters when property changes
  useEffect(() => {
    if (activeProperty && whyItMattersRef.current && scrollContainerRef.current) {
      // Clear any existing timer
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current)
      }
      // Set new timer with cleanup
      scrollTimer.current = setTimeout(() => {
        whyItMattersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        scrollTimer.current = null
      }, 300) // Small delay to allow content to render
    }
  }, [activeProperty])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current)
      }
    }
  }, [])

  if (!concept) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Main Container */}
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-cosmic-void/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cosmic-aurora/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-cosmic-aurora" />
                  </div>
                  <div>
                    <p className="text-cosmic-aurora text-sm font-medium mb-1">CONCEPT</p>
                    <h2 className="text-white text-2xl font-bold">{concept.name}</h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div ref={scrollContainerRef} className="overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Definition Section */}
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white text-lg font-semibold mb-4">Definition</h3>
                  <p className="text-white/80 mb-6">{concept.definition}</p>
                  
                  {/* Demonstration */}
                  <div className="bg-black/30 rounded-xl p-6 mb-6">
                    {concept.demonstration}
                  </div>

                  {/* Why It Matters for the main concept */}
                  {concept.whyItMatters && (
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-400/30 rounded-xl p-4 overflow-hidden"
                    >
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-400/10 rounded-full blur-2xl" />
                      
                      <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 text-sm font-semibold mb-2">
                            Why it matters
                          </p>
                          <p className="text-white/80 text-sm leading-relaxed">{concept.whyItMatters}</p>
                        </div>
                      </div>
                    </m.div>
                  )}
                </div>

                {/* Properties Section */}
                {concept.properties.length > 0 && (
                  <div className="p-6">
                    <h3 className="text-white text-lg font-semibold mb-4">Properties</h3>
                    
                    {/* Property Tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                      {concept.properties.map(property => (
                        <button
                          key={property.id}
                          onClick={() => setActiveProperty(property.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeProperty === property.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          {property.name}
                        </button>
                      ))}
                    </div>

                    {/* Active Property Content */}
                    <AnimatePresence mode="wait">
                      {activeProperty && (
                        <m.div
                          key={activeProperty}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {concept.properties.map(property => {
                            if (property.id !== activeProperty) return null
                            
                            return (
                              <div key={property.id} className="space-y-4">
                                {/* Property Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                      <Brain className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                      <h4 className="text-white font-semibold">{property.name}</h4>
                                      <p className="text-white/60 text-sm">{property.description}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Property Demonstration */}
                                {property.demonstration && (
                                  <div className="bg-black/30 rounded-xl p-6">
                                    {property.demonstration}
                                  </div>
                                )}

                                {/* Why It Matters - Always visible */}
                                <m.div
                                  ref={whyItMattersRef}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-400/30 rounded-xl p-4 overflow-hidden"
                                >
                                  {/* Background decoration */}
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl" />
                                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-400/10 rounded-full blur-2xl" />
                                  
                                  <div className="relative flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center">
                                      <Lightbulb className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 text-sm font-semibold mb-2">
                                        Why it matters
                                      </p>
                                      <p className="text-white/80 text-sm leading-relaxed">{property.whyItMatters}</p>
                                    </div>
                                  </div>
                                </m.div>
                              </div>
                            )
                          })}
                        </m.div>
                      )}
                    </AnimatePresence>

                    {/* No Property Selected */}
                    {!activeProperty && (
                      <div className="text-center py-8">
                        <p className="text-white/40">Select a property to explore</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}