'use client'

import { useState } from 'react'

interface OneDimensionSliderProps {
  position: number
  onPositionChange: (pos: number) => void
  enabled?: boolean
}

export function OneDimensionSlider({ position, onPositionChange, enabled = true }: OneDimensionSliderProps) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const updatePosition = (clientX: number) => {
      const x = (clientX - rect.left) / rect.width
      onPositionChange(Math.max(0, Math.min(1, x)))
    }
    
    updatePosition(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updatePosition(e.clientX)
    }
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="h-2 bg-gray-200 rounded-full relative cursor-pointer" onMouseDown={handleMouseDown}>
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-200"
          style={{ width: `${position * 100}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow cursor-grab active:cursor-grabbing"
          style={{ left: `${position * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        />
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        Position: {(position * 100).toFixed(1)}%
      </div>
    </div>
  )
}