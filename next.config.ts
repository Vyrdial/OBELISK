import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@supabase/supabase-js'],
    scrollRestoration: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Advanced bundle splitting for optimal loading
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          
          // Framework chunk (React, Next.js core)
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true
          },
          
          // UI libraries chunk
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](framer-motion|lucide-react|@radix-ui)[\\/]/,
            priority: 30,
            enforce: true
          },
          
          // Supabase chunk (often large)
          supabase: {
            name: 'supabase',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            priority: 25,
            enforce: true
          },
          
          // Vendor libraries chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            reuseExistingChunk: true
          },
          
          // Common application code
          common: {
            name: 'common',
            chunks: 'all',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          },
          
          // Lesson pages (likely to be accessed together)
          lessons: {
            name: 'lessons',
            chunks: 'all',
            test: /[\\/]src[\\/]app[\\/](dimensions|universal-relativity|null-core|galaxy)[\\/]/,
            priority: 15,
            minChunks: 1
          },
          
          // Planner components
          planner: {
            name: 'planner',
            chunks: 'all',
            test: /[\\/]src[\\/]components[\\/]planner[\\/]/,
            priority: 15,
            minChunks: 1
          }
        }
      }
      
      // Optimize module concatenation
      config.optimization.concatenateModules = true
      
      // Tree shaking optimization
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }
    
    // Performance optimizations for all builds
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    return config
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
  },
  
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  
  // Temporarily disable for development (re-enable for production)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Advanced headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
