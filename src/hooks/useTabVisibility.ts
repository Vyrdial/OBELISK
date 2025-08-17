'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export function useTabVisibility() {
  // Always return true to keep animations running regardless of tab visibility
  const [isVisible] = useState(true)
  const [wasHidden] = useState(false)

  // Remove all the visibility change handling - animations will continue running

  const optimizeForBackground = useCallback(() => {
    return {
      shouldAnimate: true, // Always animate
      shouldUpdate: true,  // Always update
      animationDelay: 0,   // No delay
      reducedMotion: false // No reduced motion
    }
  }, [])

  return {
    isVisible: true,    // Always visible
    wasHidden: false,   // Never hidden
    optimizeForBackground
  }
}

// Hook for managing animations - now always runs regardless of tab visibility
export function useAnimationFrame(callback: () => void, deps: any[] = []) {
  const requestRef = useRef<number>()
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Always run animations regardless of tab visibility
    const animate = () => {
      callbackRef.current()
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [...deps])

  // Cleanup function
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])
}

// Hook for timers and intervals - now always runs regardless of tab visibility
export function useOptimizedTimer(
  callback: () => void,
  interval: number,
  options: { pauseWhenHidden?: boolean; reduceWhenHidden?: boolean } = {}
) {
  const callbackRef = useRef(callback)
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Always run the timer at normal interval regardless of tab visibility
    timerRef.current = setInterval(() => {
      callbackRef.current()
    }, interval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [interval])

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }
}