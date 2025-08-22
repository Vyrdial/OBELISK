'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import { 
  ArrowLeft, 
  Shield, 
  LogOut, 
  Key, 
  Globe, 
  Smartphone,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TopNavigationBar from '@/components/ui/TopNavigationBar'

function SettingsContent() {
  const router = useRouter()
  const { signOut, signOutAllSessions, user } = useAuth()
  const { profile } = useProfile()
  const [isSigningOutAll, setIsSigningOutAll] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSignOutAllSessions = async () => {
    setIsSigningOutAll(true)
    try {
      const { error } = await signOutAllSessions()
      if (!error) {
        setSuccessMessage('All sessions have been signed out. Redirecting to login...')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        console.error('Error signing out all sessions:', error)
        setSuccessMessage('Failed to sign out all sessions. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setSuccessMessage('An error occurred. Please try again.')
    } finally {
      setIsSigningOutAll(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-black">
      {/* Cosmic Background */}
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <CosmicBackground 
          intensity="low" 
          enableMeteors={false}
          enableNebula={false}
          enablePlanets={false}
        />
      </ClientOnly>
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-indigo-950/30 pointer-events-none z-10" />
      
      <TopNavigationBar />

      <main className="relative z-20 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <h1 className="text-4xl font-bold text-white cosmic-heading mb-2">
              Settings
            </h1>
            <p className="text-white/60">
              Manage your account preferences and security
            </p>
          </m.div>

          {/* Success Message */}
          {successMessage && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                {successMessage}
              </div>
            </m.div>
          )}

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Account Information */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-morphism rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Account Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-sm">Email</label>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="text-white/60 text-sm">Display Name</label>
                  <p className="text-white">{profile?.display_name || 'Singularity'}</p>
                </div>
                <div>
                  <label className="text-white/60 text-sm">Account Type</label>
                  <p className="text-white">
                    {profile?.is_premium ? (
                      <span className="text-yellow-400">Premium</span>
                    ) : (
                      <span className="text-white/80">Free</span>
                    )}
                  </p>
                </div>
              </div>
            </m.div>

            {/* Security Settings */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                Security
              </h2>
              
              <div className="space-y-4">
                {/* Sign Out All Sessions */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Active Sessions
                      </h3>
                      <p className="text-white/60 text-sm mb-3">
                        Sign out of all devices and browsers where you're currently signed in.
                        You'll need to sign in again on each device.
                      </p>
                      <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl transition-all duration-200 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out All Sessions
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me Info */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Session Preferences
                  </h3>
                  <p className="text-white/60 text-sm">
                    When signing in, you can choose whether to stay signed in for 30 days
                    or only until you close your browser. This preference is set during login.
                  </p>
                </div>
              </div>
            </m.div>

            {/* Privacy Settings */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-morphism rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Privacy
              </h2>
              <p className="text-white/60 text-sm">
                Privacy settings coming soon. We're working on giving you more control
                over your data and how it's used.
              </p>
            </m.div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSigningOutAll && setShowConfirmDialog(false)}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-morphism rounded-2xl p-6 border border-white/20 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Sign Out All Sessions?
              </h3>
            </div>
            
            <p className="text-white/70 mb-6">
              This will sign you out of all devices and browsers where you're currently signed in.
              You'll be redirected to the login page and will need to sign in again.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSigningOutAll}
                className="flex-1 px-4 py-2 glass-morphism border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOutAllSessions}
                disabled={isSigningOutAll}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSigningOutAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Sign Out All
                  </>
                )}
              </button>
            </div>
          </m.div>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}