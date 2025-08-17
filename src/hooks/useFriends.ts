'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Friend {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at: string
  updated_at: string
  requester_profile_id?: number
  requester_name?: string
  requester_username?: string
  requester_avatar?: string
  requester_equipped_singularity?: string
  addressee_profile_id?: number
  addressee_name?: string
  addressee_username?: string
  addressee_avatar?: string
  addressee_equipped_singularity?: string
}

export interface FriendProfile {
  user_id: string
  profile_id: number
  username: string
  display_name: string
  equipped_singularity: string
  created_at: string
  friendshipStatus: 'none' | 'pending' | 'accepted' | 'declined' | 'blocked'
}

export function useFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [sentRequests, setSentRequests] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all friendships for the current user
  const fetchFriendships = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Separate into different categories
      const accepted = data?.filter(f => f.status === 'accepted') || []
      const pending = data?.filter(f => f.status === 'pending' && f.addressee_id === user.id) || []
      const sent = data?.filter(f => f.status === 'pending' && f.requester_id === user.id) || []

      setFriends(accepted)
      setPendingRequests(pending)
      setSentRequests(sent)

    } catch (err) {
      console.error('Error fetching friendships:', err)
      setError('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Send friend request
  const sendFriendRequest = async (addresseeId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresseeId })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send friend request')
      }

      // Refresh friendships
      await fetchFriendships()
      return true

    } catch (err) {
      console.error('Error sending friend request:', err)
      setError(err instanceof Error ? err.message : 'Failed to send friend request')
      return false
    }
  }

  // Send friend request by username
  const sendFriendRequestByUsername = async (username: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Clear any previous error
      setError(null)
      
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      console.log('Current user:', user.id)
      
      // First check if the user is trying to friend themselves by comparing usernames
      // Get current user's profile
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single()

      if (currentUserProfile && currentUserProfile.username.toLowerCase() === username.trim().toLowerCase()) {
        // You're already your own best friend! 
        return { success: false, error: "You're already your own best friend!" }
      }

      // Find the user by username using the api.profiles table
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .ilike('username', username.trim())
        .single()

      console.log('Target user search result:', { targetUser, userError })

      if (userError) {
        console.error('User search error:', userError)
        if (userError.code === 'PGRST116') {
          return { success: false, error: 'User not found' }
        } else {
          return { success: false, error: `Search error: ${userError.message}` }
        }
      }

      if (!targetUser) {
        return { success: false, error: 'User not found' }
      }

      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUser.user_id}),and(requester_id.eq.${targetUser.user_id},addressee_id.eq.${user.id})`)
        .single()

      if (existingFriendship) {
        if (existingFriendship.status === 'pending') {
          return { success: false, error: 'Friend request already pending' }
        } else if (existingFriendship.status === 'accepted') {
          return { success: false, error: 'Already friends with this user' }
        } else if (existingFriendship.status === 'blocked') {
          return { success: false, error: 'Cannot send friend request to this user' }
        }
      }

      // Create friend request
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUser.user_id,
          status: 'pending'
        })

      if (insertError) {
        console.error('Error creating friendship:', insertError)
        return { success: false, error: 'Failed to send friend request' }
      }

      // Refresh friendships
      await fetchFriendships()
      return { success: true }

    } catch (err) {
      console.error('Error sending friend request:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send friend request' }
    }
  }

  // Respond to friend request (accept/decline)
  const respondToRequest = async (friendshipId: string, action: 'accept' | 'decline'): Promise<boolean> => {
    try {
      console.log(`Responding to friendship ${friendshipId} with action: ${action}`)
      
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Get the friendship from the database
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', friendshipId)
        .single()

      console.log('Friendship lookup:', { friendship, fetchError })

      if (fetchError || !friendship) {
        throw new Error('Friend request not found')
      }

      // Check if user is the addressee (recipient)
      if (friendship.addressee_id !== user.id) {
        throw new Error('Unauthorized to respond to this request')
      }

      // Check if request is still pending
      if (friendship.status !== 'pending') {
        console.log(`Friend request already ${friendship.status}`)
        // If it's already in the desired state, just refresh and return success
        if ((action === 'accept' && friendship.status === 'accepted') || 
            (action === 'decline' && friendship.status === 'declined')) {
          await fetchFriendships()
          return true
        }
        // Only throw error if trying to change a finalized status
        throw new Error(`Friend request is already ${friendship.status}`)
      }

      const newStatus = action === 'accept' ? 'accepted' : 'declined'

      // Update friendship status
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: newStatus })
        .eq('id', friendshipId)

      if (updateError) {
        console.error('Error updating friendship:', updateError)
        throw new Error('Failed to respond to friend request')
      }

      // Refresh friendships
      await fetchFriendships()
      return true

    } catch (err) {
      console.error(`Error ${action}ing friend request:`, err)
      setError(err instanceof Error ? err.message : `Failed to ${action} friend request`)
      return false
    }
  }

  // Remove friend/cancel request
  const removeFriend = async (friendshipId: string): Promise<boolean> => {
    try {
      console.log(`Removing/canceling friendship ${friendshipId}`)
      
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Get the friendship to check permissions
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', friendshipId)
        .single()

      console.log('Friendship to remove:', { friendship, fetchError })

      if (fetchError || !friendship) {
        throw new Error('Friendship not found')
      }

      // Check if user is involved in this friendship
      if (friendship.requester_id !== user.id && friendship.addressee_id !== user.id) {
        throw new Error('Unauthorized to remove this friendship')
      }

      // Delete the friendship
      const { error: deleteError } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

      if (deleteError) {
        console.error('Error deleting friendship:', deleteError)
        throw new Error('Failed to remove friend')
      }

      // Refresh friendships
      await fetchFriendships()
      return true

    } catch (err) {
      console.error('Error removing friend:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove friend')
      return false
    }
  }

  // Search for users
  const searchUsers = async (query: string, limit = 10): Promise<FriendProfile[]> => {
    try {
      if (query.length < 2) return []

      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}&limit=${limit}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search users')
      }

      return result.users || []

    } catch (err) {
      console.error('Error searching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to search users')
      return []
    }
  }

  // Get friend count
  const getFriendCount = () => friends.length

  // Get pending requests count
  const getPendingRequestsCount = () => pendingRequests.length

  // Check if user is friend
  const isFriend = (userId: string) => {
    return friends.some(f => 
      (f.requester_id === userId || f.addressee_id === userId) && 
      f.status === 'accepted'
    )
  }

  // Get friendship status with a user
  const getFriendshipStatus = (userId: string): 'none' | 'pending' | 'accepted' | 'sent' => {
    // Check if they're friends
    const friend = friends.find(f => 
      (f.requester_id === userId || f.addressee_id === userId) && 
      f.status === 'accepted'
    )
    if (friend) return 'accepted'

    // Check if there's a pending request from them
    const pendingRequest = pendingRequests.find(f => f.requester_id === userId)
    if (pendingRequest) return 'pending'

    // Check if we sent them a request
    const sentRequest = sentRequests.find(f => f.addressee_id === userId)
    if (sentRequest) return 'sent'

    return 'none'
  }


  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return

    // Initial fetch
    fetchFriendships()

    // Subscribe to friendship changes
    const subscription = supabase
      .channel('friendships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'friendships',
          filter: `requester_id=eq.${user.id},addressee_id=eq.${user.id}`
        },
        () => {
          // Refresh friendships when changes occur
          fetchFriendships()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    error,
    sendFriendRequest,
    sendFriendRequestByUsername,
    respondToRequest,
    removeFriend,
    searchUsers,
    getFriendCount,
    getPendingRequestsCount,
    isFriend,
    getFriendshipStatus,
    refetch: fetchFriendships
  }
}