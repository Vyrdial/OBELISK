# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for premium upgrades and stardust purchases in your Obelisk application.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Access to your Supabase project
3. Your application deployed or running locally

## Step 1: Stripe Dashboard Setup

### 1.1 Create Products and Prices

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** → **Add Product**

#### Premium Subscription Product:
- **Name**: "Obelisk Premium Membership"
- **Description**: "Unlock specialized learning features"
- **Pricing Model**: Recurring
- **Price**: $10.00 USD
- **Billing Period**: Monthly
- **Copy the Price ID** (starts with `price_`) - you'll need this for `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID`

#### Stardust Packages:
The stardust packages are created dynamically via the API, so no additional products needed.

### 1.2 Configure Webhooks

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://your-domain.com/api/payments/webhook`
3. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Save** and copy the **Signing Secret** (starts with `whsec_`)

## Step 2: Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Where to find Stripe keys:
- **Publishable Key**: Dashboard → Developers → API keys → Publishable key
- **Secret Key**: Dashboard → Developers → API keys → Secret key
- **Webhook Secret**: Dashboard → Developers → Webhooks → [Your endpoint] → Signing secret

## Step 3: Supabase Database Setup

### 3.1 Add Required Columns to Profiles Table

```sql
-- Add Stripe-related columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id 
ON profiles(stripe_subscription_id);
```

### 3.2 Create the Stardust RPC Function

Run the SQL from `add_stardust_rpc.sql` in your Supabase SQL editor.

### 3.3 Update Row Level Security (RLS)

```sql
-- Allow the service role to update profiles for payments
-- This is needed for the webhook to work
-- Make sure you're using the service role key in your webhook handler
```

## Step 4: Testing

### 4.1 Test Mode

Use Stripe's test mode with test cards:
- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`

### 4.2 Test the Flow

1. **Premium Upgrade**:
   - Go to `/upgrade`
   - Click "Upgrade to Specialized Learning"
   - Complete checkout with test card
   - Verify user's `premium` status is set to `true`

2. **Stardust Purchase**:
   - Go to `/shop`
   - Click "Purchase Stardust"
   - Select a package and checkout
   - Verify stardust is added to user's account

### 4.3 Webhook Testing

Use [ngrok](https://ngrok.com) for local webhook testing:
```bash
# Install ngrok and expose your local server
ngrok http 3000

# Use the ngrok URL for your webhook endpoint
# https://abc123.ngrok.io/api/payments/webhook
```

## Step 5: Production Deployment

1. **Switch to Live Mode** in Stripe Dashboard
2. **Update environment variables** with live keys
3. **Update webhook endpoint** to production URL
4. **Test with real payment methods**

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**:
   - Check your `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure you're using the exact signing secret from the webhook endpoint

2. **User not found errors**:
   - Verify the user ID being passed to Stripe matches your Supabase profile IDs
   - Check that the user exists before creating checkout sessions

3. **Stardust not being added**:
   - Verify the `add_stardust` RPC function exists in Supabase
   - Check webhook logs in Stripe Dashboard
   - Ensure service role key has proper permissions

### Useful Commands

```bash
# View Stripe webhook logs
stripe logs tail

# Test webhook locally
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS** in production
4. **Validate all data** before processing payments
5. **Keep your Stripe keys secure** and rotate them if compromised

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)