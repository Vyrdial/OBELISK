'use client'

import { m } from 'framer-motion'
import { useState } from 'react'
import { RANK_HIERARCHY, type Rank } from '@/types/ranks'
import { ChevronDown, ChevronUp, Sparkles, Crown } from 'lucide-react'

interface RankHierarchyProps {
  currentUserStardust?: number
  highlightUserRank?: boolean
  showDescriptions?: boolean
  compact?: boolean
}

export default function RankHierarchy({ 
  currentUserStardust = 0, 
  highlightUserRank = true,
  showDescriptions = true,
  compact = false
}: RankHierarchyProps) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null)
  
  const getUserCurrentRank = () => {
    let currentRank = RANK_HIERARCHY[0]
    for (const rank of RANK_HIERARCHY) {
      if (currentUserStardust >= rank.requiredStardust) {
        currentRank = rank
      } else {
        break
      }
    }
    return currentRank
  }

  const userRank = getUserCurrentRank()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  if (compact && !isExpanded) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-morphism rounded-xl p-4 border border-white/20"
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between text-white hover:text-cosmic-starlight transition-colors duration-75"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-cosmic-starlight" />
            <span className="font-semibold">Rank Hierarchy</span>
            <span className="text-sm text-white/60">({RANK_HIERARCHY.length} ranks)</span>
          </div>
          <ChevronDown className="w-5 h-5" />
        </button>
      </m.div>
    )
  }

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="glass-morphism rounded-2xl p-6 border border-white/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-cosmic-starlight" />
          <h3 className="text-xl font-bold text-white cosmic-heading">
            The Path of Ascension
          </h3>
        </div>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-75"
          >
            <ChevronUp className="w-5 h-5 text-white/60" />
          </button>
        )}
      </div>

      {/* Rank List */}
      <div className="space-y-3">
        {RANK_HIERARCHY.map((rank, index) => {
          const isUserRank = highlightUserRank && rank.id === userRank.id
          const isAchieved = currentUserStardust >= rank.requiredStardust
          const isSelected = selectedRank?.id === rank.id

          return (
            <m.div
              key={rank.id}
              variants={itemVariants}
              className={`
                relative rounded-xl p-4 border transition-all duration-75 duration-300 cursor-pointer
                ${isUserRank 
                  ? 'border-cosmic-starlight bg-gradient-to-r from-cosmic-starlight/10 to-cosmic-aurora/10 shadow-cosmic' 
                  : isAchieved
                  ? 'border-white/30 bg-white/5 hover:bg-white/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                }
                ${isSelected ? 'ring-2 ring-cosmic-starlight/50' : ''}
              `}
              onClick={() => setSelectedRank(isSelected ? null : rank)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Rank Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank Icon */}
                  <div className={`
                    text-2xl w-12 h-12 rounded-full border-2 flex items-center justify-center
                    ${isUserRank 
                      ? 'border-cosmic-starlight bg-cosmic-starlight/20' 
                      : isAchieved
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/20 bg-white/5'
                    }
                  `}>
                    {rank.icon}
                  </div>

                  {/* Rank Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-lg ${rank.color}`}>
                        {rank.name}
                      </h4>
                      {isUserRank && (
                        <m.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4 text-cosmic-starlight" />
                        </m.div>
                      )}
                    </div>
                    <p className="text-white/80 text-sm font-medium">
                      {rank.title}
                    </p>
                  </div>
                </div>

                {/* Stardust Requirement */}
                <div className="text-right">
                  <div className="text-cosmic-stardust font-bold">
                    {rank.requiredStardust === 0 ? 'Start' : `${rank.requiredStardust.toLocaleString()}`}
                  </div>
                  <div className="text-white/60 text-xs">
                    {rank.requiredStardust === 0 ? 'Journey begins' : 'Stardust required'}
                  </div>
                </div>
              </div>

              {/* Expanded Description */}
              {showDescriptions && isSelected && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <p className="text-white/70 leading-relaxed mb-3">
                    {rank.description}
                  </p>
                  {rank.philosophy && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/80 italic text-sm leading-relaxed">
                        &quot;{rank.philosophy}&quot;
                      </p>
                    </div>
                  )}
                </m.div>
              )}

              {/* User Progress Bar (only for current rank) */}
              {isUserRank && highlightUserRank && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>Current Progress</span>
                    <span>{currentUserStardust.toLocaleString()} Stardust</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <m.div
                      className="bg-gradient-to-r from-cosmic-starlight to-cosmic-aurora h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, ((currentUserStardust - rank.requiredStardust) / 
                          ((RANK_HIERARCHY[index + 1]?.requiredStardust || rank.requiredStardust + 1000) - rank.requiredStardust)) * 100)}%`
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </m.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cosmic-starlight"></div>
            <span>Your Current Rank</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/30"></div>
            <span>Achieved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10"></div>
            <span>Future Goal</span>
          </div>
        </div>
      </div>
    </m.div>
  )
}