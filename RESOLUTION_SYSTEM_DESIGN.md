# Sanctuary Resolution System Design

## Overview
The Resolution System helps users reach meaningful closure in their sanctuary conversations with Lagom. It detects when users are ready for resolution and guides them through exercises that lead to emotional release, practical clarity, acceptance, or perspective shifts.

## Core Components

### 1. Resolution Detection

#### Automatic Detection
- **API-based**: Lagom's AI detects resolution readiness through conversation patterns
- **Local detection**: Fallback system analyzes conversation metrics
- **Dual confidence thresholds**: API (0.6) and local (0.5) to balance sensitivity

#### Detection Signals
- **Emotional Release**: "I feel better", "thank you", "weight off shoulders"
- **Practical Clarity**: "I know what to do", "makes sense", "my next step"
- **Acceptance**: "I accept", "it is what it is", "I'm at peace"
- **Perspective Shift**: "never thought of it that way", "new perspective"
- **Action Plan**: "I'm going to", "tomorrow I'll", specific commitments

### 2. Resolution Paths

Each path includes:
- **Guiding Prompts**: 3 reflective questions from Lagom
- **Interactive Exercises**: 2-3 activities (1-5 minutes each)
- **Completion Criteria**: Metrics for successful resolution

#### Path Types

1. **Emotional Release** (Heart icon, Rose gradient)
   - Cosmic Breathing exercise
   - Letter to the Stars exercise
   - Focus: Physical and emotional release

2. **Practical Clarity** (Compass icon, Blue gradient)
   - Star Map Forward (action planning)
   - Meteor Shield (obstacle preparation)
   - Focus: Clear next steps

3. **Cosmic Acceptance** (Circle icon, Emerald gradient)
   - Orbital Perspective visualization
   - Cosmic Gratitude practice
   - Focus: Peace with what is

4. **New Perspective** (Eye icon, Purple gradient)
   - Cosmic Reframe exercise
   - Ancient Wisdom visualization
   - Focus: Expanded viewpoint

### 3. User Experience Flow

1. **Detection Phase**
   - Conversation continues naturally
   - System monitors for resolution signals
   - No interruption until confidence threshold met

2. **Offer Phase**
   - Gentle slide-up card appears
   - Non-intrusive positioning
   - Clear accept/decline options
   - "Lagom senses you're ready" indicator for high confidence

3. **Resolution Phase**
   - Full-screen interface with exercises
   - Progress tracking
   - Option to dismiss and continue talking
   - Timer-based or self-paced activities

4. **Completion Phase**
   - User rates helpfulness (1-5 stars)
   - Lagom provides closing message
   - Conversation can continue or reset

## Design Principles

### 1. User Agency
- Never force resolution
- Easy to decline or dismiss
- Can return to conversation anytime
- 1-minute cooldown after declining

### 2. Natural Integration
- 2-2.5 second delay before showing offers
- Appears after Lagom's response is typed
- Smooth transitions between states
- Maintains conversation context

### 3. Psychological Safety
- Gentle, non-pushy language
- Multiple exercise types for different needs
- Acknowledges all levels of engagement
- Positive reinforcement regardless of path

### 4. Visual Harmony
- Glassmorphism consistent with app design
- Subtle animations and particles
- Color-coded by resolution type
- Cosmic theme throughout

## Technical Implementation

### Resolution Detector
- Analyzes conversation metrics
- Tracks emotional intensity and progression
- Identifies key themes and topic stability
- Pattern matching for resolution indicators

### Resolution Tracker
- Manages resolution progress
- Tracks completed exercises
- Stores user feedback
- Enables analytics for improvement

### API Integration
- Lagom AI includes resolution signals in responses
- Structured JSON format for reliable parsing
- Fallback to local detection if needed

## Success Metrics

1. **Engagement Rate**: % of users who accept resolution offers
2. **Completion Rate**: % who finish resolution paths
3. **Satisfaction Score**: Average star rating
4. **Resolution Effectiveness**: Self-reported feeling better
5. **Return Rate**: Users who continue after resolution

## Future Enhancements

1. **Personalization**
   - Learn user's preferred resolution styles
   - Adapt exercises based on past sessions
   - Remember successful techniques

2. **Extended Exercises**
   - Guided meditations
   - Journaling prompts
   - Creative expression activities

3. **Progress Tracking**
   - Resolution history
   - Pattern insights
   - Growth visualization

4. **Community Features**
   - Anonymous shared wisdom
   - Resolution success stories
   - Peer support options

## Ethical Considerations

1. **Not Therapy**: Clear boundaries that this is support, not clinical treatment
2. **Crisis Handling**: Detect and redirect serious mental health concerns
3. **Data Privacy**: Conversation data handled sensitively
4. **Cultural Sensitivity**: Exercises work across different backgrounds
5. **Accessibility**: Works for various emotional and cognitive states

## Testing Scenarios

1. **Quick Resolution**: User finds clarity in 3-4 messages
2. **Extended Processing**: Long conversation before readiness
3. **Multiple Resolutions**: User works through several issues
4. **Resistance**: User declines offers but continues talking
5. **Interrupted Flow**: User dismisses mid-resolution

The Resolution System transforms the sanctuary from an endless conversation space into a purposeful journey toward peace and clarity, while always respecting the user's autonomy and pace.