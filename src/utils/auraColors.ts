export const auraColorMap = {
  'cosmic-aurora': { 
    from: 'from-emerald-400', 
    via: 'via-green-300', 
    to: 'to-purple-400',
    single: 'cosmic-aurora'
  },
  'stellar-blue': { 
    from: 'from-blue-500', 
    via: 'via-cyan-400', 
    to: 'to-blue-600',
    single: 'blue-500'
  },
  'mystic-purple': { 
    from: 'from-purple-600', 
    via: 'via-cosmic-plasma', 
    to: 'to-indigo-600',
    single: 'purple-600'
  },
  'emerald-life': { 
    from: 'from-emerald-500', 
    via: 'via-green-400', 
    to: 'to-teal-500',
    single: 'emerald-500'
  },
  'crimson-flame': { 
    from: 'from-red-600', 
    via: 'via-orange-500', 
    to: 'to-red-500',
    single: 'red-600'
  },
  'golden-majesty': { 
    from: 'from-yellow-500', 
    via: 'via-cosmic-stardust', 
    to: 'to-amber-500',
    single: 'yellow-500'
  },
  'frost-crystal': { 
    from: 'from-cyan-400', 
    via: 'via-blue-300', 
    to: 'to-cyan-500',
    single: 'cyan-400'
  },
  'void-darkness': { 
    from: 'from-gray-900', 
    via: 'via-purple-900', 
    to: 'to-black',
    single: 'gray-900'
  },
  'rainbow-prism': { 
    from: 'from-pink-500', 
    via: 'via-purple-500', 
    to: 'to-indigo-500',
    single: 'pink-500'
  },
  'plasma-storm': { 
    from: 'from-pink-600', 
    via: 'via-cosmic-plasma', 
    to: 'to-purple-600',
    single: 'pink-600'
  }
} as const

export type AuraName = keyof typeof auraColorMap

export function getAuraGradientColors(auraName: string | null) {
  if (!auraName || !(auraName in auraColorMap)) {
    return auraColorMap['cosmic-aurora']
  }
  return auraColorMap[auraName as AuraName]
}

export function getAuraSingleColor(auraName: string | null) {
  if (!auraName || !(auraName in auraColorMap)) {
    return 'cosmic-aurora'
  }
  return auraColorMap[auraName as AuraName].single
}

// Get reduced opacity gradient colors for backgrounds
export function getAuraGradientColorsReduced(auraName: string | null) {
  const colors = getAuraGradientColors(auraName)
  // Map full opacity colors to reduced opacity versions
  const reducedMap: Record<string, string> = {
    'from-emerald-400': 'from-emerald-400/20',
    'from-blue-500': 'from-blue-500/20',
    'from-purple-600': 'from-purple-600/20',
    'from-emerald-500': 'from-emerald-500/20',
    'from-red-600': 'from-red-600/20',
    'from-yellow-500': 'from-yellow-500/20',
    'from-cyan-400': 'from-cyan-400/20',
    'from-gray-900': 'from-gray-900/30',
    'from-pink-500': 'from-pink-500/20',
    'from-pink-600': 'from-pink-600/20',
    'via-green-300': 'via-green-300/20',
    'via-cyan-400': 'via-cyan-400/20',
    'via-cosmic-plasma': 'via-purple-500/20',
    'via-green-400': 'via-green-400/20',
    'via-orange-500': 'via-orange-500/20',
    'via-cosmic-stardust': 'via-yellow-400/20',
    'via-blue-300': 'via-blue-300/20',
    'via-purple-900': 'via-purple-900/30',
    'via-purple-500': 'via-purple-500/20',
    'to-purple-400': 'to-purple-400/20',
    'to-blue-600': 'to-blue-600/20',
    'to-indigo-600': 'to-indigo-600/20',
    'to-teal-500': 'to-teal-500/20',
    'to-red-500': 'to-red-500/20',
    'to-amber-500': 'to-amber-500/20',
    'to-cyan-500': 'to-cyan-500/20',
    'to-black': 'to-black/30',
    'to-indigo-500': 'to-indigo-500/20',
    'to-purple-600': 'to-purple-600/20'
  }
  
  return {
    from: reducedMap[colors.from] || colors.from,
    via: reducedMap[colors.via] || colors.via,
    to: reducedMap[colors.to] || colors.to,
    single: colors.single
  }
}