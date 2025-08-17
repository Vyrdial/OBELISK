'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, Crown, Sparkles, Bug, RefreshCw, Settings, User, Database, BookOpen, RotateCcw } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { profile, refreshProfile } = useProfile()
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [stardust, setStardust] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [customStardust, setCustomStardust] = useState('')
  const [targetUsername, setTargetUsername] = useState('')
  const [lessonResetUsername, setLessonResetUsername] = useState('')
  const [lessonStats, setLessonStats] = useState<any>(null)

  useEffect(() => {
    if (profile) {
      setIsPremium(profile.is_premium || false)
      setStardust(profile.stardust || 0)
    }
  }, [profile])

  // Listen for "/" key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  const togglePremium = async () => {
    if (!user?.id) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: !isPremium })
        .eq('user_id', user.id)
      
      if (!error) {
        setIsPremium(!isPremium)
        await refreshProfile()
      } else {
        console.error('Supabase error:', error)
      }
    } catch (error) {
      console.error('Error updating premium status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const addStardust = async (amount: number, username?: string) => {
    setIsUpdating(true)
    try {
      // If username provided, find that user
      let targetUserId = user?.id
      if (username) {
        const { data: targetProfile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, stardust')
          .eq('username', username)
          .single()
        
        if (profileError || !targetProfile) {
          alert(`User "${username}" not found`)
          return
        }
        targetUserId = targetProfile.user_id
      }
      
      if (!targetUserId) return
      
      // Get current stardust for target user
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('stardust')
        .eq('user_id', targetUserId)
        .single()
      
      const currentStardust = currentProfile?.stardust || 0
      const newAmount = Math.max(0, currentStardust + amount)
      
      const { error } = await supabase
        .from('profiles')
        .update({ stardust: newAmount })
        .eq('user_id', targetUserId)
      
      if (!error) {
        if (targetUserId === user?.id) {
          setStardust(newAmount)
          await refreshProfile()
        }
        alert(`Successfully ${amount >= 0 ? 'added' : 'removed'} ${Math.abs(amount)} stardust ${username ? `to/from ${username}` : ''}`)
      } else {
        console.error('Supabase error:', error)
        alert('Failed to update stardust')
      }
    } catch (error) {
      console.error('Error updating stardust:', error)
      alert('Error updating stardust')
    } finally {
      setIsUpdating(false)
    }
  }

  const resetNameChanges = async () => {
    if (!user?.id) return
    
    setIsUpdating(true)
    try {
      // Delete all name change records for this user
      await supabase
        .from('display_name_changes')
        .delete()
        .eq('user_id', user.id)
      
      alert('Name change limit reset!')
      await refreshProfile()
    } catch (error) {
      console.error('Error resetting name changes:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const clearLocalStorage = () => {
    localStorage.clear()
    alert('Local storage cleared!')
  }

  const refreshProfileData = async () => {
    setIsUpdating(true)
    try {
      await refreshProfile()
      alert('Profile refreshed!')
    } catch (error) {
      console.error('Error refreshing profile:', error)
      alert('Failed to refresh profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const getLessonStats = async (username?: string) => {
    try {
      console.log('Getting lesson stats for:', username || 'current user')
      
      // Call with proper parameters based on whether username is provided
      const params = username ? { p_username: username } : {}
      const { data, error } = await supabase
        .rpc('get_lesson_stats', params)
      
      console.log('Stats response:', { data, error })
      
      if (error) {
        console.error('Error getting lesson stats:', error)
        
        if (error.message?.includes('function') && error.message?.includes('does not exist')) {
          alert('Lesson completion system not set up. Please run the FIX_LESSON_COMPLETIONS.sql script in Supabase.')
        } else {
          alert(`Failed to get lesson stats: ${error.message}`)
        }
        return
      }
      
      // Handle the response - it might be wrapped in an array
      const result = Array.isArray(data) ? data[0] : data
      
      if (!result?.success) {
        alert(result?.error || 'Failed to get stats')
        return
      }
      
      setLessonStats(result)
    } catch (error) {
      console.error('Error:', error)
      alert('Error getting lesson stats')
    }
  }

  const resetLessons = async (username?: string) => {
    const confirmMsg = username 
      ? `Are you sure you want to reset all lesson completions for user "${username}"? This will also remove any stardust they earned from lessons.`
      : 'Are you sure you want to reset all your lesson completions? This will also remove any stardust you earned from lessons.'
    
    if (!confirm(confirmMsg)) return
    
    setIsUpdating(true)
    try {
      console.log('Resetting lessons for:', username || 'current user')
      
      // Call the RPC with proper parameters
      const { data, error } = await supabase
        .rpc('reset_lesson_completions', username ? { p_username: username } : {})
      
      console.log('Reset response:', { data, error })
      
      if (error) {
        console.error('Error resetting lessons:', error)
        
        // Check if it's a function not found error
        if (error.message?.includes('function') && error.message?.includes('does not exist')) {
          alert('Lesson completion system not set up. Please run the FIX_LESSON_COMPLETIONS.sql script in Supabase.')
        } else {
          alert(`Failed to reset lessons: ${error.message}`)
        }
        return
      }
      
      // Handle the response - it might be wrapped in an array
      const result = Array.isArray(data) ? data[0] : data
      
      if (!result?.success) {
        alert(result?.error || 'Failed to reset lessons')
        return
      }
      
      alert(`Successfully reset ${result.lessons_reset} lessons for ${result.username}. Removed ${result.stardust_removed} stardust.`)
      
      // Clear stats
      setLessonStats(null)
      
      // Refresh profile if it was the current user
      if (!username || username === profile?.username) {
        await refreshProfile()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error resetting lessons')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Backdrop */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Debug Panel */}
        <m.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[450px] max-h-[80vh] overflow-y-auto glass-morphism border border-cyan-500/30 rounded-2xl shadow-2xl pointer-events-auto"
        >
          {/* Header */}
          <div className="bg-cyan-900/50 border-b border-cyan-500/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bug className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Developer Tools</h2>
              <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">Press / to open</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* User Info Section */}
            <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">User Information</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">User ID:</span>
                  <span className="text-cyan-400 font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Username:</span>
                  <span className="text-white">{profile?.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Premium:</span>
                  <span className={isPremium ? 'text-yellow-400' : 'text-gray-400'}>
                    {isPremium ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Stardust:</span>
                  <span className="text-yellow-300 font-mono">{stardust.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Premium Toggle */}
            <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Premium Status</span>
                </div>
                <button
                  onClick={togglePremium}
                  disabled={isUpdating}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPremium ? 'bg-yellow-500' : 'bg-gray-600'
                  } ${isUpdating ? 'opacity-50' : ''}`}
                >
                  <m.div
                    animate={{ x: isPremium ? 24 : 0 }}
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
              <p className="text-xs text-white/50">
                Toggle premium features for testing
              </p>
            </div>
            
            {/* Stardust Controls */}
            <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">Stardust Management</span>
              </div>
              
              {/* Target user input */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Target username (leave empty for self)"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50"
                />
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={customStardust}
                    onChange={(e) => setCustomStardust(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={() => {
                      const amount = parseInt(customStardust)
                      if (!isNaN(amount)) {
                        addStardust(amount, targetUsername || undefined)
                        setCustomStardust('')
                      }
                    }}
                    disabled={isUpdating || !customStardust}
                    className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                
                {/* Quick stardust buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => addStardust(100)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-green-400 text-xs transition-colors disabled:opacity-50"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => addStardust(1000)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-green-400 text-xs transition-colors disabled:opacity-50"
                  >
                    +1K
                  </button>
                  <button
                    onClick={() => addStardust(10000)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-400 text-xs transition-colors disabled:opacity-50"
                  >
                    +10K
                  </button>
                  <button
                    onClick={() => addStardust(-stardust)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-red-400 text-xs transition-colors disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            
            {/* Lesson Completions Management */}
            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Lesson Completions</span>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Username (leave empty for self)"
                  value={lessonResetUsername}
                  onChange={(e) => setLessonResetUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => getLessonStats(lessonResetUsername || undefined)}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded text-purple-400 text-sm transition-colors disabled:opacity-50"
                  >
                    <Database className="w-3 h-3" />
                    View Stats
                  </button>
                  
                  <button
                    onClick={() => resetLessons(lessonResetUsername || undefined)}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Lessons
                  </button>
                </div>
                
                {/* Show lesson stats if available */}
                {lessonStats && (
                  <div className="mt-3 p-3 bg-black/40 rounded border border-purple-500/10">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/50">User:</span>
                        <span className="text-purple-400">{lessonStats.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Lessons Completed:</span>
                        <span className="text-white">{lessonStats.total_lessons_completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Stardust Earned:</span>
                        <span className="text-yellow-400">{lessonStats.total_stardust_earned}</span>
                      </div>
                      {lessonStats.lessons && lessonStats.lessons.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-purple-500/20">
                          <div className="text-white/50 mb-1">Completed Lessons:</div>
                          <div className="space-y-0.5 max-h-20 overflow-y-auto">
                            {lessonStats.lessons.map((lesson: any, idx: number) => (
                              <div key={idx} className="text-xs text-purple-300">
                                • {lesson.lesson_id} (+{lesson.stardust_earned}⭐)
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Developer Actions */}
            <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">Developer Actions</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetNameChanges}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-400 text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                  Reset Names
                </button>
                
                <button
                  onClick={refreshProfileData}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors disabled:opacity-50"
                >
                  <Database className="w-3 h-3" />
                  Refresh Profile
                </button>
                
                <button
                  onClick={clearLocalStorage}
                  className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded text-orange-400 text-sm transition-colors"
                >
                  Clear Storage
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded text-purple-400 text-sm transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
            
            {/* Environment Info */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-500/20">
              <div className="text-white/60 text-xs mb-2">Environment</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Route:</span>
                  <span className="text-white font-mono">{typeof window !== 'undefined' ? window.location.pathname : '/'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Mode:</span>
                  <span className="text-green-400">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Build:</span>
                  <span className="text-cyan-400">Next.js</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-black/50 border-t border-white/10 px-4 py-3">
            <p className="text-xs text-white/40 text-center">
              Developer Tools • Press <kbd className="bg-white/10 px-1 rounded">ESC</kbd> to close
            </p>
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  )
}