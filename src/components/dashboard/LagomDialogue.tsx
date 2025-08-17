'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Leaf } from 'lucide-react';
import NPCDialog, { NPCDialogData } from '@/components/npcs/NPCDialog';
import LagomFace from './LagomFace';
import ResolutionOffer from './ResolutionOffer';
import ResolutionInterface from './ResolutionInterface';
import CosmicBackground from '@/components/effects/CosmicBackground';
import ClientOnly from '@/components/effects/ClientOnly';
import { 
  ResolutionSystem,
  ResolutionPath,
  ResolutionType,
  ResolutionDetection
} from '@/lib/resolutionSystem';

export default function LagomDialogue() {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<NPCDialogData | null>(null);
  const [showingDialog, setShowingDialog] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [currentMood, setCurrentMood] = useState<'curious' | 'gentle' | 'concerned' | 'playful' | 'thoughtful' | 'calm'>('calm');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Resolution system state
  const [showResolutionOffer, setShowResolutionOffer] = useState(false);
  const [currentResolutionPath, setCurrentResolutionPath] = useState<ResolutionPath | null>(null);
  const [showResolutionInterface, setShowResolutionInterface] = useState(false);
  const [resolutionConfidence, setResolutionConfidence] = useState(0);
  
  // Default welcome messages for first interaction
  const welcomeMessages = [
    "Welcome to this peaceful space. What brings you here today?",
    "I sense you have something on your mind. Care to share?",
    "This is a safe place to explore your thoughts. What's stirring within you?",
    "The sanctuary welcomes all who seek clarity. What would you like to discuss?",
    "I'm here to listen without judgment. What's on your heart?"
  ];
  
  // Dynamic placeholder texts based on conversation state
  const placeholderTexts = {
    initial: [
      "Share what's weighing on your mind...",
      "Tell me about your day...",
      "What thoughts are you carrying...",
      "Express what you're feeling...",
      "Describe what's on your heart..."
    ],
    ongoing: [
      "Continue your thoughts...",
      "What else comes to mind...",
      "Share more if you'd like...",
      "How does that feel to you...",
      "Tell me more about that..."
    ]
  };
  
  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to start typewriter effect safely
  const startTypewriter = (text: string, delay: number = 40) => {
    // Clear any existing typewriter interval
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    
    // Reset displayed text and start typing
    setDisplayedText('');
    setIsTyping(true);
    
    let currentIndex = 0;
    typewriterIntervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        if (typewriterIntervalRef.current) {
          clearInterval(typewriterIntervalRef.current);
          typewriterIntervalRef.current = null;
        }
        // Auto-focus input after typing completes
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }
    }, delay);
  };

  // Focus input when dialog completes - but keep dialog visible
  const handleDialogComplete = () => {
    // Don't hide the dialog, just focus the input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  // Set initial placeholder
  useEffect(() => {
    if (!mounted) return;
    // Use a deterministic selection based on current time to avoid hydration mismatch
    const index = new Date().getMinutes() % placeholderTexts.initial.length;
    const initialPlaceholder = placeholderTexts.initial[index];
    setCurrentPlaceholder(initialPlaceholder);
  }, [mounted]);

  // Update placeholder when conversation state changes
  useEffect(() => {
    if (!mounted) return;
    if (hasStartedConversation) {
      // Use a deterministic selection to avoid hydration issues
      const index = new Date().getSeconds() % placeholderTexts.ongoing.length;
      const ongoingPlaceholder = placeholderTexts.ongoing[index];
      setCurrentPlaceholder(ongoingPlaceholder);
    }
  }, [hasStartedConversation, mounted]);

  // Cleanup typewriter interval on unmount
  useEffect(() => {
    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    };
  }, []);

  // Show initial welcome with variety
  useEffect(() => {
    if (!mounted) return;
    // Use deterministic selection to avoid hydration issues
    const index = new Date().getHours() % welcomeMessages.length;
    const randomWelcome = welcomeMessages[index];
    
    const welcomeTimer = setTimeout(() => {
      setCurrentDialog({
        id: 'welcome',
        npc: 'LAGOM',
        text: randomWelcome,
        requiresInteraction: false
      });
      setShowingDialog(true);
      
      // Start typewriter for welcome message
      startTypewriter(randomWelcome, 50); // Slightly slower for welcome message
    }, 800); // Longer delay for dramatic entrance
    
    return () => clearTimeout(welcomeTimer);
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    // Add user message to history
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);

    try {
      const response = await fetch('/api/lagom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: newHistory
        })
      });

      const data = await response.json();
      
      // Robust handling of structured response - prevent full JSON from showing
      let dialogText = '';
      let mood = 'calm';
      let resolutionSignal = null;
      
      try {
        // If response is a string (raw JSON), try to parse it
        if (typeof data === 'string') {
          const parsed = JSON.parse(data);
          dialogText = parsed.dialog || parsed.message || parsed.response || data;
          mood = parsed.mood || 'calm';
          resolutionSignal = parsed.resolutionSignal || null;
        } else {
          // If response is already an object
          dialogText = data.dialog || data.message || data.response || JSON.stringify(data);
          mood = data.mood || 'calm';
          resolutionSignal = data.resolutionSignal || null;
        }
        
        // Fallback: if dialogText looks like JSON, extract just the dialog part
        if (dialogText.includes('"dialog":') || dialogText.includes('"message":')) {
          const match = dialogText.match(/"dialog":\s*"([^"]+)"/);
          if (match) {
            dialogText = match[1];
          } else {
            const msgMatch = dialogText.match(/"message":\s*"([^"]+)"/);
            if (msgMatch) {
              dialogText = msgMatch[1];
            }
          }
        }
        
        // Final safety: remove any remaining JSON artifacts
        dialogText = dialogText.replace(/^[\{\[\"]|[\}\]\"]$/g, '').trim();
        
      } catch (parseError) {
        console.warn('JSON parsing failed, using raw response:', parseError);
        dialogText = typeof data === 'string' ? data : (data.dialog || data.message || 'I understand.');
      }
      
      setCurrentMood(mood);
      
      // Process resolution signal if present
      if (resolutionSignal && resolutionSignal.detected && resolutionSignal.type) {
        const path = ResolutionSystem.getResolutionPath(resolutionSignal.type);
        if (path && resolutionSignal.confidence > 0.6 && !showResolutionOffer && !showResolutionInterface) {
          setCurrentResolutionPath(path);
          setResolutionConfidence(resolutionSignal.confidence);
          // Delay showing offer until after Lagom's message is typed
          setTimeout(() => {
            setShowResolutionOffer(true);
          }, 2000);
        }
      }
      
      // Also run local resolution detection
      const detection = ResolutionSystem.detectResolution(newHistory);
      
      // If we have local detection but no API signal, and enough conversation
      if (!resolutionSignal?.detected && detection.isReady && newHistory.length >= 4) {
        const path = ResolutionSystem.getResolutionPath(detection.type);
        if (path && detection.confidence > 0.5 && !showResolutionOffer && !showResolutionInterface) {
          setCurrentResolutionPath(path);
          setResolutionConfidence(detection.confidence);
          setTimeout(() => {
            setShowResolutionOffer(true);
          }, 2500);
        }
      }
      
      // Mark that conversation has started
      setHasStartedConversation(true);
      
      // Add Lagom's response to history
      setConversationHistory([...newHistory, { role: 'assistant', content: dialogText }]);
      
      // Show Lagom's response with typewriter effect
      setTimeout(() => {
        setCurrentDialog({
          id: `dialog-${Date.now()}`,
          npc: 'LAGOM',
          text: dialogText,
          requiresInteraction: false
        });
        setShowingDialog(true);
        setIsProcessing(false);
        
        // Start typewriter effect
        startTypewriter(dialogText, 40); // 40ms per character for smooth typing
      }, 300);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  // Resolution handlers
  const handleAcceptResolution = () => {
    if (currentResolutionPath) {
      setShowResolutionOffer(false);
      setTimeout(() => {
        setShowResolutionInterface(true);
      }, 300);
    }
  };

  const handleDeclineResolution = () => {
    setShowResolutionOffer(false);
    // Add a cooldown before offering again
    setTimeout(() => {
      setCurrentResolutionPath(null);
    }, 60000); // 1 minute cooldown
  };

  const handleResolutionComplete = (feedback: number) => {
    if (currentResolutionPath) {
      console.log('Resolution completed with feedback:', feedback);
      
      // Reset states
      setShowResolutionInterface(false);
      setCurrentResolutionPath(null);
      setShowResolutionOffer(false);
      
      // Show a completion message from Lagom
      setTimeout(() => {
        setCurrentDialog({
          id: 'resolution-complete',
          npc: 'LAGOM',
          text: feedback >= 4 
            ? "I'm glad that helped bring you clarity. Remember, this peace lives within you always."
            : "Every journey toward clarity is valuable. What else would you like to explore?",
          requiresInteraction: false
        });
        setShowingDialog(true);
        
        // Reset conversation for fresh start
        setTimeout(() => {
          setConversationHistory([]);
          setHasStartedConversation(false);
        }, 5000);
      }, 500);
    }
  };

  const handleResolutionDismiss = () => {
    setShowResolutionInterface(false);
    // Keep conversation going
    inputRef.current?.focus();
  };

  const handleExerciseComplete = (exerciseId: string) => {
    console.log('Exercise completed:', exerciseId);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      {/* Cosmic Background with Drifting Planets */}
      <ClientOnly fallback={<div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/20 to-emerald-900/30" />}>
        <div className="absolute inset-0">
          <CosmicBackground 
            intensity="low" 
            enableMeteors={false} 
            enableNebula={true}
            enablePlanets={true}
          />
        </div>
      </ClientOnly>
      
      {/* Northern Lights - Bottom 1/3 */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 overflow-hidden pointer-events-none">
        {/* Wave-like Aurora Streams */}
        <div
          className="absolute w-[150%] aurora-wave-1"
          style={{
            height: '80px',
            bottom: '10%',
            left: '-25%',
            background: 'linear-gradient(to top, rgba(34, 211, 238, 0.6) 0%, rgba(34, 211, 238, 0.3) 50%, rgba(34, 211, 238, 0) 100%)',
            borderRadius: '50%',
            filter: 'blur(8px)',
            clipPath: 'polygon(0% 0%, 15% 60%, 35% 30%, 50% 70%, 65% 35%, 80% 65%, 100% 45%, 100% 0%, 0% 0%)',
            willChange: 'transform, opacity'
          }}
        />
        
        <div
          className="absolute w-[130%] aurora-wave-2"
          style={{
            height: '60px',
            bottom: '25%',
            left: '-15%',
            background: 'linear-gradient(to top, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0.2) 60%, rgba(168, 85, 247, 0) 100%)',
            borderRadius: '50%',
            filter: 'blur(6px)',
            clipPath: 'polygon(0% 0%, 20% 20%, 40% 60%, 60% 25%, 85% 55%, 100% 30%, 100% 0%, 0% 0%)',
            willChange: 'transform, opacity',
            animationDelay: '3s'
          }}
        />
        
        <div
          className="absolute w-[120%] aurora-wave-3"
          style={{
            height: '50px',
            bottom: '5%',
            left: '-10%',
            background: 'linear-gradient(to top, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.2) 70%, rgba(34, 197, 94, 0) 100%)',
            borderRadius: '50%',
            filter: 'blur(4px)',
            clipPath: 'polygon(0% 0%, 25% 55%, 45% 20%, 70% 50%, 90% 25%, 100% 40%, 100% 0%, 0% 0%)',
            willChange: 'transform, opacity',
            animationDelay: '6s'
          }}
        />
        
        <div
          className="absolute w-[110%] aurora-wave-4"
          style={{
            height: '70px',
            bottom: '35%',
            left: '-5%',
            background: 'linear-gradient(to top, rgba(219, 39, 119, 0.3) 0%, rgba(168, 85, 247, 0.2) 40%, rgba(219, 39, 119, 0) 100%)',
            borderRadius: '50%',
            filter: 'blur(10px)',
            clipPath: 'polygon(0% 0%, 30% 30%, 55% 65%, 75% 35%, 100% 50%, 100% 0%, 0% 0%)',
            willChange: 'transform, opacity',
            animationDelay: '8s'
          }}
        />
      </div>

      {/* Centered Search Bar Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Logo/Title with Face */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Leaf className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-light text-white">Lagom</h1>
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-emerald-300/60 text-sm">Guardian of the Sanctuary</p>
          
        </m.div>

        {/* Search Bar */}
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative transition-opacity duration-300"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative flex items-center gap-3 p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isProcessing ? "Lagom is contemplating..." : currentPlaceholder}
                disabled={isProcessing}
                className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-lg"
                autoFocus
              />
              <m.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                disabled={!inputValue.trim() || isProcessing}
                className="p-3 bg-gradient-to-r from-purple-500/30 to-emerald-500/30 hover:from-purple-500/40 hover:to-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/20 transition-all duration-300"
              >
                <Send className="w-5 h-5 text-white" />
              </m.button>
            </div>
          </div>
        </m.div>

        {/* Subtle hint - only show when not in dialog */}
        {!showingDialog && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/30 text-sm mt-4"
          >
            Press Enter to seek guidance
          </m.p>
        )}
      </div>

      {/* Custom Dialog Overlay for Lagom's responses */}
      {currentDialog && showingDialog && (
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-4 right-4 md:left-8 md:right-8 z-40"
        >
          <div className="glass-morphism rounded-2xl p-6 border-2 border-white/20 bg-emerald-900/10 shadow-cosmic max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              {/* NPC Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Dialog Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-emerald-300 cosmic-heading">
                    Lagom
                  </h3>
                  <span className="text-sm text-white/60">
                    Guardian of the Sanctuary
                  </span>
                </div>
                
                
                <div className="text-emerald-100 leading-relaxed text-base md:text-lg min-h-[3rem]">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-[2px] h-[1.2em] bg-emerald-300 ml-1 animate-pulse" />
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </m.div>
      )}
      
      {/* Resolution Offer */}
      {currentResolutionPath && (
        <ResolutionOffer
          path={currentResolutionPath}
          confidence={resolutionConfidence}
          onAccept={handleAcceptResolution}
          onDecline={handleDeclineResolution}
          isVisible={showResolutionOffer && !showResolutionInterface}
        />
      )}
      
      {/* Resolution Interface */}
      {currentResolutionPath && showResolutionInterface && (
        <ResolutionInterface
          resolutionPath={currentResolutionPath}
          onComplete={handleResolutionComplete}
          onReturn={handleResolutionDismiss}
        />
      )}
    </div>
  );
}