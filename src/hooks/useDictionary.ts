import { useState, useEffect } from 'react'
import { DictionaryEntry } from '@/types/dictionary'
import { dictionaryService } from '@/lib/dictionaryService'

export function useDictionary() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredEntries, setFilteredEntries] = useState<DictionaryEntry[]>([])

  // Load entries on mount
  useEffect(() => {
    const loadedEntries = dictionaryService.getEntries()
    setEntries(loadedEntries)
    setFilteredEntries(loadedEntries)
  }, [])

  // Update filtered entries when search query changes
  useEffect(() => {
    if (searchQuery) {
      setFilteredEntries(dictionaryService.searchEntries(searchQuery))
    } else {
      setFilteredEntries(entries)
    }
  }, [searchQuery, entries])

  const addEntry = (entry: Omit<DictionaryEntry, 'unlockedAt'>) => {
    dictionaryService.addEntry(entry)
    const updatedEntries = dictionaryService.getEntries()
    setEntries(updatedEntries)
  }

  const refreshEntries = () => {
    const loadedEntries = dictionaryService.getEntries()
    setEntries(loadedEntries)
  }

  return {
    entries,
    filteredEntries,
    searchQuery,
    setSearchQuery,
    addEntry,
    refreshEntries
  }
}