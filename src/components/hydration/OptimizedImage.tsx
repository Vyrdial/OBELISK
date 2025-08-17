'use client'

import { useState, useRef, ImgHTMLAttributes } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { m } from 'framer-motion'

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  placeholder,
  priority = false,
  onLoad,
  onError,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)
  
  const { isIntersecting } = useIntersectionObserver(imgRef, {
    threshold: 0.01,
    rootMargin: '50px',
    triggerOnce: true
  })

  // Start loading when visible
  if (isIntersecting && !shouldLoad) {
    setShouldLoad(true)
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !placeholder && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Main image */}
      {shouldLoad && !hasError && (
        <m.img
          {...props}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full h-full object-cover ${isLoaded ? '' : 'invisible'}`}
        />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
}