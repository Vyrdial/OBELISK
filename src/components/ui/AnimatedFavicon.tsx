'use client'

import { useEffect, useRef } from 'react'
import { useCosmetics } from '@/hooks/useCosmetics'
import { singularityStyles } from '@/components/ui/SingularityNode'

interface AnimatedFaviconProps {
  enabled?: boolean
}

export default function AnimatedFavicon({ enabled = true }: AnimatedFaviconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number>()
  const { equippedSingularity } = useCosmetics()

  useEffect(() => {
    if (!enabled) return

    // Create higher resolution canvas for smoother rendering
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
      canvasRef.current.width = 128  // Higher resolution for smoother rendering
      canvasRef.current.height = 128
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true,  // Better performance
      willReadFrequently: false  // Optimize for writing, not reading
    })
    if (!ctx) return

    // Enable antialiasing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Get colors from singularity style
    const singularityStyle = singularityStyles[equippedSingularity as keyof typeof singularityStyles] || singularityStyles['classic-singularity']
    
    // Extract primary color from the singularity style
    let primaryColor = '#ffffff'
    let secondaryColor = '#e0e0e0'
    let orbitColor = '#666666'
    
    // Map singularity styles to colors
    const colorMap: Record<string, { primary: string; secondary: string; orbit: string }> = {
      'classic-singularity': { primary: '#ffffff', secondary: '#e0e0e0', orbit: '#666666' },
      'cosmic-glow': { primary: '#a78bfa', secondary: '#c084fc', orbit: '#ec4899' },
      'stellar-core': { primary: '#facc15', secondary: '#fde047', orbit: '#fb923c' },
      'void-essence': { primary: '#581c87', secondary: '#9333ea', orbit: '#c084fc' },
      'golden-majesty': { primary: '#eab308', secondary: '#fde047', orbit: '#f59e0b' },
      'crystal-essence': { primary: '#22d3ee', secondary: '#67e8f9', orbit: '#06b6d4' },
      'plasma-storm': { primary: '#ec4899', secondary: '#f9a8d4', orbit: '#db2777' },
      'aurora': { primary: '#4ade80', secondary: '#60a5fa', orbit: '#a78bfa' },
      'lightning': { primary: '#93c5fd', secondary: '#ffffff', orbit: '#60a5fa' },
      'flame': { primary: '#dc2626', secondary: '#f97316', orbit: '#facc15' },
      'frost': { primary: '#bfdbfe', secondary: '#22d3ee', orbit: '#ffffff' },
      'quantum-nexus': { primary: '#67e8f9', secondary: '#60a5fa', orbit: '#9333ea' },
      'temporal-vortex': { primary: '#312e81', secondary: '#7c3aed', orbit: '#ec4899' },
      'cosmic-forge': { primary: '#fb923c', secondary: '#ef4444', orbit: '#fde047' },
      'shadow-monarch': { primary: '#111827', secondary: '#000000', orbit: '#7c3aed' },
      'nebula-heart': { primary: '#a78bfa', secondary: '#f9a8d4', orbit: '#60a5fa' }
    }

    const colors = colorMap[equippedSingularity] || colorMap['classic-singularity']
    primaryColor = colors.primary
    secondaryColor = colors.secondary
    orbitColor = colors.orbit

    let startTime = performance.now()
    let lastFrameTime = startTime
    const numDots = 3
    const centerX = 64  // Adjusted for higher resolution canvas
    const centerY = 64
    const mainRadius = 32  // Scale up for higher resolution
    const orbitRadius = 48
    const dotRadius = 7
    
    // Pre-calculate favicon link to avoid DOM queries every frame
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.type = 'image/png'
      link.rel = 'icon'
      document.getElementsByTagName('head')[0].appendChild(link)
    }
    
    // Throttle favicon updates to 24fps for smoothness
    let lastFaviconUpdate = 0
    const faviconUpdateInterval = 1000 / 24  // 24 FPS for favicon updates as requested

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - startTime) * 0.001  // Convert to seconds for smoother animation
      
      // Clear canvas with subpixel precision
      ctx.clearRect(0, 0, 64, 64)
      
      // Save context state for cleaner transformations
      ctx.save()
      
      // Draw main singularity circle with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, mainRadius)
      gradient.addColorStop(0, primaryColor)
      gradient.addColorStop(0.5, secondaryColor)
      gradient.addColorStop(0.8, primaryColor + 'CC')
      gradient.addColorStop(1, primaryColor + '00')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Add subtle pulse effect
      const pulseScale = 1 + Math.sin(deltaTime * 2) * 0.05
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(pulseScale, pulseScale)
      ctx.translate(-centerX, -centerY)
      
      // Inner glow with subtle animation
      ctx.shadowBlur = 15
      ctx.shadowColor = primaryColor
      ctx.beginPath()
      ctx.arc(centerX, centerY, mainRadius * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = primaryColor + '30'
      ctx.fill()
      ctx.restore()
      
      ctx.shadowBlur = 0
      
      // Draw orbiting dots with smooth motion blur
      for (let i = 0; i < numDots; i++) {
        const angle = (deltaTime * 0.8) + (i * Math.PI * 2 / numDots)  // Smoother rotation speed
        const x = centerX + Math.cos(angle) * orbitRadius
        const y = centerY + Math.sin(angle) * orbitRadius
        
        // Motion blur trail (draw multiple trailing dots)
        for (let j = 5; j > 0; j--) {
          const trailAngle = angle - (j * 0.05)
          const trailX = centerX + Math.cos(trailAngle) * orbitRadius
          const trailY = centerY + Math.sin(trailAngle) * orbitRadius
          const trailAlpha = (1 - j / 5) * 0.3
          
          ctx.fillStyle = orbitColor + Math.floor(trailAlpha * 255).toString(16).padStart(2, '0')
          ctx.beginPath()
          ctx.arc(trailX, trailY, dotRadius * (1 - j * 0.1), 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Main dot with glow
        const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, dotRadius * 1.5)
        dotGradient.addColorStop(0, orbitColor)
        dotGradient.addColorStop(0.7, orbitColor + 'AA')
        dotGradient.addColorStop(1, orbitColor + '00')
        
        ctx.fillStyle = dotGradient
        ctx.beginPath()
        ctx.arc(x, y, dotRadius * 1.5, 0, Math.PI * 2)
        ctx.fill()
        
        // Solid center dot
        ctx.fillStyle = orbitColor
        ctx.beginPath()
        ctx.arc(x, y, dotRadius * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.restore()
      
      // Update favicon at controlled rate
      if (currentTime - lastFaviconUpdate > faviconUpdateInterval) {
        const faviconUrl = canvas.toDataURL('image/png')
        link.href = faviconUrl
        lastFaviconUpdate = currentTime
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate(performance.now())
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled, equippedSingularity])

  return null
}