'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { m, AnimatePresence } from 'framer-motion'
import { Plus, MousePointer2, Sliders, ZoomIn, ZoomOut, Grid3x3, Move3D, Maximize2, Trash2, X, Calculator, ArrowLeft } from 'lucide-react'

interface Orb {
  id: string
  mesh: THREE.Mesh
  position: THREE.Vector3
  scale: THREE.Vector3
  color: string
  material: THREE.Material
  equation?: string
  type: 'point' | 'volume' | 'equation'
}

interface Transform {
  scaleX: number
  scaleY: number
  scaleZ: number
}

interface CreationParams {
  type: 'point' | 'volume' | 'equation'
  position: { x: number; y: number; z: number }
  radius: number
  equation: string
  color: string
}

interface ThreeDWorkspaceProps {
  onBack?: () => void
}

export default function ThreeDWorkspace({ onBack }: ThreeDWorkspaceProps = {}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const orbGroupRef = useRef<THREE.Group | null>(null)
  const orbsMapRef = useRef<Map<string, Orb>>(new Map())
  const gridHelperRef = useRef<THREE.GridHelper | null>(null)
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null)
  
  // Mouse interaction state
  const mouseRef = useRef({
    isRotating: false,
    isDragging: false,
    prevX: 0,
    prevY: 0,
    draggedOrb: null as Orb | null,
    theta: Math.PI / 4,
    phi: Math.PI / 4,
    distance: 15
  })
  
  const [orbs, setOrbs] = useState<Orb[]>([])
  const [selectedOrb, setSelectedOrb] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<'select' | 'create'>('select')
  const [showAxes, setShowAxes] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showCreationPanel, setShowCreationPanel] = useState(false)
  const [showTransformPanel, setShowTransformPanel] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // Creation parameters
  const [creationParams, setCreationParams] = useState<CreationParams>({
    type: 'point',
    position: { x: 0, y: 0, z: 0 },
    radius: 0.5,
    equation: '',
    color: '#ff6b6b'
  })
  
  const [transformation, setTransformation] = useState<Transform>({
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1
  })

  const MIN_ZOOM = 5
  const MAX_ZOOM = 30

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) {
      console.error('Mount ref not available')
      return
    }

    console.log('Initializing Three.js scene...')

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 50)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(10, 10, 10)
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    rendererRef.current = renderer
    
    // Clear any existing children before appending
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }
    mountRef.current.appendChild(renderer.domElement)
    
    console.log('Renderer attached to DOM')

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    scene.add(directionalLight)
    
    const pointLight = new THREE.PointLight(0x4a9eff, 0.5, 100)
    pointLight.position.set(-10, 5, -10)
    scene.add(pointLight)

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    gridHelperRef.current = gridHelper
    scene.add(gridHelper)
    
    // Add a ground plane to receive shadows
    const groundGeometry = new THREE.PlaneGeometry(40, 40)
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.01
    ground.receiveShadow = true
    scene.add(ground)

    // Axes
    const axesHelper = new THREE.AxesHelper(5)
    axesHelperRef.current = axesHelper
    scene.add(axesHelper)

    // Orb container group
    const orbGroup = new THREE.Group()
    orbGroupRef.current = orbGroup
    scene.add(orbGroup)

    // Mouse controls
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const updateCamera = () => {
      const { theta, phi, distance } = mouseRef.current
      const x = distance * Math.sin(theta) * Math.cos(phi)
      const y = distance * Math.sin(phi)
      const z = distance * Math.cos(theta) * Math.cos(phi)
      camera.position.set(x, y, z)
      camera.lookAt(0, 0, 0)
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return
      
      const rect = mountRef.current.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (mouseRef.current.isRotating) {
        console.log('Rotating camera')
        const deltaX = event.clientX - mouseRef.current.prevX
        const deltaY = event.clientY - mouseRef.current.prevY
        
        mouseRef.current.theta -= deltaX * 0.01
        mouseRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, mouseRef.current.phi - deltaY * 0.01))
        updateCamera()
      } else if (mouseRef.current.isDragging && mouseRef.current.draggedOrb) {
        raycaster.setFromCamera(mouse, camera)
        
        const planeNormal = new THREE.Vector3()
        camera.getWorldDirection(planeNormal)
        const plane = new THREE.Plane(planeNormal, 0)
        plane.setFromNormalAndCoplanarPoint(planeNormal, mouseRef.current.draggedOrb.position)
        
        const intersection = new THREE.Vector3()
        raycaster.ray.intersectPlane(plane, intersection)
        
        if (intersection) {
          mouseRef.current.draggedOrb.mesh.position.copy(intersection)
          mouseRef.current.draggedOrb.position.copy(intersection)
        }
      }

      mouseRef.current.prevX = event.clientX
      mouseRef.current.prevY = event.clientY
    }

    const handleMouseDown = (event: MouseEvent) => {
      console.log('Mouse down event', event.button, event.shiftKey)
      
      if (!mountRef.current) return
      
      mouseRef.current.prevX = event.clientX
      mouseRef.current.prevY = event.clientY

      const rect = mountRef.current.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(orbGroup.children)

      if (event.button === 0) { // Left click
        if (event.shiftKey) {
          mouseRef.current.isRotating = true
          setIsRotating(true)
        } else if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh
          const orb = Array.from(orbsMapRef.current.values()).find(o => o.mesh === hitMesh)
          if (orb) {
            mouseRef.current.isDragging = true
            mouseRef.current.draggedOrb = orb
            setIsDragging(true)
            setSelectedOrb(orb.id)
          }
        }
      } else if (event.button === 2) { // Right click
        mouseRef.current.isRotating = true
        setIsRotating(true)
      }
    }

    const handleMouseUp = () => {
      mouseRef.current.isRotating = false
      mouseRef.current.isDragging = false
      mouseRef.current.draggedOrb = null
      setIsRotating(false)
      setIsDragging(false)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      mouseRef.current.distance = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, mouseRef.current.distance + event.deltaY * 0.01)
      )
      updateCamera()
    }

    // Event listeners
    console.log('Adding event listeners to renderer.domElement')
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('wheel', handleWheel)
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault())
    
    // Also add to window for mouseup to catch events outside canvas
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

      // Rotate orbs
      orbsMapRef.current.forEach((orb) => {
        if (!mouseRef.current.isDragging || orb !== mouseRef.current.draggedOrb) {
          orb.mesh.rotation.y += 0.005
        }
      })

      renderer.render(scene, camera)
    }

    updateCamera()
    animate()

    // Cleanup
    return () => {
      console.log('Cleaning up Three.js scene')
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', handleResize)
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      
      orbGroup.clear()
      scene.clear()
      renderer.dispose()
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Handle visibility changes
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid
    }
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = showAxes
    }
  }, [showAxes, showGrid])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedOrb) {
        e.preventDefault()
        deleteSelectedOrb()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedOrb])

  const createOrb = useCallback(() => {
    if (!orbGroupRef.current) return

    const { type, position, radius, equation, color } = creationParams
    
    const id = `orb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const geometry = new THREE.SphereGeometry(radius, 32, 16)
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: type === 'volume' ? 0.6 : 0.9
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position.x, position.y, position.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    const orb: Orb = {
      id,
      mesh,
      position: new THREE.Vector3(position.x, position.y, position.z),
      scale: new THREE.Vector3(1, 1, 1),
      color,
      material,
      equation: type === 'equation' ? equation : undefined,
      type
    }
    
    orbGroupRef.current.add(mesh)
    orbsMapRef.current.set(id, orb)
    setOrbs(prev => [...prev, orb])
    setShowCreationPanel(false)
  }, [creationParams])

  const deleteSelectedOrb = useCallback(() => {
    if (!selectedOrb || !orbGroupRef.current) return
    
    const orb = orbsMapRef.current.get(selectedOrb)
    if (orb) {
      orbGroupRef.current.remove(orb.mesh)
      orb.mesh.geometry.dispose()
      if (orb.material) orb.material.dispose()
      orbsMapRef.current.delete(selectedOrb)
      setOrbs(prev => prev.filter(o => o.id !== selectedOrb))
      setSelectedOrb(null)
    }
  }, [selectedOrb])

  const applyTransformation = useCallback(() => {
    const orb = selectedOrb ? orbsMapRef.current.get(selectedOrb) : null
    if (!orb) return

    const originalVolume = orb.scale.x * orb.scale.y * orb.scale.z
    const newScaleX = orb.scale.x * transformation.scaleX
    const newScaleY = orb.scale.y * transformation.scaleY
    const newScaleZ = orb.scale.z * transformation.scaleZ
    
    const newVolume = newScaleX * newScaleY * newScaleZ
    const volumeRatio = Math.cbrt(originalVolume / newVolume)
    
    orb.scale.set(
      newScaleX * volumeRatio,
      newScaleY * volumeRatio,
      newScaleZ * volumeRatio
    )
    
    orb.mesh.scale.copy(orb.scale)
    setTransformation({ scaleX: 1, scaleY: 1, scaleZ: 1 })
  }, [selectedOrb, transformation])

  const parseEquation = useCallback((equation: string) => {
    const cleanEq = equation.toLowerCase().replace(/\s/g, '')
    
    const xMatch = cleanEq.match(/([+-]?\d*\.?\d*)x/)
    const yMatch = cleanEq.match(/([+-]?\d*\.?\d*)y/)
    const zMatch = cleanEq.match(/([+-]?\d*\.?\d*)z/)
    
    const xCoeff = xMatch ? (xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseFloat(xMatch[1])) : 0
    const yCoeff = yMatch ? (yMatch[1] === '' || yMatch[1] === '+' ? 1 : yMatch[1] === '-' ? -1 : parseFloat(yMatch[1])) : 0
    const zCoeff = zMatch ? (zMatch[1] === '' || zMatch[1] === '+' ? 1 : zMatch[1] === '-' ? -1 : parseFloat(zMatch[1])) : 0
    
    return { x: xCoeff, y: yCoeff, z: zCoeff }
  }, [])

  const resetCamera = useCallback(() => {
    mouseRef.current.theta = Math.PI / 4
    mouseRef.current.phi = Math.PI / 4
    mouseRef.current.distance = 15
    
    if (cameraRef.current) {
      const x = 15 * Math.sin(Math.PI / 4) * Math.cos(Math.PI / 4)
      const y = 15 * Math.sin(Math.PI / 4)
      const z = 15 * Math.cos(Math.PI / 4) * Math.cos(Math.PI / 4)
      cameraRef.current.position.set(x, y, z)
      cameraRef.current.lookAt(0, 0, 0)
    }
  }, [])

  const zoomIn = useCallback(() => {
    mouseRef.current.distance = Math.max(MIN_ZOOM, mouseRef.current.distance / 1.2)
    if (cameraRef.current) {
      const { theta, phi, distance } = mouseRef.current
      const x = distance * Math.sin(theta) * Math.cos(phi)
      const y = distance * Math.sin(phi)
      const z = distance * Math.cos(theta) * Math.cos(phi)
      cameraRef.current.position.set(x, y, z)
      cameraRef.current.lookAt(0, 0, 0)
    }
  }, [])

  const zoomOut = useCallback(() => {
    mouseRef.current.distance = Math.min(MAX_ZOOM, mouseRef.current.distance * 1.2)
    if (cameraRef.current) {
      const { theta, phi, distance } = mouseRef.current
      const x = distance * Math.sin(theta) * Math.cos(phi)
      const y = distance * Math.sin(phi)
      const z = distance * Math.cos(theta) * Math.cos(phi)
      cameraRef.current.position.set(x, y, z)
      cameraRef.current.lookAt(0, 0, 0)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-cosmic-void">
      {/* Exit Button */}
      {onBack && (
        <m.button
          onClick={onBack}
          className="fixed top-24 left-6 z-[60] p-3 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-75 cosmic-focus"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </m.button>
      )}
      
      <div className="relative w-full h-full overflow-hidden select-none">
      {/* Unified Navigation Bar */}
      <div className="absolute top-20 left-4 right-4 z-30 pointer-events-none">
        <div className="flex items-center gap-2 bg-cosmic-void/90 backdrop-blur-xl rounded-xl p-3 border border-white/10 pointer-events-auto">
          {/* Tools Section */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTool('select')}
              className={`p-2 rounded-lg transition-all ${
                selectedTool === 'select'
                  ? 'bg-gradient-to-r from-cosmic-starlight/30 to-cosmic-starlight/20 border border-cosmic-starlight/50 text-cosmic-starlight'
                  : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10'
              }`}
              title="Select Tool"
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowCreationPanel(!showCreationPanel)}
              className={`p-2 rounded-lg transition-all ${
                showCreationPanel
                  ? 'bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-aurora/20 border border-cosmic-aurora/50 text-cosmic-aurora'
                  : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10'
              }`}
              title="Create Object"
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* View Controls */}
            <button
              onClick={() => setShowAxes(!showAxes)}
              className={`p-2 rounded-lg transition-all ${
                showAxes
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
              }`}
              title="Toggle Axes"
            >
              <Move3D className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-all ${
                showGrid
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
              }`}
              title="Toggle Grid"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Selected Object Controls */}
          {selectedOrb && (
            <>
              <div className="w-px h-6 bg-white/10 mx-1" />
              
              <button
                onClick={() => setShowTransformPanel(!showTransformPanel)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cosmic-nebula/30 to-cosmic-nebula/20 text-cosmic-nebula border border-cosmic-nebula/30 hover:from-cosmic-nebula/40 hover:to-cosmic-nebula/30 transition-all text-sm"
              >
                <Sliders className="w-4 h-4 inline mr-2" />
                Transform
              </button>
              
              <button
                onClick={deleteSelectedOrb}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                title="Delete Selected (Delete key)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          
          <div className="flex-1" />
          
          {/* Info Section */}
          <div className="flex items-center gap-4 text-sm">
            {selectedOrb && (
              <div className="text-white/60">
                {selectedOrb.split('-').slice(0, 2).join('-')}
                {orbsMapRef.current.get(selectedOrb)?.equation && (
                  <span className="ml-2 text-cosmic-aurora">
                    {orbsMapRef.current.get(selectedOrb)?.equation}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-white/40">Objects:</span>
              <span className="text-white/80 font-mono">{orbs.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Viewport - needs to be behind UI but interactive */}
      <div className="absolute inset-0 z-10" ref={mountRef} style={{ touchAction: 'none' }} />

      {/* Creation Panel */}
      <AnimatePresence>
        {showCreationPanel && (
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-32 left-4 z-30 w-80 pointer-events-auto"
          >
            <div className="bg-cosmic-void/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Create Object
                </h3>
                <button
                  onClick={() => setShowCreationPanel(false)}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['point', 'volume', 'equation'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setCreationParams(prev => ({ ...prev, type }))}
                        className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                          creationParams.type === type
                            ? 'bg-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equation Input */}
                {creationParams.type === 'equation' && (
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">
                      Equation (e.g., "2x + 3y - z")
                    </label>
                    <input
                      type="text"
                      value={creationParams.equation}
                      onChange={(e) => {
                        const eq = e.target.value
                        setCreationParams(prev => ({ 
                          ...prev, 
                          equation: eq,
                          position: parseEquation(eq)
                        }))
                      }}
                      placeholder="Enter equation..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-cosmic-aurora/50 focus:outline-none"
                    />
                  </div>
                )}

                {/* Position Inputs */}
                {creationParams.type !== 'equation' && (
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['x', 'y', 'z'] as const).map(axis => (
                        <div key={axis}>
                          <label className="text-white/40 text-xs">{axis.toUpperCase()}</label>
                          <input
                            type="number"
                            value={creationParams.position[axis]}
                            onChange={(e) => setCreationParams(prev => ({
                              ...prev,
                              position: { ...prev.position, [axis]: parseFloat(e.target.value) || 0 }
                            }))}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                            step="0.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Radius */}
                {creationParams.type === 'volume' && (
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">
                      Radius: {creationParams.radius.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={creationParams.radius}
                      onChange={(e) => setCreationParams(prev => ({ 
                        ...prev, 
                        radius: parseFloat(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Color */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={creationParams.color}
                      onChange={(e) => setCreationParams(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-8 bg-transparent border border-white/10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={creationParams.color}
                      onChange={(e) => setCreationParams(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={createOrb}
                  className="w-full px-4 py-2 bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30 rounded-lg hover:from-cosmic-aurora/40 hover:to-cosmic-aurora/30 transition-all"
                >
                  Create {creationParams.type}
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Transform Panel */}
      <AnimatePresence>
        {showTransformPanel && selectedOrb && (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-32 right-4 z-30 w-72 pointer-events-auto"
          >
            <div className="bg-cosmic-void/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white/80 text-sm font-medium">Transform</h3>
                <button
                  onClick={() => setShowTransformPanel(false)}
                  className="text-white/40 hover:text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="text-xs text-white/40 mb-2">Volume preserved</div>
                
                {(['scaleX', 'scaleY', 'scaleZ'] as const).map((axis, i) => (
                  <div key={axis} className="flex items-center gap-3">
                    <label className="text-white/60 text-sm w-8">
                      {['X', 'Y', 'Z'][i]}:
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={transformation[axis]}
                      onChange={(e) => setTransformation(prev => ({ 
                        ...prev, 
                        [axis]: parseFloat(e.target.value) 
                      }))}
                      className="flex-1"
                    />
                    <span className="text-white/80 font-mono text-sm w-10 text-right">
                      {transformation[axis].toFixed(1)}
                    </span>
                  </div>
                ))}
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={applyTransformation}
                    className="flex-1 px-3 py-1.5 bg-cosmic-starlight/20 text-cosmic-starlight border border-cosmic-starlight/30 rounded-lg hover:bg-cosmic-starlight/30 text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setTransformation({ scaleX: 1, scaleY: 1, scaleZ: 1 })}
                    className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg hover:bg-white/10 text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-cosmic-void/90 backdrop-blur-xl rounded-xl p-2 border border-white/10 flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetCamera}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="text-xs text-white/40 bg-cosmic-void/80 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/5">
          <div>Shift+LMB or Right-click: Rotate • Scroll: Zoom</div>
          {selectedOrb && <div className="text-cosmic-aurora mt-1">Delete key to remove</div>}
        </div>
      </div>

      {/* Status */}
      <AnimatePresence>
        {(isDragging || isRotating) && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-cosmic-void/90 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 text-white/80 text-sm">
              {isDragging ? 'Dragging' : 'Rotating'}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  )
}