import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { friendshipId, action } = await request.json()
    
    if (!friendshipId || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Friendship ID and valid action (accept/decline) are required' }, { status: 400 })
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

    // For now, skip auth and use a simple approach
    // TODO: Implement proper server-side auth later
    
    // Let's try to get the user from the session in a different way
    // For now, we'll trust the client and get user info from the request body
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    // Extract user ID from the authorization header or request
    // This is a temporary workaround - in production you'd want proper auth
    let userId: string
    try {
      // Try to decode the JWT token to get user ID
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.sub
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the friendship from the actual table
    console.log('Looking for friendship with ID:', friendshipId)
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single()

    console.log('Friendship lookup result:', { friendship, fetchError })

    if (fetchError || !friendship) {
      console.error('Friendship not found:', fetchError)
      return NextResponse.json({ 
        error: 'Friend request not found',
        debug: { friendshipId, fetchError: fetchError?.message }
      }, { status: 404 })
    }

    // Check if user is the addressee
    if (friendship.addressee_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized to respond to this request' }, { status: 403 })
    }

    // Check if request is still pending
    if (friendship.status !== 'pending') {
      return NextResponse.json({ error: 'Friend request is no longer pending' }, { status: 400 })
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined'

    // Update friendship status in the actual table
    const { data: updatedFriendship, error: updateError } = await supabase
      .from('friendships')
      .update({ status: newStatus })
      .eq('id', friendshipId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating friendship:', updateError)
      return NextResponse.json({ error: 'Failed to respond to friend request' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      friendship: updatedFriendship,
      message: `Friend request ${action}ed successfully` 
    })

  } catch (error) {
    console.error('Error in respond API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}