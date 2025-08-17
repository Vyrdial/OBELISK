'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createUserProfile, getUserProfile } from '@/lib/profileSystem'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function DebugProfileContent() {
  const { user } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateProfile = async () => {
    if (!user?.id) {
      setResult({ error: 'No user ID found' })
      return
    }

    setLoading(true)
    try {
      console.log('Attempting to create profile for user:', user.id)
      const profile = await createUserProfile(user.id)
      setResult({ success: true, profile })
    } catch (error) {
      console.error('Error creating profile:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFetchProfile = async () => {
    if (!user?.id) {
      setResult({ error: 'No user ID found' })
      return
    }

    setLoading(true)
    try {
      console.log('Attempting to fetch profile for user:', user.id)
      const profile = await getUserProfile(user.id)
      setResult({ success: true, profile })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFetchAllProfiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) {
        setResult({ error: error.message })
      } else {
        setResult({ success: true, allProfiles: data })
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Profile Debug Page</h1>
      
      <div className="mb-4">
        <strong>User ID:</strong> {user?.id || 'Not logged in'}
      </div>
      <div className="mb-4">
        <strong>User Email:</strong> {user?.email || 'Not logged in'}
      </div>

      <div className="space-x-4 mb-8">
        <button
          onClick={handleCreateProfile}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Profile'}
        </button>
        
        <button
          onClick={handleFetchProfile}
          disabled={loading}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch Profile'}
        </button>
        
        <button
          onClick={handleFetchAllProfiles}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch All Profiles'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-bold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function DebugProfile() {
  return (
    <ProtectedRoute>
      <DebugProfileContent />
    </ProtectedRoute>
  )
}