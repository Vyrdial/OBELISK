'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

interface NoSSRProps {
  children: ReactNode
  fallback?: ReactNode
}

function NoSSRWrapper({ children, fallback }: NoSSRProps) {
  return <>{children}</>
}

const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
})

export default NoSSR

// Higher-order component for wrapping components that should not SSR
export function withNoSSR<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
): ComponentType<P> {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
    loading: () => <>{fallback}</> || null,
  }) as ComponentType<P>
}