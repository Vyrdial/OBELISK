'use client'

import { m } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LandingBackground() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-void via-cosmic-space to-cosmic-nebula" />
      </div>
    )
  }
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep Space Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-void via-cosmic-space to-cosmic-nebula" />
      
      {/* Animated Nebula Clouds */}
      <m.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 20% 40%, rgba(233, 69, 96, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 600px 800px at 80% 60%, rgba(52, 152, 219, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 700px 500px at 60% 20%, rgba(155, 89, 182, 0.1) 0%, transparent 50%)
          `
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: 1.05,
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Cosmic Orbs */}
      {[...Array(5)].map((_, i) => (
        <m.div
          key={`orb-${i}`}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            background: `radial-gradient(circle, rgba(${233 - i * 20}, ${69 + i * 30}, ${96 + i * 40}, 0.3) 0%, transparent 70%)`,
            left: `${10 + i * 20}%`,
            top: `${15 + i * 15}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: 1.1,
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Subtle Star Field */}
      {[...Array(40)].map((_, i) => {
        // Generate deterministic values based on index
        const left = (i * 37) % 100; // Pseudo-random but deterministic
        const top = (i * 73) % 100;
        const opacity = 0.4 + ((i * 17) % 40) / 100;
        const duration = 3 + ((i * 23) % 40) / 10;
        const delay = (i * 13) % 30 / 10;
        
        return (
          <m.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              opacity,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: 1.2,
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
          />
        )
      })}

      {/* Cosmic Dust Streams */}
      {[...Array(8)].map((_, i) => {
        // Generate deterministic values based on index
        const height = 200 + ((i * 47) % 300);
        const left = (i * 43) % 100;
        const top = (i * 61) % 100;
        const rotate = (i * 83) % 360;
        const duration = 6 + ((i * 29) % 40) / 10;
        const delay = ((i * 31) % 50) / 10;
        
        return (
          <m.div
            key={`dust-${i}`}
            className="absolute opacity-10"
            style={{
              width: '2px',
              height: `${height}px`,
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)',
              left: `${left}%`,
              top: `${top}%`,
              transformOrigin: 'top center',
              rotate: `${rotate}deg`,
            }}
            animate={{
              opacity: [0, 0.2, 0],
              scale: 1,
              rotate: [0, 5, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
          />
        )
      })}

      {/* Gorgeous Rim Lighting */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, transparent 0%, rgba(233, 69, 96, 0.1) 25%, transparent 50%),
              linear-gradient(45deg, transparent 0%, rgba(52, 152, 219, 0.08) 25%, transparent 50%),
              linear-gradient(225deg, transparent 0%, rgba(155, 89, 182, 0.06) 25%, transparent 50%)
            `
          }}
        />
      </div>

      {/* Central Glow Spotlight */}
      <m.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(233, 69, 96, 0.2) 0%, rgba(52, 152, 219, 0.1) 40%, transparent 70%)'
        }}
        animate={{
          scale: 1.2,
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Cosmic Energy Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(233, 69, 96, 0.3)" />
            <stop offset="50%" stopColor="rgba(52, 152, 219, 0.3)" />
            <stop offset="100%" stopColor="rgba(155, 89, 182, 0.3)" />
          </linearGradient>
        </defs>
        
        {/* Flowing Energy Lines */}
        {[...Array(6)].map((_, i) => (
          <m.path
            key={`energy-${i}`}
            d={`M ${i * 200} 0 Q ${100 + i * 150} ${200 + i * 100} ${200 + i * 200} ${400 + i * 50} T ${400 + i * 200} ${800}`}
            stroke="url(#energyGradient)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0], 
              opacity: [0, 0.3, 0] 
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  )
}