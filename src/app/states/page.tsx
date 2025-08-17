'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, X, Binary, Circle, Square, CheckCircle2, Star, MousePointer2 } from 'lucide-react'
import { dictionaryService } from '@/lib/dictionaryService'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept } from '@/components/lesson/ConceptViewer'
import SuperText from '@/components/ui/SuperText'
import TrafficLight from '@/components/ui/TrafficLight'

type LessonPhase = 'slide-1' | 'slide-2' | 'slide-3' | 'slide-4' | 'slide-5' | 'slide-6' | 'slide-7' | 'slide-8' | 'slide-9' | 'slide-10' | 'slide-11' | 'slide-12' | 'slide-13' | 'slide-14' | 'complete'

// Binary Switch Component
function BinarySwitch({ value, onChange, enabled = true, showLabels = true, autoToggle = false }: {
  value: boolean
  onChange: (value: boolean) => void
  enabled?: boolean
  showLabels?: boolean
  autoToggle?: boolean
}) {
  const [internalValue, setInternalValue] = useState(value)
  
  useEffect(() => {
    if (!autoToggle) return
    
    const interval = setInterval(() => {
      setInternalValue(prev => {
        const newValue = !prev
        // Only call onChange if it's a function (not during initial render)
        if (typeof onChange === 'function') {
          onChange(newValue)
        }
        return newValue
      })
    }, 1200)
    
    return () => clearInterval(interval)
  }, [autoToggle, onChange])
  
  const currentValue = autoToggle ? internalValue : value
  
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => !autoToggle && enabled && onChange(!currentValue)}
        disabled={!enabled || autoToggle}
        className={`relative w-32 h-16 rounded-full transition-all duration-300 ${
          enabled && !autoToggle ? 'cursor-pointer' : 'cursor-default'
        } ${currentValue ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'}`}
      >
        <m.div
          className={`absolute top-2 w-12 h-12 rounded-full ${
            currentValue ? 'bg-green-400' : 'bg-red-400'
          }`}
          initial={false}
          animate={{ x: currentValue ? 'calc(8rem - 3rem)' : '0' }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </button>
      {showLabels && (
        <div className="text-white text-lg font-semibold">
          {currentValue ? 'TRUE' : 'FALSE'}
        </div>
      )}
    </div>
  )
}

// Light Bulb Visualization
function LightBulb({ isOn }: { isOn: boolean }) {
  return (
    <div className="relative">
      {/* Glow effect */}
      <AnimatePresence>
        {isOn && (
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -inset-8 bg-yellow-400/20 rounded-full blur-xl"
          />
        )}
      </AnimatePresence>
      
      {/* Bulb */}
      <svg width="80" height="120" viewBox="0 0 80 120" className="relative z-10">
        <g>
          {/* Bulb glass */}
          <path
            d="M 40 10 C 55 10 65 20 65 35 C 65 50 55 60 50 65 L 50 80 L 30 80 L 30 65 C 25 60 15 50 15 35 C 15 20 25 10 40 10"
            fill={isOn ? '#fbbf24' : '#374151'}
            stroke={isOn ? '#f59e0b' : '#4b5563'}
            strokeWidth="2"
          />
          
          {/* Filament */}
          <path
            d="M 35 30 Q 40 40 45 30 Q 40 40 35 50"
            fill="none"
            stroke={isOn ? '#dc2626' : '#6b7280'}
            strokeWidth="1.5"
            opacity={isOn ? 1 : 0.3}
          />
          
          {/* Base */}
          <rect x="30" y="80" width="20" height="5" fill="#6b7280" />
          <rect x="32" y="85" width="16" height="3" fill="#6b7280" />
          <rect x="32" y="88" width="16" height="3" fill="#6b7280" />
          <rect x="32" y="91" width="16" height="3" fill="#6b7280" />
        </g>
      </svg>
      
      {/* On/Off label */}
      <div className={`text-center mt-2 font-semibold ${isOn ? 'text-yellow-400' : 'text-gray-400'}`}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  )
}

// Binary vs Multiple States Visualization
function BinaryVsMultipleStates() {
  const [selectedSide, setSelectedSide] = useState<'binary' | 'multiple'>('binary')
  
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        {/* Binary State */}
        <m.div 
          className={`bg-white/5 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
            selectedSide === 'binary' 
              ? 'border-2 border-green-400 bg-green-400/20 scale-105 shadow-lg shadow-green-400/30' 
              : 'border-2 border-green-400/30 hover:border-green-400/50'
          }`}
          onClick={() => setSelectedSide('binary')}
          whileHover={{ scale: selectedSide === 'binary' ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">Two States</h3>
          <div className="flex justify-center gap-4 mb-4 h-[132px] items-center">
            <m.div 
              className="w-20 h-20 rounded-lg bg-green-500/20 border-2 border-green-400 flex items-center justify-center"
              animate={{ 
                scale: selectedSide === 'binary' ? [1, 1.1, 1] : 1,
                boxShadow: selectedSide === 'binary' ? '0 0 20px rgba(34, 197, 94, 0.5)' : '0 0 0px rgba(34, 197, 94, 0)'
              }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-green-400 font-bold">TRUE</span>
            </m.div>
            <m.div 
              className="w-20 h-20 rounded-lg bg-red-500/20 border-2 border-red-400 flex items-center justify-center"
              animate={{ 
                scale: selectedSide === 'binary' ? [1, 1.1, 1] : 1,
                boxShadow: selectedSide === 'binary' ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 0px rgba(239, 68, 68, 0)'
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-red-400 font-bold">FALSE</span>
            </m.div>
          </div>
          <div className="text-center h-[44px] flex flex-col justify-end">
            <p className="text-white/80 mb-2">Simple & Clear</p>
            <div className="flex justify-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all ${selectedSide === 'binary' ? 'bg-green-400' : 'bg-green-400/60'}`}></div>
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            </div>
          </div>
        </m.div>
        
        {/* Multiple States */}
        <m.div 
          className={`bg-white/5 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
            selectedSide === 'multiple' 
              ? 'border-2 border-purple-400 bg-purple-400/20 scale-105 shadow-lg shadow-purple-400/30' 
              : 'border-2 border-purple-400/30 hover:border-purple-400/50'
          }`}
          onClick={() => setSelectedSide('multiple')}
          whileHover={{ scale: selectedSide === 'multiple' ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">Many States</h3>
          <div className="grid grid-cols-3 gap-2 mb-4 h-[132px] items-center pb-6">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((state, i) => (
              <m.div 
                key={state}
                className="w-12 h-12 rounded bg-purple-500/20 border border-purple-400/50 flex items-center justify-center"
                animate={{ 
                  scale: selectedSide === 'multiple' ? [1, 1.1, 1] : 1,
                  boxShadow: selectedSide === 'multiple' ? '0 0 10px rgba(168, 85, 247, 0.4)' : '0 0 0px rgba(168, 85, 247, 0)'
                }}
                transition={{ duration: 0.3, delay: selectedSide === 'multiple' ? i * 0.05 : 0 }}
              >
                <span className="text-purple-400 text-sm font-semibold">{state}</span>
              </m.div>
            ))}
          </div>
          <div className="text-center h-[44px] flex flex-col justify-end">
            <p className="text-white/80 mb-2">Complex & Ambiguous</p>
            <div className="flex justify-center gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${selectedSide === 'multiple' ? 'bg-purple-400' : 'bg-purple-400/60'}`}></div>
              ))}
            </div>
          </div>
        </m.div>
      </div>
      
      <m.p 
        className="text-white/60 text-center max-w-lg"
        key={selectedSide}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedSide === 'binary' 
          ? "Binary states create the simplest possible distinction - perfect for building logical systems"
          : "Multiple states offer more options but create complexity and ambiguity in decision making"
        }
      </m.p>
    </div>
  )
}

// Interactive True/False Component
function InteractiveTrueFalse() {
  const [selectedValue, setSelectedValue] = useState<'true' | 'false'>('true')
  
  return (
    <div className="text-center">
      <div className="flex justify-center gap-8 mb-8">
        <m.div 
          className={`rounded-xl p-8 border-2 cursor-pointer transition-all duration-300 ${
            selectedValue === 'true' 
              ? 'bg-green-500/30 border-green-400 scale-110' 
              : 'bg-green-500/20 border-green-400 hover:bg-green-500/25'
          }`}
          onClick={() => setSelectedValue('true')}
          whileHover={{ scale: selectedValue === 'true' ? 1.1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: selectedValue === 'true' ? '0 0 25px rgba(34, 197, 94, 0.6)' : '0 0 0px rgba(34, 197, 94, 0)'
          }}
        >
          <h2 className="text-3xl font-bold text-green-400">TRUE</h2>
          <p className="text-white/60 mt-2">Yes, correct, 1</p>
        </m.div>
        <m.div 
          className={`rounded-xl p-8 border-2 cursor-pointer transition-all duration-300 ${
            selectedValue === 'false' 
              ? 'bg-red-500/30 border-red-400 scale-110' 
              : 'bg-red-500/20 border-red-400 hover:bg-red-500/25'
          }`}
          onClick={() => setSelectedValue('false')}
          whileHover={{ scale: selectedValue === 'false' ? 1.1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: selectedValue === 'false' ? '0 0 25px rgba(239, 68, 68, 0.6)' : '0 0 0px rgba(239, 68, 68, 0)'
          }}
        >
          <h2 className="text-3xl font-bold text-red-400">FALSE</h2>
          <p className="text-white/60 mt-2">No, incorrect, 0</p>
        </m.div>
      </div>
      <m.p 
        className="text-white/60"
        key={selectedValue}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedValue === 'true' 
          ? "TRUE represents 'yes' - something that is the case"
          : "FALSE represents 'no' - something that is not the case"
        }
      </m.p>
    </div>
  )
}

