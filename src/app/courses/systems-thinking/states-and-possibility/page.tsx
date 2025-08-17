'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { Zap } from 'lucide-react'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'

// Import the existing components from True/False lesson
// Note: These will be imported from the true-and-false page for now
// In the future, they should be moved to a shared components folder

// Placeholder for the potentialConcept and PotentialPathsVisualization
// These are defined in the true-and-false page and will need to be extracted later

export default function StatesAndPossibilityPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-black" />}>
        <CosmicBackground intensity="low" enableMeteors={false} enableNebula={false} enablePlanets={false} />
      </ClientOnly>
      <TopNavigationBar currentPage="States and Possibility" />
      
      <div className="fixed inset-0 pt-16 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto p-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <div className="text-center max-w-2xl">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-cosmic-aurora/10 flex items-center justify-center"
              >
                <div className="text-5xl">∇</div>
              </m.div>
              
              <h1 className="text-5xl font-bold text-white mb-4">States and Possibility</h1>
              <p className="text-xl text-white/70 mb-8">
                Understanding the space of all possible states
              </p>
              
              <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                <p className="text-white/80 mb-4">
                  This lesson explores the fundamental concept of possible states - 
                  all the ways a system could potentially exist.
                </p>
                <p className="text-white/60 text-sm">
                  Coming soon: Interactive visualizations and deep exploration of state spaces, 
                  constraints, and the nature of possibility itself.
                </p>
              </div>
              
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-white/40 text-sm"
              >
                Part of Systems Thinking
              </m.div>
            </div>
          </m.div>
        </div>
      </div>
    </div>
  )
}