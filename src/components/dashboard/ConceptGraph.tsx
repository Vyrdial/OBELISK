'use client'

import { useState, useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { Brain, Sparkles, Zap, Circle } from 'lucide-react'
import SingularityNode from '@/components/ui/SingularityNode'

interface ConceptNode {
  id: string
  title: string
  description: string
  position: { x: number; y: number }
  learned: boolean
  connections: string[]
  category: 'fundamental' | 'applied' | 'synthesis'
  color: string
}

interface ConceptGraphProps {
  className?: string
}

// Mock concept data - will be dynamic based on user progress
const conceptNodes: ConceptNode[] = [
  {
    id: 'singularity',
    title: 'Singularity',
    description: 'The unified point of all knowledge',
    position: { x: 400, y: 300 },
    learned: true,
    connections: ['axes', 'origins', 'meaning'],
    category: 'fundamental',
    color: '#9333ea' // Purple
  },
  {
    id: 'axes',
    title: 'Dimensions',
    description: 'Independent ways things can vary',
    position: { x: 200, y: 150 },
    learned: true,
    connections: ['singularity', 'origins'],
    category: 'fundamental',
    color: '#06b6d4' // Cyan
  },
  {
    id: 'origins',
    title: 'Origins',
    description: 'Where knowledge begins',
    position: { x: 600, y: 150 },
    learned: true,
    connections: ['singularity', 'axes', 'meaning'],
    category: 'fundamental',
    color: '#10b981' // Emerald
  },
  {
    id: 'meaning',
    title: 'Meaning',
    description: 'What gives concepts power',
    position: { x: 400, y: 100 },
    learned: false,
    connections: ['singularity', 'origins'],
    category: 'applied',
    color: '#f59e0b' // Amber
  },
  {
    id: 'systems',
    title: 'Systems',
    description: 'How everything interconnects',
    position: { x: 300, y: 450 },
    learned: false,
    connections: ['singularity'],
    category: 'synthesis',
    color: '#ef4444' // Red
  }
]

export default function ConceptGraph({ className = '' }: ConceptGraphProps) {
  const [nodes, setNodes] = useState<ConceptNode[]>(conceptNodes)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId)
  }

  const getConnectionLines = () => {
    const lines: Array<{ from: ConceptNode; to: ConceptNode }> = []
    
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId)
        if (connectedNode && node.learned && connectedNode.learned) {
          lines.push({ from: node, to: connectedNode })
        }
      })
    })
    
    return lines
  }

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null

  return (
    <div className={`relative w-full h-96 glass-morphism rounded-3xl border border-white/10 overflow-hidden ${className}`}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Connection Lines */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.6)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.6)" />
          </linearGradient>
        </defs>
        
        {getConnectionLines().map((line, index) => (
          <m.line
            key={`${line.from.id}-${line.to.id}-${index}`}
            x1={line.from.position.x}
            y1={line.from.position.y}
            x2={line.to.position.x}
            y2={line.to.position.y}
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 1, delay: index * 0.2 }}
          />
        ))}
      </svg>

      {/* Concept Nodes */}
      {nodes.map((node, index) => (
        <m.div
          key={node.id}
          className="absolute cursor-pointer"
          style={{
            left: node.position.x - 30,
            top: node.position.y - 30,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: node.learned ? 1 : 0.7, 
            opacity: node.learned ? 1 : 0.4 
          }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: node.learned ? 1.1 : 0.75 }}
          onClick={() => node.learned && handleNodeClick(node.id)}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* Node Glow Effect */}
          {(selectedNode === node.id || hoveredNode === node.id) && node.learned && (
            <m.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${node.color}44 0%, transparent 70%)`,
                width: '120px',
                height: '120px',
                left: '-30px',
                top: '-30px',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          {/* Unified Singularity Node */}
          <SingularityNode
            size="xxl"
            status={node.learned ? 'available' : 'locked'}
            onClick={() => node.learned && handleNodeClick(node.id)}
          >
            {/* Node Icon */}
            {node.id === 'singularity' ? (
              <Brain className="w-6 h-6 text-white" />
            ) : node.learned ? (
              <Sparkles className="w-5 h-5 text-white" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </SingularityNode>

          {/* Node Label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
            <div className={`text-xs font-medium whitespace-nowrap ${
              node.learned ? 'text-white' : 'text-gray-500'
            }`}>
              {node.title}
            </div>
          </div>
        </m.div>
      ))}

      {/* Node Details Panel */}
      {selectedNodeData && (
        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 w-64 p-4 bg-black/80 rounded-lg border border-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedNodeData.color }}
            />
            <h3 className="text-white font-semibold">{selectedNodeData.title}</h3>
          </div>
          <p className="text-white/70 text-sm mb-3">{selectedNodeData.description}</p>
          <div className="text-xs text-white/50">
            Category: <span className="capitalize">{selectedNodeData.category}</span>
          </div>
          <div className="text-xs text-white/50 mt-1">
            Status: <span className={selectedNodeData.learned ? 'text-green-400' : 'text-yellow-400'}>
              {selectedNodeData.learned ? 'Mastered' : 'Locked'}
            </span>
          </div>
        </m.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span>Locked</span>
        </div>
      </div>
    </div>
  )
}