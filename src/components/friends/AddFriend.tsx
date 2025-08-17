'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { UserPlus, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useFriends } from '@/hooks/useFriends'

interface AddFriendProps {
  onClose: () => void
}

export default function AddFriend({ onClose }: AddFriendProps) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  
  const { sendFriendRequestByUsername, error: friendsError } = useFriends()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) return
    
    setIsLoading(true)
    setResult({ type: null, message: '' })
    
    try {
      const result = await sendFriendRequestByUsername(username.trim())
      
      if (result.success) {
        setResult({
          type: 'success',
          message: `Friend request sent to @${username}!`
        })
        setTimeout(() => {
          setUsername('')
          setResult({ type: null, message: '' })
        }, 2000)
      } else {
        setResult({
          type: 'error',
          message: result.error || 'User not found or request already sent'
        })
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to send friend request'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Add Friend</h2>
            <m.button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4 text-white/70" />
            </m.button>
          </div>
          <p className="text-sm text-white/60 mt-2">
            Enter a username to send a friend request
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-10">
                  @
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cosmic-starlight/50 focus:bg-white/15 transition-all"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {/* Result Message */}
            <AnimatePresence mode="wait">
              {result.type && (
                <m.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    result.type === 'success'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}
                >
                  {result.type === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{result.message}</span>
                </m.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <m.button
              type="submit"
              disabled={!username.trim() || isLoading}
              className={`w-full px-4 py-3 bg-cosmic-aurora/20 border border-cosmic-aurora/30 hover:bg-cosmic-aurora/30 hover:border-cosmic-aurora/50 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                (!username.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={username.trim() && !isLoading ? { scale: 1.02 } : {}}
              whileTap={username.trim() && !isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-cosmic-aurora animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5 text-cosmic-aurora" />
              )}
              <span className="text-cosmic-aurora font-medium">
                {isLoading ? 'Sending...' : 'Send Friend Request'}
              </span>
            </m.button>
          </div>
        </form>
      </m.div>
    </m.div>
  )
}