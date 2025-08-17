'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { User, LogOut, HelpCircle, Settings, Keyboard, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { useCosmetics } from '@/hooks/useCosmetics'
import { useProfileNavigation } from '@/lib/profileNavigation'
import EquippedAvatar from './EquippedAvatar'

export default function ProfileDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const { forceUpdate } = useCosmetics()
  const { goToProfile } = useProfileNavigation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        // Clear any local state and redirect
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Sign out failed:', error)
      // Force redirect even if sign out fails
      router.push('/')
      router.refresh()
    }
  }

  const handleAvatarClick = () => {
    // Always open dropdown on click
    setIsOpen(!isOpen)
  }

  const menuItems = [
    // Only show upgrade option for non-premium users
    ...(!profile?.is_premium ? [{
      icon: Crown,
      label: 'Upgrade',
      action: () => {
        setIsOpen(false)
        router.push('/upgrade')
      },
      highlight: true
    }] : []),
    {
      icon: User,
      label: 'Profile',
      action: () => {
        setIsOpen(false)
        goToProfile()
      }
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        setIsOpen(false)
        router.push('/help')
      }
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: handleLogout,
      danger: true
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <m.button
        onClick={handleAvatarClick}
        onContextMenu={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:bg-white/20 transition-all duration-200 relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.03, ease: "easeOut" }}
        title={profile ? `${profile.display_name} (${profile.username}) • Click for menu` : 'Click for profile menu'}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <EquippedAvatar size="md" showPulse={isOpen} showEffects={true} crownScaleMultiplier={0} />
        </div>
      </m.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 glass-morphism rounded-xl border border-white/10 shadow-2xl z-50 opacity-95"
          >
            {/* Profile Header */}
            {profile && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <EquippedAvatar size="md" showEffects={true} crownScaleMultiplier={0} />
                  <div>
                    <p className="text-white font-semibold">{profile.display_name}</p>
                    <p className="text-white/60 text-sm">@{profile.username}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/50">
                  {profile.cosmic_title}
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <m.button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-[30ms] text-left ${
                    item.danger 
                      ? 'hover:bg-red-500/20 text-red-300 hover:text-red-200' 
                      : item.highlight
                      ? 'hover:bg-cosmic-aurora/20 text-cosmic-aurora hover:text-cosmic-aurora border border-cosmic-aurora/30'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                  whileHover={{ x: 2 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    hover: { duration: 0.03, ease: "easeOut" }
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  )}
                </m.button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}