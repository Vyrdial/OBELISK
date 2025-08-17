'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react'

interface Agent {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  group: number
}

export default function EmergenceDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [pattern, setPattern] = useState<'flocking' | 'swarm' | 'separation'>('flocking')
  const [emergentStructures, setEmergentStructures] = useState<any[]>([])

  const colors = ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#A78BFA']

  const initializeAgents = () => {
    const newAgents: Agent[] = []
    for (let i = 0; i < 30; i++) {
      newAgents.push({
        id: i,
        x: Math.random() * 280 + 10,
        y: Math.random() * 180 + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        group: Math.floor(i / 6)
      })
    }
    setAgents(newAgents)
    setEmergentStructures([])
  }

  const applyFlockingRules = (agent: Agent, neighbors: Agent[]) => {
    if (neighbors.length === 0) return { vx: agent.vx, vy: agent.vy }

    // Separation: steer to avoid crowding local flockmates
    let sepX = 0, sepY = 0
    let sepCount = 0
    
    // Alignment: steer towards the average heading of neighbors
    let alignX = 0, alignY = 0
    
    // Cohesion: steer to move toward the average position of neighbors
    let cohX = 0, cohY = 0

    neighbors.forEach(neighbor => {
      const dx = agent.x - neighbor.x
      const dy = agent.y - neighbor.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 15) { // separation distance
        sepX += dx / distance
        sepY += dy / distance
        sepCount++
      }

      if (distance < 30) { // alignment and cohesion distance
        alignX += neighbor.vx
        alignY += neighbor.vy
        cohX += neighbor.x
        cohY += neighbor.y
      }
    })

    let newVx = agent.vx
    let newVy = agent.vy

    if (sepCount > 0) {
      sepX /= sepCount
      sepY /= sepCount
      newVx += sepX * 0.1
      newVy += sepY * 0.1
    }

    if (neighbors.length > 0) {
      alignX /= neighbors.length
      alignY /= neighbors.length
      newVx += (alignX - agent.vx) * 0.05

      cohX /= neighbors.length
      cohY /= neighbors.length
      newVx += (cohX - agent.x) * 0.002
      newVy += (cohY - agent.y) * 0.002
    }

    // Limit speed
    const speed = Math.sqrt(newVx * newVx + newVy * newVy)
    if (speed > 2) {
      newVx = (newVx / speed) * 2
      newVy = (newVy / speed) * 2
    }

    return { vx: newVx, vy: newVy }
  }

  const detectEmergentPatterns = (agents: Agent[]) => {
    const structures = []
    
    // Detect clusters
    const clusters = []
    const visited = new Set<number>()
    
    agents.forEach(agent => {
      if (visited.has(agent.id)) return
      
      const cluster = [agent]
      visited.add(agent.id)
      
      const findNeighbors = (centerAgent: Agent) => {
        agents.forEach(other => {
          if (visited.has(other.id)) return
          
          const dx = centerAgent.x - other.x
          const dy = centerAgent.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 25) {
            cluster.push(other)
            visited.add(other.id)
            findNeighbors(other)
          }
        })
      }
      
      findNeighbors(agent)
      
      if (cluster.length >= 5) {
        const centerX = cluster.reduce((sum, a) => sum + a.x, 0) / cluster.length
        const centerY = cluster.reduce((sum, a) => sum + a.y, 0) / cluster.length
        
        clusters.push({
          type: 'cluster',
          x: centerX,
          y: centerY,
          size: cluster.length,
          agents: cluster
        })
      }
    })
    
    setEmergentStructures(clusters)
  }

  useEffect(() => {
    initializeAgents()
  }, [pattern])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setAgents(prevAgents => {
        const newAgents = prevAgents.map(agent => {
          const neighbors = prevAgents.filter(other => {
            if (other.id === agent.id) return false
            const dx = agent.x - other.x
            const dy = agent.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < 40
          })

          let newVx = agent.vx
          let newVy = agent.vy

          if (pattern === 'flocking') {
            const flockingResult = applyFlockingRules(agent, neighbors)
            newVx = flockingResult.vx
            newVy = flockingResult.vy
          } else if (pattern === 'swarm') {
            // Swarm towards center of mass
            const centerX = prevAgents.reduce((sum, a) => sum + a.x, 0) / prevAgents.length
            const centerY = prevAgents.reduce((sum, a) => sum + a.y, 0) / prevAgents.length
            newVx += (centerX - agent.x) * 0.001
            newVy += (centerY - agent.y) * 0.001
          }

          // Boundary conditions
          if (agent.x < 10) newVx += 0.1
          if (agent.x > 290) newVx -= 0.1
          if (agent.y < 10) newVy += 0.1
          if (agent.y > 190) newVy -= 0.1

          return {
            ...agent,
            x: agent.x + newVx,
            y: agent.y + newVy,
            vx: newVx,
            vy: newVy
          }
        })

        // Detect emergent patterns every few frames
        if (Math.random() < 0.1) {
          detectEmergentPatterns(newAgents)
        }

        return newAgents
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isPlaying, pattern])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    initializeAgents()
  }

  const randomize = () => {
    initializeAgents()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Complex Adaptive Systems
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Watch simple rules create unexpected patterns
        </p>
        
        {/* Pattern Selection */}
        <div className="flex justify-center gap-2 mb-4">
          {(['flocking', 'swarm', 'separation'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPattern(p)}
              className={`px-3 py-1 rounded text-xs transition-colors capitalize ${
                pattern === p
                  ? 'bg-cosmic-starlight/30 text-cosmic-starlight border border-cosmic-starlight/50'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={togglePlayPause}
            className="p-2 bg-cosmic-starlight/20 hover:bg-cosmic-starlight/30 border border-cosmic-starlight/40 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-cosmic-starlight" />
            ) : (
              <Play className="w-4 h-4 text-cosmic-starlight" />
            )}
          </button>
          
          <button
            onClick={reset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={randomize}
            className="p-2 bg-cosmic-aurora/20 hover:bg-cosmic-aurora/30 border border-cosmic-aurora/40 rounded-lg transition-colors"
          >
            <Shuffle className="w-4 h-4 text-cosmic-aurora" />
          </button>
        </div>

        {/* Visualization */}
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20">
          {/* Emergent structure highlights */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {emergentStructures.map((structure, index) => (
              <circle
                key={`structure-${index}`}
                cx={structure.x}
                cy={structure.y}
                r={structure.size * 3}
                fill="none"
                stroke="#34D399"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.6"
              />
            ))}
          </svg>
          
          {/* Connection lines for nearby agents */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {agents.map((agent, i) =>
              agents.slice(i + 1).map((other, j) => {
                const dx = agent.x - other.x
                const dy = agent.y - other.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance < 25) {
                  return (
                    <line
                      key={`connection-${i}-${j}`}
                      x1={agent.x}
                      y1={agent.y}
                      x2={other.x}
                      y2={other.y}
                      stroke="white"
                      strokeWidth="0.5"
                      opacity={Math.max(0, 1 - distance / 25) * 0.3}
                    />
                  )
                }
                return null
              })
            )}
          </svg>
          
          {/* Agents */}
          {agents.map((agent) => (
            <m.div
              key={agent.id}
              className="absolute rounded-full"
              style={{
                left: agent.x,
                top: agent.y,
                width: '4px',
                height: '4px',
                backgroundColor: agent.color,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 4px ${agent.color}60`
              }}
              animate={{
                scale: emergentStructures.some(s => 
                  s.agents && s.agents.some((a: Agent) => a.id === agent.id)
                ) ? 1.5 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
          
          {/* Emergence indicators */}
          <div className="absolute top-2 right-2 text-xs text-white/60">
            Clusters: {emergentStructures.length}
          </div>
          
          <div className="absolute bottom-2 left-2 text-xs text-white/60">
            {pattern === 'flocking' && 'Boids Algorithm'}
            {pattern === 'swarm' && 'Collective Behavior'}
            {pattern === 'separation' && 'Dispersion Dynamics'}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-white/60 text-xs">
            Simple rules → Complex behaviors → Emergent patterns
          </p>
          <p className="text-cosmic-starlight text-xs">
            "The universe surprising itself"
          </p>
        </div>
      </div>
    </div>
  )
}
