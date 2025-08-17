'use client';

import { m } from 'framer-motion';
import { Heart, ArrowRight, X } from 'lucide-react';
import { ResolutionType } from '@/lib/resolutionSystem';

interface ResolutionOfferProps {
  type: ResolutionType;
  confidence: number;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
}

const typeConfig = {
  'emotional-release': {
    title: 'Find Peace',
    description: 'I sense you might be ready to release and find calm',
    icon: Heart,
    color: 'from-blue-400 to-cyan-500'
  },
  'practical-clarity': {
    title: 'Get Clear',
    description: 'Ready to identify your next concrete steps?',
    icon: ArrowRight,
    color: 'from-green-400 to-emerald-500'
  },
  'acceptance': {
    title: 'Find Acceptance',
    description: 'Sometimes peace comes from letting go',
    icon: Heart,
    color: 'from-purple-400 to-pink-500'
  },
  'perspective-shift': {
    title: 'New View',
    description: 'See your situation through fresh eyes',
    icon: ArrowRight,
    color: 'from-yellow-400 to-orange-500'
  },
  'action-planning': {
    title: 'Move Forward',
    description: 'Create a clear plan for positive change',
    icon: ArrowRight,
    color: 'from-indigo-400 to-blue-500'
  }
};

export default function ResolutionOffer({ 
  type, 
  confidence, 
  onAccept, 
  onDecline, 
  onDismiss 
}: ResolutionOfferProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <m.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed bottom-24 left-4 right-4 md:left-8 md:right-8 z-30 max-w-2xl mx-auto"
    >
      <div className="glass-morphism rounded-2xl border border-white/20 shadow-cosmic backdrop-blur-xl">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white cosmic-heading">
                  {config.title}
                </h3>
                <div className="px-2 py-1 bg-emerald-500/20 rounded-full">
                  <span className="text-xs text-emerald-300">
                    {Math.round(confidence * 100)}% ready
                  </span>
                </div>
              </div>
              
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                {config.description}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <m.button
                  onClick={onAccept}
                  className={`px-4 py-2 bg-gradient-to-r ${config.color} text-white font-medium rounded-xl cosmic-button transition-all duration-300 flex items-center gap-2`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  Begin
                </m.button>
                
                <m.button
                  onClick={onDecline}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 font-medium rounded-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Not yet
                </m.button>
              </div>
            </div>
          </div>
        </div>

        {/* Gentle pulsing border */}
        <m.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.color} opacity-20 blur-sm`}
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: 1.02
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </m.div>
  );
}