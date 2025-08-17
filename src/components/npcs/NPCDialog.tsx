'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useState, useEffect, ReactNode } from 'react'
import { Binary, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

export interface NPCDialogData {
  speaker?: string
  text: string | ReactNode
  animation?: string
}

interface NPCDialogProps {
  npcName: string
  npcImage?: string
  dialog: NPCDialogData
  onNext: () => void
  onBack?: () => void
  currentIndex?: number
  totalDialogs?: number
}

export default function NPCDialog({ 
  npcName, 
  npcImage, 
  dialog, 
  onNext, 
  onBack, 
  currentIndex = 0, 
  totalDialogs = 1 
}: NPCDialogProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [binaryMatrix, setBinaryMatrix] = useState(['0', '1', '1', '0'])
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Binary animation effect for Byte - stops immediately when typing ends
  useEffect(() => {
    if (npcName.toLowerCase() === 'byte') {
      if (isTyping) {
        setIsAnimating(true)
        const interval = setInterval(() => {
          setBinaryMatrix([
            Math.random() > 0.5 ? '1' : '0',
            Math.random() > 0.5 ? '1' : '0',
            Math.random() > 0.5 ? '1' : '0',
            Math.random() > 0.5 ? '1' : '0'
          ])
        }, 150)
        
        return () => clearInterval(interval)
      } else {
        // Stop immediately when typing ends
        setBinaryMatrix(['0', '1', '1', '0'])
        setIsAnimating(false)
      }
    }
  }, [isTyping, npcName])
  
  // Typing animation
  useEffect(() => {
    if (typeof dialog.text !== 'string') {
      setDisplayedText('')
      setIsTyping(false)
      return
    }
    
    setDisplayedText('')
    setIsTyping(true)
    let currentIndex = 0
    const text = dialog.text
    
    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 30)
    
    return () => clearInterval(typeInterval)
  }, [dialog.text])
  
  // Get NPC color based on name
  const getNPCStyle = () => {
    switch(npcName.toLowerCase()) {
      case 'byte':
        return {
          borderColor: 'border-purple-400/60',
          bgColor: 'bg-purple-500/20',
          textColor: 'text-purple-300',
          accentColor: 'from-purple-500 to-blue-500'
        }
      default:
        return {
          borderColor: 'border-blue-400/50',
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-400',
          accentColor: 'from-blue-500 to-cyan-500'
        }
    }
  }
  
  const style = getNPCStyle()
  
  return (
    <m.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-6 right-6 z-30 max-w-4xl mx-auto"
    >
      <div className={`bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-xl ${style.borderColor} border-2 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20`}>
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            {/* NPC Avatar */}
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${style.accentColor} p-0.5 shadow-lg shadow-purple-500/30`}>
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center">
                  {npcName.toLowerCase() === 'byte' ? (
                    <div className="relative">
                      {/* Subtle glow effect when speaking - stops immediately */}
                      <AnimatePresence>
                        {isAnimating && (
                          <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            exit={{ opacity: 0 }}
                            transition={{ 
                              opacity: isAnimating ? { duration: 1.5, repeat: Infinity } : { duration: 0.2 },
                              exit: { duration: 0.2 }
                            }}
                            className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full"
                          />
                        )}
                      </AnimatePresence>
                      <div className="grid grid-cols-2 gap-0 relative">
                        {binaryMatrix.map((bit, index) => (
                          <m.div
                            key={`${index}-${bit}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ 
                              scale: isAnimating ? [0.95, 1.05, 0.95] : 1, 
                              opacity: bit === '1' ? 1 : 0.6,
                              color: bit === '1' ? '#c084fc' : '#9ca3af'
                            }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ 
                              scale: isAnimating ? { duration: 2, repeat: Infinity, delay: index * 0.1 } : { duration: 0.2 },
                              opacity: { duration: 0.1 },
                              color: { duration: 0.1 }
                            }}
                            className={`text-lg md:text-xl lg:text-2xl font-mono font-bold w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 flex items-center justify-center transition-all`}
                            style={{
                              textShadow: bit === '1' && isAnimating ? '0 0 12px rgba(192, 132, 252, 0.8)' : bit === '1' ? '0 0 6px rgba(192, 132, 252, 0.4)' : 'none'
                            }}
                          >
                            {bit}
                          </m.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Binary className={`w-8 h-8 md:w-10 md:h-10 ${style.textColor}`} />
                  )}
                </div>
              </div>
              <m.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-center ${style.textColor} text-xs md:text-sm font-bold mt-2 tracking-wider uppercase`}
              >
                {npcName}
              </m.p>
            </div>
            
            {/* Dialog Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-gradient-to-r from-white/5 to-transparent rounded-2xl p-4 backdrop-blur-sm mb-3">
                <div className="text-purple-100 text-base md:text-lg leading-relaxed min-h-[4rem] font-medium">
                  {typeof dialog.text === 'string' ? displayedText : dialog.text}
                  {isTyping && (
                    <m.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="text-purple-300 ml-1"
                    >
                      |
                    </m.span>
                  )}
                </div>
              </div>
              
              {/* Progress and Navigation */}
              <div className="flex items-center justify-between h-8">
                {/* Progress Dots - Fixed height container */}
                <div className="flex gap-1 items-center h-full">
                  {Array.from({ length: totalDialogs }).map((_, index) => (
                    <m.div
                      key={index}
                      initial={{ scale: 0, width: 8 }}
                      animate={{ 
                        scale: 1,
                        width: index === currentIndex ? 32 : 8
                      }}
                      transition={{ 
                        scale: { delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 },
                        width: { type: "spring", stiffness: 300, damping: 30 }
                      }}
                      className={`h-2 rounded-full shadow-sm ${
                        index === currentIndex 
                          ? `bg-gradient-to-r ${style.accentColor} shadow-purple-500/50` 
                          : index < currentIndex 
                          ? `bg-purple-400/60` 
                          : `bg-white/20`
                      }`}
                      style={{ minWidth: 8 }}
                    />
                  ))}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex gap-2">
                  {onBack && currentIndex > 0 && (
                    <m.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onBack}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all flex items-center gap-1 text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden md:inline">Back</span>
                    </m.button>
                  )}
                  <m.button
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNext}
                    className={`px-5 py-2 bg-gradient-to-r ${style.accentColor} text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-sm shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50`}
                    disabled={isTyping}
                    style={{ opacity: isTyping ? 0.5 : 1 }}
                  >
                    <span>
                      {currentIndex < totalDialogs - 1 ? 'Next' : 'Continue'}
                    </span>
                    {currentIndex < totalDialogs - 1 ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </m.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  )
}