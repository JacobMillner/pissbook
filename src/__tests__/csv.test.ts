import { describe, it, expect } from 'vitest'
import { exportToCsv, entriesToCsvRows } from '../utils/csv'
import type { Entry } from '../types'

const entry: Entry = {
  id: 'csv-001',
  timestamp: '2024-03-10T08:30:00.000Z',
  hydration: 'optimal',
  urobilinogen: 3.3,
  bilirubin: 'neg',
  ketone: 'neg',
  zinc: 1,
  magnesium: 20,
  protein: 'neg',
  salinity: 300,
  nitrite: 'neg',
  leukocytes: 'neg',
  freeRadical: 'normal',
  specificGravity: 1.015,
  ph: 7.0,
  ascorbate: 0,
  uricAcid: 100,
  notes: 'test note',
}

describe('CSV export', () => {
  it('should produce one header row and one data row for one entry', () => {
    const rows = entriesToCsvRows([entry])
    expect(rows).toHaveLength(2)
  })

  it('header row should contain expected column names', () => {
    const [header] = entriesToCsvRows([entry])
    expect(header).toContain('timestamp')
    expect(header).toContain('hydration')
    expect(header).toContain('ph')
    expect(header).toContain('uricAcid')
  })

  it('data row should contain the entry values', () => {
    const [, dataRow] = entriesToCsvRows([entry])
    expect(dataRow).toContain('optimal')
    expect(dataRow).toContain('test note')
    expect(dataRow).toContain('100')
  })

  it('should handle an empty array gracefully', () => {
    const rows = entriesToCsvRows([])
    // Should still have header row only
    expect(rows).toHaveLength(1)
  })

  it('should escape values that contain commas', () => {
    const entryWithComma = { ...entry, notes: 'morning, fasted' }
    const [, dataRow] = entriesToCsvRows([entryWithComma])
    expect(dataRow).toContain('"morning, fasted"')
  })
})
