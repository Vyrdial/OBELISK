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
  
  // Handle remember me session management
  const rememberMe = request.cookies.get('obelisk_remember_me')?.value === 'true'
  const sessionActive = request.cookies.get('obelisk_session_active')?.value === 'true'
  const hasAuthToken = request.cookies.get('obelisk-auth-token')?.value
  
  // If user has auth but didn't want to be remembered and no active session marker
  if (hasAuthToken && !rememberMe && !sessionActive) {
    // This means browser was closed and reopened - clear the session
    response.cookies.delete('obelisk-auth-token')
    
    // Redirect to login if accessing protected routes
    const protectedPaths = ['/home', '/profile', '/courses', '/learn', '/shop', '/planner']
    if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  // Set session marker for non-remembered sessions
  if (hasAuthToken && !rememberMe) {
    response.cookies.set('obelisk_session_active', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // No maxAge = session cookie (deleted on browser close)
    })
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