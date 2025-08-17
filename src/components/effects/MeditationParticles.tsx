'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  fadeSpeed: number
}

export default function MeditationParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with debouncing
    const resizeCanvas = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }, 100)
    }
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    window.addEventListener('resize', resizeCanvas)

    // Initialize cosmic particles
    const particleCount = 40
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.1,
      fadeSpeed: (Math.random() * 0.01) + 0.002
    }))

    // Animation loop
    const animate = () => {
      // Clear canvas with transparency instead of black overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Update opacity (breathing effect)
        particle.opacity += particle.fadeSpeed
        if (particle.opacity > 0.4 || particle.opacity < 0.1) {
          particle.fadeSpeed = -particle.fadeSpeed
        }

        // Draw cosmic particle with multiple layers
        const colors = [
          { r: 168, g: 85, b: 247 },  // Purple
          { r: 96, g: 165, b: 250 },  // Blue
          { r: 251, g: 191, b: 36 }   // Gold
        ]
        const color = colors[Math.floor(Math.random() * colors.length)]

        // Core
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 2})`
        ctx.fill()

        // Inner glow
        const innerGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        innerGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity})`)
        innerGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
        ctx.fillStyle = innerGradient
        ctx.fillRect(particle.x - particle.size * 2, particle.y - particle.size * 2, particle.size * 4, particle.size * 4)

        // Outer glow
        ctx.globalCompositeOperation = 'screen'
        const outerGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        )
        outerGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity * 0.3})`)
        outerGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
        ctx.fillStyle = outerGradient
        ctx.fillRect(particle.x - particle.size * 4, particle.y - particle.size * 4, particle.size * 8, particle.size * 8)
        ctx.globalCompositeOperation = 'source-over'
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        opacity: 0.6,
      }}
    />
  )
}