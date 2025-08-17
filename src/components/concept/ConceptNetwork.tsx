'use client'

import { m } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Search, Sparkles } from 'lucide-react'
import ConceptLink from './ConceptLink'

interface ConceptNode {
  id: string
  term: string
  definition: string
  metaphor?: string
  relatedTerms: string[]
  x?: number
  y?: number
  lessons: string[]
  mastery: number // 0-100
}

interface ConceptNetworkProps {
  concepts: ConceptNode[]
  onConceptSelect?: (concept: ConceptNode) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function ConceptNetwork({ 
  concepts, 
  onConceptSelect, 
  searchQuery = '', 
  onSearchChange 
}: ConceptNetworkProps) {
  const [filteredConcepts, setFilteredConcepts] = useState(concepts)
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'network'>('grid')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const filtered = concepts.filter(concept =>
      concept.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.relatedTerms.some(term => 
        term.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    setFilteredConcepts(filtered)
  }, [concepts, searchQuery])

  const handleConceptClick = (concept: ConceptNode) => {
    setSelectedConcept(concept)
    onConceptSelect?.(concept)
  }

  const renderNetworkView = () => {
    // Position concepts in a circular/constellation pattern
    const centerX = 400
    const centerY = 300
    const radius = 200

    const positionedConcepts = filteredConcepts.map((concept, index) => {
      const angle = (index / filteredConcepts.length) * 2 * Math.PI
      return {
        ...concept,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
      }
    })

    return (
      <div className="relative w-full h-[600px] overflow-hidden rounded-2xl glass-morphism border border-white/20">
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 600"
        >
          {/* Constellation lines */}
          {positionedConcepts.map((concept, index) => 
            concept.relatedTerms.map(relatedTerm => {
              const relatedConcept = positionedConcepts.find(c => c.term === relatedTerm)
              if (!relatedConcept) return null
              
              return (
                <m.line
                  key={`${concept.id}-${relatedConcept.id}`}
                  x1={concept.x}
                  y1={concept.y}
                  x2={relatedConcept.x}
                  y2={relatedConcept.y}
                  className="constellation-line"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ delay: index * 0.1, duration: 1 }}
                />
              )
            })
          )}
          
          {/* Concept nodes */}
          {positionedConcepts.map((concept, index) => (
            <m.g
              key={concept.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <m.circle
                cx={concept.x}
                cy={concept.y}
                r={20 + concept.mastery * 0.2}
                className={`cursor-pointer ${
                  selectedConcept?.id === concept.id
                    ? 'fill-cosmic-starlight'
                    : 'fill-cosmic-quasar'
                }`}
                whileHover={{ scale: 1.2 }}
                onClick={() => handleConceptClick(concept)}
              />
              
              <text
                x={concept.x}
                y={concept.y + 35}
                textAnchor="middle"
                className="fill-white text-sm font-medium cursor-pointer"
                onClick={() => handleConceptClick(concept)}
              >
                {concept.term}
              </text>
              
              {/* Mastery indicator */}
              <circle
                cx={concept.x + 15}
                cy={concept.y - 15}
                r={5}
                className={`${
                  concept.mastery > 80 ? 'fill-cosmic-aurora' :
                  concept.mastery > 50 ? 'fill-cosmic-stardust' :
                  'fill-white opacity-30'
                }`}
              />
            </m.g>
          ))}
        </svg>
        
        {/* Floating stardust particles */}
        {[...Array(20)].map((_, i) => (
          <m.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-stardust rounded-full pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    )
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredConcepts.map((concept) => (
        <ConceptLink
          key={concept.id}
          term={concept.term}
          definition={concept.definition}
          metaphor={concept.metaphor}
          relatedTerms={concept.relatedTerms}
          inlineMode={false}
          onClick={() => handleConceptClick(concept)}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white cosmic-heading">
            Knowledge Constellation
          </h2>
          <div className="flex items-center gap-1">
            <Sparkles className="w-5 h-5 text-cosmic-stardust" />
            <span className="text-cosmic-stardust text-sm font-medium">
              {filteredConcepts.length} concepts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 glass-morphism rounded-full border border-white/20 focus:border-cosmic-quasar/50 bg-transparent text-white placeholder-white/40 cosmic-focus"
              />
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 glass-morphism rounded-full border border-white/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-75 cosmic-focus ${
                viewMode === 'grid'
                  ? 'bg-cosmic-quasar text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('network')}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-75 cosmic-focus ${
                viewMode === 'network'
                  ? 'bg-cosmic-quasar text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Network
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <m.div
        key={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {viewMode === 'network' ? renderNetworkView() : renderGridView()}
      </m.div>

      {/* Selected Concept Details */}
      {selectedConcept && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-2xl p-6 border border-cosmic-starlight/30"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-cosmic-starlight cosmic-heading">
              {selectedConcept.term}
            </h3>
            <button
              onClick={() => setSelectedConcept(null)}
              className="text-white/40 hover:text-white transition-colors duration-75"
            >
              ✕
            </button>
          </div>
          
          <p className="text-white/80 leading-relaxed mb-4">
            {selectedConcept.definition}
          </p>
          
          {selectedConcept.metaphor && (
            <div className="mb-4 p-4 bg-cosmic-aurora/10 border border-cosmic-aurora/20 rounded-lg">
              <p className="text-cosmic-aurora italic">
                💫 {selectedConcept.metaphor}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Related Concepts</h4>
              <div className="flex flex-wrap gap-2">
                {selectedConcept.relatedTerms.map((term, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-white/70"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-2">Appears in Lessons</h4>
              <div className="space-y-1">
                {selectedConcept.lessons.map((lesson, index) => (
                  <div key={index} className="text-cosmic-quasar text-sm">
                    {lesson}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </m.div>
      )}
    </div>
  )
}