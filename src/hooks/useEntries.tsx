import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode, FC } from 'react'
import { loadEntries, deleteEntry as storageDelete, saveEntry as storageSave, clearEntries as storageClear } from '../utils/storage'
import type { Entry } from '../types'

interface EntriesContextType {
  entries: Entry[]
  isLoading: boolean
  saveEntry: (entry: Entry) => void
  deleteEntry: (id: string) => void
  clearAll: () => void
  refresh: () => void
}

const EntriesContext = createContext<EntriesContextType | null>(null)

export const EntriesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    const data = loadEntries().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    setEntries(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveEntry = useCallback((entry: Entry) => {
    storageSave(entry)
    refresh()
  }, [refresh])

  const deleteEntry = useCallback((id: string) => {
    storageDelete(id)
    refresh()
  }, [refresh])

  const clearAll = useCallback(() => {
    storageClear()
    setEntries([])
    setIsLoading(false)
  }, [])

  return (
    <EntriesContext.Provider value={{ entries, isLoading, saveEntry, deleteEntry, clearAll, refresh }}>
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries() {
  const context = useContext(EntriesContext)
  if (!context) {
    throw new Error('useEntries must be used within an EntriesProvider')
  }
  return context
}