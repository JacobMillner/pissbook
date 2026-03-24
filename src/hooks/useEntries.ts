import { useState, useEffect, useCallback } from 'react'
import { loadEntries, deleteEntry as storageDelete } from '../utils/storage'
import type { Entry } from '../types'

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])

  const refresh = useCallback(() => {
    setEntries(loadEntries().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  function deleteEntry(id: string) {
    storageDelete(id)
    refresh()
  }

  return { entries, deleteEntry, refresh }
}
