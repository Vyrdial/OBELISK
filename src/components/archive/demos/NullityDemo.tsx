'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export default function NullityDemo() {
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
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-white/70 mb-4">
          Zoom into the void - observe how absence remains absolute
        </p>
        
        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-white/60 font-mono min-w-[80px]">
            {zoomLevel}x
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
        <div className="relative h-64 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-white/20">
          {/* Empty space with subtle indicators */}
          <m.div
            animate={{ scale: zoomLevel }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative w-1 h-1"
          >
            {/* Invisible center - the null core */}
            <div className="absolute inset-0 rounded-full" />
            
            {/* Zoom indicator rings that fade as we zoom */}
            {[1, 2, 4, 8, 16].map((level) => (
              <m.div
                key={level}
                initial={{ opacity: 0.1 }}
                animate={{ 
                  opacity: zoomLevel >= level ? 0 : 0.1 / Math.max(1, zoomLevel / level)
                }}
                className="absolute border border-white/20 rounded-full"
                style={{
                  width: `${level * 20}px`,
                  height: `${level * 20}px`,
                  left: `${-level * 10}px`,
                  top: `${-level * 10}px`
                }}
              />
            ))}
          </m.div>
          
          {/* Void label */}
          <m.div
            animate={{ 
              opacity: zoomLevel > 1 ? 0.5 : 0,
              scale: 1 / Math.sqrt(zoomLevel)
            }}
            className="absolute text-white/40 text-xs"
          >
            void
          </m.div>
        </div>

      </div>
    </div>
  )
}