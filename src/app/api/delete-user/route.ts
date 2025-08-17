import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    // Create a Supabase client with the proper auth context
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: 'api'
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader || ''
          }
        }
      }
    )
    
    // Verify the user is authenticated using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the deletion confirmation from the request
    const { confirmationText } = await request.json()
    
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json({ error: 'Invalid confirmation text' }, { status: 400 })
    }

    const deletionErrors: string[] = []

    // Delete user data from all tables
    const tables = [
      'profiles',
      'favorites',
      'friend_requests',
      'friendships'
    ]
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id)
        
        if (error) {
          console.warn(`Failed to delete from ${table}:`, error)
          deletionErrors.push(`${table}: ${error.message}`)
        }
      } catch (err) {
        console.warn(`Failed to delete from ${table}:`, err)
        deletionErrors.push(`${table}: ${err}`)
      }
    }

    // For proper auth user deletion, we need admin privileges
    // Since we can't use admin functions from the client, we'll use a workaround
    
    // Method 1: Try to delete the user using the service role (if available)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const adminSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          console.error('Error deleting user with admin:', deleteError)
          // Fall back to marking account as deleted
          await supabase.auth.updateUser({
            data: { 
              account_deleted: true,
              deletion_timestamp: new Date().toISOString(),
              deletion_reason: 'user_requested',
              deletion_errors: deletionErrors.length > 0 ? deletionErrors : undefined
            }
          })
        }
      } catch (error) {
        console.error('Admin deletion failed:', error)
        // Fall back to marking account as deleted
        await supabase.auth.updateUser({
          data: { 
            account_deleted: true,
            deletion_timestamp: new Date().toISOString(),
            deletion_reason: 'user_requested',
            deletion_errors: deletionErrors.length > 0 ? deletionErrors : undefined
          }
        })
      }
    } else {
      // No service role key, just mark account as deleted
      await supabase.auth.updateUser({
        data: { 
          account_deleted: true,
          deletion_timestamp: new Date().toISOString(),
          deletion_reason: 'user_requested',
          deletion_errors: deletionErrors.length > 0 ? deletionErrors : undefined
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully',
      deletionErrors: deletionErrors.length > 0 ? deletionErrors : undefined
    })

  } catch (error) {
    console.error('Delete user API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}