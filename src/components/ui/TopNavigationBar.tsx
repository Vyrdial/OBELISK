'use client'

import { useState, useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Map, ShoppingBag, BookOpen, Users, LayoutDashboard, Bell, Star, FlaskConical, Library, Puzzle } from 'lucide-react'
import StardustCounter from '@/components/ui/StardustCounter'
import MassVisualization from '@/components/mass/MassVisualization'
import ProfileDropdown from '@/components/ui/ProfileDropdown'
import { useProfile } from '@/hooks/useProfile'
import { useMassSystem } from '@/hooks/useMassSystem'
import { useStardustAnimation } from '@/contexts/StardustAnimationContext'

const navigationItems = [
  {
    icon: Home,
    label: 'Home',
    path: '/home'
  },
  {
    icon: FlaskConical,
    label: 'Sandbox',
    path: '/sandbox'
  },
  {
    icon: Map,
    label: 'Courses',
    path: '/courses'
  },
  {
    icon: Puzzle,
    label: 'Puzzles',
    path: '/puzzles'
  },
  {
    icon: ShoppingBag,
    label: 'Shop',
    path: '/shop'
  },
  {
    icon: Library,
    label: 'Archive',
    path: '/archive'
  }
]

export default function TopNavigationBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, loading: profileLoading } = useProfile()
  const massSystem = useMassSystem()
  const { displayStardust } = useStardustAnimation()
  
  // Prevent hydration flicker by showing loading state
  const [isClient, setIsClient] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <m.header 
      className="relative z-30 p-4 border-b border-white/10 bg-gradient-to-r from-gray-900/60 via-blue-950/50 to-gray-900/60 backdrop-blur-xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto relative flex items-center">
        {/* Left: Logo/Brand */}
        <div className="flex items-center gap-4">
          <m.div 
            className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent cursor-pointer"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) {
                window.open('/home', '_blank')
              } else {
                router.push('/home')
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.03, ease: "easeOut" }}
          >
            OBELISK
          </m.div>
        </div>

        {/* Center: Navigation Menu - Absolutely centered */}
        <nav className="hidden md:flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <m.button
                key={item.path}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) {
                    window.open(item.path, '_blank')
                  } else {
                    router.push(item.path)
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.03, ease: "easeOut" }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </m.button>
            )
          })}
        </nav>

        {/* Mobile Navigation Menu - Show only essential items */}
        <nav className="md:hidden flex items-center gap-1">
          {navigationItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.path
            return (
              <m.button
                key={item.path}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) {
                    window.open(item.path, '_blank')
                  } else {
                    router.push(item.path)
                  }
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.03, ease: "easeOut" }}
                title={item.label}
              >
                <item.icon className="w-4 h-4" />
              </m.button>
            )
          })}
        </nav>

        {/* Right: User Info & Profile */}
        <div className="flex items-center gap-4 ml-auto">
          {isClient ? (
            <StardustCounter 
              count={displayStardust} 
              size="md" 
              clickable={true}
              onClick={() => router.push('/stardust')}
            />
          ) : (
            <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse" />
          )}
          
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <m.button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:bg-white/20 transition-all duration-200 relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.03, ease: "easeOut" }}
            >
              <Bell className="w-5 h-5 text-white/70" />
            </m.button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <m.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 glass-morphism rounded-xl border border-white/10 shadow-2xl z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                </div>
                
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <m.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cosmic-aurora/20 to-cosmic-starlight/20 border border-cosmic-aurora/30 flex items-center justify-center"
                    >
                      <Bell className="w-8 h-8 text-cosmic-aurora" />
                    </m.div>
                  </div>
                  
                  <h4 className="text-white font-semibold mb-2">All caught up! ✨</h4>
                  <p className="text-white/60 text-sm mb-4">
                    The cosmic void is peaceful... for now. Your notifications will appear here when the universe has something important to tell you.
                  </p>
                  
                  <div className="text-xs text-white/40 italic">
                    🌌 "In space, no one can hear you... get notifications"
                  </div>
                </div>
              </m.div>
            )}
          </div>

          <ProfileDropdown />
        </div>
      </div>
    </m.header>
  )
}