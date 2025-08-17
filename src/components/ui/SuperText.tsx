'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

interface SuperTextProps {
  children: React.ReactNode
  title: string
  explanation: string
  color?: 'purple' | 'blue' | 'green' | 'pink' | 'yellow' | 'cyan'
}

export default function SuperText({ 
  children, 
  title, 
  explanation,
  color = 'purple' 
}: SuperTextProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  const colorClasses = {
    purple: {
      text: 'text-purple-300',
      glow: 'drop-shadow-[0_0_8px_rgba(196,181,253,0.6)]',
      hover: 'hover:drop-shadow-[0_0_12px_rgba(196,181,253,0.8)] hover:text-purple-200',
      bg: 'from-purple-600/20 to-purple-500/10',
      border: 'border-purple-400/40'
    },
    blue: {
      text: 'text-blue-300',
      glow: 'drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]',
      hover: 'hover:drop-shadow-[0_0_12px_rgba(147,197,253,0.8)] hover:text-blue-200',
      bg: 'from-blue-600/20 to-blue-500/10',
      border: 'border-blue-400/40'
    },
    green: {
      text: 'text-green-300',
      glow: 'drop-shadow-[0_0_8px_rgba(134,239,172,0.6)]',
      hover: 'hover:drop-shadow-[0_0_12px_rgba(134,239,172,0.8)] hover:text-green-200',
      bg: 'from-green-600/20 to-green-500/10',
      border: 'border-green-400/40'
    },
    pink: {
      text: 'text-pink-300',
      glow: 'drop-shadow-[0_0_8px_rgba(248,180,217,0.6)]',
      hover: 'hover:drop-shadow-[0_0_12px_rgba(248,180,217,0.8)] hover:text-pink-200',
      bg: 'from-pink-600/20 to-pink-500/10',
      border: 'border-pink-400/40'
    },
    yellow: {
      text: 'text-yellow-300',
      glow: 'drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]',
      hover: 'hover:drop-shadow-[0_0_12px_rgba(253,224,71,0.8)] hover:text-yellow-200',
      bg: 'from-yellow-600/20 to-yellow-500/10',
      border: 'border-yellow-400/40'
    },
    cyan: {
      text: 'text-cyan-300',
      glow: 'drop-shadow-[0_0_8px_rgba(103,232,249,0.6)]',
      hover: 'hover:drop-shadow-[0_0_12px_rgba(103,232,249,0.8)] hover:text-cyan-200',
      bg: 'from-cyan-600/20 to-cyan-500/10',
      border: 'border-cyan-400/40'
    }
  }

  const colors = colorClasses[color]

  return (
    <>
      <span
        className={`
          inline-block cursor-pointer font-bold
          ${colors.text} ${colors.glow} ${colors.hover}
          transition-all duration-300 
          animate-pulse-subtle
          relative
        `}
        onClick={() => setShowExplanation(true)}
      >
        {children}
        <m.div
          className={`absolute -inset-1 bg-gradient-to-r ${colors.bg} opacity-30 blur-sm -z-10 rounded`}
          animate={{
            scale: 1.1,
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </span>

      <AnimatePresence>
        {showExplanation && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setShowExplanation(false)}
            />

            {/* Explanation Window - centered */}
            <div
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4"
            >
              <m.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full"
              >
              <div className={`
                rounded-xl p-4 
                bg-gradient-to-br ${colors.bg}
                border ${colors.border}
                backdrop-blur-xl
                relative
              `}>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
                
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-white" />
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>

                <p className="text-white/80 text-sm leading-relaxed">
                  {explanation}
                </p>
              </div>
              </m.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </>
  )
}