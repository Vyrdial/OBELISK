import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, correctAnswer, explanation, userQuestion } = await request.json()
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Anthropic API key not configured')
      return NextResponse.json({
        response: "I'm sorry, the AI tutor is not available right now. Please check with support.",
        success: false
      }, { status: 500 })
    }

    // Get the answer text for context
    const options = Array.isArray(question) ? question : []
    const userAnswerText = options[userAnswer] || 'No answer selected'
    const correctAnswerText = options[correctAnswer] || 'Unknown'

    // Create a comprehensive prompt for the AI tutor
    const systemPrompt = `Answer quiz clarifications with maximum 2 short sentences. Be direct and clear.

Context: Question=${question}, Student Answer=${userAnswerText}, Correct=${correctAnswerText}, ${userAnswer === correctAnswer ? 'CORRECT' : 'INCORRECT'}

Student asks: ${userQuestion}

Rules: 
- Maximum 2 sentences
- Be direct, no fluff
- Give core insight only`

    const completion = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 100,
      temperature: 0.7,
      messages: [
        { role: "user", content: `${systemPrompt}\n\nStudent's Question: ${userQuestion}` }
      ]
    })

    const aiResponse = completion.content[0]?.type === 'text' ? completion.content[0].text : 
      "I'm sorry, I couldn't generate a response. Please try rephrasing your question."

    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    })
  } catch (error) {
    console.error('AI API error:', error)
    
    // Provide a more helpful fallback response
    const fallbackResponse = `I'm having trouble connecting to the AI tutor right now. Please try asking your question again in a moment, or feel free to continue with the quiz.`

    return NextResponse.json({
      response: fallbackResponse,
      success: false
    }, { status: 500 })
  }
}