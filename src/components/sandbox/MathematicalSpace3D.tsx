'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Axis3D, Grid3X3, Eye, EyeOff, Settings, Plus, Minus,
  RotateCw, Move3D, Layers, Info, ChevronDown, ChevronRight,
  Box, Square, Minus as Line, ArrowLeft, Sparkles
} from 'lucide-react'

// Types for mathematical objects
interface MathObject {
  id: string
  type: 'constraint' | 'parametric' | 'implicit' | 'vector' | 'point'
  dimension: 1 | 2 | 3
  equation: string
  parsed: any
  mesh?: THREE.Object3D
  color: string
  visible: boolean
  showAssumptions?: boolean
}

interface CoordinateSystem {
  name: string
  type: 'cartesian' | 'polar' | 'spherical' | 'cylindrical' | 'custom'
  basis?: THREE.Matrix3
  metric?: THREE.Matrix3
  transform: (point: THREE.Vector3) => THREE.Vector3
  inverse: (point: THREE.Vector3) => THREE.Vector3
  gridLines?: THREE.Object3D
}

interface Props {
  onBack?: () => void
}

export default function MathematicalSpace3D({ onBack }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef = useRef<number | null>(null)
  const controlsRef = useRef<any>({
    isRotating: false,
    mouseX: 0,
    mouseY: 0,
    theta: Math.PI / 4,
    phi: Math.PI / 6,
    distance: 15
  })

  // State
  const [mathObjects, setMathObjects] = useState<MathObject[]>([])
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [coordinateSystem, setCoordinateSystem] = useState<'cartesian' | 'polar' | 'spherical'>('cartesian')
  const [showGrid, setShowGrid] = useState(true)
  const [showAxes, setShowAxes] = useState(true)
  const [showBasis, setShowBasis] = useState(false)
  const [showMetric, setShowMetric] = useState(false)
  const [dimensionMode, setDimensionMode] = useState<1 | 2 | 3>(3)
  const [equationInput, setEquationInput] = useState('')
  const [showAssumptions, setShowAssumptions] = useState(true)
  const [showAddPanel, setShowAddPanel] = useState(false)

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    scene.fog = new THREE.Fog(0x0a0a0f, 20, 60)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(12, 8, 12)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer with high quality settings
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
    renderer.toneMappingExposure = 1.0
    rendererRef.current = renderer
    
    // Clear and append
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
    directionalLight.position.set(10, 15, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Add a subtle point light for depth
    const pointLight = new THREE.PointLight(0x4a9eff, 0.3, 50)
    pointLight.position.set(-10, 5, -10)
    scene.add(pointLight)

    // Origin marker
    const originGeometry = new THREE.SphereGeometry(0.1, 16, 16)
    const originMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    })
    const origin = new THREE.Mesh(originGeometry, originMaterial)
    scene.add(origin)

    // Mouse controls
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

    // Add event listeners
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

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
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

  // Update grid and axes visibility
  useEffect(() => {
    if (!sceneRef.current) return

    // Remove old grid and axes
    const oldGrid = sceneRef.current.getObjectByName('grid')
    const oldAxes = sceneRef.current.getObjectByName('axes')
    if (oldGrid) sceneRef.current.remove(oldGrid)
    if (oldAxes) sceneRef.current.remove(oldAxes)

    if (showGrid) {
      const gridHelper = new THREE.GridHelper(20, 20, 0x444466, 0x222233)
      gridHelper.name = 'grid'
      sceneRef.current.add(gridHelper)
    }

    if (showAxes) {
      const axesGroup = new THREE.Group()
      axesGroup.name = 'axes'

      // Custom axes with labels
      const axisLength = 10
      
      // X axis - red
      const xGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(axisLength, 0, 0)
      ])
      const xMaterial = new THREE.LineBasicMaterial({ color: 0xff4444 })
      const xAxis = new THREE.Line(xGeometry, xMaterial)
      axesGroup.add(xAxis)

      // Y axis - green
      const yGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, axisLength, 0)
      ])
      const yMaterial = new THREE.LineBasicMaterial({ color: 0x44ff44 })
      const yAxis = new THREE.Line(yGeometry, yMaterial)
      axesGroup.add(yAxis)

      // Z axis - blue
      const zGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, axisLength)
      ])
      const zMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff })
      const zAxis = new THREE.Line(zGeometry, zMaterial)
      axesGroup.add(zAxis)

      sceneRef.current.add(axesGroup)
    }
  }, [showGrid, showAxes])

  // Parse and visualize equation
  const parseEquation = useCallback((equation: string) => {
    // This is a simplified parser - in production you'd use a proper math parser
    const cleaned = equation.toLowerCase().replace(/\s/g, '')
    
    // Detect equation type
    if (cleaned.includes('=')) {
      // Implicit equation like x^2 + y^2 = 1
      return {
        type: 'implicit',
        equation: cleaned,
        // Parse would extract coefficients and terms
      }
    } else if (cleaned.includes('(t)')) {
      // Parametric like x(t) = cos(t), y(t) = sin(t)
      return {
        type: 'parametric',
        equation: cleaned
      }
    } else {
      // Explicit like y = x^2
      return {
        type: 'explicit',
        equation: cleaned
      }
    }
  }, [])

  const addMathObject = useCallback(() => {
    if (!equationInput.trim() || !sceneRef.current) return

    const id = `obj-${Date.now()}`
    const parsed = parseEquation(equationInput)
    
    const newObject: MathObject = {
      id,
      type: 'constraint',
      dimension: dimensionMode,
      equation: equationInput,
      parsed,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      visible: true,
      showAssumptions: showAssumptions
    }

    // Create visualization based on type and dimension
    if (dimensionMode === 2) {
      // Create a 2D graph embedded in 3D space
      const geometry = new THREE.PlaneGeometry(10, 10, 50, 50)
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(newObject.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        wireframe: true
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = id
      
      // Position based on coordinate system
      if (coordinateSystem === 'cartesian') {
        // Standard XY plane
        mesh.rotation.x = -Math.PI / 2
      } else if (coordinateSystem === 'polar') {
        // Radial plane
        mesh.rotation.y = Math.PI / 4
      }
      
      sceneRef.current.add(mesh)
      newObject.mesh = mesh
    } else if (dimensionMode === 3) {
      // Create a 3D surface
      // This would parse the equation and generate appropriate geometry
      // For now, create a placeholder sphere
      const geometry = new THREE.SphereGeometry(2, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(newObject.color),
        transparent: true,
        opacity: 0.6
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = id
      sceneRef.current.add(mesh)
      newObject.mesh = mesh
    }

    setMathObjects(prev => [...prev, newObject])
    setEquationInput('')
    setShowAddPanel(false)
  }, [equationInput, dimensionMode, coordinateSystem, showAssumptions])

  const removeMathObject = useCallback((id: string) => {
    if (!sceneRef.current) return
    
    const object = mathObjects.find(obj => obj.id === id)
    if (object?.mesh) {
      sceneRef.current.remove(object.mesh)
      if (object.mesh.geometry) (object.mesh as any).geometry.dispose()
      if (object.mesh.material) (object.mesh as any).material.dispose()
    }
    
    setMathObjects(prev => prev.filter(obj => obj.id !== id))
  }, [mathObjects])

  const toggleObjectVisibility = useCallback((id: string) => {
    setMathObjects(prev => prev.map(obj => {
      if (obj.id === id) {
        const newVisible = !obj.visible
        if (obj.mesh) {
          obj.mesh.visible = newVisible
        }
        return { ...obj, visible: newVisible }
      }
      return obj
    }))
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-cosmic-void">
      {/* Exit Button */}
      {onBack && (
        <m.button
          onClick={onBack}
          className="fixed top-24 left-6 z-[60] p-3 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-75"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </m.button>
      )}

      {/* 3D Viewport */}
      <div className="absolute inset-0" ref={mountRef} />

      {/* Top Control Bar */}
      <div className="absolute top-20 left-20 right-6 z-30 pointer-events-none">
        <div className="flex items-start gap-4">
          {/* Main Controls */}
          <div className="bg-cosmic-void/90 backdrop-blur-xl rounded-xl p-3 border border-white/10 pointer-events-auto">
            <div className="flex items-center gap-2">
              {/* Coordinate System Selector */}
              <select
                value={coordinateSystem}
                onChange={(e) => setCoordinateSystem(e.target.value as any)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cosmic-aurora/50 focus:outline-none"
              >
                <option value="cartesian">Cartesian (x, y, z)</option>
                <option value="polar">Polar (r, θ, z)</option>
                <option value="spherical">Spherical (ρ, θ, φ)</option>
              </select>

              <div className="w-px h-6 bg-white/10" />

              {/* Dimension Mode */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDimensionMode(1)}
                  className={`p-2 rounded-lg transition-all ${
                    dimensionMode === 1 
                      ? 'bg-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30'
                      : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                  }`}
                  title="1D"
                >
                  <Line className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDimensionMode(2)}
                  className={`p-2 rounded-lg transition-all ${
                    dimensionMode === 2
                      ? 'bg-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30'
                      : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                  }`}
                  title="2D"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDimensionMode(3)}
                  className={`p-2 rounded-lg transition-all ${
                    dimensionMode === 3
                      ? 'bg-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30'
                      : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                  }`}
                  title="3D"
                >
                  <Box className="w-4 h-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-white/10" />

              {/* View Options */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-all ${
                  showGrid
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
                title="Toggle Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowAxes(!showAxes)}
                className={`p-2 rounded-lg transition-all ${
                  showAxes
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
                title="Toggle Axes"
              >
                <Axis3D className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowBasis(!showBasis)}
                className={`p-2 rounded-lg transition-all ${
                  showBasis
                    ? 'bg-cosmic-starlight/20 text-cosmic-starlight border border-cosmic-starlight/30'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
                title="Show Basis Vectors"
              >
                <Move3D className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMetric(!showMetric)}
                className={`p-2 rounded-lg transition-all ${
                  showMetric
                    ? 'bg-cosmic-nebula/20 text-cosmic-nebula border border-cosmic-nebula/30'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
                title="Show Metric Tensor"
              >
                <Layers className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-white/10" />

              <button
                onClick={() => setShowAssumptions(!showAssumptions)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                  showAssumptions
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm">Assumptions</span>
              </button>
            </div>
          </div>

          {/* Add Object Button */}
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="bg-cosmic-void/90 backdrop-blur-xl rounded-xl p-3 border border-white/10 pointer-events-auto hover:border-cosmic-aurora/50 transition-all"
          >
            <Plus className="w-5 h-5 text-cosmic-aurora" />
          </button>
        </div>
      </div>

      {/* Add Object Panel */}
      <AnimatePresence>
        {showAddPanel && (
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-32 left-20 z-40 w-96 pointer-events-auto"
          >
            <div className="bg-cosmic-void/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl p-6">
              <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cosmic-aurora" />
                Add Mathematical Object
              </h3>

              <div className="space-y-4">
                {/* Equation Input */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    Equation / Constraint / Relation
                  </label>
                  <input
                    type="text"
                    value={equationInput}
                    onChange={(e) => setEquationInput(e.target.value)}
                    placeholder={
                      dimensionMode === 1 ? "e.g., y = 2x + 1" :
                      dimensionMode === 2 ? "e.g., x² + y² = 1" :
                      "e.g., x² + y² + z² = 1"
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-cosmic-aurora/50 focus:outline-none"
                  />
                </div>

                {/* Examples based on dimension */}
                <div className="text-xs text-white/40">
                  {dimensionMode === 1 && (
                    <div>
                      <p>1D Examples:</p>
                      <p className="ml-2">• y = mx + b (line)</p>
                      <p className="ml-2">• x = 5 (point)</p>
                    </div>
                  )}
                  {dimensionMode === 2 && (
                    <div>
                      <p>2D Examples:</p>
                      <p className="ml-2">• x² + y² = r² (circle)</p>
                      <p className="ml-2">• y = x² (parabola)</p>
                      <p className="ml-2">• r = θ (spiral in polar)</p>
                    </div>
                  )}
                  {dimensionMode === 3 && (
                    <div>
                      <p>3D Examples:</p>
                      <p className="ml-2">• x² + y² + z² = r² (sphere)</p>
                      <p className="ml-2">• z = x² + y² (paraboloid)</p>
                      <p className="ml-2">• x² + y² - z² = 0 (cone)</p>
                    </div>
                  )}
                </div>

                {/* What gets revealed */}
                {showAssumptions && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-amber-400 text-xs font-medium mb-1">This will reveal:</p>
                    <ul className="text-amber-300/80 text-xs space-y-1">
                      <li>• How "+" combines perpendicular dimensions</li>
                      <li>• What "1" means as a unit in this space</li>
                      <li>• How coordinates impose structure</li>
                      <li>• The hidden metric tensor at work</li>
                    </ul>
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={addMathObject}
                  disabled={!equationInput.trim()}
                  className="w-full px-4 py-2 bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-aurora/20 text-cosmic-aurora border border-cosmic-aurora/30 rounded-lg hover:from-cosmic-aurora/40 hover:to-cosmic-aurora/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Space
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Objects Panel */}
      {mathObjects.length > 0 && (
        <div className="absolute top-32 right-6 z-30 w-80 max-h-[60vh] overflow-y-auto pointer-events-auto">
          <div className="bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <h3 className="text-white/80 text-sm font-medium mb-3">Mathematical Objects</h3>
            
            <div className="space-y-2">
              {mathObjects.map(obj => (
                <div
                  key={obj.id}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedObject === obj.id
                      ? 'bg-white/10 border-cosmic-aurora/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: obj.color }}
                        />
                        <span className="text-white text-sm font-mono">
                          {obj.equation}
                        </span>
                      </div>
                      
                      {showAssumptions && obj.showAssumptions && (
                        <div className="mt-2 text-xs text-amber-400/80 space-y-1">
                          <p>• Assumes orthogonal {obj.dimension}D axes</p>
                          <p>• Unit "1" = {coordinateSystem} unit length</p>
                          {obj.equation.includes('+') && (
                            <p>• "+" uses Euclidean metric</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => toggleObjectVisibility(obj.id)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        {obj.visible ? (
                          <Eye className="w-4 h-4 text-white/60" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white/30" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => removeMathObject(obj.id)}
                        className="p-1 rounded hover:bg-red-500/20 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coordinate System Info */}
      {(showBasis || showMetric) && (
        <div className="absolute bottom-6 left-6 z-30 pointer-events-auto">
          <div className="bg-cosmic-void/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 max-w-sm">
            {showBasis && (
              <div className="mb-3">
                <h4 className="text-white/80 text-sm font-medium mb-2">Basis Vectors</h4>
                <div className="text-xs text-white/60 font-mono">
                  {coordinateSystem === 'cartesian' && (
                    <>
                      <p>ê₁ = (1, 0, 0) — x direction</p>
                      <p>ê₂ = (0, 1, 0) — y direction</p>
                      <p>ê₃ = (0, 0, 1) — z direction</p>
                    </>
                  )}
                  {coordinateSystem === 'polar' && (
                    <>
                      <p>êᵣ = (cos θ, sin θ, 0) — radial</p>
                      <p>êθ = (-sin θ, cos θ, 0) — angular</p>
                      <p>êz = (0, 0, 1) — vertical</p>
                    </>
                  )}
                  {coordinateSystem === 'spherical' && (
                    <>
                      <p>êᵨ = radial direction</p>
                      <p>êθ = azimuthal direction</p>
                      <p>êφ = polar direction</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {showMetric && (
              <div>
                <h4 className="text-white/80 text-sm font-medium mb-2">Metric Tensor</h4>
                <div className="text-xs text-white/60 font-mono">
                  {coordinateSystem === 'cartesian' && (
                    <div>
                      <p>g = [1  0  0]</p>
                      <p>    [0  1  0]</p>
                      <p>    [0  0  1]</p>
                      <p className="mt-1 text-amber-400">Identity: all directions equal</p>
                    </div>
                  )}
                  {coordinateSystem === 'polar' && (
                    <div>
                      <p>g = [1   0   0]</p>
                      <p>    [0  r²  0]</p>
                      <p>    [0   0   1]</p>
                      <p className="mt-1 text-amber-400">Angular distance scales with r</p>
                    </div>
                  )}
                  {coordinateSystem === 'spherical' && (
                    <div>
                      <p>g = [1    0         0    ]</p>
                      <p>    [0   ρ²        0    ]</p>
                      <p>    [0    0    ρ²sin²θ]</p>
                      <p className="mt-1 text-amber-400">Both angles scale with radius</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
        <div className="text-xs text-white/40 bg-cosmic-void/80 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/5">
          <div>Right-click or Shift+drag: Rotate • Scroll: Zoom</div>
          <div className="text-cosmic-aurora mt-1">Reveal the hidden structure of mathematics</div>
        </div>
      </div>
    </div>
  )
}