import { useEffect, useRef, useState, RefObject } from 'react'

interface IntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
}

interface IntersectionObserverResult {
  isIntersecting: boolean
  entry: IntersectionObserverEntry | null
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: IntersectionObserverOptions = {}
): IntersectionObserverResult {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false
  } = options

  const [result, setResult] = useState<IntersectionObserverResult>({
    isIntersecting: false,
    entry: null
  })

  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    const element = elementRef?.current

    if (!element || typeof IntersectionObserver === 'undefined') {
      return
    }

    if (triggerOnce && hasTriggeredRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        setResult({
          isIntersecting: entry.isIntersecting,
          entry
        })

        if (entry.isIntersecting && triggerOnce) {
          hasTriggeredRef.current = true
          observer.unobserve(element)
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, threshold, root, rootMargin, triggerOnce])

  return result
}