'use client'

import { m } from 'framer-motion'
import { UserPlus, UserMinus, Check, X, Clock, MessageCircle } from 'lucide-react'
import { Friend } from '@/hooks/useFriends'
import { useAuth } from '@/contexts/AuthContext'

interface FriendCardProps {
  friend: Friend
  onAccept?: () => void
  onDecline?: () => void
  onRemove?: () => void
  onMessage?: () => void
  type: 'friend' | 'pending' | 'sent'
  loading?: boolean
}

export default function FriendCard({ 
  friend, 
  onAccept, 
  onDecline, 
  onRemove, 
  onMessage, 
  type,
  loading = false 
}: FriendCardProps) {
  const { user } = useAuth()
  
  // Determine which user info to show (the other person, not current user)
  const isRequester = friend.requester_id === user?.id
  const otherUser = {
    id: isRequester ? friend.addressee_id : friend.requester_id,
    profileId: isRequester ? friend.addressee_profile_id : friend.requester_profile_id,
    name: isRequester ? friend.addressee_name : friend.requester_name,
    username: isRequester ? friend.addressee_username : friend.requester_username,
    equippedSingularity: isRequester ? friend.addressee_equipped_singularity : friend.requester_equipped_singularity
  }

  const getSingularityPreview = (singularityId: string) => {
    const styles = {
      'classic-singularity': 'bg-white',
      'cosmic-glow': 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse shadow-lg shadow-purple-400/60',
      'stellar-core': 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/80',
      'void-essence': 'bg-purple-900 border-2 border-purple-400 animate-pulse shadow-lg shadow-purple-400/60',
      'golden-majesty': 'bg-yellow-500 border-2 border-yellow-300 shadow-lg shadow-yellow-500/60',
      'crystal-essence': 'bg-cyan-400 border-2 border-cyan-200 animate-pulse shadow-lg shadow-cyan-400/60',
      'plasma-storm': 'bg-pink-500 border-2 border-pink-300 shadow-lg shadow-pink-500/60',
      'flame': 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 shadow-lg shadow-orange-400/70',
      'lightning': 'bg-gradient-to-r from-blue-300 to-white border-2 border-blue-200 shadow-lg shadow-blue-300/80',
      'frost': 'bg-gradient-to-br from-blue-200 via-cyan-300 to-white shadow-lg shadow-cyan-300/60',
      'grass': 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-lg shadow-green-400/60',
      'wind': 'bg-gradient-to-br from-gray-200 via-white to-gray-100 shadow-lg shadow-gray-300/50',
      'sand': 'bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200 shadow-lg shadow-amber-300/50',
      'stone': 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 border border-gray-300 shadow-lg shadow-gray-500/60',
      'leaf': 'bg-gradient-to-br from-green-300 via-emerald-400 to-green-500 shadow-lg shadow-emerald-400/60',
      'quantum-nexus': 'bg-gradient-to-br from-cyan-200 via-blue-400 to-purple-600 border-2 border-cyan-300 shadow-2xl shadow-cyan-400/80 animate-pulse',
      'temporal-vortex': 'bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 shadow-2xl shadow-purple-500/70 animate-pulse',
      'cosmic-forge': 'bg-gradient-to-br from-orange-400 via-red-500 to-yellow-300 shadow-2xl shadow-orange-500/80 animate-pulse',
      'shadow-monarch': 'bg-gradient-to-br from-gray-900 via-black to-purple-900 border-2 border-purple-800 shadow-2xl shadow-purple-900/90',
      'prism-matrix': 'bg-gradient-to-br from-white via-cyan-200 to-pink-200 border border-cyan-300 shadow-lg shadow-cyan-300/60',
      'nebula-heart': 'bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 shadow-lg shadow-purple-400/60',
      'plasma-core': 'bg-pink-500 border-2 border-pink-300 shadow-lg shadow-pink-500/60'
    }
    return styles[singularityId as keyof typeof styles] || styles['classic-singularity']
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 ${
        loading ? 'opacity-50 pointer-events-none' : ''
      }`}
      whileHover={{ y: -2 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-starlight/5 via-transparent to-cosmic-aurora/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${getSingularityPreview(otherUser.equippedSingularity || 'classic-singularity')} flex items-center justify-center border-2 border-white/20`}>
            <div className="w-6 h-6 rounded-full bg-white/90" />
          </div>
          
          {/* Status indicator */}
          {type === 'pending' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <Clock className="w-2 h-2 text-white" />
            </div>
          )}
          
          {type === 'sent' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <UserPlus className="w-2 h-2 text-white" />
            </div>
          )}
          
          {type === 'friend' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">
              {otherUser.name || 'Unknown User'}
            </h3>
            {type === 'friend' && (
              <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-xs text-green-400 font-medium">Friend</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>@{otherUser.username || 'unknown'}</span>
            <span>•</span>
            <span>{formatTimeAgo(friend.created_at)}</span>
          </div>
          
          {type === 'pending' && (
            <div className="mt-1 text-xs text-yellow-400">
              Wants to be friends
            </div>
          )}
          
          {type === 'sent' && (
            <div className="mt-1 text-xs text-blue-400">
              Friend request sent
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {type === 'pending' && (
            <>
              <m.button
                onClick={onAccept}
                disabled={loading}
                className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-lg flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check className="w-4 h-4 text-green-400" />
              </m.button>
              
              <m.button
                onClick={onDecline}
                disabled={loading}
                className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4 text-red-400" />
              </m.button>
            </>
          )}
          
          {type === 'friend' && (
            <>
              <m.button
                onClick={onMessage}
                disabled={loading}
                className="w-8 h-8 bg-cosmic-aurora/20 hover:bg-cosmic-aurora/30 border border-cosmic-aurora/30 hover:border-cosmic-aurora/50 rounded-lg flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-4 h-4 text-cosmic-aurora" />
              </m.button>
              
              <m.button
                onClick={onRemove}
                disabled={loading}
                className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserMinus className="w-4 h-4 text-red-400" />
              </m.button>
            </>
          )}
          
          {type === 'sent' && (
            <m.button
              onClick={onRemove}
              disabled={loading}
              className="w-8 h-8 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 hover:border-gray-500/50 rounded-lg flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </m.button>
          )}
        </div>
      </div>
    </m.div>
  )
}