import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Stripe temporarily disabled - return early
  return NextResponse.json(
    { error: 'Payment processing temporarily unavailable' },
    { status: 503 }
  )
}