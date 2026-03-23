# Step 02 — CSV Export Utility & App Routing

## Goal
Implement the CSV export function and set up React Router with the three app routes: New Entry (`/`), View Data (`/data`), and Trends (`/trends`). Verify that all routes render without crashing.

---

## Tests to Write First (TDD)

Create `src/__tests__/csv.test.ts`:

```ts
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
```

Create `src/__tests__/routing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../AppRoutes'

describe('App routing', () => {
  it('renders New Entry page at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-new-entry')).toBeInTheDocument()
  })

  it('renders View Data page at /data', () => {
    render(
      <MemoryRouter initialEntries={['/data']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-view-data')).toBeInTheDocument()
  })

  it('renders Trends page at /trends', () => {
    render(
      <MemoryRouter initialEntries={['/trends']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-trends')).toBeInTheDocument()
  })

  it('renders 404 fallback for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument()
  })
})
```

**All tests must pass before this step is complete.**

---

## Implementation

### `src/utils/csv.ts`

Use `papaparse` under the hood but wrap it in a simple utility API so the rest of the app never imports papaparse directly. This makes it easy to swap later.

```ts
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

  return csv.split('\n')
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
```

### Stub pages for routing

Create three minimal stub pages. They will be fully implemented in Steps 04–06.

**`src/pages/NewEntryPage.tsx`**
```tsx
export default function NewEntryPage() {
  return <div data-testid="page-new-entry"><h1>New Entry</h1></div>
}
```

**`src/pages/ViewDataPage.tsx`**
```tsx
export default function ViewDataPage() {
  return <div data-testid="page-view-data"><h1>View Data</h1></div>
}
```

**`src/pages/TrendsPage.tsx`**
```tsx
export default function TrendsPage() {
  return <div data-testid="page-trends"><h1>Trends</h1></div>
}
```

**`src/pages/NotFoundPage.tsx`**
```tsx
export default function NotFoundPage() {
  return <div data-testid="page-not-found"><h1>404</h1></div>
}
```

### `src/AppRoutes.tsx`

```tsx
import { Routes, Route } from 'react-router-dom'
import NewEntryPage from './pages/NewEntryPage'
import ViewDataPage from './pages/ViewDataPage'
import TrendsPage from './pages/TrendsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NewEntryPage />} />
      <Route path="/data" element={<ViewDataPage />} />
      <Route path="/trends" element={<TrendsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
```

### `src/App.tsx`

```tsx
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'

export default function App() {
  return (
    <BrowserRouter basename="/pissbook">
      <AppRoutes />
    </BrowserRouter>
  )
}
```

> **Architecture note:** The `basename` prop on `BrowserRouter` must match the `base` in `vite.config.ts`. GitHub Pages serves the app from `/<repo-name>/` so both must be `/pissbook`.

---

## Passing Criteria

Run `npm test` — all tests in `csv.test.ts` and `routing.test.tsx` must be green before proceeding to Step 03.