// Statement Evaluator Component
function StatementEvaluator({ 
  doorOpen, 
  statementText, 
  onStatementToggle 
}: { 
  doorOpen: boolean
  statementText: string
  onStatementToggle: () => void 
}) {
  const isStatementTrue = (statementText === "the door is open" && doorOpen) || 
                         (statementText === "the door is closed" && !doorOpen)
  
  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="bg-white/10 rounded-lg p-4 max-w-sm">
        <h3 className="text-white text-lg font-semibold mb-3 text-center">Statement Check</h3>
        
        <button
          onClick={onStatementToggle}
          className="w-full p-3 bg-white/5 hover:bg-white/10 rounded border border-white/20 transition-colors mb-3"
        >
          <span className="text-cyan-300 font-mono">"{statementText}"</span>
        </button>
        
        <div className="flex items-center justify-center gap-3">
          <span className="text-white/60">Binary Value:</span>
          <div className={`px-4 py-2 rounded font-bold ${
            isStatementTrue 
              ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
              : 'bg-red-500/20 text-red-400 border border-red-400/50'
          }`}>
            {isStatementTrue ? 'TRUE' : 'FALSE'}
          </div>
        </div>
      </div>
    </div>
  )
}


// Possible States Interactive Visualization

// Custom State Traffic Light Component
function StateTrafficLight() {
  const [currentState, setCurrentState] = useState<'red' | 'yellow' | 'green'>('red')
  const stateSequence = ['red', 'yellow', 'green'] as const
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState(prev => {
        const currentIndex = stateSequence.indexOf(prev)
        const nextIndex = (currentIndex + 1) % stateSequence.length
        return stateSequence[nextIndex]
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  const getLightStyle = (lightColor: 'red' | 'yellow' | 'green') => {
    const isActive = currentState === lightColor
    const baseStyles = "w-12 h-12 rounded-full border transition-all duration-300"
    
    switch (lightColor) {
      case 'red':
        return `${baseStyles} ${
          isActive 
            ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50' 
            : 'bg-red-900/30 border-red-700/50'
        }`
      case 'yellow':
        return `${baseStyles} ${
          isActive 
            ? 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/50' 
            : 'bg-yellow-900/30 border-yellow-700/50'
        }`
      case 'green':
        return `${baseStyles} ${
          isActive 
            ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' 
            : 'bg-green-900/30 border-green-700/50'
        }`
      default:
        return baseStyles
    }
  }

  const getStateColor = () => {
    switch (currentState) {
      case 'red': return 'text-red-400'
      case 'yellow': return 'text-yellow-400'
      case 'green': return 'text-green-400'
      default: return 'text-white'
    }
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Traffic Light Housing */}
      <div className="flex flex-col items-center space-y-3 p-4 bg-slate-900/80 rounded-2xl">
        <div className={getLightStyle('red')} />
        <div className={getLightStyle('yellow')} />
        <div className={getLightStyle('green')} />
      </div>
      
      {/* State Label */}
      <div className="text-center">
        <span className="text-white text-lg">Current State: </span>
        <span className={`capitalize font-bold text-lg ${getStateColor()}`}>
          {currentState}
        </span>
      </div>
    </div>
  )
}

// State Selection Visualization
function StateSelectionDemo() {
  const [selectedState, setSelectedState] = useState<number>(0)
  const states = ['OFF', 'LOW', 'MEDIUM', 'HIGH']
  
  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-2xl font-bold text-white">Possible States</h3>
      <div className="flex gap-4">
        {states.map((state, index) => (
          <m.button
            key={state}
            onClick={() => setSelectedState(index)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedState === index 
                ? 'bg-cosmic-aurora text-black scale-110 shadow-lg shadow-cosmic-aurora/50' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            whileHover={{ scale: selectedState === index ? 1.1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {state}
          </m.button>
        ))}
      </div>
      <p className="text-white/80 text-center max-w-md">
        Current state: <span className="text-cosmic-aurora font-bold">{states[selectedState]}</span>
        <br />
        <span className="text-white/60 text-sm">One state selected from {states.length} possible states</span>
      </p>
    </div>
  )
}

// System Control Visualization
function SystemControlDemo() {
  const [isControlled, setIsControlled] = useState(false)
  const [switchState, setSwitchState] = useState(false)
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 items-center">
        <div className="text-center">
          <h4 className="text-white font-semibold mb-4">Control Panel</h4>
          <button
            onClick={() => {
              setIsControlled(true)
              setSwitchState(!switchState)
            }}
            className="px-6 py-3 bg-cosmic-aurora text-black font-semibold rounded-lg hover:bg-cosmic-starlight transition-colors"
          >
            Toggle System
          </button>
        </div>
        <div className="text-3xl text-white/40">→</div>
        <div className="text-center">
          <h4 className="text-white font-semibold mb-4">System State</h4>
          <m.div
            animate={{ 
              backgroundColor: switchState ? '#10b981' : '#ef4444',
              scale: isControlled ? [1, 1.1, 1] : 1
            }}
            className="w-24 h-24 rounded-full flex items-center justify-center"
          >
            <span className="text-white font-bold">{switchState ? 'ON' : 'OFF'}</span>
          </m.div>
        </div>
      </div>
      <p className="text-white/60 text-center max-w-md">
        When we can change states, we control the system
      </p>
    </div>
  )
}

// Complexity Comparison
function ComplexityComparison() {
  const [activeSystem, setActiveSystem] = useState<'simple' | 'complex'>('simple')
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8">
        <m.div
          className={`p-6 rounded-xl cursor-pointer transition-all ${
            activeSystem === 'simple' 
              ? 'bg-green-500/20 border-2 border-green-400 scale-105' 
              : 'bg-white/10 border-2 border-white/20'
          }`}
          onClick={() => setActiveSystem('simple')}
        >
          <h4 className="text-white font-bold mb-4">2 States</h4>
          <div className="flex gap-2 justify-center">
            <div className="w-16 h-16 bg-green-500/30 rounded-lg flex items-center justify-center">
              <span className="text-green-400 font-bold">ON</span>
            </div>
            <div className="w-16 h-16 bg-red-500/30 rounded-lg flex items-center justify-center">
              <span className="text-red-400 font-bold">OFF</span>
            </div>
          </div>
          <p className="text-green-400 text-sm mt-4 text-center">Easy to control ✓</p>
        </m.div>
        
        <m.div
          className={`p-6 rounded-xl cursor-pointer transition-all ${
            activeSystem === 'complex' 
              ? 'bg-orange-500/20 border-2 border-orange-400 scale-105' 
              : 'bg-white/10 border-2 border-white/20'
          }`}
          onClick={() => setActiveSystem('complex')}
        >
          <h4 className="text-white font-bold mb-4">10 States</h4>
          <div className="grid grid-cols-5 gap-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-orange-500/30 rounded flex items-center justify-center">
                <span className="text-orange-400 text-xs font-bold">{i}</span>
              </div>
            ))}
          </div>
          <p className="text-orange-400 text-sm mt-4 text-center">Harder to control ✗</p>
        </m.div>
      </div>
      <p className="text-white/80 text-center">
        {activeSystem === 'simple' 
          ? "Fewer states = simpler control" 
          : "More states = more complexity"}
      </p>
    </div>
  )
}

