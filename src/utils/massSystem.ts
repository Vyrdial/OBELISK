import { 
  MassState, 
  OrbitalBody, 
  MassGrowthEvent, 
  WanderingWisp, 
  MASS_CONSTANTS, 
  WISP_WHISPERS,
  MASS_EVOLUTION_STAGES 
} from '@/types/mass'
import { getRankByStardust } from '@/types/ranks'

export class MassSystem {
  static calculateMassFromStardust(stardust: number): number {
    // Logarithmic growth similar to Agar.io
    return Math.sqrt(stardust * 0.1) + 10
  }

  static calculateVelocity(mass: number): number {
    // Heavier objects move slower (inverse relationship)
    return MASS_CONSTANTS.BASE_VELOCITY / Math.sqrt(mass * 0.1 + 1)
  }

  static calculateGravitationalPull(mass: number): number {
    // Gravitational pull increases with mass
    return mass * MASS_CONSTANTS.GRAVITATIONAL_CONSTANT
  }

  static getEvolutionStage(mass: number): string {
    if (mass < 50) return 'grain'
    if (mass < 150) return 'dust'
    if (mass < 400) return 'planetesimal'
    if (mass < 1000) return 'planet'
    if (mass < 2500) return 'giant'
    if (mass < 6000) return 'dwarf'
    if (mass < 15000) return 'star'
    if (mass < 35000) return 'mainSequence'
    if (mass < 75000) return 'redGiant'
    if (mass < 150000) return 'supergiant'
    if (mass < 300000) return 'supernova'
    if (mass < 600000) return 'neutron'
    if (mass < 1000000) return 'blackhole'
    return 'singularity'
  }

  static updateMassState(currentState: MassState, stardustGain: number): MassState {
    const newStardust = currentState.stardust + stardustGain
    const newMass = this.calculateMassFromStardust(newStardust)
    const newVelocity = this.calculateVelocity(newMass)
    const newGravitationalPull = this.calculateGravitationalPull(newMass)
    const newEvolutionStage = this.getEvolutionStage(newMass)
    const rank = getRankByStardust(newStardust)

    // Update orbital bodies based on new gravitational pull
    const updatedOrbitals = this.updateOrbitalBodies(currentState.orbitalBodies, newGravitationalPull)

    return {
      ...currentState,
      stardust: newStardust,
      mass: newMass,
      velocity: newVelocity,
      gravitationalPull: newGravitationalPull,
      orbitalBodies: updatedOrbitals,
      rank: rank.id,
      evolutionStage: {
        ...MASS_EVOLUTION_STAGES[newEvolutionStage],
        progressToNext: this.calculateProgressToNext(newMass, newEvolutionStage)
      }
    }
  }

