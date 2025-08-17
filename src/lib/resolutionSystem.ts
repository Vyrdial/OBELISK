export interface ResolutionDetection {
  isReady: boolean;
  confidence: number;
  type: ResolutionType;
  triggers: string[];
}

export type ResolutionType = 
  | 'emotional-release' 
  | 'practical-clarity' 
  | 'acceptance' 
  | 'perspective-shift' 
  | 'action-planning';

export interface ResolutionPath {
  type: ResolutionType;
  title: string;
  description: string;
  color: string;
  exercises: ResolutionExercise[];
  completionMessage: string;
}

export interface ResolutionExercise {
  id: string;
  title: string;
  prompt: string;
  type: 'reflection' | 'breathing' | 'writing' | 'visualization';
  duration?: number; // in seconds
  isCompleted: boolean;
}

export class ResolutionSystem {
  // Detection patterns for resolution readiness
  private static resolutionSignals = {
    emotional: [
      'feel better', 'clearer now', 'makes sense', 'understand',
      'relief', 'lighter', 'peaceful', 'calm', 'settled'
    ],
    practical: [
      'what should i do', 'next steps', 'plan', 'action',
      'move forward', 'decision', 'path forward'
    ],
    acceptance: [
      'accept', 'let go', 'nothing i can do', 'out of my control',
      'peace with', 'ok with', 'come to terms'
    ],
    perspective: [
      'see it differently', 'new way', 'perspective', 'bigger picture',
      'lesson', 'growth', 'learning', 'opportunity'
    ],
    completion: [
      'enough for now', 'helped a lot', 'ready to stop',
      'feeling complete', 'good place to end'
    ]
  };

  static detectResolution(conversation: Array<{role: string, content: string}>): ResolutionDetection {
    if (conversation.length < 4) {
      return { isReady: false, confidence: 0, type: 'emotional-release', triggers: [] };
    }

    const recentMessages = conversation.slice(-3);
    const userMessages = recentMessages.filter(msg => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';

    let maxConfidence = 0;
    let detectedType: ResolutionType = 'emotional-release';
    let triggers: string[] = [];

    // Check each resolution type
    for (const [type, signals] of Object.entries(this.resolutionSignals)) {
      const matchedSignals = signals.filter(signal => 
        lastUserMessage.includes(signal.toLowerCase())
      );
      
      if (matchedSignals.length > 0) {
        const confidence = Math.min(matchedSignals.length * 0.3 + 0.4, 1.0);
        
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          detectedType = this.mapTypeToResolution(type);
          triggers = matchedSignals;
        }
      }
    }

    // Additional heuristics
    const messageLength = lastUserMessage.length;
    const isShortPositive = messageLength < 50 && this.containsPositiveWords(lastUserMessage);
    
    if (isShortPositive && maxConfidence < 0.3) {
      maxConfidence = 0.4;
      triggers.push('positive-short-response');
    }

    // Check for conversation stability (similar topics discussed)
    const conversationStability = this.assessTopicStability(conversation);
    if (conversationStability > 0.7 && maxConfidence > 0.3) {
      maxConfidence = Math.min(maxConfidence + 0.2, 1.0);
    }

    return {
      isReady: maxConfidence >= 0.5,
      confidence: maxConfidence,
      type: detectedType,
      triggers
    };
  }

  private static mapTypeToResolution(type: string): ResolutionType {
    const mapping: Record<string, ResolutionType> = {
      emotional: 'emotional-release',
      practical: 'practical-clarity',
      acceptance: 'acceptance',
      perspective: 'perspective-shift',
      completion: 'action-planning'
    };
    return mapping[type] || 'emotional-release';
  }

  private static containsPositiveWords(text: string): boolean {
    const positiveWords = ['good', 'better', 'helpful', 'clear', 'understand', 'thanks'];
    return positiveWords.some(word => text.includes(word));
  }

  private static assessTopicStability(conversation: Array<{role: string, content: string}>): number {
    // Simple heuristic: if last 3 user messages are about similar themes
    const userMessages = conversation
      .filter(msg => msg.role === 'user')
      .slice(-3)
      .map(msg => msg.content.toLowerCase());

    if (userMessages.length < 2) return 0;

    // Count word overlap between messages
    const words1 = userMessages[0].split(' ').filter(w => w.length > 3);
    const words2 = userMessages[userMessages.length - 1].split(' ').filter(w => w.length > 3);
    
    const overlap = words1.filter(word => words2.includes(word)).length;
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? overlap / totalWords : 0;
  }

