'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { 
  User, Edit3, Save, RefreshCw, Star, Sparkles, 
  Trophy, Shield, AlertTriangle, Trash2, Mail,
  Users, Crown, Palette, MessageCircle, UserPlus,
  Gift, Diamond, Check, Settings, Heart, Circle,
  Zap, Layers, Type, Hexagon, BookOpen, ArrowRight,
  Activity, Flame, TrendingUp, Award, Rocket,
  Waves, Snowflake, Droplets, Flower, Sun,
  Moon, Gem, Zap as Lightning, Ban, Clock, Send, Smile
} from 'lucide-react'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import EquippedAvatar from '@/components/ui/EquippedAvatar'
import { useProfile } from '@/hooks/useProfile'
import { useFavorites } from '@/hooks/useFavorites'
import { useCosmetics } from '@/hooks/useCosmetics'
import { useFriends } from '@/hooks/useFriends'
import FriendsList from '@/components/friends/FriendsList'
import AddFriend from '@/components/friends/AddFriend'
import { regenerateCosmicIdentity, updateUserProfile, getProfileById, type UserProfile as ProfileType } from '@/lib/profileSystem'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type TabType = 'profile' | 'friends' | 'treasures' | 'customize' | 'settings'
type CustomizeSubTab = 'style' | 'face' | 'aura' | 'title' | 'crown'
type RarityFilter = 'all' | 'common' | 'rare' | 'epic' | 'legendary'

const mockFriends = [
  { id: '1', name: 'Stellar Wanderer', title: 'of the Void', status: 'online', style: 'cosmic-glow', level: 15 },
  { id: '2', name: 'Quantum Sage', title: 'of Infinity', status: 'offline', style: 'stellar-core', level: 23 },
  { id: '3', name: 'Nebula Dreamer', title: 'of Stardust', status: 'online', style: 'aurora', level: 8 },
  { id: '4', name: 'Void Walker', title: 'of the Cosmos', status: 'away', style: 'plasma-storm', level: 31 }
]

const mockTreasures = [
  { id: 'first-steps', name: 'First Steps', description: 'Completed your first lesson', rarity: 'common', date: '2024-01-15' },
  { id: 'quick-learner', name: 'Quick Learner', description: 'Completed 5 lessons in one day', rarity: 'rare', date: '2024-01-20' },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Achieved 100% on a quiz', rarity: 'epic', date: '2024-01-25' },
  { id: 'aegis-exo', name: '⚙️ Aegis Exo', description: 'The Soul of Armor. This is not for battle. This is for standing where you once fled.', rarity: 'legendary', date: '2024-02-01' }
]

// Comprehensive cosmetic items that can be owned
const cosmeticItems = {
  singularity: [
    { id: 'classic-singularity', name: 'Classic Singularity', description: 'Pure, timeless design', rarity: 'common' as const, alwaysOwned: true },
    { id: 'cosmic-glow', name: 'Cosmic Glow', description: 'Deep space energy radiates from within', rarity: 'rare' as const },
    { id: 'stellar-core', name: 'Stellar Core', description: 'Radiates stellar power', rarity: 'epic' as const },
    { id: 'void-essence', name: 'Void Essence', description: 'Mysterious dark singularity', rarity: 'legendary' as const },
    { id: 'golden-majesty', name: 'Golden Majesty', description: 'Pure golden radiance', rarity: 'epic' as const },
    { id: 'crystal-essence', name: 'Crystal Essence', description: 'Crystalline perfection', rarity: 'epic' as const },
    { id: 'plasma-storm', name: 'Plasma Storm', description: 'Chaotic plasma energy', rarity: 'legendary' as const },
    { id: 'flame', name: 'Infernal Core', description: 'Burning cosmic fire', rarity: 'rare' as const },
    { id: 'lightning', name: 'Storm Heart', description: 'Electric cosmic energy', rarity: 'epic' as const },
    { id: 'frost', name: 'Glacial Pulse', description: 'Crystalline ice energy', rarity: 'rare' as const },
    { id: 'grass', name: 'Verdant Pulse', description: 'Living nature energy', rarity: 'common' as const },
    { id: 'wind', name: 'Zephyr Drift', description: 'Flowing air currents', rarity: 'rare' as const },
    { id: 'sand', name: 'Mirage Veil', description: 'Desert essence flows', rarity: 'common' as const },
    { id: 'stone', name: 'Titan\'s Embrace', description: 'Ancient rock strength', rarity: 'common' as const },
    { id: 'leaf', name: 'Sylvan Echo', description: 'Forest whispers', rarity: 'rare' as const },
    // Epic New Singularity Styles
    { id: 'quantum-nexus', name: 'Quantum Nexus', description: 'Reality fractures around this impossible geometry', rarity: 'legendary' as const },
    { id: 'temporal-vortex', name: 'Temporal Vortex', description: 'Time spirals endlessly around this chronomorphic singularity', rarity: 'legendary' as const },
    { id: 'cosmic-forge', name: 'Cosmic Forge', description: 'Where stars are born and galaxies are shaped', rarity: 'legendary' as const },
    { id: 'shadow-monarch', name: 'Shadow Monarch', description: 'Absolute darkness given form', rarity: 'legendary' as const },
    { id: 'prism-matrix', name: 'Prism Matrix', description: 'Pure light fractalized into infinite geometries', rarity: 'epic' as const },
    { id: 'nebula-heart', name: 'Nebula Heart', description: 'The beating core of a stellar nursery', rarity: 'epic' as const },
    { id: 'plasma-core', name: 'Plasma Core', description: 'Chaotic plasma energy vibrates with unstable force', rarity: 'legendary' as const }
  ],
  faces: [
    { id: 'happy-face', name: 'Happy Face', description: 'A cheerful expression that radiates positivity', rarity: 'common' as const },
    { id: 'cool-face', name: 'Cool Face', description: 'Too cool for the cosmic school', rarity: 'rare' as const },
    { id: 'starry-eyes', name: 'Starry Eyes', description: 'Eyes filled with cosmic wonder', rarity: 'rare' as const },
    { id: 'winking-face', name: 'Winking Face', description: 'A playful wink for your cosmic adventures', rarity: 'common' as const },
    { id: 'thinking-face', name: 'Thinking Face', description: 'For when you\'re pondering the mysteries of the universe', rarity: 'rare' as const },
    { id: 'cosmic-face', name: 'Cosmic Face', description: 'A face touched by the stars themselves', rarity: 'legendary' as const },
  ],
  effects: [
    // Aura System
    { id: 'none', name: 'No Aura', description: 'Clean and minimal appearance', rarity: 'common' as const, alwaysOwned: true },
    { id: 'cosmic-aurora', name: 'Cosmic Aurora', description: 'Aurora borealis cosmic dance', rarity: 'common' as const },
    { id: 'stellar-blue', name: 'Stellar Blue', description: 'Deep blue stellar energy', rarity: 'rare' as const },
    { id: 'mystic-purple', name: 'Mystic Purple', description: 'Mysterious purple void energy', rarity: 'epic' as const },
    { id: 'emerald-life', name: 'Emerald Life', description: 'Vibrant green life force', rarity: 'rare' as const },
    { id: 'crimson-flame', name: 'Crimson Flame', description: 'Fiery red burning energy', rarity: 'epic' as const },
    { id: 'golden-majesty', name: 'Golden Majesty', description: 'Royal golden radiance', rarity: 'legendary' as const },
    { id: 'frost-crystal', name: 'Frost Crystal', description: 'Icy crystalline aura', rarity: 'rare' as const },
    { id: 'void-darkness', name: 'Void Darkness', description: 'Dark matter distortion field', rarity: 'legendary' as const },
    { id: 'rainbow-prism', name: 'Rainbow Prism', description: 'Prismatic light spectrum', rarity: 'legendary' as const },
    { id: 'plasma-storm', name: 'Plasma Storm', description: 'Chaotic electrical energy', rarity: 'legendary' as const }
  ],
  titles: [
    { id: 'null-seeker', name: 'Null Seeker', description: 'For those who understand the void', rarity: 'common' as const },
    { id: 'systems-sage', name: 'Systems Sage', description: 'Master of interconnected knowledge', rarity: 'rare' as const },
    { id: 'cosmic-architect', name: 'Cosmic Architect', description: 'Builder of universal understanding', rarity: 'legendary' as const }
  ],
  crowns: [
    { id: 'premium-crown', name: 'Premium Crown', description: 'Exclusive golden crown for premium members', rarity: 'legendary' as const, premiumOnly: true }
  ]
}

const featuredAchievements = [
  { id: 'voltaic-surge', name: 'Voltaic Surge', description: 'Electric storm energy mastered', rarity: 'epic', type: 'style' },
  { id: 'plasma-storm', name: 'Plasma Storm', description: 'Chaotic plasma energy unleashed', rarity: 'legendary', type: 'style' },
  { id: 'null-seeker', name: 'Null Seeker', description: 'For those who understand the void', rarity: 'rare', type: 'title' },
  { id: 'void-essence', name: 'Void Essence', description: 'Mysterious dark singularity conquered', rarity: 'legendary', type: 'style' }
]

