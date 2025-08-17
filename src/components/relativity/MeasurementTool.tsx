'use client'

import { useState } from 'react'

interface Dot {
  id: string
  x: number
  y: number
  label?: string
  isOrigin?: boolean
}

interface MeasurementToolProps {
  dots: Dot[]
  enabled?: boolean
}

export function MeasurementTool({ dots, enabled = false }: MeasurementToolProps) {
  const [measuring, setMeasuring] = useState(false)
  const [measureStart, setMeasureStart] = useState<string | null>(null)
  const [measureEnd, setMeasureEnd] = useState<string | null>(null)

  if (!enabled || dots.length < 2) return null

  const handleDotClick = (dotId: string) => {
    if (!measureStart) {
      setMeasureStart(dotId)
    } else if (dotId !== measureStart) {
      setMeasureEnd(dotId)
      setMeasuring(true)
    }
  }

  const getDistance = () => {
    if (!measureStart || !measureEnd) return 0
    const dot1 = dots.find(d => d.id === measureStart)
    const dot2 = dots.find(d => d.id === measureEnd)
    if (!dot1 || !dot2) return 0
    
    const dx = dot2.x - dot1.x
    const dy = dot2.y - dot1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const resetMeasurement = () => {
    setMeasuring(false)
    setMeasureStart(null)
    setMeasureEnd(null)
  }

  return (
    <div className="measurement-tool">
      {!measuring ? (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="mb-2">Click two dots to measure distance</p>
          <div className="flex justify-center space-x-2">
            {dots.map(dot => (
              <button
                key={dot.id}
                onClick={() => handleDotClick(dot.id)}
                className={`w-8 h-8 rounded-full border-2 ${
                  measureStart === dot.id 
                    ? 'bg-blue-500 border-blue-700' 
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                {dot.label || dot.id}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-4 bg-green-100 rounded-lg">
          <p className="mb-2">Distance: {getDistance().toFixed(2)} units</p>
          <button
            onClick={resetMeasurement}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Measurement
          </button>
        </div>
      )}
    </div>
  )
}