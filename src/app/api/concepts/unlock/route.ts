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

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase.rpc('unlock_concept', {
      p_concept_id: conceptId
    })

    if (error) {
      console.error('Error unlocking concept:', error)
      return NextResponse.json(
        { error: 'Failed to unlock concept' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in unlock concept route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase.rpc('get_unlocked_concepts')

    if (error) {
      console.error('Error fetching unlocked concepts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch unlocked concepts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ concepts: data || [] })
  } catch (error) {
    console.error('Error in get unlocked concepts route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}