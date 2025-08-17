'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowLeft, RefreshCw, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import LandingBackground from '@/components/effects/LandingBackground'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    // In a real app, you'd call your resend email API here
    setTimeout(() => {
      setIsResending(false)
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LandingBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-md w-full space-y-8"
        >
          {/* Back Button */}
          <m.button
            onClick={() => router.push('/auth/signup')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-75 mb-4"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.1 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to signup
          </m.button>

          <div className="glass-morphism rounded-3xl p-8 border border-white/20 text-center">
            {/* Icon */}
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-cosmic-starlight to-cosmic-aurora rounded-full flex items-center justify-center mb-6"
            >
              <Mail className="w-10 h-10 text-white" />
            </m.div>

            {/* Title */}
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white cosmic-heading mb-4"
            >
              Check Your Email
            </m.h1>

            {/* Subtitle */}
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/70 mb-6 leading-relaxed"
            >
              We've sent a confirmation link to{' '}
              <span className="text-cosmic-starlight font-semibold">{email}</span>
            </m.p>

            {/* Instructions */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-start gap-3 text-left">
                <Sparkles className="w-5 h-5 text-cosmic-aurora mt-0.5 flex-shrink-0" />
                <div className="text-white/80 text-sm">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ol className="space-y-1 text-white/60">
                    <li>1. Check your email inbox</li>
                    <li>2. Click the confirmation link</li>
                    <li>3. Begin your cosmic journey!</li>
                  </ol>
                </div>
              </div>
            </m.div>

            {/* Resend Email */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              <p className="text-white/60 text-sm">
                Didn't receive an email? Check your spam folder or
              </p>
              
              <m.button
                onClick={handleResendEmail}
                disabled={isResending || resendSuccess}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-semibold rounded-full transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: resendSuccess ? 1 : 1.02 }}
                whileTap={{ scale: resendSuccess ? 1 : 0.98 }}
              >
                {isResending ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </div>
                ) : resendSuccess ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Email sent!
                  </div>
                ) : (
                  'Resend confirmation email'
                )}
              </m.button>
            </m.div>

            {/* Help */}
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/50 text-xs mt-6"
            >
              Need help? Contact us at{' '}
              <Link href="mailto:support@obelisk.app" className="text-cosmic-starlight hover:text-cosmic-aurora transition-colors">
                support@obelisk.app
              </Link>
            </m.p>
          </div>
        </m.div>
      </div>
    </div>
  )
}