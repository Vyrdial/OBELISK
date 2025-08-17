'use client'

import { m } from 'framer-motion'
import { ExternalLink, BookOpen, Network } from 'lucide-react'
import { useState } from 'react'

interface ConceptLinkProps {
  term: string
  definition?: string
  metaphor?: string
  relatedTerms?: string[]
  inlineMode?: boolean
  onClick?: () => void
}

export default function ConceptLink({ 
  term, 
  definition, 
  metaphor, 
  relatedTerms = [], 
  inlineMode = true,
  onClick 
}: ConceptLinkProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (inlineMode) {
    return (
      <span className="relative inline-block">
        <m.button
          className="text-cosmic-quasar hover:text-cosmic-starlight underline decoration-dotted underline-offset-2 transition-colors duration-75 cosmic-focus"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
        >
          {term}
          <ExternalLink className="inline w-3 h-3 ml-1 opacity-60" />
        </m.button>

        {/* Tooltip */}
        {showTooltip && definition && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-80 max-w-[90vw]"
          >
            <div className="glass-morphism rounded-xl p-4 border border-cosmic-quasar/30 shadow-cosmic">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-cosmic-quasar" />
                <h4 className="font-semibold text-white text-sm">
                  {term}
                </h4>
              </div>
              
              <p className="text-white/80 text-sm leading-relaxed mb-2">
                {definition}
              </p>
              
              {metaphor && (
                <p className="text-cosmic-aurora text-xs italic">
                  💫 {metaphor}
                </p>
              )}

              {relatedTerms.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-white/60 text-xs mb-1">Related concepts:</p>
                  <div className="flex flex-wrap gap-1">
                    {relatedTerms.slice(0, 3).map((related, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-white/70"
                      >
                        {related}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-cosmic-quasar/30" />
              </div>
            </div>
          </m.div>
        )}
      </span>
    )
  }

  // Card mode for concept pages
  return (
    <m.div
      className="glass-morphism rounded-2xl p-6 border border-white/20 hover:border-cosmic-quasar/40 transition-all duration-75 cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-cosmic-quasar/20 border border-cosmic-quasar/30">
          <BookOpen className="w-6 h-6 text-cosmic-quasar" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white cosmic-heading mb-2">
            {term}
          </h3>
          
          {definition && (
            <p className="text-white/80 leading-relaxed mb-3">
              {definition}
            </p>
          )}
          
          {metaphor && (
            <div className="mb-4 p-3 bg-cosmic-aurora/10 border border-cosmic-aurora/20 rounded-lg">
              <p className="text-cosmic-aurora text-sm italic">
                💫 {metaphor}
              </p>
            </div>
          )}
          
          {relatedTerms.length > 0 && (
            <div>
              <p className="text-white/60 text-sm mb-2">Related concepts:</p>
              <div className="flex flex-wrap gap-2">
                {relatedTerms.map((related, index) => (
                  <m.span
                    key={index}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-white/70 hover:border-cosmic-quasar/40 transition-colors duration-75"
                    whileHover={{ scale: 1.05 }}
                  >
                    {related}
                  </m.span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <ExternalLink className="w-5 h-5 text-white/40" />
      </div>
    </m.div>
  )
}