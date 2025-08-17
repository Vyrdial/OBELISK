'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, Award, Sparkles, Clock, Brain, ArrowRight, BookOpen, MousePointer, Move3D } from 'lucide-react'
import * as THREE from 'three'
import NPCDialog from '@/components/npcs/NPCDialog'
import QuizInterface from '@/components/lesson/QuizInterface'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import AchievementToast, { achievements, Achievement } from '@/components/effects/AchievementToast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { dictionaryService, predefinedEntries } from '@/lib/dictionaryService'

type LessonPhase = 'intro' | 'zero-d' | 'one-d' | 'two-d' | 'three-d' | 'higher-d' | 'nesting' | 'stacking' | 'summary' | 'quiz' | 'complete'

// 1D Slider Component
function OneAxisSlider({ position, onPositionChange, enabled = true }: { 
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
    <div className="relative w-full max-w-2xl mx-auto">
      <div 
        className="relative h-2 bg-white/10 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <m.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full -ml-2"
          animate={{ left: `${position * 100}%` }}
          transition={{ type: "tween", duration: 0.1 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-white/60 text-sm">
        <span>-1</span>
        <span>0</span>
        <span>+1</span>
      </div>
    </div>
  )
}

// 2D Movement Area
function TwoAxisArea({ position, onPositionChange, enabled = true, showExtraAxes = false, glowingAxes = false }: {
  position: { x: number, y: number },
  onPositionChange: (pos: { x: number, y: number }) => void,
  enabled?: boolean,
  showExtraAxes?: boolean,
  glowingAxes?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const updatePosition = (e: MouseEvent) => {
      e.preventDefault()
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      onPositionChange({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y))
      })
    }
    
    updatePosition(e.nativeEvent)
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', updatePosition, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-white/5 border border-white/20 rounded-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        {/* Grid lines and axes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(pos => (
            <g key={pos}>
              <line x1={`${pos * 100}%`} y1="0" x2={`${pos * 100}%`} y2="100%" stroke="rgba(255,255,255,0.1)" />
              <line x1="0" y1={`${pos * 100}%`} x2="100%" y2={`${pos * 100}%`} stroke="rgba(255,255,255,0.1)" />
            </g>
          ))}
          
          {/* Main axes */}
          <m.line 
            x1="50%" y1="0" x2="50%" y2="100%" 
            stroke={glowingAxes ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"} 
            strokeWidth={glowingAxes ? "3" : "2"}
            animate={glowingAxes ? {
              filter: ["drop-shadow(0 0 4px rgba(255,255,255,0.8))", "drop-shadow(0 0 12px rgba(255,255,255,1))", "drop-shadow(0 0 4px rgba(255,255,255,0.8))"]
            } : {}}
            transition={glowingAxes ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
          />
          <m.line 
            x1="0" y1="50%" x2="100%" y2="50%" 
            stroke={glowingAxes ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"} 
            strokeWidth={glowingAxes ? "3" : "2"}
            animate={glowingAxes ? {
              filter: ["drop-shadow(0 0 4px rgba(255,255,255,0.8))", "drop-shadow(0 0 12px rgba(255,255,255,1))", "drop-shadow(0 0 4px rgba(255,255,255,0.8))"]
            } : {}}
            transition={glowingAxes ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
          />
          
          {/* Extra horizontal axes for dialog 10 */}
          {showExtraAxes && (
            <>
              <m.line 
                x1="0" y1="25%" x2="100%" y2="25%" 
                stroke="rgba(255,100,100,0.5)" 
                strokeWidth="2"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <m.line 
                x1="0" y1="75%" x2="100%" y2="75%" 
                stroke="rgba(100,255,100,0.5)" 
                strokeWidth="2"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              />
              <m.line 
                x1="0" y1="40%" x2="100%" y2="40%" 
                stroke="rgba(100,100,255,0.5)" 
                strokeWidth="2"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              />
            </>
          )}
          
          {/* Axis labels */}
          <text x="95%" y="45%" fill="rgba(255,255,255,0.6)" fontSize="14" textAnchor="middle" dominantBaseline="middle">
            X
          </text>
          <text x="55%" y="8%" fill="rgba(255,255,255,0.6)" fontSize="14" textAnchor="middle" dominantBaseline="middle">
            Y
          </text>
        </svg>
        
        <m.div
          className="absolute w-4 h-4 bg-white rounded-full -ml-2 -mt-2"
          animate={{ 
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`
          }}
          transition={{ type: "tween", duration: 0.1 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-white/60 text-sm">
        <span>X: {(position.x * 2 - 1).toFixed(2)}</span>
        <span>Y: {(1 - position.y * 2).toFixed(2)}</span>
      </div>
    </div>
  )
}


// Quiz questions
const quiz = {
  id: 'axes-quiz',
  questions: [
    {
      id: 'q1',
      question: "Why can a null core exist in any number of axes?",
      options: [
        "It has magical properties",
        "It has no extent, so it doesn't need space to exist in",
        "It can change its size",
        "It exists outside of axes"
      ],
      correctAnswer: 1,
      explanation: "Since a null core has no size or extent, it doesn't require any space. It can exist at a point regardless of how many axes define the space.",
      hint: "Think about what takes up space..."
    },
    {
      id: 'q2',
      question: "What defines a new axis?",
      options: [
        "A new color or texture",
        "An independent direction of movement that's perpendicular to all existing axes",
        "Adding more space",
        "Making things bigger"
      ],
      correctAnswer: 1,
      explanation: "Each new axis must be perpendicular (orthogonal) to all existing axes - it's a completely independent way to move or vary.",
      hint: "Remember how up-down is independent of left-right..."
    },
    {
      id: 'q3',
      question: "Why can't we fully visualize the 4th spatial axis?",
      options: [
        "Our brains aren't smart enough",
        "We exist in 3-axis space and can only perceive projections of higher-axis spaces",
        "The 4th axis doesn't exist",
        "We need special equipment"
      ],
      correctAnswer: 1,
      explanation: "Just as a 2D being can't fully perceive 3D (only shadows/projections), we 3D beings can only see projections of 4D objects, not their full form.",
      hint: "Think about the flatland analogy..."
    }
  ],
  passingScore: 2,
  stardustReward: 50
}

function AxesLessonContent() {
  const router = useRouter()
  const { profile, addStardust, addAchievement, unlockModule } = useProfile()
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('intro')
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [earnedStardust, setEarnedStardust] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(60) // 60 seconds cooldown
  
  // Interactive states
  const [zeroDLocked, setZeroDLocked] = useState(true)
  const [oneDPosition, setOneDPosition] = useState(0.5)
  const [twoDPosition, setTwoDPosition] = useState({ x: 0.5, y: 0.5 })
  const [threeDPosition, setThreeDPosition] = useState({ x: 0, y: 0, z: 0 })

  // 3D Ball refs and state
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const ballRef = useRef(null);
  const basePosition = useRef(new THREE.Vector3(0, 0, 0));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!mountRef.current || currentPhase !== 'three-d') return;

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
  
  // Phase dialogs
  const phaseDialogs = {
    intro: [
      { id: '1', npc: 'ERRATA' as const, text: "Let's explore axes through null cores.", requiresInteraction: false },
      { id: '2', npc: 'ERRATA' as const, text: "An axis is a way to change or move.", requiresInteraction: true }
    ],
    'zero-d': [
      { id: '3', npc: 'ERRATA' as const, text: "Here's a null core. It has no size.", requiresInteraction: false },
      { id: '4', npc: 'ERRATA' as const, text: "In 0-space, it cannot move. Zero axes.", requiresInteraction: true }
    ],
    'one-d': [
      { id: '5', npc: 'ERRATA' as const, text: "Let's give it one way to move.", requiresInteraction: false },
      { id: '6', npc: 'ERRATA' as const, text: "It slides left or right. This is 1-space.", requiresInteraction: false },
      { id: '7', npc: 'ERRATA' as const, text: "We need 2-space to show 1-space movement.", requiresInteraction: false },
      { id: '7a', npc: 'ERRATA' as const, text: "Perception requires 2-space. Existence needs only 0-space.", requiresInteraction: true }
    ],
    'two-d': [
      { id: '8', npc: 'ERRATA' as const, text: "Add a second, orthogonal direction.", requiresInteraction: false },
      { id: '9', npc: 'ERRATA' as const, text: "Now: up-down AND left-right. But there's more...", requiresInteraction: false },
      { id: '10', npc: 'ERRATA' as const, text: "Many axes could exist here, but only two orthogonal ones define the space.", requiresInteraction: false },
      { id: '11', npc: 'ERRATA' as const, text: "Two orthogonal axes make this 2-space.", requiresInteraction: false },
      { id: '11a', npc: 'ERRATA' as const, text: "A space is all possible positions within it.", requiresInteraction: false },
      { id: '11b', npc: 'ERRATA' as const, text: "DEFINITION_PLACEHOLDER", requiresInteraction: false },
      { id: '11c', npc: 'ERRATA' as const, text: "These positions come from the span of orthogonal axes.", requiresInteraction: false },
      { id: '11d', npc: 'ERRATA' as const, text: "It's simpler than it sounds.", requiresInteraction: false },
      { id: '11e', npc: 'ERRATA' as const, text: "The span of axes IS the space.", requiresInteraction: true }
    ],
    'three-d': [
      { id: '12', npc: 'ERRATA' as const, text: "Third axis: forward and backward.", requiresInteraction: false },
      { id: '13', npc: 'ERRATA' as const, text: "Three axes. Three ways to move.", requiresInteraction: false },
      { id: '14', npc: 'ERRATA' as const, text: "The marker becomes a sphere in 3-space.", requiresInteraction: true }
    ],
    'higher-d': [
      { id: '15', npc: 'ERRATA' as const, text: "What about a fourth axis?", requiresInteraction: false },
      { id: '16', npc: 'ERRATA' as const, text: "Beings are bound by their space's dimensions.", requiresInteraction: false },
      { id: '17', npc: 'ERRATA' as const, text: "We can't visualize a fourth axis.", requiresInteraction: false },
      { id: '18', npc: 'ERRATA' as const, text: "To understand n-space, you must live in it.", requiresInteraction: true }
    ],
    nesting: [
      { id: '19', npc: 'ERRATA' as const, text: "Spaces nest like boxes.", requiresInteraction: false },
      { id: '20', npc: 'ERRATA' as const, text: "Line → surface → volume.", requiresInteraction: false },
      { id: '21', npc: 'ERRATA' as const, text: "Lower spaces exist within higher ones.", requiresInteraction: true }
    ],
    stacking: [
      { id: '21', npc: 'ERRATA' as const, text: "Spaces build from simpler ones.", requiresInteraction: false },
      { id: '22', npc: 'ERRATA' as const, text: "Infinite points → line.", requiresInteraction: false },
      { id: '23', npc: 'ERRATA' as const, text: "Infinite lines → surface.", requiresInteraction: false },
      { id: '24', npc: 'ERRATA' as const, text: "Infinite surfaces → volume.", requiresInteraction: true }
    ],
    summary: [
      { id: '25', npc: 'ERRATA' as const, text: "Null cores exist in any space.", requiresInteraction: false },
      { id: '26', npc: 'ERRATA' as const, text: "But space determines movement.", requiresInteraction: false },
      { id: '27', npc: 'MNEMONIC' as const, text: "Axes unfold all possibilities. Ready?", requiresInteraction: true }
    ]
  }
  
  const getCurrentDialogs = () => phaseDialogs[currentPhase] || []
  
  const handleNextDialog = () => {
    const dialogs = getCurrentDialogs()
    
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1)
    } else {
      // Move to next phase
      switch (currentPhase) {
        case 'intro':
          // Unlock "axis" definition after intro
          dictionaryService.addEntry(predefinedEntries['axis'])
          setCurrentPhase('zero-d')
          setCurrentDialogIndex(0)
          break
        case 'zero-d':
          setCurrentPhase('one-d')
          setCurrentDialogIndex(0)
          setZeroDLocked(false)
          break
        case 'one-d':
          setCurrentPhase('two-d')
          setCurrentDialogIndex(0)
          break
        case 'two-d':
          setCurrentPhase('three-d')
          setCurrentDialogIndex(0)
          break
        case 'three-d':
          setCurrentPhase('higher-d')
          setCurrentDialogIndex(0)
          break
        case 'higher-d':
          setCurrentPhase('nesting')
          setCurrentDialogIndex(0)
          break
        case 'nesting':
          setCurrentPhase('stacking')
          setCurrentDialogIndex(0)
          break
        case 'stacking':
          setCurrentPhase('summary')
          setCurrentDialogIndex(0)
          break
        case 'summary':
          setShowQuiz(true)
          break
      }
    }
  }
  
  const handleBackDialog = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1)
    } else {
      // Go back to previous phase
      switch (currentPhase) {
        case 'zero-d':
          setCurrentPhase('intro')
          setCurrentDialogIndex(1) // Go to the last dialog of intro
          break
        case 'one-d':
          setCurrentPhase('zero-d')
          setCurrentDialogIndex(1) // Go to the last dialog of zero-d
          setZeroDLocked(true)
          break
        case 'two-d':
          setCurrentPhase('one-d')
          setCurrentDialogIndex(2) // Go to the last dialog of one-d
          break
        case 'three-d':
          setCurrentPhase('two-d')
          setCurrentDialogIndex(2) // Go to the last dialog of two-d
          break
        case 'higher-d':
          setCurrentPhase('three-d')
          setCurrentDialogIndex(2) // Go to the last dialog of three-d
          break
        case 'nesting':
          setCurrentPhase('higher-d')
          setCurrentDialogIndex(3) // Go to the last dialog of higher-d
          break
        case 'stacking':
          setCurrentPhase('nesting')
          setCurrentDialogIndex(2) // Go to the last dialog of nesting
          break
        case 'summary':
          setCurrentPhase('stacking')
          setCurrentDialogIndex(3) // Go to the last dialog of stacking
          break
      }
    }
  }
  
  const handleQuizComplete = async (totalQuestions: number) => {
    const stardustEarned = quiz.stardustReward
    await addStardust(stardustEarned)
    await unlockModule('one-axis-slider')
    setEarnedStardust(stardustEarned)
    setShowQuiz(false)
    setShowCompletionScreen(true)
  }
  
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
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar />
      
      {/* Main Interactive Area */}
      <div className="fixed inset-0 pt-16 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          {/* Zero D - Locked null core */}
          {currentPhase === 'zero-d' && (
            <m.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-white rounded-full" />
                <p className="text-white/60 text-center mt-8 text-lg">No movement possible</p>
              </div>
            </m.div>
          )}
          
          {/* One D - Slider */}
          {currentPhase === 'one-d' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-full max-w-2xl">
                <div className={`${currentDialogIndex === 2 ? 'highlight-glow' : ''}`}>
                  <OneAxisSlider
                    position={oneDPosition}
                    onPositionChange={setOneDPosition}
                    enabled={true}
                  />
                </div>
                <p className="text-white/60 text-center mt-8">
                  One axis of freedom: left ↔ right
                </p>
              </div>
            </m.div>
          )}
          
          {/* Two D - Plane */}
          {currentPhase === 'two-d' && currentDialogIndex >= 1 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-full max-w-4xl">
                {/* Show definition card for dialog 11b (index 5) */}
                {currentDialogIndex === 5 ? (
                  <m.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border-2 border-cosmic-aurora rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <m.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Sparkles className="w-6 h-6 text-cosmic-aurora" />
                      </m.div>
                      <h3 className="text-cosmic-aurora font-bold text-xl">DEFINITION UNLOCKED!</h3>
                    </div>
                    <p className="text-white font-medium mb-2">n-space</p>
                    <p className="text-white/80">
                      A mathematical space with exactly n orthogonal axes. The "n" tells you how many independent directions you can move in.
                    </p>
                    <m.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-cosmic-starlight text-sm mt-3"
                    >
                      ✨ Added to the Archive
                    </m.p>
                  </m.div>
                ) : (
                  <>
                    <TwoAxisArea
                      position={twoDPosition}
                      onPositionChange={setTwoDPosition}
                      enabled={true}
                      showExtraAxes={currentDialogIndex === 2}
                      glowingAxes={currentDialogIndex === 3}
                    />
                    <p className="text-white/60 text-center mt-4">
                      Two axes: X and Y
                    </p>
                  </>
                )}
              </div>
            </m.div>
          )}
          
          {/* Three D - Three.js Sphere */}
          {currentPhase === 'three-d' && (
            <div className="relative w-full h-screen -mt-32">
              <div className="absolute inset-0" ref={mountRef} />

              {isDragging && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-purple-300 text-sm font-medium tracking-wider animate-pulse">
                  DRAGGING
                </div>
              )}
            </div>
          )}
          
          {/* Higher D - Visualization */}
          {currentPhase === 'higher-d' && currentDialogIndex >= 1 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="relative">
                {/* 2D plane with beings */}
                <div className="w-96 h-96 bg-white/5 border border-white/20 rounded-lg relative">
                  <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-cosmic-aurora rounded-full" />
                  <div className="absolute top-3/4 right-1/3 w-4 h-4 bg-cosmic-aurora rounded-full" />
                  <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-cosmic-aurora rounded-full" />
                  
                  {currentDialogIndex >= 2 && (
                    <m.div
                      initial={{ opacity: 0, y: -100 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-20 left-1/2 transform -translate-x-1/2"
                    >
                      <div className="w-8 h-8 bg-white rounded-full" />
                      <div className="text-white/60 text-sm mt-2">3D observer</div>
                    </m.div>
                  )}
                </div>
                <p className="text-white/60 text-center mt-4">
                  2-axis beings cannot perceive the 3rd axis
                </p>
              </div>
            </m.div>
          )}
          
          {/* Nesting visualization */}
          {currentPhase === 'nesting' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="relative">
                <m.div
                  animate={{ scale: 1.05 }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-96 h-96 bg-white/5 border border-white/20 rounded-lg flex items-center justify-center"
                >
                  <m.div
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="w-64 h-64 bg-white/5 border border-white/30 rounded-lg flex items-center justify-center"
                  >
                    <m.div
                      animate={{ scale: 1.05 }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="w-32 h-1 bg-white/40 rounded-full"
                    />
                  </m.div>
                </m.div>
                <p className="text-white/60 text-center mt-4">
                  1-axis → 2-axis → 3-axis (nested spaces)
                </p>
              </div>
            </m.div>
          )}
          
          {/* Stacking visualization */}
          {currentPhase === 'stacking' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="space-y-8">
                {currentDialogIndex >= 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <m.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-white/60">→</span>
                    <div className="w-32 h-1 bg-white rounded-full" />
                    <span className="text-white/60">0D → 1D</span>
                  </div>
                )}
                
                {currentDialogIndex >= 1 && (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      {[...Array(3)].map((_, i) => (
                        <m.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-32 h-1 bg-white rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-white/60">→</span>
                    <div className="w-32 h-16 bg-white/20 rounded" />
                    <span className="text-white/60">1D → 2D</span>
                  </div>
                )}
                
                {currentDialogIndex >= 2 && (
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-16">
                      {[...Array(4)].map((_, i) => (
                        <m.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="absolute w-32 h-16 bg-white/10 rounded border border-white/20"
                          style={{ transform: `translateZ(${i * 4}px) translateY(${i * -2}px)` }}
                        />
                      ))}
                    </div>
                    <span className="text-white/60">→</span>
                    <div className="w-16 h-16 bg-white/30 rounded transform rotate-12" style={{ transformStyle: 'preserve-3d' }} />
                    <span className="text-white/60">2D → 3D</span>
                  </div>
                )}
              </div>
            </m.div>
          )}
        </div>
      </div>
      
      {/* Dialog System */}
      {currentDialog && !showQuiz && !showCompletionScreen && (
        <NPCDialog
          dialog={currentDialog}
          onNext={handleNextDialog}
          isVisible={true}
          canGoBack={!(currentPhase === 'intro' && currentDialogIndex === 0)}
          onBack={handleBackDialog}
          allowMinimize={false}
        />
      )}
      
      {/* Quiz */}
      {showQuiz && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-30 p-6"
        >
          <div className="max-w-4xl mx-auto">
            <QuizInterface
              quiz={quiz}
              onComplete={handleQuizComplete}
            />
          </div>
        </m.div>
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
              <p className="text-white/80 mb-6">You've mastered the concept of Axes</p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 text-cosmic-starlight mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">+{earnedStardust} Stardust earned</span>
                </div>
                <p className="text-sm text-white/60">
                  From zero to infinity - axes define possibility itself
                </p>
              </div>

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
      
      {/* Definition unlock animations */}
      {currentPhase === 'intro' && currentDialogIndex === 1 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onAnimationComplete={() => {
              // Add to dictionary when animation completes
              dictionaryService.addEntry(predefinedEntries['axis'])
            }}
            className="bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border-2 border-cosmic-aurora rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <m.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-cosmic-aurora" />
              </m.div>
              <h3 className="text-cosmic-aurora font-bold text-xl">DEFINITION UNLOCKED!</h3>
            </div>
            <p className="text-white font-medium mb-2">Axis</p>
            <p className="text-white/80">
              A way something can change or move. Each axis is independent.
            </p>
            <m.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-cosmic-starlight text-sm mt-3"
            >
              ✨ Added to the Archive
            </m.p>
          </m.div>
        </div>
      )}

      {currentPhase === 'two-d' && currentDialogIndex === 0 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onAnimationComplete={() => {
              // Add to dictionary when animation completes
              dictionaryService.addEntry(predefinedEntries['orthogonal'])
            }}
            className="bg-gradient-to-r from-cosmic-aurora/30 to-cosmic-starlight/30 border-2 border-cosmic-aurora rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <m.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-cosmic-aurora" />
              </m.div>
              <h3 className="text-cosmic-aurora font-bold text-xl">DEFINITION UNLOCKED!</h3>
            </div>
            <p className="text-white font-medium mb-2">Orthogonal</p>
            <p className="text-white/80">
              Completely independent. When two things are orthogonal, changing one does not affect the other.
            </p>
            <m.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-cosmic-starlight text-sm mt-3"
            >
              ✨ Added to the Archive
            </m.p>
          </m.div>
        </div>
      )}

      {/* Achievement Toast */}
      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementToast
            achievement={unlockedAchievement}
            onClose={() => setUnlockedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AxesLesson() {
  return (
    <ProtectedRoute>
      <AxesLessonContent />
    </ProtectedRoute>
  )
}