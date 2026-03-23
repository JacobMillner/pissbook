# Step 05 — View Data Page (Table, Charts & CSV Export)

## Goal
Build the View Data page. It has two sub-views toggled by tabs:
1. **List** — a scrollable table of all entries, most recent first, with a delete button per row
2. **Graph** — line/area charts for numeric fields, with a time range selector (1 week, 1 month, 6 months, 1 year)

A prominent **Export CSV** button is always visible.

---

## Tests to Write First (TDD)

Create `src/__tests__/view-data.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ViewDataPage from '../pages/ViewDataPage'
import { saveEntry, clearEntries } from '../utils/storage'
import type { Entry } from '../types'

const baseEntry: Entry = {
  id: 'e1',
  timestamp: new Date().toISOString(),
  hydration: 'optimal',
  urobilinogen: 3.3,
  bilirubin: 'neg',
  ketone: 'neg',
  zinc: 1,
  magnesium: 15,
  protein: 'neg',
  salinity: 300,
  nitrite: 'neg',
  leukocytes: 'neg',
  freeRadical: 'normal',
  specificGravity: 1.015,
  ph: 7.0,
  ascorbate: 0,
  uricAcid: 50,
  notes: '',
}

function renderPage() {
  return render(<MemoryRouter><ViewDataPage /></MemoryRouter>)
}

describe('ViewDataPage', () => {
  beforeEach(() => clearEntries())

  it('shows empty state message when no entries exist', () => {
    renderPage()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('renders an entry row in the list tab', () => {
    saveEntry(baseEntry)
    renderPage()
    expect(screen.getByTestId('entry-row-e1')).toBeInTheDocument()
  })

  it('shows the correct number of entries', () => {
    saveEntry(baseEntry)
    saveEntry({ ...baseEntry, id: 'e2' })
    renderPage()
    expect(screen.getAllByTestId(/^entry-row-/)).toHaveLength(2)
  })

  it('deletes an entry when the delete button is clicked', async () => {
    saveEntry(baseEntry)
    renderPage()
    fireEvent.click(screen.getByTestId('delete-e1'))
    await waitFor(() => {
      expect(screen.queryByTestId('entry-row-e1')).not.toBeInTheDocument()
    })
  })

  it('has an Export CSV button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
  })

  it('has a Graph tab that can be activated', () => {
    saveEntry(baseEntry)
    renderPage()
    const graphTab = screen.getByRole('tab', { name: /graph/i })
    fireEvent.click(graphTab)
    expect(screen.getByTestId('graph-view')).toBeInTheDocument()
  })

  it('renders time range buttons in graph view', () => {
    saveEntry(baseEntry)
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: /graph/i }))
    expect(screen.getByRole('button', { name: /1w/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1m/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /6m/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1y/i })).toBeInTheDocument()
  })
})
```

**All tests must pass before this step is complete.**

---

## Implementation

### `src/utils/filters.ts`

```ts
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
  'urobilinogen', 'salinity',
]
```

### `src/hooks/useEntries.ts`

```ts
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
```

### `src/components/EntryTable.tsx`

```tsx
import type { Entry } from '../types'

interface Props {
  entries: Entry[]
  onDelete: (id: string) => void
}

const VISIBLE_FIELDS: (keyof Entry)[] = [
  'timestamp', 'hydration', 'ph', 'specificGravity', 'ketone',
  'protein', 'nitrite', 'leukocytes', 'uricAcid'
]

export default function EntryTable({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <p data-testid="empty-state" style={{ color: 'var(--fb-text-light)', textAlign: 'center', padding: '24px' }}>
        No entries yet. Go post your first reading!
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: 'var(--fb-bg)', borderBottom: '2px solid var(--fb-border)' }}>
            {VISIBLE_FIELDS.map(f => (
              <th key={f} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>
                {f === 'timestamp' ? 'Date' : f}
              </th>
            ))}
            <th style={{ padding: '6px 8px' }}>Del</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id} data-testid={`entry-row-${entry.id}`}
              style={{ borderBottom: '1px solid var(--fb-border)' }}>
              {VISIBLE_FIELDS.map(f => (
                <td key={f} style={{ padding: '5px 8px' }}>
                  {f === 'timestamp'
                    ? new Date(entry.timestamp).toLocaleString()
                    : String(entry[f])}
                </td>
              ))}
              <td style={{ padding: '5px 8px' }}>
                <button
                  className="btn btn-danger"
                  data-testid={`delete-${entry.id}`}
                  style={{ padding: '2px 8px', fontSize: '11px' }}
                  onClick={() => onDelete(entry.id)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### `src/components/EntryCharts.tsx`

```tsx
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts'
import { useState } from 'react'
import { filterByRange, CHARTABLE_FIELDS } from '../utils/filters'
import type { Entry } from '../types'
import type { TimeRange } from '../utils/filters'

const RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
]

const LINE_COLORS = ['#3b5998','#e07b39','#4caf50','#e53935','#8e24aa','#0097a7','#f9a825','#6d4c41']

interface Props { entries: Entry[] }

export default function EntryCharts({ entries }: Props) {
  const [range, setRange] = useState<TimeRange>('1m')
  const [activeField, setActiveField] = useState<keyof Entry>('ph')

  const filtered = filterByRange(entries, range).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const chartData = filtered.map(e => ({
    date: new Date(e.timestamp).toLocaleDateString(),
    value: typeof e[activeField] === 'number' ? e[activeField] : undefined,
  }))

  return (
    <div data-testid="graph-view">
      {/* Time range selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--fb-text-light)' }}>Range:</span>
        {RANGE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`btn ${range === opt.value ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '12px' }}
            onClick={() => setRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Field selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontWeight: 700, fontSize: '12px', display: 'inline', marginRight: '8px' }}>Field:</label>
        <select
          value={String(activeField)}
          onChange={e => setActiveField(e.target.value as keyof Entry)}
          style={{ width: 'auto', display: 'inline-block' }}
        >
          {CHARTABLE_FIELDS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {chartData.length < 2 ? (
        <p style={{ color: 'var(--fb-text-light)', textAlign: 'center', padding: '24px' }}>
          Not enough data for this range. Add more entries!
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--fb-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={LINE_COLORS[0]}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={String(activeField)}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
```

### `src/pages/ViewDataPage.tsx` (full implementation)

```tsx
import { useState } from 'react'
import Layout from '../components/Layout'
import EntryTable from '../components/EntryTable'
import EntryCharts from '../components/EntryCharts'
import { useEntries } from '../hooks/useEntries'
import { exportToCsv } from '../utils/csv'

type Tab = 'list' | 'graph'

export default function ViewDataPage() {
  const { entries, deleteEntry } = useEntries()
  const [tab, setTab] = useState<Tab>('list')

  return (
    <Layout>
      <div data-testid="page-view-data">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '20px', color: 'var(--fb-blue)' }}>
            Your Results
          </h2>
          <button
            className="btn btn-secondary"
            onClick={() => exportToCsv(entries)}
          >
            Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '0', borderBottom: '2px solid var(--fb-border)' }}>
          {(['list', 'graph'] as Tab[]).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className="btn"
              style={{
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                background: tab === t ? 'var(--fb-panel)' : 'var(--fb-bg)',
                borderColor: tab === t ? 'var(--fb-border)' : 'transparent',
                borderBottomColor: tab === t ? 'var(--fb-panel)' : 'transparent',
                marginBottom: tab === t ? '-2px' : '0',
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? 'var(--fb-blue)' : 'var(--fb-text-light)',
              }}
              onClick={() => setTab(t)}
            >
              {t === 'list' ? 'List' : 'Graph'}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="panel" style={{ borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)' }}>
          {tab === 'list'
            ? <EntryTable entries={entries} onDelete={deleteEntry} />
            : <EntryCharts entries={entries} />
          }
        </div>
      </div>
    </Layout>
  )
}
```

---

## Passing Criteria

Run `npm test` — all tests in `view-data.test.tsx` must pass. Test manually: add 2–3 entries from the New Entry page, navigate to View Data, confirm list shows them and delete works, then switch to Graph. Proceed to Step 06.
