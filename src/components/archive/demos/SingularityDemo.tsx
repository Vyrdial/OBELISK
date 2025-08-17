'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

export default function SingularityDemo() {
  const [convergence, setConvergence] = useState(0)
  const [showUnity, setShowUnity] = useState(false)

  const handleConverge = () => {
    if (convergence < 100) {
      setConvergence(prev => prev + 10)
      if (convergence >= 90) {
        setShowUnity(true)
      }
    }
  }

  const handleReset = () => {
    setConvergence(0)
    setShowUnity(false)
  }

  const points = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i / 8) * 2 * Math.PI,
    distance: 80 * (1 - convergence / 100)
  }))

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-white/70 mb-4">
          Click to witness all distinctions converge into unity
        </p>
        
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden flex items-center justify-center">
          {/* Central point */}
          <m.div
            animate={{ 
              scale: showUnity ? 2 : 1,
              opacity: 1
            }}
            className="absolute w-4 h-4 bg-cosmic-starlight rounded-full z-10"
          />
          
          {/* Converging points */}
          {points.map((point) => (
            <m.div
              key={point.id}
              animate={{
                x: Math.cos(point.angle) * point.distance,
                y: Math.sin(point.angle) * point.distance,
                scale: convergence > 90 ? 0 : 1
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: `hsl(${point.id * 45}, 70%, 60%)`
              }}
            />
          ))}
          
          {/* Unity flash */}
          {showUnity && (
            <m.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 20, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute w-4 h-4 bg-white rounded-full"
            />
          )}
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleConverge}
            disabled={convergence >= 100}
            className="px-6 py-2 bg-cosmic-starlight/20 hover:bg-cosmic-starlight/30 border border-cosmic-starlight/40 rounded-lg text-cosmic-starlight transition-colors disabled:opacity-50"
          >
            Converge
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-white/60">
            Convergence: {convergence}%
          </div>
          {showUnity && (
            <div className="text-cosmic-starlight text-sm mt-2">
              All becomes One
            </div>
          )}
        </div>
      </div>
    </div>
  )
}