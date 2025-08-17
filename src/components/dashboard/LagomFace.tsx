'use client';

import React from 'react';
import { m } from 'framer-motion';

interface LagomFaceProps {
  mood: 'curious' | 'gentle' | 'concerned' | 'playful' | 'thoughtful' | 'calm';
  size?: 'sm' | 'md' | 'lg';
}

export default function LagomFace({ mood, size = 'md' }: LagomFaceProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const moodExpressions = {
    curious: { eyebrowY: -2, eyeScale: 1.1, mouthCurve: 'M 35 50 Q 50 45 65 50' },
    gentle: { eyebrowY: 0, eyeScale: 1, mouthCurve: 'M 35 50 Q 50 55 65 50' },
    concerned: { eyebrowY: 2, eyeScale: 0.9, mouthCurve: 'M 35 55 Q 50 50 65 55' },
    playful: { eyebrowY: -1, eyeScale: 1.2, mouthCurve: 'M 30 50 Q 50 60 70 50' },
    thoughtful: { eyebrowY: 1, eyeScale: 0.95, mouthCurve: 'M 40 52 L 60 52' },
    calm: { eyebrowY: 0, eyeScale: 1, mouthCurve: 'M 38 52 Q 50 54 62 52' }
  };

  const expression = moodExpressions[mood];

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <m.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Face circle */}
        <m.circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#lagomGradient)"
          animate={{ r: [45, 46, 45] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Eyes */}
        <m.circle
          cx="35"
          cy="40"
          r="3"
          fill="#1a3a2e"
          animate={{ scale: expression.eyeScale }}
          transition={{ duration: 0.3 }}
        />
        <m.circle
          cx="65"
          cy="40"
          r="3"
          fill="#1a3a2e"
          animate={{ scale: expression.eyeScale }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Eyebrows */}
        <m.path
          d="M 30 35 Q 35 33 40 35"
          stroke="#1a3a2e"
          strokeWidth="2"
          fill="none"
          animate={{ y: expression.eyebrowY }}
          transition={{ duration: 0.3 }}
        />
        <m.path
          d="M 60 35 Q 65 33 70 35"
          stroke="#1a3a2e"
          strokeWidth="2"
          fill="none"
          animate={{ y: expression.eyebrowY }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Mouth */}
        <m.path
          d={expression.mouthCurve}
          stroke="#1a3a2e"
          strokeWidth="2"
          fill="none"
          animate={{ d: expression.mouthCurve }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Gradient definition */}
        <defs>
          <radialGradient id="lagomGradient">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </radialGradient>
        </defs>
      </m.svg>
      
      {/* Floating particles around face */}
      {mood === 'playful' && (
        <>
          <m.div
            className="absolute w-1 h-1 bg-emerald-300 rounded-full"
            style={{ top: '20%', left: '10%' }}
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <m.div
            className="absolute w-1 h-1 bg-teal-300 rounded-full"
            style={{ top: '30%', right: '10%' }}
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </div>
  );
}