// Single State Problem
function SingleStateProblem() {
  const [showProblem, setShowProblem] = useState(false)
  
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={() => setShowProblem(true)}
        className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
      >
        Try to Change This
      </button>
      
      <div className="relative">
        <div className="w-32 h-32 bg-gray-500/30 rounded-lg flex items-center justify-center border-2 border-gray-400">
          <span className="text-gray-400 font-bold text-xl">STATIC</span>
        </div>
        
        {showProblem && (
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-red-500/20 rounded-lg p-4 border-2 border-red-400">
              <p className="text-red-400 font-bold">Can't change!</p>
              <p className="text-white/60 text-sm">Only 1 state</p>
            </div>
          </m.div>
        )}
      </div>
      
      <p className="text-white/80 text-center max-w-md">
        With only one possible state, nothing can ever change
      </p>
    </div>
  )
}

// Binary Names Display
function BinaryNamesDisplay() {
  const names = [
    { label: 'Computer Science', true: 'TRUE', false: 'FALSE' },
    { label: 'Numbers', true: '1', false: '0' },
    { label: 'Switch', true: 'ON', false: 'OFF' },
    { label: 'Answer', true: 'YES', false: 'NO' },
    { label: 'Circuits', true: 'HIGH', false: 'LOW' }
  ]
  
  const [activeIndex, setActiveIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % names.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-2xl font-bold text-white">Many Names, Same Concept</h3>
      <div className="grid grid-cols-2 gap-8">
        <div className="text-center">
          <m.div
            className="w-32 h-32 bg-green-500/20 rounded-xl border-2 border-green-400 flex flex-col items-center justify-center"
            animate={{ scale: 1.05 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AnimatePresence mode="wait">
              <m.span
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-green-400 font-bold text-2xl"
              >
                {names[activeIndex].true}
              </m.span>
            </AnimatePresence>
          </m.div>
        </div>
        
        <div className="text-center">
          <m.div
            className="w-32 h-32 bg-red-500/20 rounded-xl border-2 border-red-400 flex flex-col items-center justify-center"
            animate={{ scale: 1.05 }}
            transition={{ duration: 2, delay: 1, repeat: Infinity }}
          >
            <AnimatePresence mode="wait">
              <m.span
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 font-bold text-2xl"
              >
                {names[activeIndex].false}
              </m.span>
            </AnimatePresence>
          </m.div>
        </div>
      </div>
      
      <m.p 
        key={activeIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white/60 text-center"
      >
        In {names[activeIndex].label}
      </m.p>
    </div>
  )
}

// Binary Questions Examples
function BinaryQuestions() {
  const questions = [
    { q: "Is the user logged in?", a: true },
    { q: "Is the file saved?", a: false },
    { q: "Is the button pressed?", a: true },
    { q: "Is the number even?", a: false }
  ]
  
  const [visibleQuestions, setVisibleQuestions] = useState(1)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleQuestions(prev => prev < questions.length ? prev + 1 : prev)
    }, 1500)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-2xl font-bold text-white mb-4">Real World Binary Questions</h3>
      <div className="space-y-3 w-full max-w-lg">
        {questions.slice(0, visibleQuestions).map((q, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between bg-white/10 rounded-lg p-4"
          >
            <span className="text-white">{q.q}</span>
            <span className={`font-bold ${q.a ? 'text-green-400' : 'text-red-400'}`}>
              {q.a ? 'TRUE' : 'FALSE'}
            </span>
          </m.div>
        ))}
      </div>
    </div>
  )
}

