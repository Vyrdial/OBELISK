'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export default function NullCoreDemo() {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleZoomIn = () => {
    if (zoomLevel < 1000) {
      setZoomLevel(prev => prev * 2)
      if (zoomLevel >= 8) {
        setShowExplanation(true)
      }
    }
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(1, prev / 2))
  }

  const handleReset = () => {
    setZoomLevel(1)
    setShowExplanation(false)
  }

  return (
    <div className="bg-black/50 rounded-xl p-6">
      <h4 className="text-lg font-semibold text-white mb-4">Interactive Demonstration</h4>
      
      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          disabled={zoomLevel <= 1}
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        
        <div className="text-white/60 font-mono">
          Zoom: {zoomLevel}x
        </div>
        
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={handleReset}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ml-4"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Visualization */}
      <div className="relative h-64 bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <m.div
          animate={{ scale: zoomLevel }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative"
        >
          {/* The dot marker */}
          <div className="w-8 h-8 bg-white rounded-full" />
          
          {/* Label when zoomed */}
          {zoomLevel >= 4 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/60 text-xs whitespace-nowrap"
            >
              Still just a marker...
            </m.div>
          )}
        </m.div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-cosmic-aurora/10 border border-cosmic-aurora/30 rounded-lg"
        >
          <p className="text-white/80 text-sm">
            Notice how no matter how much you zoom, the dot doesn't reveal any internal structure? 
            That's because you're zooming on the <span className="text-cosmic-aurora font-semibold">marker</span>, 
            not the null core itself. The actual null core at the center has no size to zoom into!
          </p>
        </m.div>
      )}

      <p className="text-white/40 text-xs mt-4 text-center">
        Try zooming in to see why we can never reach the center
      </p>
    </div>
  )
}