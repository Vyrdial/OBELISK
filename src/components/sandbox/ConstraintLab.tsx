'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { m, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Plus, Minus, Eye, EyeOff, Link2, Unlink,
  Move3D, Edit3, Trash2, Settings, Play, Pause, RotateCcw,
  ChevronDown, ChevronRight, Info, Save, Copy, Sliders,
  Zap, Circle, Square, Triangle, Hexagon, Star
} from 'lucide-react'

// Core types for our constraint-based system
interface ConstraintVariable {
  id: string
  name: string
  value: number
  min: number
  max: number
  locked: boolean
  color: string
}

interface ConstraintNode {
  id: string
  label: string
  type: 'variable' | 'constant' | 'operator' | 'constraint'
  variables: Map<string, ConstraintVariable>
  
  // Visual properties
  position: THREE.Vector3
  velocity: THREE.Vector3
  mesh?: THREE.Mesh
  
  // Constraint properties
  mass: number
  charge: number
  elasticity: number
  
  // Relationships
  connections: Map<string, Connection>
  
  // Visual customization
  shape: 'sphere' | 'cube' | 'pyramid' | 'torus' | 'star'
  size: number
  color: string
  glowIntensity: number
  
  // Metadata
  notes: string
  createdAt: number
  selected: boolean
  hovered: boolean
  dragging: boolean
}

interface Connection {
  id: string
  sourceId: string
  targetId: string
  type: 'equality' | 'inequality' | 'proportional' | 'inverse' | 'sum' | 'product'
  strength: number
  elasticity: number
  visible: boolean
  expression?: string // e.g., "2x + 3y = z"
  line?: THREE.Line
}

interface ConstraintSystem {
  nodes: Map<string, ConstraintNode>
  connections: Map<string, Connection>
  globalConstraints: GlobalConstraint[]
  time: number
  solving: boolean
}

interface GlobalConstraint {
  id: string
  name: string
  expression: string
  satisfied: boolean
  error: number
}

interface Props {
  onBack?: () => void
}

