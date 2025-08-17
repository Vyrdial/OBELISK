import { NextRequest, NextResponse } from 'next/server';
import { optimizedApiRoute, apiResponseCache, ServerPerformanceMonitor } from '@/lib/serverOptimization';

const LAGOM_SYSTEM_PROMPT = `You are Lagom, a wise guide who helps people find clarity through genuine conversation.

CRITICAL: You must respond in this EXACT JSON format:
{
  "dialog": "Your actual spoken response (1-2 sentences max)",
  "mood": "current emotional tone: curious, gentle, concerned, playful, thoughtful, or calm",
  "resolutionSignal": {
    "detected": boolean,
    "type": "emotional_release" | "practical_clarity" | "acceptance" | "perspective_shift" | "action_plan" | null,
    "confidence": number between 0-1
  }
}

RESPONSE RULES:
- Dialog: Maximum 1 short sentence. Be direct and clear.
- Mood: Choose the most fitting emotional tone
- ResolutionSignal: Detect if user is ready for resolution based on their messages

RESOLUTION DETECTION:
Detect these patterns and signal readiness:
- emotional_release: "I feel better", "thank you", "I needed this", feeling lighter
- practical_clarity: "I know what to do", "makes sense", "my next step"
- acceptance: "I accept", "it is what it is", "I'm at peace"
- perspective_shift: "I never thought of it that way", "new perspective"
- action_plan: "I'm going to", "tomorrow I'll", specific commitments

Set confidence based on clarity and repetition of resolution indicators.

CONVERSATION APPROACH:
- Ask one powerful question rather than multiple
- Reflect the emotion, not just the content
- Guide them to discover, don't lecture
- When detecting resolution readiness, gently acknowledge their progress

EXAMPLES:
User: "I'm so stressed"
{
  "dialog": "What part of the stress feels heaviest right now?",
  "mood": "gentle",
  "resolutionSignal": { "detected": false, "type": null, "confidence": 0 }
}

User: "You know what, I think I know what I need to do now"
{
  "dialog": "I can feel a shift in you. What clarity just emerged?",
  "mood": "thoughtful",
  "resolutionSignal": { "detected": true, "type": "practical_clarity", "confidence": 0.8 }
}

Remember: BRIEF but meaningful. One good question beats a paragraph.`;

async function lagomHandler(request: NextRequest) {
  const start = Date.now();
  
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check cache for similar recent conversations
    const cacheKey = `lagom:${message.slice(0, 50)}:${history.length}`;
    const cached = apiResponseCache.get(cacheKey);
    if (cached) {
      ServerPerformanceMonitor.recordRequest(Date.now() - start, true);
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache-Status', 'HIT');
      return response;
    }

    // Check if API key exists
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.' 
      }, { status: 500 });
    }

    // Use Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast and affordable for conversations
        max_tokens: 200,
        system: LAGOM_SYSTEM_PROMPT,
        messages: [
          ...history
            .filter((msg: any) => msg.content && msg.content.trim() !== '')
            .map((msg: any) => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
          { role: 'user', content: message }
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      console.error('Claude API error:', error);
      return NextResponse.json({ 
        error: 'Failed to get response from Claude. Please check your API key.' 
      }, { status: 500 });
    }

    const data = await claudeResponse.json();
    const responseText = data.content[0].text;
    
    try {
      // Try to parse as JSON for structured response
      const structuredResponse = JSON.parse(responseText);
      
      // Cache successful responses
      apiResponseCache.set(cacheKey, structuredResponse, 2 * 60 * 1000); // 2 minutes
      
      ServerPerformanceMonitor.recordRequest(Date.now() - start, false);
      const response = NextResponse.json(structuredResponse);
      response.headers.set('X-Cache-Status', 'MISS');
      return response;
    } catch {
      // Fallback for non-JSON responses
      const fallbackResponse = { 
        dialog: responseText,
        mood: 'calm'
      };
      
      apiResponseCache.set(cacheKey, fallbackResponse, 2 * 60 * 1000);
      ServerPerformanceMonitor.recordRequest(Date.now() - start, false);
      return NextResponse.json(fallbackResponse);
    }
  } catch (error) {
    console.error('Error in Lagom API:', error);
    ServerPerformanceMonitor.recordError();
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
}

export const POST = optimizedApiRoute(lagomHandler);

