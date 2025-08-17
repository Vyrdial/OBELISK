'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m } from 'framer-motion'
import * as THREE from 'three'
import NPCDialog from '@/components/npcs/NPCDialog'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import AchievementToast, { achievements, Achievement } from '@/components/effects/AchievementToast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LearningNotebook, { NotebookEntry } from '@/components/lesson/LearningNotebook'
import ConceptViewer, { Concept, ConceptProperty } from '@/components/lesson/ConceptViewer'
import { Award, Clock, BookOpen, Brain, ArrowRight, Network, Layers, Zap, Sparkles, X } from 'lucide-react'

// ===== INTERACTIVE COMPONENTS =====

// System Node Component
function SystemNode({ 
  x, 
  y, 
  label, 
  isActive = false, 
  connections = [],
  onClick,
  pulseDelay = 0
}: { 
  x: number, 
  y: number, 
  label: string, 
  isActive?: boolean,
  connections?: { x: number, y: number }[],
  onClick?: () => void,
  pulseDelay?: number
}) {
  return (
    <>
      {/* Connections */}
      {connections.map((conn, i) => (
        <m.line
          key={i}
          x1={x}
          y1={y}
          x2={conn.x}
          y2={conn.y}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: isActive ? 1 : 0,
            opacity: isActive ? [0.2, 0.6, 0.2] : 0.2
          }}
          transition={{ 
            pathLength: { duration: 1, delay: pulseDelay },
            opacity: { duration: 2, repeat: Infinity, delay: pulseDelay }
          }}
        />
      ))}
      
      {/* Node */}
      <m.g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <m.circle
          cx={x}
          cy={y}
          r="30"
          fill={isActive ? "rgba(139, 92, 246, 0.3)" : "rgba(255,255,255,0.1)"}
          stroke={isActive ? "rgba(139, 92, 246, 0.8)" : "rgba(255,255,255,0.3)"}
          strokeWidth="2"
          animate={isActive ? {
            scale: 1.1,
            opacity: [0.8, 1, 0.8]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, delay: pulseDelay }}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="12"
          fontWeight="500"
        >
          {label}
        </text>
      </m.g>
    </>
  )
}

// Feedback Loop Visualization
function FeedbackLoop({ isActive = false }: { isActive?: boolean }) {
  const pathData = "M 100 150 Q 200 50, 300 150 T 500 150"
  const returnPath = "M 500 150 Q 400 250, 300 150 T 100 150"
  
  return (
    <svg width="600" height="300" className="mx-auto">
      {/* Forward path */}
      <m.path
        d={pathData}
        fill="none"
        stroke="rgba(139, 92, 246, 0.5)"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* Return path */}
      <m.path
        d={returnPath}
        fill="none"
        stroke="rgba(59, 130, 246, 0.5)"
        strokeWidth="3"
        strokeDasharray="5,5"
        initial={{ pathLength: 0 }}
        animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
      />
      
      {/* Nodes */}
      <m.circle cx="100" cy="150" r="20" fill="rgba(139, 92, 246, 0.8)" />
      <m.circle cx="300" cy="150" r="20" fill="rgba(99, 102, 241, 0.8)" />
      <m.circle cx="500" cy="150" r="20" fill="rgba(59, 130, 246, 0.8)" />
      
      {/* Labels */}
      <text x="100" y="190" textAnchor="middle" fill="white" fontSize="14">Input</text>
      <text x="300" y="190" textAnchor="middle" fill="white" fontSize="14">Process</text>
      <text x="500" y="190" textAnchor="middle" fill="white" fontSize="14">Output</text>
      
      {/* Feedback label */}
      {isActive && (
        <m.text
          x="300"
          y="230"
          textAnchor="middle"
          fill="rgba(59, 130, 246, 0.8)"
          fontSize="12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Feedback
        </m.text>
      )}
    </svg>
  )
}

