import { describe, it, expect } from 'vitest'
import { analyseTrends } from '../utils/trends'
import type { Entry } from '../types'

function makeEntry(overrides: Partial<Entry> = {}, daysAgo = 0): Entry {
  const d = new Date(); d.setDate(d.getDate() - daysAgo)
  return {
    id: `x-${Math.random()}`, timestamp: d.toISOString(),
    hydration: 'optimal', urobilinogen: 3.3, bilirubin: 'neg', ketone: 'neg',
    zinc: 1, magnesium: 15, protein: 'neg', salinity: 300, nitrite: 'neg',
    leukocytes: 'neg', freeRadical: 'normal', specificGravity: 1.015,
    ph: 7.0, ascorbate: 0, uricAcid: 50, notes: '', ...overrides,
  }
}

describe('analyseTrends', () => {
  it('returns empty array for empty input', () => {
    expect(analyseTrends([])).toEqual([])
  })

  it('flags nitrite if majority of entries are positive', () => {
    const entries = [
      makeEntry({ nitrite: 'positive' }),
      makeEntry({ nitrite: 'positive' }),
      makeEntry({ nitrite: 'neg' }),
    ]
    const trends = analyseTrends(entries)
    expect(trends.some(t => t.field === 'nitrite')).toBe(true)
  })

  it('flags bilirubin elevation', () => {
    const entries = [
      makeEntry({ bilirubin: 50 }),
      makeEntry({ bilirubin: 50 }),
    ]
    const trends = analyseTrends(entries)
    expect(trends.some(t => t.field === 'bilirubin')).toBe(true)
  })

  it('flags dehydration trend', () => {
    const entries = [
      makeEntry({ hydration: 'severely_dehydrated' }),
      makeEntry({ hydration: 'under_hydrated' }),
    ]
    const trends = analyseTrends(entries)
    expect(trends.some(t => t.field === 'hydration')).toBe(true)
  })

  it('does not flag all-normal data', () => {
    const entries = [makeEntry(), makeEntry(), makeEntry()]
    expect(analyseTrends(entries)).toHaveLength(0)
  })
})
