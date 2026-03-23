# Step 01 — Data Types & Storage Layer

## Goal
Define the TypeScript types for all test strip fields, define the `Entry` record type, and implement a storage utility that reads/writes entries to `localStorage`. This is the single source of truth for all data in the app.

---

## Tests to Write First (TDD)

Create `src/__tests__/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
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
```

Create `src/__tests__/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  HYDRATION_OPTIONS,
  UROBILINOGEN_OPTIONS,
  BILIRUBIN_OPTIONS,
  KETONE_OPTIONS,
  ZINC_OPTIONS,
  MAGNESIUM_OPTIONS,
  PROTEIN_OPTIONS,
  SALINITY_OPTIONS,
  NITRITE_OPTIONS,
  LEUKOCYTE_OPTIONS,
  FREE_RADICAL_OPTIONS,
  SPECIFIC_GRAVITY_OPTIONS,
  PH_OPTIONS,
  ASCORBATE_OPTIONS,
  URIC_ACID_OPTIONS,
} from '../types'

describe('field option constants', () => {
  it('hydration has 4 options', () => {
    expect(HYDRATION_OPTIONS).toHaveLength(4)
  })
  it('urobilinogen options are numbers', () => {
    UROBILINOGEN_OPTIONS.forEach(o => expect(typeof o.value).toBe('number'))
  })
  it('bilirubin has neg option', () => {
    expect(BILIRUBIN_OPTIONS[0].value).toBe('neg')
  })
  it('ph options include 7.0', () => {
    expect(PH_OPTIONS.map(o => o.value)).toContain(7.0)
  })
  it('nitrite only has neg and positive', () => {
    expect(NITRITE_OPTIONS).toHaveLength(2)
  })
})
```

**All tests must pass before this step is complete.**

---

## Implementation

### `src/types/index.ts`

Define every option set as a typed constant plus a union type. This way the form and charts both reference the same source of truth.

