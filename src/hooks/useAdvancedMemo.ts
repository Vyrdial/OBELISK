'use client'

import { useRef, useMemo, useCallback, DependencyList } from 'react'

// Deep comparison memo hook for complex objects
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; value: T }>()
  
  const hasChanged = useMemo(() => {
    if (!ref.current) return true
    
    if (ref.current.deps.length !== deps.length) return true
    
    return deps.some((dep, index) => {
      const prev = ref.current!.deps[index]
      return !deepEqual(dep, prev)
    })
  }, deps)
  
  if (hasChanged) {
    ref.current = { deps: [...deps], value: factory() }
  }
  
  return ref.current!.value
}

// Stable callback with automatic dependency optimization
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps?: DependencyList
): T {
  const callbackRef = useRef(callback)
  const depsRef = useRef(deps)
  
  // Only update if dependencies actually changed
  const hasChanged = useMemo(() => {
    if (!deps) return true
    if (!depsRef.current) return true
    if (depsRef.current.length !== deps.length) return true
    
    return deps.some((dep, index) => dep !== depsRef.current![index])
  }, deps)
  
  if (hasChanged) {
    callbackRef.current = callback
    depsRef.current = deps
  }
  
  return useCallback(callbackRef.current, deps || [])
}

// Memoized selector hook for derived state
export function useSelector<TState, TSelected>(
  state: TState,
  selector: (state: TState) => TSelected,
  equalityFn?: (a: TSelected, b: TSelected) => boolean
): TSelected {
  const lastStateRef = useRef<TState>()
  const lastSelectedRef = useRef<TSelected>()
  const selectorRef = useRef(selector)
  
  // Update selector if it changed
  selectorRef.current = selector
  
  return useMemo(() => {
    const currentState = state
    
    // If state didn't change, return cached value
    if (lastStateRef.current === currentState && lastSelectedRef.current !== undefined) {
      return lastSelectedRef.current
    }
    
    const newSelected = selectorRef.current(currentState)
    
    // If selected value didn't change (by equality function), return cached value
    if (lastSelectedRef.current !== undefined) {
      const areEqual = equalityFn 
        ? equalityFn(lastSelectedRef.current, newSelected)
        : Object.is(lastSelectedRef.current, newSelected)
      
      if (areEqual) {
        return lastSelectedRef.current
      }
    }
    
    lastStateRef.current = currentState
    lastSelectedRef.current = newSelected
    
    return newSelected
  }, [state, equalityFn])
}

// Batch state updates to prevent excessive re-renders
export function useBatchedState<T>(
  initialState: T
): [T, (updater: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState(initialState)
  const pendingUpdatesRef = useRef<Array<T | ((prev: T) => T)>>([])
  const timeoutRef = useRef<NodeJS.Timeout | undefined>()
  
  const batchedSetState = useCallback((updater: T | ((prev: T) => T)) => {
    pendingUpdatesRef.current.push(updater)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(currentState => {
        return pendingUpdatesRef.current.reduce((acc, update) => {
          return typeof update === 'function' ? (update as (prev: T) => T)(acc) : update
        }, currentState)
      })
      pendingUpdatesRef.current = []
    }, 0)
  }, [])
  
  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      setState(currentState => {
        return pendingUpdatesRef.current.reduce((acc, update) => {
          return typeof update === 'function' ? (update as (prev: T) => T)(acc) : update
        }, currentState)
      })
      pendingUpdatesRef.current = []
    }
  }, [])
  
  return [state, batchedSetState, flushUpdates]
}

// Optimized effect hook that skips if dependencies haven't deeply changed
export function useDeepEffect(
  effect: () => void | (() => void),
  deps: DependencyList
) {
  const prevDepsRef = useRef<DependencyList>()
  const cleanupRef = useRef<(() => void) | void>()
  
  const hasChanged = useMemo(() => {
    if (!prevDepsRef.current) return true
    if (prevDepsRef.current.length !== deps.length) return true
    
    return deps.some((dep, index) => !deepEqual(dep, prevDepsRef.current![index]))
  }, deps)
  
  if (hasChanged) {
    // Cleanup previous effect
    if (cleanupRef.current) {
      cleanupRef.current()
    }
    
    // Run new effect
    cleanupRef.current = effect()
    prevDepsRef.current = [...deps]
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])
}

// Utility function for deep equality check
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return a === b
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return a === b
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  return keysA.every(key => deepEqual(a[key], b[key]))
}

// Import useState for useBatchedState
import { useState, useEffect } from 'react'