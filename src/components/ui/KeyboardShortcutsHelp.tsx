'use client'

import { m, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  description: string
  category: string
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

export default function KeyboardShortcutsHelp({ 
  isOpen, 
  onClose, 
  shortcuts 
}: KeyboardShortcutsHelpProps) {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  const formatKey = (shortcut: KeyboardShortcut) => {
    const parts = []
    
    if (shortcut.ctrlKey || shortcut.metaKey) {
      parts.push(shortcut.metaKey ? '⌘' : 'Ctrl')
    }
    if (shortcut.altKey) {
      parts.push('Alt')
    }
    if (shortcut.shiftKey) {
      parts.push('Shift')
    }
    
    // Format special keys
    let key = shortcut.key
    if (key === ' ') key = 'Space'
    else if (key === 'ArrowRight') key = '→'
    else if (key === 'ArrowLeft') key = '←'
    else if (key === 'ArrowUp') key = '↑'
    else if (key === 'ArrowDown') key = '↓'
    else if (key === 'Enter') key = '↵'
    else if (key === 'Escape') key = 'Esc'
    
    parts.push(key.toUpperCase())
    
    return parts
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-morphism rounded-2xl border border-white/20 shadow-cosmic">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-cosmic-quasar/20 border border-cosmic-quasar/30">
                    <Keyboard className="w-5 h-5 text-cosmic-quasar" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white cosmic-heading">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-white/60 text-sm">
                      Navigate the cosmos with speed
                    </p>
                  </div>
                </div>
                
                <m.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors duration-75 cosmic-focus"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-white/60" />
                </m.button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(groupedShortcuts).map(([category, categoryShortcuts], categoryIndex) => (
                    <m.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-cosmic-starlight mb-3 cosmic-heading">
                        {category}
                      </h3>
                      
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <m.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                            className="flex items-center justify-between py-2 px-3 glass-morphism rounded-lg border border-white/10 hover:border-white/20 transition-colors duration-75"
                          >
                            <span className="text-white/80 flex-1">
                              {shortcut.description}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {formatKey(shortcut).map((keyPart, partIndex) => (
                                <div key={partIndex} className="flex items-center">
                                  <m.kbd
                                    className="px-2 py-1 text-xs font-mono bg-white/10 border border-white/20 rounded text-white/90 min-w-[2rem] text-center"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {keyPart}
                                  </m.kbd>
                                  {partIndex < formatKey(shortcut).length - 1 && (
                                    <span className="text-white/40 mx-1">+</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </m.div>
                        ))}
                      </div>
                    </m.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                <p className="text-white/60 text-sm text-center">
                  Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs">?</kbd> to toggle this help
                </p>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}