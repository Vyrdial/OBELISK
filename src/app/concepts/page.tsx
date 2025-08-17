'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ConceptNetwork from '@/components/concept/ConceptNetwork'

const demoConcepts = [
  {
    id: 'rate-of-change',
    term: 'Rate of Change',
    definition: 'How quickly one quantity changes with respect to another. Commonly called "derivative" in mathematics.',
    metaphor: 'Like watching a rocket launch - measuring its speed at every single moment of flight.',
    relatedTerms: ['Slope', 'Velocity', 'Acceleration', 'Integral (Area Swept)'],
    lessons: ['Introduction to Calculus', 'Motion and Physics', 'Optimization Problems'],
    mastery: 85
  },
  {
    id: 'slope',
    term: 'Slope',
    definition: 'The steepness of a line, measuring how much it rises or falls over a given distance.',
    metaphor: 'Like the incline of a mountain path - steep slopes are hard to climb, gentle slopes are easy.',
    relatedTerms: ['Rate of Change', 'Linear Function', 'Rise over Run'],
    lessons: ['Basic Algebra', 'Linear Equations', 'Graphing Functions'],
    mastery: 92
  },
  {
    id: 'velocity',
    term: 'Velocity',
    definition: 'The rate of change of position - how fast something moves in a specific direction.',
    metaphor: 'A spacecraft traveling through the cosmos, with both speed and direction toward its destination.',
    relatedTerms: ['Rate of Change', 'Acceleration', 'Displacement', 'Speed'],
    lessons: ['Physics Motion', 'Kinematics', 'Vector Analysis'],
    mastery: 78
  },
  {
    id: 'acceleration',
    term: 'Acceleration',
    definition: 'The rate of change of velocity - how quickly speed or direction changes.',
    metaphor: 'Feeling pushed back in your seat as a rocket engines fire, changing your velocity.',
    relatedTerms: ['Velocity', 'Rate of Change', 'Force', 'Motion'],
    lessons: ['Advanced Physics', 'Dynamics', 'Newton\'s Laws'],
    mastery: 65
  },
  {
    id: 'integral-area-swept',
    term: 'Integral (Area Swept)',
    definition: 'The accumulation of quantities over time or space. The reverse process of finding rates of change.',
    metaphor: 'Like measuring all the distance a rocket travels by adding up its velocity at each moment.',
    relatedTerms: ['Rate of Change', 'Area Under Curve', 'Accumulation', 'Antiderivative'],
    lessons: ['Integration Basics', 'Fundamental Theorem', 'Applications of Integration'],
    mastery: 45
  },
  {
    id: 'function',
    term: 'Function',
    definition: 'A relationship that assigns each input exactly one output. A cosmic rule that transforms one quantity into another.',
    metaphor: 'Like a star forge that takes hydrogen (input) and creates helium (output) following universal laws.',
    relatedTerms: ['Domain', 'Range', 'Graph', 'Rate of Change'],
    lessons: ['Function Basics', 'Types of Functions', 'Function Operations'],
    mastery: 88
  },
  {
    id: 'limit',
    term: 'Limit',
    definition: 'The value that a function approaches as its input gets infinitely close to some point.',
    metaphor: 'Like approaching a distant star - you can get arbitrarily close but may never quite reach it.',
    relatedTerms: ['Continuity', 'Rate of Change', 'Infinity', 'Convergence'],
    lessons: ['Limits and Continuity', 'Introduction to Calculus', 'Infinite Sequences'],
    mastery: 55
  },
  {
    id: 'exponential-growth',
    term: 'Exponential Growth',
    definition: 'A pattern where quantities multiply by a constant factor over equal time periods.',
    metaphor: 'Like a population of cosmic bacteria doubling every hour - starting small but growing incredibly fast.',
    relatedTerms: ['Compound Interest', 'Population Dynamics', 'Logarithm'],
    lessons: ['Exponential Functions', 'Growth and Decay', 'Mathematical Modeling'],
    mastery: 70
  }
]

export default function ConceptsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleBack = () => {
    router.push('/')
  }

  const handleConceptSelect = (concept: {
    id: string
    term: string
    definition: string
    metaphor?: string
    relatedTerms: string[]
    lessons: string[]
    mastery: number
  }) => {
    console.log('Selected concept:', concept)
    // Could navigate to a detailed concept page
  }

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <div className="absolute inset-0 bg-nebula-gradient opacity-30 pointer-events-none" />
      
      {/* Header */}
      <m.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 p-4 border-b border-white/10 glass-morphism"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <m.button
              onClick={handleBack}
              className="p-2 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-75 cosmic-focus"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </m.button>
            
            <div>
              <h1 className="text-2xl font-bold text-white cosmic-heading">
                Concept Library
              </h1>
              <p className="text-cosmic-starlight text-sm">
                Explore the Knowledge Constellation
              </p>
            </div>
          </div>
        </div>
      </m.header>

      {/* Main Content */}
      <main className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ConceptNetwork
              concepts={demoConcepts}
              onConceptSelect={handleConceptSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </m.div>
        </div>
      </main>
    </div>
  )
}