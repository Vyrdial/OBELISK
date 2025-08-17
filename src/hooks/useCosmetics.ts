'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Global state to share cosmetics across all hook instances
let globalSyncedUserId: string | null = null
let globalLocalEquipped: {
  singularity?: string
  effects?: string[]
  title?: string
  aura?: string
  crown?: string
  face?: string
  forceUpdate?: number
} = {
  singularity: 'classic-singularity',
  effects: ['cosmic-aurora'],
  title: undefined,
  aura: 'cosmic-aurora',
  crown: undefined,
  face: undefined,
  forceUpdate: Date.now()
}

// Load from localStorage on module load
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('equippedCosmetics')
  if (saved) {
    try {
      globalLocalEquipped = { ...JSON.parse(saved), forceUpdate: Date.now() }
    } catch (e) {
      console.error('Failed to parse saved cosmetics:', e)
    }
  }
}

export interface CosmeticItem {
  id: string
  name: string
  description: string
  type: 'singularity' | 'effect' | 'title' | 'aura' | 'auras' | 'trail' | 'crown' | 'face'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  price: number
  owned: boolean
  equipped: boolean
  locked: boolean
  unlockCondition?: string
}

export function useCosmetics() {
  const { profile, refreshProfile } = useProfile()
  const { user } = useAuth()
  const [ownedCosmetics, setOwnedCosmetics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // Local state for equipped items (synced with global state)
  const [localEquipped, setLocalEquipped] = useState(globalLocalEquipped)
  
  // Sync local state with global state when it changes
  useEffect(() => {
    setLocalEquipped(globalLocalEquipped)
  }, [globalLocalEquipped.forceUpdate])

  // Fetch owned cosmetics from database
  useEffect(() => {
    if (profile && user?.id) {
      setOwnedCosmetics(profile.unlocked_cosmetics || ['none', 'cosmic-aurora', 'classic-singularity'])
      setLoading(false)
      
      // Only sync from profile on initial load for this specific user (use global state)
      if (globalSyncedUserId !== user.id && profile.equipped_singularity !== undefined) {
        console.log('[useCosmetics] Syncing from profile (initial load for user):', {
          userId: user.id,
          singularity: profile.equipped_singularity,
          aura: profile.equipped_aura
        })
        const newEquipped = {
          singularity: profile.equipped_singularity || 'classic-singularity',
          effects: profile.equipped_effects || ['cosmic-aurora'],
          title: profile.equipped_title || undefined,
          aura: profile.equipped_aura || 'cosmic-aurora',
          crown: profile.equipped_crown || undefined,
          face: profile.equipped_face || undefined,
          forceUpdate: Date.now()
        }
        globalLocalEquipped = newEquipped
        setLocalEquipped(newEquipped)
        globalSyncedUserId = user.id
      } else if (globalSyncedUserId === user.id) {
        console.log('[useCosmetics] Skipping profile sync - already synced for user:', user.id)
      }
    }
  }, [profile, user?.id])

  const purchaseCosmetic = async (itemId: string, price: number) => {
    if (!user?.id || !profile) return { success: false, error: 'User not found' }
    
    // Check if user has enough stardust
    if (profile.stardust < price) {
      return { success: false, error: 'Insufficient stardust' }
    }

    // Check if already owned
    if (ownedCosmetics.includes(itemId)) {
      return { success: false, error: 'Item already owned' }
    }

    try {
      setLoading(true)
      
      // Update owned cosmetics and subtract stardust
      const newOwnedCosmetics = [...ownedCosmetics, itemId]
      const newStardust = profile.stardust - price

      const { error } = await supabase
        .from('profiles')
        .update({
          unlocked_cosmetics: newOwnedCosmetics,
          stardust: newStardust
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Purchase error:', error)
        return { success: false, error: 'Failed to purchase item' }
      }

      // Update local state
      setOwnedCosmetics(newOwnedCosmetics)
      await refreshProfile()

      return { success: true }
    } catch (error) {
      console.error('Purchase error:', error)
      return { success: false, error: 'Failed to purchase item' }
    } finally {
      setLoading(false)
    }
  }

  const equipCosmetic = async (itemId: string, type: string) => {
    if (!user?.id) return { success: false, error: 'User not found' }

    // Always allow these items
    const alwaysOwned = ['none', 'cosmic-aurora', 'classic-singularity']
    
    // Check if owned - use the isOwned function for consistent logic
    if (!isOwned(itemId)) {
      return { success: false, error: 'Item not owned' }
    }

    try {
      setLoading(true)
      
      // Force re-render with timestamp to ensure uniqueness
      const newForceUpdate = Date.now() + Math.random()
      
      // Calculate new state values including forceUpdate
      let newLocalState = { ...globalLocalEquipped, forceUpdate: newForceUpdate }
      
      switch (type) {
        case 'singularity':
          newLocalState.singularity = itemId
          break
        case 'effect':
        case 'trail':
          const currentEffects = globalLocalEquipped.effects || []
          newLocalState.effects = [...currentEffects.filter((e: string) => e !== itemId), itemId]
          break
        case 'aura':
        case 'auras':
          // Set dedicated aura field (exclusive)
          newLocalState.aura = itemId
          break
        case 'title':
          newLocalState.title = itemId
          break
        case 'crown':
          newLocalState.crown = itemId
          break
        case 'face':
          newLocalState.face = itemId
          break
      }
      
      // Update global state and local state simultaneously
      globalLocalEquipped = newLocalState
      setLocalEquipped(newLocalState)
      setForceUpdate(newForceUpdate)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('equippedCosmetics', JSON.stringify(newLocalState))
      }

      // Save to database in background (don't wait for it)
      const saveToDatabase = async () => {
        try {
          const updateData: any = {}
          
          if (type === 'singularity') {
            updateData.equipped_singularity = newLocalState.singularity
          } else if (['effect', 'trail'].includes(type)) {
            updateData.equipped_effects = newLocalState.effects
          } else if (['aura', 'auras'].includes(type)) {
            updateData.equipped_aura = newLocalState.aura
          } else if (type === 'title') {
            updateData.equipped_title = newLocalState.title
          } else if (type === 'crown') {
            updateData.equipped_crown = newLocalState.crown
          } else if (type === 'face') {
            updateData.equipped_face = newLocalState.face
          }
          
          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', user.id)
            
          if (error) {
            console.warn('DB update failed, using local state:', error)
          } else {
            console.log('DB update successful')
            // Only refresh profile after successful DB update
            refreshProfile()
          }
        } catch (e) {
          console.warn('DB connection failed, using local state:', e)
        }
      }
      
      // Don't await - let it run in background
      saveToDatabase()

      return { success: true }
    } catch (error) {
      console.error('Equip error:', error)
      return { success: false, error: 'Failed to equip item' }
    } finally {
      setLoading(false)
    }
  }

  const unequipCosmetic = async (itemId: string, type: string) => {
    if (!user?.id || !profile) return { success: false, error: 'User not found' }

    try {
      setLoading(true)
      
      // Update global state immediately for instant UI feedback
      const newForceUpdate = Date.now() + Math.random()
      let newLocalState = { ...globalLocalEquipped, forceUpdate: newForceUpdate }
      
      let updateData: any = {}

      switch (type) {
        case 'singularity':
          updateData.equipped_singularity = 'classic-singularity' // Default
          newLocalState.singularity = 'classic-singularity'
          break
        case 'effect':
        case 'trail':
          // Remove from equipped effects array
          const currentEffects = profile.equipped_effects || []
          updateData.equipped_effects = currentEffects.filter((e: string) => e !== itemId)
          newLocalState.effects = currentEffects.filter((e: string) => e !== itemId)
          break
        case 'aura':
        case 'auras':
          updateData.equipped_aura = 'cosmic-aurora' // Default aura
          newLocalState.aura = 'cosmic-aurora'
          break
        case 'title':
          updateData.equipped_title = null
          newLocalState.title = undefined
          break
        case 'crown':
          updateData.equipped_crown = null
          newLocalState.crown = undefined
          break
        case 'face':
          updateData.equipped_face = null
          newLocalState.face = undefined
          break
      }

      // Update global state immediately
      globalLocalEquipped = newLocalState
      setLocalEquipped(newLocalState)
      setForceUpdate(newForceUpdate)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('equippedCosmetics', JSON.stringify(newLocalState))
      }

      // Save to database in background (don't wait for it)
      const saveToDatabase = async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', user.id)

          if (error) {
            console.warn('DB update failed for unequip, using local state:', error)
          } else {
            console.log('Unequip DB update successful')
            // Only refresh profile after successful DB update
            refreshProfile()
          }
        } catch (e) {
          console.warn('DB connection failed for unequip, using local state:', e)
        }
      }
      
      // Don't await - let it run in background
      saveToDatabase()

      return { success: true }
    } catch (error) {
      console.error('Unequip error:', error)
      return { success: false, error: 'Failed to unequip item' }
    } finally {
      setLoading(false)
    }
  }

  const isOwned = (itemId: string) => {
    const alwaysOwned = ['none', 'cosmic-aurora', 'classic-singularity']
    
    // Special handling for premium-only items
    if (itemId === 'premium-crown') {
      return profile?.is_premium === true
    }
    
    return ownedCosmetics.includes(itemId) || alwaysOwned.includes(itemId)
  }
  
  const isEquipped = (itemId: string, type: string) => {
    // Use global state with profile as fallback
    switch (type) {
      case 'singularity':
        return (globalLocalEquipped.singularity || profile?.equipped_singularity || 'classic-singularity') === itemId
      case 'effect':
      case 'trail':
        return (globalLocalEquipped.effects || profile?.equipped_effects || []).includes(itemId)
      case 'aura':
      case 'auras':
        return (globalLocalEquipped.aura || profile?.equipped_aura || 'cosmic-aurora') === itemId
      case 'title':
        return (globalLocalEquipped.title || profile?.equipped_title) === itemId
      case 'crown':
        return (globalLocalEquipped.crown || profile?.equipped_crown) === itemId
      case 'face':
        return (globalLocalEquipped.face || profile?.equipped_face) === itemId
      default:
        return false
    }
  }


  return {
    ownedCosmetics,
    loading,
    purchaseCosmetic,
    equipCosmetic,
    unequipCosmetic,
    isOwned,
    isEquipped,
    equippedSingularity: globalLocalEquipped.singularity || 'classic-singularity',
    equippedEffects: globalLocalEquipped.effects || ['cosmic-aurora'],
    equippedTitle: globalLocalEquipped.title || null,
    equippedAura: globalLocalEquipped.aura || 'cosmic-aurora',
    equippedCrown: globalLocalEquipped.crown || null,
    equippedFace: globalLocalEquipped.face || null,
    forceUpdate: globalLocalEquipped.forceUpdate || forceUpdate // Use embedded forceUpdate first
  }
}