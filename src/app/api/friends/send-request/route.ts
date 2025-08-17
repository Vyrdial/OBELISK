import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { addresseeId } = await request.json()
    
    if (!addresseeId) {
      return NextResponse.json({ error: 'Addressee ID is required' }, { status: 400 })
    }

    // Create a fresh Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // For now, skip auth check - in production you'd want proper auth
    // TODO: Add proper server-side auth
    const userId = 'temp-user-id' // This should come from proper auth

    // Check if users are the same
    if (userId === addresseeId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Check if addressee exists
    const { data: addresseeProfile, error: addresseeError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', addresseeId)
      .single()

    if (addresseeError || !addresseeProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if friendship already exists
    const { data: existingFriendship, error: checkError } = await supabase
      .from('friend_requests')
      .select('id, status')
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${userId})`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing friendship:', checkError)
      return NextResponse.json({ error: 'Failed to check existing friendship' }, { status: 500 })
    }

    if (existingFriendship) {
      if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 })
      } else if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 })
      } else if (existingFriendship.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send friend request' }, { status: 400 })
      }
    }

    // Create friend request
    const { data: friendship, error: createError } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: userId,
        addressee_id: addresseeId,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating friendship:', createError)
      return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      friendship,
      message: 'Friend request sent successfully' 
    })

  } catch (error) {
    console.error('Error in send-request API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}