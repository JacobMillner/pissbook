import Papa from 'papaparse'
import type { Entry } from '../types'

/**
 * Returns an array of CSV string rows: [headerRow, ...dataRows]
 * Suitable for joining with '\n' or passing to a Blob.
 */
export function entriesToCsvRows(entries: Entry[]): string[] {
  const columns: (keyof Entry)[] = [
    'id', 'timestamp', 'hydration', 'urobilinogen', 'bilirubin',
    'ketone', 'zinc', 'magnesium', 'protein', 'salinity', 'nitrite',
    'leukocytes', 'freeRadical', 'specificGravity', 'ph', 'ascorbate',
    'uricAcid', 'notes',
  ]

  const data = entries.map(e => columns.map(col => e[col]))
  const csv = Papa.unparse({ fields: columns, data })

  return csv.split('\n').filter(row => row !== '')
}

/**
 * Triggers a browser download of all entries as a CSV file.
 */
export function exportToCsv(entries: Entry[], filename = 'pissbook-export.csv'): void {
  const rows = entriesToCsvRows(entries)
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
