import { supabase } from './supabase'
import { profileCache } from './profileCache'

// Cosmic-themed adjectives and nouns for profile generation
const COSMIC_ADJECTIVES = [
  'Stellar', 'Nebular', 'Galactic', 'Cosmic', 'Astral', 'Celestial', 'Ethereal', 'Luminous',
  'Radiant', 'Quantum', 'Spectral', 'Orbital', 'Solar', 'Lunar', 'Void', 'Infinite',
  'Prismatic', 'Crystalline', 'Aurora', 'Starlit', 'Comet', 'Nova', 'Supernova', 'Magnetic',
  'Gravitational', 'Temporal', 'Dimensional', 'Fractal', 'Harmonic', 'Resonant'
]

const COSMIC_NOUNS = [
  'Wanderer', 'Explorer', 'Seeker', 'Scholar', 'Sage', 'Navigator', 'Pioneer', 'Voyager',
  'Guardian', 'Keeper', 'Weaver', 'Dreamer', 'Visionary', 'Architect', 'Artificer', 'Catalyst',
  'Singularity', 'Entity', 'Being', 'Consciousness', 'Mind', 'Spirit', 'Essence', 'Force',
  'Nexus', 'Vortex', 'Prism', 'Echo', 'Resonance', 'Matrix', 'Cipher', 'Codex'
]

const COSMIC_TITLES = [
  'of the Void', 'of Stardust', 'of the Cosmos', 'of Infinity', 'of the Nebula', 'of Light',
  'of Shadows', 'of the Aurora', 'of the Galaxy', 'of Time', 'of Space', 'of Reality',
  'of Dreams', 'of Knowledge', 'of Wisdom', 'of Truth', 'of the Unknown', 'of Mysteries',
  'of the Eternal', 'of the Infinite', 'of the Quantum Realm', 'of the Multiverse'
]

export interface UserProfile {
  id: string
  user_id: string
  profile_id: number
  username: string
  display_name: string
  stardust: number
  evolution_stage: string
  unlocked_cosmetics: string[]
  achievements: string[]
  unlocked_modules: string[]
  equipped_singularity: string
  equipped_effects: string[]
  equipped_aura: string | null
  equipped_title: string | null
  equipped_crown: string | null
  equipped_face: string | null
  is_premium: boolean
  created_at: string
  updated_at: string
}

export async function getProfileById(profileId: number): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_profile_by_id', { p_profile_id: profileId })

    if (error) {
      console.error('Error fetching profile by ID:', error)
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    const profileData = data[0]
    return {
      id: profileData.user_id,
      user_id: profileData.user_id,
      profile_id: profileData.profile_id,
      username: profileData.username,
      display_name: profileData.display_name,
      stardust: profileData.stardust || 0,
      evolution_stage: 'nebula',
      unlocked_cosmetics: [],
      achievements: [],
      unlocked_modules: profileData.unlocked_modules || [],
      equipped_singularity: profileData.equipped_singularity || 'classic-singularity',
      equipped_effects: [],
      equipped_aura: profileData.equipped_aura || 'cosmic-aurora',
      equipped_title: null,
      equipped_crown: profileData.equipped_crown || null,
      equipped_face: profileData.equipped_face || null,
      is_premium: Boolean(profileData.is_premium),
      created_at: profileData.created_at,
      updated_at: profileData.updated_at
    }
  } catch (error) {
    console.error('Error in getProfileById:', error)
    return null
  }
}

export async function getCurrentUserProfileId(): Promise<number | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .rpc('get_profile_id_from_user_id', { p_user_id: user.id })

    if (error) {
      console.error('Error fetching profile ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getCurrentUserProfileId:', error)
    return null
  }
}

export function generateCosmicProfile(): {
  username: string
  display_name: string
} {
  const adjective = COSMIC_ADJECTIVES[Math.floor(Math.random() * COSMIC_ADJECTIVES.length)]
  const noun = COSMIC_NOUNS[Math.floor(Math.random() * COSMIC_NOUNS.length)]
  const title = COSMIC_TITLES[Math.floor(Math.random() * COSMIC_TITLES.length)]
  
  // Generate a unique username with numbers
  const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  const username = `${adjective.toLowerCase()}_${noun.toLowerCase()}_${randomSuffix}`
  
  const display_name = `${adjective} ${noun}`
  
  return {
    username,
    display_name
  }
}

export async function createUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profile = generateCosmicProfile()
    console.log('Generated profile data:', profile)
    
    // Use the RPC function to create profile with automatic ID assignment
    console.log('Calling create_profile_with_auto_id RPC...')
    const { data, error } = await supabase
      .rpc('create_profile_with_auto_id', {
        p_user_id: userId,
        p_username: profile.username,
        p_display_name: profile.display_name
      })

    if (error) {
      console.error('RPC Error:', error)
      console.log('Falling back to direct insert...')
      
      // Fallback to direct insert if RPC doesn't exist yet
      const insertData = {
        user_id: userId,
        username: profile.username,
        display_name: profile.display_name,
        stardust: 100,
        evolution_stage: 'Sand',
        unlocked_cosmetics: ['classic-singularity'],
        achievements: ['First Steps'],
        equipped_singularity: 'classic-singularity',
        is_premium: false
      }
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .insert([insertData])
        .select()
        .single()
      
      if (fallbackError) {
        console.error('Fallback insert error:', fallbackError)
        return null
      }
      
      console.log('Fallback insert successful:', fallbackData)
      return fallbackData
    }

    console.log('RPC successful, created profile:', data)
    return data
  } catch (error) {
    console.error('Exception in createUserProfile:', error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Check cache first
    const cached = profileCache.get(userId)
    if (cached) {
      // If there's an ongoing request, wait for it
      if (cached.promise) {
        return await cached.promise
      }
      return cached.profile
    }

    // Create promise for deduplication
    const promise = (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error.message)
        // Try to create profile if it doesn't exist
        const newProfile = await createUserProfile(userId)
        profileCache.set(userId, newProfile)
        return newProfile
      }

      profileCache.set(userId, data)
      return data
    })()

    // Store promise for deduplication
    profileCache.setPromise(userId, promise)
    
    return await promise
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    // Invalidate cache after update
    profileCache.invalidate(userId)
    return data
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return null
  }
}

export async function regenerateCosmicIdentity(userId: string): Promise<UserProfile | null> {
  const newProfile = generateCosmicProfile()
  return updateUserProfile(userId, newProfile)
}

export async function addStardustToProfile(userId: string, amount: number): Promise<UserProfile | null> {
  try {
    // Get current profile
    const currentProfile = await getUserProfile(userId)
    if (!currentProfile) return null

    const newStardust = currentProfile.stardust + amount
    return updateUserProfile(userId, { stardust: newStardust })
  } catch (error) {
    console.error('Error adding stardust:', error)
    return null
  }
}