export default function ConstraintLab({ onBack }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef = useRef<number | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  
  // Interaction refs
  const controlsRef = useRef<any>({
    isRotating: false,
    isDragging: false,
    draggedNode: null as ConstraintNode | null,
    mouseX: 0,
    mouseY: 0,
    theta: Math.PI / 3,
    phi: Math.PI / 6,
    distance: 25
  })

  // State
  const [constraintSystem, setConstraintSystem] = useState<ConstraintSystem>({
    nodes: new Map(),
    connections: new Map(),
    globalConstraints: [],
    time: 0,
    solving: false
  })
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [simulationRunning, setSimulationRunning] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showForces, setShowForces] = useState(false)
  
  // UI Panels
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showNodeEditor, setShowNodeEditor] = useState(false)
  const [showConnectionBuilder, setShowConnectionBuilder] = useState(false)
  const [connectionSource, setConnectionSource] = useState<string | null>(null)
  const [connectionTarget, setConnectionTarget] = useState<string | null>(null)

  // Initialize Three.js
  useEffect(() => {
    if (!mountRef.current) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000814)
    scene.fog = new THREE.Fog(0x000814, 30, 80)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(20, 15, 20)
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(20, 30, 20)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Grid helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x2a2a3e, 0x1a1a2e)
    gridHelper.name = 'grid'
    scene.add(gridHelper)

    // Axes helper (subtle)
    const axesHelper = new THREE.AxesHelper(3)
    axesHelper.name = 'axes'
    scene.add(axesHelper)

    // Camera controls
    const updateCamera = () => {
      const { theta, phi, distance } = controlsRef.current
      const x = distance * Math.sin(theta) * Math.cos(phi)
      const y = distance * Math.sin(phi)
      const z = distance * Math.cos(theta) * Math.cos(phi)
      camera.position.set(x, y, z)
      camera.lookAt(0, 0, 0)
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mountRef.current!.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      if (controlsRef.current.isRotating) {
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
      } else if (controlsRef.current.isDragging && controlsRef.current.draggedNode) {
        // Drag node in 3D space
        raycasterRef.current.setFromCamera(mouseRef.current, camera)
        
        // Create a plane at the node's current Y position
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -controlsRef.current.draggedNode.position.y)
        const intersection = new THREE.Vector3()
        raycasterRef.current.ray.intersectPlane(plane, intersection)
        
        if (intersection) {
          controlsRef.current.draggedNode.position.x = intersection.x
          controlsRef.current.draggedNode.position.z = intersection.z
          
          if (controlsRef.current.draggedNode.mesh) {
            controlsRef.current.draggedNode.mesh.position.copy(controlsRef.current.draggedNode.position)
          }
        }
      } else {
        // Hover detection
        raycasterRef.current.setFromCamera(mouseRef.current, camera)
        const intersects = raycasterRef.current.intersectObjects(
          scene.children.filter(obj => obj.userData.nodeId)
        )
        
        if (intersects.length > 0) {
          const nodeId = intersects[0].object.userData.nodeId
          setHoveredNode(nodeId)
          document.body.style.cursor = 'pointer'
        } else {
          setHoveredNode(null)
          document.body.style.cursor = 'default'
        }
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        if (!e.shiftKey && hoveredNode) {
          // Start dragging
          const node = constraintSystem.nodes.get(hoveredNode)
          if (node) {
            controlsRef.current.isDragging = true
            controlsRef.current.draggedNode = node
            node.dragging = true
          }
        } else if (e.shiftKey) {
          // Start rotating
          controlsRef.current.isRotating = true
          controlsRef.current.mouseX = e.clientX
          controlsRef.current.mouseY = e.clientY
        }
      } else if (e.button === 2) { // Right click
        controlsRef.current.isRotating = true
        controlsRef.current.mouseX = e.clientX
        controlsRef.current.mouseY = e.clientY
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (controlsRef.current.isDragging && controlsRef.current.draggedNode) {
        controlsRef.current.draggedNode.dragging = false
        controlsRef.current.draggedNode = null
      }
      controlsRef.current.isDragging = false
      controlsRef.current.isRotating = false
    }

    const handleClick = (e: MouseEvent) => {
      if (!controlsRef.current.isDragging && hoveredNode) {
        setSelectedNode(hoveredNode)
        setShowNodeEditor(true)
      }
    }

    const handleDoubleClick = (e: MouseEvent) => {
      if (hoveredNode && connectionSource && hoveredNode !== connectionSource) {
        setConnectionTarget(hoveredNode)
        setShowConnectionBuilder(true)
      } else if (hoveredNode) {
        setConnectionSource(hoveredNode)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      controlsRef.current.distance = Math.max(
        10,
        Math.min(60, controlsRef.current.distance * (1 + e.deltaY * 0.001))
      )
      updateCamera()
    }

    // Event listeners
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('click', handleClick)
    renderer.domElement.addEventListener('dblclick', handleDoubleClick)
    renderer.domElement.addEventListener('wheel', handleWheel)
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())
    window.addEventListener('mouseup', handleMouseUp)

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      
      // Update physics if running
      if (simulationRunning) {
        updateConstraintPhysics()
      }
      
      // Update visuals
      updateNodeVisuals()
      updateConnectionVisuals()
      
      renderer.render(scene, camera)
    }

    // Physics simulation
    const updateConstraintPhysics = () => {
      constraintSystem.nodes.forEach(node => {
        if (node.dragging) return
        
        // Apply constraint forces
        let force = new THREE.Vector3()
        
        node.connections.forEach((connection, targetId) => {
          const target = constraintSystem.nodes.get(targetId)
          if (!target) return
          
          const delta = target.position.clone().sub(node.position)
          const distance = delta.length()
          
          if (distance > 0) {
            delta.normalize()
            
            // Different force types based on connection
            if (connection.type === 'equality') {
              // Spring force
              const springForce = delta.multiplyScalar(
                connection.strength * (distance - 5) * 0.1
              )
              force.add(springForce)
            } else if (connection.type === 'inequality') {
              // Repulsion if too close
              if (distance < 5) {
                force.add(delta.multiplyScalar(-connection.strength * 2))
              }
            }
          }
        })
        
        // Add some damping
        force.sub(node.velocity.clone().multiplyScalar(0.1))
        
        // Update velocity and position
        node.velocity.add(force.multiplyScalar(0.016))
        node.velocity.multiplyScalar(0.98) // Friction
        node.position.add(node.velocity.clone().multiplyScalar(0.016))
        
        // Keep nodes from flying away
        const maxDist = 20
        if (node.position.length() > maxDist) {
          node.position.normalize().multiplyScalar(maxDist)
          node.velocity.multiplyScalar(0.5)
        }
        
        // Update mesh position
        if (node.mesh) {
          node.mesh.position.copy(node.position)
        }
      })
    }

    const updateNodeVisuals = () => {
      constraintSystem.nodes.forEach(node => {
        if (!node.mesh) return
        
        // Pulsate if selected
        if (node.selected) {
          const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1
          node.mesh.scale.setScalar(node.size * scale)
        } else if (node.hovered) {
          node.mesh.scale.setScalar(node.size * 1.2)
        } else {
          node.mesh.scale.setScalar(node.size)
        }
        
        // Rotate slowly
        node.mesh.rotation.y += 0.005
      })
    }

    const updateConnectionVisuals = () => {
      if (!showConnections) return
      
      constraintSystem.connections.forEach(connection => {
        if (!connection.line) return
        
        const source = constraintSystem.nodes.get(connection.sourceId)
        const target = constraintSystem.nodes.get(connection.targetId)
        
        if (source && target) {
          const geometry = connection.line.geometry as THREE.BufferGeometry
          const positions = geometry.attributes.position.array as Float32Array
          
          positions[0] = source.position.x
          positions[1] = source.position.y
          positions[2] = source.position.z
          positions[3] = target.position.x
          positions[4] = target.position.y
          positions[5] = target.position.z
          
          geometry.attributes.position.needsUpdate = true
        }
      })
    }

    updateCamera()
    animate()

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('click', handleClick)
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mouseup', handleMouseUp)
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
  }, [hoveredNode, showConnections, simulationRunning, constraintSystem])

  // Create a new node
  const createNode = useCallback((
    label: string,
    type: ConstraintNode['type'],
    shape: ConstraintNode['shape'] = 'sphere'
  ) => {
    if (!sceneRef.current) return null
    
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`
    
    // Create geometry based on shape
    let geometry: THREE.BufferGeometry
    switch (shape) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1)
        break
      case 'pyramid':
        geometry = new THREE.TetrahedronGeometry(0.7)
        break
      case 'torus':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16)
        break
      case 'star':
        geometry = new THREE.OctahedronGeometry(0.6)
        break
      default:
        geometry = new THREE.SphereGeometry(0.6, 32, 16)
    }
    
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData.nodeId = id
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    // Random initial position
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      Math.random() * 5,
      (Math.random() - 0.5) * 10
    )
    mesh.position.copy(position)
    
    sceneRef.current.add(mesh)
    
    const node: ConstraintNode = {
      id,
      label,
      type,
      variables: new Map(),
      position,
      velocity: new THREE.Vector3(),
      mesh,
      mass: 1,
      charge: 0,
      elasticity: 0.8,
      connections: new Map(),
      shape,
      size: 1,
      color,
      glowIntensity: 0.5,
      notes: '',
      createdAt: Date.now(),
      selected: false,
      hovered: false,
      dragging: false
    }
    
    // Add default variable
    node.variables.set('value', {
      id: `${id}-value`,
      name: 'value',
      value: Math.random() * 100,
      min: 0,
      max: 100,
      locked: false,
      color
    })
    
    setConstraintSystem(prev => {
      const newSystem = { ...prev }
      newSystem.nodes.set(id, node)
      return newSystem
    })
    
    return id
  }, [])

  // Create connection between nodes
  const createConnection = useCallback((
    sourceId: string,
    targetId: string,
    type: Connection['type'],
    expression?: string
  ) => {
    if (!sceneRef.current) return
    
    const source = constraintSystem.nodes.get(sourceId)
    const target = constraintSystem.nodes.get(targetId)
    
    if (!source || !target) return
    
    const id = `conn-${sourceId}-${targetId}`
    
    // Create visual line
    const geometry = new THREE.BufferGeometry().setFromPoints([
      source.position,
      target.position
    ])
    
    const material = new THREE.LineBasicMaterial({
      color: type === 'equality' ? 0x44ff44 :
             type === 'inequality' ? 0xff4444 :
             type === 'proportional' ? 0x4444ff :
             type === 'inverse' ? 0xff44ff :
             type === 'sum' ? 0xffff44 : 0x44ffff,
      opacity: 0.6,
      transparent: true,
      linewidth: 2
    })
    
    const line = new THREE.Line(geometry, material)
    line.name = id
    sceneRef.current.add(line)
    
    const connection: Connection = {
      id,
      sourceId,
      targetId,
      type,
      strength: 1,
      elasticity: 0.5,
      visible: true,
      expression,
      line
    }
    
    // Update nodes
    source.connections.set(targetId, connection)
    target.connections.set(sourceId, connection)
    
    setConstraintSystem(prev => {
      const newSystem = { ...prev }
      newSystem.connections.set(id, connection)
      return newSystem
    })
  }, [constraintSystem])

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    const node = constraintSystem.nodes.get(nodeId)
    if (!node) return
    
    // Remove mesh
    if (node.mesh && sceneRef.current) {
      sceneRef.current.remove(node.mesh)
      if (node.mesh.geometry) node.mesh.geometry.dispose()
      if (node.mesh.material) (node.mesh.material as THREE.Material).dispose()
    }
    
    // Remove connections
    node.connections.forEach((conn, targetId) => {
      if (conn.line && sceneRef.current) {
        sceneRef.current.remove(conn.line)
        if (conn.line.geometry) conn.line.geometry.dispose()
        if (conn.line.material) (conn.line.material as THREE.Material).dispose()
      }
      
      // Remove from target node
      const target = constraintSystem.nodes.get(targetId)
      if (target) {
        target.connections.delete(nodeId)
      }
    })
    
    setConstraintSystem(prev => {
      const newSystem = { ...prev }
      newSystem.nodes.delete(nodeId)
      
      // Remove connections from system
      node.connections.forEach((conn) => {
        newSystem.connections.delete(conn.id)
      })
      
      return newSystem
    })
    
    if (selectedNode === nodeId) {
      setSelectedNode(null)
      setShowNodeEditor(false)
    }
  }, [constraintSystem, selectedNode])

  // No longer auto-creating demo nodes to avoid redundant initial nodes

  // Selected node for editing
  const selectedNodeData = selectedNode ? constraintSystem.nodes.get(selectedNode) : null

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Exit Button */}
      {onBack && (
        <m.button
          onClick={onBack}
          className="absolute top-4 left-4 z-[60] p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        </m.button>
      )}

      {/* 3D Viewport */}
      <div className="absolute inset-0" ref={mountRef} />

      {/* Top Toolbar - Enhanced UI */}
      <div className="absolute top-4 left-0 right-0 z-30 pointer-events-none px-4">
        <div className="flex items-start gap-4 justify-center">
          {/* Main Controls - Enhanced styling */}
          <div className="bg-gradient-to-br from-slate-900/90 via-gray-900/95 to-black/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 p-[1px]">
              <div className="bg-gradient-to-b from-gray-900/95 to-black/95 rounded-2xl">
                <div className="flex items-center gap-2 p-2">
                  {/* Add Node - Enhanced */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
                    <button
                      onClick={() => setShowAddPanel(!showAddPanel)}
                      className={`relative px-3 py-2 rounded-xl transition-all flex items-center gap-2 ${
                        showAddPanel 
                          ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/15 text-cyan-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' 
                          : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-400 hover:from-blue-500/15 hover:to-cyan-500/10 hover:text-cyan-400'
                      }`}
                    >
                      <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                      <span className="text-xs font-medium">Add</span>
                    </button>
                  </div>

                  {/* Connection Mode - Enhanced */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
                    <button
                      onClick={() => {
                        if (connectionSource) {
                          setConnectionSource(null)
                          setConnectionTarget(null)
                        } else {
                          alert('Double-click nodes to connect them')
                        }
                      }}
                      className={`relative px-3 py-2 rounded-xl transition-all flex items-center gap-2 ${
                        connectionSource
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/15 text-emerald-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                          : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-400 hover:from-green-500/15 hover:to-emerald-500/10 hover:text-emerald-400'
                      }`}
                    >
                      <Link2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Link</span>
                    </button>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                  {/* View Controls Group - More compact */}
                  <div className="flex items-center bg-slate-900/50 rounded-xl p-1">
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-2 rounded-lg transition-all ${
                        showGrid
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                      }`}
                      title="Grid"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowConnections(!showConnections)}
                      className={`p-2 rounded-lg transition-all ${
                        showConnections
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                      }`}
                      title="Connections"
                    >
                      {showConnections ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setShowLabels(!showLabels)}
                      className={`p-2 rounded-lg transition-all ${
                        showLabels
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                      }`}
                      title="Labels"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                  {/* Simulation Control - Enhanced */}
                  <div className="relative group">
                    <div className={`absolute inset-0 rounded-xl blur opacity-25 transition-opacity duration-300 ${
                      simulationRunning 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                        : 'bg-gradient-to-r from-orange-400 to-amber-400'
                    }`} />
                    <button
                      onClick={() => setSimulationRunning(!simulationRunning)}
                      className={`relative px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                        simulationRunning
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/15 text-emerald-400'
                          : 'bg-gradient-to-br from-orange-500/20 to-amber-500/15 text-amber-400'
                      }`}
                    >
                      {simulationRunning ? (
                        <>
                          <div className="relative">
                            <Play className="w-4 h-4" />
                            <div className="absolute inset-0 animate-ping">
                              <Play className="w-4 h-4 opacity-50" />
                            </div>
                          </div>
                          <span className="text-xs font-semibold">Active</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4" />
                          <span className="text-xs font-semibold">Paused</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      constraintSystem.nodes.forEach(node => {
                        node.position.set(
                          (Math.random() - 0.5) * 10,
                          Math.random() * 5,
                          (Math.random() - 0.5) * 10
                        )
                        node.velocity.set(0, 0, 0)
                      })
                    }}
                    className="p-2 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-400 hover:from-purple-500/15 hover:to-pink-500/10 hover:text-purple-400 transition-all group"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Display - Enhanced styling */}
          <div className="bg-gradient-to-br from-slate-900/90 via-gray-900/95 to-black/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] pointer-events-auto">
            <div className="bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-[1px] rounded-2xl">
              <div className="bg-gradient-to-b from-gray-900/95 to-black/95 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-50" />
                    </div>
                    <span className="text-slate-500 font-medium">Nodes</span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">{constraintSystem.nodes.size}</span>
                  </div>
                  <div className="w-px h-4 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
                    </div>
                    <span className="text-slate-500 font-medium">Links</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{constraintSystem.connections.size}</span>
                  </div>
                  {hoveredNode && (
                    <>
                      <div className="w-px h-4 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-slate-500 font-medium">Focus</span>
                        <span className="text-amber-400 font-bold">{constraintSystem.nodes.get(hoveredNode)?.label}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Node Panel */}
      <AnimatePresence>
        {showAddPanel && (
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-20 left-4 z-40 w-80 pointer-events-auto"
          >
            <div className="bg-black/95 backdrop-blur-xl rounded-xl border border-blue-500/30 shadow-2xl p-6">
              <h3 className="text-blue-400 text-lg font-medium mb-4">Add Node</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Label</label>
                  <input
                    type="text"
                    id="node-label"
                    placeholder="Node name..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Type</label>
                  <select 
                    id="node-type"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                  >
                    <option value="variable">Variable</option>
                    <option value="constant">Constant</option>
                    <option value="operator">Operator</option>
                    <option value="constraint">Constraint</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Shape</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 'sphere', icon: Circle },
                      { value: 'cube', icon: Square },
                      { value: 'pyramid', icon: Triangle },
                      { value: 'torus', icon: Circle },
                      { value: 'star', icon: Star }
                    ].map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          const input = document.getElementById('node-shape') as HTMLInputElement
                          if (input) input.value = value
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      >
                        <Icon className="w-4 h-4 text-white/60" />
                      </button>
                    ))}
                  </div>
                  <input type="hidden" id="node-shape" defaultValue="sphere" />
                </div>

                <button
                  onClick={() => {
                    const labelInput = document.getElementById('node-label') as HTMLInputElement
                    const typeInput = document.getElementById('node-type') as HTMLSelectElement
                    const shapeInput = document.getElementById('node-shape') as HTMLInputElement
                    
                    const label = labelInput?.value || 'Node'
                    const type = typeInput?.value as ConstraintNode['type'] || 'variable'
                    const shape = shapeInput?.value as ConstraintNode['shape'] || 'sphere'
                    
                    createNode(label, type, shape)
                    setShowAddPanel(false)
                    
                    if (labelInput) labelInput.value = ''
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500/30 to-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:from-blue-500/40 hover:to-blue-500/30 transition-all"
                >
                  Create Node
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Node Editor Panel */}
      <AnimatePresence>
        {showNodeEditor && selectedNodeData && (
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 z-40 w-96 max-h-[calc(100vh-6rem)] overflow-y-auto pointer-events-auto"
          >
            <div className="bg-black/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-purple-400 text-lg font-medium">Node Properties</h3>
                  <button
                    onClick={() => setShowNodeEditor(false)}
                    className="text-white/40 hover:text-white/60 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Label</label>
                    <input
                      type="text"
                      value={selectedNodeData.label}
                      onChange={(e) => {
                        setConstraintSystem(prev => {
                          const newSystem = { ...prev }
                          const node = newSystem.nodes.get(selectedNode)
                          if (node) node.label = e.target.value
                          return newSystem
                        })
                      }}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['x', 'y', 'z'].map(axis => (
                        <div key={axis}>
                          <label className="text-white/40 text-xs">{axis.toUpperCase()}</label>
                          <input
                            type="number"
                            value={selectedNodeData.position[axis as 'x' | 'y' | 'z'].toFixed(2)}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0
                              setConstraintSystem(prev => {
                                const newSystem = { ...prev }
                                const node = newSystem.nodes.get(selectedNode)
                                if (node) {
                                  node.position[axis as 'x' | 'y' | 'z'] = value
                                  if (node.mesh) {
                                    node.mesh.position[axis as 'x' | 'y' | 'z'] = value
                                  }
                                }
                                return newSystem
                              })
                            }}
                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                            step="0.1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-white/10">
                <h4 className="text-white/80 text-sm font-medium mb-3">Variables</h4>
                <div className="space-y-2">
                  {Array.from(selectedNodeData.variables.values()).map(variable => (
                    <div key={variable.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={variable.name}
                          onChange={(e) => {
                            setConstraintSystem(prev => {
                              const newSystem = { ...prev }
                              const node = newSystem.nodes.get(selectedNode)
                              const var_ = node?.variables.get(variable.name)
                              if (var_) var_.name = e.target.value
                              return newSystem
                            })
                          }}
                          className="bg-transparent text-white/80 text-sm font-mono"
                        />
                        <button
                          onClick={() => {
                            setConstraintSystem(prev => {
                              const newSystem = { ...prev }
                              const node = newSystem.nodes.get(selectedNode)
                              const var_ = node?.variables.get(variable.name)
                              if (var_) var_.locked = !var_.locked
                              return newSystem
                            })
                          }}
                          className={`p-1 rounded ${
                            variable.locked ? 'text-red-400' : 'text-green-400'
                          }`}
                        >
                          {variable.locked ? '🔒' : '🔓'}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={variable.min}
                          max={variable.max}
                          value={variable.value}
                          onChange={(e) => {
                            setConstraintSystem(prev => {
                              const newSystem = { ...prev }
                              const node = newSystem.nodes.get(selectedNode)
                              const var_ = node?.variables.get(variable.name)
                              if (var_ && !var_.locked) {
                                var_.value = parseFloat(e.target.value)
                              }
                              return newSystem
                            })
                          }}
                          disabled={variable.locked}
                          className="flex-1"
                        />
                        <span className="text-white/60 font-mono text-sm w-12">
                          {variable.value.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const name = `var${selectedNodeData.variables.size + 1}`
                      setConstraintSystem(prev => {
                        const newSystem = { ...prev }
                        const node = newSystem.nodes.get(selectedNode)
                        if (node) {
                          node.variables.set(name, {
                            id: `${selectedNode}-${name}`,
                            name,
                            value: 50,
                            min: 0,
                            max: 100,
                            locked: false,
                            color: node.color
                          })
                        }
                        return newSystem
                      })
                    }}
                    className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 text-sm transition-all"
                  >
                    + Add Variable
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-white/80 text-sm font-medium mb-3">Connections</h4>
                <div className="space-y-2">
                  {Array.from(selectedNodeData.connections.values()).map(conn => {
                    const targetNode = constraintSystem.nodes.get(
                      conn.sourceId === selectedNode ? conn.targetId : conn.sourceId
                    )
                    return (
                      <div key={conn.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            conn.type === 'equality' ? 'bg-green-400' :
                            conn.type === 'inequality' ? 'bg-red-400' :
                            conn.type === 'proportional' ? 'bg-blue-400' :
                            'bg-yellow-400'
                          }`} />
                          <span className="text-white/60 text-sm">
                            {targetNode?.label || 'Unknown'}
                          </span>
                          {conn.expression && (
                            <span className="text-white/40 text-xs font-mono">
                              {conn.expression}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            // Remove connection
                            if (conn.line && sceneRef.current) {
                              sceneRef.current.remove(conn.line)
                            }
                            setConstraintSystem(prev => {
                              const newSystem = { ...prev }
                              newSystem.connections.delete(conn.id)
                              const source = newSystem.nodes.get(conn.sourceId)
                              const target = newSystem.nodes.get(conn.targetId)
                              source?.connections.delete(conn.targetId)
                              target?.connections.delete(conn.sourceId)
                              return newSystem
                            })
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Unlink className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => deleteNode(selectedNode)}
                    className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete Node
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Connection Builder */}
      <AnimatePresence>
        {showConnectionBuilder && connectionSource && connectionTarget && (
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
            onClick={() => setShowConnectionBuilder(false)}
          >
            <div 
              className="bg-black/95 backdrop-blur-xl rounded-xl border border-green-500/30 shadow-2xl p-6 w-96"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-green-400 text-lg font-medium mb-4">Create Connection</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-white/60">
                  <span>{constraintSystem.nodes.get(connectionSource)?.label}</span>
                  <span>→</span>
                  <span>{constraintSystem.nodes.get(connectionTarget)?.label}</span>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Connection Type</label>
                  <select 
                    id="conn-type"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    <option value="equality">Equality (=)</option>
                    <option value="inequality">Inequality (≠)</option>
                    <option value="proportional">Proportional (∝)</option>
                    <option value="inverse">Inverse (1/x)</option>
                    <option value="sum">Sum (+)</option>
                    <option value="product">Product (×)</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Expression (optional)</label>
                  <input
                    type="text"
                    id="conn-expression"
                    placeholder="e.g., 2X + Y = 10"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const typeInput = document.getElementById('conn-type') as HTMLSelectElement
                      const exprInput = document.getElementById('conn-expression') as HTMLInputElement
                      
                      createConnection(
                        connectionSource,
                        connectionTarget,
                        typeInput.value as Connection['type'],
                        exprInput.value || undefined
                      )
                      
                      setShowConnectionBuilder(false)
                      setConnectionSource(null)
                      setConnectionTarget(null)
                    }}
                    className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowConnectionBuilder(false)
                      setConnectionSource(null)
                      setConnectionTarget(null)
                    }}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="text-[11px] text-white/30 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Click</kbd>
              <span>Select</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Drag</kbd>
              <span>Move</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Double-click</kbd>
              <span>Connect</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Shift+Drag</kbd>
              <span>Rotate</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Scroll</kbd>
              <span>Zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}