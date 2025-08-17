import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    // Create a fresh Supabase client with api schema
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: 'api'
        }
      }
    )

    // Search for users by username and display name (in api schema)
    const { data: users, error: searchError } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, equipped_singularity')
      .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(limit)

    if (searchError) {
      console.error('Error searching users:', searchError)
      console.error('Search query:', query)
      console.error('Error details:', JSON.stringify(searchError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to search users',
        details: searchError.message 
      }, { status: 500 })
    }

    // For now, return users without friendship status check
    // TODO: Add proper auth and friendship status checking
    const usersWithFriendshipStatus = users.map(searchUser => ({
      ...searchUser,
      friendshipStatus: 'none'
    }))

    return NextResponse.json({ 
      success: true, 
      users: usersWithFriendshipStatus 
    })

  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}