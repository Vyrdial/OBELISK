'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react'

interface Node {
  id: number
  x: number
  y: number
  visited: boolean
  isPath: boolean
  isStart: boolean
  isEnd: boolean
}

interface Edge {
  from: number
  to: number
  weight: number
  highlighted: boolean
}

export default function TraversalDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [path, setPath] = useState<number[]>([])
  const [algorithm, setAlgorithm] = useState<'depth' | 'breadth'>('depth')

  const initializeGraph = () => {
    const graphNodes: Node[] = [
      { id: 0, x: 50, y: 100, visited: false, isPath: false, isStart: true, isEnd: false },
      { id: 1, x: 120, y: 60, visited: false, isPath: false, isStart: false, isEnd: false },
      { id: 2, x: 120, y: 140, visited: false, isPath: false, isStart: false, isEnd: false },
      { id: 3, x: 190, y: 80, visited: false, isPath: false, isStart: false, isEnd: false },
      { id: 4, x: 190, y: 120, visited: false, isPath: false, isStart: false, isEnd: false },
      { id: 5, x: 260, y: 100, visited: false, isPath: false, isStart: false, isEnd: true },
    ]

    const graphEdges: Edge[] = [
      { from: 0, to: 1, weight: 1, highlighted: false },
      { from: 0, to: 2, weight: 1, highlighted: false },
      { from: 1, to: 3, weight: 1, highlighted: false },
      { from: 1, to: 4, weight: 1, highlighted: false },
      { from: 2, to: 4, weight: 1, highlighted: false },
      { from: 3, to: 5, weight: 1, highlighted: false },
      { from: 4, to: 5, weight: 1, highlighted: false },
    ]

    setNodes(graphNodes)
    setEdges(graphEdges)
    setPath([])
    setCurrentStep(0)
  }

  const depthFirstTraversal = () => {
    const visited = new Set<number>()
    const stack = [0]
    const traversalPath: number[] = []

    while (stack.length > 0) {
      const current = stack.pop()!
      if (!visited.has(current)) {
        visited.add(current)
        traversalPath.push(current)
        
        // Add neighbors to stack (in reverse order for proper DFS)
        const neighbors = edges
          .filter(e => e.from === current)
          .map(e => e.to)
          .reverse()
        
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            stack.push(neighbor)
          }
        })
      }
    }

    return traversalPath
  }

  const breadthFirstTraversal = () => {
    const visited = new Set<number>()
    const queue = [0]
    const traversalPath: number[] = []

    while (queue.length > 0) {
      const current = queue.shift()!
      if (!visited.has(current)) {
        visited.add(current)
        traversalPath.push(current)
        
        // Add neighbors to queue
        const neighbors = edges
          .filter(e => e.from === current)
          .map(e => e.to)
        
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            queue.push(neighbor)
          }
        })
      }
    }

    return traversalPath
  }

  useEffect(() => {
    initializeGraph()
  }, [algorithm])

  useEffect(() => {
    if (!isPlaying) return

    const traversalPath = algorithm === 'depth' ? depthFirstTraversal() : breadthFirstTraversal()
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= traversalPath.length) {
          setIsPlaying(false)
          return prev
        }

        const nodeToVisit = traversalPath[prev]
        
        setNodes(prevNodes => 
          prevNodes.map(node => 
            node.id === nodeToVisit 
              ? { ...node, visited: true, isPath: true }
              : node
          )
        )

        // Highlight the edge leading to this node
        if (prev > 0) {
          const prevNode = traversalPath[prev - 1]
          setEdges(prevEdges =>
            prevEdges.map(edge =>
              (edge.from === prevNode && edge.to === nodeToVisit) ||
              (edge.to === prevNode && edge.from === nodeToVisit)
                ? { ...edge, highlighted: true }
                : edge
            )
          )
        }

        setPath(traversalPath.slice(0, prev + 1))
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, algorithm])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    initializeGraph()
  }

  const getNodeColor = (node: Node) => {
    if (node.isStart) return '#60A5FA'
    if (node.isEnd) return '#F472B6'
    if (node.visited) return '#34D399'
    return '#6B7280'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Graph Traversal Journey
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Navigate through the space of possibilities
        </p>
        
        {/* Algorithm Selection */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setAlgorithm('depth')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              algorithm === 'depth'
                ? 'bg-cosmic-starlight/30 text-cosmic-starlight border border-cosmic-starlight/50'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Depth-First
          </button>
          <button
            onClick={() => setAlgorithm('breadth')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              algorithm === 'breadth'
                ? 'bg-cosmic-aurora/30 text-cosmic-aurora border border-cosmic-aurora/50'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Breadth-First
          </button>
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
        </div>

        {/* Visualization */}
        <div className="relative h-64 bg-black/30 rounded-lg overflow-hidden border border-white/20">
          <svg className="absolute inset-0 w-full h-full">
            {/* Edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from)!
              const toNode = nodes.find(n => n.id === edge.to)!
              
              return (
                <line
                  key={`edge-${index}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.highlighted ? '#34D399' : '#6B7280'}
                  strokeWidth={edge.highlighted ? '2' : '1'}
                  opacity={edge.highlighted ? '1' : '0.6'}
                />
              )
            })}
          </svg>
          
          {/* Nodes */}
          {nodes.map((node) => (
            <m.div
              key={`node-${node.id}`}
              className="absolute rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                left: node.x,
                top: node.y,
                width: '24px',
                height: '24px',
                backgroundColor: getNodeColor(node),
                transform: 'translate(-50%, -50%)',
                border: node.isPath ? '2px solid white' : 'none',
                boxShadow: node.visited ? `0 0 8px ${getNodeColor(node)}60` : 'none'
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: node.visited ? [1, 1.3, 1] : 1,
                transition: { duration: 0.3 }
              }}
            >
              {node.isStart && <MapPin className="w-3 h-3 text-white" />}
              {node.isEnd && '🎯'}
              {!node.isStart && !node.isEnd && node.id}
            </m.div>
          ))}
          
          {/* Step indicator */}
          <div className="absolute bottom-2 left-2 text-white/60 text-xs">
            Step: {currentStep} | {algorithm === 'depth' ? 'Depth-First' : 'Breadth-First'}
          </div>
          
          {/* Path indicator */}
          <div className="absolute bottom-2 right-2 text-white/60 text-xs">
            Path: {path.join(' → ')}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-white/60 text-xs">
            {algorithm === 'depth' 
              ? 'Dive deep before exploring wide' 
              : 'Explore neighbors before going deeper'
            }
          </p>
          <p className="text-cosmic-starlight text-xs">
            "Each path taken creates the territory it explores"
          </p>
        </div>
      </div>
    </div>
  )
}
