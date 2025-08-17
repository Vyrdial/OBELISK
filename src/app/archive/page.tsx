'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Sparkles, 
  Lock, 
  Unlock,
  ChevronRight,
  Filter,
  Grid,
  List,
  Binary,
  Brain,
  Cpu,
  Database,
  GitBranch,
  Infinity
} from 'lucide-react'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { allConcepts, ConceptData } from '@/lib/conceptsData'
import { useUnlockedConcepts } from '@/hooks/useUnlockedConcepts'

// Icon mapping for categories
const categoryIcons = {
  binary: Binary,
  logic: Cpu,
  systems: Brain,
  algorithms: GitBranch,
  data: Database,
  philosophy: Infinity
}

// Category colors
const categoryColors = {
  binary: 'purple',
  logic: 'blue',
  systems: 'cyan',
  algorithms: 'green',
  data: 'orange',
  philosophy: 'pink'
}

function ArchiveContent() {
  const router = useRouter()
  const { unlockedConcepts: unlockedConceptIds, loading } = useUnlockedConcepts()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null)
  
  // Filter allConcepts to only show unlocked ones
  const unlockedConcepts = allConcepts.filter(concept => 
    unlockedConceptIds.includes(concept.id)
  )
  
  // Filter concepts
  const filteredConcepts = unlockedConcepts.filter(concept => {
    const matchesSearch = searchTerm === '' || 
      concept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || concept.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  // Calculate progress
  const totalConcepts = allConcepts.length
  const unlockedCount = unlockedConcepts.length
  const progressPercentage = Math.round((unlockedCount / totalConcepts) * 100)
  
  // Get categories with counts
  const categories = [
    { id: 'binary', name: 'Binary', count: unlockedConcepts.filter(c => c.category === 'binary').length },
    { id: 'logic', name: 'Logic', count: unlockedConcepts.filter(c => c.category === 'logic').length },
    { id: 'systems', name: 'Systems', count: unlockedConcepts.filter(c => c.category === 'systems').length },
    { id: 'algorithms', name: 'Algorithms', count: unlockedConcepts.filter(c => c.category === 'algorithms').length },
    { id: 'data', name: 'Data', count: unlockedConcepts.filter(c => c.category === 'data').length },
    { id: 'philosophy', name: 'Philosophy', count: unlockedConcepts.filter(c => c.category === 'philosophy').length }
  ]
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Cosmic Background - same as home page */}
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <CosmicBackground 
          intensity="low" 
          enableMeteors={false}
          enableNebula={false}
          enablePlanets={false}
        />
      </ClientOnly>
      
      {/* Subtle dark gradient overlay with purple tint for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-indigo-950/30 pointer-events-none z-10" />
      
      <TopNavigationBar />
      
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/80">
              {loading ? 'Loading...' : `${unlockedCount}/${totalConcepts} Concepts Discovered`}
            </span>
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <m.div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ width: 0 }}
                animate={{ width: loading ? 0 : `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </m.div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
            <span className="inline-block">
              <m.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                The
              </m.span>
            </span>{' '}
            <span className="inline-block">
              <m.span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Archive
              </m.span>
            </span>
          </h1>
          
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-white/60 max-w-2xl mx-auto"
          >
            Your personal collection of discovered cosmic concepts
          </m.p>
        </m.div>
        
        {/* Search and Filters */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, description, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full border transition-all ${
                !selectedCategory 
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              All ({unlockedCount})
            </button>
            {categories.map(cat => {
              const Icon = categoryIcons[cat.id as keyof typeof categoryIcons]
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? `bg-${categoryColors[cat.id as keyof typeof categoryColors]}-500/20 border-${categoryColors[cat.id as keyof typeof categoryColors]}-400 text-${categoryColors[cat.id as keyof typeof categoryColors]}-300`
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name} ({cat.count})
                </button>
              )
            })}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white/10 text-white' 
                  : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-white/10 text-white' 
                  : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </m.div>
        
        {/* Concepts Display */}
        {filteredConcepts.length > 0 ? (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          >
            {filteredConcepts.map((concept, index) => {
              const Icon = categoryIcons[concept.category]
              const color = categoryColors[concept.category]
              
              return (
                <m.div
                  key={concept.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredConcept(concept.id)}
                  onMouseLeave={() => setHoveredConcept(null)}
                  onClick={() => router.push(`/archive/${concept.id}`)}
                  className={`relative group cursor-pointer ${
                    viewMode === 'grid' ? '' : 'w-full'
                  }`}
                >
                  <div className={`relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-${color}-400/50 overflow-hidden transition-all duration-300 ${
                    viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4'
                  }`}>
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-${color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Content */}
                    <div className={`relative ${viewMode === 'grid' ? '' : 'flex items-center gap-4 flex-1'}`}>
                      {/* Icon & Address */}
                      <div className={`${viewMode === 'grid' ? 'mb-4' : ''}`}>
                        <div className={`w-16 h-16 rounded-xl bg-${color}-500/20 border border-${color}-400/40 flex items-center justify-center mb-2`}>
                          <Icon className={`w-8 h-8 text-${color}-400`} />
                        </div>
                        <code className={`text-xs text-${color}-400/60 font-mono`}>
                          {concept.address}
                        </code>
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold text-white mb-2 group-hover:text-${color}-300 transition-colors`}>
                          {concept.name}
                        </h3>
                        <p className="text-white/60 text-sm line-clamp-2">
                          {concept.description}
                        </p>
                        
                        {/* Related Concepts */}
                        {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {concept.relatedConcepts.slice(0, 3).map(relatedId => {
                              const related = allConcepts.find(c => c.id === relatedId)
                              if (!related) return null
                              return (
                                <span
                                  key={relatedId}
                                  className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40"
                                >
                                  {related.name}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <m.div
                        animate={{
                          x: hoveredConcept === concept.id ? 5 : 0
                        }}
                        className="text-white/40 group-hover:text-white/60"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </m.div>
                    </div>
                  </div>
                </m.div>
              )
            })}
          </m.div>
        ) : (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-20"
          >
            <Lock className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">
              {searchTerm || selectedCategory 
                ? 'No concepts found matching your criteria'
                : 'Complete lessons to unlock concepts in your Archive'
              }
            </p>
          </m.div>
        )}
        
        {/* Locked Concepts Preview */}
        {unlockedCount < totalConcepts && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white/40 text-center mb-6">
              Undiscovered Concepts ({totalConcepts - unlockedCount})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allConcepts
                .filter(c => !unlockedConcepts.find(uc => uc.id === c.id))
                .slice(0, 12)
                .map((concept) => (
                  <div
                    key={concept.id}
                    className="relative bg-black/20 backdrop-blur-xl rounded-xl border border-white/5 p-4 opacity-50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-2">
                      <Lock className="w-6 h-6 text-white/20" />
                    </div>
                    <code className="text-xs text-white/20 font-mono">
                      {concept.address}
                    </code>
                    <h4 className="text-sm font-semibold text-white/30 mt-1">
                      ???
                    </h4>
                  </div>
                ))}
            </div>
          </m.div>
        )}
      </div>
    </div>
  )
}

export default function ArchivePage() {
  return (
    <ProtectedRoute>
      <ArchiveContent />
    </ProtectedRoute>
  )
}