  static getResolutionPath(type: ResolutionType): ResolutionPath {
    const paths: Record<ResolutionType, ResolutionPath> = {
      'emotional-release': {
        type: 'emotional-release',
        title: 'Emotional Release',
        description: 'Let your feelings flow and find peace',
        color: 'from-blue-400 to-cyan-500',
        exercises: [
          {
            id: 'acknowledge',
            title: 'Acknowledge Your Feelings',
            prompt: 'Take a moment to acknowledge what you\'ve shared. Your feelings are valid.',
            type: 'reflection',
            duration: 30,
            isCompleted: false
          },
          {
            id: 'breathe',
            title: 'Calming Breath',
            prompt: 'Breathe deeply. In through your nose, out through your mouth. Let each breath carry away tension.',
            type: 'breathing',
            duration: 60,
            isCompleted: false
          },
          {
            id: 'release',
            title: 'Gentle Release',
            prompt: 'Imagine your worries floating away like clouds. You\'ve done what you can for now.',
            type: 'visualization',
            duration: 45,
            isCompleted: false
          }
        ],
        completionMessage: 'You\'ve honored your feelings and found a moment of peace. Remember, it\'s okay to feel what you feel.'
      },
      'practical-clarity': {
        type: 'practical-clarity',
        title: 'Clear Next Steps',
        description: 'Identify concrete actions you can take',
        color: 'from-green-400 to-emerald-500',
        exercises: [
          {
            id: 'clarify',
            title: 'Clarify the Situation',
            prompt: 'What is the core issue you want to address? State it simply.',
            type: 'reflection',
            duration: 45,
            isCompleted: false
          },
          {
            id: 'options',
            title: 'Explore Options',
            prompt: 'What are 2-3 practical steps you could take? Even small steps count.',
            type: 'writing',
            duration: 90,
            isCompleted: false
          },
          {
            id: 'commit',
            title: 'Choose Your First Step',
            prompt: 'Which step feels most manageable right now? Commit to when you\'ll take it.',
            type: 'reflection',
            duration: 30,
            isCompleted: false
          }
        ],
        completionMessage: 'You have clarity on your path forward. Trust yourself to take the next step when you\'re ready.'
      },
      'acceptance': {
        type: 'acceptance',
        title: 'Finding Acceptance',
        description: 'Make peace with what cannot be changed',
        color: 'from-purple-400 to-pink-500',
        exercises: [
          {
            id: 'acknowledge-limits',
            title: 'Acknowledge What\'s Beyond Control',
            prompt: 'Some things are beyond our influence. That\'s part of being human.',
            type: 'reflection',
            duration: 45,
            isCompleted: false
          },
          {
            id: 'focus-within',
            title: 'Focus on Your Response',
            prompt: 'While you can\'t control everything, you can choose how you respond. That\'s your power.',
            type: 'reflection',
            duration: 60,
            isCompleted: false
          },
          {
            id: 'peace',
            title: 'Cultivate Inner Peace',
            prompt: 'Take three deep breaths and release the need to control what you cannot change.',
            type: 'breathing',
            duration: 75,
            isCompleted: false
          }
        ],
        completionMessage: 'Acceptance is not giving up—it\'s freeing yourself to focus on what you can influence.'
      },
      'perspective-shift': {
        type: 'perspective-shift',
        title: 'New Perspective',
        description: 'See your situation through fresh eyes',
        color: 'from-yellow-400 to-orange-500',
        exercises: [
          {
            id: 'step-back',
            title: 'Step Back',
            prompt: 'Imagine viewing your situation from above, like you\'re watching a movie. What do you notice?',
            type: 'visualization',
            duration: 60,
            isCompleted: false
          },
          {
            id: 'growth',
            title: 'Find the Growth',
            prompt: 'What might this experience be teaching you? What strengths are you discovering?',
            type: 'reflection',
            duration: 75,
            isCompleted: false
          },
          {
            id: 'future-self',
            title: 'Future Wisdom',
            prompt: 'What would your future self, who has moved through this, want you to know right now?',
            type: 'reflection',
            duration: 45,
            isCompleted: false
          }
        ],
        completionMessage: 'Every challenge carries the seeds of wisdom. You\'re growing stronger than you realize.'
      },
      'action-planning': {
        type: 'action-planning',
        title: 'Moving Forward',
        description: 'Create a clear plan for positive change',
        color: 'from-indigo-400 to-blue-500',
        exercises: [
          {
            id: 'vision',
            title: 'Envision Your Goal',
            prompt: 'What does success look like for you? Paint a clear picture in your mind.',
            type: 'visualization',
            duration: 60,
            isCompleted: false
          },
          {
            id: 'plan',
            title: 'Create Your Plan',
            prompt: 'Break your goal into 3-5 manageable steps. What\'s the very first thing you\'ll do?',
            type: 'writing',
            duration: 120,
            isCompleted: false
          },
          {
            id: 'commitment',
            title: 'Seal Your Commitment',
            prompt: 'Take a moment to commit to your first step. You have everything you need to begin.',
            type: 'reflection',
            duration: 30,
            isCompleted: false
          }
        ],
        completionMessage: 'You have a clear path forward. Trust in your ability to take it one step at a time.'
      }
    };

    return paths[type];
  }
}