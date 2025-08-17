export interface MassState {
  stardust: number
  mass: number
  velocity: number
  gravitationalPull: number
  orbitalBodies: OrbitalBody[]
  rank: string
  evolutionStage: EvolutionStage
}

export interface OrbitalBody {
  id: string
  type: 'concept' | 'memory' | 'skill' | 'wisp'
  mass: number
  angle: number
  distance: number
  velocity: number
  color: string
  name: string
  acquired: Date
}

export interface EvolutionStage {
  current: string
  next?: string
  progressToNext: number
  visualEffects: {
    glow: string
    particles: string[]
    aura: string
  }
}

export interface MassGrowthEvent {
  type: 'absorption' | 'orbital_capture' | 'fusion' | 'fission' | 'decay'
  amount: number
  source: string
  timestamp: Date
  effects: {
    massChange: number
    stardustGain: number
    newOrbitals?: OrbitalBody[]
    visualEffects: string[]
  }
}

export interface WanderingWisp {
  id: string
  challengeId: string
  challengeName: string
  failureReason: string
  mass: number
  position: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
  opacity: number
  age: number // in milliseconds
  maxAge: number // 24 hours in milliseconds
  whispers: string[]
  currentWhisper: number
  lastWhisperTime: number
  isHovered: boolean
  pulseIntensity: number
}

// Constants for the mass system
export const MASS_CONSTANTS = {
  ABSORPTION_EFFICIENCY: 0.8, // 80% of absorbed mass is retained
  ORBITAL_THRESHOLD: 50, // Minimum mass to capture orbital bodies
  FUSION_THRESHOLD: 1000, // Mass required for fusion events
  GRAVITATIONAL_CONSTANT: 0.001,
  BASE_VELOCITY: 100,
  WISP_SPAWN_CHANCE: 0.3, // 30% chance to spawn wisp on failure
  WISP_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  WISP_FADE_START: 20 * 60 * 60 * 1000, // Start fading after 20 hours
} as const

// Whispers that wisps speak when hovered
export const WISP_WHISPERS = [
  "You left me hanging...",
  "I could have been your breakthrough...",
  "The answer was right there...",
  "We were so close to understanding...",
  "Don't abandon what you started...",
  "I hold the key you missed...",
  "Your curiosity brought me here...",
  "I'm fading, but not forgotten...",
  "The cosmos remembers our attempt...",
  "Try again before I become stardust...",
  "I whisper the solution in silence...",
  "Your knowledge needs me to complete it...",
  "I float here, waiting for redemption...",
  "We could have been magnificent together...",
  "The void calls, but I resist for you..."
] as const

export const MASS_EVOLUTION_STAGES: Record<string, EvolutionStage> = {
  grain: {
    current: 'Sand',
    next: 'Dust Cloud', 
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(233, 69, 96, 0.3)',
      particles: ['sparkle'],
      aura: 'faint'
    }
  },
  dust: {
    current: 'Dust Cloud',
    next: 'Planetesimal',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(233, 69, 96, 0.5)',
      particles: ['sparkle', 'drift'],
      aura: 'soft'
    }
  },
  planetesimal: {
    current: 'Planetesimal',
    next: 'Proto-Planet',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(233, 69, 96, 0.7)',
      particles: ['sparkle', 'drift', 'orbit'],
      aura: 'moderate'
    }
  },
  planet: {
    current: 'Proto-Planet',
    next: 'Gas Giant',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(52, 152, 219, 0.6)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere'],
      aura: 'strong'
    }
  },
  giant: {
    current: 'Gas Giant',
    next: 'Brown Dwarf',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(155, 89, 182, 0.8)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm'],
      aura: 'intense'
    }
  },
  dwarf: {
    current: 'Brown Dwarf',
    next: 'Red Dwarf Star',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(231, 76, 60, 0.9)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion'],
      aura: 'blazing'
    }
  },
  star: {
    current: 'Red Dwarf Star',
    next: 'Main Sequence Star',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(241, 196, 15, 1.0)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare'],
      aura: 'stellar'
    }
  },
  mainSequence: {
    current: 'Main Sequence Star',
    next: 'Red Giant',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(255, 255, 255, 1.0)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare', 'corona'],
      aura: 'radiant'
    }
  },
  redGiant: {
    current: 'Red Giant',
    next: 'Supergiant',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(231, 76, 60, 1.2)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare', 'corona', 'ejection'],
      aura: 'enormous'
    }
  },
  supergiant: {
    current: 'Supergiant',
    next: 'Supernova',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(52, 152, 219, 1.5)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare', 'corona', 'ejection', 'instability'],
      aura: 'unstable'
    }
  },
  supernova: {
    current: 'Supernova',
    next: 'Neutron Star',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(255, 255, 255, 2.0)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare', 'corona', 'ejection', 'instability', 'explosion'],
      aura: 'cataclysmic'
    }
  },
  neutron: {
    current: 'Neutron Star',
    next: 'Black Hole',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(138, 43, 226, 1.8)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare', 'corona', 'ejection', 'instability', 'explosion', 'pulsar'],
      aura: 'exotic'
    }
  },
  blackhole: {
    current: 'Black Hole',
    next: 'Singularity',
    progressToNext: 0,
    visualEffects: {
      glow: 'rgba(0, 0, 0, 0.9)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare', 'corona', 'ejection', 'instability', 'explosion', 'pulsar', 'accretion'],
      aura: 'gravitational'
    }
  },
  singularity: {
    current: 'Singularity',
    progressToNext: 100,
    visualEffects: {
      glow: 'rgba(255, 215, 0, 3.0)',
      particles: ['sparkle', 'drift', 'orbit', 'atmosphere', 'storm', 'fusion', 'flare', 'corona', 'ejection', 'instability', 'explosion', 'pulsar', 'accretion', 'reality'],
      aura: 'transcendent'
    }
  }
} as const