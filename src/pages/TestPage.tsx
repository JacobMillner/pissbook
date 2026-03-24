import { useState } from 'react'
import { generateId } from '../utils/storage'
import { useEntries } from '../hooks/useEntries'
import type { Entry } from '../types'

const HYDRATION_VALUES = ['over_hydrated', 'optimal', 'under_hydrated', 'severely_dehydrated'] as const
const UROBILINOGEN_VALUES = [3.3, 16, 33, 66, 131] as const
const BILIRUBIN_VALUES = ['neg', 17, 50, 100] as const
const KETONE_VALUES = ['neg', 0.5, 1.5, 4.0, 8.0, 16.0] as const
const ZINC_VALUES = [0, 0.5, 1, 2, 5, 10, 25] as const
const MAGNESIUM_VALUES = [10, 15, 20, 25, 40] as const
const PROTEIN_VALUES = ['neg', 0, 0.3, 1.0, 3.0, 20.0] as const
const SALINITY_VALUES = [0, 100, 200, 300, 400, 500] as const
const NITRITE_VALUES = ['neg', 'positive'] as const
const LEUKOCYTE_VALUES = ['neg', 15, 70, 125, 500] as const
const FREE_RADICAL_VALUES = ['normal', 'attention', 1, 2, 3, 4] as const
const SG_VALUES = [1, 1.005, 1.010, 1.015, 1.020, 1.025, 1.030] as const
const PH_VALUES = [5.0, 6.0, 6.5, 7.0, 7.5, 8.0] as const
const ASCORBATE_VALUES = [0, 0.6, 1.4, 2.8, 5.0] as const
const URIC_ACID_VALUES = [20, 50, 100, 300, 700, 1100, 1500] as const

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateTestEntry(date: Date): Entry {
  return {
    id: generateId(),
    timestamp: date.toISOString(),
    hydration: randomItem(HYDRATION_VALUES),
    urobilinogen: randomItem(UROBILINOGEN_VALUES),
    bilirubin: randomItem(BILIRUBIN_VALUES),
    ketone: randomItem(KETONE_VALUES),
    zinc: randomItem(ZINC_VALUES),
    magnesium: randomItem(MAGNESIUM_VALUES),
    protein: randomItem(PROTEIN_VALUES),
    salinity: randomItem(SALINITY_VALUES),
    nitrite: randomItem(NITRITE_VALUES),
    leukocytes: randomItem(LEUKOCYTE_VALUES),
    freeRadical: randomItem(FREE_RADICAL_VALUES),
    specificGravity: randomItem(SG_VALUES),
    ph: randomItem(PH_VALUES),
    ascorbate: randomItem(ASCORBATE_VALUES),
    uricAcid: randomItem(URIC_ACID_VALUES),
    notes: '',
  }
}

export default function TestPage() {
  const { saveEntry, clearAll, entries } = useEntries()
  const [count, setCount] = useState(0)

  const populateData = () => {
    const now = new Date()
    const newEntries: Entry[] = []
    for (let month = 0; month < 5; month++) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - month, 1)
      for (let day = 0; day < 28; day++) {
        const date = new Date(targetMonth)
        date.setDate(day + 1)
        date.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60))
        const entry = generateTestEntry(date)
        saveEntry(entry)
        newEntries.push(entry)
      }
    }
    setCount(entries.length + newEntries.length)
  }

  const deleteAllData = () => {
    clearAll()
    setCount(0)
  }

  return (
    <div>
      <h1>Test Page</h1>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button onClick={populateData} style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
        }}>
          Populate 5 Months of Data
        </button>
        <button onClick={deleteAllData} style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#f87171',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
        }}>
          Delete All Data
        </button>
      </div>
      {count > 0 && (
        <p style={{ marginTop: '16px' }}>Current entry count: {count}</p>
      )}
    </div>
  )
}