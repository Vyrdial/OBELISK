'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorFallbackProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-morphism rounded-2xl p-8 border border-red-500/20 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Oops! Something went wrong
        </h2>
        
        <p className="text-white/70 mb-6">
          We encountered an unexpected error. Don't worry, your progress is safe.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-cosmic-aurora text-white rounded-full font-semibold hover:bg-cosmic-aurora/90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-[30ms] flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/home')}
            className="w-full px-6 py-3 glass-morphism border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-[30ms] flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-white/60 text-sm cursor-pointer hover:text-white/80">
              Error details
            </summary>
            <pre className="mt-2 p-3 bg-black/40 rounded-lg text-xs text-red-400 overflow-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}