import { NextRequest, NextResponse } from 'next/server'

// Stardust packages configuration (kept for GET endpoint)
const stardustPackages = {
  small: { amount: 1000, price: 299 }, // $2.99 for 1,000 stardust
  medium: { amount: 2500, price: 699 }, // $6.99 for 2,500 stardust
  large: { amount: 5000, price: 1199 }, // $11.99 for 5,000 stardust
  mega: { amount: 12000, price: 2499 }, // $24.99 for 12,000 stardust
}

export async function POST(request: NextRequest) {
  // Stripe temporarily disabled - return early
  return NextResponse.json(
    { error: 'Payment processing temporarily unavailable' },
    { status: 503 }
  )
}

export async function GET() {
  // Return available stardust packages
  return NextResponse.json({
    packages: Object.entries(stardustPackages).map(([key, value]) => ({
      id: key,
      name: `${value.amount.toLocaleString()} Stardust`,
      amount: value.amount,
      price: value.price,
      priceFormatted: `$${(value.price / 100).toFixed(2)}`,
      bestValue: key === 'mega', // Mark mega as best value
    }))
  })
}