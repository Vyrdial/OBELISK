import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  
  // Skip auth check for now to debug the AI API
  // TODO: Re-enable auth after debugging
  console.log('API endpoint called')
  
  // Check if Anthropic API key exists
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY')
    return NextResponse.json({ safe: true }) // Default to allowing if no API key
  }

  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name provided' }, { status: 400 })
    }
    
    const trimmedName = name.trim()
    
    // Basic checks only
    if (trimmedName.length === 0) {
      return NextResponse.json({ safe: false, reason: 'Name cannot be empty.' })
    }
    
    if (trimmedName.length > 20) {
      return NextResponse.json({ safe: false, reason: 'Name cannot be longer than 20 characters.' })
    }
    
    // Use Claude AI API for content moderation
    try {
      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{
            role: 'user',
            content: `Check if this display name is appropriate for a learning platform: "${trimmedName}"

ONLY reject names that contain:
- Explicit profanity or vulgar language
- Hate speech, slurs, or discriminatory language  
- Staff impersonation (admin, moderator, support, official)
- Explicit sexual content
- Threats or violence

ALLOW these types of names:
- Silly/fun names like "broski", "cheddar cheese", "banana man"
- Gaming usernames and internet slang
- Pop culture references
- Creative spellings and made-up words
- Names with numbers or symbols
- Nicknames and casual language

Output ONLY:
"1" = SAFE (allow the name)
"0" = UNSAFE (reject the name)

Be permissive - only reject clearly inappropriate content.`
          }]
        })
      })

      const aiResult = await aiResponse.json()
      console.log('Full AI Response:', JSON.stringify(aiResult, null, 2))
      
      const aiDecision = aiResult.content?.[0]?.text?.trim()
      console.log('AI Decision for name "' + trimmedName + '":', aiDecision)
      
      if (aiDecision === '1') {
        return NextResponse.json({ safe: true })
      } else if (aiDecision === '0') {
        return NextResponse.json({ 
          safe: false, 
          reason: 'This name is not appropriate for our platform.' 
        })
      } else {
        // Fallback if AI response is unexpected
        console.error('Unexpected AI response for name "' + trimmedName + '":', aiDecision)
        console.error('Full response:', aiResult)
        return NextResponse.json({ safe: true }) // Default to allowing if AI fails
      }
      
    } catch (aiError) {
      console.error('AI moderation failed:', aiError)
      // Fallback to allowing the name if AI fails
      return NextResponse.json({ safe: true })
    }
    
  } catch (error) {
    console.error('Error checking name safety:', error)
    return NextResponse.json({ error: 'Failed to check name safety' }, { status: 500 })
  }
}