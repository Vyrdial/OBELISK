// Debug component to test favorites table
// Add this temporarily to any page to test the connection

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function DebugFavorites() {
  const { user } = useAuth()
  const [result, setResult] = useState<string>('')

  const testConnection = async () => {
    try {
      setResult('Testing connection...')
      
      // Test 1: Check if table exists
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'favorites')

      if (tablesError) {
        setResult(`Table check failed: ${JSON.stringify(tablesError, null, 2)}`)
        return
      }

      if (!tables || tables.length === 0) {
        setResult('❌ FAVORITES TABLE DOES NOT EXIST! Please run the SQL migration first.')
        return
      }

      setResult(`✅ Favorites table exists. User ID: ${user?.id}`)

      // Test 2: Try to fetch from empty table
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .limit(1)

      if (error) {
        setResult(prev => prev + `\n❌ Query failed: ${JSON.stringify(error, null, 2)}`)
        return
      }

      setResult(prev => prev + `\n✅ Query successful. Records found: ${data?.length || 0}`)

    } catch (error) {
      setResult(`❌ Unexpected error: ${JSON.stringify(error, null, 2)}`)
    }
  }

  return (
    <div className="fixed bottom-20 left-6 glass-morphism rounded-lg p-4 border border-white/20 z-50 max-w-md">
      <h3 className="text-white font-bold mb-2">Debug Favorites</h3>
      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-3 py-1 rounded mb-2"
      >
        Test Connection
      </button>
      <pre className="text-xs text-white/80 whitespace-pre-wrap max-h-40 overflow-y-auto">
        {result}
      </pre>
    </div>
  )
}