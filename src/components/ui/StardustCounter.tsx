'use client'

import { m, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'

interface StardustCounterProps {
  count?: number
  showAnimation?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  clickable?: boolean
}

export default function StardustCounter({ 
  count = 0, 
  showAnimation = false, 
  size = 'md',
  className = '',
  onClick,
  clickable = false
}: StardustCounterProps) {
  const sizeConfig = {
    sm: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-2 py-1' },
    md: { icon: 'w-5 h-5', text: 'text-base', padding: 'px-3 py-1.5' },
    lg: { icon: 'w-6 h-6', text: 'text-lg', padding: 'px-4 py-2' }
  }

  const config = sizeConfig[size]

  return (
    <m.div
      className={`inline-flex items-center gap-2 rounded-full ${config.padding} bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_0_15px_rgba(241,196,64,0.1)] ${
        clickable ? 'cursor-pointer hover:border-white/30 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(241,196,64,0.2)] transition-all duration-200' : ''
      } ${className}`}
      animate={showAnimation ? { 
        scale: 1.2,
        boxShadow: [
          '0 0 15px rgba(241, 196, 64, 0.4)',
          '0 0 25px rgba(241, 196, 64, 0.8)',
          '0 0 15px rgba(241, 196, 64, 0.4)'
        ]
      } : {}}
      transition={{ duration: 0.6 }}
      whileHover={clickable ? { scale: 1.05 } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      <m.div
        animate={showAnimation ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative"
      >
        <Star className={`${config.icon} text-cosmic-stardust fill-cosmic-stardust drop-shadow-[0_0_8px_rgba(241,196,64,0.5)]`} />
        <div className={`absolute inset-0 ${config.icon} bg-gradient-to-br from-cosmic-stardust/20 to-cosmic-aurora/20 blur-sm`} />
      </m.div>
      
      <AnimatePresence mode="wait">
        <m.span
          key={count}
          initial={showAnimation ? { y: -10, opacity: 0 } : undefined}
          animate={{ y: 0, opacity: 1 }}
          exit={showAnimation ? { y: 10, opacity: 0 } : undefined}
          transition={{ duration: 0.3 }}
          className={`${config.text} font-semibold text-cosmic-stardust font-mono min-w-[3ch]`}
        >
          {(count ?? 0).toLocaleString()}
        </m.span>
      </AnimatePresence>

      {/* Floating particles effect */}
      {showAnimation && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <m.div
              key={i}
              className="absolute w-1 h-1 bg-cosmic-stardust rounded-full"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 40],
                y: [0, (Math.random() - 0.5) * 40],
                opacity: [1, 0],
                scale: 1,
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </m.div>
  )
}