```ts
// Hydration
export const HYDRATION_OPTIONS = [
  { value: 'over_hydrated',        label: 'Over Hydrated',       color: '#60a5fa' },
  { value: 'optimal',              label: 'Optimal',             color: '#4ade80' },
  { value: 'under_hydrated',       label: 'Under Hydrated',      color: '#facc15' },
  { value: 'severely_dehydrated',  label: 'Severely Dehydrated', color: '#f87171' },
] as const
export type HydrationValue = typeof HYDRATION_OPTIONS[number]['value']

// Urobilinogen (umol/L)
export const UROBILINOGEN_OPTIONS = [
  { value: 3.3,  label: '3.3 — Normal' },
  { value: 16,   label: '16 — Normal' },
  { value: 33,   label: '33' },
  { value: 66,   label: '66' },
  { value: 131,  label: '131' },
] as const
export type UrobilinogenValue = typeof UROBILINOGEN_OPTIONS[number]['value']

// Bilirubin (umol/L)
export const BILIRUBIN_OPTIONS = [
  { value: 'neg',  label: 'Negative' },
  { value: 17,     label: '17 — Small' },
  { value: 50,     label: '50 — Moderate' },
  { value: 100,    label: '100 — Large' },
] as const
export type BilirubinValue = typeof BILIRUBIN_OPTIONS[number]['value']

// Ketone (mmol/L)
export const KETONE_OPTIONS = [
  { value: 'neg',  label: 'Negative' },
  { value: 0.5,    label: '0.5 — Trace' },
  { value: 1.5,    label: '1.5 — Small' },
  { value: 4.0,    label: '4.0 — Moderate' },
  { value: 8.0,    label: '8.0 — Large' },
  { value: 16.0,   label: '16.0 — Large' },
] as const
export type KetoneValue = typeof KETONE_OPTIONS[number]['value']

// Zinc (mg/L)
export const ZINC_OPTIONS = [
  { value: 0,    label: '0' },
  { value: 0.5,  label: '0.5' },
  { value: 1,    label: '1' },
  { value: 2,    label: '2' },
  { value: 5,    label: '5' },
  { value: 10,   label: '10' },
  { value: 25,   label: '25' },
] as const
export type ZincValue = typeof ZINC_OPTIONS[number]['value']

// Magnesium (mg/dL)
export const MAGNESIUM_OPTIONS = [
  { value: 10,   label: '10' },
  { value: 15,   label: '15' },
  { value: 20,   label: '20' },
  { value: 25,   label: '25' },
  { value: 40,   label: '≥ 40' },
] as const
export type MagnesiumValue = typeof MAGNESIUM_OPTIONS[number]['value']

// Protein (g/L)
export const PROTEIN_OPTIONS = [
  { value: 'neg',  label: 'Negative' },
  { value: 0,      label: '0 — Trace' },
  { value: 0.3,    label: '0.3' },
  { value: 1.0,    label: '1.0' },
  { value: 3.0,    label: '3.0' },
  { value: 20.0,   label: '20.0' },
] as const
export type ProteinValue = typeof PROTEIN_OPTIONS[number]['value']

// Salinity (mg/dL)
export const SALINITY_OPTIONS = [
  { value: 0,    label: '0 — Low' },
  { value: 100,  label: '100 — Low' },
  { value: 200,  label: '200' },
  { value: 300,  label: '300 — Normal' },
  { value: 400,  label: '400' },
  { value: 500,  label: '500 — High' },
] as const
export type SalinityValue = typeof SALINITY_OPTIONS[number]['value']

// Nitrite
export const NITRITE_OPTIONS = [
  { value: 'neg',       label: 'Negative' },
  { value: 'positive',  label: 'Positive' },
] as const
export type NitriteValue = typeof NITRITE_OPTIONS[number]['value']

// Leukocytes (cells/uL)
export const LEUKOCYTE_OPTIONS = [
  { value: 'neg',  label: 'Negative' },
  { value: 15,     label: '15 — Trace' },
  { value: 70,     label: '70 — Small' },
  { value: 125,    label: '125 — Moderate' },
  { value: 500,    label: '500 — Large' },
] as const
export type LeukocyteValue = typeof LEUKOCYTE_OPTIONS[number]['value']

// Free Radical
export const FREE_RADICAL_OPTIONS = [
  { value: 'normal',     label: 'Normal' },
  { value: 'attention',  label: 'Attention' },
  { value: 1,            label: '1 — A Bit High' },
  { value: 2,            label: '2 — A Bit High' },
  { value: 3,            label: '3 — High' },
  { value: 4,            label: '4 — High' },
] as const
export type FreeRadicalValue = typeof FREE_RADICAL_OPTIONS[number]['value']

// Specific Gravity
export const SPECIFIC_GRAVITY_OPTIONS = [
  { value: 1,      label: '1.000' },
  { value: 1.005,  label: '1.005' },
  { value: 1.010,  label: '1.010' },
  { value: 1.015,  label: '1.015' },
  { value: 1.020,  label: '1.020' },
  { value: 1.025,  label: '1.025' },
  { value: 1.030,  label: '1.030' },
] as const
export type SpecificGravityValue = typeof SPECIFIC_GRAVITY_OPTIONS[number]['value']

// pH
export const PH_OPTIONS = [
  { value: 5.0,  label: '5.0' },
  { value: 6.0,  label: '6.0' },
  { value: 6.5,  label: '6.5' },
  { value: 7.0,  label: '7.0' },
  { value: 7.5,  label: '7.5' },
  { value: 8.0,  label: '8.0' },
] as const
export type PhValue = typeof PH_OPTIONS[number]['value']

// Ascorbate (mmol/L)
export const ASCORBATE_OPTIONS = [
  { value: 0,    label: '0' },
  { value: 0.6,  label: '0.6' },
  { value: 1.4,  label: '1.4' },
  { value: 2.8,  label: '2.8' },
  { value: 5.0,  label: '5.0' },
] as const
export type AscorbateValue = typeof ASCORBATE_OPTIONS[number]['value']

// Uric Acid (mg/L)
export const URIC_ACID_OPTIONS = [
  { value: 20,    label: '20' },
  { value: 50,    label: '50' },
  { value: 100,   label: '100' },
  { value: 300,   label: '300' },
  { value: 700,   label: '700' },
  { value: 1100,  label: '1100' },
  { value: 1500,  label: '1500' },
] as const
export type UricAcidValue = typeof URIC_ACID_OPTIONS[number]['value']

// --- Main Entry type ---
export interface Entry {
  id: string
  timestamp: string          // ISO 8601
  hydration: HydrationValue
  urobilinogen: UrobilinogenValue
  bilirubin: BilirubinValue
  ketone: KetoneValue
  zinc: ZincValue
  magnesium: MagnesiumValue
  protein: ProteinValue
  salinity: SalinityValue
  nitrite: NitriteValue
  leukocytes: LeukocyteValue
  freeRadical: FreeRadicalValue
  specificGravity: SpecificGravityValue
  ph: PhValue
  ascorbate: AscorbateValue
  uricAcid: UricAcidValue
  notes: string
}

// Default values for a blank new entry (used to initialise the form)
export const DEFAULT_ENTRY: Omit<Entry, 'id' | 'timestamp'> = {
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
  notes: '',
}
```

### `src/utils/storage.ts`

```ts
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
```

---

## Passing Criteria

Run `npm test` — all tests in `storage.test.ts` and `types.test.ts` must be green before proceeding to Step 02.
