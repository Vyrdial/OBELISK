'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Sparkles, Lightbulb, RefreshCw } from 'lucide-react'
import { DisplayNameValidation } from '@/types/displayName'
import { DisplayNameSystem } from '@/utils/displayNameSystem'

interface DisplayNameInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  onValidationChange?: (validation: DisplayNameValidation) => void
  placeholder?: string
  disabled?: boolean
  showInspiration?: boolean
}

export default function DisplayNameInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter your identity...",
  disabled = false,
  showInspiration = true
}: DisplayNameInputProps) {
  const [validation, setValidation] = useState<DisplayNameValidation>({
    isValid: false,
    isAvailable: false,
    isChecking: false,
    message: '',
    suggestions: [],
    type: 'info'
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inspiration, setInspiration] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastValidationRef = useRef<string>('')

  // Load initial inspiration
  useEffect(() => {
    if (showInspiration) {
      setInspiration(DisplayNameSystem.getCosmicInspiration())
    }
  }, [showInspiration])

  // Debounced validation
  const validateName = useCallback(async (name: string) => {
    if (name === lastValidationRef.current) return
    
    lastValidationRef.current = name
    setIsTyping(false)
    
    if (!name.trim()) {
      const emptyValidation: DisplayNameValidation = {
        isValid: false,
        isAvailable: false,
        isChecking: false,
        message: 'Your identity awaits...',
        suggestions: [],
        type: 'info'
      }
      setValidation(emptyValidation)
      onValidationChange?.(emptyValidation)
      return
    }

    // Set checking state
    const checkingValidation: DisplayNameValidation = {
      isValid: false,
      isAvailable: false,
      isChecking: true,
      message: 'Consulting the cosmic registry...',
      suggestions: [],
      type: 'info'
    }
    setValidation(checkingValidation)
    onValidationChange?.(checkingValidation)

    try {
      const result = await DisplayNameSystem.validateDisplayName(name)
      setValidation(result)
      onValidationChange?.(result)
      onChange(name, result.isValid && result.isAvailable)
      
      // Show suggestions if name is not available
      setShowSuggestions(result.suggestions.length > 0)
    } catch {
      const errorValidation: DisplayNameValidation = {
        isValid: false,
        isAvailable: false,
        isChecking: false,
        message: 'Unable to validate name. Please try again.',
        suggestions: [],
        type: 'error'
      }
      setValidation(errorValidation)
      onValidationChange?.(errorValidation)
    }
  }, [onChange, onValidationChange])

  // Handle input changes with debouncing
  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue, false) // Immediately update parent with invalid state
    setIsTyping(true)
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout for validation
    timeoutRef.current = setTimeout(() => {
      validateName(newValue)
    }, 500) // 500ms delay
  }, [onChange, validateName])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion, false)
    setShowSuggestions(false)
    validateName(suggestion)
  }

  const handleInspirationClick = (inspiration: string) => {
    onChange(inspiration, false)
    validateName(inspiration)
  }

  const refreshInspiration = () => {
    setInspiration(DisplayNameSystem.getCosmicInspiration())
  }

  const getStatusIcon = () => {
    if (isTyping || validation.isChecking) {
      return <Clock className="w-5 h-5 text-cosmic-stardust animate-pulse" />
    }
    
    if (validation.isValid && validation.isAvailable) {
      return <CheckCircle className="w-5 h-5 text-green-400" />
    }
    
    if (value.trim() && (!validation.isValid || !validation.isAvailable)) {
      return <XCircle className="w-5 h-5 text-red-400" />
    }
    
    return <Sparkles className="w-5 h-5 text-cosmic-starlight/50" />
  }

  const getStatusColor = () => {
    if (isTyping || validation.isChecking) return 'border-cosmic-stardust/50'
    if (validation.isValid && validation.isAvailable) return 'border-green-400/50'
    if (value.trim() && (!validation.isValid || !validation.isAvailable)) return 'border-red-400/50'
    return 'border-white/20'
  }

  return (
    <div className="space-y-4">
      {/* Main Input */}
      <div className="relative">
        <m.input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full p-4 pr-12 rounded-xl bg-white/5 border-2 text-white placeholder-white/40 
            focus:bg-white/10 transition-all duration-75 duration-300 cosmic-focus outline-none
            ${getStatusColor()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          whileFocus={{ scale: 1.02 }}
          maxLength={32}
        />
        
        {/* Status Icon */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Validation Message */}
      <AnimatePresence mode="wait">
        {validation.message && (
          <m.div
            key={validation.message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`
              text-sm p-3 rounded-lg border backdrop-blur-sm
              ${validation.type === 'success' ? 'text-green-300 bg-green-500/10 border-green-500/30' : ''}
              ${validation.type === 'error' ? 'text-red-300 bg-red-500/10 border-red-500/30' : ''}
              ${validation.type === 'warning' ? 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30' : ''}
              ${validation.type === 'info' ? 'text-blue-300 bg-blue-500/10 border-blue-500/30' : ''}
            `}
          >
            {validation.message}
          </m.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && validation.suggestions.length > 0 && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Lightbulb className="w-4 h-4 text-cosmic-starlight" />
              <span>Cosmic alternatives that resonate with your essence:</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {validation.suggestions.map((suggestion, index) => (
                <m.button
                  key={suggestion}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 rounded-lg bg-white/5 border border-white/20 hover:border-cosmic-starlight/50 hover:bg-white/10 transition-all duration-75 duration-200 text-left group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white group-hover:text-cosmic-starlight transition-colors duration-75">
                      {suggestion}
                    </span>
                    <Sparkles className="w-4 h-4 text-cosmic-starlight/50 group-hover:text-cosmic-starlight transition-colors duration-75" />
                  </div>
                </m.button>
              ))}
            </div>

            <m.button
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-white/50 hover:text-white/70 transition-colors duration-75"
              whileHover={{ scale: 1.05 }}
            >
              Hide suggestions
            </m.button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Cosmic Inspiration */}
      {showInspiration && inspiration.length > 0 && !value.trim() && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Sparkles className="w-4 h-4 text-cosmic-starlight" />
              <span>Cosmic inspiration:</span>
            </div>
            <m.button
              onClick={refreshInspiration}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-75"
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw className="w-4 h-4 text-white/50" />
            </m.button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {inspiration.map((name, index) => (
              <m.button
                key={name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleInspirationClick(name)}
                className="p-2 rounded-lg bg-gradient-to-r from-cosmic-starlight/10 to-cosmic-aurora/10 border border-cosmic-starlight/20 hover:border-cosmic-starlight/50 hover:from-cosmic-starlight/20 hover:to-cosmic-aurora/20 transition-all duration-75 duration-200 text-xs group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white/80 group-hover:text-white transition-colors duration-75">
                  {name}
                </span>
              </m.button>
            ))}
          </div>
        </m.div>
      )}

      {/* Character Counter */}
      <div className="flex justify-between items-center text-xs text-white/50">
        <span>Cosmic identities must be unique and memorable</span>
        <span className={`${value.length > 24 ? 'text-yellow-400' : ''} ${value.length > 30 ? 'text-red-400' : ''}`}>
          {value.length}/32
        </span>
      </div>
    </div>
  )
}