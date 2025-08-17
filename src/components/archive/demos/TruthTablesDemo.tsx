'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'

export default function TruthTablesDemo() {
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null)
  const [selectedOperation, setSelectedOperation] = useState<'AND' | 'OR' | 'NAND' | 'NOR'>('AND')

  const operations = {
    AND: (a: boolean, b: boolean) => a && b,
    OR: (a: boolean, b: boolean) => a || b,
    NAND: (a: boolean, b: boolean) => !(a && b),
    NOR: (a: boolean, b: boolean) => !(a || b)
  }

  const rows = [
    { a: false, b: false },
    { a: false, b: true },
    { a: true, b: false },
    { a: true, b: true }
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Operation Selector */}
      <div className="flex gap-2">
        {(Object.keys(operations) as Array<keyof typeof operations>).map(op => (
          <button
            key={op}
            onClick={() => setSelectedOperation(op)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedOperation === op
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Interactive Truth Table */}
      <div className="bg-black/30 rounded-lg p-6">
        <table className="text-sm">
          <thead>
            <tr className="text-white/80 border-b border-white/20">
              <th className="px-6 py-2">Input A</th>
              <th className="px-6 py-2">Input B</th>
              <th className="px-6 py-2 text-purple-400">{selectedOperation}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const result = operations[selectedOperation](row.a, row.b)
              const isHighlighted = highlightedRow === index
              
              return (
                <m.tr
                  key={index}
                  className={`cursor-pointer transition-all duration-200 ${
                    isHighlighted ? 'bg-purple-500/30' : 'hover:bg-white/5'
                  }`}
                  onMouseEnter={() => setHighlightedRow(index)}
                  onMouseLeave={() => setHighlightedRow(null)}
                  animate={{
                    scale: isHighlighted ? 1.02 : 1,
                  }}
                >
                  <td className="px-6 py-3 text-center">
                    <m.div
                      className={`inline-block px-3 py-1 rounded ${
                        row.a ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                      }`}
                      animate={{
                        rotate: isHighlighted ? 360 : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {row.a ? '1' : '0'}
                    </m.div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <m.div
                      className={`inline-block px-3 py-1 rounded ${
                        row.b ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                      }`}
                      animate={{
                        rotate: isHighlighted ? -360 : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {row.b ? '1' : '0'}
                    </m.div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <m.div
                      className={`inline-block px-3 py-1 rounded font-bold ${
                        result ? 'bg-purple-500/30 text-purple-400' : 'bg-gray-500/30 text-gray-400'
                      }`}
                      animate={{
                        scale: isHighlighted ? 1.2 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {result ? '1' : '0'}
                    </m.div>
                  </td>
                </m.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pattern Visualization */}
      <div className="grid grid-cols-4 gap-4">
        {rows.map((row, index) => {
          const result = operations[selectedOperation](row.a, row.b)
          const isHighlighted = highlightedRow === index
          
          return (
            <m.div
              key={index}
              className="flex flex-col items-center gap-2"
              animate={{
                y: isHighlighted ? -10 : 0
              }}
            >
              <div className="flex gap-1">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  row.a ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {row.a ? '1' : '0'}
                </div>
                <div className="flex items-center text-white/40">+</div>
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  row.b ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {row.b ? '1' : '0'}
                </div>
              </div>
              <div className="text-white/40">↓</div>
              <m.div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                  result ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-500'
                }`}
                animate={{
                  rotate: isHighlighted ? 360 : 0,
                  scale: isHighlighted ? 1.2 : 1
                }}
                transition={{ duration: 0.5 }}
              >
                {result ? '1' : '0'}
              </m.div>
            </m.div>
          )
        })}
      </div>

      {/* Operation Description */}
      <AnimatePresence mode="wait">
        <m.div
          key={selectedOperation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center max-w-md"
        >
          <h3 className="text-sm font-semibold text-purple-400 mb-2">{selectedOperation} Gate</h3>
          <p className="text-xs text-white/60">
            {selectedOperation === 'AND' && 'Outputs 1 only when both inputs are 1'}
            {selectedOperation === 'OR' && 'Outputs 1 when at least one input is 1'}
            {selectedOperation === 'NAND' && 'Outputs 0 only when both inputs are 1 (inverted AND)'}
            {selectedOperation === 'NOR' && 'Outputs 1 only when both inputs are 0 (inverted OR)'}
          </p>
        </m.div>
      </AnimatePresence>

      <p className="text-xs text-white/40 text-center">
        Hover over rows to see how inputs combine to produce outputs
      </p>
    </div>
  )
}