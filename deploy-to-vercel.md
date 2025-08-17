# Quick Vercel Deployment

## 1. Install Vercel CLI
```bash
npm install -g vercel
```

## 2. Deploy
```bash
# In your project directory
vercel

# Follow the prompts:
# - Link to existing project? N
# - Project name? obelisk
# - Directory? ./
# - Override settings? N
```

## 3. Add Environment Variables
```bash
# Add each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID

# Redeploy with env vars
vercel --prod
```

This gives you a real domain like `https://obelisk-xyz.vercel.app`