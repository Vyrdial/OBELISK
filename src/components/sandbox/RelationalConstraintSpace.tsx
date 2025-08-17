'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Network, Zap, Anchor, Link2, Layers, 
  ArrowLeft, Plus, Minus, Eye, EyeOff, GitBranch,
  Activity, Magnet, Orbit, Shuffle, Info
} from 'lucide-react'

// Core concept: Objects defined by relationships, not positions
interface ConstraintNode {
  id: string
  label: string
  // No x,y,z coordinates! Position emerges from constraints
  conservedQuantity: number
  relationships: Map<string, RelationshipType>
  symmetries: SymmetryType[]
  resonance: number // How "stable" this node is given its constraints
  field: FieldType
  mesh?: THREE.Object3D
  color: THREE.Color
}

interface RelationshipType {
  type: 'conservation' | 'symmetry' | 'tension' | 'resonance' | 'exclusion'
  strength: number
  bidirectional: boolean
  conserves?: string // what quantity is conserved
}

interface SymmetryType {
  type: 'rotational' | 'reflective' | 'translational' | 'scale'
  order?: number
}

interface FieldType {
  type: 'attractive' | 'repulsive' | 'neutral' | 'oscillating'
  strength: number
  range: number
}

interface ConstraintWeb {
  nodes: Map<string, ConstraintNode>
  globalConservation: {
    total: number
    mustEqual: number
  }
  emergentDimension: number // Calculated from relationship complexity
}

interface Props {
  onBack?: () => void
}

