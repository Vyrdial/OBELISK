'use client'

import { m } from 'framer-motion'
import { useState } from 'react'
import { Star, Lock, CheckCircle, Play } from 'lucide-react'
import SingularityNode from '@/components/ui/SingularityNode'

interface ConstellationNode {
  id: string
  title: string
  description: string
  position: { x: number; y: number }
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  difficulty: 1 | 2 | 3 | 4 | 5
  prerequisites: string[]
  lessons: number
  estimatedTime: string
  mastery?: number
}

interface ConstellationMapProps {
  constellations: ConstellationNode[]
  onConstellationClick: (constellation: ConstellationNode) => void
  userProgress?: { [key: string]: number }
}

export default function ConstellationMap({ 
  constellations, 
  onConstellationClick, 
  userProgress = {} 
}: ConstellationMapProps) {
  // const [selectedConstellation] = useState<ConstellationNode | null>(null)
  const [hoveredConstellation, setHoveredConstellation] = useState<string | null>(null)

  const getStatusColor = (status: ConstellationNode['status']) => {
    switch (status) {
      case 'locked': return 'text-white/30 border-white/20'
      case 'available': return 'text-cosmic-quasar border-cosmic-quasar/50'
      case 'in-progress': return 'text-cosmic-aurora border-cosmic-aurora/50'
      case 'completed': return 'text-cosmic-starlight border-cosmic-starlight/50'
    }
  }

  const getStatusIcon = (status: ConstellationNode['status']) => {
    switch (status) {
      case 'locked': return Lock
      case 'available': return Play
      case 'in-progress': return Star
      case 'completed': return CheckCircle
    }
  }

  const getDifficultyStars = (difficulty: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < difficulty ? 'text-cosmic-aurora fill-cosmic-aurora' : 'text-white/20'
        }`}
      />
    ))
  }

  // Calculate connections between constellations
  const renderConnections = () => {
    return constellations.map(constellation => 
      constellation.prerequisites.map(prereqId => {
        const prereq = constellations.find(c => c.id === prereqId)
        if (!prereq) return null

        const isUnlocked = constellation.status !== 'locked'
        
        return (
          <m.line
            key={`${prereqId}-${constellation.id}`}
            x1={prereq.position.x}
            y1={prereq.position.y}
            x2={constellation.position.x}
            y2={constellation.position.y}
            stroke={isUnlocked ? 'rgba(233, 69, 96, 0.4)' : 'rgba(255, 255, 255, 0.1)'}
            strokeWidth="2"
            strokeDasharray={isUnlocked ? "0" : "5,5"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        )
      })
    ).flat().filter(Boolean)
  }

  return (
    <div className="relative w-full h-screen bg-cosmic-gradient overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <m.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: 1,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* SVG for constellation connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {renderConnections()}
      </svg>

      {/* Constellation Nodes */}
      <div className="relative z-10 w-full h-full">
        {constellations.map((constellation) => {
          const StatusIcon = getStatusIcon(constellation.status)
          const statusColor = getStatusColor(constellation.status)
          const progress = userProgress[constellation.id] || 0
          const isHovered = hoveredConstellation === constellation.id
          // const isSelected = selectedConstellation?.id === constellation.id

          return (
            <m.div
              key={constellation.id}
              className="absolute"
              style={{
                left: `${constellation.position.x}%`,
                top: `${constellation.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * constellations.indexOf(constellation) }}
            >
              {/* Main Constellation Node */}
              <div 
                className="relative"
                onMouseEnter={() => setHoveredConstellation(constellation.id)}
                onMouseLeave={() => setHoveredConstellation(null)}
              >
                <SingularityNode
                  size="xxxl"
                  status={constellation.status}
                  onClick={() => onConstellationClick(constellation)}
                  className={`${statusColor} transition-all duration-300`}
                >
                  <StatusIcon className="w-8 h-8 text-white" />
                </SingularityNode>
                
                {/* Progress Ring */}
                {constellation.status !== 'locked' && progress > 0 && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="38"
                      fill="none"
                      stroke="rgba(241, 196, 64, 0.3)"
                      strokeWidth="3"
                    />
                    <m.circle
                      cx="50%"
                      cy="50%"
                      r="38"
                      fill="none"
                      stroke="#f1c40f"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 38 * (1 - progress / 100) 
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </svg>
                )}

                {/* Floating Particles for Completed */}
                {constellation.status === 'completed' && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <m.div
                        key={i}
                        className="absolute w-1 h-1 bg-cosmic-stardust rounded-full pointer-events-none"
                        style={{
                          top: '50%',
                          left: '50%',
                        }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 60],
                          y: [0, (Math.random() - 0.5) * 60],
                          opacity: [1, 0],
                          scale: 1,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Constellation Info Tooltip */}
              {isHovered && (
                <m.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 w-72 z-50"
                >
                  <div className="glass-morphism rounded-xl p-4 border border-white/20 shadow-cosmic">
                    <h3 className="font-bold text-white text-lg mb-2">
                      {constellation.title}
                    </h3>
                    
                    <p className="text-white/70 text-sm mb-3 leading-relaxed">
                      {constellation.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-white/60 text-xs">Difficulty:</span>
                        <div className="flex gap-0.5">
                          {getDifficultyStars(constellation.difficulty)}
                        </div>
                      </div>
                      
                      <div className="text-white/60 text-xs">
                        {constellation.lessons} lessons • {constellation.estimatedTime}
                      </div>
                    </div>

                    {progress > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Progress</span>
                          <span className="text-cosmic-stardust font-semibold">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                          <m.div
                            className="bg-gradient-to-r from-cosmic-stardust to-cosmic-aurora h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Arrow pointing to constellation */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                      <div className="border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/20" />
                    </div>
                  </div>
                </m.div>
              )}

              {/* Constellation Label */}
              <m.div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white text-sm font-medium whitespace-nowrap">
                  {constellation.title}
                </span>
              </m.div>
            </m.div>
          )
        })}
      </div>

      {/* Legend */}
      <m.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-4 right-4 glass-morphism rounded-xl p-4 border border-white/20"
      >
        <h4 className="text-white font-semibold mb-3 text-sm">Constellation Guide</h4>
        <div className="space-y-2 text-xs">
          {[
            { status: 'completed', label: 'Mastered', color: 'text-cosmic-starlight' },
            { status: 'in-progress', label: 'In Progress', color: 'text-cosmic-aurora' },
            { status: 'available', label: 'Available', color: 'text-cosmic-quasar' },
            { status: 'locked', label: 'Locked', color: 'text-white/30' }
          ].map((item) => {
            const Icon = getStatusIcon(item.status as ConstellationNode['status'])
            return (
              <div key={item.status} className="flex items-center gap-2">
                <Icon className={`w-3 h-3 ${item.color}`} />
                <span className="text-white/70">{item.label}</span>
              </div>
            )
          })}
        </div>
      </m.div>
    </div>
  )
}