import type { Entry } from '../types'

export type TimeRange = '1w' | '1m' | '6m' | '1y'

export function filterByRange(entries: Entry[], range: TimeRange): Entry[] {
  const now = Date.now()
  const ms: Record<TimeRange, number> = {
    '1w':  7  * 24 * 60 * 60 * 1000,
    '1m':  30 * 24 * 60 * 60 * 1000,
    '6m':  182 * 24 * 60 * 60 * 1000,
    '1y':  365 * 24 * 60 * 60 * 1000,
  }
  const cutoff = now - ms[range]
  return entries.filter(e => new Date(e.timestamp).getTime() >= cutoff)
}

/** Fields that are numeric and suitable for charting */
export const CHARTABLE_FIELDS: (keyof Entry)[] = [
  'ph', 'specificGravity', 'zinc', 'magnesium', 'ascorbate', 'uricAcid',
  'urobilinogen', 'salinity', 'bilirubin', 'ketone', 'protein', 'nitrite',
  'leukocytes', 'hydration',
]
