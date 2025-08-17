'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, CheckCircle, Star } from 'lucide-react';
import { ResolutionPath, ResolutionExercise } from '@/lib/resolutionSystem';

interface ResolutionInterfaceProps {
  resolutionPath: ResolutionPath;
  onComplete: (rating: number) => void;
  onReturn: () => void;
}

export default function ResolutionInterface({ 
  resolutionPath, 
  onComplete, 
  onReturn 
}: ResolutionInterfaceProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<ResolutionExercise[]>(resolutionPath.exercises);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [rating, setRating] = useState(0);

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const allCompleted = exercises.every(ex => ex.isCompleted);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            handleExerciseComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const startExercise = () => {
    if (currentExercise?.duration) {
      setTimeRemaining(currentExercise.duration);
      setIsActive(true);
    }
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const handleExerciseComplete = () => {
    const updatedExercises = exercises.map((ex, index) => 
      index === currentExerciseIndex ? { ...ex, isCompleted: true } : ex
    );
    setExercises(updatedExercises);
    setIsActive(false);
    setTimeRemaining(0);

    // Check if all exercises are complete
    const allDone = updatedExercises.every(ex => ex.isCompleted);
    if (allDone) {
      setTimeout(() => setShowCompletion(true), 1000);
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRatingSubmit = () => {
    if (rating > 0) {
      onComplete(rating);
    }
  };

  if (showCompletion) {
    return (
      <div className="fixed inset-0 bg-cosmic-gradient z-50 flex items-center justify-center p-6">
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="glass-morphism rounded-3xl p-8 border border-white/20 text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              
              <h2 className="text-3xl font-bold text-white cosmic-heading mb-4">
                Journey Complete
              </h2>
              
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                {resolutionPath.completionMessage}
              </p>

              {/* Rating */}
              <div className="mb-8">
                <p className="text-white/70 mb-4">How was this experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-colors"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-white/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <m.button
                  onClick={handleRatingSubmit}
                  disabled={rating === 0}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl cosmic-button disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete Session
                </m.button>
                
                <m.button
                  onClick={onReturn}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue Talking
                </m.button>
              </div>
            </m.div>
          </div>
        </m.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-cosmic-gradient z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-white/10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <m.button
            onClick={onReturn}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Conversation
          </m.button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white cosmic-heading">
              {resolutionPath.title}
            </h1>
            <p className="text-white/60">
              {resolutionPath.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {exercises.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  exercises[index].isCompleted
                    ? 'bg-emerald-400'
                    : index === currentExerciseIndex
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <m.div
              key={currentExerciseIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-morphism rounded-3xl p-8 border border-white/20 text-center"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${resolutionPath.color} mx-auto mb-6 flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">
                  {currentExerciseIndex + 1}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white cosmic-heading mb-4">
                {currentExercise?.title}
              </h2>
              
              <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                {currentExercise?.prompt}
              </p>

              {/* Timer and controls */}
              {currentExercise?.duration && (
                <div className="mb-8">
                  <div className="text-4xl font-mono text-white mb-4">
                    {formatTime(timeRemaining || currentExercise.duration)}
                  </div>
                  
                  <div className="w-full bg-white/10 rounded-full h-2 mb-6">
                    <div 
                      className={`bg-gradient-to-r ${resolutionPath.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ 
                        width: currentExercise.duration 
                          ? `${100 - (timeRemaining / currentExercise.duration) * 100}%` 
                          : '0%'
                      }}
                    />
                  </div>

                  <div className="flex justify-center gap-4">
                    {!isActive ? (
                      <m.button
                        onClick={startExercise}
                        className={`px-6 py-3 bg-gradient-to-r ${resolutionPath.color} text-white font-semibold rounded-xl cosmic-button flex items-center gap-2`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play className="w-5 h-5" />
                        {timeRemaining > 0 ? 'Resume' : 'Begin'}
                      </m.button>
                    ) : (
                      <m.button
                        onClick={pauseExercise}
                        className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </m.button>
                    )}
                    
                    <m.button
                      onClick={handleExerciseComplete}
                      className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-xl transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Complete Now
                    </m.button>
                  </div>
                </div>
              )}

              {/* No timer exercises */}
              {!currentExercise?.duration && (
                <div className="mb-8">
                  <m.button
                    onClick={handleExerciseComplete}
                    className={`px-8 py-3 bg-gradient-to-r ${resolutionPath.color} text-white font-semibold rounded-xl cosmic-button`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </m.button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <m.button
                  onClick={previousExercise}
                  disabled={currentExerciseIndex === 0}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Previous
                </m.button>
                
                <span className="text-white/60 text-sm">
                  {currentExerciseIndex + 1} of {exercises.length}
                </span>
                
                <m.button
                  onClick={nextExercise}
                  disabled={isLastExercise}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                </m.button>
              </div>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}