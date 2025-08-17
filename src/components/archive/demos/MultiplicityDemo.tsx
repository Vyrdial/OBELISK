'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, RotateCcw, Minus, Plus } from 'lucide-react'

interface FractalPoint {
  x: number
  y: number
  generation: number
  angle: number
  scale: number
}

export default function MultiplicityDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [maxGenerations, setMaxGenerations] = useState(4)
  const [points, setPoints] = useState<FractalPoint[]>([])
  const [branchingFactor, setBranchingFactor] = useState(3)

  const initializeFractal = () => {
    const initialPoint: FractalPoint = {
      x: 150,
      y: 200,
      generation: 0,
      angle: 0,
      scale: 1
    }
    setPoints([initialPoint])
    setGeneration(0)
  }

  const generateNextGeneration = (currentPoints: FractalPoint[]) => {
    const newPoints: FractalPoint[] = []
    
    currentPoints.forEach(point => {
      // Keep existing point
      newPoints.push(point)
      
      // Generate children for latest generation only
      if (point.generation === generation) {
        for (let i = 0; i < branchingFactor; i++) {
          const angle = (i / branchingFactor) * 2 * Math.PI + point.angle
          const distance = 40 * point.scale
          const newScale = point.scale * 0.7
          
          newPoints.push({
            x: point.x + Math.cos(angle) * distance,
            y: point.y + Math.sin(angle) * distance,
            generation: point.generation + 1,
            angle: angle,
            scale: newScale
          })
        }
      }
    })
    
    return newPoints
  }

  useEffect(() => {
    initializeFractal()
  }, [branchingFactor])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setGeneration(prev => {
        if (prev >= maxGenerations) {
          setIsPlaying(false)
          return prev
        }
        
        setPoints(currentPoints => generateNextGeneration(currentPoints))
        return prev + 1
      })
    }, 800)

    return () => clearInterval(interval)
  }, [isPlaying, generation, maxGenerations])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    initializeFractal()
  }

  const adjustGenerations = (delta: number) => {
    setMaxGenerations(prev => Math.max(2, Math.min(6, prev + delta)))
  }

  const adjustBranching = (delta: number) => {
    setBranchingFactor(prev => Math.max(2, Math.min(5, prev + delta)))
  }

  const getColorForGeneration = (gen: number) => {
    const colors = [
      '#60A5FA', // blue
      '#34D399', // green  
      '#FBBF24', // yellow
      '#F472B6', // pink
      '#A78BFA', // purple
      '#FB7185', // red
      '#38BDF8'  // cyan
    ]
    return colors[gen % colors.length]
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Fractal Manifestation of Unity
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Watch the one become many while remaining one
        </p>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={togglePlayPause}
            disabled={generation >= maxGenerations}
            className="p-2 bg-cosmic-starlight/20 hover:bg-cosmic-starlight/30 border border-cosmic-starlight/40 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-cosmic-starlight" />
            ) : (
              <Play className="w-4 h-4 text-cosmic-starlight" />
            )}
          </button>
          
          <button
            onClick={reset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Parameter Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="space-y-2">
            <label className="block text-white/70">Max Generations</label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustGenerations(-1)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Minus className="w-3 h-3 text-white" />
              </button>
              <span className="text-white font-mono w-4 text-center">{maxGenerations}</span>
              <button
                onClick={() => adjustGenerations(1)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/70">Branches per Node</label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustBranching(-1)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Minus className="w-3 h-3 text-white" />
              </button>
              <span className="text-white font-mono w-4 text-center">{branchingFactor}</span>
              <button
                onClick={() => adjustBranching(1)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20">
          <svg className="absolute inset-0 w-full h-full">
            {/* Connection lines */}
            {points.map((point, i) => 
              points
                .filter(p => p.generation === point.generation + 1)
                .map((child, j) => {
                  const parentDistance = Math.sqrt(
                    (child.x - point.x) ** 2 + (child.y - point.y) ** 2
                  )
                  if (parentDistance < 50 && parentDistance > 5) {
                    return (
                      <line
                        key={`line-${i}-${j}`}
                        x1={point.x}
                        y1={point.y}
                        x2={child.x}
                        y2={child.y}
                        stroke={getColorForGeneration(point.generation)}
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    )
                  }
                  return null
                })
            )}
          </svg>
          
          {/* Points */}
          {points.map((point, index) => (
            <m.div
              key={`point-${index}-${point.generation}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: point.generation * 0.2, duration: 0.3 }}
              className="absolute rounded-full"
              style={{
                left: point.x,
                top: point.y,
                width: `${Math.max(4, 8 * point.scale)}px`,
                height: `${Math.max(4, 8 * point.scale)}px`,
                backgroundColor: getColorForGeneration(point.generation),
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${4 * point.scale}px ${getColorForGeneration(point.generation)}40`
              }}
            />
          ))}
          
          {/* Generation indicator */}
          <div className="absolute bottom-2 left-2 text-white/60 text-xs">
            Generation: {generation} / {maxGenerations}
          </div>
          
          {/* Count indicator */}
          <div className="absolute bottom-2 right-2 text-white/60 text-xs">
            Points: {points.length}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-white/60 text-xs">
            Each point contains the whole pattern
          </p>
          <p className="text-cosmic-starlight text-xs">
            "The one becoming many while remaining one"
          </p>
        </div>
      </div>
    </div>
  )
}