export default function RelationalConstraintSpace({ onBack }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef = useRef<number | null>(null)
  const simulationRef = useRef<boolean>(true)
  
  // Physics simulation refs
  const nodesGroupRef = useRef<THREE.Group | null>(null)
  const connectionsGroupRef = useRef<THREE.Group | null>(null)
  const fieldsGroupRef = useRef<THREE.Group | null>(null)
  
  // Camera controls
  const controlsRef = useRef<any>({
    isRotating: false,
    mouseX: 0,
    mouseY: 0,
    theta: Math.PI / 3,
    phi: Math.PI / 6,
    distance: 20
  })

  // State
  const [constraintWeb, setConstraintWeb] = useState<ConstraintWeb>({
    nodes: new Map(),
    globalConservation: { total: 0, mustEqual: 100 },
    emergentDimension: 0
  })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showFields, setShowFields] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [showResonance, setShowResonance] = useState(true)
  const [simulationRunning, setSimulationRunning] = useState(true)
  const [addNodePanel, setAddNodePanel] = useState(false)
  const [linkMode, setLinkMode] = useState(false)
  const [linkSource, setLinkSource] = useState<string | null>(null)

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000511)
    scene.fog = new THREE.Fog(0x000511, 30, 100)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 10, 15)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }
    mountRef.current.appendChild(renderer.domElement)

    // Lighting - minimal, let the constraints glow
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)

    // Groups for organization
    const nodesGroup = new THREE.Group()
    nodesGroup.name = 'nodes'
    nodesGroupRef.current = nodesGroup
    scene.add(nodesGroup)

    const connectionsGroup = new THREE.Group()
    connectionsGroup.name = 'connections'
    connectionsGroupRef.current = connectionsGroup
    scene.add(connectionsGroup)

    const fieldsGroup = new THREE.Group()
    fieldsGroup.name = 'fields'
    fieldsGroupRef.current = fieldsGroup
    scene.add(fieldsGroup)

    // Camera controls
    const updateCamera = () => {
      const { theta, phi, distance } = controlsRef.current
      const x = distance * Math.sin(theta) * Math.cos(phi)
      const y = distance * Math.sin(phi)
      const z = distance * Math.cos(theta) * Math.cos(phi)
      camera.position.set(x, y, z)
      camera.lookAt(0, 0, 0)
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        controlsRef.current.isRotating = true
        controlsRef.current.mouseX = e.clientX
        controlsRef.current.mouseY = e.clientY
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!controlsRef.current.isRotating) return
      
      const deltaX = e.clientX - controlsRef.current.mouseX
      const deltaY = e.clientY - controlsRef.current.mouseY
      
      controlsRef.current.theta -= deltaX * 0.01
      controlsRef.current.phi = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, controlsRef.current.phi + deltaY * 0.01)
      )
      
      controlsRef.current.mouseX = e.clientX
      controlsRef.current.mouseY = e.clientY
      updateCamera()
    }

    const handleMouseUp = () => {
      controlsRef.current.isRotating = false
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      controlsRef.current.distance = Math.max(
        5,
        Math.min(50, controlsRef.current.distance * (1 + e.deltaY * 0.001))
      )
      updateCamera()
    }

    // Event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('wheel', handleWheel)
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop with constraint physics
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      
      // Update constraint-based positions
      if (simulationRef.current && nodesGroupRef.current) {
        nodesGroupRef.current.children.forEach((mesh) => {
          // Add gentle rotation to show it's dynamic
          mesh.rotation.y += 0.002
          mesh.rotation.x += 0.001
          
          // Pulsate based on resonance
          const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05
          mesh.scale.setScalar(scale)
        })
      }
      
      renderer.render(scene, camera)
    }

    updateCamera()
    animate()

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      
      scene.clear()
      renderer.dispose()
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Calculate emergent positions from constraints
  const calculateEmergentGeometry = useCallback((web: ConstraintWeb) => {
    const positions = new Map<string, THREE.Vector3>()
    const nodes = Array.from(web.nodes.values())
    
    if (nodes.length === 0) return positions
    
    // Use constraint relationships to determine relative positions
    // This is where the magic happens - no predetermined coordinates!
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2
      const radius = 5 + node.resonance * 3
      
      // Position emerges from the node's relationships
      let x = Math.cos(angle) * radius
      let y = (node.conservedQuantity / 50 - 1) * 5 // Height from conservation
      let z = Math.sin(angle) * radius
      
      // Adjust based on relationships
      node.relationships.forEach((rel, targetId) => {
        const target = web.nodes.get(targetId)
        if (target) {
          const targetIndex = nodes.findIndex(n => n.id === targetId)
          const targetAngle = (targetIndex / nodes.length) * Math.PI * 2
          
          if (rel.type === 'conservation') {
            // Conservation relationships pull nodes to similar heights
            y = (y + (target.conservedQuantity / 50 - 1) * 5) / 2
          } else if (rel.type === 'tension') {
            // Tension creates distance
            const push = rel.strength * 2
            x += Math.cos(targetAngle) * push
            z += Math.sin(targetAngle) * push
          } else if (rel.type === 'resonance') {
            // Resonance creates orbits
            const orbitRadius = rel.strength * 3
            x = Math.cos(angle + Date.now() * 0.0001) * orbitRadius
            z = Math.sin(angle + Date.now() * 0.0001) * orbitRadius
          }
        }
      })
      
      positions.set(node.id, new THREE.Vector3(x, y, z))
    })
    
    return positions
  }, [])

  // Add a constraint node
  const addConstraintNode = useCallback((
    label: string,
    conservedQuantity: number,
    field: FieldType,
    symmetries: SymmetryType[]
  ) => {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const node: ConstraintNode = {
      id,
      label,
      conservedQuantity,
      relationships: new Map(),
      symmetries,
      resonance: 1,
      field,
      color: new THREE.Color(`hsl(${Math.random() * 360}, 70%, 60%)`)
    }
    
    // Create visual representation
    if (nodesGroupRef.current && sceneRef.current) {
      // Node is a glowing sphere with energy field
      const geometry = new THREE.IcosahedronGeometry(0.5, 2)
      const material = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = id
      
      // Add glow effect
      const glowGeometry = new THREE.IcosahedronGeometry(0.7, 2)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.2
      })
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
      mesh.add(glowMesh)
      
      nodesGroupRef.current.add(mesh)
      node.mesh = mesh
    }
    
    setConstraintWeb(prev => {
      const newWeb = { ...prev }
      newWeb.nodes.set(id, node)
      newWeb.globalConservation.total += conservedQuantity
      newWeb.emergentDimension = Math.ceil(Math.log2(newWeb.nodes.size + 1))
      return newWeb
    })
    
    return id
  }, [])

  // Create relationship between nodes
  const createRelationship = useCallback((
    sourceId: string,
    targetId: string,
    relationship: RelationshipType
  ) => {
    setConstraintWeb(prev => {
      const newWeb = { ...prev }
      const source = newWeb.nodes.get(sourceId)
      const target = newWeb.nodes.get(targetId)
      
      if (source && target) {
        source.relationships.set(targetId, relationship)
        if (relationship.bidirectional) {
          target.relationships.set(sourceId, relationship)
        }
        
        // Update resonance based on relationship harmony
        source.resonance = calculateResonance(source)
        target.resonance = calculateResonance(target)
        
        // Visual connection
        if (connectionsGroupRef.current && source.mesh && target.mesh) {
          const positions = calculateEmergentGeometry(newWeb)
          const sourcePos = positions.get(sourceId) || new THREE.Vector3()
          const targetPos = positions.get(targetId) || new THREE.Vector3()
          
          const geometry = new THREE.BufferGeometry().setFromPoints([
            sourcePos,
            targetPos
          ])
          
          const material = new THREE.LineBasicMaterial({
            color: relationship.type === 'conservation' ? 0x44ff44 :
                   relationship.type === 'tension' ? 0xff4444 :
                   relationship.type === 'resonance' ? 0x4444ff : 0xffff44,
            opacity: relationship.strength,
            transparent: true
          })
          
          const line = new THREE.Line(geometry, material)
          line.name = `${sourceId}-${targetId}`
          connectionsGroupRef.current.add(line)
        }
      }
      
      return newWeb
    })
  }, [calculateEmergentGeometry])

  // Calculate node resonance (stability)
  const calculateResonance = (node: ConstraintNode): number => {
    let resonance = 1
    
    // Check conservation balance
    const conservationRelationships = Array.from(node.relationships.values())
      .filter(r => r.type === 'conservation')
    
    if (conservationRelationships.length > 0) {
      resonance *= 1.5
    }
    
    // Check symmetry
    if (node.symmetries.length > 0) {
      resonance *= (1 + node.symmetries.length * 0.2)
    }
    
    // Tension reduces resonance
    const tensionCount = Array.from(node.relationships.values())
      .filter(r => r.type === 'tension').length
    resonance /= (1 + tensionCount * 0.3)
    
    return Math.min(3, Math.max(0.1, resonance))
  }

  // Update node positions based on constraints
  useEffect(() => {
    if (!nodesGroupRef.current) return
    
    const positions = calculateEmergentGeometry(constraintWeb)
    
    constraintWeb.nodes.forEach((node) => {
      if (node.mesh) {
        const pos = positions.get(node.id)
        if (pos) {
          // Smooth transition to new position
          node.mesh.position.lerp(pos, 0.1)
        }
      }
    })
    
    // Update connections
    if (connectionsGroupRef.current) {
      // Clear old connections
      while (connectionsGroupRef.current.children.length > 0) {
        const child = connectionsGroupRef.current.children[0]
        connectionsGroupRef.current.remove(child)
        if ((child as any).geometry) (child as any).geometry.dispose()
        if ((child as any).material) (child as any).material.dispose()
      }
      
      // Redraw connections
      constraintWeb.nodes.forEach((source) => {
        source.relationships.forEach((rel, targetId) => {
          const target = constraintWeb.nodes.get(targetId)
          if (target && source.mesh && target.mesh) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
              source.mesh.position,
              target.mesh.position
            ])
            
            const material = new THREE.LineBasicMaterial({
              color: rel.type === 'conservation' ? 0x44ff44 :
                     rel.type === 'tension' ? 0xff4444 :
                     rel.type === 'resonance' ? 0x4444ff : 0xffff44,
              opacity: 0.3 + rel.strength * 0.7,
              transparent: true,
              linewidth: rel.strength * 3
            })
            
            const line = new THREE.Line(geometry, material)
            connectionsGroupRef.current.add(line)
          }
        })
      })
    }
  }, [constraintWeb, calculateEmergentGeometry])

  // Demo: Create initial constraint web
  useEffect(() => {
    // Create a simple constraint system to demonstrate
    const n1 = addConstraintNode('Alpha', 30, 
      { type: 'attractive', strength: 1, range: 5 },
      [{ type: 'rotational', order: 3 }]
    )
    
    const n2 = addConstraintNode('Beta', 40,
      { type: 'repulsive', strength: 0.8, range: 4 },
      [{ type: 'reflective' }]
    )
    
    const n3 = addConstraintNode('Gamma', 30,
      { type: 'oscillating', strength: 1.2, range: 6 },
      [{ type: 'rotational', order: 4 }]
    )
    
    // Create relationships after a small delay
    setTimeout(() => {
      createRelationship(n1, n2, {
        type: 'conservation',
        strength: 1,
        bidirectional: true,
        conserves: 'energy'
      })
      
      createRelationship(n2, n3, {
        type: 'tension',
        strength: 0.7,
        bidirectional: false
      })
      
      createRelationship(n3, n1, {
        type: 'resonance',
        strength: 0.9,
        bidirectional: true
      })
    }, 100)
  }, []) // Empty deps intentionally - only run once

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Exit Button */}
      {onBack && (
        <m.button
          onClick={onBack}
          className="fixed top-24 left-6 z-[60] p-3 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </m.button>
      )}

      {/* 3D Viewport */}
      <div className="absolute inset-0" ref={mountRef} />

      {/* Control Panel */}
      <div className="absolute top-20 left-20 right-6 z-30 pointer-events-none">
        <div className="flex items-start gap-4">
          <div className="bg-black/80 backdrop-blur-xl rounded-xl p-3 border border-purple-500/30 pointer-events-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddNodePanel(!addNodePanel)}
                className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                title="Add Constraint Node"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLinkMode(!linkMode)}
                className={`p-2 rounded-lg transition-all ${
                  linkMode 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                }`}
                title="Create Relationship"
              >
                <Link2 className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-white/10" />

              <button
                onClick={() => setShowFields(!showFields)}
                className={`p-2 rounded-lg transition-all ${
                  showFields
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
                title="Toggle Fields"
              >
                <Orbit className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowConnections(!showConnections)}
                className={`p-2 rounded-lg transition-all ${
                  showConnections
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
                title="Toggle Connections"
              >
                <Network className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowResonance(!showResonance)}
                className={`p-2 rounded-lg transition-all ${
                  showResonance
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
                title="Toggle Resonance"
              >
                <Activity className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-white/10" />

              <button
                onClick={() => {
                  simulationRef.current = !simulationRef.current
                  setSimulationRunning(!simulationRunning)
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                  simulationRunning
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm">{simulationRunning ? 'Running' : 'Paused'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Node Panel */}
      <AnimatePresence>
        {addNodePanel && (
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-32 left-20 z-40 w-96 pointer-events-auto"
          >
            <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl p-6">
              <h3 className="text-purple-400 text-lg font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Add Constraint Node
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    Node Label
                  </label>
                  <input
                    type="text"
                    placeholder="Enter node name..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    Conserved Quantity (0-100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    Field Type
                  </label>
                  <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500/50 focus:outline-none">
                    <option value="attractive">Attractive</option>
                    <option value="repulsive">Repulsive</option>
                    <option value="oscillating">Oscillating</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-400 text-xs font-medium mb-1">This node will:</p>
                  <ul className="text-purple-300/80 text-xs space-y-1">
                    <li>• Exist through relationships, not coordinates</li>
                    <li>• Find its position through constraints</li>
                    <li>• Contribute to global conservation</li>
                    <li>• Generate emergent geometry</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    addConstraintNode(
                      'New Node',
                      50,
                      { type: 'attractive', strength: 1, range: 5 },
                      []
                    )
                    setAddNodePanel(false)
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500/30 to-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:from-purple-500/40 hover:to-purple-500/30 transition-all"
                >
                  Create Node
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto max-w-md">
        <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
          <h4 className="text-purple-400 text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Relational Constraint Space
          </h4>
          
          <div className="space-y-2 text-xs text-white/60">
            <div className="flex items-center justify-between">
              <span>Total Nodes:</span>
              <span className="text-purple-400 font-mono">{constraintWeb.nodes.size}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Global Conservation:</span>
              <span className="text-green-400 font-mono">
                {constraintWeb.globalConservation.total} / {constraintWeb.globalConservation.mustEqual}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Emergent Dimension:</span>
              <span className="text-blue-400 font-mono">{constraintWeb.emergentDimension}D</span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-amber-400/80">
                Space emerges from relationships. No axes, no coordinates - just constraints generating geometry.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
        <div className="text-xs text-white/40 bg-black/80 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/20">
          <div>Right-click or Shift+drag: Rotate • Scroll: Zoom</div>
          <div className="text-purple-400 mt-1">Create constraints, watch space emerge</div>
        </div>
      </div>
    </div>
  )
}