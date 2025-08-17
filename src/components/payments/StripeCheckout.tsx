'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { m } from 'framer-motion'
import { ShoppingBag, Loader2 } from 'lucide-react'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface StripeCheckoutProps {
  priceId?: string
  userId: string
  type: 'premium' | 'stardust'
  packageType?: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export default function StripeCheckout({
  priceId,
  userId,
  type,
  packageType,
  children,
  className = '',
  disabled = false
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)

    try {
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error('Stripe publishable key is not configured')
        alert('Payment system is not configured. Please contact support.')
        setIsLoading(false)
        return
      }

      const stripe = await stripePromise

      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      let response
      if (type === 'stardust') {
        // Use stardust-specific endpoint
        response = await fetch('/api/payments/stardust', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageType,
            userId,
          }),
        })
      } else {
        // Use general checkout endpoint for premium
        response = await fetch('/api/payments/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            userId,
            type,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <m.button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </div>
      ) : (
        children
      )}
    </m.button>
  )
}