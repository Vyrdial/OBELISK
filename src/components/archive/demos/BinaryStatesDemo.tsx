'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'

export default function BinaryStatesDemo() {
  const [leftState, setLeftState] = useState(false)
  const [rightState, setRightState] = useState(true)
  const [showCombination, setShowCombination] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setShowCombination(prev => !prev)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Binary Toggle Demonstration */}
      <div className="flex gap-8">
        <m.div
          onClick={() => setLeftState(!leftState)}
          className="cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <m.div
            className={`w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-300 ${
              leftState 
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-gray-800 text-gray-600 border-2 border-gray-700'
            }`}
            animate={{
              rotate: leftState ? 180 : 0,
              borderRadius: leftState ? '50%' : '16px'
            }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            {leftState ? '1' : '0'}
          </m.div>
          <p className="text-center mt-3 text-sm text-white/60">
            {leftState ? 'TRUE' : 'FALSE'}
          </p>
        </m.div>

        <div className="flex items-center text-2xl text-white/40">
          {showCombination ? '+' : '↔'}
        </div>

        <m.div
          onClick={() => setRightState(!rightState)}
          className="cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <m.div
            className={`w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-300 ${
              rightState 
                ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                : 'bg-gray-800 text-gray-600 border-2 border-gray-700'
            }`}
            animate={{
              rotate: rightState ? 180 : 0,
              borderRadius: rightState ? '50%' : '16px'
            }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            {rightState ? '1' : '0'}
          </m.div>
          <p className="text-center mt-3 text-sm text-white/60">
            {rightState ? 'ON' : 'OFF'}
          </p>
        </m.div>
      </div>

      {/* Combination Result */}
      <AnimatePresence mode="wait">
        {showCombination && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="text-sm text-white/40 mb-2">Combination Result</div>
            <div className="flex gap-4 justify-center">
              <div className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/40">
                <div className="text-xs text-purple-400 mb-1">AND</div>
                <div className="text-lg font-bold text-white">
                  {leftState && rightState ? '1' : '0'}
                </div>
              </div>
              <div className="px-4 py-2 bg-cyan-500/20 rounded-lg border border-cyan-500/40">
                <div className="text-xs text-cyan-400 mb-1">OR</div>
                <div className="text-lg font-bold text-white">
                  {leftState || rightState ? '1' : '0'}
                </div>
              </div>
              <div className="px-4 py-2 bg-pink-500/20 rounded-lg border border-pink-500/40">
                <div className="text-xs text-pink-400 mb-1">XOR</div>
                <div className="text-lg font-bold text-white">
                  {leftState !== rightState ? '1' : '0'}
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Binary Pattern Visualization */}
      <div className="grid grid-cols-8 gap-1 mt-4">
        {[...Array(16)].map((_, i) => {
          const bit1 = (i >> 1) & 1
          const bit2 = i & 1
          const matchesStates = bit1 === (leftState ? 1 : 0) && bit2 === (rightState ? 1 : 0)
          
          return (
            <m.div
              key={i}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-all duration-300 ${
                matchesStates 
                  ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white' 
                  : 'bg-gray-800/50 text-gray-600'
              }`}
              animate={{
                scale: matchesStates ? 1.2 : 1,
                rotate: matchesStates ? 360 : 0
              }}
              transition={{ duration: 0.5 }}
            >
              {bit1}{bit2}
            </m.div>
          )
        })}
      </div>

      <p className="text-xs text-white/40 text-center mt-4">
        Click the states to toggle them and observe how binary combinations create patterns
      </p>
    </div>
  )
}