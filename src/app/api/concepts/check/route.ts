import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { conceptId } = await req.json()

    if (!conceptId) {
      return NextResponse.json(
        { error: 'Concept ID is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase.rpc('is_concept_unlocked', {
      p_concept_id: conceptId
    })

    if (error) {
      console.error('Error checking concept:', error)
      return NextResponse.json(
        { error: 'Failed to check concept' },
        { status: 500 }
      )
    }

    return NextResponse.json({ unlocked: data || false })
  } catch (error) {
    console.error('Error in check concept route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}