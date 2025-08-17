'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Search, Book, Sparkles, Clock, Link, X, ChevronRight } from 'lucide-react'
import { useDictionary } from '@/hooks/useDictionary'
import { DictionaryEntry } from '@/types/dictionary'
import dynamic from 'next/dynamic'

// Dynamic imports for interactive demos
const interactiveDemos: Record<string, React.ComponentType> = {
  NullCoreDemo: dynamic(() => import('@/components/dictionary/NullCoreDemo'), {
    ssr: false,
    loading: () => <div className="h-64 bg-black/50 rounded-xl animate-pulse" />
  })
}

export default function PersonalDictionary() {
  const { filteredEntries, searchQuery, setSearchQuery } = useDictionary()
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null)

  return (
    <div className="max-w-6xl mx-auto">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-3xl p-8 border border-white/10"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-8 h-8 text-cosmic-aurora" />
            <h2 className="text-3xl font-bold text-white">Personal Dictionary</h2>
          </div>
          <p className="text-white/60">
            Your collection of discovered concepts and definitions
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your dictionary..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cosmic-aurora/50 transition-colors"
          />
        </div>

        {/* Dictionary Entries */}
        <div className="grid gap-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">
                {searchQuery ? 'No matching entries found' : 'No entries yet. Complete lessons to unlock definitions!'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <m.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-cosmic-aurora/30 transition-all"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">{entry.term}</h3>
                      <Sparkles className="w-4 h-4 text-cosmic-aurora" />
                    </div>
                    <p className="text-white/70 mb-3">{entry.definition}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-white/40">
                        <Clock className="w-3 h-3" />
                        <span>Unlocked {new Date(entry.unlockedAt).toLocaleDateString()}</span>
                      </div>
                      {entry.relatedConcepts && entry.relatedConcepts.length > 0 && (
                        <div className="flex items-center gap-1 text-cosmic-aurora/60">
                          <Link className="w-3 h-3" />
                          <span>{entry.relatedConcepts.length} related concepts</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 ml-4" />
                </div>
              </m.div>
            ))
          )}
        </div>
      </m.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedEntry(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-3xl w-full max-h-[80vh] overflow-y-auto glass-morphism rounded-2xl p-8 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedEntry.term}</h2>
                  <p className="text-cosmic-aurora">{selectedEntry.definition}</p>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Detailed Explanation */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-3">Detailed Explanation</h3>
                <div className="text-white/80 leading-relaxed whitespace-pre-line">
                  {selectedEntry.detailedExplanation}
                </div>
              </div>

              {/* Examples */}
              {selectedEntry.examples && selectedEntry.examples.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-3">Examples</h3>
                  <ul className="space-y-2">
                    {selectedEntry.examples.map((example, index) => (
                      <li key={index} className="flex items-start gap-2 text-white/70">
                        <span className="text-cosmic-aurora mt-1">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Concepts */}
              {selectedEntry.relatedConcepts && selectedEntry.relatedConcepts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-3">Related Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.relatedConcepts.map((concept, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cosmic-aurora/20 border border-cosmic-aurora/30 rounded-full text-sm text-cosmic-aurora"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Demo */}
              {selectedEntry.interactiveDemo && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cosmic-aurora" />
                    Interactive Demo
                  </h3>
                  {(() => {
                    const DemoComponent = interactiveDemos[selectedEntry.interactiveDemo.component]
                    return DemoComponent ? <DemoComponent /> : (
                      <div className="bg-cosmic-void/30 border border-cosmic-aurora/20 rounded-xl p-6 text-center">
                        <p className="text-white/60">Demo component not found</p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}