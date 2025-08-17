'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Sparkles, Rocket } from 'lucide-react'
import Link from 'next/link'
import LandingBackground from '@/components/effects/LandingBackground'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithProvider } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true // Default to remembering the user
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await signIn(formData.email, formData.password, formData.rememberMe)
      
      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      // Success - user will be redirected via auth state change
      router.push('/home')
    } catch {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'discord') => {
    try {
      setError(null)
      const { error } = await signInWithProvider(provider)
      
      if (error) {
        setError(error.message)
      }
    } catch {
      setError('An unexpected error occurred')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LandingBackground />
      
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 p-6"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <m.button
            onClick={() => router.push('/')}
            className="p-2 rounded-full glass-morphism border border-white/20 hover:border-cosmic-starlight/50 transition-all duration-75 cosmic-focus"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </m.button>
          
          <m.h1
            className="text-2xl font-bold cosmic-text-gradient cosmic-heading"
            animate={{ 
              textShadow: [
                '0 0 10px rgba(233, 69, 96, 0.3)',
                '0 0 20px rgba(233, 69, 96, 0.6)',
                '0 0 10px rgba(233, 69, 96, 0.3)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            OBELISK
          </m.h1>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </m.div>

      {/* Login Form */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Form Container */}
          <div className="glass-morphism rounded-3xl p-8 border border-white/20 shadow-cosmic backdrop-blur-xl">
            {/* Title */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-cosmic-starlight" />
                <h2 className="text-3xl font-bold text-white cosmic-heading">
                  Welcome Back
                </h2>
                <Sparkles className="w-6 h-6 text-cosmic-aurora" />
              </div>
              <p className="text-white/70">
                Continue your journey through the cosmos of knowledge
              </p>
            </m.div>

            {/* Error Message */}
            {error && (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </m.div>
            )}

            {/* Login Form */}
            <m.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium block">
                  Email Address
                </label>
                <m.input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-cosmic-starlight focus:bg-white/10 transition-all duration-75 duration-300 cosmic-focus outline-none"
                  placeholder="singularity@cosmos.space"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium block">
                  Password
                </label>
                <div className="relative">
                  <m.input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 pr-12 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-cosmic-starlight focus:bg-white/10 transition-all duration-75 duration-300 cosmic-focus outline-none"
                    placeholder="••••••••••••"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors duration-75 z-10 bg-cosmic-dark/50 backdrop-blur-sm rounded-lg p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-cosmic-starlight focus:ring-cosmic-starlight focus:ring-offset-0"
                  />
                  <span className="text-white/70">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-cosmic-starlight hover:text-cosmic-aurora transition-colors duration-75"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <m.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cosmic-glow to-cosmic-starlight text-white font-semibold cosmic-button shadow-cosmic hover:shadow-stardust transition-all duration-75 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <m.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Entering the Cosmos...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Launch Into Learning
                  </span>
                )}
              </m.button>
            </m.form>

            {/* Divider */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="my-8 relative"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">
                  or continue with
                </span>
              </div>
            </m.div>

            {/* Social Login */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-3"
            >
              <m.button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="p-3 rounded-xl border border-white/20 text-white/80 hover:border-white/40 hover:bg-white/5 transition-all duration-75 duration-300 cosmic-focus"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                  <span className="text-sm font-medium">Google</span>
                </div>
              </m.button>
              <m.button
                type="button"
                onClick={() => handleSocialLogin('discord')}
                className="p-3 rounded-xl border border-white/20 text-white/80 hover:border-white/40 hover:bg-white/5 transition-all duration-75 duration-300 cosmic-focus"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-sm"></div>
                  <span className="text-sm font-medium">Discord</span>
                </div>
              </m.button>
            </m.div>

            {/* Sign Up Link */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-8 pt-6 border-t border-white/10"
            >
              <p className="text-white/70">
                New to the cosmos?{' '}
                <Link
                  href="/auth/signup"
                  className="text-cosmic-starlight hover:text-cosmic-aurora transition-colors duration-75 font-semibold"
                >
                  Begin your journey
                </Link>
              </p>
            </m.div>
          </div>
        </m.div>
      </div>

    </div>
  )
}