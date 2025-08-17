import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function DraggableBall() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const ballRef = useRef(null);
  const basePosition = useRef(new THREE.Vector3(0, 0, 0));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

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
    camera.position.set(0, 0, 10);
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
    const loader = new THREE.FontLoader();
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
    const yLabel = createLabel('Y', '#9d6bff', new THREE.Vector3(0, 3.5, 0));
    const zLabel = createLabel('Z', '#6b9dff', new THREE.Vector3(0, 0, 3.5));
    
    axesGroup.add(xLabel);
    axesGroup.add(yLabel);
    axesGroup.add(zLabel);

    // Create the ball with gradient-like material
    const ballGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const ballMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8888ff,
      emissive: 0x4444aa,
      emissiveIntensity: 0.5,
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
      color: 0x8888ff,
      transparent: true,
      opacity: 0.1,
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
        glow.material.opacity = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
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
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
      <div className="absolute inset-0" ref={mountRef} />
      
      <div className="absolute top-6 left-6 text-white/80 bg-white/5 backdrop-blur-xl px-5 py-4 rounded-2xl border border-white/10">
        <p className="text-sm font-medium tracking-wide">
          Drag sphere • Click space to rotate • Scroll to zoom
        </p>
      </div>

      {isDragging && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-purple-300 text-sm font-medium tracking-wider animate-pulse">
          DRAGGING
        </div>
      )}
    </div>
  );
}