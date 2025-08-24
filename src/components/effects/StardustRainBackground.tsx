'use client'

import { useEffect, useRef } from 'react'
import { m } from 'framer-motion'

interface StardustParticle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  hue: number
  rotation: number
  rotationSpeed: number
  shimmerPhase: number
  type: 'star' | 'sparkle' | 'orb'
}

export default function StardustRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<StardustParticle[]>([])
  const animationFrame = useRef<number>()
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Track mouse for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Initialize particles - REDUCED COUNT
    const particleCount = 40 // Reduced from 120
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height, // Start above screen
        size: Math.random() * 3 + 1, // Slightly smaller
        speed: Math.random() * 1.5 + 0.5, // Slightly slower
        opacity: Math.random() * 0.6 + 0.4, // More visible since fewer
        hue: Math.random() * 60 + 30, // Golden hues (30-90)
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01, // Slower rotation
        shimmerPhase: Math.random() * Math.PI * 2,
        type: Math.random() < 0.7 ? 'orb' : Math.random() < 0.9 ? 'sparkle' : 'star' // More simple orbs
      })
    }

    // Draw a star shape
    const drawStar = (x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      
      const spikes = 4
      const outerRadius = size
      const innerRadius = size * 0.4
      
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i / (spikes * 2)) * Math.PI * 2
        const px = Math.cos(angle) * radius
        const py = Math.sin(angle) * radius
        
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)' // More clearing for performance
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((particle) => {
        // Update position
        particle.y += particle.speed
        particle.x += Math.sin(particle.shimmerPhase) * 0.3 // Less horizontal movement
        particle.rotation += particle.rotationSpeed
        particle.shimmerPhase += 0.01 // Slower shimmer

        // Reset if off screen
        if (particle.y > canvas.height + 20) {
          particle.y = -20
          particle.x = Math.random() * canvas.width
          particle.hue = Math.random() * 60 + 30
        }

        // REMOVED mouse interaction for performance

        // Simple color without complex gradients
        const color = `hsla(${particle.hue}, 100%, 60%, ${particle.opacity})`
        ctx.fillStyle = color

        // Draw based on type - SIMPLIFIED
        if (particle.type === 'star') {
          drawStar(particle.x, particle.y, particle.size, particle.rotation)
          ctx.fill()
        } else if (particle.type === 'sparkle') {
          // Simple cross
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(particle.x - particle.size, particle.y)
          ctx.lineTo(particle.x + particle.size, particle.y)
          ctx.moveTo(particle.x, particle.y - particle.size)
          ctx.lineTo(particle.x, particle.y + particle.size)
          ctx.stroke()
        } else {
          // Simple circle for orb
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationFrame.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [])

  return (
    <>
      {/* Canvas for particle animation */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ 
          background: 'linear-gradient(to bottom, #1a1a2e 0%, #0f0f23 50%, #16213e 100%)',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Additional ambient glow layers */}
      <div className="fixed inset-0 pointer-events-none">
        <m.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <m.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 70%, rgba(252, 211, 77, 0.15) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <m.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(254, 215, 170, 0.1) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
    </>
  )
}