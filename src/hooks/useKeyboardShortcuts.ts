'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category: string
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export default function useKeyboardShortcuts({ 
  shortcuts, 
  enabled = true 
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    const matchingShortcut = shortcuts.find(shortcut =>
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      Boolean(shortcut.ctrlKey) === event.ctrlKey &&
      Boolean(shortcut.altKey) === event.altKey &&
      Boolean(shortcut.shiftKey) === event.shiftKey &&
      Boolean(shortcut.metaKey) === event.metaKey
    )

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.action()
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { shortcuts }
}

// Common shortcuts for the OBELISK platform
export const createObeliskShortcuts = (actions: {
  goHome?: () => void
  openConceptLibrary?: () => void
  nextLesson?: () => void
  previousLesson?: () => void
  toggleQuiz?: () => void
  showHelp?: () => void
  openSearch?: () => void
  skipDialog?: () => void
}): KeyboardShortcut[] => [
  {
    key: 'h',
    action: actions.goHome || (() => {}),
    description: 'Go to home page',
    category: 'Navigation'
  },
  {
    key: 'c',
    action: actions.openConceptLibrary || (() => {}),
    description: 'Open concept library',
    category: 'Navigation'
  },
  {
    key: 'ArrowRight',
    action: actions.nextLesson || (() => {}),
    description: 'Next lesson/dialog',
    category: 'Learning'
  },
  {
    key: 'ArrowLeft',
    action: actions.previousLesson || (() => {}),
    description: 'Previous lesson',
    category: 'Learning'
  },
  {
    key: 'q',
    action: actions.toggleQuiz || (() => {}),
    description: 'Start/skip quiz',
    category: 'Learning'
  },
  {
    key: 'Enter',
    action: actions.skipDialog || (() => {}),
    description: 'Skip/continue dialog',
    category: 'Learning'
  },
  {
    key: ' ', // Spacebar
    action: actions.skipDialog || (() => {}),
    description: 'Skip/continue dialog',
    category: 'Learning'
  },
  {
    key: '?',
    shiftKey: true,
    action: actions.showHelp || (() => {}),
    description: 'Show keyboard shortcuts',
    category: 'Help'
  },
  {
    key: 'k',
    ctrlKey: true,
    action: actions.openSearch || (() => {}),
    description: 'Open search',
    category: 'Navigation'
  },
  {
    key: 'k',
    metaKey: true, // For Mac
    action: actions.openSearch || (() => {}),
    description: 'Open search',
    category: 'Navigation'
  }
]