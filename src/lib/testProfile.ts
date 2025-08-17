import { supabase } from './supabase'
import { generateCosmicProfile } from './profileSystem'

// Test function to create a profile (for development/testing)
export async function createTestProfile() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('No authenticated user found:', userError)
      return null
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing profile:', checkError)
      return null
    }

    if (existingProfile) {
      console.log('Profile already exists:', existingProfile)
      return existingProfile
    }

    // Generate new cosmic profile
    const profileData = generateCosmicProfile()
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user.id,
          ...profileData,
          xp: 0,
          stardust: 100,
          evolution_stage: 'Cosmic Grain',
          unlocked_cosmetics: [],
          achievements: ['First Steps'],
        }
      ])
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      return null
    }

    console.log('Profile created successfully:', newProfile)
    return newProfile
  } catch (error) {
    console.error('Unexpected error creating test profile:', error)
    return null
  }
}

// Function to regenerate cosmic identity for current user
export async function regenerateCurrentUserIdentity() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('No authenticated user found:', userError)
      return null
    }

    const newIdentity = generateCosmicProfile()
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(newIdentity)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return null
    }

    console.log('Identity regenerated:', updatedProfile)
    return updatedProfile
  } catch (error) {
    console.error('Unexpected error regenerating identity:', error)
    return null
  }
}

// Function to view current user's profile
export async function getCurrentUserProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('No authenticated user found:', userError)
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return null
    }

    console.log('Current user profile:', profile)
    return profile
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return null
  }
}