  static calculateProgressToNext(mass: number, currentStage: string): number {
    const stageThresholds = [50, 150, 400, 1000, 2500, 6000, 15000, 35000, 75000, 150000, 300000, 600000, 1000000]
    const currentIndex = Object.keys(MASS_EVOLUTION_STAGES).indexOf(currentStage)
    
    if (currentIndex === -1 || currentIndex >= stageThresholds.length - 1) return 100
    
    const currentThreshold = stageThresholds[currentIndex]
    const nextThreshold = stageThresholds[currentIndex + 1]
    
    const progress = ((mass - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  static updateOrbitalBodies(orbitals: OrbitalBody[], gravitationalPull: number): OrbitalBody[] {
    return orbitals.map(orbital => ({
      ...orbital,
      angle: (orbital.angle + orbital.velocity) % 360,
      distance: Math.max(50, orbital.distance - gravitationalPull * 0.01), // Slowly draw closer
      velocity: orbital.velocity + (gravitationalPull * 0.001) // Slight acceleration
    }))
  }

  static addOrbitalBody(currentState: MassState, body: Omit<OrbitalBody, 'id' | 'acquired'>): MassState {
    if (currentState.gravitationalPull < MASS_CONSTANTS.ORBITAL_THRESHOLD) {
      return currentState // Not massive enough to capture orbital bodies
    }

    const newOrbital: OrbitalBody = {
      ...body,
      id: `orbital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      acquired: new Date(),
      distance: 100 + Math.random() * 50, // Random orbit distance
      angle: Math.random() * 360, // Random starting angle
      velocity: 1 + Math.random() * 2 // Random orbital velocity
    }

    return {
      ...currentState,
      orbitalBodies: [...currentState.orbitalBodies, newOrbital]
    }
  }

  static createGrowthEvent(
    type: MassGrowthEvent['type'],
    amount: number,
    source: string,
    currentMass: number
  ): MassGrowthEvent {
    const stardustGain = Math.floor(amount * MASS_CONSTANTS.ABSORPTION_EFFICIENCY)
    const massChange = this.calculateMassFromStardust(stardustGain)

    return {
      type,
      amount,
      source,
      timestamp: new Date(),
      effects: {
        massChange,
        stardustGain,
        visualEffects: this.getVisualEffectsForGrowth(type, amount, currentMass)
      }
    }
  }

  static getVisualEffectsForGrowth(
    type: MassGrowthEvent['type'],
    amount: number,
    currentMass: number
  ): string[] {
    const effects = ['particle-burst']
    
    if (amount > 50) effects.push('energy-wave')
    if (amount > 100) effects.push('gravitational-ripple')
    if (amount > 500) effects.push('mass-explosion')
    
    if (type === 'fusion') effects.push('fusion-flash', 'energy-release')
    if (type === 'absorption') effects.push('absorption-spiral', 'matter-integration')
    if (type === 'orbital_capture') effects.push('orbital-formation', 'gravitational-binding')
    
    if (currentMass > 10000) effects.push('stellar-flare')
    if (currentMass > 100000) effects.push('cosmic-distortion')
    
    return effects
  }
}

export class WispSystem {
  static createWisp(challengeId: string, challengeName: string, failureReason: string): WanderingWisp {
    const baseWhispers = [...WISP_WHISPERS]
    const specificWhisper = `"${challengeName}" still calls to you...`
    const whispers = [specificWhisper, ...baseWhispers.sort(() => Math.random() - 0.5).slice(0, 4)]

    return {
      id: `wisp_${challengeId}_${Date.now()}`,
      challengeId,
      challengeName,
      failureReason,
      mass: 10 + Math.random() * 20, // Small but noticeable mass
      position: {
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
      },
      velocity: {
        x: (Math.random() - 0.5) * 0.5, // Slow drift
        y: (Math.random() - 0.5) * 0.5
      },
      opacity: 0.7 + Math.random() * 0.3,
      age: 0,
      maxAge: MASS_CONSTANTS.WISP_MAX_AGE,
      whispers,
      currentWhisper: 0,
      lastWhisperTime: 0,
      isHovered: false,
      pulseIntensity: 0.5 + Math.random() * 0.5
    }
  }

  static updateWisp(wisp: WanderingWisp, deltaTime: number): WanderingWisp | null {
    const newAge = wisp.age + deltaTime

    // Remove wisp if it's too old
    if (newAge > wisp.maxAge) {
      return null
    }

    // Calculate fade based on age
    let opacity = wisp.opacity
    if (newAge > MASS_CONSTANTS.WISP_FADE_START) {
      const fadeProgress = (newAge - MASS_CONSTANTS.WISP_FADE_START) / 
                          (wisp.maxAge - MASS_CONSTANTS.WISP_FADE_START)
      opacity = wisp.opacity * (1 - fadeProgress)
    }

    // Update position
    const newPosition = {
      x: wisp.position.x + wisp.velocity.x * deltaTime,
      y: wisp.position.y + wisp.velocity.y * deltaTime
    }

    // Wrap around screen edges
    if (newPosition.x < 0) newPosition.x = window.innerWidth
    if (newPosition.x > window.innerWidth) newPosition.x = 0
    if (newPosition.y < 0) newPosition.y = window.innerHeight
    if (newPosition.y > window.innerHeight) newPosition.y = 0

    // Occasionally change direction slightly
    let newVelocity = wisp.velocity
    if (Math.random() < 0.01) { // 1% chance per frame
      newVelocity = {
        x: wisp.velocity.x + (Math.random() - 0.5) * 0.1,
        y: wisp.velocity.y + (Math.random() - 0.5) * 0.1
      }
      // Clamp velocity
      const maxVel = 1
      newVelocity.x = Math.max(-maxVel, Math.min(maxVel, newVelocity.x))
      newVelocity.y = Math.max(-maxVel, Math.min(maxVel, newVelocity.y))
    }

    return {
      ...wisp,
      age: newAge,
      opacity,
      position: newPosition,
      velocity: newVelocity
    }
  }

  static getNextWhisper(wisp: WanderingWisp): string {
    const now = Date.now()
    if (now - wisp.lastWhisperTime > 3000) { // 3 seconds between whispers
      const nextIndex = (wisp.currentWhisper + 1) % wisp.whispers.length
      return wisp.whispers[nextIndex]
    }
    return wisp.whispers[wisp.currentWhisper]
  }

  static onWispHover(wisp: WanderingWisp): WanderingWisp {
    return {
      ...wisp,
      isHovered: true,
      lastWhisperTime: Date.now(),
      currentWhisper: (wisp.currentWhisper + 1) % wisp.whispers.length
    }
  }

  static onWispClick(wisp: WanderingWisp): {
    stardustReward: number
    massReward: number
    message: string
  } {
    // Reward based on wisp age and challenge difficulty
    const ageBonus = (wisp.maxAge - wisp.age) / wisp.maxAge // More reward for older wisps
    const baseReward = wisp.mass * 3
    const stardustReward = Math.floor(baseReward * (1 + ageBonus))
    const massReward = wisp.mass

    const messages = [
      "🌟 The wisp transforms into pure stardust!",
      "✨ Ancient knowledge flows into your being!",
      "💫 The failed challenge becomes your triumph!",
      "🌌 Understanding crystallizes from wandering thoughts!",
      "⭐ The wisp's wisdom merges with your cosmic mass!"
    ]

    return {
      stardustReward,
      massReward,
      message: messages[Math.floor(Math.random() * messages.length)]
    }
  }
}

export function createInitialMassState(initialStardust: number = 0): MassState {
  const mass = MassSystem.calculateMassFromStardust(initialStardust)
  const evolutionStage = MassSystem.getEvolutionStage(mass)
  const rank = getRankByStardust(initialStardust)

  return {
    stardust: initialStardust,
    mass,
    velocity: MassSystem.calculateVelocity(mass),
    gravitationalPull: MassSystem.calculateGravitationalPull(mass),
    orbitalBodies: [],
    rank: rank.id,
    evolutionStage: {
      ...MASS_EVOLUTION_STAGES[evolutionStage],
      progressToNext: MassSystem.calculateProgressToNext(mass, evolutionStage)
    }
  }
}