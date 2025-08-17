'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, Clock, Check, X, UserX, MoreVertical, Send, User } from 'lucide-react'
import { Friend, useFriends } from '@/hooks/useFriends'
import { useAuth } from '@/contexts/AuthContext'

type TabType = 'all' | 'pending' | 'sent'

export default function FriendsList() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)
  const { user } = useAuth()
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    respondToRequest, 
    removeFriend,
    loading
  } = useFriends()

  const getSingularityStyle = (singularityId: string) => {
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

  const getFriendInfo = (friend: Friend) => {
    const isRequester = friend.requester_id === user?.id
    return {
      profileId: isRequester ? friend.addressee_profile_id : friend.requester_profile_id,
      name: isRequester ? friend.addressee_name : friend.requester_name,
      username: isRequester ? friend.addressee_username : friend.requester_username,
      avatar: isRequester ? friend.addressee_avatar : friend.requester_avatar,
      equippedSingularity: isRequester ? friend.addressee_equipped_singularity : friend.requester_equipped_singularity,
      userId: isRequester ? friend.addressee_id : friend.requester_id
    }
  }

  const tabs = [
    { id: 'all' as const, label: 'All Friends', count: friends.length, icon: Users },
    { id: 'pending' as const, label: 'Pending', count: pendingRequests.length, icon: Clock },
    { id: 'sent' as const, label: 'Sent', count: sentRequests.length, icon: Send }
  ]

  const renderFriendItem = (friend: Friend, type: 'friend' | 'pending' | 'sent') => {
    const info = getFriendInfo(friend)
    const isMenuOpen = menuOpenFor === friend.id

    return (
      <m.div
        key={friend.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all"
      >
        {/* Avatar */}
        <div 
          className={`w-12 h-12 rounded-full ${getSingularityStyle(info.equippedSingularity || 'classic-singularity')} flex items-center justify-center border-2 border-white/20 flex-shrink-0 cursor-pointer`}
          onClick={() => info.profileId && router.push(`/profile/${info.profileId}`)}
        >
          <div className="w-6 h-6 rounded-full bg-white/90" />
        </div>
        
        {/* Info */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => info.profileId && router.push(`/profile/${info.profileId}`)}
        >
          <h3 className="font-semibold text-white truncate hover:text-purple-300 transition-colors">
            {info.name || 'Unknown User'}
          </h3>
          <p className="text-sm text-white/60 truncate">
            @{info.username || 'unknown'} • #{info.profileId || '???'}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {type === 'pending' && (
            <>
              <m.button
                onClick={() => respondToRequest(friend.id, 'accept')}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check className="w-4 h-4 text-green-400" />
              </m.button>
              <m.button
                onClick={() => respondToRequest(friend.id, 'decline')}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4 text-red-400" />
              </m.button>
            </>
          )}
          
          {type === 'sent' && (
            <m.button
              onClick={() => removeFriend(friend.id)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg flex items-center gap-2 transition-colors text-sm text-white/70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </m.button>
          )}
          
          {type === 'friend' && (
            <div className="relative">
              <m.button
                onClick={() => setMenuOpenFor(isMenuOpen ? null : friend.id)}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreVertical className="w-4 h-4 text-white/70" />
              </m.button>
              
              <AnimatePresence>
                {isMenuOpen && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden z-10"
                  >
                    <button
                      onClick={() => {
                        if (info.profileId) {
                          router.push(`/profile/${info.profileId}`)
                        }
                        setMenuOpenFor(null)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        removeFriend(friend.id)
                        setMenuOpenFor(null)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                    >
                      <UserX className="w-4 h-4" />
                      Remove Friend
                    </button>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </m.div>
    )
  }

  const getDisplayItems = () => {
    switch (activeTab) {
      case 'pending':
        return pendingRequests
      case 'sent':
        return sentRequests
      default:
        return friends
    }
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'pending':
        return "No pending friend requests"
      case 'sent':
        return "No sent friend requests"
      default:
        return "No friends yet. Add some friends to get started!"
    }
  }

  const items = getDisplayItems()

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
        {tabs.map((tab) => (
          <m.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white/80 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/60'
              }`}>
                {tab.count}
              </span>
            )}
          </m.button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <m.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-8 h-8 border-2 border-cosmic-starlight/30 border-t-cosmic-starlight rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading friends...</p>
            </m.div>
          ) : items.length === 0 ? (
            <m.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">{getEmptyMessage()}</p>
            </m.div>
          ) : (
            <m.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {items.map((item) => renderFriendItem(
                item, 
                activeTab === 'pending' ? 'pending' : 
                activeTab === 'sent' ? 'sent' : 
                'friend'
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}