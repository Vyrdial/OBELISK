import { NextRequest, NextResponse } from 'next/server'
import { ServerPerformanceMonitor } from '@/lib/serverOptimization'

export function middleware(request: NextRequest) {
  const start = Date.now()
  
  // Performance headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // Caching headers for static assets
  if (request.nextUrl.pathname.startsWith('/static/') || 
      request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // API route optimizations
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  }
  
  // Record performance metrics
  const responseTime = Date.now() - start
  ServerPerformanceMonitor.recordRequest(responseTime)
  response.headers.set('X-Response-Time', `${responseTime}ms`)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes - to prevent session interference)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}