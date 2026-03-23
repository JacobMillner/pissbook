import { describe, it, expect, beforeEach } from 'vitest'
import { saveEntry, loadEntries, clearEntries } from '../utils/storage'
import type { Entry } from '../types'

const mockEntry: Entry = {
  id: 'test-001',
  timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
  hydration: 'optimal',
  urobilinogen: 3.3,
  bilirubin: 'neg',
  ketone: 'neg',
  zinc: 0,
  magnesium: 10,
  protein: 'neg',
  salinity: 0,
  nitrite: 'neg',
  leukocytes: 'neg',
  freeRadical: 'normal',
  specificGravity: 1.010,
  ph: 7.0,
  ascorbate: 0,
  uricAcid: 50,
  notes: ''
}

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and load a single entry', () => {
    saveEntry(mockEntry)
    const entries = loadEntries()
    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe('test-001')
  })

  it('should append entries without overwriting', () => {
    saveEntry(mockEntry)
    saveEntry({ ...mockEntry, id: 'test-002' })
    expect(loadEntries()).toHaveLength(2)
  })

  it('should return empty array when no entries exist', () => {
    expect(loadEntries()).toEqual([])
  })

  it('should clear all entries', () => {
    saveEntry(mockEntry)
    clearEntries()
    expect(loadEntries()).toHaveLength(0)
  })

  it('should not throw if localStorage contains corrupted data', () => {
    localStorage.setItem('pissbook_entries', 'not-valid-json{{{')
    expect(() => loadEntries()).not.toThrow()
    expect(loadEntries()).toEqual([])
  })

  it('should generate a unique id helper', async () => {
    const { generateId } = await import('../utils/storage')
    const a = generateId()
    const b = generateId()
    expect(a).not.toBe(b)
  })
})