// Logic Chaining Visualization
function LogicChainingDemo() {
  const [example, setExample] = useState<'and' | 'or'>('and')
  const [passwordCorrect, setPasswordCorrect] = useState(true)
  const [userExists, setUserExists] = useState(true)
  const [batteryLow, setBatteryLow] = useState(true)
  const [cableConnected, setCableConnected] = useState(false)
  
  const andResult = passwordCorrect && userExists
  const orResult = batteryLow || cableConnected
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setExample('and')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            example === 'and' 
              ? 'bg-cosmic-aurora text-black' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          AND Example
        </button>
        <button
          onClick={() => setExample('or')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            example === 'or' 
              ? 'bg-cosmic-aurora text-black' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          OR Example
        </button>
      </div>
      
      {example === 'and' ? (
        <div className="bg-white/5 rounded-xl p-6 max-w-2xl">
          <h4 className="text-white font-bold mb-4 text-center">Login System (AND Logic)</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <button
                onClick={() => setPasswordCorrect(!passwordCorrect)}
                className={`w-full p-3 rounded-lg font-semibold transition-all ${
                  passwordCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                Password correct: {passwordCorrect ? 'TRUE' : 'FALSE'}
              </button>
            </div>
            <span className="text-white font-bold">AND</span>
            <div className="flex-1">
              <button
                onClick={() => setUserExists(!userExists)}
                className={`w-full p-3 rounded-lg font-semibold transition-all ${
                  userExists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                Username exists: {userExists ? 'TRUE' : 'FALSE'}
              </button>
            </div>
            <span className="text-white text-2xl">→</span>
            <div className="flex-1">
              <div className={`p-3 rounded-lg text-center font-bold ${
                andResult ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                Allow login: {andResult ? 'TRUE' : 'FALSE'}
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm text-center mt-4">Both must be TRUE for login</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-6 max-w-2xl">
          <h4 className="text-white font-bold mb-4 text-center">Battery Warning (OR Logic)</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <button
                onClick={() => setBatteryLow(!batteryLow)}
                className={`w-full p-3 rounded-lg font-semibold transition-all ${
                  batteryLow ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}
              >
                Battery low: {batteryLow ? 'TRUE' : 'FALSE'}
              </button>
            </div>
            <span className="text-white font-bold">OR</span>
            <div className="flex-1">
              <button
                onClick={() => setCableConnected(!cableConnected)}
                className={`w-full p-3 rounded-lg font-semibold transition-all ${
                  cableConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                Cable connected: {cableConnected ? 'TRUE' : 'FALSE'}
              </button>
            </div>
            <span className="text-white text-2xl">→</span>
            <div className="flex-1">
              <div className={`p-3 rounded-lg text-center font-bold ${
                orResult ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
              }`}>
                Show warning: {orResult ? 'TRUE' : 'FALSE'}
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm text-center mt-4">Either condition triggers warning</p>
        </div>
      )}
    </div>
  )
}

// Potential Tree Animation for the popup card

function StatesContent() {
  const router = useRouter()
  const { profile, addStardust } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('slide-1')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  
  // Interactive states
  const [switchValue, setSwitchValue] = useState(false)
  const [hasFlippedSwitch, setHasFlippedSwitch] = useState(false)
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [notebookPulse, setNotebookPulse] = useState(false)
  const [showNotebookHint, setShowNotebookHint] = useState(false)
  const [pendingNotebookEntry, setPendingNotebookEntry] = useState<{
    entry: Omit<NotebookEntry, 'id' | 'timestamp'>
    triggerPhase: LessonPhase
    triggerDialogIndex: number
  } | null>(null)
  const [showBooleanCard, setShowBooleanCard] = useState(true)
  const [showBinaryCard, setShowBinaryCard] = useState(true)
  const [showObservationCard, setShowObservationCard] = useState(false)
  const [showBinaryLogicCard, setShowBinaryLogicCard] = useState(false)
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  const [hasViewedStateCard, setHasViewedStateCard] = useState(false)
  const [hasViewedBooleanCard, setHasViewedBooleanCard] = useState(false)
  const [hasViewedBinaryCard, setHasViewedBinaryCard] = useState(false)
  const [hasViewedObservationCard, setHasViewedObservationCard] = useState(false)
  const [hasViewedBinaryLogicCard, setHasViewedBinaryLogicCard] = useState(false)
  const [resetTimerTrigger, setResetTimerTrigger] = useState(false)
  
  
  // Create dialog content with SuperText
  const binaryLogicExplanation = "Binary logic is a system of inputs and outputs where everything exists in one of two states.";
  const [superTextClickable, setSuperTextClickable] = useState(false)
  

  // Phase dialogs
  const phaseDialogs = {
    'slide-1': [
      { id: '1', npc: 'ECHELON' as const, text: "Let's explore states.", requiresInteraction: true }
    ],
    'slide-2': [
      { id: '2', npc: 'ECHELON' as const, text: "States are one of the most fundamental concepts in computing.", requiresInteraction: true }
    ],
    'slide-3': [
      { id: '3', npc: 'ECHELON' as const, text: "Everything has a state - a way of being at any given moment.", requiresInteraction: true }
    ],
    'slide-4': [
      { id: '4a', npc: 'ECHELON' as const, text: "A switch has two possible states.", requiresInteraction: false },
      { id: '4b', npc: 'ECHELON' as const, text: "A traffic light has three.", requiresInteraction: true }
    ],
    'slide-5': [
      { id: '5', npc: 'ECHELON' as const, text: "The state of an object is always selected out of its possible states.", requiresInteraction: true }
    ],
    'slide-6': [
      { id: '6', npc: 'ECHELON' as const, text: "If we have a way to change states when we need to, then we can control a system.", requiresInteraction: true }
    ],
    'slide-7': [
      { id: '7', npc: 'ECHELON' as const, text: "The less possible states something has, the easier it is to control it.", requiresInteraction: true }
    ],
    'slide-8': [
      { id: '8', npc: 'ECHELON' as const, text: "But if something only had one state, it could never change.", requiresInteraction: true }
    ],
    'slide-9': [
      { id: '9a', npc: 'ECHELON' as const, text: "So we just add another possible state: two possible states.", requiresInteraction: false },
      { id: '9b', npc: 'ECHELON' as const, text: "Simple.", requiresInteraction: true }
    ],
    'slide-10': [
      { id: '10', npc: 'ECHELON' as const, text: "In computer science, we call these two states true and false.", requiresInteraction: true }
    ],
    'slide-11': [
      { id: '11', npc: 'ECHELON' as const, text: "We also call them: 1 and 0, on and off, yes and no, high and low (in circuits). This two-state system is called binary, and it's the foundation of all computing.", requiresInteraction: true }
    ],
    'slide-12': [
      { id: '12a', npc: 'ECHELON' as const, text: "Why just two? Because it's the absolute minimum for something to be changeable...", requiresInteraction: false },
      { id: '12b', npc: 'ECHELON' as const, text: "...and computers love simplicity.", requiresInteraction: false },
      { id: '12c', npc: 'ECHELON' as const, text: "Every fancy behavior comes from lots of two-state decisions.", requiresInteraction: true }
    ],
    'slide-13': [
      { id: '13a', npc: 'ECHELON' as const, text: "Think about it: with just true/false, we can represent:", requiresInteraction: false },
      { id: '13b', npc: 'ECHELON' as const, text: "Is the user logged in? true/false", requiresInteraction: false },
      { id: '13c', npc: 'ECHELON' as const, text: "Is the file saved? true/false", requiresInteraction: false },
      { id: '13d', npc: 'ECHELON' as const, text: "Is the button pressed? true/false", requiresInteraction: false },
      { id: '13e', npc: 'ECHELON' as const, text: "Is the number even? true/false", requiresInteraction: true }
    ],
    'slide-14': [
      { id: '14a', npc: 'ECHELON' as const, text: "These simple questions control everything.", requiresInteraction: false },
      { id: '14b', npc: 'ECHELON' as const, text: "Chain them together and you get logic:", requiresInteraction: false },
      { id: '14c', npc: 'ECHELON' as const, text: "If password is correct (true) AND username exists (true) → allow login", requiresInteraction: false },
      { id: '14d', npc: 'ECHELON' as const, text: "If battery is low (true) OR power cable connected (false) → show warning", requiresInteraction: true }
    ]
  }
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  // Concept definitions
  const booleanConcept: Concept = {
    id: 'binary-value',
    name: 'Binary Value',
    definition: 'A data type with only two possible values.',
    whyItMatters: 'Binary values are the foundation of all digital logic and computation. Every decision a computer makes ultimately comes down to evaluating binary conditions.',
    demonstration: (
      <div className="flex justify-center">
        <BinarySwitch value={true} onChange={() => {}} enabled={false} showLabels={true} autoToggle={true} />
      </div>
    ),
    properties: [
      {
        id: 'exclusivity',
        name: 'Mutual Exclusivity',
        description: 'A boolean can only be TRUE or FALSE, never both',
        whyItMatters: 'This exclusivity ensures clarity and prevents ambiguity in logical operations.',
        demonstration: (
          <div className="text-center">
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-green-400 text-2xl font-bold">TRUE</div>
              <div className="text-white/40 text-2xl">OR</div>
              <div className="text-red-400 text-2xl font-bold">FALSE</div>
            </div>
            <p className="text-white/60 text-sm">Never both, always one</p>
          </div>
        )
      },
      {
        id: 'completeness',
        name: 'Completeness',
        description: 'There are no other possible values besides TRUE and FALSE',
        whyItMatters: 'This completeness means every boolean question has a definite answer.',
        demonstration: (
          <div className="text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white mb-2">Is 5 greater than 3?</p>
              <p className="text-green-400 font-bold">TRUE ✓</p>
              <p className="text-white/60 text-sm mt-2">No third option exists</p>
            </div>
          </div>
        )
      }
    ]
  }

  const observationConcept: Concept = {
    id: 'observation',
    name: 'Observation',
    definition: 'Looking at something to find out its current state.',
    whyItMatters: 'By observing, we can know the current state of things. This is how we gather information about the world.',
    demonstration: (
      <div className="flex justify-center">
        <div className="text-center">
          <div className="bg-cosmic-aurora/10 rounded-xl p-6 border border-cosmic-aurora/30">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <div className="text-2xl">👁️</div>
              </div>
              <div className="text-3xl">→</div>
              <div className="w-16 h-16 rounded-lg bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                <span className="text-green-400 font-bold text-sm">CURRENT STATE</span>
              </div>
            </div>
            <p className="text-white/60 text-sm">Observing reveals the current state</p>
          </div>
        </div>
      </div>
    ),
    properties: [
      {
        id: 'direct',
        name: 'Direct',
        description: 'You can see the current state immediately',
        whyItMatters: 'Direct observation gives us certain knowledge about the current state.',
        demonstration: (
          <div className="text-center">
            <p className="text-white/80">Looking at a light switch tells you if it's ON or OFF</p>
          </div>
        )
      },
      {
        id: 'indirect',
        name: 'Indirect',
        description: 'You infer the current state from other information',
        whyItMatters: 'Sometimes we can\'t observe directly, but we can figure out the current state from clues.',
        demonstration: (
          <div className="text-center">
            <p className="text-white/80">Seeing light under a door tells you the room light is ON</p>
          </div>
        )
      }
    ]
  }

  // Create a wrapper component for the state demonstration
  const StateConceptDemo = () => {
    const [demoType, setDemoType] = useState<'2-state' | '3-state'>('2-state')
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setDemoType('2-state')}
            className={`px-4 py-2 rounded-lg transition-all ${
              demoType === '2-state' 
                ? 'bg-cosmic-aurora/20 border border-cosmic-aurora text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            2 States (Switch)
          </button>
          <button
            onClick={() => setDemoType('3-state')}
            className={`px-4 py-2 rounded-lg transition-all ${
              demoType === '3-state' 
                ? 'bg-cosmic-aurora/20 border border-cosmic-aurora text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            3 States (Traffic Light)
          </button>
        </div>
        <div className="flex justify-center">
          {demoType === '2-state' ? (
            <div className="text-center">
              <BinarySwitch value={true} onChange={() => {}} enabled={false} showLabels={true} autoToggle={true} />
              <p className="text-white/60 text-sm mt-4">A switch has exactly 2 possible states</p>
            </div>
          ) : (
            <div className="text-center">
              <StateTrafficLight />
              <p className="text-white/60 text-sm mt-4">A traffic light has exactly 3 possible states</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const stateConcept: Concept = {
    id: 'state',
    name: 'State',
    definition: 'A configuration at a specific time.',
    whyItMatters: 'Everything has a state. Understanding states helps us describe what things are like and predict how they might change.',
    demonstration: <StateConceptDemo />,
    properties: [
      {
        id: 'specific',
        name: 'Specific',
        description: 'A state describes one particular way of being',
        whyItMatters: 'States give us a clear way to describe and understand things.',
        demonstration: (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {/* Door Frame */}
              <div className="w-24 h-32 bg-gradient-to-b from-amber-900/40 to-amber-950/40 rounded-t-lg border-2 border-amber-700/50 relative overflow-hidden">
                {/* Open Door */}
                <m.div
                  className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-900 origin-left border-r-2 border-amber-700"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: -75 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                >
                  {/* Door knob */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-600 rounded-full shadow-sm" />
                </m.div>
                {/* Behind door glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent" />
              </div>
              
              {/* State label */}
              <m.div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500/20 border border-green-400/50 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-green-400 text-xs font-bold">OPEN</span>
              </m.div>
            </div>
            
            <p className="text-white/80 text-sm font-medium mt-2">One specific configuration</p>
            <p className="text-white/60 text-xs">at this exact moment</p>
          </div>
        )
      },
      {
        id: 'distinct',
        name: 'Distinct',
        description: 'Each state is different from others',
        whyItMatters: 'Clear differences between states help us understand and organize information.',
        demonstration: (
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center gap-6">
              {/* Day state */}
              <m.div 
                className="relative"
                animate={{ scale: 1.05 }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "loop" }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400/50 flex items-center justify-center relative overflow-hidden">
                  {/* Sun rays */}
                  <m.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                        }}
                      />
                    ))}
                  </m.div>
                  {/* Sun core */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 relative z-10 shadow-lg shadow-yellow-400/30" />
                </div>
                <p className="text-yellow-400 text-sm font-bold mt-2 text-center">DAY</p>
              </m.div>
              
              {/* Separator */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-8 bg-white/20" />
                <span className="text-white/40 text-xs">≠</span>
                <div className="w-px h-8 bg-white/20" />
              </div>
              
              {/* Night state */}
              <m.div 
                className="relative"
                animate={{ scale: 1.05 }}
                transition={{ duration: 4, delay: 2, repeat: Infinity, repeatType: "loop" }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border-2 border-indigo-400/50 flex items-center justify-center relative overflow-hidden">
                  {/* Stars */}
                  <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <m.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${10 + Math.random() * 80}%`,
                        }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                      />
                    ))}
                  </div>
                  {/* Moon */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 relative z-10 shadow-lg shadow-indigo-400/30">
                    {/* Moon crater */}
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gray-300/50" />
                  </div>
                </div>
                <p className="text-indigo-400 text-sm font-bold mt-2 text-center">NIGHT</p>
              </m.div>
            </div>
            
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium">Completely different states</p>
              <p className="text-white/60 text-xs mt-1">Never confused or mixed</p>
            </div>
          </div>
        )
      }
    ]
  }

  const binaryLogicConcept: Concept = {
    id: 'binary-logic',
    name: 'Binary Logic',
    definition: 'A system where everything exists in one of two states.',
    whyItMatters: 'Binary logic is the foundation of all digital systems. By limiting choices to just two states, we create a simple, reliable way to process information that computers can understand.',
    demonstration: (
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white/10 rounded-xl p-4 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="w-full h-20 rounded-lg bg-green-500/20 border-2 border-green-400 flex items-center justify-center mb-2">
                <span className="text-green-400 font-bold text-lg">ON</span>
              </div>
              <p className="text-white/60 text-xs">State 1</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 rounded-lg bg-red-500/20 border-2 border-red-400 flex items-center justify-center mb-2">
                <span className="text-red-400 font-bold text-lg">OFF</span>
              </div>
              <p className="text-white/60 text-xs">State 2</p>
            </div>
          </div>
          <p className="text-white/80 text-sm text-center">Only two possibilities exist</p>
        </div>
      </div>
    ),
    properties: [
      {
        id: 'simplicity',
        name: 'Simplicity',
        description: 'Only two choices makes decisions clear and unambiguous',
        whyItMatters: 'This simplicity allows complex systems to be built from simple, reliable parts.',
        demonstration: (
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <div className="w-12 h-12 rounded bg-green-500/30 border border-green-400 flex items-center justify-center">
                <span className="text-green-400 font-bold">✓</span>
              </div>
              <span className="text-white/60 text-2xl">or</span>
              <div className="w-12 h-12 rounded bg-red-500/30 border border-red-400 flex items-center justify-center">
                <span className="text-red-400 font-bold">✗</span>
              </div>
            </div>
            <p className="text-white/60 text-sm">No confusion, no ambiguity</p>
          </div>
        )
      },
      {
        id: 'universality',
        name: 'Universal Application',
        description: 'Binary logic can represent any information or decision',
        whyItMatters: 'Everything from text to images to sound can be encoded using just two states.',
        demonstration: (
          <div className="text-center">
            <div className="grid grid-cols-4 gap-1 mb-2 max-w-[200px] mx-auto">
              {[1,0,1,1,0,1,0,0,1,0,1,0,0,1,1,0].map((bit, i) => (
                <div key={i} className={`w-8 h-8 rounded text-sm font-mono flex items-center justify-center ${
                  bit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {bit}
                </div>
              ))}
            </div>
            <p className="text-white/60 text-sm">Any data can be binary</p>
          </div>
        )
      }
    ]
  }

  
  // Notebook functions
  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>, immediate = false) => {
    const exists = notebookEntries.some(
      e => e.title === entry.title && e.type === entry.type
    )
    
    if (exists) return
    
    if (immediate) {
      // Add immediately
      const newEntry: NotebookEntry = {
        ...entry,
        id: `entry-${Date.now()}`,
        timestamp: Date.now()
      }
      setNotebookEntries(prev => [...prev, newEntry])
      
      // Trigger pulse animation and show hint
      setNotebookPulse(true)
      setShowNotebookHint(true)
      
      // Reset pulse after animation
      setTimeout(() => setNotebookPulse(false), 1000)
      
      // Hide hint after a few seconds
      setTimeout(() => setShowNotebookHint(false), 4000)
    } else {
      // Store for later addition when the specific dialog completes typing
      console.log('Storing pending notebook entry:', entry, 'for phase:', currentPhase, 'dialog:', currentDialogIndex)
      setPendingNotebookEntry({
        entry,
        triggerPhase: currentPhase,
        triggerDialogIndex: currentDialogIndex
      })
    }
  }
  
  // Handle typing completion
  const handleTypingComplete = () => {
    console.log('Typing completed for phase:', currentPhase, 'dialog:', currentDialogIndex, 'pending entry:', pendingNotebookEntry)
    if (pendingNotebookEntry && 
        pendingNotebookEntry.triggerPhase === currentPhase && 
        pendingNotebookEntry.triggerDialogIndex === currentDialogIndex) {
      console.log('Triggering pending notebook notification now!')
      addNotebookEntry(pendingNotebookEntry.entry, true)
      setPendingNotebookEntry(null)
    }
  }
  
  const addUserNote = (note: string) => {
    addNotebookEntry({
      type: 'note',
      title: 'Personal Note',
      content: note
    })
  }
  
  const handleNotebookEntryClick = (entry: NotebookEntry) => {
    if (entry.title === 'Binary Value') {
      setViewingConcept(booleanConcept)
      setShowConceptViewer(true)
    } else if (entry.title === 'State') {
      setViewingConcept(stateConcept)
      setShowConceptViewer(true)
    } else if (entry.title === 'Binary Logic') {
      setViewingConcept(binaryLogicConcept)
      setShowConceptViewer(true)
    } else if (entry.title === 'Observation') {
      setViewingConcept(observationConcept)
      setShowConceptViewer(true)
    } else if (entry.title === 'Binary Representation') {
      setViewingConcept(booleanConcept) // This is a property of Binary Value
      setShowConceptViewer(true)
    }
  }
  
  const handleSwitchToggle = (value: boolean) => {
    setSwitchValue(value)
    if (!hasToggledSwitch) {
      setHasToggledSwitch(true)
    }
  }
  
  const handleStatementToggle = () => {
    setStatementText(prev => 
      prev === "the door is open" ? "the door is closed" : "the door is open"
    )
  }
  
  // Remove the SuperText effect since we're not using it anymore
  useEffect(() => {
    if (currentPhase === 'slide-2' && currentDialogIndex === 5) {
      setSuperTextClickable(false)
    }
  }, [currentPhase, currentDialogIndex])

  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Move to next phase
      const phaseOrder: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10', 'slide-11', 'slide-12', 'slide-13', 'slide-14']
      const currentIndex = phaseOrder.indexOf(currentPhase)
      
      if (currentIndex < phaseOrder.length - 1) {
        setCurrentPhase(phaseOrder[currentIndex + 1])
        setCurrentDialogIndex(0)
      } else {
        handleLessonComplete()
      }
    }
  }
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      const phaseOrder: LessonPhase[] = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7', 'slide-8', 'slide-9', 'slide-10', 'slide-11', 'slide-12', 'slide-13', 'slide-14']
      const currentIndex = phaseOrder.indexOf(currentPhase)
      if (currentIndex > 0) {
        const prevPhase = phaseOrder[currentIndex - 1]
        setCurrentPhase(prevPhase)
        const prevDialogs = phaseDialogs[prevPhase]
        setCurrentDialogIndex(prevDialogs.length - 1)
      }
    }
  }
  
  const handleLessonComplete = async () => {
    const stardustEarned = 20
    await addStardust(stardustEarned)
    setEarnedStardust(stardustEarned)
    setShowCompletionScreen(true)
  }
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  // Debug logging
  useEffect(() => {
    console.log('TrueAndFalse Debug:', {
      currentPhase,
      currentDialogIndex,
      currentDialog,
      dialogsLength: getCurrentDialogs().length,
      showCompletionScreen
    })
  }, [currentPhase, currentDialogIndex, showCompletionScreen])
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar currentPage="States" />
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          
          <AnimatePresence mode="wait">
            {/* Slide 1 - Title */}
            {currentPhase === 'slide-1' && (
              <m.div
                key="slide-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <m.h1 
                    className="text-5xl font-bold text-white mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    States
                  </m.h1>
                  <m.p 
                    className="text-2xl text-white/60"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    The foundation of control
                  </m.p>
                </div>
              </m.div>
            )}
            
            {/* Slide 2 - States are fundamental */}
            {currentPhase === 'slide-2' && (
              <m.div
                key="slide-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">States are fundamental</h2>
                </div>
              </m.div>
            )}
            
            {/* Slide 3 - Everything has a state */}
            {currentPhase === 'slide-3' && (
              <m.div
                key="slide-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-8">Everything has a state</h2>
                  <p className="text-xl text-white/80 mb-8">A way of being at any given moment</p>
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-4xl">🚪</span>
                      </div>
                      <p className="text-white/60">Door: Open/Closed</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-4xl">💡</span>
                      </div>
                      <p className="text-white/60">Light: On/Off</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-4xl">🌡️</span>
                      </div>
                      <p className="text-white/60">Temperature: Hot/Cold</p>
                    </div>
                  </div>
                </div>
              </m.div>
            )}
            
            {/* Slide 4 - Switch has 2 states, traffic light has 3 */}
            {currentPhase === 'slide-4' && (
              <m.div
                key="slide-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="flex gap-16 items-center">
                  {currentDialogIndex === 0 && (
                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-center"
                    >
                      <BinarySwitch value={switchValue} onChange={setSwitchValue} enabled={true} showLabels={true} />
                      <p className="text-white font-semibold mt-4">2 Possible States</p>
                    </m.div>
                  )}
                  {currentDialogIndex === 1 && (
                    <m.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-center"
                    >
                      <StateTrafficLight />
                      <p className="text-white font-semibold mt-4">3 Possible States</p>
                    </m.div>
                  )}
                </div>
              </m.div>
            )}
            
            {/* Slide 5 - State selection */}
            {currentPhase === 'slide-5' && (
              <m.div
                key="slide-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <StateSelectionDemo />
              </m.div>
            )}
            
            {/* Slide 6 - System control */}
            {currentPhase === 'slide-6' && (
              <m.div
                key="slide-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <SystemControlDemo />
              </m.div>
            )}
            
            {/* Slide 7 - Complexity comparison */}
            {currentPhase === 'slide-7' && (
              <m.div
                key="slide-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <ComplexityComparison />
              </m.div>
            )}
            
            {/* Slide 8 - Single state problem */}
            {currentPhase === 'slide-8' && (
              <m.div
                key="slide-7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <SingleStateProblem />
              </m.div>
            )}
            
            {/* Slide 9 - Two states is perfect */}
            {currentPhase === 'slide-9' && (
              <m.div
                key="slide-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-8">The Perfect Number: 2</h2>
                  <div className="flex justify-center gap-8 mb-8">
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-32 h-32 bg-green-500/20 rounded-xl border-2 border-green-400 flex items-center justify-center"
                    >
                      <span className="text-green-400 font-bold text-2xl">STATE 1</span>
                    </m.div>
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-32 h-32 bg-red-500/20 rounded-xl border-2 border-red-400 flex items-center justify-center"
                    >
                      <span className="text-red-400 font-bold text-2xl">STATE 2</span>
                    </m.div>
                  </div>
                  <p className="text-xl text-white/80">Simple enough to control</p>
                  <p className="text-xl text-white/80">Complex enough to change</p>
                </div>
              </m.div>
            )}
            
            {/* Slide 10 - Computer science names */}
            {currentPhase === 'slide-10' && (
              <m.div
                key="slide-9"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-8">In Computer Science</h2>
                  <div className="flex justify-center gap-12">
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-green-500/20 rounded-xl p-8 border-2 border-green-400"
                    >
                      <h3 className="text-green-400 font-bold text-4xl">TRUE</h3>
                    </m.div>
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-red-500/20 rounded-xl p-8 border-2 border-red-400"
                    >
                      <h3 className="text-red-400 font-bold text-4xl">FALSE</h3>
                    </m.div>
                  </div>
                </div>
              </m.div>
            )}
            
            {/* Slide 11 - All the names */}
            {currentPhase === 'slide-11' && (
              <m.div
                key="slide-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <BinaryNamesDisplay />
              </m.div>
            )}
            
            {/* Slide 12 - Why binary */}
            {currentPhase === 'slide-12' && (
              <m.div
                key="slide-11"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center max-w-2xl">
                  <h2 className="text-3xl font-bold text-white mb-8">Why Just Two?</h2>
                  <div className="space-y-6">
                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/10 rounded-lg p-6"
                    >
                      <h3 className="text-xl font-semibold text-cosmic-aurora mb-2">Minimum for Change</h3>
                      <p className="text-white/80">The absolute smallest number that allows something to be different</p>
                    </m.div>
                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white/10 rounded-lg p-6"
                    >
                      <h3 className="text-xl font-semibold text-cosmic-aurora mb-2">Maximum Simplicity</h3>
                      <p className="text-white/80">Computers love simplicity - and nothing is simpler than yes/no</p>
                    </m.div>
                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white/10 rounded-lg p-6"
                    >
                      <h3 className="text-xl font-semibold text-cosmic-aurora mb-2">Building Blocks</h3>
                      <p className="text-white/80">Every fancy behavior comes from lots of two-state decisions</p>
                    </m.div>
                  </div>
                </div>
              </m.div>
            )}
            
            {/* Slide 13 - Binary questions */}
            {currentPhase === 'slide-13' && (
              <m.div
                key="slide-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <BinaryQuestions />
              </m.div>
            )}
            
            {/* Slide 14 - Logic chaining */}
            {currentPhase === 'slide-14' && (
              <m.div
                key="slide-13"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <LogicChainingDemo />
              </m.div>
            )}
          </AnimatePresence>
        
        </div>
      </div>
      
      {/* NPC Dialog */}
      {currentDialog && !showCompletionScreen && (
        <NPCDialog
          dialog={currentDialog}
          onNext={handleNextDialog}
          isVisible={true}
          canGoBack={!(currentPhase === 'slide-1' && currentDialogIndex === 0)}
          onBack={handleBackDialog}
          allowMinimize={false}
          continueButtonLockDuration={
            (currentPhase === 'slide-2' && currentDialogIndex === 0 && !hasViewedStateCard) ? 5 :
            (currentPhase === 'slide-3' && currentDialogIndex === 2 && showBooleanCard && !hasViewedBooleanCard) ? 5 :
            (currentPhase === 'slide-4' && currentDialogIndex === 1 && showBinaryCard && !hasViewedBinaryCard) ? 5 : 0
          }
          customLockCondition={currentPhase === 'slide-2' && currentDialogIndex === 0 ? !hasFlippedSwitch : undefined}
          customLockMessage={currentPhase === 'slide-2' && currentDialogIndex === 0 ? "Flip the switch to continue" : undefined}
          resetTimerTrigger={resetTimerTrigger}
          onTypingComplete={handleTypingComplete}
        />
      )}
      
      {/* Boolean concept card */}
      {currentPhase === 'slide-3' && currentDialogIndex === 2 && showBooleanCard && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              // Add to dictionary and notebook without hiding the card
              dictionaryService.addEntry({
                id: 'binary-value',
                term: 'Binary Value',
                definition: 'A data type with only two possible values.',
                category: 'computer-science',
                relatedTerms: ['boolean', 'binary', 'logic', 'true', 'false'],
                examples: ['A light switch has a binary value - it\'s either on or off'],
                visualAid: 'A switch showing two possible states'
              })
              addNotebookEntry({
                type: 'definition',
                title: 'Binary Value',
                content: 'A data type with only two possible values'
              }, true) // Add immediately when card appears
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto cursor-pointer"
            onClick={() => {
              setViewingConcept(booleanConcept)
              setShowConceptViewer(true)
              setShowBooleanCard(false) // Hide card while viewing concept
              setHasViewedBooleanCard(true)
            }}
          >
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-cosmic-aurora/50 shadow-xl overflow-hidden">
              {/* Click indicator */}
              <m.div
                className="absolute top-4 right-4 z-10"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-cosmic-aurora/20 rounded-full p-2 backdrop-blur-sm border border-cosmic-aurora/30">
                  <MousePointer2 className="w-4 h-4 text-cosmic-aurora" />
                </div>
              </m.div>
              
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cosmic-aurora/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-cosmic-aurora" />
                  </div>
                  <div className="flex-1">
                    <p className="text-cosmic-aurora text-xs font-medium mb-1">New Concept</p>
                    <h3 className="text-white text-xl font-bold">Binary Value</h3>
                    <p className="text-white/60 text-sm">(aka boolean)</p>
                  </div>
                </div>
              </div>
              
              {/* Demo Module */}
              <div className="px-6 pb-4">
                <div className="bg-black/30 rounded-xl p-4">
                  <BinarySwitch value={switchValue} onChange={() => {}} enabled={false} showLabels={true} autoToggle={true} />
                </div>
              </div>
              
              <div className="relative px-6 pb-6">
                <p className="text-white/80 mb-4">
                  A data type with only two possible values.
                </p>
                <div className="flex items-center gap-2 text-cosmic-aurora">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs">Saved to notebook</span>
                </div>
                <p className="text-white/60 text-xs mt-2 flex items-center gap-1 justify-center">
                  <MousePointer2 className="w-3 h-3" />
                  Click to explore
                </p>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* Binary concept card */}
      {currentPhase === 'slide-4' && currentDialogIndex === 1 && showBinaryCard && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              addNotebookEntry({
                type: 'property',
                title: 'Binary Representation',
                content: 'TRUE = 1, FALSE = 0 in computer systems'
              }, true) // Add immediately when card appears
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto cursor-pointer"
            onClick={() => {
              setViewingConcept(booleanConcept)
              setShowConceptViewer(true)
              setShowBinaryCard(false) // Hide card while viewing concept
              setHasViewedBinaryCard(true)
            }}
          >
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-purple-500/50 shadow-xl overflow-hidden">
              {/* Click indicator */}
              <m.div
                className="absolute top-4 right-4 z-10"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-purple-500/20 rounded-full p-2 backdrop-blur-sm border border-purple-500/30">
                  <MousePointer2 className="w-4 h-4 text-purple-400" />
                </div>
              </m.div>
              
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <Binary className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-purple-400 text-sm font-medium mb-1">PROPERTY</p>
                    <h3 className="text-white text-2xl font-bold">Binary Representation</h3>
                  </div>
                </div>
              </div>
              
              {/* Demo Module */}
              <div className="px-6 pb-4">
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="flex justify-around text-lg">
                    <div className="text-center">
                      <div className="text-green-400 font-mono text-xl">TRUE</div>
                      <div className="text-white/60 my-2">↓</div>
                      <div className="text-cyan-400 font-mono text-xl">1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-mono text-xl">FALSE</div>
                      <div className="text-white/60 my-2">↓</div>
                      <div className="text-cyan-400 font-mono text-xl">0</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative px-6 pb-6">
                <p className="text-white/80 mb-4">
                  In computers, TRUE becomes 1 and FALSE becomes 0
                </p>
                <div className="flex items-center gap-2 text-purple-400">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs">Saved to notebook</span>
                </div>
                <p className="text-white/60 text-xs mt-2 flex items-center gap-1 justify-center">
                  <MousePointer2 className="w-3 h-3" />
                  Click to explore
                </p>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      {/* State concept card */}
      {currentPhase === 'slide-2' && currentDialogIndex === 0 && (
        <m.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none pb-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              // Add to dictionary and notebook
              dictionaryService.addEntry({
                id: 'state',
                term: 'State',
                definition: 'Everything has a state - a configuration at a specific time.',
                category: 'computer-science',
                relatedTerms: ['condition', 'status', 'binary', 'boolean'],
                examples: ['A door has two states: open or closed'],
                visualAid: 'A door showing different states'
              })
              addNotebookEntry({
                type: 'definition',
                title: 'State',
                content: 'Everything has a state - a configuration at a specific time'
              }, true) // Add immediately when card appears
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto cursor-pointer"
            onClick={() => {
              setViewingConcept(stateConcept)
              setShowConceptViewer(true)
              setHasViewedStateCard(true)
            }}
          >
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-cosmic-aurora/50 shadow-xl overflow-hidden">
              {/* Click indicator */}
              <m.div
                className="absolute top-4 right-4 z-10"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-cosmic-aurora/20 rounded-full p-2 backdrop-blur-sm border border-cosmic-aurora/30">
                  <MousePointer2 className="w-4 h-4 text-cosmic-aurora" />
                </div>
              </m.div>
              
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cosmic-aurora/10 flex items-center justify-center">
                    <Circle className="w-6 h-6 text-cosmic-aurora" />
                  </div>
                  <div className="flex-1">
                    <p className="text-cosmic-aurora text-xs font-medium mb-1">New Concept</p>
                    <h3 className="text-white text-xl font-bold">State</h3>
                  </div>
                </div>
              </div>
              
              {/* Demo Module */}
              <div className="px-6 pb-4">
                <div className="bg-black/30 rounded-xl p-4 flex justify-center">
                  <StateTrafficLight />
                </div>
              </div>
              
              <div className="relative px-6 pb-6">
                <p className="text-white/80 mb-4">
                  A configuration at a specific time.
                </p>
                <div className="flex items-center gap-2 text-cosmic-aurora">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs">Saved to notebook</span>
                </div>
                <p className="text-white/60 text-xs mt-2 flex items-center gap-1 justify-center">
                  <MousePointer2 className="w-3 h-3" />
                  Click to explore
                </p>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
      
      
      

      
      {/* Learning Notebook with enhanced visibility */}
      <div className="relative">
        {/* Notebook hint notification */}
        <AnimatePresence>
          {showNotebookHint && (
            <m.div
              initial={{ opacity: 0, x: 50, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-24 right-32 z-50 pointer-events-none"
            >
              <div className="relative">
                <div className="bg-cosmic-void/95 backdrop-blur-md rounded-lg px-4 py-3 shadow-xl border border-cosmic-aurora/50" style={{ boxShadow: '0 0 30px rgba(243, 156, 18, 0.3)' }}>
                  <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-0 h-0 
                    border-t-[7px] border-t-transparent
                    border-b-[7px] border-b-transparent
                    border-l-[7px] border-l-cosmic-void/95"
                  />
                  <div className="absolute -right-[8px] top-1/2 -translate-y-1/2 w-0 h-0 
                    border-t-[8px] border-t-transparent
                    border-b-[8px] border-b-transparent
                    border-l-[8px] border-l-cosmic-aurora/30"
                  />
                  
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cosmic-aurora flex-shrink-0" />
                    <div>
                      <p className="text-cosmic-aurora font-semibold text-sm whitespace-nowrap">Concept saved!</p>
                      <p className="text-xs text-white/70 whitespace-nowrap">Check your notebook →</p>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        
        {/* Pulse overlay for notebook button */}
        <AnimatePresence>
          {notebookPulse && (
            <m.div
              className="fixed top-24 right-8 w-14 h-14 z-[59] pointer-events-none flex items-center justify-center"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-full h-full bg-cosmic-aurora/60 rounded-full blur-sm" />
            </m.div>
          )}
        </AnimatePresence>
        
        <LearningNotebook
          entries={notebookEntries}
          onAddNote={addUserNote}
          onEntryClick={handleNotebookEntryClick}
          className={notebookPulse ? "animate-pulse" : ""}
        />
      </div>
      
      {/* Concept Viewer */}
      {showConceptViewer && viewingConcept && (
        <ConceptViewer
          concept={viewingConcept}
          isOpen={showConceptViewer}
          onClose={() => {
            // Store current viewing concept before clearing
            const currentViewingConcept = viewingConcept
            
            setShowConceptViewer(false)
            setViewingConcept(null)
            
            // Restore concept card visibility when returning to the slide that originally showed it
            if (currentViewingConcept?.id === 'state' && currentPhase === 'slide-2' && currentDialogIndex === 0) {
              setShowStateCard(true)
            } else if (currentViewingConcept?.id === 'binary-value' && currentPhase === 'slide-5' && currentDialogIndex === 2) {
              setShowBooleanCard(true)
            } else if (currentViewingConcept?.id === 'binary-value' && currentPhase === 'slide-7' && currentDialogIndex === 0) {
              setShowBinaryCard(true)
            } else if (currentViewingConcept?.id === 'observation' && currentPhase === 'slide-6' && currentDialogIndex === 1) {
              setShowObservationCard(true)
            } else if (currentViewingConcept?.id === 'binary-logic' && currentPhase === 'slide-2' && currentDialogIndex === 5) {
              setShowBinaryLogicCard(true)
            }
            
            // Reset the continue timer when ConceptViewer is closed
            setResetTimerTrigger(true)
            // Reset the trigger back to false after a short delay
            setTimeout(() => setResetTimerTrigger(false), 100)
          }}
        />
      )}
      
      {/* Completion Screen */}
      {showCompletionScreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cosmic-void/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center"
          >
            <Award className="w-16 h-16 text-cosmic-aurora mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
            <p className="text-white/80 mb-6">
              You've mastered the concept of TRUE and FALSE!
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-white/60 mb-2">Stardust Earned</p>
              <p className="text-2xl font-bold text-cosmic-aurora">+{earnedStardust}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/logic-gates')}
                className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-aurora to-cosmic-starlight text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Continue to Logic Gates
              </button>
              
              <button
                onClick={() => router.push('/lessons')}
                className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                Back to Lessons
              </button>
            </div>
          </m.div>
        </div>
      )}
    </div>
  )
}

export default function StatesPage() {
  return (
    <ProtectedRoute>
      <StatesContent />
    </ProtectedRoute>
  )
}
