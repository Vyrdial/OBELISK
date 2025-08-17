'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
// Fixed: Changed from motion to m for LazyMotion compatibility

type TrafficLightState = 'red' | 'yellow' | 'green'

interface TrafficLightProps {
  currentState?: TrafficLightState
  autoMode?: boolean
  onStateChange?: (state: TrafficLightState) => void
  className?: string
}

const stateSequence: TrafficLightState[] = ['red', 'yellow', 'green']

export default function TrafficLight({ 
  currentState, 
  autoMode = false, 
  onStateChange,
  className = ''
}: TrafficLightProps) {
  const [internalState, setInternalState] = useState<TrafficLightState>('red')
  
  const activeState = currentState ?? internalState

  useEffect(() => {
    if (!autoMode) return

    const interval = setInterval(() => {
      setInternalState(prev => {
        const currentIndex = stateSequence.indexOf(prev)
        const nextIndex = (currentIndex + 1) % stateSequence.length
        const nextState = stateSequence[nextIndex]
        
        onStateChange?.(nextState)
        return nextState
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [autoMode, onStateChange])

  const handleLightClick = (targetState: TrafficLightState) => {
    if (autoMode) return
    
    setInternalState(targetState)
    onStateChange?.(targetState)
  }

  const getLightStyle = (lightColor: TrafficLightState) => {
    const isActive = activeState === lightColor
    
    const baseStyles = "w-12 h-12 rounded-full border-2 cursor-pointer transition-all duration-300"
    
    switch (lightColor) {
      case 'red':
        return `${baseStyles} ${
          isActive 
            ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50 scale-110' 
            : 'bg-red-900/30 border-red-700/50 hover:bg-red-800/40'
        }`
      case 'yellow':
        return `${baseStyles} ${
          isActive 
            ? 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/50 scale-110' 
            : 'bg-yellow-900/30 border-yellow-700/50 hover:bg-yellow-800/40'
        }`
      case 'green':
        return `${baseStyles} ${
          isActive 
            ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50 scale-110' 
            : 'bg-green-900/30 border-green-700/50 hover:bg-green-800/40'
        }`
    }
  }

  return (
    <m.div 
      className={`flex flex-col items-center space-y-3 p-6 bg-slate-800/50 rounded-2xl border border-slate-600/50 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Traffic Light Housing */}
      <div className="flex flex-col items-center space-y-4 p-4 bg-slate-900/80 rounded-3xl border-2 border-slate-700/80">
        {/* Red Light */}
        <m.div
          className={getLightStyle('red')}
          onClick={() => handleLightClick('red')}
          whileHover={{ scale: autoMode ? 1 : 1.05 }}
          whileTap={{ scale: autoMode ? 1 : 0.95 }}
          animate={{
            boxShadow: activeState === 'red' 
              ? '0 0 20px rgba(239, 68, 68, 0.8)' 
              : '0 0 0px rgba(239, 68, 68, 0)'
          }}
        />
        
        {/* Yellow Light */}
        <m.div
          className={getLightStyle('yellow')}
          onClick={() => handleLightClick('yellow')}
          whileHover={{ scale: autoMode ? 1 : 1.05 }}
          whileTap={{ scale: autoMode ? 1 : 0.95 }}
          animate={{
            boxShadow: activeState === 'yellow' 
              ? '0 0 20px rgba(234, 179, 8, 0.8)' 
              : '0 0 0px rgba(234, 179, 8, 0)'
          }}
        />
        
        {/* Green Light */}
        <m.div
          className={getLightStyle('green')}
          onClick={() => handleLightClick('green')}
          whileHover={{ scale: autoMode ? 1 : 1.05 }}
          whileTap={{ scale: autoMode ? 1 : 0.95 }}
          animate={{
            boxShadow: activeState === 'green' 
              ? '0 0 20px rgba(34, 197, 94, 0.8)' 
              : '0 0 0px rgba(34, 197, 94, 0)'
          }}
        />
      </div>
      
      {/* State Label */}
      <m.div
        className="text-center"
        key={activeState}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm text-slate-300 font-medium">Current State:</div>
        <div className={`text-lg font-bold capitalize ${
          activeState === 'red' ? 'text-red-400' :
          activeState === 'yellow' ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {activeState}
        </div>
      </m.div>
      
      {/* Mode Indicator */}
      {autoMode && (
        <m.div
          className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Auto Cycling
        </m.div>
      )}
      
      {!autoMode && (
        <div className="text-xs text-slate-400 text-center">
          Click any light to change state
        </div>
      )}
    </m.div>
  )
}