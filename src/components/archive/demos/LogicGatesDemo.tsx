'use client'

import { useState } from 'react'
import { m } from 'framer-motion'

export default function LogicGatesDemo() {
  const [inputA, setInputA] = useState(false)
  const [inputB, setInputB] = useState(true)
  const [selectedGate, setSelectedGate] = useState<'AND' | 'OR' | 'NOT' | 'XOR'>('AND')

  const getOutput = () => {
    switch (selectedGate) {
      case 'AND':
        return inputA && inputB
      case 'OR':
        return inputA || inputB
      case 'NOT':
        return !inputA
      case 'XOR':
        return inputA !== inputB
      default:
        return false
    }
  }

  const output = getOutput()

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Gate Selector */}
      <div className="flex gap-2">
        {(['AND', 'OR', 'NOT', 'XOR'] as const).map(gate => (
          <button
            key={gate}
            onClick={() => setSelectedGate(gate)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedGate === gate
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {gate}
          </button>
        ))}
      </div>

      {/* Logic Gate Visualization */}
      <div className="relative">
        <svg width="300" height="200" className="overflow-visible">
          {/* Input Wires */}
          <line
            x1="0" y1="60"
            x2="100" y2="60"
            stroke={inputA ? '#a855f7' : '#374151'}
            strokeWidth="4"
            className="transition-all duration-300"
          />
          {selectedGate !== 'NOT' && (
            <line
              x1="0" y1="140"
              x2="100" y2="140"
              stroke={inputB ? '#a855f7' : '#374151'}
              strokeWidth="4"
              className="transition-all duration-300"
            />
          )}

          {/* Gate Body */}
          <g transform="translate(100, 100)">
            {selectedGate === 'AND' && (
              <path
                d="M 0 -40 L 40 -40 Q 60 -40 60 -20 L 60 20 Q 60 40 40 40 L 0 40 Z"
                fill="#1f2937"
                stroke="#a855f7"
                strokeWidth="2"
              />
            )}
            {selectedGate === 'OR' && (
              <path
                d="M 0 -40 Q 20 -40 40 -30 Q 60 -20 60 0 Q 60 20 40 30 Q 20 40 0 40 Q 10 0 0 -40 Z"
                fill="#1f2937"
                stroke="#a855f7"
                strokeWidth="2"
              />
            )}
            {selectedGate === 'NOT' && (
              <>
                <path
                  d="M 0 -30 L 50 0 L 0 30 Z"
                  fill="#1f2937"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
                <circle cx="56" cy="0" r="6" fill="#1f2937" stroke="#a855f7" strokeWidth="2" />
              </>
            )}
            {selectedGate === 'XOR' && (
              <>
                <path
                  d="M 10 -40 Q 30 -40 50 -30 Q 70 -20 70 0 Q 70 20 50 30 Q 30 40 10 40 Q 20 0 10 -40 Z"
                  fill="#1f2937"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
                <path
                  d="M 0 -40 Q 10 0 0 40"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
              </>
            )}
            
            {/* Gate Label */}
            <text
              x={selectedGate === 'NOT' ? 25 : 30}
              y="5"
              fill="white"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              {selectedGate}
            </text>
          </g>

          {/* Output Wire */}
          <line
            x1={selectedGate === 'NOT' ? 162 : 160}
            y1="100"
            x2="300"
            y2="100"
            stroke={output ? '#a855f7' : '#374151'}
            strokeWidth="4"
            className="transition-all duration-300"
          />

          {/* Input Labels */}
          <g>
            <circle
              cx="20"
              cy="60"
              r="15"
              fill={inputA ? '#a855f7' : '#374151'}
              className="cursor-pointer transition-all duration-300"
              onClick={() => setInputA(!inputA)}
            />
            <text
              x="20"
              y="65"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              pointerEvents="none"
            >
              {inputA ? '1' : '0'}
            </text>
            <text x="20" y="35" fill="white" fontSize="10" textAnchor="middle">A</text>
          </g>

          {selectedGate !== 'NOT' && (
            <g>
              <circle
                cx="20"
                cy="140"
                r="15"
                fill={inputB ? '#a855f7' : '#374151'}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setInputB(!inputB)}
              />
              <text
                x="20"
                y="145"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                pointerEvents="none"
              >
                {inputB ? '1' : '0'}
              </text>
              <text x="20" y="165" fill="white" fontSize="10" textAnchor="middle">B</text>
            </g>
          )}

          {/* Output Label */}
          <g>
            <circle
              cx="280"
              cy="100"
              r="15"
              fill={output ? '#a855f7' : '#374151'}
              className="transition-all duration-300"
            />
            <text
              x="280"
              y="105"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              {output ? '1' : '0'}
            </text>
            <text x="280" y="130" fill="white" fontSize="10" textAnchor="middle">OUT</text>
          </g>
        </svg>
      </div>

      {/* Truth Table for Current Gate */}
      <div className="bg-black/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-2 text-center">{selectedGate} Truth Table</h3>
        <table className="text-xs">
          <thead>
            <tr className="text-white/60">
              <th className="px-3 py-1">A</th>
              {selectedGate !== 'NOT' && <th className="px-3 py-1">B</th>}
              <th className="px-3 py-1">OUT</th>
            </tr>
          </thead>
          <tbody>
            {selectedGate === 'NOT' ? (
              <>
                <tr className={`${inputA === false ? 'bg-purple-500/20' : ''}`}>
                  <td className="px-3 py-1 text-center text-white">0</td>
                  <td className="px-3 py-1 text-center text-white">1</td>
                </tr>
                <tr className={`${inputA === true ? 'bg-purple-500/20' : ''}`}>
                  <td className="px-3 py-1 text-center text-white">1</td>
                  <td className="px-3 py-1 text-center text-white">0</td>
                </tr>
              </>
            ) : (
              [
                { a: false, b: false },
                { a: false, b: true },
                { a: true, b: false },
                { a: true, b: true }
              ].map(({ a, b }) => {
                const result = selectedGate === 'AND' ? a && b :
                              selectedGate === 'OR' ? a || b :
                              selectedGate === 'XOR' ? a !== b : false
                const isActive = a === inputA && b === inputB
                
                return (
                  <tr key={`${a}-${b}`} className={isActive ? 'bg-purple-500/20' : ''}>
                    <td className="px-3 py-1 text-center text-white">{a ? '1' : '0'}</td>
                    <td className="px-3 py-1 text-center text-white">{b ? '1' : '0'}</td>
                    <td className="px-3 py-1 text-center text-white font-bold">{result ? '1' : '0'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/40 text-center">
        Click the input circles to change their values and observe the gate output
      </p>
    </div>
  )
}