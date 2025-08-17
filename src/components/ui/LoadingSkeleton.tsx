import { m } from 'framer-motion'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'avatar' | 'card' | 'button'
  width?: string | number
  height?: string | number
}

export default function LoadingSkeleton({ 
  className = '', 
  variant = 'text',
  width,
  height 
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-white/10 animate-pulse rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    avatar: 'w-12 h-12 rounded-full',
    card: 'h-48 rounded-xl',
    button: 'h-10 w-24 rounded-full'
  }
  
  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || undefined
  }
  
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}