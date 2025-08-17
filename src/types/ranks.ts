export interface Rank {
  id: string
  name: string
  title: string
  description: string
  icon: string
  color: string
  gradient: string
  glowColor: string
  requiredStardust: number
  order: number
  philosophy?: string
  unlockMessage: string
}

export const RANK_HIERARCHY: Rank[] = [
  {
    id: 'sand',
    name: 'Sand',
    title: 'Grain of Sand',
    description: 'The ancient foundation that spearheads the journey. We\'re all sand in the cosmic ocean.',
    icon: '⋅',
    color: 'text-amber-300',
    gradient: 'from-amber-400 to-yellow-600',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    requiredStardust: 0,
    order: 1,
    philosophy: 'Every great structure begins with a single grain. Your journey starts here, humble yet infinite in potential.',
    unlockMessage: 'You begin as a grain of sand in the cosmic ocean. Your potential is infinite.'
  },
  {
    id: 'stone',
    name: 'Stone',
    title: 'Foundation Stone',
    description: 'You\'ve solidified your understanding. SOLID now, but still—the definition of average.',
    icon: '🪨',
    color: 'text-stone-400',
    gradient: 'from-stone-400 to-gray-600',
    glowColor: 'rgba(168, 162, 158, 0.3)',
    requiredStardust: 500,
    order: 2,
    philosophy: 'Stability emerges from chaos. You are no longer shifting—you have found your ground.',
    unlockMessage: 'Your understanding has solidified. You are no longer drifting.'
  },
  {
    id: 'iron',
    name: 'Iron',
    title: 'Iron Will',
    description: 'Now you\'re getting somewhere. Metal as hell.',
    icon: '⚔️',
    color: 'text-slate-300',
    gradient: 'from-slate-400 to-zinc-600',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    requiredStardust: 1500,
    order: 3,
    philosophy: 'Forged in fire, tempered by challenge. Your resolve has become unbreakable.',
    unlockMessage: 'Your will has been forged in the fires of learning. You are metal as hell.'
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    title: 'Obsidian Edge',
    description: 'Rough around the edges, but sleek—and sharp.',
    icon: '🔪',
    color: 'text-slate-800',
    gradient: 'from-slate-700 to-black',
    glowColor: 'rgba(15, 23, 42, 0.4)',
    requiredStardust: 3500,
    order: 4,
    philosophy: 'Born from volcanic truth, polished by pressure. Your insights cut through illusion.',
    unlockMessage: 'Your mind has become volcanic glass—sharp, dark, and beautiful.'
  },
  {
    id: 'marble',
    name: 'Marble',
    title: 'Marble Philosopher',
    description: 'You\'re balling with Socrates and Plato. The tipping point from education to reformulating YOU.',
    icon: '🏛️',
    color: 'text-white',
    gradient: 'from-white to-gray-200',
    glowColor: 'rgba(255, 255, 255, 0.4)',
    requiredStardust: 7500,
    order: 5,
    philosophy: 'Carved by masters, polished by wisdom. You now balance learning with self-transformation.',
    unlockMessage: 'You have joined the ranks of the great philosophers. Wisdom flows through you like veins of gold.'
  },
  {
    id: 'gemstone',
    name: 'Gemstone',
    title: 'Chosen Gemstone',
    description: 'Pick your identity. You\'ve earned it.',
    icon: '💎',
    color: 'text-purple-400',
    gradient: 'from-purple-400 to-pink-600',
    glowColor: 'rgba(196, 181, 253, 0.4)',
    requiredStardust: 15000,
    order: 6,
    philosophy: 'Pressure has transformed you into something precious. Your uniqueness shines with inner light.',
    unlockMessage: 'You have become a precious gem, forged under pressure into something uniquely beautiful.'
  },
  {
    id: 'meteor',
    name: 'Meteor',
    title: 'Wish-Bearer',
    description: 'People make wishes for you! The first step to extraplanetary learning.',
    icon: '☄️',
    color: 'text-orange-400',
    gradient: 'from-orange-400 to-red-600',
    glowColor: 'rgba(251, 146, 60, 0.4)',
    requiredStardust: 30000,
    order: 7,
    philosophy: 'Traveling between worlds, carrying hopes. You inspire others through your journey.',
    unlockMessage: 'You blaze across the sky of knowledge. Others make wishes upon your light.'
  },
  {
    id: 'star',
    name: 'Star',
    title: 'Illuminating Star',
    description: 'You\'re shining. Illuminating the path forwards. You share knowledge and spearhead research.',
    icon: '⭐',
    color: 'text-yellow-300',
    gradient: 'from-yellow-300 to-orange-500',
    glowColor: 'rgba(253, 224, 71, 0.4)',
    requiredStardust: 60000,
    order: 8,
    philosophy: 'Nuclear fusion of knowledge creates light. You illuminate the path for others.',
    unlockMessage: 'You have become a star, generating light through the fusion of knowledge.'
  },
  {
    id: 'red-giant',
    name: 'Red Giant',
    title: 'Expanded Mind',
    description: 'You\'ve expanded beyond your original boundaries. Your understanding encompasses vast territories.',
    icon: '🔴',
    color: 'text-red-400',
    gradient: 'from-red-400 to-orange-600',
    glowColor: 'rgba(248, 113, 113, 0.4)',
    requiredStardust: 120000,
    order: 9,
    philosophy: 'Expansion through maturity. Your wisdom has grown vast, encompassing distant realms.',
    unlockMessage: 'Your mind has expanded beyond its original boundaries, encompassing vast territories of knowledge.'
  },
  {
    id: 'blue-giant',
    name: 'Blue Giant',
    title: 'Intense Luminary',
    description: 'Intensity defines you. Your energy output is tremendous, visible across vast intellectual distances.',
    icon: '🔵',
    color: 'text-blue-400',
    gradient: 'from-blue-400 to-indigo-600',
    glowColor: 'rgba(96, 165, 250, 0.4)',
    requiredStardust: 250000,
    order: 10,
    philosophy: 'Maximum luminosity through intensity. Your insights burn hot and bright.',
    unlockMessage: 'Your intellectual fire burns with blue intensity, a beacon visible across vast distances.'
  },
  {
    id: 'supernova',
    name: 'Supernova',
    title: 'Critical Mass',
    description: 'Critical mass achieved. Your old frameworks have collapsed, releasing tremendous energy and insight.',
    icon: '💥',
    color: 'text-white',
    gradient: 'from-white via-yellow-200 to-orange-400',
    glowColor: 'rgba(255, 255, 255, 0.6)',
    requiredStardust: 500000,
    order: 11,
    philosophy: 'Destruction births creation. Your collapse has released more energy than seemed possible.',
    unlockMessage: 'Critical mass achieved. Your transformation illuminates the entire cosmos.'
  },
  {
    id: 'white-dwarf',
    name: 'White Dwarf',
    title: 'Diamond Clarity',
    description: 'After explosive expansion, new density emerges. Knowledge compressed to diamond-hard clarity.',
    icon: '⚪',
    color: 'text-gray-100',
    gradient: 'from-gray-100 to-blue-200',
    glowColor: 'rgba(243, 244, 246, 0.5)',
    requiredStardust: 1000000,
    order: 12,
    philosophy: 'Ultimate compression. What once took volumes now fits in a single perfect statement.',
    unlockMessage: 'Your knowledge has achieved diamond density. Clarity beyond imagination.'
  },
  {
    id: 'neutron-star',
    name: 'Neutron Star',
    title: 'Ultimate Density',
    description: 'The space between thoughts has collapsed. A teaspoon of your insight weighs more than mountains.',
    icon: '⚫',
    color: 'text-purple-300',
    gradient: 'from-purple-300 via-blue-400 to-indigo-600',
    glowColor: 'rgba(196, 181, 253, 0.6)',
    requiredStardust: 2000000,
    order: 13,
    philosophy: 'Transcendence of normal limits. You operate under laws that seem impossible to others.',
    unlockMessage: 'Ultimate compression achieved. Your understanding operates beyond normal laws.'
  },
  {
    id: 'singularity',
    name: 'Singularity',
    title: 'Holder of Spacetime',
    description: 'Holding down spacetime. Bravo.',
    icon: '🌌',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
    gradient: 'from-purple-400 via-pink-500 to-red-500',
    glowColor: 'rgba(168, 85, 247, 0.8)',
    requiredStardust: 5000000,
    order: 14,
    philosophy: 'The point where all understanding converges. You have become the cosmos itself.',
    unlockMessage: 'You have achieved Singularity. Reality bends around your understanding. Bravo.'
  }
]

