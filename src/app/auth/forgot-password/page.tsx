'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Sparkles, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import LandingBackground from '@/components/effects/LandingBackground'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate email sending process
    setTimeout(() => {
      setIsLoading(false)
      setIsEmailSent(true)
    }, 2000)
  }

  if (isEmailSent) {
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
              onClick={() => router.push('/auth/login')}
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
            
            <div className="w-9" />
          </div>
        </m.div>

        {/* Success Message */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="glass-morphism rounded-3xl p-8 border border-white/20 shadow-cosmic backdrop-blur-xl text-center">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </m.div>

              <h2 className="text-2xl font-bold text-white cosmic-heading mb-4">
                Reset Link Sent!
              </h2>
              
              <p className="text-white/70 mb-6 leading-relaxed">
                We&apos;ve sent a password reset link to <span className="text-cosmic-starlight font-semibold">{email}</span>. 
                Check your email and follow the instructions to reset your password.
              </p>

              <div className="space-y-4">
                <m.button
                  onClick={() => router.push('/auth/login')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora text-white font-semibold cosmic-button shadow-cosmic hover:shadow-stardust transition-all duration-75 duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Login
                </m.button>

                <button
                  onClick={() => setIsEmailSent(false)}
                  className="w-full py-3 text-white/70 hover:text-white transition-colors duration-75 text-sm"
                >
                  Didn&apos;t receive the email? Try again
                </button>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    )
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
            onClick={() => router.push('/auth/login')}
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
          
          <div className="w-9" />
        </div>
      </m.div>

      {/* Reset Form */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="glass-morphism rounded-3xl p-8 border border-white/20 shadow-cosmic backdrop-blur-xl">
            {/* Title */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Mail className="w-6 h-6 text-cosmic-starlight" />
                <h2 className="text-3xl font-bold text-white cosmic-heading">
                  Reset Password
                </h2>
                <Mail className="w-6 h-6 text-cosmic-aurora" />
              </div>
              <p className="text-white/70">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>
            </m.div>

            {/* Form */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-cosmic-starlight focus:bg-white/10 transition-all duration-75 duration-300 cosmic-focus outline-none"
                  placeholder="singularity@cosmos.space"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              {/* Submit Button */}
              <m.button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora text-white font-semibold cosmic-button shadow-cosmic hover:shadow-stardust transition-all duration-75 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading || !email ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !email ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <m.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Sending Reset Link...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Send Reset Link
                  </span>
                )}
              </m.button>
            </m.form>

            {/* Back to Login */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-8 pt-6 border-t border-white/10"
            >
              <p className="text-white/70">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-cosmic-starlight hover:text-cosmic-aurora transition-colors duration-75 font-semibold"
                >
                  Back to login
                </Link>
              </p>
            </m.div>
          </div>
        </m.div>
      </div>
    </div>
  )
}