// Application configuration
export const appConfig = {
  // Production domain
  productionUrl: 'https://obelisk.codes',
  
  // Get the current site URL based on environment
  getSiteUrl: () => {
    // First check for environment variable
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // In production, use the production URL
    if (process.env.NODE_ENV === 'production') {
      return 'https://obelisk.codes'
    }
    
    // In development or if window is available, use current origin
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    
    // Fallback to localhost for server-side rendering in dev
    return 'http://localhost:3000'
  },
  
  // Auth callback URL
  getAuthCallbackUrl: () => {
    return `${appConfig.getSiteUrl()}/auth/callback`
  },
  
  // API endpoints (if needed in the future)
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api'
  },
  
  // Feature flags
  features: {
    rememberMe: {
      defaultEnabled: false, // Default to NOT remembering for security
      maxAgeDays: 30 // How long to remember users
    }
  },
  
  // Cookie configuration
  cookies: {
    domain: process.env.NODE_ENV === 'production' ? '.obelisk.codes' : undefined,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const
  }
}