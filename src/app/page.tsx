import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function RootPage() {
  // Check if user is authenticated on the server side
  const supabase = await createSupabaseServerClient()
  
  try {
    // Get the user session from Supabase
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!error && user) {
      // User is authenticated, redirect directly to home
      redirect('/home')
    }
  } catch (error) {
    // If there's an error checking auth, continue to welcome page
    console.error('Auth check error:', error)
  }
  
  // If not authenticated or error, redirect to welcome page
  redirect('/welcome')
}