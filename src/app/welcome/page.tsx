'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, BookOpen, Users, Star, Zap, Brain, Rocket } from 'lucide-react'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'

// Cosmic taglines that rotate
const taglines = [
  "Where Learning Becomes an Adventure",
  "Transform Knowledge into Understanding",
  "Your Journey Through the Cosmos of Wisdom",
  "Education Without the Confusion",
  "Clear Concepts, Cosmic Clarity",
  "Learn. Understand. Transcend."
]

// Feature cards data
const features = [
  {
    icon: Brain,
    title: "Systems Thinking",
    description: "Master the art of seeing connections and patterns in everything",
    color: "purple-400"
  },
  {
    icon: Sparkles,
    title: "Gamified Learning",
    description: "Earn Stardust, customize your Singularity, and unlock cosmic rewards",
    color: "indigo-400"
  },
  {
    icon: Users,
    title: "AI Companions",
    description: "Learn alongside AI mentors who guide your journey",
    color: "violet-400"
  },
  {
    icon: Zap,
    title: "No Jargon Zone",
    description: "Complex concepts explained with clarity and memorable metaphors",
    color: "blue-400"
  }
]

export default function WelcomePage() {
  const router = useRouter()
  const [currentTagline, setCurrentTagline] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Cosmic Background with shooting stars - matching home page */}
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <CosmicBackground 
          intensity="low" 
          enableMeteors={false}
          enableNebula={false}
          enablePlanets={false}
        />
      </ClientOnly>
      
      {/* Subtle dark gradient overlay with purple tint for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-indigo-950/30 pointer-events-none z-10" />

      {/* Hero Section */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-8">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white"
            >
              OBELISK
            </m.div>
            
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={() => router.push('/auth/login')}
                className="px-6 py-2 text-white/80 hover:text-white transition-colors duration-[30ms]"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-[30ms]"
              >
                Get Started
              </button>
            </m.div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Floating Singularity */}
            <m.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative mx-auto mb-6 w-40 h-40"
            >
              {/* Outer glow ring */}
              <m.div
                animate={{ 
                  scale: 1.2,
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-indigo-400/20 to-violet-400/20 rounded-full blur-2xl"
              />
              
              {/* Central Singularity with pulse */}
              <div className="relative w-full h-full flex items-center justify-center">
                <m.div
                  animate={{ 
                    scale: 1.05,
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 bg-white rounded-full shadow-2xl relative overflow-hidden"
                >
                  <m.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-indigo-400/10 to-violet-400/5"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-2 bg-white rounded-full" />
                </m.div>
              </div>

              {/* Pseudo-celestial orbital bodies with elliptical paths */}
              {/* Outer elliptical orbit - slower, more elongated */}
              <m.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 23, // Prime number for less regular patterns
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {/* First star - largest, brightest */}
                <m.div
                  className="absolute w-full h-full"
                  animate={{ 
                    rotateX: [0, 15, 0, -15, 0], // Slight orbital plane wobble
                    rotateY: [0, 10, 0, -10, 0]
                  }}
                  transition={{ 
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <m.div
                    className="absolute w-3.5 h-3.5 bg-gradient-to-br from-white to-blue-200 rounded-full"
                    animate={{
                      opacity: [0.6, 1, 0.7, 1, 0.6],
                      scale: [1, 1.3, 1.1, 1.2, 1],
                      x: [0, 15, 0, -15, 0], // Elliptical motion on X
                      y: [0, -8, 0, 8, 0], // Elliptical motion on Y
                      boxShadow: [
                        '0 0 10px rgba(255,255,255,0.5)',
                        '0 0 20px rgba(255,255,255,0.8)',
                        '0 0 15px rgba(255,255,255,0.6)',
                        '0 0 20px rgba(255,255,255,0.8)',
                        '0 0 10px rgba(255,255,255,0.5)'
                      ]
                    }}
                    transition={{
                      duration: 5.3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      left: '50%',
                      top: '5px',
                      transform: 'translateX(-50%)',
                      filter: 'blur(0.3px)'
                    }}
                  />
                </m.div>
              </m.div>

              {/* Middle elliptical orbit - medium speed, tilted */}
              <m.div
                className="absolute inset-0"
                style={{ transform: 'rotateZ(25deg)' }} // Tilted orbital plane
                animate={{ rotate: -360 }}
                transition={{ 
                  duration: 17, // Different prime for variety
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {[0, 137].map((angle, i) => ( // Golden angle for natural distribution
                  <m.div
                    key={`mid-${i}`}
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${angle}deg)` }}
                    animate={{
                      rotateX: [0, 20, 0, -20, 0],
                    }}
                    transition={{
                      duration: 11,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 2.7
                    }}
                  >
                    <m.div
                      className="absolute w-2.5 h-2.5 bg-gradient-to-br from-white to-purple-200 rounded-full"
                      animate={{
                        opacity: [0.4, 0.9, 0.5, 0.8, 0.4],
                        scale: [0.9, 1.2, 1, 1.1, 0.9],
                        x: [0, 10, 0, -10, 0],
                        y: [0, -5, 0, 5, 0],
                        boxShadow: [
                          '0 0 8px rgba(168,85,247,0.4)',
                          '0 0 16px rgba(168,85,247,0.7)',
                          '0 0 10px rgba(168,85,247,0.5)',
                          '0 0 14px rgba(168,85,247,0.6)',
                          '0 0 8px rgba(168,85,247,0.4)'
                        ]
                      }}
                      transition={{
                        duration: 4.1,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.7
                      }}
                      style={{
                        left: '50%',
                        top: '15px',
                        transform: 'translateX(-50%)',
                        filter: 'blur(0.2px)'
                      }}
                    />
                  </m.div>
                ))}
              </m.div>

              {/* Inner elliptical orbit - fastest, most eccentric */}
              <m.div
                className="absolute inset-0"
                style={{ transform: 'rotateZ(-15deg) rotateX(10deg)' }} // Double tilt
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 13, // Fastest orbit
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {[0, 90, 180, 270].map((angle, i) => (
                  <m.div
                    key={`inner-${i}`}
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${angle + i * 7}deg)` }} // Irregular spacing
                  >
                    <m.div
                      className="absolute w-1.5 h-1.5 bg-gradient-to-br from-white/90 to-indigo-300/80 rounded-full"
                      animate={{
                        opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
                        scale: [0.8, 1, 0.9, 1.1, 0.8],
                        x: [0, 6 + i * 2, 0, -6 - i * 2, 0], // Varying ellipse per star
                        y: [0, -3 - i, 0, 3 + i, 0],
                        boxShadow: [
                          '0 0 4px rgba(99,102,241,0.3)',
                          '0 0 8px rgba(99,102,241,0.6)',
                          '0 0 5px rgba(99,102,241,0.4)',
                          '0 0 9px rgba(99,102,241,0.7)',
                          '0 0 4px rgba(99,102,241,0.3)'
                        ]
                      }}
                      transition={{
                        duration: 2.9 + i * 0.3, // Varying speeds
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4
                      }}
                      style={{
                        left: '50%',
                        top: `${22 + i * 2}px`, // Varying orbital radius
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </m.div>
                ))}
              </m.div>

              {/* Rogue comet - highly eccentric orbit */}
              <m.div
                className="absolute inset-0"
                style={{ transform: 'rotateZ(45deg) rotateY(30deg)' }}
                animate={{ rotate: -360 }}
                transition={{ 
                  duration: 31, // Very slow, prime number
                  repeat: Infinity, 
                  ease: [0.2, 0.1, 0.8, 0.9] // Custom bezier for eccentric motion
                }}
              >
                <m.div
                  className="absolute w-2 h-2 bg-gradient-to-r from-cyan-300 to-white rounded-full"
                  animate={{
                    opacity: [0.2, 0.3, 1, 0.3, 0.2],
                    scale: [0.5, 0.6, 1.5, 0.6, 0.5],
                    x: [0, 50, 0, -50, 0], // Very elongated ellipse
                    y: [0, -10, 0, 10, 0],
                    boxShadow: [
                      '0 0 2px rgba(6,182,212,0.2)',
                      '0 0 4px rgba(6,182,212,0.3)',
                      '0 0 20px rgba(6,182,212,0.9), 0 0 40px rgba(6,182,212,0.5)',
                      '0 0 4px rgba(6,182,212,0.3)',
                      '0 0 2px rgba(6,182,212,0.2)'
                    ]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    left: '50%',
                    top: '8px',
                    transform: 'translateX(-50%)',
                    filter: 'blur(0.5px)'
                  }}
                >
                  {/* Comet tail */}
                  <m.div
                    className="absolute w-8 h-0.5 bg-gradient-to-r from-cyan-300/50 to-transparent"
                    animate={{
                      opacity: [0, 0, 0.8, 0, 0],
                      scaleX: [0, 0.5, 1.5, 0.5, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      left: '100%',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(180deg)',
                      transformOrigin: 'left center'
                    }}
                  />
                </m.div>
              </m.div>
            </m.div>

            {/* Main Heading */}
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 cosmic-heading"
            >
              Welcome to{' '}
              <span className="cosmic-text-gradient">OBELISK</span>
            </m.h1>

            {/* Rotating Tagline */}
            <div className="h-8 mb-8">
              <AnimatePresence mode="wait">
                <m.p
                  key={currentTagline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl md:text-2xl text-white/80"
                >
                  {taglines[currentTagline]}
                </m.p>
              </AnimatePresence>
            </div>

            {/* CTA Buttons */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <button
                onClick={() => router.push('/auth/signup')}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-[30ms]"
              >
                <span className="flex items-center gap-2">
                  Start Your Journey
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-[30ms]" />
                </span>
              </button>
              
              <button
                onClick={() => router.push('/auth/login')}
                className="px-8 py-4 glass-morphism border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-[30ms]"
              >
                I Have an Account
              </button>
            </m.div>

            {/* Feature Cards */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {features.map((feature, index) => (
                <m.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 glass-morphism rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-[30ms]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color.replace('-400', '-500')}/20 flex items-center justify-center mb-4 mx-auto`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </m.div>
              ))}
            </m.div>
          </div>
        </main>

        {/* Bottom decoration */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
        />
      </div>
    </div>
  )
}