'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, Crown, Sparkles, Bug, RefreshCw, Settings, User, Database, Star, Wand2 } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useStardustAnimation } from '@/contexts/StardustAnimationContext'

export default function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { profile, refreshProfile } = useProfile()
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [stardust, setStardust] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [customStardust, setCustomStardust] = useState('')
  const [targetUsername, setTargetUsername] = useState('')
  const [stardustParticles, setStardustParticles] = useState<Array<{ id: number; x: number; y: number; collected: boolean; value: number; size: 'small' | 'medium' | 'large' | 'huge' }>>([])
  const [isCollectingStardust, setIsCollectingStardust] = useState(false)
  const [animatingStardust, setAnimatingStardust] = useState(0) // Track stardust being animated
  const { displayStardust, setDisplayStardust } = useStardustAnimation() // Use global context

  useEffect(() => {
    if (profile) {
      setIsPremium(profile.is_premium || false)
      setStardust(profile.stardust || 0)
    }
  }, [profile])

  // Listen for "/" key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  const togglePremium = async () => {
    if (!user?.id) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: !isPremium })
        .eq('user_id', user.id)
      
      if (!error) {
        setIsPremium(!isPremium)
        await refreshProfile()
      } else {
        console.error('Supabase error:', error)
      }
    } catch (error) {
      console.error('Error updating premium status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const addStardust = async (amount: number, username?: string) => {
    setIsUpdating(true)
    try {
      // If username provided, find that user
      let targetUserId = user?.id
      if (username) {
        const { data: targetProfile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, stardust')
          .eq('username', username)
          .single()
        
        if (profileError || !targetProfile) {
          alert(`User "${username}" not found`)
          return
        }
        targetUserId = targetProfile.user_id
      }
      
      if (!targetUserId) return
      
      // Get current stardust for target user
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('stardust')
        .eq('user_id', targetUserId)
        .single()
      
      const currentStardust = currentProfile?.stardust || 0
      const newAmount = Math.max(0, currentStardust + amount)
      
      const { error } = await supabase
        .from('profiles')
        .update({ stardust: newAmount })
        .eq('user_id', targetUserId)
      
      if (!error) {
        if (targetUserId === user?.id) {
          // Only trigger animation for self
          if (amount > 0) {
            // Update the real value immediately but let animation handle display
            setStardust(newAmount)
            spawnDynamicStardust(amount)
          } else if (amount < 0) {
            // For negative amounts, just update immediately
            setStardust(newAmount)
            setDisplayStardust(newAmount)
          }
          await refreshProfile()
        } else {
          alert(`Successfully ${amount >= 0 ? 'added' : 'removed'} ${Math.abs(amount)} stardust ${username ? `to/from ${username}` : ''}`)
        }
      } else {
        console.error('Supabase error:', error)
        alert('Failed to update stardust')
      }
    } catch (error) {
      console.error('Error updating stardust:', error)
      alert('Error updating stardust')
    } finally {
      setIsUpdating(false)
    }
  }


  const clearLocalStorage = () => {
    localStorage.clear()
    alert('Local storage cleared!')
  }

  const refreshProfileData = async () => {
    setIsUpdating(true)
    try {
      await refreshProfile()
      alert('Profile refreshed!')
    } catch (error) {
      console.error('Error refreshing profile:', error)
      alert('Failed to refresh profile')
    } finally {
      setIsUpdating(false)
    }
  }

  // Dynamic stardust spawning based on amount
  const spawnDynamicStardust = (amount: number) => {
    // Close menu for better visibility
    setIsOpen(false)
    
    // Calculate particle distribution - always make it feel rewarding
    const particles: Array<{ id: number; x: number; y: number; collected: boolean; value: number; size: 'small' | 'medium' | 'large' | 'huge' }> = []
    const timestamp = Date.now()
    
    // Break down into particles that always feel abundant
    // BUT cap at 15 particles max to prevent lag
    const MAX_PARTICLES = 15
    let particleCount = 0
    let remaining = amount
    
    // Smart particle distribution - fewer particles for larger amounts
    const getParticleValue = (remaining: number, particlesLeft: number) => {
      const avgPerParticle = Math.ceil(remaining / particlesLeft)
      // Round to nice numbers
      if (avgPerParticle >= 100000) return 100000
      if (avgPerParticle >= 50000) return 50000
      if (avgPerParticle >= 10000) return 10000
      if (avgPerParticle >= 5000) return 5000
      if (avgPerParticle >= 1000) return 1000
      if (avgPerParticle >= 500) return 500
      if (avgPerParticle >= 100) return 100
      if (avgPerParticle >= 50) return 50
      if (avgPerParticle >= 25) return 25
      if (avgPerParticle >= 10) return 10
      if (avgPerParticle >= 5) return 5
      return 1
    }
    
    // Smart particle distribution with cap
    while (remaining > 0 && particleCount < MAX_PARTICLES) {
      const particlesLeft = MAX_PARTICLES - particleCount
      const value = getParticleValue(remaining, particlesLeft)
      
      // Determine size based on value
      let size: 'small' | 'medium' | 'large' | 'huge'
      if (value >= 10000) size = 'huge'
      else if (value >= 100) size = 'large'
      else if (value >= 10) size = 'medium'
      else size = 'small'
      
      particles.push({ 
        id: timestamp + particleCount++, 
        x: 0, 
        y: 0, 
        collected: false, 
        value: Math.min(value, remaining), 
        size 
      })
      
      remaining -= value
    }
    
    // If we still have remaining value (shouldn't happen often), add it to the last particle
    if (remaining > 0 && particles.length > 0) {
      particles[particles.length - 1].value += remaining
    }
    
    // For small amounts, ensure we have at least 10 visual particles
    if (amount < 10) {
      while (particles.length < 10) {
        particles.push({ 
          id: timestamp + particleCount++, 
          x: 0, 
          y: 0, 
          collected: false, 
          value: 0, 
          size: 'small' 
        })
      }
    }
    
    // Now assign positions to all particles
    particles.forEach((particle, index) => {
      const spawnPattern = Math.random()
      let x: number, y: number
      
      // Define safe spawn zone (avoiding borders and center)
      const borderMargin = 100
      const centerDeadZone = 150
      
      if (spawnPattern < 0.4) {
        // Ring pattern around center but not too close to edges
        const angle = (index / particles.length) * Math.PI * 2 + Math.random() * 0.5
        const radius = 200 + Math.random() * 150 // Controlled radius
        x = window.innerWidth / 2 + Math.cos(angle) * radius
        y = window.innerHeight / 2 + Math.sin(angle) * radius
        
        // Clamp to safe zone
        x = Math.max(borderMargin, Math.min(window.innerWidth - borderMargin, x))
        y = Math.max(borderMargin, Math.min(window.innerHeight - borderMargin, y))
      } else if (spawnPattern < 0.7) {
        // Scattered in quadrants (avoiding center and edges)
        const quadrant = Math.floor(Math.random() * 4)
        const halfWidth = window.innerWidth / 2
        const halfHeight = window.innerHeight / 2
        
        switch(quadrant) {
          case 0: // Top-left
            x = borderMargin + Math.random() * (halfWidth - centerDeadZone - borderMargin)
            y = borderMargin + Math.random() * (halfHeight - centerDeadZone - borderMargin)
            break
          case 1: // Top-right
            x = halfWidth + centerDeadZone + Math.random() * (halfWidth - centerDeadZone - borderMargin)
            y = borderMargin + Math.random() * (halfHeight - centerDeadZone - borderMargin)
            break
          case 2: // Bottom-left
            x = borderMargin + Math.random() * (halfWidth - centerDeadZone - borderMargin)
            y = halfHeight + centerDeadZone + Math.random() * (halfHeight - centerDeadZone - borderMargin)
            break
          default: // Bottom-right
            x = halfWidth + centerDeadZone + Math.random() * (halfWidth - centerDeadZone - borderMargin)
            y = halfHeight + centerDeadZone + Math.random() * (halfHeight - centerDeadZone - borderMargin)
        }
      } else {
        // Random position avoiding center and borders
        do {
          x = borderMargin + Math.random() * (window.innerWidth - 2 * borderMargin)
          y = borderMargin + Math.random() * (window.innerHeight - 2 * borderMargin)
        } while (
          Math.abs(x - window.innerWidth / 2) < centerDeadZone && 
          Math.abs(y - window.innerHeight / 2) < centerDeadZone
        )
      }
      
      particle.x = x
      particle.y = y
    })
    
    setStardustParticles(prev => [...prev, ...particles])
    setAnimatingStardust(prev => prev + amount)
    
    // Start collecting with staggered delays
    setTimeout(() => {
      collectDynamicParticles(particles)
    }, 500)
  }
  
  // Legacy animation for demo button
  const spawnStardustParticles = () => {
    if (isCollectingStardust) return
    
    // Close the debug menu to show the animation
    setIsOpen(false)
    
    setIsCollectingStardust(true)
    const particles: Array<{ id: number; x: number; y: number; collected: boolean; value: number; size: 'small' | 'medium' | 'large' | 'huge' }> = []
    const particleCount = 20
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 150 + Math.random() * 100
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      particles.push({
        id: Date.now() + i,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        collected: false,
        value: 1,
        size: 'small'
      })
    }
    
    setStardustParticles(particles)
    
    // Start collecting after a delay
    setTimeout(() => {
      collectStardustParticles(particles)
    }, 800)
  }
  
  const collectDynamicParticles = (newParticles: Array<{ id: number; x: number; y: number; collected: boolean; value: number; size: string }>) => {
    const particleIds = newParticles.map(p => p.id)
    let collectedCount = 0
    
    // Start a running counter animation immediately
    const totalValue = newParticles.reduce((sum, p) => sum + p.value, 0)
    const startValue = displayStardust
    const endValue = startValue + totalValue
    
    // Calculate realistic timing based on actual particle collection
    const particleCount = newParticles.length
    const particleTravelTime = 800 // From the transition duration in particle animation
    
    // Calculate total collection time based on actual delays
    let totalDelay = 0
    newParticles.forEach(p => {
      const delay = p.size === 'huge' ? 200 : 
                   p.size === 'large' ? 150 :
                   p.size === 'medium' ? 100 : 50
      totalDelay += delay
    })
    
    // Total time = travel time + all stagger delays + buffer
    const totalCollectionTime = particleTravelTime + totalDelay + 300 // 300ms buffer
    
    // Counter should finish just after the last particle arrives
    const animationDuration = Math.min(6000, totalCollectionTime)
    const animationStartTime = Date.now()
    let animationFrame: number
    
    // Running counter that processes the total value
    const animateRunningCounter = () => {
      const elapsed = Date.now() - animationStartTime
      const progress = Math.min(elapsed / animationDuration, 1)
      
      // Use a smoother easing that slows down more at the end
      // This is a cubic ease-out function for smoother deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = Math.floor(startValue + (totalValue * eased))
      
      // Reduce jitter as we approach the end to prevent tweaking
      let displayValue = currentValue
      if (progress < 0.75) {
        // Only add jitter in the first 75% of the animation
        const jitterScale = 1 - (progress / 0.75) // Reduce jitter gradually
        const maxJitter = Math.floor(3 * jitterScale)
        const jitter = Math.random() < 0.3 ? Math.floor(Math.random() * maxJitter) : 0
        displayValue = currentValue + jitter
      }
      
      setDisplayStardust(displayValue)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateRunningCounter)
      } else {
        // Ensure we end on the exact value
        setDisplayStardust(endValue)
        setStardust(endValue)
      }
    }
    
    // Start the counter animation
    animateRunningCounter()
    
    const collectNext = () => {
      if (collectedCount < newParticles.length) {
        const currentParticle = newParticles[collectedCount]
        
        // Mark particle as collected
        setStardustParticles(prev => prev.map(p => {
          if (p.id === currentParticle.id) {
            return { ...p, collected: true }
          }
          return p
        }))
        
        collectedCount++
        
        // Stagger collection based on particle size
        const delay = currentParticle.size === 'huge' ? 200 : 
                     currentParticle.size === 'large' ? 150 :
                     currentParticle.size === 'medium' ? 100 : 50
        setTimeout(collectNext, delay)
      } else {
        // Clean up collected particles after animation
        setTimeout(() => {
          setStardustParticles(prev => prev.filter(p => !particleIds.includes(p.id)))
          setAnimatingStardust(prev => Math.max(0, prev - totalValue))
          // Ensure we're at the final value
          cancelAnimationFrame(animationFrame)
          setDisplayStardust(endValue)
          setStardust(endValue)
        }, 1000)
      }
    }
    
    collectNext()
  }
  
  const collectStardustParticles = (particles: Array<{ id: number; x: number; y: number; collected: boolean; value: number; size: string }>) => {
    const collectionDelay = 50
    let collectedCount = 0
    
    const collectNext = () => {
      if (collectedCount < particles.length) {
        setStardustParticles(prev => prev.map((p, index) => {
          if (index === collectedCount) {
            return { ...p, collected: true }
          }
          return p
        }))
        collectedCount++
        setTimeout(collectNext, collectionDelay)
      } else {
        // Clear particles after all are collected
        setTimeout(() => {
          setStardustParticles([])
          setIsCollectingStardust(false)
        }, 1000)
      }
    }
    
    collectNext()
  }



  if (!isOpen && stardustParticles.length === 0) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Debug Panel */}
            <m.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-[450px] max-h-[80vh] overflow-y-auto glass-morphism border border-cyan-500/30 rounded-2xl shadow-2xl z-[9999]"
            >
          {/* Header */}
          <div className="bg-cyan-900/50 border-b border-cyan-500/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bug className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Developer Tools</h2>
              <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">Press / to open</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* User Info Section */}
            <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">User Information</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">User ID:</span>
                  <span className="text-cyan-400 font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Username:</span>
                  <span className="text-white">{profile?.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Premium:</span>
                  <span className={isPremium ? 'text-yellow-400' : 'text-gray-400'}>
                    {isPremium ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Stardust:</span>
                  <span className="text-yellow-300 font-mono">{displayStardust.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Premium Toggle */}
            <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Premium Status</span>
                </div>
                <button
                  onClick={togglePremium}
                  disabled={isUpdating}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPremium ? 'bg-yellow-500' : 'bg-gray-600'
                  } ${isUpdating ? 'opacity-50' : ''}`}
                >
                  <m.div
                    animate={{ x: isPremium ? 24 : 0 }}
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
              <p className="text-xs text-white/50">
                Toggle premium features for testing
              </p>
            </div>
            
            {/* Stardust Controls */}
            <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">Stardust Management</span>
              </div>
              
              {/* Target user input */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Target username (leave empty for self)"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50"
                />
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={customStardust}
                    onChange={(e) => setCustomStardust(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={() => {
                      const amount = parseInt(customStardust)
                      if (!isNaN(amount)) {
                        addStardust(amount, targetUsername || undefined)
                        setCustomStardust('')
                      }
                    }}
                    disabled={isUpdating || !customStardust}
                    className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                
                {/* Quick stardust buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => addStardust(100)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-green-400 text-xs transition-colors disabled:opacity-50"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => addStardust(1000)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-green-400 text-xs transition-colors disabled:opacity-50"
                  >
                    +1K
                  </button>
                  <button
                    onClick={() => addStardust(10000)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-400 text-xs transition-colors disabled:opacity-50"
                  >
                    +10K
                  </button>
                  <button
                    onClick={() => addStardust(-stardust)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-red-400 text-xs transition-colors disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            
            {/* Developer Actions */}
            <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">Developer Actions</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={refreshProfileData}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors disabled:opacity-50"
                >
                  <Database className="w-3 h-3" />
                  Refresh Profile
                </button>
                
                <button
                  onClick={clearLocalStorage}
                  className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded text-orange-400 text-sm transition-colors"
                >
                  Clear Storage
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded text-purple-400 text-sm transition-colors"
                >
                  Reload Page
                </button>
                
                <button
                  onClick={spawnStardustParticles}
                  disabled={isCollectingStardust}
                  className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded text-yellow-400 text-sm transition-colors disabled:opacity-50"
                >
                  <Wand2 className="w-3 h-3" />
                  Trigger Stardust Animation
                </button>
              </div>
            </div>
            
            {/* Environment Info */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-500/20">
              <div className="text-white/60 text-xs mb-2">Environment</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Route:</span>
                  <span className="text-white font-mono">{typeof window !== 'undefined' ? window.location.pathname : '/'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Mode:</span>
                  <span className="text-green-400">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Build:</span>
                  <span className="text-cyan-400">Next.js</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-black/50 border-t border-white/10 px-4 py-3">
            <p className="text-xs text-white/40 text-center">
              Developer Tools • Press <kbd className="bg-white/10 px-1 rounded">ESC</kbd> to close
            </p>
          </div>
        </m.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Stardust Particles Animation */}
      <AnimatePresence>
        {stardustParticles.map((particle) => {
          // Find the stardust icon in the navigation bar
          const stardustIcon = typeof window !== 'undefined' 
            ? document.querySelector('[data-stardust-target="true"]')
            : null
          const rect = stardustIcon?.getBoundingClientRect()
          const targetX = rect ? rect.left + rect.width / 2 : 100
          const targetY = rect ? rect.top + rect.height / 2 : 30
          
          // Size configurations based on particle value
          const sizeConfig = {
            small: { 
              star: 'w-6 h-6', 
              glow: 'w-8 h-8', 
              scale: 1, 
              sparkles: 3, 
              color: 'gold',
              glowIntensity: 0.4
            },
            medium: { 
              star: 'w-10 h-10', 
              glow: 'w-14 h-14', 
              scale: 1.3, 
              sparkles: 5, 
              color: 'sunset',
              glowIntensity: 0.5
            },
            large: { 
              star: 'w-14 h-14', 
              glow: 'w-20 h-20', 
              scale: 1.6, 
              sparkles: 7, 
              color: 'cosmic',
              glowIntensity: 0.6
            },
            huge: { 
              star: 'w-20 h-20', 
              glow: 'w-28 h-28', 
              scale: 2, 
              sparkles: 10, 
              color: 'aurora',
              glowIntensity: 0.7
            }
          }
          
          const config = sizeConfig[particle.size]
          const colorMap = {
            gold: {
              primary: 'rgb(251, 191, 36)', // Warm gold
              secondary: 'rgb(252, 211, 77)', // Bright gold
              glow: 'rgba(251, 191, 36, '
            },
            sunset: {
              primary: 'rgb(251, 146, 60)', // Orange
              secondary: 'rgb(254, 215, 170)', // Peach
              glow: 'rgba(251, 146, 60, '
            },
            cosmic: {
              primary: 'rgb(167, 139, 250)', // Purple
              secondary: 'rgb(196, 181, 253)', // Light purple
              glow: 'rgba(167, 139, 250, '
            },
            aurora: {
              primary: 'rgb(52, 211, 153)', // Emerald
              secondary: 'rgb(110, 231, 183)', // Light emerald
              glow: 'rgba(52, 211, 153, '
            }
          }
          const colors = colorMap[config.color]
          
          return (
            <m.div
              key={particle.id}
              className="fixed pointer-events-none z-[10000]"
              style={{
                left: particle.x,
                top: particle.y
              }}
              initial={{ 
                scale: 0,
                opacity: 0
              }}
              animate={particle.collected ? {
                x: targetX - particle.x,
                y: targetY - particle.y,
                scale: [config.scale, config.scale * 1.5],
                opacity: [1, 1, 0]
              } : {
                scale: [0, config.scale],
                opacity: 1,
                rotate: [0, 360]
              }}
              exit={{ 
                scale: 0,
                opacity: 0
              }}
              transition={particle.collected ? {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
              } : {
                duration: 0.5,
                scale: { type: "spring", stiffness: 260, damping: 20 },
                rotate: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Multiple glow layers for intensity */}
                <div className={`absolute ${config.glow} rounded-full blur-2xl`} 
                     style={{ 
                       background: `radial-gradient(circle, ${colors.glow}${config.glowIntensity}) 0%, transparent 70%)`,
                     }} />
                <div className={`absolute ${config.glow} rounded-full blur-xl`} 
                     style={{ 
                       background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 60%)`,
                       opacity: 0.5,
                       transform: 'scale(0.8)'
                     }} />
                <Star 
                  className={`${config.star} relative`}
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fill: colors.primary,
                    filter: `drop-shadow(0 0 ${particle.size === 'huge' ? '30px' : particle.size === 'large' ? '20px' : particle.size === 'medium' ? '15px' : '10px'} ${colors.glow}0.8))`,
                  }}
                />
                {!particle.collected && (
                  <>
                    {[...Array(config.sparkles)].map((_, i) => (
                      <m.div
                        key={`sparkle-${particle.id}-${i}`}
                        className="absolute rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          width: particle.size === 'huge' ? '4px' : particle.size === 'large' ? '3px' : '2px',
                          height: particle.size === 'huge' ? '4px' : particle.size === 'large' ? '3px' : '2px',
                          background: `radial-gradient(circle, ${colors.secondary}, ${colors.primary})`,
                          boxShadow: `0 0 6px ${colors.glow}0.8)`
                        }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * (particle.size === 'huge' ? 80 : 40)],
                          y: [0, (Math.random() - 0.5) * (particle.size === 'huge' ? 80 : 40)],
                          opacity: [0, 1, 0],
                          scale: particle.size === 'huge' ? 2 : 1.5
                        }}
                        transition={{
                          duration: particle.size === 'huge' ? 2 : 1.5,
                          repeat: Infinity,
                          delay: i * (0.5 / config.sparkles),
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </m.div>
          )
        })}
      </AnimatePresence>
    </>
  )
}