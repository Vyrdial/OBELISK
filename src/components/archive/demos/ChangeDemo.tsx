'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'

export default function ChangeDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentState, setCurrentState] = useState(0)
  const [changeRate, setChangeRate] = useState(1000)

  const states = [
    { name: 'Seed', color: '#8B4513', shape: 'circle', size: 12 },
    { name: 'Sprout', color: '#90EE90', shape: 'circle', size: 16 },
    { name: 'Stem', color: '#32CD32', shape: 'rect', size: 20 },
    { name: 'Leaves', color: '#228B22', shape: 'star', size: 24 },
    { name: 'Bud', color: '#FF69B4', shape: 'circle', size: 20 },
    { name: 'Flower', color: '#FFB6C1', shape: 'flower', size: 32 },
    { name: 'Fruit', color: '#FF6347', shape: 'circle', size: 28 },
    { name: 'Seeds', color: '#8B4513', shape: 'circle', size: 12 }
  ]

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentState(prev => (prev + 1) % states.length)
    }, changeRate)

    return () => clearInterval(interval)
  }, [isPlaying, changeRate, states.length])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    setCurrentState(0)
  }

  const renderShape = (state: typeof states[0]) => {
    const baseProps = {
      className: "flex items-center justify-center transition-all duration-500",
      style: { 
        backgroundColor: state.color,
        width: state.size,
        height: state.size
      }
    }

    switch (state.shape) {
      case 'circle':
        return <div {...baseProps} className={`${baseProps.className} rounded-full`} />
      case 'rect':
        return <div {...baseProps} className={`${baseProps.className} rounded-sm`} />
      case 'star':
        return (
          <div className="relative flex items-center justify-center" style={{ width: state.size, height: state.size }}>
            <div className="absolute w-full h-1 bg-current rotate-0" style={{ backgroundColor: state.color }} />
            <div className="absolute w-full h-1 bg-current rotate-45" style={{ backgroundColor: state.color }} />
            <div className="absolute w-full h-1 bg-current rotate-90" style={{ backgroundColor: state.color }} />
            <div className="absolute w-full h-1 bg-current -rotate-45" style={{ backgroundColor: state.color }} />
          </div>
        )
      case 'flower':
        return (
          <div className="relative flex items-center justify-center" style={{ width: state.size, height: state.size }}>
            {[0, 72, 144, 216, 288].map(angle => (
              <div
                key={angle}
                className="absolute w-3 h-6 rounded-full"
                style={{
                  backgroundColor: state.color,
                  transform: `rotate(${angle}deg) translateY(-8px)`
                }}
              />
            ))}
            <div className="absolute w-4 h-4 rounded-full bg-yellow-400" />
          </div>
        )
      default:
        return <div {...baseProps} className={`${baseProps.className} rounded-full`} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-white/70 mb-4">
          Witness the eternal dance of transformation
        </p>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={togglePlayPause}
            className="p-2 bg-cosmic-starlight/20 hover:bg-cosmic-starlight/30 border border-cosmic-starlight/40 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-cosmic-starlight" />
            ) : (
              <Play className="w-5 h-5 text-cosmic-starlight" />
            )}
          </button>
          
          <button
            onClick={reset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Change Rate Slider */}
        <div className="mb-6">
          <label className="block text-white/70 text-sm mb-2">
            Change Rate: {(2000 - changeRate) / 10}% speed
          </label>
          <input
            type="range"
            min="200"
            max="2000"
            value={changeRate}
            onChange={(e) => setChangeRate(Number(e.target.value))}
            className="w-48 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Visualization */}
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20 flex items-center justify-center">
          <m.div
            key={currentState}
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-4"
          >
            {renderShape(states[currentState])}
            <div className="text-white/80 font-medium">
              {states[currentState].name}
            </div>
          </m.div>

          {/* Cycle indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {states.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentState ? 'bg-cosmic-starlight' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Stage {currentState + 1} of {states.length}: {states[currentState].name}
          </p>
          <p className="text-white/40 text-xs mt-2">
            The only constant is change itself
          </p>
        </div>
      </div>
    </div>
  )
}