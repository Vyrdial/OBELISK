import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Border colors for aura rings
    'border-cosmic-aurora',
    'border-cosmic-starlight',
    'border-blue-400',
    'border-cyan-300',
    'border-purple-500',
    'border-indigo-400',
    'border-emerald-500',
    'border-green-400',
    'border-red-500',
    'border-orange-400',
    'border-yellow-400',
    'border-amber-300',
    'border-cyan-400',
    'border-blue-200',
    'border-gray-600',
    'border-purple-900',
    'border-pink-400',
    'border-purple-400',
    'border-pink-500',
    'border-blue-300',
    'border-white',
    // Background colors for NPCs
    'bg-npc-errata',
    'bg-npc-mnemonic',
    'bg-npc-echelon',
    'bg-npc-lagom',
    // Text colors for NPCs
    'text-npc-errata',
    'text-npc-mnemonic',
    'text-npc-echelon',
    'text-npc-lagom',
    // Dynamic aura colors - gradients
    'from-cosmic-aurora', 'via-cosmic-starlight', 'to-cosmic-aurora',
    'from-cosmic-glow', 'to-cosmic-starlight', 'to-cosmic-glow',  // Important button gradients
    'from-emerald-400', 'via-green-300', 'to-purple-400',  // Proper aurora borealis gradient
    'from-green-400', 'via-emerald-300', 'to-transparent',  // Aurora variations
    'from-blue-500', 'via-cyan-400', 'to-blue-600',
    'from-purple-600', 'via-cosmic-plasma', 'to-indigo-600',
    'from-emerald-500', 'via-green-400', 'to-teal-500',
    'from-red-600', 'via-orange-500', 'to-red-500',
    'from-yellow-500', 'via-cosmic-stardust', 'to-amber-500',
    'from-cyan-400', 'via-blue-300', 'to-cyan-500',
    'from-gray-900', 'via-purple-900', 'to-black',
    'from-pink-500', 'via-purple-500', 'to-indigo-500',
    'from-pink-600', 'via-cosmic-plasma', 'to-purple-600',
    // Dynamic aura colors - single colors with opacity
    'bg-cosmic-aurora', 'bg-blue-500', 'bg-purple-600', 'bg-emerald-500', 'bg-red-600',
    'bg-yellow-500', 'bg-cyan-400', 'bg-gray-900', 'bg-pink-500', 'bg-pink-600',
    'bg-green-400', 'bg-green-400/10', 'bg-green-400/20', 'bg-green-400/30',  // Green variants
    'bg-emerald-400/10', 'bg-emerald-400/15', 'bg-emerald-400/20', 'bg-emerald-400/25',  // Emerald aurora variants
    'bg-green-300/10', 'bg-green-300/15', 'bg-green-300/20',  // Light green aurora
    'bg-purple-400/5', 'bg-purple-400/10',  // Purple aurora edge
    'bg-cosmic-aurora/20', 'bg-blue-500/20', 'bg-purple-600/20', 'bg-emerald-500/20', 'bg-red-600/20',
    'bg-yellow-500/20', 'bg-cyan-400/20', 'bg-gray-900/20', 'bg-pink-500/20', 'bg-pink-600/20',
    'bg-cosmic-aurora/30', 'bg-blue-500/30', 'bg-purple-600/30', 'bg-emerald-500/30', 'bg-red-600/30',
    'bg-yellow-500/30', 'bg-cyan-400/30', 'bg-gray-900/30', 'bg-pink-500/30', 'bg-pink-600/30',
    // Dynamic aura colors - borders with opacity
    'border-cosmic-aurora/30', 'border-blue-500/30', 'border-purple-600/30', 'border-emerald-500/30', 'border-red-600/30',
    'border-yellow-500/30', 'border-cyan-400/30', 'border-gray-900/30', 'border-pink-500/30', 'border-pink-600/30',
    'border-cosmic-aurora/50', 'border-blue-500/50', 'border-purple-600/50', 'border-emerald-500/50', 'border-red-600/50',
    'border-yellow-500/50', 'border-cyan-400/50', 'border-gray-900/50', 'border-pink-500/50', 'border-pink-600/50',
    // Dynamic aura colors - text colors
    'text-cosmic-aurora', 'text-blue-500', 'text-purple-600', 'text-emerald-500', 'text-red-600',
    'text-yellow-500', 'text-cyan-400', 'text-gray-900', 'text-pink-500', 'text-pink-600',
    // Dynamic aura colors - shadows
    'shadow-cosmic-aurora/50', 'shadow-blue-500/50', 'shadow-purple-600/50', 'shadow-emerald-500/50', 'shadow-red-600/50',
    'shadow-yellow-500/50', 'shadow-cyan-400/50', 'shadow-gray-900/50', 'shadow-pink-500/50', 'shadow-pink-600/50',
    // Dynamic aura colors - to-* for gradients
    'to-cosmic-aurora', 'to-blue-500', 'to-purple-600', 'to-emerald-500', 'to-red-600',
    'to-yellow-500', 'to-cyan-400', 'to-gray-900', 'to-pink-500', 'to-pink-600'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Cosmic color palette
        cosmic: {
          void: '#0a0a0f',
          space: '#1a1a2e',
          nebula: '#16213e',
          starlight: '#e94560',
          aurora: '#4ade80',  // Green for actual aurora effect
          plasma: '#8e44ad',
          quasar: '#3498db',
          pulsar: '#1abc9c',
          supernova: '#e74c3c',
          stardust: '#f1c40f',
          constellation: '#9b59b6',
          galaxy: '#2c3e50',
          orbit: '#34495e',
          glow: '#f39c12'  // Orange glow for important CTA buttons
        },
        // NPC specific colors
        npc: {
          errata: '#e94560',    // Warm star-robed sage
          mnemonic: '#3498db',  // Playful polyhedron
          echelon: '#9b59b6',   // Precise constellation
          lagom: '#f39c12'      // Serene starlight mist
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        'nebula-gradient': 'radial-gradient(ellipse at center, #16213e 0%, #0a0a0f 70%)',
        'aurora-gradient': 'linear-gradient(45deg, #f39c12, #e94560, #8e44ad, #3498db)',
        'stardust-shimmer': 'linear-gradient(45deg, #f1c40f, #e74c3c, #f39c12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'orbit': 'orbit 20s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
      fontFamily: {
        cosmic: ['Inter', 'system-ui', 'sans-serif'],
        title: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cosmic': '0 0 20px rgba(233, 69, 96, 0.3)',
        'stardust': '0 0 15px rgba(241, 196, 64, 0.4)',
        'nebula': '0 10px 40px rgba(22, 33, 62, 0.8)',
      },
      backdropBlur: {
        'cosmic': '12px',
      }
    },
  },
  plugins: [],
} satisfies Config;