function ProfileSettingsContent() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.profileId ? parseInt(params.profileId as string) : null
  const { profile: currentUserProfile, refreshProfile } = useProfile()
  const { user } = useAuth()
  const [viewedProfile, setViewedProfile] = useState<ProfileType | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const { favorites, toggleFavorite } = useFavorites()
  const { 
    equipCosmetic, 
    unequipCosmetic, 
    isOwned, 
    isEquipped,
    ownedCosmetics,
    equippedAura,
    equippedSingularity,
    equippedCrown,
    equippedFace,
    forceUpdate 
  } = useCosmetics()
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    loading: friendsLoading,
    respondToRequest,
    removeFriend,
    getFriendCount,
    getPendingRequestsCount
  } = useFriends()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [activeCustomizeTab, setActiveCustomizeTab] = useState<CustomizeSubTab>('style')
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const [showRarityDropdown, setShowRarityDropdown] = useState(false)
  const [showFriendSearch, setShowFriendSearch] = useState(false)
  const rarityDropdownRef = useRef<HTMLDivElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'password-verify' | 'final-confirm' | 'deleting'>('confirm')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [nameChangeInfo, setNameChangeInfo] = useState<{
    remaining: number
    nextReset: Date | null
  }>({ remaining: 2, nextReset: null })
  const [isPremium, setIsPremium] = useState(false)
  const [equipKey, setEquipKey] = useState(0)
  const [formData, setFormData] = useState({
    display_name: '',
    username: ''
  })

  // Fetch profile based on profileId
  useEffect(() => {
    async function loadProfile() {
      if (profileId === null || isNaN(profileId)) return
      
      setProfileLoading(true)
      try {
        const profile = await getProfileById(profileId)
        if (profile) {
          console.log('Loaded profile:', profile)
          console.log('Profile premium status:', profile.is_premium)
          console.log('Profile premium type:', typeof profile.is_premium)
          setViewedProfile(profile)
        } else {
          // Profile not found, redirect based on auth status
          if (user) {
            router.push('/home')
          } else {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        // Redirect based on auth status
        if (user) {
          router.push('/home')
        } else {
          router.push('/')
        }
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [profileId, router])

  // Determine if viewing own profile
  useEffect(() => {
    if (currentUserProfile && profileId !== null) {
      const isOwn = currentUserProfile.profile_id === profileId
      console.log('Profile ownership check:', { 
        currentUserProfileId: currentUserProfile.profile_id, 
        viewedProfileId: profileId, 
        isOwn 
      })
      setIsOwnProfile(isOwn)
    }
  }, [currentUserProfile, profileId])

  // Use viewedProfile for display, currentUserProfile for own profile actions
  const profile = isOwnProfile ? currentUserProfile : viewedProfile

  // Function to get aura gradient colors
  const getAuraGradientColors = (auraName: string | null) => {
    const auraColorMap = {
      'cosmic-aurora': { from: 'from-emerald-400', via: 'via-green-300', to: 'to-purple-400' },
      'stellar-blue': { from: 'from-blue-500', via: 'via-cyan-400', to: 'to-blue-600' },
      'mystic-purple': { from: 'from-purple-600', via: 'via-cosmic-plasma', to: 'to-indigo-600' },
      'emerald-life': { from: 'from-emerald-500', via: 'via-green-400', to: 'to-teal-500' },
      'crimson-flame': { from: 'from-red-600', via: 'via-orange-500', to: 'to-red-500' },
      'golden-majesty': { from: 'from-yellow-500', via: 'via-cosmic-stardust', to: 'to-amber-500' },
      'frost-crystal': { from: 'from-cyan-400', via: 'via-blue-300', to: 'to-cyan-500' },
      'void-darkness': { from: 'from-gray-900', via: 'via-purple-900', to: 'to-black' },
      'rainbow-prism': { from: 'from-pink-500', via: 'via-purple-500', to: 'to-indigo-500' },
      'plasma-storm': { from: 'from-pink-600', via: 'via-cosmic-plasma', to: 'to-purple-600' }
    }
    
    return auraColorMap[auraName as keyof typeof auraColorMap] || auraColorMap['cosmic-aurora']
  }

  // Function to get aura single color
  const getAuraSingleColor = (auraName: string | null) => {
    const auraSingleColorMap = {
      'cosmic-aurora': 'cosmic-aurora',
      'stellar-blue': 'blue-500',
      'mystic-purple': 'purple-600',
      'emerald-life': 'emerald-500',
      'crimson-flame': 'red-600',
      'golden-majesty': 'yellow-500',
      'frost-crystal': 'cyan-400',
      'void-darkness': 'gray-900',
      'rainbow-prism': 'pink-500',
      'plasma-storm': 'pink-600'
    }
    
    return auraSingleColorMap[auraName as keyof typeof auraSingleColorMap] || 'cosmic-aurora'
  }

  // Function to get singularity style preview
  const getSingularityPreview = (styleId: string) => {
    const previewStyles = {
      'classic-singularity': 'bg-white',
      'cosmic-glow': 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse shadow-lg shadow-purple-400/60',
      'stellar-core': 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/80',
      'void-essence': 'bg-purple-900 border-2 border-purple-400 animate-pulse shadow-lg shadow-purple-400/60',
      'golden-majesty': 'bg-yellow-500 border-2 border-yellow-300 shadow-lg shadow-yellow-500/60',
      'crystal-essence': 'bg-cyan-400 border-2 border-cyan-200 animate-pulse shadow-lg shadow-cyan-400/60',
      'plasma-storm': 'bg-pink-500 border-2 border-pink-300 shadow-lg shadow-pink-500/60',
      'aurora': 'bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 animate-pulse shadow-lg shadow-green-400/50',
      'lightning': 'bg-gradient-to-r from-blue-300 to-white border-2 border-blue-200 shadow-lg shadow-blue-300/80',
      'flame': 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 shadow-lg shadow-orange-400/70',
      'frost': 'bg-gradient-to-br from-blue-200 via-cyan-300 to-white shadow-lg shadow-cyan-300/60',
      'grass': 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-lg shadow-green-400/60',
      'wind': 'bg-gradient-to-br from-gray-200 via-white to-gray-100 shadow-lg shadow-gray-300/50',
      'sand': 'bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200 shadow-lg shadow-amber-300/50',
      'stone': 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 border border-gray-300 shadow-lg shadow-gray-500/60',
      'leaf': 'bg-gradient-to-br from-green-300 via-emerald-400 to-green-500 shadow-lg shadow-emerald-400/60',
      // Epic New Styles
      'quantum-nexus': 'bg-gradient-to-br from-cyan-200 via-blue-400 to-purple-600 border-2 border-cyan-300 shadow-2xl shadow-cyan-400/80 animate-pulse',
      'temporal-vortex': 'bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 shadow-2xl shadow-purple-500/70 animate-pulse',
      'cosmic-forge': 'bg-gradient-to-br from-orange-400 via-red-500 to-yellow-300 shadow-2xl shadow-orange-500/80 animate-pulse',
      'shadow-monarch': 'bg-gradient-to-br from-gray-900 via-black to-purple-900 border-2 border-purple-800 shadow-2xl shadow-purple-900/90',
      'prism-matrix': 'bg-gradient-to-br from-white via-cyan-200 to-pink-200 border border-cyan-300 shadow-lg shadow-cyan-300/60',
      'nebula-heart': 'bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 shadow-lg shadow-purple-400/60',
      'plasma-core': 'bg-pink-500 border-2 border-pink-300 shadow-lg shadow-pink-500/60'
    }
    return previewStyles[styleId as keyof typeof previewStyles] || 'bg-white'
  }

  // Function to get face preview SVG
  const getFacePreview = (faceId: string) => {
    switch (faceId) {
      case 'happy-face':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="16" cy="20" r="2" fill="white" />
            <circle cx="32" cy="20" r="2" fill="white" />
            <path d="M 12 28 Q 24 36 36 28" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'cool-face':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Sunglasses */}
            <rect x="8" y="18" width="12" height="8" rx="2" fill="white" opacity="0.9" />
            <rect x="28" y="18" width="12" height="8" rx="2" fill="white" opacity="0.9" />
            <rect x="20" y="20" width="8" height="2" fill="white" opacity="0.9" />
            {/* Smirk */}
            <path d="M 16 32 Q 28 34 32 30" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'starry-eyes':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Star eyes */}
            <path d="M 16 16 L 17 20 L 20 18 L 17 22 L 16 26 L 15 22 L 12 18 L 15 20 Z" fill="white" />
            <path d="M 32 16 L 33 20 L 36 18 L 33 22 L 32 26 L 31 22 L 28 18 L 31 20 Z" fill="white" />
            {/* Wide smile */}
            <path d="M 12 28 Q 24 38 36 28" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'winking-face':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Normal eye */}
            <circle cx="16" cy="20" r="2" fill="white" />
            {/* Winking eye */}
            <path d="M 28 20 L 36 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Smile */}
            <path d="M 14 28 Q 24 34 34 28" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      case 'thinking-face':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Raised eyebrow */}
            <path d="M 10 16 Q 16 14 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="15" cy="22" r="2" fill="white" />
            <circle cx="32" cy="20" r="2" fill="white" />
            {/* Thoughtful mouth */}
            <path d="M 16 32 L 28 32" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Hand on chin gesture */}
            <circle cx="32" cy="36" r="3" fill="none" stroke="white" strokeWidth="1.5" />
          </svg>
        )
      case 'cosmic-face':
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Cosmic eyes with gradient effect */}
            <defs>
              <radialGradient id="cosmicGrad">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#a78bfa" />
              </radialGradient>
            </defs>
            {/* Star-shaped eyes */}
            <path d="M 16 16 L 18 22 L 24 20 L 18 24 L 16 30 L 14 24 L 8 20 L 14 22 Z" fill="url(#cosmicGrad)" />
            <path d="M 32 16 L 34 22 L 40 20 L 34 24 L 32 30 L 30 24 L 24 20 L 30 22 Z" fill="url(#cosmicGrad)" />
            {/* Cosmic smile with sparkles */}
            <path d="M 12 30 Q 24 36 36 30" stroke="url(#cosmicGrad)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Sparkle effects */}
            <circle cx="10" cy="12" r="1" fill="white" opacity="0.8" />
            <circle cx="38" cy="10" r="1" fill="white" opacity="0.8" />
            <circle cx="40" cy="36" r="1" fill="white" opacity="0.8" />
            <circle cx="8" cy="38" r="1" fill="white" opacity="0.8" />
          </svg>
        )
      default:
        return <Smile className="w-8 h-8 text-white" />
    }
  }

  // Function to filter items by rarity
  const filterByRarity = (items: any[]) => {
    if (rarityFilter === 'all') return items
    return items.filter(item => item.rarity === rarityFilter)
  }

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || ''
      })
      // Check if user is premium (you'll need to add this field to your profile)
      setIsPremium(profile.is_premium || false)
    }
  }, [profile])

  // Check name change rate limit
  useEffect(() => {
    // Temporarily disable name change limit check until table is created
    // TODO: Re-enable once display_name_changes table is set up
    setNameChangeInfo({ remaining: 2, nextReset: null })
  }, [user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rarityDropdownRef.current && !rarityDropdownRef.current.contains(event.target as Node)) {
        setShowRarityDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSave = async () => {
    if (!user?.id) return
    
    // Check if display name has changed
    const displayNameChanged = formData.display_name !== profile?.display_name
    
    // Validate display name length
    if (formData.display_name.length > 20) {
      alert('Display name must be 20 characters or less')
      return
    }
    
    // Check rate limit if display name changed
    if (displayNameChanged) {
      if (nameChangeInfo.remaining === 0) {
        alert(`You've used all your display name changes. Next change available: ${nameChangeInfo.nextReset?.toLocaleDateString() || 'Unknown'}`)
        return
      }
      
      setIsSaving(true)
      
      try {
        // Check name safety with AI
        const response = await fetch('/api/check-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.display_name })
        })
        
        const result = await response.json()
        
        if (!result.safe) {
          alert(result.reason || 'This display name is not allowed. Please choose a different name.')
          setIsSaving(false)
          return
        }
        
        // Record the name change
        await supabase.from('display_name_changes').insert({
          user_id: user.id,
          old_name: profile?.display_name || '',
          new_name: formData.display_name,
          changed_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error checking name safety:', error)
        alert('Failed to verify name safety. Please try again.')
        setIsSaving(false)
        return
      }
    }
    
    setIsSaving(true)
    try {
      await updateUserProfile(user.id, {
        display_name: formData.display_name,
        username: formData.username
      })
      await refreshProfile()
      setIsEditing(false)
      
      // Refresh name change info
      if (displayNameChanged) {
        setNameChangeInfo(prev => ({
          remaining: Math.max(0, prev.remaining - 1),
          nextReset: prev.nextReset || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }))
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerateIdentity = async () => {
    if (!user?.id) return
    
    setIsRegenerating(true)
    try {
      await regenerateCosmicIdentity(user.id)
      await refreshProfile()
    } catch (error) {
      console.error('Error regenerating identity:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || ''
      })
    }
    setIsEditing(false)
  }

  const handleDeleteRequest = async () => {
    if (!user?.email || deleteEmail !== user.email) {
      alert('Email does not match your account email')
      return
    }

    setDeleteStep('password-verify')
  }

  const handlePasswordVerify = async () => {
    if (!deletePassword) {
      alert('Please enter your password')
      return
    }

    setIsDeleting(true)
    try {
      // Verify password by attempting to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: deletePassword
      })

      if (error) {
        alert('Incorrect password. Please try again.')
        return
      }

      setDeleteStep('final-confirm')
    } catch (error) {
      console.error('Error verifying password:', error)
      alert('Failed to verify password. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFinalDelete = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    setDeleteStep('deleting')
    setIsDeleting(true)

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      // Call the server-side API to handle complete account deletion
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ 
          confirmationText: deleteConfirmText 
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Delete API error:', result)
        alert(result.error || 'Failed to delete account. Please contact support.')
        return
      }

      // Log any deletion errors but don't block the process
      if (result.deletionErrors && result.deletionErrors.length > 0) {
        console.warn('Some data deletion errors occurred:', result.deletionErrors)
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/')

    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please contact support.')
    } finally {
      setIsDeleting(false)
    }
  }


  if (!profile) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cosmic-starlight/20 animate-pulse"></div>
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as TabType, name: 'Profile', icon: User },
    { id: 'friends' as TabType, name: 'Friends', icon: Users },
    { id: 'treasures' as TabType, name: 'Treasures', icon: Trophy },
    ...(isOwnProfile ? [
      { id: 'customize' as TabType, name: 'Customize', icon: Palette, highlight: true }
    ] : []),
    ...(isOwnProfile ? [
      { id: 'settings' as TabType, name: 'Settings', icon: Settings }
    ] : [])
  ]

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400'
  }

  const rarityColors = {
    common: 'border-gray-400 text-gray-400',
    rare: 'border-blue-400 text-blue-400',
    epic: 'border-purple-400 text-purple-400',
    legendary: 'border-yellow-400 text-yellow-400'
  }

  if (profileLoading || !profile || profileId === null) {
    return (
      <div className="min-h-screen relative">
        <TopNavigationBar />
        <main className="relative z-10 p-6 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-aurora mx-auto mb-4"></div>
            <p className="text-white/60">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">

      <TopNavigationBar />

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="w-full">
          

          {/* Enhanced Profile Header - Compact */}
          <div className="relative mb-8">
            {/* Cosmic Background Pattern */}
            <div className="absolute inset-0 -top-10 h-64 opacity-30">
              {equippedAura !== 'none' && (
                <div className={`absolute inset-0 bg-gradient-to-br ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).via} ${getAuraGradientColors(equippedAura).to} blur-3xl`} />
              )}
            </div>
            
            <div className="relative text-center">
              {/* Avatar with Enhanced Effects */}
              <m.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative inline-block mb-4 group cursor-pointer"
              >
                {/* Outer Glow Ring */}
                {equippedAura !== 'none' && (
                  <m.div
                    className={`absolute -inset-4 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).via} ${getAuraGradientColors(equippedAura).from} rounded-full blur-xl opacity-50`}
                  animate={{ 
                    rotate: 360,
                    scale: 1.1
                  }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                    }}
                  />
                )}
                
                {/* Avatar Container */}
                <div className="relative mt-8">
                  <EquippedAvatar 
                    key={`${equippedSingularity}-${equippedAura}-${forceUpdate}`}
                    size="xxl" 
                    showPulse={true} 
                    showAura={true}
                    showEffects={true}
                    clickable={isOwnProfile}
                    onClick={isOwnProfile ? () => setActiveTab('customize') : undefined}
                    crownScaleMultiplier={1.4}
                  />
                  
                  {/* Hover Overlay for Avatar - Only show on own profile */}
                  {isOwnProfile && (
                    <m.div
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-center">
                        <Palette className="w-8 h-8 text-white mb-1 mx-auto" />
                        <p className="text-white text-sm font-medium">Customize</p>
                      </div>
                    </m.div>
                  )}
                  
                </div>
              </m.div>

              {/* User Info with Better Typography */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-1"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white cosmic-heading mt-3">
                  {profile?.display_name || 'Cosmic Wanderer'}
                </h1>
                
                <div className="flex items-center justify-center gap-4">
                  <p className="text-lg text-white font-medium">
                    @{profile?.username || 'user'}
                  </p>
                  {profile?.is_premium && (
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      onClick={() => router.push('/upgrade')}
                      className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center gap-1 cursor-pointer hover:from-yellow-300 hover:to-amber-300 transition-all duration-75"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Crown className="w-4 h-4 text-black" />
                      <span className="text-black font-semibold text-sm">PREMIUM</span>
                    </m.div>
                  )}
                </div>
                

                {/* Quick Stats Bar */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-8 mt-4"
                >
                </m.div>
              </m.div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex justify-center mb-4">
            <m.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              {/* Tab Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from}/20 ${getAuraGradientColors(equippedAura).via}/20 ${getAuraGradientColors(equippedAura).from}/20 blur-xl`} />
              
              <div className="relative flex gap-1 bg-black/60 backdrop-blur-lg border border-white/20 rounded-2xl p-1.5">
                {tabs.map((tab, index) => {
                  const isActive = activeTab === tab.id
                  return (
                    <m.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-75 ${
                        isActive
                          ? 'text-white'
                          : tab.highlight
                          ? 'text-white/80 hover:text-white'
                          : 'text-white/60 hover:text-white/90'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active Tab Background */}
                      {isActive && (
                        <m.div
                          layoutId="activeTab"
                          className={`absolute inset-0 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).to} rounded-xl`}
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                      
                      <tab.icon className={`relative z-10 w-5 h-5 ${
                        isActive ? 'text-white' : tab.highlight ? 'text-cosmic-aurora' : ''
                      }`} />
                      <span className="relative z-10">{tab.name}</span>
                      
                      {/* Highlight Customize Tab */}
                      {tab.highlight && !isActive && (
                        <m.div
                          animate={{ scale: 1.2 }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-2 h-2 bg-cosmic-aurora rounded-full"
                        />
                      )}
                      
                      {/* Tab Notification Dot */}
                      {tab.id === 'friends' && (
                        <m.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"
                        />
                      )}
                    </m.button>
                  )
                })}
              </div>
            </m.div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <m.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && (
                <div className="max-w-4xl mx-auto">

                  {/* Enhanced Stats Cards */}
                  <div className="mb-12">
                    <m.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold text-white cosmic-heading mb-8 flex items-center gap-3"
                    >
                      <Activity className="w-6 h-6 text-cosmic-starlight" />
                      Profile
                    </m.h2>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {/* Enhanced Stats Cards with Better Design */}
                      {[
                        {
                          icon: Users,
                          value: getFriendCount(),
                          label: 'Friends',
                          change: getPendingRequestsCount() > 0 ? `${getPendingRequestsCount()} pending` : 'All connected',
                          color: 'aurora',
                          delay: 0.4,
                          onClick: () => setActiveTab('friends')
                        },
                        {
                          icon: Flame,
                          value: 23,
                          label: 'Streak',
                          change: 'days active',
                          color: 'starlight',
                          delay: 0.5
                        },
                        {
                          icon: Trophy,
                          value: mockTreasures.length,
                          label: 'Achievements',
                          change: 'View collection →',
                          color: 'stardust',
                          delay: 0.6,
                          onClick: () => setActiveTab('treasures')
                        },
                        {
                          icon: Rocket,
                          value: '2.3k',
                          label: 'Total Stardust',
                          change: '+150 today',
                          color: 'nebula',
                          delay: 0.7
                        }
                      ].map((stat, index) => (
                        <m.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                          className="group relative"
                        >
                          <m.div
                            className={`relative glass-morphism rounded-xl p-3 border border-white/20 hover:border-cosmic-${stat.color}/50 transition-all duration-75 ${
                              stat.onClick ? 'cursor-pointer' : ''
                            }`}
                            onClick={stat.onClick}
                            whileHover={{ y: -2, scale: 1.02 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-cosmic-${stat.color}/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            
                            {/* Floating Particles */}
                            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                              {[...Array(2)].map((_, i) => (
                                <m.div
                                  key={i}
                                  className={`absolute w-0.5 h-0.5 bg-cosmic-${stat.color} rounded-full opacity-0 group-hover:opacity-100`}
                                  animate={{
                                    x: [0, 20, 0],
                                    y: [0, -15, 0]
                                  }}
                                  transition={{
                                    duration: 3 + i,
                                    repeat: Infinity,
                                    delay: i * 0.5
                                  }}
                                  style={{
                                    left: `${25 + i * 30}%`,
                                    bottom: `${15 + i * 15}%`
                                  }}
                                />
                              ))}
                            </div>
                            
                            <div className="relative z-10 flex items-center gap-3">
                              {/* Icon */}
                              <m.div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-br from-cosmic-${stat.color}/30 to-cosmic-${stat.color}/10 border border-cosmic-${stat.color}/20 flex items-center justify-center flex-shrink-0`}
                                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                                transition={{ duration: 0.5 }}
                              >
                                <stat.icon className={`w-4 h-4 text-cosmic-${stat.color}`} />
                              </m.div>
                              
                              {/* Stats */}
                              <div className="min-w-0 flex-1">
                                <div className="text-xl font-bold text-white cosmic-heading leading-tight">
                                  {stat.value}
                                </div>
                                <div className="text-xs text-white/60 font-medium truncate">
                                  {stat.label}
                                </div>
                                <div className={`text-xs text-cosmic-${stat.color}/70 group-hover:text-cosmic-${stat.color} transition-colors truncate`}>
                                  {stat.change}
                                </div>
                              </div>
                            </div>
                          </m.div>
                        </m.div>
                      ))}
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    
                    {/* Favorites Section */}
                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="glass-morphism rounded-2xl p-6 border border-white/20"
                    >
                      <h3 className="text-xl font-bold text-white cosmic-heading mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        Favorites
                      </h3>
                      
                      {favorites.length === 0 ? (
                        <div className="text-center py-8 text-white/60">
                          <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No favorites yet</p>
                          <p className="text-sm mt-1">Your favorite lessons and concepts will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {favorites.slice(0, 3).map((favorite, index) => (
                            <m.div
                              key={favorite.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                              className="group"
                            >
                              <m.button
                                onClick={() => router.push(favorite.lesson_path)}
                                className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="w-8 h-8 bg-cosmic-starlight/20 border border-cosmic-starlight/40 rounded-full flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-cosmic-starlight" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-white font-medium text-sm">{favorite.lesson_title}</div>
                                  {favorite.lesson_description && (
                                    <div className="text-white/60 text-xs mt-0.5">{favorite.lesson_description}</div>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                              </m.button>
                            </m.div>
                          ))}
                          
                          {favorites.length > 3 && (
                            <m.button
                              onClick={() => router.push('/learn')}
                              className="w-full text-center text-cosmic-aurora text-sm font-medium hover:text-white transition-colors py-2"
                              whileHover={{ scale: 1.02 }}
                            >
                              View all {favorites.length} favorites →
                            </m.button>
                          )}
                        </div>
                      )}
                    </m.div>

                    {/* Groups Section */}
                    <m.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="glass-morphism rounded-2xl p-6 border border-white/20"
                    >
                      <h3 className="text-xl font-bold text-white cosmic-heading mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-cosmic-aurora" />
                        Groups
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Cosmic Learners</div>
                            <div className="text-white/60 text-sm">42 members</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Knowledge Seekers</div>
                            <div className="text-white/60 text-sm">18 members</div>
                          </div>
                        </div>
                      </div>
                    </m.div>
                  </div>

                  {/* Featured Achievements */}
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="mt-8 glass-morphism rounded-3xl p-8 border border-white/20 relative overflow-hidden"
                  >
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-cosmic-stardust rounded-full blur-3xl" />
                      {equippedAura !== 'none' && (
                        <div className={`absolute bottom-0 left-0 w-96 h-96 bg-${getAuraSingleColor(equippedAura)} rounded-full blur-3xl`} />
                      )}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white cosmic-heading flex items-center gap-3">
                          <Award className="w-6 h-6 text-cosmic-stardust" />
                          Latest Achievements
                        </h3>
                        <m.button
                          onClick={() => setActiveTab('treasures')}
                          className="flex items-center gap-2 text-cosmic-aurora hover:text-white text-sm font-medium transition-colors duration-75"
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>View Collection</span>
                          <ArrowRight className="w-4 h-4" />
                        </m.button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {featuredAchievements.map((achievement, index) => (
                          <m.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1 + index * 0.1, type: "spring" }}
                            whileHover={{ y: -5, scale: 1.05 }}
                            className={`relative group bg-black/40 border-2 rounded-2xl p-5 text-center transition-all duration-75 ${
                              rarityColors[achievement.rarity as keyof typeof rarityColors]
                            } hover:shadow-lg hover:shadow-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : 'blue'}-400/20`}
                          >
                            {/* Rarity Glow Effect */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                              achievement.rarity === 'legendary' ? 'from-yellow-400 to-amber-400' :
                              achievement.rarity === 'epic' ? 'from-purple-400 to-indigo-400' :
                              achievement.rarity === 'rare' ? 'from-blue-400 to-cyan-400' :
                              'from-gray-400 to-gray-600'
                            }`} />
                            
                            <div className="relative z-10">
                              {/* Icon Container */}
                              <m.div
                                className="w-14 h-14 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center mx-auto mb-3"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                {achievement.type === 'style' ? (
                                  achievement.rarity === 'legendary' ? (
                                    <Hexagon className="w-7 h-7 text-yellow-400" />
                                  ) : (
                                    <Circle className="w-7 h-7 text-purple-400" />
                                  )
                                ) : (
                                  <Type className="w-7 h-7 text-blue-400" />
                                )}
                              </m.div>
                              
                              <h4 className="text-white font-bold text-sm mb-2">{achievement.name}</h4>
                              <p className="text-white/60 text-xs mb-3 line-clamp-2">{achievement.description}</p>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${rarityColors[achievement.rarity as keyof typeof rarityColors]} bg-black/60`}>
                                {achievement.rarity.toUpperCase()}
                              </span>
                            </div>
                          </m.div>
                        ))}
                      </div>
                    </div>
                  </m.div>
                  
                  {/* Joined Date at Bottom */}
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="text-center mt-12 pt-8 border-t border-white/10"
                  >
                    <div className="text-lg font-medium text-white/60">
                      Joined 01/15/2024
                    </div>
                  </m.div>
                </div>
              )}

              {activeTab === 'friends' && (
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white cosmic-heading flex items-center gap-3">
                      <Users className="w-8 h-8 text-cosmic-aurora" />
                      Friends
                    </h2>
                    <m.button
                      onClick={() => setShowFriendSearch(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).to} text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-${getAuraSingleColor(equippedAura)}/50 transition-all duration-75`}
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Friend
                    </m.button>
                  </div>

                  <FriendsList />
                </div>
              )}

              {activeTab === 'treasures' && (
                <div className="max-w-6xl mx-auto">
                  {/* Treasures Header */}
                  <div className="text-center mb-12">
                    <m.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-bold text-white cosmic-heading mb-4 flex items-center justify-center gap-3"
                    >
                      <Trophy className="w-8 h-8 text-cosmic-stardust" />
                      Cosmic Treasury
                    </m.h2>
                    <m.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-white/60 max-w-2xl mx-auto"
                    >
                      Your collection of achievements, each one a testament to your journey through the cosmos of knowledge
                    </m.p>
                  </div>
                  
                  {/* Rarity Filter */}
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-2 mb-8"
                  >
                    {Object.entries(rarityColors).map(([rarity, color]) => (
                      <m.button
                        key={rarity}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${color} bg-black/40 hover:bg-black/60 transition-all duration-75`}
                      >
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      </m.button>
                    ))}
                  </m.div>
                  
                  {/* Treasures Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockTreasures.map((treasure, index) => (
                      <m.div
                        key={treasure.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`relative group glass-morphism border-2 rounded-3xl p-8 ${rarityColors[treasure.rarity as keyof typeof rarityColors]} hover:shadow-2xl hover:shadow-${treasure.rarity === 'legendary' ? 'yellow' : treasure.rarity === 'epic' ? 'purple' : 'blue'}-400/30 transition-all duration-75`}
                      >
                        {/* Rarity Background Effect */}
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                          treasure.rarity === 'legendary' ? 'from-yellow-400 via-amber-400 to-orange-400' :
                          treasure.rarity === 'epic' ? 'from-purple-400 via-indigo-400 to-blue-400' :
                          treasure.rarity === 'rare' ? 'from-blue-400 via-cyan-400 to-teal-400' :
                          'from-gray-400 via-gray-500 to-gray-600'
                        }`} />
                        
                        {/* Floating Particles for Legendary Items */}
                        {treasure.rarity === 'legendary' && (
                          <div className="absolute inset-0 overflow-hidden rounded-3xl">
                            {[...Array(5)].map((_, i) => (
                              <m.div
                                key={i}
                                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                                animate={{
                                  y: [-20, -100],
                                  opacity: [0, 1, 0]
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: i * 0.6,
                                  ease: "easeOut"
                                }}
                                style={{
                                  left: `${20 + i * 15}%`,
                                  bottom: 0
                                }}
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="relative z-10">
                          {/* Icon */}
                          <m.div
                            className="flex justify-center mb-6"
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className={`w-20 h-20 rounded-2xl bg-black/60 border-2 ${rarityColors[treasure.rarity as keyof typeof rarityColors]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              {treasure.rarity === 'legendary' ? (
                                <Diamond className="w-10 h-10 text-yellow-400" />
                              ) : treasure.rarity === 'epic' ? (
                                <Crown className="w-10 h-10 text-purple-400" />
                              ) : treasure.rarity === 'rare' ? (
                                <Star className="w-10 h-10 text-blue-400" />
                              ) : (
                                <Trophy className="w-10 h-10 text-gray-400" />
                              )}
                            </div>
                          </m.div>
                          
                          {/* Content */}
                          <div className="text-center space-y-3">
                            <h4 className="text-xl font-bold text-white cosmic-heading">
                              {treasure.name}
                            </h4>
                            <p className="text-white/80 text-sm leading-relaxed">
                              {treasure.description}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${rarityColors[treasure.rarity as keyof typeof rarityColors]} bg-black/60`}>
                                {treasure.rarity.toUpperCase()}
                              </span>
                              <span className="text-white/50 text-xs">
                                {treasure.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </div>
                  
                  {/* Collection Stats */}
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 glass-morphism rounded-3xl p-8 border border-white/20 text-center"
                  >
                    <h3 className="text-xl font-bold text-white cosmic-heading mb-6">Collection Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {Object.entries(rarityColors).map(([rarity, color]) => {
                        const count = mockTreasures.filter(t => t.rarity === rarity).length
                        return (
                          <div key={rarity} className="text-center">
                            <div className={`text-3xl font-bold ${color.replace('border', 'text').replace('text-', 'text-')} cosmic-heading mb-2`}>
                              {count}
                            </div>
                            <div className="text-white/60 text-sm capitalize">
                              {rarity}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </m.div>
                </div>
              )}

              {activeTab === 'customize' && isOwnProfile && (
                <div className="w-full h-screen flex flex-col">
                  
                  {/* Fixed Header */}
                  <div className="flex-shrink-0 px-6 py-4 z-[100]">
                    <div className="flex items-center justify-center gap-6">
                      {/* Title Section */}
                      <div className="flex items-center gap-3">
                        <Palette className="w-6 h-6 text-cosmic-aurora" />
                        <h2 className="text-2xl font-bold text-white">Avatar Customization</h2>
                      </div>
                      
                      {/* Divider */}
                      <div className="h-8 w-px bg-white/20" />
                      
                      {/* Sub-Tabs */}
                      <div className="flex gap-1 bg-black/40 border border-white/20 rounded-xl p-1">
                        {[
                          { id: 'style' as CustomizeSubTab, name: 'Style', icon: Circle },
                          { id: 'face' as CustomizeSubTab, name: 'Face', icon: Smile },
                          { id: 'aura' as CustomizeSubTab, name: 'Aura', icon: Layers },
                          { id: 'title' as CustomizeSubTab, name: 'Title', icon: Type },
                          { id: 'crown' as CustomizeSubTab, name: 'Accessories', icon: Crown }
                        ].map((subTab) => (
                          <m.button
                            key={subTab.id}
                            onClick={() => setActiveCustomizeTab(subTab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-[30ms] ${
                              activeCustomizeTab === subTab.id
                                ? `bg-gradient-to-r ${getAuraGradientColors(equippedAura).from} ${getAuraGradientColors(equippedAura).to} text-white shadow-lg`
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <subTab.icon className="w-4 h-4" />
                            {subTab.name}
                          </m.button>
                        ))}
                      </div>
                      
                      {/* Divider */}
                      <div className="h-8 w-px bg-white/20" />
                      
                      {/* Rarity Filter */}
                      <div className="relative" ref={rarityDropdownRef}>
                        <m.button
                          onClick={() => setShowRarityDropdown(!showRarityDropdown)}
                          className="px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white font-medium hover:bg-black/60 transition-colors cursor-pointer pr-10 flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{rarityFilter === 'all' ? 'All Rarities' : rarityFilter.charAt(0).toUpperCase() + rarityFilter.slice(1)}</span>
                          <ArrowRight className={`w-4 h-4 text-white/70 transition-transform ${showRarityDropdown ? 'rotate-[270deg]' : 'rotate-90'}`} />
                        </m.button>
                        
                        <AnimatePresence>
                          {showRarityDropdown && (
                            <m.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full mt-2 left-0 right-0 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl overflow-hidden z-[110]"
                            >
                              {[
                                { value: 'all' as RarityFilter, label: 'All Rarities', color: 'text-white' },
                                { value: 'common' as RarityFilter, label: 'Common', color: 'text-gray-400' },
                                { value: 'rare' as RarityFilter, label: 'Rare', color: 'text-blue-400' },
                                { value: 'epic' as RarityFilter, label: 'Epic', color: 'text-purple-400' },
                                { value: 'legendary' as RarityFilter, label: 'Legendary', color: 'text-yellow-400' }
                              ].map((option) => (
                                <m.button
                                  key={option.value}
                                  onClick={() => {
                                    setRarityFilter(option.value)
                                    setShowRarityDropdown(false)
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${
                                    rarityFilter === option.value ? 'bg-white/15' : ''
                                  }`}
                                  whileHover={{ x: 4 }}
                                  transition={{ duration: 0.1 }}
                                >
                                  <span className={`font-medium ${option.color}`}>{option.label}</span>
                                  {rarityFilter === option.value && (
                                    <Check className="w-4 h-4 text-white ml-auto" />
                                  )}
                                </m.button>
                              ))}
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Divider */}
                      <div className="h-8 w-px bg-white/20" />
                      
                      {/* Shop Button */}
                      <m.button
                        onClick={() => router.push('/shop')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-medium hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                      >
                        <Gift className="w-5 h-5" />
                        Browse Shop
                      </m.button>
                    </div>
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto px-6 py-8">
                    <AnimatePresence mode="wait">
                      <m.div
                        key={`${activeCustomizeTab}-${rarityFilter}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                      {activeCustomizeTab === 'style' && (
                        <div className="px-12">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filterByRarity(cosmeticItems.singularity
                              .filter(style => style.alwaysOwned || isOwned(style.id)))
                              .map((style) => {
                                const equipped = isEquipped(style.id, 'singularity')
                                
                                return (
                                  <m.div
                                    key={style.id}
                                    onClick={async () => {
                                      if (!equipped) {
                                        await equipCosmetic(style.id, 'singularity')
                                      }
                                    }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.03, ease: "easeOut" }}
                                    className={`relative bg-black/40 border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                                      equipped ? 'border-green-500 bg-green-500/10' : 
                                      `border-${style.rarity === 'legendary' ? 'yellow' : style.rarity === 'epic' ? 'purple' : style.rarity === 'rare' ? 'blue' : 'gray'}-500/50`
                                    }`}
                                  >
                                    <div className="flex justify-center mb-3">
                                      <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                                        <div className={`w-6 h-6 rounded-full ${getSingularityPreview(style.id)}`} />
                                      </div>
                                    </div>
                                    {/* Rarity tag - top left */}
                                    <div className="absolute top-2 left-2">
                                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border bg-black/80 ${
                                        style.rarity === 'legendary' ? 'border-yellow-400 text-yellow-400' :
                                        style.rarity === 'epic' ? 'border-purple-400 text-purple-400' :
                                        style.rarity === 'rare' ? 'border-blue-400 text-blue-400' :
                                        'border-gray-400 text-gray-400'
                                      }`}>
                                        {style.rarity.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <h4 className="text-white font-semibold text-xl mb-2">{style.name}</h4>
                                      <p className="text-white/60 text-sm mb-3 line-clamp-2">{style.description}</p>
                                      {equipped && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/90 rounded-full">
                                          <Sparkles className="w-3 h-3 text-white" />
                                          <span className="text-xs font-medium text-white">Equipped</span>
                                        </div>
                                      )}
                                    </div>
                                  </m.div>
                                )
                              })}
                          </div>
                          {cosmeticItems.singularity.filter(style => style.alwaysOwned || isOwned(style.id)).length === 0 && (
                            <div className="text-center py-12">
                              <Circle className="w-16 h-16 mx-auto mb-4 text-white/30" />
                              <p className="text-white/60 mb-4">You don't own any custom singularity styles yet!</p>
                            </div>
                          )}
                          <div className="text-center mt-8">
                            <m.button
                              onClick={() => router.push('/shop')}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-6 py-3 rounded-lg font-medium"
                            >
                              Visit Shop for More Styles
                            </m.button>
                          </div>
                        </div>
                      )}

                      {activeCustomizeTab === 'face' && (
                        <div className="px-12">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filterByRarity(cosmeticItems.faces
                              .filter(face => isOwned(face.id)))
                              .map((face) => {
                                const equipped = isEquipped(face.id, 'face')
                                
                                return (
                                  <m.div
                                    key={face.id}
                                    onClick={async () => {
                                      if (!equipped) {
                                        await equipCosmetic(face.id, 'face')
                                        setEquipKey(prev => prev + 1)
                                      }
                                    }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.03, ease: "easeOut" }}
                                    className={`relative bg-black/40 border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                                      equipped ? 'border-green-500 bg-green-500/10' : 
                                      `border-${face.rarity === 'legendary' ? 'yellow' : face.rarity === 'epic' ? 'purple' : face.rarity === 'rare' ? 'blue' : 'gray'}-500/50`
                                    }`}
                                  >
                                    <div className="flex justify-center mb-4">
                                      <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                                        {getFacePreview(face.id)}
                                      </div>
                                    </div>
                                    {/* Rarity tag - top left */}
                                    <div className="absolute top-2 left-2">
                                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border bg-black/80 ${
                                        face.rarity === 'legendary' ? 'border-yellow-400 text-yellow-400' :
                                        face.rarity === 'epic' ? 'border-purple-400 text-purple-400' :
                                        face.rarity === 'rare' ? 'border-blue-400 text-blue-400' :
                                        'border-gray-400 text-gray-400'
                                      }`}>
                                        {face.rarity.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <h4 className="text-white font-semibold text-xl mb-2">{face.name}</h4>
                                      <p className="text-white/60 text-sm mb-3">{face.description}</p>
                                      {equipped && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/90 rounded-full">
                                          <Sparkles className="w-3 h-3 text-white" />
                                          <span className="text-xs font-medium text-white">Equipped</span>
                                        </div>
                                      )}
                                    </div>
                                  </m.div>
                                )
                              })}
                          </div>
                          {cosmeticItems.faces.filter(face => isOwned(face.id)).length === 0 && (
                            <div className="text-center py-12">
                              <Smile className="w-16 h-16 mx-auto mb-4 text-white/30" />
                              <p className="text-white/60 mb-4">You don't own any face expressions yet!</p>
                            </div>
                          )}
                          <div className="text-center mt-8">
                            <m.button
                              onClick={() => router.push('/shop')}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-6 py-3 rounded-lg font-medium"
                            >
                              Visit Shop for Face Expressions
                            </m.button>
                          </div>
                        </div>
                      )}

                      {activeCustomizeTab === 'aura' && (
                        <div className="px-12">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filterByRarity(cosmeticItems.effects
                              .filter(effect => {
                                // Filter for aura items (exclude non-aura effects like stardust-trail)
                                const auraIds = ['none', 'cosmic-aurora', 'stellar-blue', 'mystic-purple', 'emerald-life', 'crimson-flame', 'golden-majesty', 'frost-crystal', 'void-darkness', 'rainbow-prism', 'plasma-storm']
                                return auraIds.includes(effect.id) && (isOwned(effect.id) || effect.alwaysOwned)
                              }))
                              .map((effect) => {
                                const equipped = isEquipped(effect.id, 'aura')
                                
                                return (
                                  <m.div
                                    key={effect.id}
                                    onClick={async () => {
                                      if (!equipped) {
                                        await equipCosmetic(effect.id, 'aura')
                                        setEquipKey(prev => prev + 1)
                                      }
                                    }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.03, ease: "easeOut" }}
                                    className={`relative bg-black/40 border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                                      equipped ? 'border-green-500 bg-green-500/10' : 
                                      `border-${effect.rarity === 'legendary' ? 'yellow' : effect.rarity === 'epic' ? 'purple' : effect.rarity === 'rare' ? 'blue' : 'gray'}-500/50`
                                    }`}
                                  >
                                    <div className="flex justify-center mb-4">
                                      <div className="relative w-16 h-16 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                                        {effect.id === 'none' ? (
                                          <>
                                            <Ban className="w-8 h-8 text-white" />
                                            <div className="absolute -inset-1 border border-gray-400/30 rounded-xl" />
                                          </>
                                        ) : effect.id === 'cosmic-aurora' ? (
                                          <>
                                            <Waves className="w-8 h-8 text-green-400" />
                                            <div className="absolute -inset-1 border border-green-400/40 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-1.5 border border-blue-400/30 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-purple-400/20 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'stellar-blue' ? (
                                          <>
                                            <Star className="w-8 h-8 text-blue-400" />
                                            <div className="absolute -inset-1 border border-blue-400/40 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-cyan-300/25 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'mystic-purple' ? (
                                          <>
                                            <Moon className="w-8 h-8 text-purple-400" />
                                            <div className="absolute -inset-1 border border-purple-500/35 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-indigo-400/22 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'emerald-life' ? (
                                          <>
                                            <Flower className="w-8 h-8 text-emerald-400" />
                                            <div className="absolute -inset-1 border border-emerald-500/38 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-green-400/24 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'crimson-flame' ? (
                                          <>
                                            <Flame className="w-8 h-8 text-red-400" />
                                            <div className="absolute -inset-1 border border-red-500/42 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-orange-400/28 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'golden-majesty' ? (
                                          <>
                                            <Sun className="w-8 h-8 text-yellow-400" />
                                            <div className="absolute -inset-1 border border-yellow-400/45 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-amber-300/30 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'frost-crystal' ? (
                                          <>
                                            <Snowflake className="w-8 h-8 text-cyan-400" />
                                            <div className="absolute -inset-1 border border-cyan-400/40 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-blue-200/25 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'void-darkness' ? (
                                          <>
                                            <Circle className="w-8 h-8 text-gray-400 fill-black" />
                                            <div className="absolute -inset-1 border border-gray-600/50 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-purple-900/35 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'rainbow-prism' ? (
                                          <>
                                            <Gem className="w-8 h-8 text-pink-400" />
                                            <div className="absolute -inset-1 border border-pink-400/35 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-1.5 border border-purple-400/30 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-blue-400/25 rounded-xl animate-pulse" />
                                          </>
                                        ) : effect.id === 'plasma-storm' ? (
                                          <>
                                            <Lightning className="w-8 h-8 text-pink-400" />
                                            <div className="absolute -inset-1 border border-pink-500/40 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-1.5 border border-purple-400/30 rounded-xl animate-pulse" />
                                            <div className="absolute -inset-2 border border-blue-300/20 rounded-xl animate-pulse" />
                                          </>
                                        ) : (
                                          <>
                                            <Circle className="w-8 h-8 text-white" />
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {/* Rarity tag - top left */}
                                    <div className="absolute top-2 left-2">
                                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border bg-black/80 ${
                                        effect.rarity === 'legendary' ? 'border-yellow-400 text-yellow-400' :
                                        effect.rarity === 'epic' ? 'border-purple-400 text-purple-400' :
                                        effect.rarity === 'rare' ? 'border-blue-400 text-blue-400' :
                                        'border-gray-400 text-gray-400'
                                      }`}>
                                        {effect.rarity.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <h4 className="text-white font-semibold text-xl mb-2">{effect.name}</h4>
                                      <p className="text-white/60 text-sm mb-3">{effect.description}</p>
                                      {equipped && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/90 rounded-full">
                                          <Sparkles className="w-3 h-3 text-white" />
                                          <span className="text-xs font-medium text-white">Equipped</span>
                                        </div>
                                      )}
                                    </div>
                                  </m.div>
                                )
                              })}
                          </div>
                          {cosmeticItems.effects.filter(effect => isOwned(effect.id)).length === 0 && (
                            <div className="text-center py-12">
                              <Layers className="w-16 h-16 mx-auto mb-4 text-white/30" />
                              <p className="text-white/60 mb-4">You don't own any aura effects yet!</p>
                            </div>
                          )}
                          <div className="text-center mt-8">
                            <m.button
                              onClick={() => router.push('/shop')}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-6 py-3 rounded-lg font-medium"
                            >
                              Visit Shop for Aura Effects
                            </m.button>
                          </div>
                        </div>
                      )}

                      {activeCustomizeTab === 'title' && (
                        <div className="px-12">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filterByRarity(cosmeticItems.titles
                              .filter(title => isOwned(title.id)))
                              .map((title) => {
                                const equipped = isEquipped(title.id, 'title')
                                
                                return (
                                  <m.div
                                    key={title.id}
                                    onClick={async () => {
                                      if (!equipped) {
                                        await equipCosmetic(title.id, 'title')
                                        setEquipKey(prev => prev + 1)
                                      }
                                    }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.03, ease: "easeOut" }}
                                    className={`relative bg-black/40 border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                                      equipped ? 'border-green-500 bg-green-500/10' : 
                                      `border-${title.rarity === 'legendary' ? 'yellow' : title.rarity === 'epic' ? 'purple' : title.rarity === 'rare' ? 'blue' : 'gray'}-500/50`
                                    }`}
                                  >
                                    <div className="flex justify-center mb-4">
                                      <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                                        <Type className={`w-8 h-8 text-${getAuraSingleColor(equippedAura)}`} />
                                      </div>
                                    </div>
                                    {/* Rarity tag - top left */}
                                    <div className="absolute top-2 left-2">
                                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border bg-black/80 ${
                                        title.rarity === 'legendary' ? 'border-yellow-400 text-yellow-400' :
                                        title.rarity === 'epic' ? 'border-purple-400 text-purple-400' :
                                        title.rarity === 'rare' ? 'border-blue-400 text-blue-400' :
                                        'border-gray-400 text-gray-400'
                                      }`}>
                                        {title.rarity.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <h4 className="text-white font-semibold text-xl mb-2">{title.name}</h4>
                                      <p className="text-white/60 text-sm mb-3">{title.description}</p>
                                      {equipped && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/90 rounded-full">
                                          <Sparkles className="w-3 h-3 text-white" />
                                          <span className="text-xs font-medium text-white">Equipped</span>
                                        </div>
                                      )}
                                    </div>
                                  </m.div>
                                )
                              })}
                          </div>
                          {cosmeticItems.titles.filter(title => isOwned(title.id)).length === 0 && (
                            <div className="text-center py-12">
                              <Type className="w-16 h-16 mx-auto mb-4 text-white/30" />
                              <p className="text-white/60 mb-4">You don't own any custom titles yet!</p>
                            </div>
                          )}
                          <div className="text-center mt-8">
                            <m.button
                              onClick={() => router.push('/shop')}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-6 py-3 rounded-lg font-medium"
                            >
                              Visit Shop for Titles
                            </m.button>
                          </div>
                        </div>
                      )}

                      {activeCustomizeTab === 'crown' && (
                        <div className="px-12">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {/* No Accessory Option */}
                            <m.div
                              key={`no-crown-${!equippedCrown}-${forceUpdate}`}
                              onClick={async () => {
                                // Always unequip any equipped crown when selecting "No Accessory"
                                if (equippedCrown) {
                                  const result = await unequipCosmetic(equippedCrown, 'crown')
                                  console.log('Unequip result:', result)
                                  setEquipKey(prev => prev + 1)
                                } else {
                                  // Force refresh to ensure UI consistency
                                  setEquipKey(prev => prev + 1)
                                }
                              }}
                              whileHover={{ y: -5 }}
                              transition={{ duration: 0.03, ease: "easeOut" }}
                              className={`relative bg-black/40 border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                                !equippedCrown ? 'border-green-500 bg-green-500/10' : 
                                'border-gray-500/50'
                              }`}
                            >
                              <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-gray-600/30 flex items-center justify-center">
                                  <span className="text-2xl">🚫</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <h3 className="text-white font-semibold text-sm">No Accessory</h3>
                                <p className="text-gray-400 text-xs mt-1">Remove equipped accessory</p>
                                <div className="mt-2">
                                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-600/30 text-gray-300">
                                    Default
                                  </span>
                                </div>
                                {!equippedCrown && (
                                  <div className="absolute top-2 right-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </m.div>
                            
                            {filterByRarity(cosmeticItems.crowns
                              .filter(crown => {
                                // Premium crown is owned if user is premium
                                if (crown.id === 'premium-crown') {
                                  return profile?.is_premium === true
                                }
                                return isOwned(crown.id)
                              }))
                              .map((crown) => {
                                const equipped = isEquipped(crown.id, 'crown')
                                
                                return (
                                  <m.div
                                    key={`${crown.id}-${equipped}-${equippedCrown}-${forceUpdate}`}
                                    onClick={async () => {
                                      if (equipped) {
                                        const result = await unequipCosmetic(crown.id, 'crown')
                                        console.log('Unequip result:', result)
                                        setEquipKey(prev => prev + 1)
                                      } else {
                                        const result = await equipCosmetic(crown.id, 'crown')
                                        console.log('Equip result:', result)
                                        setEquipKey(prev => prev + 1)
                                      }
                                    }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.03, ease: "easeOut" }}
                                    className={`relative bg-black/40 border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                                      equipped ? 'border-green-500 bg-green-500/10' : 
                                      'border-yellow-500/50'
                                    }`}
                                  >
                                    <div className="flex justify-center mb-4">
                                      <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                                        <Crown className="w-8 h-8 text-yellow-400" />
                                      </div>
                                    </div>
                                    {/* Rarity tag - top left */}
                                    <div className="absolute top-2 left-2">
                                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border bg-black/80 ${
                                        crown.rarity === 'legendary' ? 'border-yellow-400 text-yellow-400' :
                                        crown.rarity === 'epic' ? 'border-purple-400 text-purple-400' :
                                        crown.rarity === 'rare' ? 'border-blue-400 text-blue-400' :
                                        'border-gray-400 text-gray-400'
                                      }`}>
                                        {crown.rarity.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <h4 className="text-white font-semibold text-xl mb-2">{crown.name}</h4>
                                      <p className="text-white/60 text-sm mb-3">{crown.description}</p>
                                      {equipped && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/90 rounded-full">
                                          <Sparkles className="w-3 h-3 text-white" />
                                          <span className="text-xs font-medium text-white">Click to unequip</span>
                                        </div>
                                      )}
                                    </div>
                                  </m.div>
                                )
                              })}
                          </div>
                          {cosmeticItems.crowns.filter(crown => {
                            if (crown.id === 'premium-crown') {
                              return profile?.is_premium === true
                            }
                            return isOwned(crown.id)
                          }).length === 0 && (
                            <div className="text-center py-12">
                              <Crown className="w-16 h-16 mx-auto mb-4 text-white/30" />
                              <p className="text-white/60 mb-4">You don't own any accessories yet!</p>
                              <p className="text-white/40 text-sm">Visit the shop to purchase amazing accessories for your journey!</p>
                            </div>
                          )}
                        </div>
                      )}
                      </m.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && isOwnProfile && (
                <div className="max-w-6xl mx-auto px-6">
                  <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Profile Info */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              
              {/* Identity Card */}
              <div className="glass-morphism rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white cosmic-heading flex items-center gap-3">
                    <Star className="w-6 h-6 text-cosmic-starlight" />
                    Identity
                  </h2>
                  
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <m.button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-lg border border-cosmic-aurora/30 hover:border-cosmic-aurora/50 text-cosmic-aurora hover:text-white transition-all duration-[30ms]"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </m.button>
                    ) : (
                      <div className="flex gap-2">
                        <m.button
                          onClick={handleCancel}
                          className="px-4 py-2 glass-morphism rounded-lg border border-white/20 hover:border-white/40 text-white/80 hover:text-white transition-all duration-[30ms]"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </m.button>
                        <m.button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`flex items-center gap-2 px-4 py-2 bg-${getAuraSingleColor(equippedAura)}/20 rounded-lg border border-${getAuraSingleColor(equippedAura)}/30 hover:border-${getAuraSingleColor(equippedAura)}/50 text-cosmic-aurora hover:text-white transition-all duration-[30ms] disabled:opacity-50`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isSaving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </m.button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Display Name
                      {isEditing && (
                        <span className="text-xs text-white/50 ml-2">
                          ({formData.display_name.length}/20 chars • {nameChangeInfo.remaining} changes left this week)
                        </span>
                      )}
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={formData.display_name}
                          onChange={(e) => {
                            const value = e.target.value
                            // Only allow valid characters and max 20 length
                            if (value.length <= 20 && /^[a-zA-Z0-9_.\ ]*$/.test(value)) {
                              setFormData({ ...formData, display_name: value })
                            }
                          }}
                          className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-cosmic-aurora/50 focus:outline-none transition-colors duration-[30ms]"
                          placeholder="Enter your display name"
                          maxLength={20}
                        />
                        <p className="text-xs text-white/40 mt-1">
                          Allowed: letters, numbers, spaces, underscores (_) and periods (.)
                        </p>
                        {nameChangeInfo.remaining === 0 && (
                          <p className="text-xs text-red-400 mt-1">
                            No name changes remaining. Resets {nameChangeInfo.nextReset?.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-white/5 rounded-lg text-white font-medium">
                        {profile?.display_name || 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Username
                      {!isPremium && (
                        <span className="text-xs text-cosmic-aurora ml-2">
                          (Premium only)
                        </span>
                      )}
                    </label>
                    {isEditing && isPremium ? (
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          const value = e.target.value
                          // Only allow valid username characters
                          if (/^[a-zA-Z0-9_]*$/.test(value) && value.length <= 20) {
                            setFormData({ ...formData, username: value })
                          }
                        }}
                        className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-cosmic-aurora/50 focus:outline-none transition-colors duration-[30ms]"
                        placeholder="Enter your username"
                        maxLength={20}
                      />
                    ) : isEditing && !isPremium ? (
                      <div className="relative">
                        <div className="px-4 py-3 bg-white/5 rounded-lg text-white/80 font-mono opacity-50">
                          @{profile?.username || 'Not set'}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => router.push('/upgrade')}
                            className="text-cosmic-aurora text-sm font-medium hover:underline"
                          >
                            Upgrade to edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-white/5 rounded-lg text-white/80 font-mono">
                        @{profile?.username || 'Not set'}
                      </div>
                    )}
                  </div>


                  {/* Regenerate Identity */}
                  <div className="pt-4 border-t border-white/10">
                    <m.button
                      onClick={handleRegenerateIdentity}
                      disabled={isRegenerating}
                      className={`flex items-center gap-2 px-4 py-2 glass-morphism rounded-lg border border-${getAuraSingleColor(equippedAura)}/30 hover:border-${getAuraSingleColor(equippedAura)}/50 text-${getAuraSingleColor(equippedAura)} hover:text-white transition-all duration-[30ms] disabled:opacity-50`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isRegenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>{isRegenerating ? 'Regenerating...' : 'Generate New Identity'}</span>
                    </m.button>
                    <p className="text-xs text-white/50 mt-2">
                      This will create a new random name
                    </p>
                  </div>
                </div>
              </div>


              {/* Dangerous Actions */}
              <div className="glass-morphism rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
                <h2 className="text-2xl font-bold text-white cosmic-heading flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  Dangerous Actions
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h3>
                    <p className="text-white/70 text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                      All your progress, achievements, and identity will be lost forever.
                    </p>
                    
                    <m.button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-[30ms]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </m.button>
                  </div>
                </div>
              </div>

            </m.div>

            {/* Right Column - Account Info */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              

              {/* Account Info */}
              <div className="glass-morphism rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white cosmic-heading mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cosmic-aurora" />
                  Account
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Email</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Member Since</span>
                    <span className="text-white">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">User ID</span>
                    <span className="text-white/80 font-mono text-xs">
                      {user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Profile ID</span>
                    <span className="text-white/80 font-mono text-xs">
                      {profile?.profile_id || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

            </m.div>
                  </div>
                </div>
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-950/90 border border-red-500/20 rounded-2xl p-8 max-w-md w-full backdrop-blur-lg"
          >
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Delete Account</h2>
              <p className="text-white/70">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            {deleteStep === 'confirm' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Type your email to confirm: {user?.email}
                  </label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/20 rounded-lg text-white placeholder-white/50 focus:border-red-500/50 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="flex gap-3">
                  <m.button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteStep('confirm')
                      setDeleteEmail('')
                      setDeletePassword('')
                      setDeleteConfirmText('')
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </m.button>
                  
                  <m.button
                    onClick={handleDeleteRequest}
                    disabled={isDeleting || deleteEmail !== user?.email}
                    className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>Next Step</span>
                  </m.button>
                </div>
              </div>
            )}

            {deleteStep === 'password-verify' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Enter your password to verify your identity
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/20 rounded-lg text-white placeholder-white/50 focus:border-red-500/50 focus:outline-none"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex gap-3">
                  <m.button
                    onClick={() => setDeleteStep('confirm')}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </m.button>
                  
                  <m.button
                    onClick={handlePasswordVerify}
                    disabled={isDeleting || !deletePassword}
                    className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    <span>{isDeleting ? 'Verifying...' : 'Verify Password'}</span>
                  </m.button>
                </div>
              </div>
            )}

            {deleteStep === 'final-confirm' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <h3 className="text-red-400 font-semibold mb-2">Final Warning</h3>
                  <p className="text-white/70 text-sm mb-3">
                    This is your last chance to cancel. Once deleted, your account and all data cannot be recovered.
                  </p>
                  <p className="text-red-400 text-sm font-medium">
                    Type "DELETE MY ACCOUNT" to confirm:
                  </p>
                </div>

                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/20 rounded-lg text-white placeholder-white/50 focus:border-red-500/50 focus:outline-none font-mono"
                  placeholder="DELETE MY ACCOUNT"
                />

                <div className="flex gap-3">
                  <m.button
                    onClick={() => setDeleteStep('password-verify')}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </m.button>
                  
                  <m.button
                    onClick={handleFinalDelete}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                    className="flex-1 px-4 py-3 bg-red-600/40 border border-red-500/50 rounded-lg text-red-300 hover:bg-red-600/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>{isDeleting ? 'Deleting...' : 'DELETE FOREVER'}</span>
                  </m.button>
                </div>
              </div>
            )}


            {deleteStep === 'deleting' && (
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-red-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-white mb-2">Deleting Account...</h3>
                <p className="text-white/70 text-sm">
                  Please wait while we permanently delete your account and all associated data.
                </p>
              </div>
            )}
          </m.div>
        </div>
      )}
      
      {/* Add Friend Modal */}
      {showFriendSearch && (
        <AddFriend onClose={() => setShowFriendSearch(false)} />
      )}
    </div>
  )
}

export default function ProfileSettings() {
  return (
    <ProtectedRoute>
      <ProfileSettingsContent />
    </ProtectedRoute>
  )
}
