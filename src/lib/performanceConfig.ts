// Performance configuration to prevent flickering and optimize animations

export const performanceConfig = {
  // Animation settings
  animations: {
    // Reduce animation complexity
    enableComplexAnimations: false,
    // Use CSS animations instead of JS where possible
    preferCSSAnimations: true,
    // Debounce animation triggers
    animationDebounce: 100,
    // Reduce particle counts
    maxParticles: 30,
    // Disable animations on low-end devices
    disableOnLowEnd: true
  },
  
  // Rendering optimizations
  rendering: {
    // Use GPU acceleration
    useGPUAcceleration: true,
    // Batch DOM updates
    batchUpdates: true,
    // Lazy load heavy components
    lazyLoadThreshold: 0.1,
    // Virtualize long lists
    virtualizeThreshold: 50
  },
  
  // Hydration settings
  hydration: {
    // Progressive hydration
    progressive: true,
    // Priority components to hydrate first
    priorityComponents: ['TopNavigationBar', 'AuthProvider'],
    // Delay non-critical hydration
    delayNonCritical: 500
  },
  
  // Background effects
  backgroundEffects: {
    // Reduce star count on mobile
    mobileStarCount: 20,
    // Desktop star count
    desktopStarCount: 50,
    // Disable meteors on mobile
    disableMeteorsOnMobile: true,
    // Reduce nebula opacity
    nebulaOpacity: 0.2
  }
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true
  }
  
  // Check device memory (if available)
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory < 4
  }
  
  // Check hardware concurrency
  if ('hardwareConcurrency' in navigator) {
    return navigator.hardwareConcurrency < 4
  }
  
  return false
}

// Get optimized animation settings
export function getOptimizedAnimationSettings() {
  const isLowEnd = isLowEndDevice()
  
  return {
    duration: isLowEnd ? 0.2 : 0.3,
    ease: isLowEnd ? 'linear' : 'easeInOut',
    stagger: isLowEnd ? 0 : 0.05,
    disabled: isLowEnd && performanceConfig.animations.disableOnLowEnd
  }
}