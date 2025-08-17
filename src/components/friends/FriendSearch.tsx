'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, Check, Clock, X } from 'lucide-react'
import { FriendProfile, useFriends } from '@/hooks/useFriends'

interface FriendSearchProps {
  onClose?: () => void
}

export default function FriendSearch({ onClose }: FriendSearchProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sendingTo, setSendingTo] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout>()
  
  const { searchUsers, sendFriendRequest } = useFriends()

  // Auto-focus search input
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (query.length >= 2) {
      setIsSearching(true)
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await searchUsers(query, 10)
          setSearchResults(results)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query])

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId)
    try {
      const success = await sendFriendRequest(userId)
      if (success) {
        // Update the search results to reflect the new status
        setSearchResults(prev => 
          prev.map(user => 
            user.user_id === userId 
              ? { ...user, friendshipStatus: 'pending' }
              : user
          )
        )
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
    } finally {
      setSendingTo(null)
    }
  }

  const getSingularityPreview = (singularityId: string) => {
    const styles = {
      'classic-singularity': 'bg-gradient-to-br from-cosmic-starlight to-cosmic-aurora',
      'void-singularity': 'bg-gradient-to-br from-gray-800 to-black',
      'crystal-singularity': 'bg-gradient-to-br from-cyan-400 to-blue-500',
      'fire-singularity': 'bg-gradient-to-br from-red-500 to-orange-600',
      'nature-singularity': 'bg-gradient-to-br from-green-400 to-emerald-500'
    }
    return styles[singularityId as keyof typeof styles] || styles['classic-singularity']
  }

  const getStatusButton = (user: FriendProfile) => {
    const isLoading = sendingTo === user.user_id

    switch (user.friendshipStatus) {
      case 'accepted':
        return (
          <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Friends</span>
          </div>
        )
      
      case 'pending':
        return (
          <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">Pending</span>
          </div>
        )
      
      default:
        return (
          <m.button
            onClick={() => handleSendRequest(user.user_id)}
            disabled={isLoading}
            className={`px-3 py-1.5 bg-cosmic-aurora/20 border border-cosmic-aurora/30 hover:bg-cosmic-aurora/30 hover:border-cosmic-aurora/50 rounded-lg flex items-center gap-2 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            <UserPlus className="w-4 h-4 text-cosmic-aurora" />
            <span className="text-sm text-cosmic-aurora font-medium">
              {isLoading ? 'Sending...' : 'Add Friend'}
            </span>
          </m.button>
        )
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
        className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white cosmic-heading">Find Friends</h2>
            <m.button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4 text-white/70" />
            </m.button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by username or display name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cosmic-starlight/50 focus:bg-white/15 transition-all"
            />
            
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-cosmic-starlight/30 border-t-cosmic-starlight rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
        
        {/* Search Results */}
        <div className="p-6 overflow-y-auto max-h-96">
          <AnimatePresence mode="wait">
            {query.length < 2 ? (
              <m.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-white/60"
              >
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Start typing to search for friends...</p>
              </m.div>
            ) : searchResults.length === 0 && !isSearching ? (
              <m.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-white/60"
              >
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No users found matching "{query}"</p>
              </m.div>
            ) : (
              <m.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {searchResults.map((user, index) => (
                  <m.div
                    key={user.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all"
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full ${getSingularityPreview(user.equipped_singularity)} flex items-center justify-center border-2 border-white/20 flex-shrink-0`}>
                      <div className="w-6 h-6 rounded-full bg-white/90" />
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {user.display_name}
                      </h3>
                      <p className="text-sm text-white/60 truncate">
                        @{user.username}
                      </p>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {getStatusButton(user)}
                    </div>
                  </m.div>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </m.div>
  )
}