// Emergence Visualization
function EmergenceVisualization({ stage = 0 }: { stage: number }) {
  const nodes = Array.from({ length: 16 }, (_, i) => ({
    x: 150 + (i % 4) * 100,
    y: 100 + Math.floor(i / 4) * 100,
    id: i
  }))
  
  return (
    <svg width="600" height="500" className="mx-auto">
      {/* Individual elements */}
      {nodes.map((node, i) => (
        <m.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="10"
          fill="rgba(255,255,255,0.5)"
          animate={stage >= 1 ? {
            x: stage >= 2 ? [0, Math.sin(i * 0.5) * 20, 0] : 0,
            y: stage >= 2 ? [0, Math.cos(i * 0.5) * 20, 0] : 0,
            scale: stage >= 3 ? [1, 1.2, 1] : 1,
            fill: stage >= 3 ? ["rgba(255,255,255,0.5)", "rgba(139, 92, 246, 0.8)", "rgba(255,255,255,0.5)"] : "rgba(255,255,255,0.5)"
          } : {}}
          transition={{ 
            duration: 3, 
            repeat: stage >= 2 ? Infinity : 0,
            delay: i * 0.1 
          }}
        />
      ))}
      
      {/* Connections appear in stage 2 */}
      {stage >= 2 && nodes.map((node, i) => {
        const nearbyNodes = nodes.filter((n, j) => {
          const dist = Math.sqrt(Math.pow(n.x - node.x, 2) + Math.pow(n.y - node.y, 2))
          return j !== i && dist < 150
        })
        
        return nearbyNodes.map((nearby, j) => (
          <m.line
            key={`${i}-${j}`}
            x1={node.x}
            y1={node.y}
            x2={nearby.x}
            y2={nearby.y}
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
          />
        ))
      })}
      
      {/* Emergent pattern in stage 3 */}
      {stage >= 3 && (
        <m.circle
          cx="300"
          cy="250"
          r="150"
          fill="none"
          stroke="rgba(139, 92, 246, 0.5)"
          strokeWidth="3"
          strokeDasharray="10,5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1.2,
            opacity: [0, 0.8, 0],
            rotate: 360
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Stage labels */}
      <text x="300" y="450" textAnchor="middle" fill="white" fontSize="16">
        {stage === 0 && "Individual Elements"}
        {stage === 1 && "Elements in Motion"}
        {stage === 2 && "Interactions Form"}
        {stage === 3 && "Emergent Behavior"}
      </text>
    </svg>
  )
}

// Solar System Visualization Component
function SolarSystemVisualization({ showPluto, plutoFading }: { showPluto: boolean, plutoFading: boolean }) {
  const [time, setTime] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.01)
    }, 16) // ~60fps
    return () => clearInterval(interval)
  }, [])
  
  const planets = [
    { name: 'Mercury', radius: 30, color: '#8C7853', size: 4, speed: 2 },
    { name: 'Venus', radius: 50, color: '#FFC947', size: 7, speed: 1.5 },
    { name: 'Earth', radius: 70, color: '#4A90E2', size: 8, speed: 1 },
    { name: 'Mars', radius: 90, color: '#CD5C5C', size: 5, speed: 0.8 },
    { name: 'Jupiter', radius: 130, color: '#DAA520', size: 20, speed: 0.4 },
    { name: 'Saturn', radius: 170, color: '#F4A460', size: 17, speed: 0.3 },
    { name: 'Uranus', radius: 200, color: '#4FD9E7', size: 12, speed: 0.2 },
    { name: 'Neptune', radius: 230, color: '#4169E1', size: 11, speed: 0.15 },
    { name: 'Pluto', radius: 260, color: '#A0522D', size: 3, speed: 0.1 }
  ]
  
  const centerY = 240 // Center position for the solar system

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Title and Year ABOVE the SVG */}
      <div className="text-center mb-4">
        <m.h2
          className="text-white text-2xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
        </m.h2>
        {(showPluto || plutoFading) && (
          <m.p
            className={`text-xl font-bold mt-1 ${plutoFading ? 'text-red-500' : 'text-white'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
          </m.p>
        )}
      </div>
      
      {/* Solar System SVG */}
      <svg width="100%" height="100%" viewBox="0 0 600 600" className="absolute inset-0">
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="explosionGradient">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFA500" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="plasmaGradient">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="20%" stopColor="#FF00FF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#00FFFF" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#FF4500" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Sun */}
        <m.circle
          cx="300"
          cy={centerY}
          r="25"
          fill="#FFD700"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <animate
            attributeName="r"
            values="25;27;25"
            dur="2s"
            repeatCount="indefinite"
          />
        </m.circle>
        
        {/* Sun glow */}
        <m.circle
          cx="300"
          cy={centerY}
          r="35"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          opacity="0.3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        
        {/* Orbits */}
        {planets.map((planet, i) => (
          <m.circle
            key={`${planet.name}-orbit`}
            cx="300"
            cy={centerY}
            r={planet.radius}
            fill="none"
            stroke={planet.name === 'Pluto' && plutoFading ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)"}
            strokeWidth="1"
            strokeDasharray={planet.name === 'Pluto' ? "5,5" : "none"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: planet.name === 'Pluto' && plutoFading ? 0 : 1 
            }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.1,
              opacity: { duration: 2 }
            }}
          />
        ))}
        
        {/* Planets */}
        {planets.map((planet, i) => {
          if (planet.name === 'Pluto' && !showPluto && !plutoFading) return null
          
          const angle = time * planet.speed + (i * Math.PI * 2 / 9) // Orbiting with different speeds
          const x = 300 + planet.radius * Math.cos(angle)
          const y = centerY + planet.radius * Math.sin(angle)
          
          return (
            <m.g key={planet.name}>
              <m.circle
                cx={x}
                cy={y}
                r={planet.size}
                fill={planet.color}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: planet.name === 'Pluto' && plutoFading ? 0 : 1,
                  opacity: planet.name === 'Pluto' && plutoFading ? 0 : 1
                }}
                transition={{ 
                  duration: planet.name === 'Pluto' && plutoFading ? 2 : 0.5, 
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
              
              {/* Planet label */}
              <m.text
                x={x}
                y={y - planet.size - 10}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="500"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: planet.name === 'Pluto' && plutoFading ? 0 : 1 
                }}
                transition={{ 
                  duration: planet.name === 'Pluto' && plutoFading ? 1 : 0.5, 
                  delay: i * 0.1 + 0.3 
                }}
              >
                {planet.name}
              </m.text>
              
              {/* Bouncing arrow pointing to Pluto */}
              {planet.name === 'Pluto' && showPluto && !plutoFading && (
                <m.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <m.g
                    animate={{
                      y: [0, -5, 0]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <foreignObject
                      x={x - 20}
                      y={y + planet.size + 25}
                      width="40"
                      height="40"
                    >
                      <ArrowRight 
                        className="w-10 h-10 text-white rotate-[-90deg]"
                        style={{ transform: 'rotate(-90deg)' }}
                      />
                    </foreignObject>
                  </m.g>
                </m.g>
              )}
              
              {/* Special effect for Pluto removal */}
              {planet.name === 'Pluto' && plutoFading && (
                <>
                  {/* White flash */}
                  <m.circle
                    cx={x}
                    cy={y}
                    r={planet.size}
                    fill="#FFFFFF"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ 
                      scale: [1, 8],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                  />
                  
                  {/* Shockwaves */}
                  {[...Array(4)].map((_, ringIndex) => (
                    <m.circle
                      key={`ring-${ringIndex}`}
                      cx={x}
                      cy={y}
                      r={planet.size}
                      fill="none"
                      stroke={ringIndex === 0 ? "#FF6B6B" : ringIndex === 1 ? "#FFA500" : ringIndex === 2 ? "#FFD700" : "#FF1493"}
                      strokeWidth="3"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 6 + ringIndex * 3, 10 + ringIndex * 3], 
                        opacity: [0, 0.9, 0],
                        strokeWidth: [6, 3, 0]
                      }}
                      transition={{ 
                        duration: 1.2, 
                        delay: ringIndex * 0.15,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                  
                  {/* Particles */}
                  {[...Array(24)].map((_, particleIndex) => {
                    const particleAngle = (particleIndex * Math.PI * 2) / 24
                    const distance = 50 + (particleIndex * 3) // Use deterministic value instead of random
                    return (
                      <m.circle
                        key={`pluto-particle-${particleIndex}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={particleIndex % 3 === 0 ? "#FF6B6B" : particleIndex % 3 === 1 ? "#FFA500" : "#FFFFFF"}
                        initial={{ cx: x, cy: y, opacity: 1 }}
                        animate={{ 
                          cx: x + Math.cos(particleAngle) * distance,
                          cy: y + Math.sin(particleAngle) * distance,
                          opacity: [1, 1, 0],
                          scale: [1, 1.5],
                          rotate: 360
                        }}
                        transition={{ 
                          duration: 1,
                          delay: particleIndex * 0.01, // Deterministic delay
                          ease: "easeOut"
                        }}
                      />
                    )
                  })}
                </>
              )}
            </m.g>
          )
        })}
        
      </svg>
    </div>
  )
}

// 3D System Visualization
function SystemVisualization3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number | null>(null)
  const nodesRef = useRef<THREE.Mesh[]>([])
  const connectionsRef = useRef<THREE.Line[]>([])
  
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 20)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Create system nodes
    const nodePositions = [
      new THREE.Vector3(0, 0, 0),      // Center
      new THREE.Vector3(5, 0, 0),      // Right
      new THREE.Vector3(-5, 0, 0),     // Left
      new THREE.Vector3(0, 5, 0),      // Top
      new THREE.Vector3(0, -5, 0),     // Bottom
      new THREE.Vector3(3, 3, 3),      // 3D positions
      new THREE.Vector3(-3, -3, 3),
      new THREE.Vector3(-3, 3, -3),
      new THREE.Vector3(3, -3, -3),
    ]

    // Create nodes
    nodePositions.forEach((pos, i) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32)
      const material = new THREE.MeshPhysicalMaterial({
        color: i === 0 ? 0x8b5cf6 : 0xffffff,
        emissive: i === 0 ? 0x8b5cf6 : 0xffffff,
        emissiveIntensity: 0.5,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8
      })
      
      const node = new THREE.Mesh(geometry, material)
      node.position.copy(pos)
      scene.add(node)
      nodesRef.current.push(node)
    })

    // Create connections
    const connectionPairs = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 5], [2, 6], [3, 7], [4, 8],
      [5, 6], [6, 7], [7, 8], [8, 5]
    ]

    connectionPairs.forEach(([a, b]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        nodePositions[a],
        nodePositions[b]
      ])
      const material = new THREE.LineBasicMaterial({ 
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.3
      })
      const line = new THREE.Line(geometry, material)
      scene.add(line)
      connectionsRef.current.push(line)
    })

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mountRef.current!.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      // Rotate the entire system
      scene.rotation.y += 0.002
      scene.rotation.x = mouseY * 0.2
      scene.rotation.z = mouseX * 0.2

      // Pulse nodes
      nodesRef.current.forEach((node, i) => {
        const time = Date.now() * 0.001
        const scale = 1 + Math.sin(time + i) * 0.1
        node.scale.setScalar(scale)
      })

      // Animate connection opacity
      connectionsRef.current.forEach((line, i) => {
        const time = Date.now() * 0.001
        const opacity = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.2
        ;(line.material as THREE.LineBasicMaterial).opacity = opacity
      })

      renderer.render(scene, camera)
    }

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Clean up Three.js objects
      nodesRef.current.forEach(node => {
        node.geometry.dispose()
        ;(node.material as THREE.Material).dispose()
      })
      
      connectionsRef.current.forEach(line => {
        line.geometry.dispose()
        ;(line.material as THREE.Material).dispose()
      })
      
      renderer.dispose()
    }
  }, [])
  
  return <div ref={mountRef} className="w-full h-full" />
}

