'use client'

import { useState, useRef } from 'react'
import { Activity, Lock, Layers, Box, Infinity } from 'lucide-react'

type Dimension = '1D' | '2D' | '3D'

export default function GeometricWorkspace() {
  const [dimension, setDimension] = useState<Dimension>('1D')
  const [variables, setVariables] = useState<any[]>([])
  const [newVarName, setNewVarName] = useState('')
  const [scale, setScale] = useState(50)
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [isVertical, setIsVertical] = useState(false)
  const [axisName, setAxisName] = useState('x')

  const addVariable = () => {
    if (!newVarName.trim()) return
    
    const newVar = {
      id: Date.now().toString(),
      name: newVarName.trim(),
      value: '0',
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }
    
    setVariables([...variables, newVar])
    setNewVarName('')
  }

  const getCoordinateRange = () => {
    const visibleRange = 800 / scale // Fixed canvas width
    const centerOffset = isVertical ? -viewOffset.y / scale : -viewOffset.x / scale
    const start = Math.floor(centerOffset - visibleRange / 2)
    const end = Math.ceil(centerOffset + visibleRange / 2)
    
    const coords = []
    for (let i = start; i <= end; i++) {
      coords.push({ value: i })
    }
    return coords
  }

  return (
    <div className="w-full h-screen flex flex-row gap-4 p-4 bg-black">
      {/* Left Panel - Define Entities */}
      <div className="w-[400px] bg-gray-800 rounded-xl border border-gray-600 p-4 flex flex-col gap-4">
        <h3 className="text-white text-lg font-semibold">Define Entities</h3>
        
        {/* Add Variable */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addVariable()}
              placeholder="Variable name (e.g., x, y, a)"
              className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
            />
            <button
              onClick={addVariable}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Variables List */}
        <div className="flex-1 bg-gray-700 rounded-lg p-3">
          <h4 className="text-gray-300 text-sm mb-2">Variables ({variables.length})</h4>
          {variables.length === 0 ? (
            <p className="text-gray-400 text-sm">No variables defined yet</p>
          ) : (
            <div className="space-y-2">
              {variables.map((variable) => (
                <div key={variable.id} className="flex items-center gap-2 p-2 bg-gray-600 rounded">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: variable.color }}
                  />
                  <span className="text-white font-mono">{variable.name}</span>
                  <span className="text-gray-300 text-sm">= {variable.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Graph Display */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-600 p-4 flex flex-col gap-4">
        {/* Navigation Bar */}
        <div className="bg-gray-700 rounded-lg p-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm">View:</span>
            <button
              onClick={() => setDimension('1D')}
              className={`px-3 py-1 rounded text-sm ${
                dimension === '1D' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => setDimension('2D')}
              className={`px-3 py-1 rounded text-sm ${
                dimension === '2D' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              2D
            </button>
          </div>

          {dimension === '1D' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVertical(!isVertical)}
                className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-sm hover:bg-gray-500"
              >
                {isVertical ? 'Vertical' : 'Horizontal'}
              </button>
              <input
                type="text"
                value={axisName}
                onChange={(e) => setAxisName(e.target.value)}
                className="w-12 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                placeholder="x"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm">Zoom:</span>
            <button
              onClick={() => setScale(Math.max(10, scale - 10))}
              className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-sm hover:bg-gray-500"
            >
              -
            </button>
            <span className="text-gray-300 text-sm w-8 text-center">{Math.round(scale)}</span>
            <button
              onClick={() => setScale(Math.min(200, scale + 10))}
              className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-sm hover:bg-gray-500"
            >
              +
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-black rounded-lg border border-gray-600 relative overflow-hidden min-h-[400px]">
          {dimension === '1D' && (
            <svg className="absolute inset-0 w-full h-full">
              <g transform={`translate(${400 + viewOffset.x}, ${200 + viewOffset.y})`}>
                {/* Main axis line */}
                {isVertical ? (
                  <line x1={0} y1={-1000} x2={0} y2={1000} stroke="white" strokeOpacity="0.4" strokeWidth="2" />
                ) : (
                  <line x1={-1000} y1={0} x2={1000} y2={0} stroke="white" strokeOpacity="0.4" strokeWidth="2" />
                )}

                {/* Axis label */}
                <text
                  x={isVertical ? -20 : 350}
                  y={isVertical ? -180 : 20}
                  fill="white"
                  fillOpacity="0.7"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {axisName}
                </text>

                {/* Tick marks and numbers */}
                {getCoordinateRange().map(coord => {
                  const n = coord.value
                  const isOrigin = n === 0
                  return isVertical ? (
                    <g key={n} transform={`translate(0, ${-n * scale})`}>
                      <line 
                        x1={-4} y1={0} x2={4} y2={0} 
                        stroke="white" 
                        strokeOpacity={isOrigin ? 0.8 : 0.5} 
                        strokeWidth={isOrigin ? 2 : 1}
                      />
                      <text 
                        x={15} y={5} 
                        textAnchor="start" 
                        fill="white" 
                        fillOpacity={isOrigin ? 0.8 : 0.5}
                        fontSize={isOrigin ? "14" : "12"}
                        fontWeight={isOrigin ? "bold" : "normal"}
                      >
                        {n}
                      </text>
                    </g>
                  ) : (
                    <g key={n} transform={`translate(${n * scale}, 0)`}>
                      <line 
                        x1={0} y1={-4} x2={0} y2={4} 
                        stroke="white" 
                        strokeOpacity={isOrigin ? 0.8 : 0.5} 
                        strokeWidth={isOrigin ? 2 : 1}
                      />
                      <text 
                        x={0} y={20} 
                        textAnchor="middle" 
                        fill="white" 
                        fillOpacity={isOrigin ? 0.8 : 0.5}
                        fontSize={isOrigin ? "14" : "12"}
                        fontWeight={isOrigin ? "bold" : "normal"}
                      >
                        {n}
                      </text>
                    </g>
                  )
                })}

                {/* Variable points */}
                {variables.map((variable) => {
                  const value = parseFloat(variable.value) || 0
                  const pos = value * scale
                  
                  return isVertical ? (
                    <g key={variable.id} transform={`translate(0, ${-pos})`}>
                      <circle cx={0} cy={0} r={6} fill={variable.color} />
                      <text 
                        x={25} y={5} 
                        textAnchor="start" 
                        fill={variable.color} 
                        fontSize="14" 
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {variable.name}
                      </text>
                    </g>
                  ) : (
                    <g key={variable.id} transform={`translate(${pos}, 0)`}>
                      <circle cx={0} cy={0} r={6} fill={variable.color} />
                      <text 
                        x={0} y={-15} 
                        textAnchor="middle" 
                        fill={variable.color} 
                        fontSize="14" 
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {variable.name}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          )}

          {dimension === '2D' && (
            <svg className="absolute inset-0 w-full h-full">
              <g transform={`translate(${400 + viewOffset.x}, ${200 + viewOffset.y})`}>
                {/* Grid lines */}
                {getCoordinateRange().map(coord => (
                  <g key={`grid-${coord.value}`}>
                    <line
                      x1={coord.value * scale} y1={-400} 
                      x2={coord.value * scale} y2={400}
                      stroke="white" strokeOpacity="0.1"
                    />
                    <line
                      x1={-400} y1={-coord.value * scale}
                      x2={400} y2={-coord.value * scale}
                      stroke="white" strokeOpacity="0.1"
                    />
                  </g>
                ))}

                {/* Main axes */}
                <line x1={-1000} y1={0} x2={1000} y2={0} stroke="white" strokeOpacity="0.4" strokeWidth="2" />
                <line x1={0} y1={-1000} x2={0} y2={1000} stroke="white" strokeOpacity="0.4" strokeWidth="2" />

                {/* Axis labels */}
                <text x={350} y={-10} fill="white" fillOpacity="0.7" fontSize="14" fontWeight="bold">x</text>
                <text x={15} y={-180} fill="white" fillOpacity="0.7" fontSize="14" fontWeight="bold">y</text>

                {/* Tick marks and numbers */}
                {getCoordinateRange().map(coord => {
                  const n = coord.value
                  const isOrigin = n === 0
                  return (
                    <g key={`ticks-${n}`}>
                      {/* X-axis ticks */}
                      <line 
                        x1={n * scale} y1={-4} x2={n * scale} y2={4}
                        stroke="white" strokeOpacity={isOrigin ? 0.8 : 0.5}
                        strokeWidth={isOrigin ? 2 : 1}
                      />
                      {!isOrigin && (
                        <text 
                          x={n * scale} y={20} 
                          textAnchor="middle" 
                          fill="white" 
                          fillOpacity="0.5"
                          fontSize="12"
                        >
                          {n}
                        </text>
                      )}

                      {/* Y-axis ticks */}
                      <line 
                        x1={-4} y1={-n * scale} x2={4} y2={-n * scale}
                        stroke="white" strokeOpacity={isOrigin ? 0.8 : 0.5}
                        strokeWidth={isOrigin ? 2 : 1}
                      />
                      {!isOrigin && (
                        <text 
                          x={-15} y={-n * scale + 5} 
                          textAnchor="end" 
                          fill="white" 
                          fillOpacity="0.5"
                          fontSize="12"
                        >
                          {n}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            </svg>
          )}

          {dimension === '3D' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Infinity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">3D visualization coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}