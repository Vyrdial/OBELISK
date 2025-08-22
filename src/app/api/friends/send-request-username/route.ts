import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    
    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
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

    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    // Set the auth token for the supabase client
    supabase.auth.setAuth(authHeader.replace('Bearer ', ''))

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Find the user by username in api schema
    const { data: targetUser, error: userError } = await supabase
      .schema('api')
      .from('profiles')
      .select('user_id')
      .eq('username', username.trim())
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if trying to friend themselves
    if (targetUser.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Check if friendship already exists
    const { data: existingFriendship, error: checkError } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUser.user_id}),and(requester_id.eq.${targetUser.user_id},addressee_id.eq.${user.id})`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing friendship:', checkError)
      return NextResponse.json({ error: 'Failed to check existing friendship' }, { status: 500 })
    }

    if (existingFriendship) {
      if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 })
      } else if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends with this user' }, { status: 400 })
      } else if (existingFriendship.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send friend request to this user' }, { status: 400 })
      }
    }

    // Create friend request
    const { data: friendship, error: insertError } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: targetUser.user_id,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating friendship:', insertError)
      return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      friendship,
      message: 'Friend request sent successfully' 
    })

  } catch (error) {
    console.error('Error in send-request-username API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}