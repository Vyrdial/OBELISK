// Safe window object access
export const safeWindow = typeof window !== 'undefined' ? window : undefined

// Safe document object access
export const safeDocument = typeof document !== 'undefined' ? document : undefined

// Safe localStorage access
export const safeLocalStorage = (() => {
  try {
    return typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : undefined
  } catch {
    return undefined
  }
})()

// Safe sessionStorage access
export const safeSessionStorage = (() => {
  try {
    return typeof window !== 'undefined' && window.sessionStorage
      ? window.sessionStorage
      : undefined
  } catch {
    return undefined
  }
})()

// Check if code is running on server
export const isServer = typeof window === 'undefined'

// Check if code is running on client
export const isClient = !isServer

// Safe navigator access
export const safeNavigator = typeof navigator !== 'undefined' ? navigator : undefined

// Get safe window dimensions
export function getWindowDimensions() {
  if (!safeWindow) {
    return { width: 0, height: 0 }
  }
  
  return {
    width: safeWindow.innerWidth || 0,
    height: safeWindow.innerHeight || 0
  }
}

// Safe matchMedia
export function safeMatchMedia(query: string): MediaQueryList | null {
  if (!safeWindow || !safeWindow.matchMedia) {
    return null
  }
  
  return safeWindow.matchMedia(query)
}

// Safe requestAnimationFrame
export const safeRequestAnimationFrame = 
  safeWindow?.requestAnimationFrame || 
  ((callback: FrameRequestCallback) => setTimeout(callback, 16))

// Safe cancelAnimationFrame  
export const safeCancelAnimationFrame = 
  safeWindow?.cancelAnimationFrame || 
  ((id: number) => clearTimeout(id))