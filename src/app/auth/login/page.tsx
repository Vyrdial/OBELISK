'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Sparkles, Rocket } from 'lucide-react'
import Link from 'next/link'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithProvider, session } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false // Default to NOT remembering for better security
  })

  // Redirect to home if already authenticated
  useEffect(() => {
    if (session) {
      router.push('/home')
    }
  }, [session, router])

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
    <div className="min-h-screen relative overflow-x-hidden bg-black">
      {/* Cosmic Background matching home page */}
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <CosmicBackground 
          intensity="low" 
          enableMeteors={false}
          enableNebula={false}
          enablePlanets={false}
        />
      </ClientOnly>
      
      {/* Subtle dark gradient overlay matching home */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-indigo-950/30 pointer-events-none z-10" />
      
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 p-6"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <m.button
            onClick={() => router.push('/')}
            className="p-2 rounded-full glass-morphism border border-white/10 hover:border-purple-500/30 transition-all duration-200 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </m.button>
          
          <m.h1
            className="text-2xl font-bold text-white cosmic-heading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
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
          <div className="glass-morphism rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
            {/* Title */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-white cosmic-heading mb-3">
                Welcome Back
              </h2>
              <p className="text-white/60">
                Continue your journey through the cosmos
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
                <label className="text-white/70 text-sm font-medium block">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500/30 focus:bg-white/10 transition-all duration-200 outline-none"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500/30 focus:bg-white/10 transition-all duration-200 outline-none"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                      Keep me signed in
                    </span>
                    <span className="text-white/40 text-xs">
                      {formData.rememberMe ? 'Stay signed in for 30 days' : 'Sign out when browser closes'}
                    </span>
                  </div>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200 text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <m.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-[30ms] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Signing in...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Sign In
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
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/50">
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
                className="p-3 rounded-xl glass-morphism border border-white/10 text-white/80 hover:border-purple-500/20 hover:bg-purple-500/10 transition-all duration-200 backdrop-blur-sm"
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
                className="p-3 rounded-xl glass-morphism border border-white/10 text-white/80 hover:border-purple-500/20 hover:bg-purple-500/10 transition-all duration-200 backdrop-blur-sm"
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
              <p className="text-white/60">
                New to OBELISK?{' '}
                <Link
                  href="/auth/signup"
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-semibold"
                >
                  Create an account
                </Link>
              </p>
            </m.div>
          </div>
        </m.div>
      </div>

    </div>
  )
}