// ===== MAIN LESSON COMPONENT =====

type LessonPhase = 'intro' | 'components' | 'connections' | 'feedback' | 'emergence' | '3d-system' | 'complete'

function Lesson0Content() {
  const router = useRouter()
  const { profile, addStardust, addAchievement } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('intro')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(180)
  
  // Interactive states
  const [activeNodes, setActiveNodes] = useState<number[]>([])
  const [feedbackActive, setFeedbackActive] = useState(false)
  const [emergenceStage, setEmergenceStage] = useState(0)
  const [showSolarSystem, setShowSolarSystem] = useState(false)
  const [plutoFading, setPlutoFading] = useState(false)
  const [showSpaceConceptCard, setShowSpaceConceptCard] = useState(false)
  const [showChangeConceptCard, setShowChangeConceptCard] = useState(false)
  
  // Notebook state
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([])
  const [showNotebookHighlight, setShowNotebookHighlight] = useState(false)
  
  // Timer refs for cleanup and pause/resume functionality
  const notebookHighlightTimer = useRef<NodeJS.Timeout | null>(null)
  const conceptCardTimer = useRef<NodeJS.Timeout | null>(null)
  const conceptCardTimerStartTime = useRef<number | null>(null)
  const conceptCardTimerDuration = useRef<number | null>(null)
  const entryCounterRef = useRef(0)
  
  // Concept viewer state
  const [showConceptViewer, setShowConceptViewer] = useState(false)
  const [viewingConcept, setViewingConcept] = useState<Concept | null>(null)
  const [initialPropertyId, setInitialPropertyId] = useState<string | undefined>()
  
  // Add notebook entry helper
  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
    entryCounterRef.current += 1
    const newEntry: NotebookEntry = {
      ...entry,
      id: `${Date.now()}-${entryCounterRef.current}`,
      timestamp: new Date()
    }
    setNotebookEntries(prev => [...prev, newEntry])
    
    // Highlight notebook when adding first entry
    if (notebookEntries.length === 0) {
      setShowNotebookHighlight(true)
      // Clear any existing timer
      if (notebookHighlightTimer.current) {
        clearTimeout(notebookHighlightTimer.current)
      }
      // Set new timer with cleanup
      notebookHighlightTimer.current = setTimeout(() => {
        setShowNotebookHighlight(false)
        notebookHighlightTimer.current = null
      }, 3000)
    }
  }
  
  const handleNotebookEntryClick = (entry: NotebookEntry) => {
    // Open concept viewer for concept entries
    if (entry.type === 'definition' && entry.title) {
      const conceptId = entry.title.toLowerCase()
      const concept = concepts[conceptId]
      if (concept) {
        // Cancel the concept card timer when user manually clicks
        if (conceptCardTimer.current) {
          clearTimeout(conceptCardTimer.current)
          conceptCardTimer.current = null
          conceptCardTimerStartTime.current = null
          conceptCardTimerDuration.current = null
        }
        setViewingConcept(concept)
        setShowConceptViewer(true)
      }
    }
  }
  
  const addUserNote = (note: string) => {
    addNotebookEntry({
      type: 'note',
      title: 'Personal Note',
      content: note
    })
  }

  // ===== DIALOG CONFIGURATION =====
  
  const phaseDialogs = {
    intro: [
      { id: '1', npc: 'ERRATA' as const, text: "In our lives, we're surrounded by systems.", requiresInteraction: false },
      { id: '2', npc: 'ERRATA' as const, text: "Ecosystems, the human body, the solar system- all systems we interact with every day.", requiresInteraction: false },
      { id: '3', npc: 'ERRATA' as const, text: "Even the words you're reading right now: they're just a part of the system that is OBELISK!", requiresInteraction: false },
      { id: '4', npc: 'ERRATA' as const, text: "But when you start to poke around the edges of a system... things can get messy.", requiresInteraction: false },
      { id: '5', npc: 'ERRATA' as const, text: "Until 2006, Pluto was the ninth planet in the solar system.", requiresInteraction: false },
      { id: '6', npc: 'ERRATA' as const, text: "Then suddenly, it was removed- reclassified as a 'dwarf planet'.", requiresInteraction: false },
      { id: '7', npc: 'ERRATA' as const, text: "The solar system didn't change. Pluto didn't change. But our definition of 'planet' did.", requiresInteraction: false },
      { id: '8', npc: 'ERRATA' as const, text: "This tells us something important: the boundaries we draw around systems are made up.", requiresInteraction: false },
      { id: '9', npc: 'ERRATA' as const, text: "Yet these decisions shape everything - from perspective to education.", requiresInteraction: false },
      { id: '10', npc: 'ERRATA' as const, text: "Since we get to make up what a system IS, let's be careful not to mess anything up.", requiresInteraction: true }
    ],
    components: [
      { id: '5', npc: 'ERRATA' as const, text: "Every system requires a space to operate.", requiresInteraction: false },
      { id: '6', npc: 'ERRATA' as const, text: "But what is a space?", requiresInteraction: false },
      { id: '7', npc: 'ERRATA' as const, text: "Space is simply a set of unique positions.", requiresInteraction: false },
      { id: '8', npc: 'ERRATA' as const, text: "So, at the most basic, a system requires space. But that space needs stuff to make it fun!", requiresInteraction: false },
      { id: '9', npc: 'ERRATA' as const, text: "Notice how each position can hold a component, creating the structure of our system.", requiresInteraction: false },
      { id: '10', npc: 'ERRATA' as const, text: "When stuff exists in space, it needs to change.", requiresInteraction: true }
    ],
    connections: [
      { id: '8', npc: 'ERRATA' as const, text: "Components don't exist in isolation. They're connected through relationships.", requiresInteraction: false },
      { id: '9', npc: 'ERRATA' as const, text: "These connections allow information, energy, or resources to flow through the system.", requiresInteraction: false },
      { id: '10', npc: 'ERRATA' as const, text: "Try activating multiple nodes to see how connections light up between them.", requiresInteraction: true }
    ],
    feedback: [
      { id: '11', npc: 'ERRATA' as const, text: "One of the most important concepts in systems thinking is feedback loops.", requiresInteraction: false },
      { id: '12', npc: 'ERRATA' as const, text: "Feedback occurs when outputs of a system are routed back as inputs, creating a circuit.", requiresInteraction: false },
      { id: '13', npc: 'ERRATA' as const, text: "This creates self-regulating behavior - the foundation of stability and adaptation.", requiresInteraction: true }
    ],
    emergence: [
      { id: '14', npc: 'ERRATA' as const, text: "Now for the most fascinating aspect: emergence.", requiresInteraction: false },
      { id: '15', npc: 'ERRATA' as const, text: "Emergence is when a system exhibits properties that none of its individual parts possess.", requiresInteraction: false },
      { id: '16', npc: 'ERRATA' as const, text: "Watch how simple interactions between elements create complex patterns.", requiresInteraction: false },
      { id: '17', npc: 'ERRATA' as const, text: "This is how consciousness emerges from neurons, how societies emerge from individuals.", requiresInteraction: true }
    ],
    '3d-system': [
      { id: '18', npc: 'ERRATA' as const, text: "Systems exist in multiple dimensions and scales simultaneously.", requiresInteraction: false },
      { id: '19', npc: 'ERRATA' as const, text: "This 3D visualization shows how systems can have complex, interconnected structures.", requiresInteraction: false },
      { id: '20', npc: 'ERRATA' as const, text: "Remember: to understand anything deeply, think of it as a system. What are its parts? How do they connect? What emerges?", requiresInteraction: true }
    ]
  }

  // ===== CONCEPT DEFINITIONS =====
  
  const concepts: Record<string, Concept> = {
    space: {
      id: 'space',
      name: 'Space',
      definition: 'A set of unique positions where system components can exist and interact. Space provides the foundational structure for any system, defining where things can be and how they relate positionally.',
      whyItMatters: 'Without space, there would be no "where" for things to exist. Space gives systems their structure and allows us to distinguish between different components based on their positions.',
      demonstration: (
        <svg width="100%" height="300" viewBox="0 0 400 300" className="mx-auto">
          {/* Grid background */}
          <defs>
            <pattern id="conceptGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#conceptGrid)" />
          
          {/* Positions with labels */}
          {[
            { x: 80, y: 80, label: 'A' },
            { x: 200, y: 80, label: 'B' },
            { x: 320, y: 80, label: 'C' },
            { x: 80, y: 200, label: 'D' },
            { x: 200, y: 200, label: 'E' },
            { x: 320, y: 200, label: 'F' },
          ].map((pos, i) => (
            <m.g key={pos.label}>
              <m.circle
                cx={pos.x}
                cy={pos.y}
                r="15"
                fill="rgba(139, 92, 246, 0.3)"
                stroke="rgba(139, 92, 246, 0.8)"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
              />
              <m.text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                {pos.label}
              </m.text>
              <m.text
                x={pos.x}
                y={pos.y + 30}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(139, 92, 246, 0.8)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
              >
                ({pos.x/40}, {pos.y/40})
              </m.text>
            </m.g>
          ))}
        </svg>
      ),
      properties: [
        {
          id: 'dimensions',
          name: 'Dimensions',
          description: 'Space can have one or more dimensions. A line is 1D, a plane is 2D, our physical world is 3D, and systems can exist in even higher dimensional spaces.',
          whyItMatters: 'The number of dimensions determines the complexity of relationships possible within the system. More dimensions allow for more complex interactions.',
          demonstration: (
            <div className="space-y-6">
              {/* 1D */}
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">1D - Line</p>
                <svg width="300" height="60" viewBox="0 0 300 60" className="mx-auto">
                  <line x1="50" y1="30" x2="250" y2="30" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                  {[0, 1, 2, 3, 4].map(i => (
                    <circle key={i} cx={50 + i * 50} cy={30} r="5" fill="rgba(139, 92, 246, 0.8)" />
                  ))}
                </svg>
              </div>
              
              {/* 2D */}
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">2D - Plane</p>
                <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
                  <defs>
                    <pattern id="grid2d" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="200" height="200" fill="url(#grid2d)" />
                  {[0, 1, 2, 3, 4].map(x => 
                    [0, 1, 2, 3, 4].map(y => (
                      <circle key={`${x}-${y}`} cx={20 + x * 40} cy={20 + y * 40} r="3" fill="rgba(139, 92, 246, 0.6)" />
                    ))
                  )}
                </svg>
              </div>
            </div>
          )
        },
        {
          id: 'uniqueness',
          name: 'Uniqueness',
          description: 'Every position in a space must be unique and distinguishable from every other position. This is what allows us to identify and reference specific locations.',
          whyItMatters: 'Uniqueness ensures that we can unambiguously refer to any position in the system. Without it, we couldn\'t distinguish between different components.',
          demonstration: (
            <div className="space-y-6">
              {/* Valid unique space */}
              <div className="text-center">
                <p className="text-green-400 text-sm mb-2">✓ Valid Space - Unique Positions</p>
                <svg width="300" height="100" viewBox="0 0 300 100" className="mx-auto">
                  {[
                    { x: 60, y: 50, label: '(1,2)' },
                    { x: 150, y: 50, label: '(3,2)' },
                    { x: 240, y: 50, label: '(5,2)' }
                  ].map((pos, i) => (
                    <g key={i}>
                      <circle cx={pos.x} cy={pos.y} r="20" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" />
                      <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="12" fill="white">{pos.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
              
              {/* Invalid non-unique space */}
              <div className="text-center">
                <p className="text-red-400 text-sm mb-2">✗ Invalid Space - Duplicate Positions</p>
                <svg width="300" height="100" viewBox="0 0 300 100" className="mx-auto">
                  {[
                    { x: 60, y: 50, label: '(1,2)' },
                    { x: 150, y: 50, label: '(1,2)', duplicate: true },
                    { x: 240, y: 50, label: '(3,2)' }
                  ].map((pos, i) => (
                    <g key={i}>
                      <circle 
                        cx={pos.x} 
                        cy={pos.y} 
                        r="20" 
                        fill={pos.duplicate ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)"} 
                        stroke="rgba(239, 68, 68, 0.8)" 
                        strokeWidth="2"
                        strokeDasharray={pos.duplicate ? "5,5" : "none"}
                      />
                      <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="12" fill="white">{pos.label}</text>
                      {pos.duplicate && (
                        <text x={pos.x} y={pos.y + 25} textAnchor="middle" fontSize="10" fill="rgba(239, 68, 68, 0.8)">Conflict!</text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )
        },
        {
          id: 'types',
          name: 'Types',
          description: 'Space can be continuous (like real numbers) or discrete (like a grid). This fundamental property affects how components can move and interact within the system.',
          whyItMatters: 'The type of space determines the nature of possible movements and interactions. Continuous spaces allow smooth transitions, while discrete spaces have defined steps.',
          demonstration: (
            <div className="space-y-6">
              {/* Interactive scroller */}
              <div className="bg-black/30 rounded-lg p-6">
                <div className="flex gap-8 overflow-x-auto pb-4">
                  {/* Discrete Space */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-purple-400 text-sm font-medium mb-3">Discrete Space</p>
                    <svg width="250" height="250" viewBox="0 0 250 250" className="bg-black/20 rounded">
                      {/* Grid */}
                      {[0, 1, 2, 3, 4].map(x => 
                        [0, 1, 2, 3, 4].map(y => (
                          <g key={`${x}-${y}`}>
                            <rect 
                              x={x * 50} 
                              y={y * 50} 
                              width="50" 
                              height="50" 
                              fill="none" 
                              stroke="rgba(139, 92, 246, 0.2)" 
                              strokeWidth="1"
                            />
                            <circle 
                              cx={x * 50 + 25} 
                              cy={y * 50 + 25} 
                              r="3" 
                              fill="rgba(139, 92, 246, 0.5)"
                            />
                          </g>
                        ))
                      )}
                      {/* Moving element showing discrete jumps */}
                      <m.circle
                        r="8"
                        fill="rgba(139, 92, 246, 1)"
                        animate={{
                          cx: [25, 75, 125, 175, 225, 225, 225, 175, 125, 75, 25, 25],
                          cy: [25, 25, 25, 25, 25, 75, 125, 175, 225, 225, 225, 125]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          times: [0, 0.08, 0.16, 0.24, 0.32, 0.40, 0.48, 0.56, 0.64, 0.72, 0.80, 0.88],
                          ease: [0, 0, 1, 1] // Step function - instant change
                        }}
                      />
                      <text x="125" y="240" textAnchor="middle" fontSize="11" fill="rgba(255, 255, 255, 0.5)">
                        Movement in fixed steps
                      </text>
                    </svg>
                  </div>
                  
                  {/* Continuous Space */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-purple-400 text-sm font-medium mb-3">Continuous Space</p>
                    <svg width="250" height="250" viewBox="0 0 250 250" className="bg-black/20 rounded">
                      {/* Gradient background to suggest continuity */}
                      <defs>
                        <radialGradient id="continuousGrad">
                          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
                          <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                        </radialGradient>
                      </defs>
                      <rect width="250" height="250" fill="url(#continuousGrad)" />
                      
                      {/* Smooth curve */}
                      <path
                        d="M 25 125 Q 75 50, 125 125 T 225 125"
                        fill="none"
                        stroke="rgba(139, 92, 246, 0.3)"
                        strokeWidth="2"
                      />
                      
                      {/* Smoothly moving element */}
                      <m.g>
                        <m.circle
                          r="8"
                          fill="rgba(139, 92, 246, 1)"
                          animate={{
                            cx: [25, 125, 225, 125, 25],
                            cy: [125, 50, 125, 200, 125]
                          }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {/* Trail effect */}
                        {[...Array(5)].map((_, i) => (
                          <m.circle
                            key={i}
                            r={6 - i}
                            fill="rgba(139, 92, 246, 0.3)"
                            animate={{
                              cx: [25, 125, 225, 125, 25],
                              cy: [125, 50, 125, 200, 125]
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.1
                            }}
                          />
                        ))}
                      </m.g>
                      <text x="125" y="240" textAnchor="middle" fontSize="11" fill="rgba(255, 255, 255, 0.5)">
                        Smooth, infinite positions
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    change: {
      id: 'change',
      name: 'Change',
      definition: 'The transformation of elements within a space over time. Change is what makes systems dynamic rather than static, allowing them to evolve, adapt, and respond.',
      whyItMatters: 'Without change, systems would be frozen snapshots. Change enables evolution, learning, growth, and adaptation - the very essence of living systems.',
      demonstration: (
        <svg width="100%" height="300" viewBox="0 0 400 300" className="mx-auto">
          {/* Central system area */}
          <g transform="translate(200, 150)">
            {/* Central node - always present */}
            <circle 
              cx={0} 
              cy={0} 
              r="12" 
              fill="rgba(139, 92, 246, 0.9)"
              stroke="rgba(139, 92, 246, 1)"
              strokeWidth="2"
            />
            
            {/* Blinking node */}
            <m.circle
              cx={0}
              cy={-60}
              r="8"
              fill="rgba(139, 92, 246, 0.8)"
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.1, 0.9, 1],
                ease: "easeInOut"
              }}
            />
            
            {/* Sliding nodes */}
            <m.circle
              cx={-60}
              cy={0}
              r="8"
              fill="rgba(59, 130, 246, 0.8)"
              animate={{
                x: [-60, 60, -60]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
            
            <m.circle
              cx={60}
              cy={0}
              r="8"
              fill="rgba(99, 102, 241, 0.8)"
              animate={{
                x: [60, -60, 60]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
            
            {/* Orbiting node */}
            <m.g
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <circle
                cx={0}
                cy={40}
                r="6"
                fill="rgba(167, 139, 250, 0.8)"
              />
            </m.g>
            
            {/* Morphing shape */}
            <m.rect
              x={-50}
              y={30}
              width="20"
              height="20"
              rx="0"
              fill="rgba(236, 72, 153, 0.6)"
              animate={{
                rx: [0, 10, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </g>
          
          {/* Labels */}
          <text x="200" y="50" textAnchor="middle" fontSize="14" fill="rgba(255, 255, 255, 0.6)">
            Systems change over time
          </text>
          <text x="200" y="270" textAnchor="middle" fontSize="12" fill="rgba(255, 255, 255, 0.4)">
            Elements appear, disappear, move, and transform
          </text>
        </svg>
      ),
      properties: [
        {
          id: 'motion',
          name: 'Motion',
          description: 'The simplest form of change - movement through space. Objects maintain their identity but change their position.',
          whyItMatters: 'Motion allows systems to reorganize without changing their fundamental components, enabling dynamic configurations.',
          demonstration: (
            <svg width="300" height="200" viewBox="0 0 300 200" className="mx-auto">
              <m.circle
                cx="50"
                cy="100"
                r="10"
                fill="rgba(139, 92, 246, 0.8)"
                animate={{
                  cx: [50, 250, 50]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <path
                d="M 50 100 Q 150 50, 250 100"
                fill="none"
                stroke="rgba(139, 92, 246, 0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )
        },
        {
          id: 'transformation',
          name: 'Transformation',
          description: 'Change in the properties or state of components while maintaining their identity. Like ice melting to water.',
          whyItMatters: 'Transformation allows systems to adapt to different conditions without losing their essential nature.',
        },
        {
          id: 'emergence',
          name: 'Emergence & Decay',
          description: 'Components can appear (emerge) or disappear (decay) from the system, changing its composition over time.',
          whyItMatters: 'This allows systems to grow, shrink, and evolve their structure based on conditions and needs.',
        }
      ]
    }
  }

  // ===== EFFECTS =====
  
  // Add notebook entries as we progress through phases
  useEffect(() => {
    switch (currentPhase) {
      case 'intro':
        if (currentDialogIndex === 6) {
          addNotebookEntry({
            type: 'property',
            title: 'System Boundaries',
            content: 'The boundaries we draw around systems are often arbitrary human constructs, yet they profoundly shape our understanding and actions.'
          })
        }
        if (currentDialogIndex === 8) {
          addNotebookEntry({
            type: 'definition',
            title: 'System',
            content: 'A system is a collection of interconnected components that work together as a whole, exhibiting properties that emerge from their interactions.'
          })
        }
        break
      case 'components':
        if (currentDialogIndex === 0) {
          addNotebookEntry({
            type: 'property',
            title: 'System Space',
            content: 'Every system requires a space to operate - a domain where its components and interactions can exist.'
          })
        }
        if (currentDialogIndex === 2) {
          // Show the space concept card
          setShowSpaceConceptCard(true)
        }
        if (currentDialogIndex === 3) {
          // Hide the space concept card
          setShowSpaceConceptCard(false)
        }
        if (currentDialogIndex === 5) {
          // Show the change concept card
          setShowChangeConceptCard(true)
        }
        // Hide change card when reaching the last dialog before connections
        if (currentDialogIndex === 5 && getCurrentDialogs().length - 1 === 5) {
          // This will be the last dialog in components phase
          // Clear any existing timer
          if (conceptCardTimer.current) {
            clearTimeout(conceptCardTimer.current)
          }
          // Set timer with pause/resume support
          conceptCardTimerStartTime.current = Date.now()
          conceptCardTimerDuration.current = 3000
          conceptCardTimer.current = setTimeout(() => {
            setShowChangeConceptCard(false)
            conceptCardTimer.current = null
            conceptCardTimerStartTime.current = null
            conceptCardTimerDuration.current = null
          }, 3000) // Give time to read
        }
        break
      case 'connections':
        // Hide any remaining concept cards when entering connections phase
        if (currentDialogIndex === 0) {
          setShowSpaceConceptCard(false)
          setShowChangeConceptCard(false)
        }
        break
      case 'feedback':
        if (currentDialogIndex === 1) {
          addNotebookEntry({
            type: 'definition',
            title: 'Feedback Loop',
            content: 'A circular process where outputs of a system are routed back as inputs, creating self-regulating behavior.'
          })
        }
        break
      case 'emergence':
        if (currentDialogIndex === 1) {
          addNotebookEntry({
            type: 'property',
            title: 'Emergence',
            content: 'The phenomenon where a system exhibits properties or behaviors that its individual parts do not possess on their own.'
          })
        }
        break
    }
  }, [currentPhase, currentDialogIndex])
  
  // Feedback loop activation
  useEffect(() => {
    if (currentPhase === 'feedback' && currentDialogIndex >= 2) {
      setFeedbackActive(true)
    } else {
      setFeedbackActive(false)
    }
  }, [currentPhase, currentDialogIndex])
  
  // Emergence stage progression
  useEffect(() => {
    if (currentPhase === 'emergence') {
      const timer = setInterval(() => {
        setEmergenceStage(prev => (prev < 3 ? prev + 1 : prev))
      }, 2000)
      
      return () => clearInterval(timer)
    } else {
      setEmergenceStage(0)
    }
  }, [currentPhase])
  
  // Solar system animation timing
  useEffect(() => {
    if (currentPhase === 'intro') {
      if (currentDialogIndex === 3) {
        // Show solar system when talking about "Until 2006, Pluto was the ninth planet"
        setShowSolarSystem(true)
        setPlutoFading(false)
      } else if (currentDialogIndex === 4) {
        // Start fading Pluto when explaining "Then suddenly, it was removed"
        setPlutoFading(true)
      } else if (currentDialogIndex >= 8) {
        // Hide solar system for final dialog
        setShowSolarSystem(false)
        setPlutoFading(false)
      }
    } else {
      setShowSolarSystem(false)
      setPlutoFading(false)
    }
  }, [currentPhase, currentDialogIndex])
  
  // Cooldown timer
  useEffect(() => {
    if (!showCompletionScreen) return
    
    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [showCompletionScreen])

  // Handle concept card timer pause/resume when concept viewer opens/closes
  useEffect(() => {
    if (showConceptViewer) {
      // Hide the concept card when viewer opens
      setShowChangeConceptCard(false)
      // Pause the concept card timer if it's running
      if (conceptCardTimer.current && conceptCardTimerStartTime.current && conceptCardTimerDuration.current) {
        clearTimeout(conceptCardTimer.current)
        conceptCardTimer.current = null
        // Calculate remaining time
        const elapsed = Date.now() - conceptCardTimerStartTime.current
        conceptCardTimerDuration.current = Math.max(0, conceptCardTimerDuration.current - elapsed)
      }
    } else {
      // Show the concept card when viewer closes (if it should still be visible)
      if (conceptCardTimerDuration.current !== null && conceptCardTimerDuration.current > 0) {
        setShowChangeConceptCard(true)
        // Resume the concept card timer if it was paused
        conceptCardTimerStartTime.current = Date.now()
        conceptCardTimer.current = setTimeout(() => {
          setShowChangeConceptCard(false)
          conceptCardTimer.current = null
          conceptCardTimerStartTime.current = null
          conceptCardTimerDuration.current = null
        }, conceptCardTimerDuration.current)
      }
    }
  }, [showConceptViewer])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (notebookHighlightTimer.current) {
        clearTimeout(notebookHighlightTimer.current)
      }
      if (conceptCardTimer.current) {
        clearTimeout(conceptCardTimer.current)
      }
    }
  }, [])

  // ===== DIALOG NAVIGATION =====
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Phase progression
      const nextPhase: Record<LessonPhase, LessonPhase | 'complete'> = {
        'intro': 'components',
        'components': 'connections',
        'connections': 'feedback',
        'feedback': 'emergence',
        'emergence': '3d-system',
        '3d-system': 'complete',
        'complete': 'complete'
      }
      
      const next = nextPhase[currentPhase]
      if (next === 'complete') {
        setShowCompletionScreen(true)
        
        // Award achievement and stardust
        if (addAchievement && addStardust) {
          addAchievement('FIRST_LESSON')
          addStardust(100)
        }
      } else {
        setCurrentPhase(next)
        setCurrentDialogIndex(0)
      }
    }
  }
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    }
  }
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
  // Node click handler
  const handleNodeClick = (nodeId: number) => {
    if (activeNodes.includes(nodeId)) {
      setActiveNodes(activeNodes.filter(id => id !== nodeId))
    } else {
      setActiveNodes([...activeNodes, nodeId])
    }
  }

  // ===== UI RENDER =====
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar />
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          {/* Intro Phase */}
          {currentPhase === 'intro' && (
            <div className="relative w-full h-full flex items-center justify-center">
              {!showSolarSystem ? (
                <div className="text-center space-y-8">
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-32 h-32 mx-auto"
                  >
                    <Network className="w-full h-full text-purple-500" />
                  </m.div>
                  <h1 className="text-4xl font-bold text-white">Systems Thinking</h1>
                  <p className="text-white/60 max-w-md mx-auto">
                    Understanding how parts create wholes
                  </p>
                </div>
              ) : (
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  <SolarSystemVisualization 
                    showPluto={!plutoFading || currentDialogIndex === 3}
                    plutoFading={plutoFading}
                  />
                </m.div>
              )}
            </div>
          )}
          
          {/* Components Phase */}
          {currentPhase === 'components' && (
            <div className={`relative w-full h-full flex items-start justify-center pt-32 transition-opacity duration-300 ${showSpaceConceptCard || showChangeConceptCard ? 'opacity-0' : 'opacity-100'}`}>
              {currentDialogIndex >= 2 ? (
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(25)].map((_, i) => {
                    const isActive = activeNodes.includes(i)
                    return (
                      <m.div
                        key={i}
                        className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition-all ${
                          isActive 
                            ? 'border-purple-500 bg-purple-500/20' 
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                        onClick={() => handleNodeClick(i)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/60 text-xs">{i + 1}</span>
                        </div>
                      </m.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center space-y-8">
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-32 h-32 mx-auto"
                  >
                    <Layers className="w-full h-full text-purple-500" />
                  </m.div>
                  <h2 className="text-3xl font-bold text-white">System Components</h2>
                  <p className="text-white/60 max-w-md mx-auto">
                    Building blocks of every system
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Connections Phase */}
          {currentPhase === 'connections' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Network className="w-32 h-32 mx-auto text-purple-500/50 mb-8" />
                <p className="text-white/60 text-lg">Components form relationships through their positions in space</p>
              </div>
            </div>
          )}
          
          {/* Feedback Phase */}
          {currentPhase === 'feedback' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <FeedbackLoop isActive={feedbackActive} />
            </div>
          )}
          
          {/* Emergence Phase */}
          {currentPhase === 'emergence' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <EmergenceVisualization stage={emergenceStage} />
            </div>
          )}
          
          {/* 3D System Phase */}
          {currentPhase === '3d-system' && (
            <div className="relative w-full h-full">
              <SystemVisualization3D />
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog System */}
      {currentDialog && !showCompletionScreen && (
        <NPCDialog
          dialog={currentDialog}
          onNext={handleNextDialog}
          isVisible={true}
          canGoBack={!(currentPhase === 'intro' && currentDialogIndex === 0)}
          onBack={handleBackDialog}
          allowMinimize={false}
        />
      )}
      
      {/* Learning Notebook */}
      <LearningNotebook
        entries={notebookEntries}
        onAddNote={addUserNote}
        onEntryClick={handleNotebookEntryClick}
        isHighlighted={showNotebookHighlight}
      />
      
      {/* Space Concept Card */}
      {showSpaceConceptCard && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-28 p-6 pointer-events-none">
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 30 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.34, 1.56, 0.64, 1],
              opacity: { duration: 0.3 }
            }}
            style={{ perspective: 1000 }}
            onAnimationComplete={() => {
              // Add to notebook after animation completes
              setTimeout(() => {
                addNotebookEntry({
                  type: 'definition',
                  title: 'Space',
                  content: 'Space is a set of unique positions where system components can exist and interact.'
                })
                addNotebookEntry({
                  type: 'definition',
                  title: 'Set',
                  content: 'A collection of distinct elements, in this case, the collection of all possible positions in a space.'
                })
              }, 100)
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto"
          >
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-purple-500/50 shadow-xl overflow-hidden backdrop-blur-sm">
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-purple-400 text-sm font-medium uppercase tracking-wider mb-1">
                      CONCEPT UNLOCKED
                    </p>
                    <h3 className="text-2xl font-bold text-white">Space</h3>
                  </div>
                </div>
                
                {/* Visual representation */}
                <div className="mt-6 bg-gradient-to-b from-purple-900/20 to-black/40 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
                  <svg width="100%" height="180" viewBox="0 0 350 180" className="relative z-10">
                    {/* Background grid lines */}
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(167, 139, 250, 0.1)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="350" height="180" fill="url(#grid)" />
                    
                    {/* Highlighted positions with pulsing effect */}
                    {[
                      { x: 75, y: 45, label: "A", highlight: true },
                      { x: 175, y: 45, label: "B", highlight: true },
                      { x: 275, y: 45, label: "C", highlight: true },
                      { x: 75, y: 135, label: "D", highlight: false },
                      { x: 175, y: 135, label: "E", highlight: false },
                      { x: 275, y: 135, label: "F", highlight: false },
                    ].map((pos, i) => (
                      <m.g key={pos.label}>
                        {/* Glow effect for highlighted positions */}
                        {pos.highlight && (
                          <>
                            {/* Outer glow ring */}
                            <m.circle
                              cx={pos.x}
                              cy={pos.y}
                              r="20"
                              fill="none"
                              stroke="rgba(167, 139, 250, 0.3)"
                              strokeWidth="2"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ 
                                scale: 1.4,
                                opacity: [0, 0.6, 0]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut"
                              }}
                            />
                            {/* Inner glow ring */}
                            <m.circle
                              cx={pos.x}
                              cy={pos.y}
                              r="12"
                              fill="none"
                              stroke="rgba(167, 139, 250, 0.5)"
                              strokeWidth="1"
                              initial={{ scale: 1, opacity: 0 }}
                              animate={{ 
                                scale: 1.2,
                                opacity: [0.5, 0, 0.5]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2 + 0.5,
                                ease: "easeInOut"
                              }}
                            />
                          </>
                        )}
                        
                        {/* Position marker */}
                        <m.circle
                          cx={pos.x}
                          cy={pos.y}
                          r="8"
                          fill={pos.highlight ? "rgba(167, 139, 250, 0.8)" : "rgba(167, 139, 250, 0.4)"}
                          stroke="rgba(167, 139, 250, 1)"
                          strokeWidth="2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1, type: "spring" }}
                        />
                        
                        {/* Position label */}
                        <m.text
                          x={pos.x}
                          y={pos.y + 5}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="600"
                          fill="white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 + 0.2 }}
                        >
                          {pos.label}
                        </m.text>
                        
                        {/* Coordinate label */}
                        <m.text
                          x={pos.x}
                          y={pos.y + 25}
                          textAnchor="middle"
                          fontSize="10"
                          fill="rgba(167, 139, 250, 0.8)"
                          initial={{ opacity: 0, y: pos.y + 20 }}
                          animate={{ opacity: 1, y: pos.y + 25 }}
                          transition={{ delay: i * 0.1 + 0.3 }}
                        >
                          ({Math.floor(pos.x/50)}, {Math.floor(pos.y/50)})
                        </m.text>
                      </m.g>
                    ))}
                    
                    {/* Connecting lines with flowing animation */}
                    <m.path
                      d="M 75 45 L 175 45 L 275 45"
                      fill="none"
                      stroke="rgba(167, 139, 250, 0.3)"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    
                    {/* Flowing particles along the path */}
                    {[0, 1, 2].map((idx) => (
                      <m.circle
                        key={`particle-${idx}`}
                        r="3"
                        fill="rgba(167, 139, 250, 0.8)"
                        initial={{ cx: 75, cy: 45, opacity: 0 }}
                        animate={{
                          cx: [75, 175, 275, 275],
                          cy: [45, 45, 45, 45],
                          opacity: [0, 1, 1, 0],
                          scale: [0, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: idx * 1,
                          times: [0, 0.2, 0.8, 1],
                          ease: "linear"
                        }}
                      />
                    ))}
                    
                    {/* Explanatory text */}
                    <m.text
                      x="175"
                      y="90"
                      textAnchor="middle"
                      fontSize="14"
                      fill="rgba(255, 255, 255, 0.7)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      Each position is unique
                    </m.text>
                  </svg>
                </div>
                
                <div className="mt-4 space-y-3">
                  <p className="text-white/90 font-medium">
                    Space is simply a set of unique positions.
                  </p>
                  <p className="text-white/70 text-sm">
                    Each position in a space is distinct and can be identified uniquely. 
                    This forms the foundation where all system components exist and interact.
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-purple-400/60 text-xs">
                    Added to Archive & Notebook
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      )}
      
      {/* Change Concept Card */}
      {showChangeConceptCard && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-28 p-6 pointer-events-none">
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 30 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.34, 1.56, 0.64, 1],
              opacity: { duration: 0.3 }
            }}
            style={{ perspective: 1000 }}
            onAnimationComplete={() => {
              // Add to notebook after animation completes
              setTimeout(() => {
                addNotebookEntry({
                  type: 'definition',
                  title: 'Change',
                  content: 'The transformation of elements within a space over time - the dynamic aspect that allows systems to evolve and adapt.'
                })
              }, 100)
            }}
            className="relative max-w-md w-full mx-4 pointer-events-auto cursor-pointer"
            onClick={() => {
              // Pause the timer when user clicks the concept card
              if (conceptCardTimer.current && conceptCardTimerStartTime.current && conceptCardTimerDuration.current) {
                clearTimeout(conceptCardTimer.current)
                conceptCardTimer.current = null
                // Calculate remaining time
                const elapsed = Date.now() - conceptCardTimerStartTime.current
                conceptCardTimerDuration.current = Math.max(0, conceptCardTimerDuration.current - elapsed)
              }
              // Open the concept viewer
              const concept = concepts.change
              if (concept) {
                setViewingConcept(concept)
                setShowConceptViewer(true)
              }
            }}
          >
            <div className="relative bg-cosmic-void/90 rounded-2xl border border-purple-500/50 shadow-xl overflow-hidden backdrop-blur-sm">
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-purple-400 text-sm font-medium uppercase tracking-wider mb-1">
                      CONCEPT UNLOCKED
                    </p>
                    <h3 className="text-2xl font-bold text-white">Change</h3>
                  </div>
                </div>
                
                {/* Visual representation */}
                <div className="mt-6 bg-gradient-to-b from-blue-900/20 to-black/40 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
                  <svg width="100%" height="180" viewBox="0 0 350 180" className="relative z-10">
                    {/* Animated transformation */}
                    {[
                      { id: 1, startX: 50, startY: 90, endX: 150, endY: 90 },
                      { id: 2, startX: 150, startY: 90, endX: 250, endY: 90 },
                      { id: 3, startX: 250, startY: 90, endX: 300, endY: 50 },
                    ].map((item, i) => (
                      <m.g key={item.id}>
                        {/* Animated path of movement */}
                        <m.line
                          x1={item.startX}
                          y1={item.startY}
                          x2={item.endX}
                          y2={item.endY}
                          stroke="rgba(167, 139, 250, 0.2)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ 
                            pathLength: [0, 1, 1, 0],
                            opacity: [0, 0.5, 0.5, 0]
                          }}
                          transition={{ 
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity,
                            times: [0, 0.3, 0.7, 1]
                          }}
                        />
                        
                        {/* Moving element with appear/disappear effect */}
                        <m.circle
                          r="8"
                          fill="rgba(167, 139, 250, 0.8)"
                          stroke="rgba(167, 139, 250, 1)"
                          strokeWidth="2"
                          initial={{ cx: item.startX, cy: item.startY, opacity: 0, scale: 0 }}
                          animate={{ 
                            cx: [item.startX, item.startX, item.endX, item.endX],
                            cy: [item.startY, item.startY, item.endY, item.endY],
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1]
                          }}
                          transition={{ 
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity,
                            times: [0, 0.2, 0.8, 1],
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Trail effect */}
                        <m.circle
                          r="4"
                          fill="none"
                          stroke="rgba(167, 139, 250, 0.4)"
                          strokeWidth="1"
                          initial={{ cx: item.startX, cy: item.startY, opacity: 0 }}
                          animate={{ 
                            cx: [item.startX, item.startX, item.endX, item.endX],
                            cy: [item.startY, item.startY, item.endY, item.endY],
                            opacity: [0, 0.6, 0.6, 0],
                            scale: [0.5, 1.5]
                          }}
                          transition={{ 
                            duration: 3,
                            delay: i * 0.5 + 0.1,
                            repeat: Infinity,
                            times: [0, 0.2, 0.8, 1],
                            ease: "easeOut"
                          }}
                        />
                        
                        {/* Start position marker with pulse */}
                        <m.circle
                          cx={item.startX}
                          cy={item.startY}
                          r="4"
                          fill="none"
                          stroke="rgba(167, 139, 250, 0.5)"
                          strokeWidth="1"
                          animate={{
                            r: [4, 6, 4],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                        />
                        
                        {/* End position marker with pulse */}
                        <m.circle
                          cx={item.endX}
                          cy={item.endY}
                          r="4"
                          fill="none"
                          stroke="rgba(167, 139, 250, 0.5)"
                          strokeWidth="1"
                          animate={{
                            r: [4, 6, 4],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5 + 1
                          }}
                        />
                      </m.g>
                    ))}
                  </svg>
                </div>
                
                <div className="mt-4 space-y-3">
                  <p className="text-white/90 font-medium">
                    Change is movement through space over time.
                  </p>
                  <p className="text-white/70 text-sm">
                    Systems are dynamic - their components can move, transform, appear, and disappear. This ability to change is what makes systems alive and adaptive.
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-purple-400/60 text-xs">
                    Added to Archive & Notebook
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      )}
      
      {/* Concept Viewer */}
      <ConceptViewer
        concept={viewingConcept}
        isOpen={showConceptViewer}
        onClose={() => {
          setShowConceptViewer(false)
          setViewingConcept(null)
          setInitialPropertyId(undefined)
        }}
        initialPropertyId={initialPropertyId}
      />
      
      {/* Completion Screen */}
      {showCompletionScreen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center p-6"
        >
          <div className="max-w-2xl w-full">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-2xl p-8 text-center"
            >
              <m.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-cosmic-aurora/20 rounded-full flex items-center justify-center"
              >
                <Award className="w-10 h-10 text-cosmic-aurora" />
              </m.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Lesson Complete!</h2>
              <p className="text-white/80 mb-6">You've mastered the fundamentals of Systems Thinking</p>

              {/* Cooldown Timer */}
              <div className="bg-cosmic-void/50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-cosmic-aurora" />
                  <h3 className="text-xl font-semibold text-white">Learning Cooldown</h3>
                </div>
                <p className="text-white/70 mb-4">
                  Take a moment to let the concepts sink in before proceeding
                </p>
                <div className="relative w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <m.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 180, ease: "linear" }}
                    className="absolute h-full bg-cosmic-aurora"
                  />
                </div>
                <p className="text-cosmic-aurora text-2xl font-bold mt-3">
                  {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/review')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-cosmic-aurora" />
                  <span className="text-white/80 text-sm">Review Notes</span>
                </m.button>

                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/unwind')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <Brain className="w-6 h-6 text-cosmic-starlight" />
                  <span className="text-white/80 text-sm">Meditate</span>
                </m.button>

                <m.button
                  whileHover={{ scale: cooldownTime === 0 ? 1.05 : 1 }}
                  whileTap={{ scale: cooldownTime === 0 ? 0.95 : 1 }}
                  onClick={() => cooldownTime === 0 && router.push('/lessons')}
                  disabled={cooldownTime > 0}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    cooldownTime === 0 
                      ? 'bg-cosmic-aurora hover:bg-cosmic-aurora/80 cursor-pointer' 
                      : 'bg-cosmic-void/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                  <span className="text-white text-sm font-medium">
                    {cooldownTime === 0 ? 'Continue' : 'Wait...'}
                  </span>
                </m.button>
              </div>
            </m.div>
          </div>
        </m.div>
      )}
    </div>
  )
}

export default function Lesson0Page() {
  return (
    <ProtectedRoute>
      <Lesson0Content />
    </ProtectedRoute>
  )
}