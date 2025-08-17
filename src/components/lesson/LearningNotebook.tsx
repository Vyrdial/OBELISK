'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Book, X, Sparkles, Hash, Lightbulb, Clock, StickyNote, Plus, Lock, LockOpen, CheckCircle } from 'lucide-react'
import { useUnlockedConcepts } from '@/hooks/useUnlockedConcepts'

export interface NotebookEntry {
  id: string
  type: 'definition' | 'property' | 'note' | 'concept'
  title: string
  content: string
  timestamp: number
  color?: string
  conceptId?: string
  unlocked?: boolean
}

interface LearningNotebookProps {
  entries: NotebookEntry[]
  onAddNote?: (note: string) => void
  onEntryClick?: (entry: NotebookEntry) => void
  onClose?: () => void
  className?: string
}

interface Notification {
  id: string
  message: string
  type: 'concept' | 'definition' | 'property' | 'note'
}

export default function LearningNotebook({ entries, onAddNote, onEntryClick, onClose, className = '' }: LearningNotebookProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'concepts' | 'definitions' | 'properties' | 'notes'>('all')
  const [newNote, setNewNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { unlockedConcepts, isConceptUnlocked } = useUnlockedConcepts()
  const prevEntriesLength = useRef(entries.length)
  const notificationTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Detect new entries and show notifications
  useEffect(() => {
    if (entries.length > prevEntriesLength.current) {
      const newEntries = entries.slice(prevEntriesLength.current)
      newEntries.forEach(entry => {
        const notification: Notification = {
          id: Math.random().toString(),
          message: entry.type === 'concept' 
            ? `New concept discovered: ${entry.title}`
            : entry.type === 'definition'
            ? `Definition added: ${entry.title}`
            : entry.type === 'property'
            ? `Property discovered: ${entry.title}`
            : `Note added: ${entry.title}`,
          type: entry.type
        }
        setNotifications(prev => [...prev, notification])
        
        // Auto-remove notification after 4 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id))
        }, 4000)
      })
    }
    prevEntriesLength.current = entries.length
  }, [entries])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current)
      }
    }
  }, [])

  // Group entries by type
  const concepts = entries.filter(e => e.type === 'concept')
  const definitions = entries.filter(e => e.type === 'definition')
  const properties = entries.filter(e => e.type === 'property')
  const notes = entries.filter(e => e.type === 'note')

  const filteredEntries = activeTab === 'all' 
    ? entries 
    : activeTab === 'concepts'
    ? concepts
    : activeTab === 'definitions' 
    ? definitions 
    : activeTab === 'properties'
    ? properties
    : notes

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim())
      setNewNote('')
      setShowNoteInput(false)
    }
  }

  // Icon for entry types
  const getEntryIcon = (type: NotebookEntry['type'], unlocked?: boolean) => {
    switch (type) {
      case 'concept':
        return unlocked ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />
      case 'definition':
        return <Hash className="w-4 h-4" />
      case 'property':
        return <Lightbulb className="w-4 h-4" />
      case 'note':
        return <StickyNote className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Backdrop */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
      />
      {/* Panel */}
      <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-purple-950/95 to-cosmic-void/95 backdrop-blur-md border-l border-purple-400/20 shadow-2xl z-[71] flex flex-col"
            >
              {/* Notifications */}
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <m.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-20 right-4 z-[80] pointer-events-none"
                    style={{ top: `${80 + index * 60}px` }}
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px]">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{notification.message}</span>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
              {/* Header */}
              <div className="p-6 border-b border-purple-400/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Book className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Learning Notebook</h2>
                      <p className="text-xs text-purple-300/60">Track your discoveries</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-purple-500/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-purple-300/60" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'concepts', 'definitions', 'properties', 'notes'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab 
                          ? 'bg-purple-500 text-white' 
                          : 'text-purple-300/60 hover:text-white hover:bg-purple-500/20'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {tab !== 'all' && (
                        <span className="ml-1 text-xs opacity-60">
                          ({tab === 'concepts' ? concepts.length : tab === 'definitions' ? definitions.length : tab === 'properties' ? properties.length : notes.length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-purple-400/30" />
                    </div>
                    <p className="text-purple-300/40">
                      {activeTab === 'all' 
                        ? 'Your discoveries will appear here'
                        : `No ${activeTab} yet`}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredEntries.map((entry, index) => (
                      <m.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          if (entry.type === 'concept' && entry.conceptId) {
                            // Check if concept is unlocked
                            const unlocked = isConceptUnlocked(entry.conceptId)
                            if (unlocked) {
                              // Open concept page in new tab
                              window.open(`/archive/${entry.conceptId}`, '_blank')
                            }
                          } else if (onEntryClick && entry.type !== 'note') {
                            onEntryClick(entry)
                            if (onClose) onClose()
                          }
                        }}
                        className={`p-4 rounded-xl border ${
                          entry.type === 'concept'
                            ? (entry.conceptId && isConceptUnlocked(entry.conceptId)) 
                              ? 'bg-purple-600/20 border-purple-500/40 cursor-pointer hover:bg-purple-600/30'
                              : 'bg-gray-500/10 border-gray-500/30 opacity-60'
                            : entry.type === 'definition' 
                            ? 'bg-purple-500/10 border-purple-400/30' 
                            : entry.type === 'property'
                            ? 'bg-indigo-500/10 border-indigo-400/30'
                            : 'bg-violet-500/10 border-violet-400/30'
                        } ${(entry.type !== 'note' && entry.type !== 'concept' && onEntryClick) ? 'cursor-pointer hover:bg-purple-500/5 transition-colors' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            entry.type === 'concept'
                              ? (entry.conceptId && isConceptUnlocked(entry.conceptId))
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-gray-500/20 text-gray-400'
                              : entry.type === 'definition'
                              ? 'bg-purple-400/20 text-purple-300'
                              : entry.type === 'property'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : 'bg-violet-500/20 text-violet-400'
                          }`}>
                            {getEntryIcon(entry.type, entry.conceptId ? isConceptUnlocked(entry.conceptId) : undefined)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">
                              {entry.title}
                              {entry.type === 'concept' && entry.conceptId && isConceptUnlocked(entry.conceptId) && (
                                <span className="ml-2 text-xs text-purple-400">✓ Unlocked</span>
                              )}
                            </h3>
                            <p className="text-sm text-purple-100/70 leading-relaxed">
                              {entry.content}
                              {entry.type === 'concept' && entry.conceptId && !isConceptUnlocked(entry.conceptId) && (
                                <span className="block mt-1 text-xs text-purple-300/40">Complete the lesson to unlock this concept</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-purple-300/40">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </AnimatePresence>
                )}

                {/* Add Note Button/Input */}
                {(activeTab === 'all' || activeTab === 'notes') && onAddNote && (
                  <div className="mt-4">
                    {!showNoteInput ? (
                      <button
                        onClick={() => setShowNoteInput(true)}
                        className="w-full p-4 rounded-xl border border-dashed border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 text-purple-300/60 hover:text-purple-300"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add a note</span>
                      </button>
                    ) : (
                      <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-violet-500/10 border border-violet-400/30"
                      >
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleAddNote()
                            }
                          }}
                          placeholder="Type your note here..."
                          className="w-full bg-transparent text-white placeholder-purple-300/40 resize-none outline-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                          >
                            Save Note
                          </button>
                          <button
                            onClick={() => {
                              setShowNoteInput(false)
                              setNewNote('')
                            }}
                            className="px-4 py-1.5 text-purple-300/60 hover:text-purple-300 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </m.div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer with Close Button */}
              <div className="p-4 border-t border-purple-400/10">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close Notebook
                </button>
                <p className="text-xs text-purple-300/40 text-center mt-3">
                  {entries.length} {entries.length === 1 ? 'discovery' : 'discoveries'} • Press ESC to close
                </p>
              </div>
            </m.div>
    </>
  )
}