export function getRankByStardust(stardust: number): Rank {
  // Find the highest rank the user has achieved
  let currentRank = RANK_HIERARCHY[0]
  
  for (const rank of RANK_HIERARCHY) {
    if (stardust >= rank.requiredStardust) {
      currentRank = rank
    } else {
      break
    }
  }
  
  return currentRank
}

export function getNextRank(currentRank: Rank): Rank | null {
  const currentIndex = RANK_HIERARCHY.findIndex(rank => rank.id === currentRank.id)
  if (currentIndex === -1 || currentIndex === RANK_HIERARCHY.length - 1) {
    return null
  }
  return RANK_HIERARCHY[currentIndex + 1]
}

export function getProgressToNextRank(stardust: number): { 
  current: Rank
  next: Rank | null
  progress: number
  remaining: number
} {
  const current = getRankByStardust(stardust)
  const next = getNextRank(current)
  
  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      remaining: 0
    }
  }
  
  const progressInCurrentRank = stardust - current.requiredStardust
  const stardustNeededForNext = next.requiredStardust - current.requiredStardust
  const progress = Math.min(100, (progressInCurrentRank / stardustNeededForNext) * 100)
  const remaining = next.requiredStardust - stardust
  
  return {
    current,
    next,
    progress,
    remaining
  }
}