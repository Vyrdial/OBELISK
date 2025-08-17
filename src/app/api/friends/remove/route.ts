import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  try {
    const { friendshipId } = await request.json()
    
    if (!friendshipId) {
      return NextResponse.json({ error: 'Friendship ID is required' }, { status: 400 })
    }

    // Create a fresh Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // For now, skip auth check - in production you'd want proper auth
    // TODO: Add proper server-side auth
    const userId = 'temp-user-id' // This should come from proper auth

    // Get the friendship
    const { data: friendship, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', friendshipId)
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    // Check if user is involved in this friendship
    if (friendship.requester_id !== userId && friendship.addressee_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized to remove this friendship' }, { status: 403 })
    }

    // Delete the friendship
    const { error: deleteError } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', friendshipId)

    if (deleteError) {
      console.error('Error deleting friendship:', deleteError)
      return NextResponse.json({ error: 'Failed to remove friendship' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Friendship removed successfully' 
    })

  } catch (error) {
    console.error('Error in remove API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}