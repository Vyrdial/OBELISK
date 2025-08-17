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
import { Award, Clock, BookOpen, Brain, ArrowRight } from 'lucide-react'

// ===== SLIDER COMPONENTS =====

// Constrained axis slider with arrows pointing to edges
function ConstrainedSlider({ position, onPositionChange, enabled = true, showArrows = false }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean,
  showArrows?: boolean
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const updatePosition = (clientX: number) => {
      const x = (clientX - rect.left) / rect.width
      onPositionChange(Math.max(0, Math.min(1, x)))
    }
    
    updatePosition(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX)
    }
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        {/* Track */}
        <div 
          className="relative h-2 bg-white/10 rounded-full cursor-pointer flex-1"
          onMouseDown={handleMouseDown}
        >
          <m.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full -ml-2"
            animate={{ left: `${position * 100}%` }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        </div>
      </div>
      
      {/* Arrows pointing from outside bounds to edges */}
      {showArrows && (
        <>
          <m.div 
            className="absolute top-1/2 -translate-y-1/2 -left-8 flex items-center"
            initial={{ opacity: 0, x: 0 }}
            animate={{ 
              opacity: 1,
              x: [-2, 2, -2],
              rotate: [-5, 5, -5]
            }}
            transition={{ 
              opacity: { duration: 0.5 },
              x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </m.div>
          <m.div 
            className="absolute top-1/2 -translate-y-1/2 -right-8 flex items-center"
            initial={{ opacity: 0, x: 0 }}
            animate={{ 
              opacity: 1,
              x: [2, -2, 2],
              rotate: [5, -5, 5]
            }}
            transition={{ 
              opacity: { duration: 0.5 },
              x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <ArrowRight className="w-6 h-6 text-white rotate-180" />
          </m.div>
        </>
      )}
    </div>
  )
}

// Unbounded axis slider that extends beyond container
function UnboundedSlider({ position, onPositionChange, enabled = true }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const updatePosition = (clientX: number) => {
      const x = (clientX - rect.left) / rect.width
      onPositionChange(Math.max(0, Math.min(1, x)))
    }
    
    updatePosition(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX)
    }
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-visible">
      <div className="relative flex items-center">
        {/* Extended track that goes beyond container */}
        <m.div 
          className="absolute h-2 bg-white/10 rounded-full"
          style={{ 
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200vw'
          }}
        />
        {/* Interactive area - covers the full extended track */}
        <div 
          className="absolute h-2 cursor-pointer z-10"
          onMouseDown={handleMouseDown}
          style={{ 
            background: 'transparent',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200vw'
          }}
        >
          <m.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full -ml-2"
            animate={{ left: `${position * 100}%` }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  )
}

// Semi-bounded axis slider (cut from unbounded) - centered endpoint
function CutAxisSlider({ position, onPositionChange, enabled = true, showEndArrow = false, isRotating = false, onRotationUpdate }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean,
  showEndArrow?: boolean,
  isRotating?: boolean,
  onRotationUpdate?: (angle: number) => void
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const updatePosition = (clientX: number) => {
      const x = (clientX - rect.left) / rect.width
      onPositionChange(Math.max(0, Math.min(1, x)))
    }
    
    updatePosition(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX)
    }
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className={isRotating ? "fixed inset-0 flex items-center justify-center pointer-events-none" : "relative w-full max-w-2xl mx-auto overflow-visible"}>
      <m.div 
        className="relative flex items-center justify-center"
        animate={isRotating ? { rotate: 360 } : {}}
        transition={isRotating ? { duration: 4, repeat: Infinity, ease: "linear" } : {}}
        style={isRotating ? { transformOrigin: 'center' } : {}}
        onUpdate={(latest) => {
          if (isRotating && onRotationUpdate && typeof latest.rotate === 'number') {
            onRotationUpdate(latest.rotate as number)
          }
        }}
      >
        {/* Extended track starting from center and going right */}
        <m.div 
          className="absolute h-2 bg-white/10"
          style={{ 
            left: '50%',
            width: '50vw',
            borderTopRightRadius: '9999px',
            borderBottomRightRadius: '9999px'
          }}
        />
        
        {/* Cut endpoint indicator */}
        <div 
          className="absolute w-2 h-2 bg-white rounded-full z-10"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
        
        {/* Interactive area - covers from center to right edge */}
        <div 
          className="absolute h-2 cursor-pointer z-10"
          onMouseDown={handleMouseDown}
          style={{ 
            background: 'transparent',
            left: '50%',
            width: '50vw'
          }}
        >
          <m.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full -ml-2"
            animate={{ left: `${position * 100}%` }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        </div>
        
        {/* Arrow pointing to the cut endpoint */}
        {showEndArrow && (
          <m.div 
            className="absolute top-1/2 -translate-y-1/2 flex items-center z-20"
            style={{ left: 'calc(50% - 32px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </m.div>
        )}
      </m.div>
    </div>
  )
}


// Pulse axis component - sin wave pulses traveling left to right
function PulseAxis({ position, onPositionChange, enabled = true }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative flex items-center justify-center">
        {/* Base axis track */}
        <m.div 
          className="absolute h-2 bg-white/10"
          style={{ 
            left: '50%',
            width: '50vw',
            borderTopRightRadius: '9999px',
            borderBottomRightRadius: '9999px'
          }}
        />
        
        {/* Cut endpoint */}
        <div 
          className="absolute w-2 h-2 bg-white rounded-full z-10"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
        
        {/* Mathematical sine wave pulses traveling left to right */}
        {[...Array(3)].map((_, waveIndex) => (
          <m.div
            key={waveIndex}
            className="absolute"
            style={{ 
              left: '50%',
              width: '50vw',
              height: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              overflow: 'hidden'
            }}
          >
            <svg
              className="absolute inset-0"
              viewBox="0 0 1000 40"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%' }}
            >
              <m.path
                d={`M ${Array.from({ length: 50 }, (_, i) => {
                  const x = i * 20
                  const y = 20 + Math.sin((i * Math.PI) / 5) * 15
                  return `${x},${y}`
                }).join(' L ')}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="2"
                initial={{ pathOffset: 0 }}
                animate={{ 
                  pathOffset: -100,
                  opacity: [0, 1, 1, 0],
                  strokeWidth: [1, 2, 2, 1]
                }}
                transition={{ 
                  pathOffset: { duration: 2.5, repeat: Infinity, ease: "linear", delay: waveIndex * 0.8 },
                  opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: waveIndex * 0.8 },
                  strokeWidth: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: waveIndex * 0.8 }
                }}
                style={{
                  filter: 'blur(0.5px)'
                }}
              />
            </svg>
          </m.div>
        ))}
        
        {/* Slider knob */}
        <m.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full -ml-2 z-20"
          style={{ left: `${50 + position * 50}%` }}
        />
      </div>
    </div>
  )
}

// Infinite perspective axis component
function InfiniteAxis({ position, onPositionChange, enabled = true }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full">
        {/* Multiple axis segments creating infinite perspective */}
        {[...Array(8)].map((_, i) => {
          const depth = i * 0.15
          const scale = 1 - depth
          const opacity = 0.8 - depth
          return (
            <m.div
              key={i}
              className="absolute h-1 bg-white/10"
              style={{ 
                left: '50%',
                top: '50%',
                width: `${40 + i * 10}vw`,
                transform: `translateX(-50%) translateY(-50%) scale(${scale})`,
                borderTopRightRadius: '9999px',
                borderBottomRightRadius: '9999px',
                opacity: opacity,
                zIndex: 10 - i
              }}
              animate={{ 
                x: [0, -20, 0],
                opacity: [opacity, opacity * 0.5, opacity]
              }}
              transition={{ 
                duration: 3 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )
        })}
        
        {/* Moving perspective lines */}
        {[...Array(5)].map((_, i) => (
          <m.div
            key={`line-${i}`}
            className="absolute w-px h-4 bg-white/20"
            style={{ 
              left: `${60 + i * 8}%`,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            animate={{ 
              x: [-100, 100],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
          />
        ))}
        
        {/* Cut endpoint */}
        <div 
          className="absolute w-2 h-2 bg-white rounded-full z-30"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  )
}

// Linear axis slider with arrows indicating infinite extension
function OneDimensionSlider({ position, onPositionChange, enabled = true, fullWidth = false, showLabels = true }: { 
  position: number, 
  onPositionChange: (pos: number) => void,
  enabled?: boolean,
  fullWidth?: boolean,
  showLabels?: boolean 
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const updatePosition = (clientX: number) => {
      const x = (clientX - rect.left) / rect.width
      onPositionChange(Math.max(0, Math.min(1, x)))
    }
    
    updatePosition(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX)
    }
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className={`relative w-full ${fullWidth ? '' : 'max-w-2xl'} mx-auto px-10`}>
      <div className="relative flex items-center">
        {/* Track */}
        <div 
          className="relative h-2 bg-white/10 rounded-full cursor-pointer flex-1"
          onMouseDown={handleMouseDown}
        >
          <m.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full -ml-2"
            animate={{ left: `${position * 100}%` }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  )
}

// ===== MAIN LESSON COMPONENT =====

type LessonPhase = 'intro' | 'dimensional-wrapping' | 'dimensional-interpolation' | 'dimensional-wrapping-circular' | 'closure-demo' | 'space-creation' | 'closed-open-relationship' | 'complete'

function Lesson4Content() {
  const router = useRouter()
  const { profile, addStardust, addAchievement } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('intro')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)

  // 3D Ball refs and state
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  const ballRef = useRef(null);
  const basePosition = useRef(new THREE.Vector3(0, 0, 0));
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0.5);
  const [sliderPosition2, setSliderPosition2] = useState(0.5);
  const [circularPosition, setCircularPosition] = useState(0);
  const [transformationStarted, setTransformationStarted] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(180);
  const [showBoundedLabel, setShowBoundedLabel] = useState(false);
  const [showUnboundedLabel, setShowUnboundedLabel] = useState(false);
  const [showCutAxis, setShowCutAxis] = useState(false);
  const [showEndArrow, setShowEndArrow] = useState(false);
  const [showRotatingAxis, setShowRotatingAxis] = useState(false);
  const [showPulseAxis, setShowPulseAxis] = useState(false);
  const [showInfiniteAxis, setShowInfiniteAxis] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [waitingForRotationComplete, setWaitingForRotationComplete] = useState(false);

// Circular axis slider for closed axis topology
function CircularSlider({ position, onPositionChange, enabled = true }: {
  position: number,
  onPositionChange: (pos: number) => void,
  enabled?: boolean
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const updatePosition = (clientX: number, clientY: number) => {
      const dx = clientX - centerX
      const dy = clientY - centerY
      
      let angle = Math.atan2(dy, dx)
      // Normalize to 0-1 range (0 = top, going clockwise)
      angle = (angle + Math.PI / 2) / (2 * Math.PI)
      if (angle < 0) angle += 1
      
      onPositionChange(angle)
    }
    
    updatePosition(e.clientX, e.clientY)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX, e.clientY)
    }
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  const radius = 80
  const angle = position * 2 * Math.PI - Math.PI / 2 // Start from top
  const knobX = Math.cos(angle) * radius
  const knobY = Math.sin(angle) * radius
  
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <div className="relative w-48 h-48 mx-auto">
        <svg 
          width="192" 
          height="192" 
          className="absolute inset-0 cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          {/* Circular track */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          {/* Knob */}
          <circle
            cx={96 + knobX}
            cy={96 + knobY}
            r="8"
            fill="white"
            className="drop-shadow-lg"
          />
        </svg>
      </div>
      <div className="text-center mt-4 text-white/60 text-sm">
        Position: {(position * 360).toFixed(0)}°
      </div>
    </div>
  )
}

  // ===== EFFECTS =====
  
  // Transformation animation for dimensional interpolation phase
  useEffect(() => {
    if (currentPhase === 'dimensional-interpolation') {
      setCircularPosition(sliderPosition)
      
      const timer = setTimeout(() => {
        setTransformationStarted(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else {
      setTransformationStarted(false)
    }
  }, [currentPhase])

  // 3D scene setup for closure demonstration phases
  useEffect(() => {
    if (!mountRef.current || !(currentPhase === 'closure-demo' || currentPhase === 'space-creation' || currentPhase === 'closed-open-relationship')) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8888ff, 1.5, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create minimal axes
    const axesGroup = new THREE.Group();
    
    // X axis - subtle pink
    const xGeometry = new THREE.CylinderGeometry(0.02, 0.02, 6);
    const xMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6b9d,
      opacity: 0.4,
      transparent: true
    });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = Math.PI / 2;
    axesGroup.add(xAxis);

    // Y axis - subtle purple
    const yGeometry = new THREE.CylinderGeometry(0.02, 0.02, 6);
    const yMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x9d6bff,
      opacity: 0.4,
      transparent: true
    });
    const yAxis = new THREE.Mesh(yGeometry, yMaterial);
    axesGroup.add(yAxis);

    // Z axis - subtle blue
    const zGeometry = new THREE.CylinderGeometry(0.02, 0.02, 6);
    const zMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x6b9dff,
      opacity: 0.4,
      transparent: true
    });
    const zAxis = new THREE.Mesh(zGeometry, zMaterial);
    zAxis.rotation.x = Math.PI / 2;
    axesGroup.add(zAxis);

    scene.add(axesGroup);

    // Create axis labels using sprites
    const createLabel = (text, color, position) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      
      context.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.8
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.5, 0.5, 1);
      sprite.position.copy(position);
      
      return sprite;
    };

    const xLabel = createLabel('X', '#ff6b9d', new THREE.Vector3(3.5, 0, 0));
    const xLabelNeg = createLabel('X', '#ff6b9d', new THREE.Vector3(-3.5, 0, 0));
    const yLabel = createLabel('Y', '#9d6bff', new THREE.Vector3(0, 3.5, 0));
    const yLabelNeg = createLabel('Y', '#9d6bff', new THREE.Vector3(0, -3.5, 0));
    const zLabel = createLabel('Z', '#6b9dff', new THREE.Vector3(0, 0, 3.5));
    const zLabelNeg = createLabel('Z', '#6b9dff', new THREE.Vector3(0, 0, -3.5));
    
    axesGroup.add(xLabel);
    axesGroup.add(xLabelNeg);
    axesGroup.add(yLabel);
    axesGroup.add(yLabelNeg);
    axesGroup.add(zLabel);
    axesGroup.add(zLabelNeg);

    // Create the ball with gradient-like material
    const ballGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const ballMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.3,
      thickness: 0.5,
      envMapIntensity: 1
    });
    
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ballRef.current = ball;
    axesGroup.add(ball); // Add ball to axes group instead of scene

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    ball.add(glow);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const dragOffset = new THREE.Vector3();
    const dragPoint = new THREE.Vector3();
    let localIsDragging = false;

    let isRotating = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseMove = (e) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (localIsDragging) {
        raycaster.setFromCamera(mouse, camera);
        
        // Get camera direction in world space
        const cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        
        // Transform camera direction to local space of the axes group
        const localCameraDir = cameraDir.clone();
        const inverseMatrix = new THREE.Matrix4().copy(axesGroup.matrixWorld).invert();
        localCameraDir.transformDirection(inverseMatrix);
        
        // Determine which axis is most aligned with camera
        const alignments = [
          { axis: 'x', value: Math.abs(localCameraDir.x) },
          { axis: 'y', value: Math.abs(localCameraDir.y) },
          { axis: 'z', value: Math.abs(localCameraDir.z) }
        ];
        
        // Sort to find most aligned axis
        alignments.sort((a, b) => b.value - a.value);
        const ignoredAxis = alignments[0].axis;
        
        // Create drag plane perpendicular to the ignored axis
        const planeNormal = new THREE.Vector3();
        if (ignoredAxis === 'x') {
          planeNormal.set(1, 0, 0);
        } else if (ignoredAxis === 'y') {
          planeNormal.set(0, 1, 0);
        } else {
          planeNormal.set(0, 0, 1);
        }
        
        // Transform plane normal to world space
        planeNormal.transformDirection(axesGroup.matrixWorld);
        
        dragPlane.setFromNormalAndCoplanarPoint(planeNormal, ball.getWorldPosition(new THREE.Vector3()));
        
        if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
          // Subtract the offset to maintain grab point
          const newWorldPos = dragPoint.sub(dragOffset);
          
          // Convert to local space for clamping
          const localPoint = newWorldPos.clone();
          const worldToLocal = new THREE.Matrix4().copy(axesGroup.matrixWorld).invert();
          localPoint.applyMatrix4(worldToLocal);
          
          // Apply position
          ball.position.copy(localPoint);
          ball.position.clampScalar(-3, 3);
          
          // Update base position for floating animation
          basePosition.current.copy(ball.position);
        }
      } else if (isRotating) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        
        axesGroup.rotation.y += deltaX * 0.01;
        axesGroup.rotation.x += deltaY * 0.01;
      }

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseDown = (e) => {
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      
      if (e.button === 0) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(ball);

        if (intersects.length > 0) {
          localIsDragging = true;
          setIsDragging(true);
          
          // Store current position as base for when we stop dragging
          basePosition.current.copy(ball.position);
          basePosition.current.y -= Math.sin(Date.now() * 0.001) * 0.1; // Remove current float offset
          
          // Reset drag offset and store initial position
          dragOffset.set(0, 0, 0);
          const worldPos = ball.getWorldPosition(new THREE.Vector3());
          
          // Get camera direction in world space
          const cameraDir = new THREE.Vector3();
          camera.getWorldDirection(cameraDir);
          
          // Transform camera direction to local space of the axes group
          const localCameraDir = cameraDir.clone();
          const inverseMatrix = new THREE.Matrix4().copy(axesGroup.matrixWorld).invert();
          localCameraDir.transformDirection(inverseMatrix);
          
          // Determine which axis is most aligned with camera
          const alignments = [
            { axis: 'x', value: Math.abs(localCameraDir.x) },
            { axis: 'y', value: Math.abs(localCameraDir.y) },
            { axis: 'z', value: Math.abs(localCameraDir.z) }
          ];
          
          // Sort to find most aligned axis
          alignments.sort((a, b) => b.value - a.value);
          const ignoredAxis = alignments[0].axis;
          
          // Create drag plane perpendicular to the ignored axis
          const planeNormal = new THREE.Vector3();
          if (ignoredAxis === 'x') {
            planeNormal.set(1, 0, 0);
          } else if (ignoredAxis === 'y') {
            planeNormal.set(0, 1, 0);
          } else {
            planeNormal.set(0, 0, 1);
          }
          
          // Transform plane normal to world space
          planeNormal.transformDirection(axesGroup.matrixWorld);
          
          dragPlane.setFromNormalAndCoplanarPoint(planeNormal, worldPos);
          
          // Calculate initial intersection for offset
          raycaster.setFromCamera(mouse, camera);
          if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
            dragOffset.copy(dragPoint).sub(worldPos);
          }
        } else {
          isRotating = true;
        }
      }
    };

    const handleMouseUp = () => {
      localIsDragging = false;
      setIsDragging(false);
      isRotating = false;
    };

    const handleWheel = (e) => {
      camera.position.z = Math.max(5, Math.min(20, camera.position.z + e.deltaY * 0.01));
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Subtle floating animation
      if (!localIsDragging) {
        const time = Date.now() * 0.001;
        const floatOffset = Math.sin(time) * 0.1;
        
        // Apply floating to the base position
        ball.position.copy(basePosition.current);
        ball.position.y += floatOffset;
        
        ball.rotation.y += 0.003;
      }

      // Pulsing glow
      if (glow) {
        glow.material.opacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.1;
      }

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [currentPhase]);

  // ===== DIALOG CONFIGURATION =====
  
  const phaseDialogs = {
    intro: [
      { id: '1', npc: 'ERRATA' as const, text: "As we know, an axis is a line along which something can vary.", requiresInteraction: false },
      { id: '2', npc: 'ERRATA' as const, text: "So far, we've only been dealing with bounded axes - ones that have definite limits.", requiresInteraction: false },
      { id: '3', npc: 'ERRATA' as const, text: "But nothing is preventing us from saying 'this axis has no bounds' - and it will extend forever.", requiresInteraction: false },
      { id: '4', npc: 'ERRATA' as const, text: "We can classify these as bounded axes and unbounded axes.", requiresInteraction: false },
      { id: '5', npc: 'ERRATA' as const, text: "We can combine these types of axes to form a semi-bounded axis.", requiresInteraction: false },
      { id: '6', npc: 'ERRATA' as const, text: "Now we still have a single infinite axis… but somehow we are looking at one of its ends.", requiresInteraction: false },
      { id: '7', npc: 'ERRATA' as const, text: "We can move it around…", requiresInteraction: false },
      { id: '8', npc: 'ERRATA' as const, text: "We can manipulate its structure.", requiresInteraction: false },
      { id: '9', npc: 'ERRATA' as const, text: "All while understanding that no matter how far down we go, there is no 'other end'.", requiresInteraction: true }
    ],
    'closure-demo': [
      { id: '5', npc: 'ERRATA' as const, text: "Now let's explore operational closure - how operations within a space keep you within that space.", requiresInteraction: false },
      { id: '6', npc: 'ERRATA' as const, text: "Notice how no matter where you move the null core, it stays within the boundaries of 3D space.", requiresInteraction: false },
      { id: '7', npc: 'ERRATA' as const, text: "This is operational closure - the space is closed under the operation of movement.", requiresInteraction: true }
    ],
    'space-creation': [
      { id: '9', npc: 'ERRATA' as const, text: "Both types of closure work together. Dimensional closure defines the shape, while operational closure defines what you can do within it.", requiresInteraction: false },
      { id: '10', npc: 'ERRATA' as const, text: "Look at these axes - X, Y, and Z. Each is an axis, and together they create the 3D space where the null core exists.", requiresInteraction: true }
    ],
    'dimensional-wrapping': [
      { id: '3', npc: 'ERRATA' as const, text: "An axis is a line along which something can vary.", requiresInteraction: false },
      { id: '4', npc: 'ERRATA' as const, text: "Move the slider to see how you can travel along this open axis - it goes on forever.", requiresInteraction: true }
    ],
    'dimensional-interpolation': [
      { id: '4b', npc: 'ERRATA' as const, text: "The line begins to curve, bending space itself until the two ends meet...", requiresInteraction: true }
    ],
    'dimensional-wrapping-circular': [
      { id: '5', npc: 'ERRATA' as const, text: "Perfect! The axis has wrapped onto itself. Try moving around the circle.", requiresInteraction: false },
      { id: '6', npc: 'ERRATA' as const, text: "You can travel forever in one direction, yet you'll always return to where you started. This is dimensional closure.", requiresInteraction: true }
    ],
    'closed-open-relationship': [
      { id: '12', npc: 'ERRATA' as const, text: "Here's the key insight: closed dimensions always assume there's an open dimension for them to operate within.", requiresInteraction: false },
      { id: '13', npc: 'ERRATA' as const, text: "A circle exists in 2D space. A sphere exists in 3D space. The closed dimension needs the open dimension to give it form.", requiresInteraction: true }
    ]
  }

  // ===== DIALOG NAVIGATION =====
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Phase progression map
      const nextPhase: Record<LessonPhase, LessonPhase | 'complete'> = {
        'intro': 'closure-demo',
        'dimensional-wrapping': 'dimensional-interpolation', 
        'dimensional-interpolation': 'dimensional-wrapping-circular',
        'dimensional-wrapping-circular': 'closure-demo',
        'closure-demo': 'space-creation',
        'space-creation': 'closed-open-relationship',
        'closed-open-relationship': 'complete',
        'complete': 'complete'
      }
      
      const next = nextPhase[currentPhase]
      if (next === 'complete') {
        setShowCompletionScreen(true)
      } else {
        setCurrentPhase(next)
        setCurrentDialogIndex(0)
      }
    }
  }
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      switch (currentPhase) {
        case 'dimensional-wrapping':
          setCurrentPhase('intro')
          setCurrentDialogIndex(1)
          break
        case 'dimensional-wrapping-circular':
          setCurrentPhase('dimensional-wrapping')
          setCurrentDialogIndex(1)
          break
        case 'closure-demo':
          setCurrentPhase('dimensional-wrapping-circular')
          setCurrentDialogIndex(1)
          break
        case 'space-creation':
          setCurrentPhase('closure-demo')
          setCurrentDialogIndex(3)
          break
        case 'closed-open-relationship':
          setCurrentPhase('space-creation')
          setCurrentDialogIndex(2)
          break
      }
    }
  }

  // Monitor typing progress for classification dialog
  useEffect(() => {
    if (currentPhase === 'intro' && currentDialogIndex === 3) {
      // Reset label states when entering the classification dialog
      setShowBoundedLabel(false)
      setShowUnboundedLabel(false)
      
      // Use timing approach - show labels at specific points during typing
      // Dialog text: "We can classify these as bounded axes and unbounded axes."
      // Typing speed: 40ms per character, starts after 500ms delay
      
      const boundedTimeout = setTimeout(() => {
        setShowBoundedLabel(true)
      }, 500 + (31 * 40)) // "We can classify these as bounded" = ~31 chars
      
      const unboundedTimeout = setTimeout(() => {
        setShowUnboundedLabel(true)
      }, 500 + (48 * 40)) // "We can classify these as bounded axes and unbounded" = ~48 chars
      
      return () => {
        clearTimeout(boundedTimeout)
        clearTimeout(unboundedTimeout)
      }
    } else if (currentPhase === 'intro' && currentDialogIndex === 4) {
      // Dialog 6: Show cut axis animation
      const cutTimeout = setTimeout(() => {
        setShowCutAxis(true)
        setShowBoundedLabel(false) // Hide labels
        setShowUnboundedLabel(false)
      }, 1500) // Wait a bit into the dialog
      
      return () => clearTimeout(cutTimeout)
    } else if (currentPhase === 'intro' && currentDialogIndex === 5) {
      // Dialog 7: Show end arrow
      const arrowTimeout = setTimeout(() => {
        setShowEndArrow(true)
      }, 1000) // Show arrow partway through dialog
      
      return () => clearTimeout(arrowTimeout)
    } else if (currentPhase === 'intro' && currentDialogIndex === 6) {
      // Dialog 8: Show rotating axis - Keep CutAxis visible but start rotation
      setShowCutAxis(true) // Keep it visible
      setShowEndArrow(false) // Hide the arrow
      setShowBoundedLabel(false)
      setShowUnboundedLabel(false)
      setShowPulseAxis(false)
      setShowInfiniteAxis(false)
      
      const rotateTimeout = setTimeout(() => {
        setShowRotatingAxis(true) // This will trigger rotation of CutAxis
      }, 800)
      
      return () => clearTimeout(rotateTimeout)
    } else if (currentPhase === 'intro' && currentDialogIndex === 7) {
      // Dialog 9: Show pulse axis - wait for rotation to complete
      setWaitingForRotationComplete(true)
      // Don't hide cut axis or stop rotation yet - wait for it to return to horizontal
    } else if (currentPhase === 'intro' && currentDialogIndex === 8) {
      // Dialog 10: Show infinite perspective axis
      const infiniteTimeout = setTimeout(() => {
        setShowInfiniteAxis(true)
        setShowPulseAxis(false)
      }, 1200) // Start infinite perspective partway through dialog
      
      return () => clearTimeout(infiniteTimeout)
    } else {
      // Reset all states when not in relevant dialogs
      setShowBoundedLabel(false)
      setShowUnboundedLabel(false)
      setShowCutAxis(false)
      setShowEndArrow(false)
      setShowRotatingAxis(false)
      setShowPulseAxis(false)
      setShowInfiniteAxis(false)
    }
  }, [currentPhase, currentDialogIndex])

  // Monitor rotation angle when waiting for completion
  useEffect(() => {
    if (!waitingForRotationComplete || !showRotatingAxis) return
    
    // Check if rotation is near 0 or 360 (horizontal position)
    const normalizedAngle = rotationAngle % 360
    const isNearHorizontal = normalizedAngle < 5 || normalizedAngle > 355
    
    if (isNearHorizontal && rotationAngle > 180) { // Ensure at least half rotation completed
      // Rotation complete - stop rotation and show pulses
      setWaitingForRotationComplete(false)
      setShowRotatingAxis(false)
      setShowCutAxis(false)
      
      // Small delay before showing pulses
      setTimeout(() => {
        setShowPulseAxis(true)
      }, 300)
    }
  }, [rotationAngle, waitingForRotationComplete, showRotatingAxis])

  // Cooldown timer effect
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
  
  const currentDialog = getCurrentDialogs()[currentDialogIndex]
  
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
          {/* Intro Phase - Shows different displays based on dialog */}
          {currentPhase === 'intro' && (
            <div className="relative w-full h-screen flex flex-col items-center justify-center -mt-16">
              <div className="text-center space-y-8 w-full px-8">
                {/* Dialog 1: Show constrained slider - fade out cleanly during cut */}
                {currentDialogIndex >= 0 && currentDialogIndex <= 3 && (
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: showCutAxis ? 0 : 1, 
                      y: showCutAxis ? -20 : 0,
                      scale: showCutAxis ? 0.95 : 1
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ pointerEvents: showCutAxis ? 'none' : 'auto' }}
                  >
                    <ConstrainedSlider 
                      position={sliderPosition} 
                      onPositionChange={setSliderPosition}
                      enabled={!showCutAxis}
                      showArrows={currentDialogIndex >= 1 && !showCutAxis}
                    />
                  </m.div>
                )}
                
                {/* Dialog 3: Show unbounded slider - fade out cleanly during cut */}
                {currentDialogIndex >= 2 && currentDialogIndex <= 3 && (
                  <m.div
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: showCutAxis ? 0 : 1, 
                      y: showCutAxis ? -20 : 0,
                      scale: showCutAxis ? 0.95 : 1
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut", delay: showCutAxis ? 0 : 0.3 }}
                    style={{ pointerEvents: showCutAxis ? 'none' : 'auto' }}
                  >
                    <UnboundedSlider 
                      position={sliderPosition2} 
                      onPositionChange={setSliderPosition2}
                      enabled={!showCutAxis}
                    />
                  </m.div>
                )}
                
                {/* Dialog 5: Show cut axis (semi-bounded) - clean fade in */}
                {(showCutAxis || showRotatingAxis) && !showPulseAxis && !showInfiniteAxis && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                  >
                    <CutAxisSlider 
                      position={sliderPosition2} 
                      onPositionChange={setSliderPosition2}
                      enabled={true}
                      showEndArrow={showEndArrow && !showRotatingAxis}
                      isRotating={showRotatingAxis}
                      onRotationUpdate={setRotationAngle}
                    />
                  </m.div>
                )}
                
                
                {/* Dialog 8: Show pulse axis */}
                {showPulseAxis && (
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <PulseAxis 
                      position={sliderPosition2} 
                      onPositionChange={setSliderPosition2}
                      enabled={true}
                    />
                  </m.div>
                )}
                
                {/* Dialog 9: Show infinite perspective axis */}
                {showInfiniteAxis && (
                  <m.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <InfiniteAxis 
                      position={sliderPosition2} 
                      onPositionChange={setSliderPosition2}
                      enabled={true}
                    />
                  </m.div>
                )}
                
                {/* Dialog 4: Labels for bounded and unbounded - synced to typing */}
                {currentDialogIndex === 3 && (
                  <>
                    {showBoundedLabel && (
                      <m.div
                        className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none"
                        style={{ marginTop: '-60px' }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center">
                          <span className="text-white/60 text-sm whitespace-nowrap">← bounded axis →</span>
                        </div>
                      </m.div>
                    )}
                    {showUnboundedLabel && (
                      <m.div
                        className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none"
                        style={{ marginTop: '160px' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center">
                          <span className="text-white/60 text-sm whitespace-nowrap">← unbounded axis →</span>
                        </div>
                      </m.div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Linear Dimensional Demo */}
          {currentPhase === 'dimensional-wrapping' && (
            <div className="relative w-full h-screen flex flex-col items-center justify-center -mt-16">
              <div className="text-center space-y-6 w-full px-8">
                <h3 className="text-xl font-semibold text-white mb-4"></h3>
                <OneDimensionSlider 
                  position={sliderPosition} 
                  onPositionChange={setSliderPosition}
                  enabled={true}
                  fullWidth={true}
                />
                <p className="text-white/70 text-sm"></p>
              </div>
            </div>
          )}
          
          {/* Interpolation Demo */}
          {currentPhase === 'dimensional-interpolation' && (
            <div className="relative w-full h-screen flex flex-col items-center justify-center -mt-16">
              <div className="text-center space-y-6 w-full px-8">
                <h3 className="text-xl font-semibold text-white mb-4">Transforming Dimensions</h3>
                
                {/* Transition container */}
                <div className="relative h-48 flex items-center justify-center">
                  {/* Line slider fades out */}
                  <m.div
                    className="absolute w-full"
                    animate={{ 
                      opacity: transformationStarted ? 0 : 1,
                      scale: transformationStarted ? 0.9 : 1
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  >
                    <OneDimensionSlider 
                      position={sliderPosition} 
                      onPositionChange={setSliderPosition}
                      enabled={!transformationStarted}
                      fullWidth={true}
                      showLabels={false}
                    />
                  </m.div>
                  
                  {/* Circle slider fades in */}
                  <m.div
                    className="absolute"
                    animate={{ 
                      opacity: transformationStarted ? 1 : 0,
                      scale: transformationStarted ? 1 : 1.1
                    }}
                    transition={{ duration: 1, ease: "easeInOut", delay: 1.5 }}
                  >
                    <CircularSlider 
                      position={circularPosition} 
                      onPositionChange={setCircularPosition}
                      enabled={transformationStarted}
                    />
                  </m.div>
                </div>
                
                <p className="text-white/70 text-sm">Watch as the linear axis curves into a circle</p>
              </div>
            </div>
          )}
          
          {/* Circular Dimensional Demo */}
          {currentPhase === 'dimensional-wrapping-circular' && (
            <div className="relative w-full h-screen flex flex-col items-center justify-center -mt-16">
              <div className="text-center space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">1D Dimension (Wrapped)</h3>
                <CircularSlider 
                  position={circularPosition} 
                  onPositionChange={setCircularPosition}
                  enabled={true}
                />
                <p className="text-white/70 text-sm">The same axis, but wrapped onto itself - creating closure</p>
              </div>
            </div>
          )}
          
          {/* 3D Component */}
          {(currentPhase === 'closure-demo' || currentPhase === 'space-creation' || currentPhase === 'closed-open-relationship') && (
            <div className="relative w-full h-screen -mt-32">
              <div className="absolute inset-0" ref={mountRef} />

              {isDragging && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-purple-300 text-sm font-medium tracking-wider animate-pulse">
                  DRAGGING
                </div>
              )}
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
              <p className="text-white/80 mb-6">You've explored the concept of Closure</p>

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
                    transition={{ duration: 60, ease: "linear" }}
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
                  onClick={() => router.push('/sanctuary?activity=review')}
                  className="flex flex-col items-center gap-2 p-4 bg-cosmic-void/50 rounded-xl hover:bg-cosmic-void/70 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-cosmic-aurora" />
                  <span className="text-white/80 text-sm">Review Notes</span>
                </m.button>

                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/sanctuary?activity=meditate')}
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

export default function Lesson4Page() {
  return (
    <ProtectedRoute>
      <Lesson4Content />
    </ProtectedRoute>
  )
}