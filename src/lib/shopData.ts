import React from 'react'
import { Circle, Crown, Diamond, Shield, Lock, Star, Smile } from 'lucide-react'

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: 'singularity' | 'faces' | 'auras' | 'titles' | 'treasures' | 'crowns'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon?: React.ReactNode
  preview?: React.ReactNode
  owned?: boolean
  equipped?: boolean
  locked?: boolean
  unlockCondition?: string
}

export const shopItems: ShopItem[] = [
  // Singularity Styles (Avatar Dots + Node Styles combined)
  {
    id: 'classic-singularity',
    name: 'Classic Singularity',
    description: 'Pure, timeless design. Your avatar and all nodes appear as simple, elegant dots.',
    price: 0,
    category: 'singularity',
    rarity: 'common',
    preview: null, // Will be rendered dynamically
    owned: true,
    equipped: true
  },
  {
    id: 'cosmic-glow',
    name: 'Cosmic Glow',
    description: 'Deep space energy radiates from within. Pulsing with the heartbeat of the universe.',
    price: 150,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'stellar-core',
    name: 'Stellar Core',
    description: 'Radiates stellar power. Your avatar and nodes glow with the intensity of a thousand stars.',
    price: 300,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'void-essence',
    name: 'Void Essence',
    description: 'Mysterious dark singularity. Your avatar and nodes bend light itself with purple void energy.',
    price: 500,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'golden-majesty',
    name: 'Golden Majesty',
    description: 'Pure golden radiance. Transform your avatar and all nodes into gleaming celestial gold.',
    price: 400,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'crystal-essence',
    name: 'Crystal Essence',
    description: 'Crystalline perfection. Your avatar and nodes become crystalline structures that refract cosmic light.',
    price: 600,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'plasma-core',
    name: 'Plasma Core',
    description: 'Chaotic plasma energy. Your avatar and nodes vibrate with unstable cosmic force.',
    price: 800,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'aurora',
    name: 'Borealis Crown',
    description: 'Dancing northern lights. Your avatar and nodes shimmer with shifting aurora colors.',
    price: 350,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'lightning',
    name: 'Voltaic Surge',
    description: 'Electric storm energy. Your avatar and nodes crackle with pure electrical power.',
    price: 450,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'flame',
    name: 'Infernal Heart',
    description: 'Eternal fire burns within. Your avatar and nodes flicker with living flame.',
    price: 400,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'frost',
    name: 'Arctic Reverie',
    description: 'Crystalline ice energy. Your avatar and nodes emanate cold, sharp beauty.',
    price: 250,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'grass',
    name: 'Verdant Pulse',
    description: 'Living nature energy. Your avatar and nodes pulse with the growth of life.',
    price: 200,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'wind',
    name: 'Zephyr Drift',
    description: 'Flowing air currents. Your avatar and nodes drift with ethereal grace.',
    price: 300,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'sand',
    name: 'Mirage Veil',
    description: 'Desert essence flows. Your avatar and nodes shift like dunes in the wind.',
    price: 180,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'stone',
    name: 'Titan\'s Embrace',
    description: 'Ancient rock strength. Your avatar and nodes stand immovable and eternal.',
    price: 220,
    category: 'singularity',
    rarity: 'common',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'leaf',
    name: 'Sylvan Echo',
    description: 'Forest whispers. Your avatar and nodes rustle with ancient woodland magic.',
    price: 280,
    category: 'singularity',
    rarity: 'rare',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },

  // Epic New Singularity Styles
  {
    id: 'quantum-nexus',
    name: 'Quantum Nexus',
    description: 'Reality fractures around this impossible geometry. Exists in multiple dimensions simultaneously.',
    price: 750,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'temporal-vortex',
    name: 'Temporal Vortex',
    description: 'Time spirals endlessly around this chronomorphic singularity. Past and future converge.',
    price: 950,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'cosmic-forge',
    name: 'Cosmic Forge',
    description: 'Where stars are born and galaxies are shaped. The fundamental force of creation itself.',
    price: 850,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'shadow-monarch',
    name: 'Shadow Monarch',
    description: 'Absolute darkness given form. Light bends away, reality kneels before the void sovereign.',
    price: 1200,
    category: 'singularity',
    rarity: 'legendary',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'prism-matrix',
    name: 'Prism Matrix',
    description: 'Pure light fractalized into infinite geometries. Every photon tells a different story.',
    price: 680,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },
  {
    id: 'nebula-heart',
    name: 'Nebula Heart',
    description: 'The beating core of a stellar nursery. Where cosmic dust dances into new worlds.',
    price: 420,
    category: 'singularity',
    rarity: 'epic',
    locked: true,
    unlockCondition: 'Premium membership required',
    preview: null
  },

  // Face Cosmetics
  {
    id: 'happy-face',
    name: 'Happy Face',
    description: 'A cheerful expression that radiates positivity.',
    price: 100,
    category: 'faces',
    rarity: 'common',
    preview: null
  },
  {
    id: 'cool-face',
    name: 'Cool Face',
    description: 'Too cool for the cosmic school.',
    price: 150,
    category: 'faces',
    rarity: 'rare',
    preview: null
  },
  {
    id: 'starry-eyes',
    name: 'Starry Eyes',
    description: 'Eyes filled with cosmic wonder.',
    price: 200,
    category: 'faces',
    rarity: 'rare',
    preview: null
  },
  {
    id: 'winking-face',
    name: 'Winking Face',
    description: 'A playful wink for your cosmic adventures.',
    price: 120,
    category: 'faces',
    rarity: 'common',
    preview: null
  },
  {
    id: 'thinking-face',
    name: 'Thinking Face',
    description: 'For when you\'re pondering the mysteries of the universe.',
    price: 180,
    category: 'faces',
    rarity: 'rare',
    preview: null
  },
  {
    id: 'cosmic-face',
    name: 'Cosmic Face',
    description: 'A face touched by the stars themselves.',
    price: 500,
    category: 'faces',
    rarity: 'legendary',
    preview: null
  },

  // Aura System
  {
    id: 'none',
    name: 'No Aura',
    description: 'Clean and minimal appearance with no aura effects.',
    price: 0,
    category: 'auras',
    rarity: 'common',
    preview: null,
    owned: true
  },
  {
    id: 'cosmic-aurora',
    name: 'Cosmic Aurora',
    description: 'Classic orange cosmic glow that pulses with universal energy.',
    price: 50,
    category: 'auras',
    rarity: 'common',
    preview: null
  },
  {
    id: 'stellar-blue',
    name: 'Stellar Blue',
    description: 'Deep blue stellar energy that resonates with distant stars.',
    price: 150,
    category: 'auras',
    rarity: 'rare',
    preview: null
  },
  {
    id: 'mystic-purple',
    name: 'Mystic Purple',
    description: 'Mysterious purple void energy from the cosmic depths.',
    price: 300,
    category: 'auras',
    rarity: 'epic',
    preview: null
  },
  {
    id: 'emerald-life',
    name: 'Emerald Life',
    description: 'Vibrant green life force that pulses with natural energy.',
    price: 200,
    category: 'auras',
    rarity: 'rare',
    preview: null
  },
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    description: 'Fiery red burning energy that flickers with intense heat.',
    price: 350,
    category: 'auras',
    rarity: 'epic',
    preview: null
  },
  {
    id: 'golden-majesty',
    name: 'Golden Majesty',
    description: 'Royal golden radiance that shines with divine light.',
    price: 600,
    category: 'auras',
    rarity: 'legendary',
    preview: null
  },
  {
    id: 'frost-crystal',
    name: 'Frost Crystal',
    description: 'Icy crystalline aura that sparkles with frozen beauty.',
    price: 250,
    category: 'auras',
    rarity: 'rare',
    preview: null
  },
  {
    id: 'void-darkness',
    name: 'Void Darkness',
    description: 'Dark matter distortion field that bends reality itself.',
    price: 800,
    category: 'auras',
    rarity: 'legendary',
    preview: null
  },
  {
    id: 'rainbow-prism',
    name: 'Rainbow Prism',
    description: 'Prismatic light spectrum that cycles through rainbow colors.',
    price: 1000,
    category: 'auras',
    rarity: 'legendary',
    preview: null
  },
  {
    id: 'plasma-storm',
    name: 'Plasma Storm',
    description: 'Chaotic electrical energy that crackles with unstable power.',
    price: 1200,
    category: 'auras',
    rarity: 'legendary',
    preview: null
  },

  // Crowns/Accessories
  {
    id: 'hard-hat',
    name: 'Hard Hat',
    description: 'Safety first! A sturdy construction helmet for cosmic builders.',
    price: 150,
    category: 'crowns',
    rarity: 'common',
    preview: null
  },

  // Titles
  {
    id: 'null-seeker',
    name: 'Null Seeker',
    description: 'For those who understand the void.',
    price: 75,
    category: 'titles',
    rarity: 'common',
    icon: <Circle className="w-5 h-5" />
  },
  {
    id: 'systems-sage',
    name: 'Systems Sage',
    description: 'Master of interconnected knowledge.',
    price: 200,
    category: 'titles',
    rarity: 'rare',
    icon: <Crown className="w-5 h-5" />
  },
  {
    id: 'cosmic-architect',
    name: 'Cosmic Architect',
    description: 'Builder of universal understanding.',
    price: 500,
    category: 'titles',
    rarity: 'legendary',
    icon: <Diamond className="w-5 h-5" />
  },

  // Treasures (special earned items)
  {
    id: 'aegis-exo',
    name: '⚙️ Aegis Exo',
    description: 'The Soul of Armor. This is not for battle. This is for standing where you once fled.',
    price: 0,
    category: 'treasures',
    rarity: 'legendary',
    icon: <Shield className="w-5 h-5" />,
    locked: true,
    unlockCondition: 'Complete 7 consecutive days of learning'
  }
]

export const featuredItemIds = ['flame', 'lightning', 'plasma-core', 'void-essence']

export const rarityColors = {
  common: 'border-gray-400 text-gray-400',
  rare: 'border-blue-400 text-blue-400', 
  epic: 'border-purple-400 text-purple-400',
  legendary: 'border-yellow-400 text-yellow-400'
}