import { STORAGE_KEY } from '../constants'
import type { Entry } from '../types'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Entry[]
  } catch {
    return []
  }
}

export function saveEntry(entry: Entry): void {
  const entries = loadEntries()
  entries.push(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function deleteEntry(id: string): void {
  const entries = loadEntries().filter(e => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function clearEntries(): void {
  localStorage.removeItem(STORAGE_KEY)
}
