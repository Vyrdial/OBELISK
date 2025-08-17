import { useState, useCallback, useEffect } from 'react'
import { MassState, MassGrowthEvent, WanderingWisp, MASS_CONSTANTS } from '@/types/mass'
import { MassSystem, WispSystem, createInitialMassState } from '@/utils/massSystem'

interface UseMassSystemOptions {
  initialStardust?: number
  enablePassiveGrowth?: boolean
  passiveGrowthRate?: number // Stardust per second
  enableWisps?: boolean
}

export function useMassSystem({
  initialStardust = 0,
  enablePassiveGrowth = true,
  passiveGrowthRate = 0.1,
  enableWisps = true
}: UseMassSystemOptions = {}) {
  const [massState, setMassState] = useState<MassState>(() => 
    createInitialMassState(initialStardust)
  )
  const [growthEvents, setGrowthEvents] = useState<MassGrowthEvent[]>([])
  const [wisps, setWisps] = useState<WanderingWisp[]>([])
  const [lastPassiveGrowth, setLastPassiveGrowth] = useState(0)

  const addStardust = useCallback((amount: number, source: string = 'Unknown') => {
    const growthEvent = MassSystem.createGrowthEvent(
      'absorption',
      amount,
      source,
      massState.mass
    )

    setMassState(prevState => MassSystem.updateMassState(prevState, amount))
    setGrowthEvents(prev => [...prev.slice(-9), growthEvent])
  }, [massState.mass])

  // Initialize lastPassiveGrowth on client only
  useEffect(() => {
    if (lastPassiveGrowth === 0) {
      setLastPassiveGrowth(Date.now())
    }
  }, [lastPassiveGrowth])

  // Passive XP/Stardust growth (being present in OBELISK)
  useEffect(() => {
    if (!enablePassiveGrowth || lastPassiveGrowth === 0) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeDelta = (now - lastPassiveGrowth) / 1000 // seconds
      const passiveGain = Math.floor(timeDelta * passiveGrowthRate)

      if (passiveGain > 0) {
        const growthEvent = MassSystem.createGrowthEvent(
          'absorption',
          passiveGain,
          'Passive Cosmic Presence',
          massState.mass
        )

        addStardust(passiveGain, 'Orbital XP')
        setGrowthEvents(prev => [...prev.slice(-9), growthEvent]) // Keep last 10 events
        setLastPassiveGrowth(now)
      }
    }, 5000) // Check every 5 seconds to reduce flicker

    return () => clearInterval(interval)
  }, [enablePassiveGrowth, passiveGrowthRate, lastPassiveGrowth, massState.mass, addStardust])

  // Update wisps
  useEffect(() => {
    if (!enableWisps || wisps.length === 0) return

    const interval = setInterval(() => {
      const deltaTime = 100 // Reduced frequency to prevent flicker
      const updatedWisps = wisps
        .map(wisp => WispSystem.updateWisp(wisp, deltaTime))
        .filter(Boolean) as WanderingWisp[]
      
      if (updatedWisps.length !== wisps.length) {
        setWisps(updatedWisps)
      }
    }, 100) // 10fps instead of 60fps

    return () => clearInterval(interval)
  }, [wisps, enableWisps])

  const addOrbitalBody = useCallback((bodyData: {
    type: 'concept' | 'memory' | 'skill' | 'wisp'
    mass: number
    color: string
    name: string
  }) => {
    setMassState(prevState => MassSystem.addOrbitalBody(prevState, {
      ...bodyData,
      angle: Math.random() * 360,
      distance: 100 + Math.random() * 50,
      velocity: 1 + Math.random() * 2
    }))
  }, [])

  const spawnWisp = useCallback((challengeId: string, challengeName: string, failureReason: string) => {
    if (!enableWisps) return
    
    // Only spawn wisp based on chance
    if (Math.random() < MASS_CONSTANTS.WISP_SPAWN_CHANCE) {
      const newWisp = WispSystem.createWisp(challengeId, challengeName, failureReason)
      setWisps(prev => [...prev, newWisp])
    }
  }, [enableWisps])

  const captureWisp = useCallback((wisp: WanderingWisp) => {
    const reward = WispSystem.onWispClick(wisp)
    
    // Add rewards to mass state
    addStardust(reward.stardustReward, 'Wisp Capture')
    
    // Add wisp as orbital if mass is sufficient
    if (massState.gravitationalPull >= MASS_CONSTANTS.ORBITAL_THRESHOLD) {
      addOrbitalBody({
        type: 'wisp',
        mass: reward.massReward,
        color: 'rgba(138, 43, 226, 0.8)',
        name: `Captured ${wisp.challengeName}`
      })
    }

    // Remove wisp
    setWisps(prev => prev.filter(w => w.id !== wisp.id))

    return reward
  }, [massState.gravitationalPull, addStardust, addOrbitalBody])

  const performFusion = useCallback((targetMass: number) => {
    if (massState.mass < MASS_CONSTANTS.FUSION_THRESHOLD) {
      return { success: false, message: 'Insufficient mass for fusion' }
    }

    const fusionGain = Math.floor(targetMass * 0.5)
    const growthEvent = MassSystem.createGrowthEvent(
      'fusion',
      fusionGain,
      'Nuclear Fusion',
      massState.mass
    )

    addStardust(fusionGain, 'Fusion Event')
    setGrowthEvents(prev => [...prev.slice(-9), growthEvent])

    return { 
      success: true, 
      message: `Fusion successful! Generated ${fusionGain} stardust!`,
      stardustGained: fusionGain
    }
  }, [massState.mass, addStardust])

  const absorbMatter = useCallback((amount: number, source: string) => {
    const actualAbsorbed = Math.floor(amount * MASS_CONSTANTS.ABSORPTION_EFFICIENCY)
    addStardust(actualAbsorbed, source)
    
    return {
      absorbed: actualAbsorbed,
      efficiency: MASS_CONSTANTS.ABSORPTION_EFFICIENCY,
      waste: amount - actualAbsorbed
    }
  }, [addStardust])

  const joinStudyGroup = useCallback((otherMasses: number[], duration: number) => {
    // Temporary mass boost from study group collaboration
    const totalOtherMass = otherMasses.reduce((sum, mass) => sum + mass, 0)
    const boostAmount = Math.floor(totalOtherMass * 0.1) // 10% of combined mass
    
    const growthEvent = MassSystem.createGrowthEvent(
      'orbital_capture',
      boostAmount,
      `Study Group (${otherMasses.length} members)`,
      massState.mass
    )

    // Temporary boost
    setMassState(prevState => ({
      ...prevState,
      mass: prevState.mass + boostAmount,
      gravitationalPull: MassSystem.calculateGravitationalPull(prevState.mass + boostAmount)
    }))

    setGrowthEvents(prev => [...prev.slice(-9), growthEvent])

    // Remove boost after duration
    setTimeout(() => {
      setMassState(prevState => ({
        ...prevState,
        mass: Math.max(prevState.mass - boostAmount, MassSystem.calculateMassFromStardust(prevState.stardust)),
        gravitationalPull: MassSystem.calculateGravitationalPull(Math.max(prevState.mass - boostAmount, MassSystem.calculateMassFromStardust(prevState.stardust)))
      }))
    }, duration)

    return {
      boost: boostAmount,
      duration,
      participants: otherMasses.length
    }
  }, [massState.mass])

  const performDebate = useCallback((opponentMass: number, outcome: 'win' | 'lose' | 'draw') => {
    let growthAmount = 0
    let source = ''

    switch (outcome) {
      case 'win':
        growthAmount = Math.floor(opponentMass * 0.2) // 20% of opponent's mass
        source = `Debate Victory vs ${Math.floor(opponentMass)} mass opponent`
        break
      case 'lose':
        growthAmount = Math.floor(opponentMass * 0.05) // Still gain something from learning
        source = `Debate Learning vs ${Math.floor(opponentMass)} mass opponent`
        break
      case 'draw':
        growthAmount = Math.floor(opponentMass * 0.1) // Mutual learning
        source = `Debate Exchange vs ${Math.floor(opponentMass)} mass opponent`
        break
    }

    addStardust(growthAmount, source)
    
    return {
      outcome,
      stardustGained: growthAmount,
      opponentMass,
      description: source
    }
  }, [addStardust])

  const getSystemStats = useCallback(() => {
    const totalOrbitalMass = massState.orbitalBodies.reduce((sum, orbital) => sum + orbital.mass, 0)
    const growthEfficiency = massState.stardust > 0 ? (massState.mass / massState.stardust) * 100 : 0
    const wispCount = wisps.length
    const oldestWisp = wisps.reduce((oldest, wisp) => 
      wisp.age > oldest.age ? wisp : oldest, 
      { age: 0 } as WanderingWisp
    )

    return {
      massState,
      totalOrbitalMass,
      growthEfficiency,
      wispCount,
      oldestWispAge: oldestWisp.age,
      recentGrowthEvents: growthEvents.slice(-5),
      canPerformFusion: massState.mass >= MASS_CONSTANTS.FUSION_THRESHOLD,
      canCaptureOrbitals: massState.gravitationalPull >= MASS_CONSTANTS.ORBITAL_THRESHOLD
    }
  }, [massState, wisps, growthEvents])

  return {
    // State
    massState,
    wisps,
    growthEvents: growthEvents.slice(-10), // Only return recent events
    
    // Core Actions
    addStardust,
    addOrbitalBody,
    setMassState,
    
    // Wisp Management
    spawnWisp,
    captureWisp,
    setWisps,
    
    // Advanced Actions
    performFusion,
    absorbMatter,
    joinStudyGroup,
    performDebate,
    
    // System Info
    getSystemStats
  }
}