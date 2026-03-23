# Step 06 — Trends Page

## Goal
Build the Trends page. It analyses entries over a user-configurable look-back period and surfaces notable patterns: fields that are consistently elevated, declining, improving, or out of normal range. Each trend is shown as a badge/card with a short plain-English summary.

---

## Tests to Write First (TDD)

Create `src/__tests__/trends.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TrendsPage from '../pages/TrendsPage'
import { saveEntry, clearEntries } from '../utils/storage'
import type { Entry } from '../types'

function makeEntry(overrides: Partial<Entry> = {}, daysAgo = 0): Entry {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id: `t-${Math.random()}`,
    timestamp: d.toISOString(),
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
    ...overrides,
  }
}

function renderPage() {
  return render(<MemoryRouter><TrendsPage /></MemoryRouter>)
}

describe('TrendsPage', () => {
  beforeEach(() => clearEntries())

  it('shows empty state when no entries exist', () => {
    renderPage()
    expect(screen.getByTestId('trends-empty')).toBeInTheDocument()
  })

  it('renders the period selector', () => {
    renderPage()
    expect(screen.getByTestId('period-selector')).toBeInTheDocument()
  })

  it('shows available period options', () => {
    renderPage()
    const selector = screen.getByTestId('period-selector') as HTMLSelectElement
    const options = Array.from(selector.options).map(o => o.value)
    expect(options).toContain('1w')
    expect(options).toContain('1m')
    expect(options).toContain('6m')
    expect(options).toContain('1y')
  })

  it('detects a nitrite positive flag when all entries are positive', () => {
    for (let i = 0; i < 3; i++) saveEntry(makeEntry({ nitrite: 'positive' }, i))
    renderPage()
    expect(screen.getByTestId('trend-nitrite')).toBeInTheDocument()
  })

  it('detects a leukocyte elevation trend', () => {
    for (let i = 0; i < 3; i++) saveEntry(makeEntry({ leukocytes: 125 }, i))
    renderPage()
    expect(screen.getByTestId('trend-leukocytes')).toBeInTheDocument()
  })

  it('detects a ketone elevation trend', () => {
    for (let i = 0; i < 3; i++) saveEntry(makeEntry({ ketone: 4.0 }, i))
    renderPage()
    expect(screen.getByTestId('trend-ketone')).toBeInTheDocument()
  })

  it('shows a "No notable trends" message when data is all normal', () => {
    for (let i = 0; i < 3; i++) saveEntry(makeEntry({}, i))
    renderPage()
    expect(screen.getByTestId('trends-all-clear')).toBeInTheDocument()
  })

  it('updates trends when the period selector changes', () => {
    // Add one entry that is 25 days old (outside 1w, inside 1m)
    saveEntry(makeEntry({ nitrite: 'positive' }, 25))
    renderPage()

    // In 1w view — should NOT see nitrite trend
    const selector = screen.getByTestId('period-selector') as HTMLSelectElement
    fireEvent.change(selector, { target: { value: '1w' } })
    expect(screen.queryByTestId('trend-nitrite')).not.toBeInTheDocument()

    // In 1m view — SHOULD see nitrite trend
    fireEvent.change(selector, { target: { value: '1m' } })
    expect(screen.getByTestId('trend-nitrite')).toBeInTheDocument()
  })
})
```

Create `src/__tests__/trend-analysis.test.ts`:

```ts
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
```

**All tests must pass before this step is complete.**

---

## Implementation

### `src/utils/trends.ts`

```ts
import type { Entry } from '../types'

export type TrendSeverity = 'info' | 'warning' | 'alert'

export interface Trend {
  field: keyof Entry
  severity: TrendSeverity
  title: string
  description: string
}

/**
 * Analyse an array of entries and return a list of notable trends.
 * Rules are intentionally simple: if >50% of entries in the window
 * show an abnormal value for a field, flag it.
 */
export function analyseTrends(entries: Entry[]): Trend[] {
  if (entries.length === 0) return []

  const trends: Trend[] = []
  const n = entries.length

  // Helper: count how many entries match a predicate
  function pct(fn: (e: Entry) => boolean): number {
    return entries.filter(fn).length / n
  }

  // --- Nitrite ---
  if (pct(e => e.nitrite === 'positive') > 0.5) {
    trends.push({
      field: 'nitrite',
      severity: 'alert',
      title: 'Nitrite Positive',
      description: `${Math.round(pct(e => e.nitrite === 'positive') * 100)}% of readings in this period show positive nitrite. This may indicate a bacterial infection — consider consulting a doctor.`,
    })
  }

  // --- Leukocytes ---
  if (pct(e => typeof e.leukocytes === 'number' && e.leukocytes >= 70) > 0.5) {
    trends.push({
      field: 'leukocytes',
      severity: 'warning',
      title: 'Elevated Leukocytes',
      description: 'More than half your readings show elevated white blood cells, which can signal inflammation or infection.',
    })
  }

  // --- Ketones ---
  if (pct(e => typeof e.ketone === 'number' && e.ketone >= 4.0) > 0.5) {
    trends.push({
      field: 'ketone',
      severity: 'warning',
      title: 'Moderate-High Ketones',
      description: 'Sustained elevated ketones may indicate prolonged fasting, very low carb intake, or metabolic changes.',
    })
  }

  // --- Bilirubin ---
  if (pct(e => typeof e.bilirubin === 'number' && e.bilirubin >= 50) > 0.5) {
    trends.push({
      field: 'bilirubin',
      severity: 'warning',
      title: 'Elevated Bilirubin',
      description: 'Consistently elevated bilirubin may relate to liver or gallbladder function. Consider seeking medical advice.',
    })
  }

  // --- Protein ---
  if (pct(e => typeof e.protein === 'number' && e.protein >= 1.0) > 0.5) {
    trends.push({
      field: 'protein',
      severity: 'warning',
      title: 'Elevated Protein',
      description: 'Significant protein in urine (proteinuria) can be an early sign of kidney stress.',
    })
  }

  // --- Hydration ---
  if (pct(e => e.hydration === 'under_hydrated' || e.hydration === 'severely_dehydrated') > 0.5) {
    trends.push({
      field: 'hydration',
      severity: 'info',
      title: 'Frequent Under-Hydration',
      description: 'You're often reading as under-hydrated. Try increasing your daily water intake.',
    })
  }

  // --- pH extremes ---
  if (pct(e => e.ph <= 5.0) > 0.5) {
    trends.push({
      field: 'ph',
      severity: 'info',
      title: 'Consistently Acidic pH',
      description: 'A persistently low urine pH can indicate a high-protein or high-acid diet.',
    })
  }
  if (pct(e => e.ph >= 8.0) > 0.5) {
    trends.push({
      field: 'ph',
      severity: 'info',
      title: 'Consistently Alkaline pH',
      description: 'A persistently high urine pH may indicate a UTI or certain dietary patterns.',
    })
  }

  // --- Free Radicals ---
  if (pct(e => typeof e.freeRadical === 'number' && e.freeRadical >= 3) > 0.5) {
    trends.push({
      field: 'freeRadical',
      severity: 'info',
      title: 'Elevated Free Radicals',
      description: 'Sustained high free radical readings may suggest increased oxidative stress. Antioxidant-rich foods can help.',
    })
  }

  return trends
}
```

### `src/components/TrendCard.tsx`

```tsx
import type { Trend } from '../utils/trends'

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  alert:   { bg: '#fde8e8', border: '#cc0000', icon: '⚠️' },
  warning: { bg: '#fff3cd', border: '#d4a017', icon: '⚡' },
  info:    { bg: '#e8f0fe', border: '#3b5998', icon: 'ℹ️' },
}

export default function TrendCard({ trend }: { trend: Trend }) {
  const style = SEVERITY_STYLES[trend.severity]
  return (
    <div
      data-testid={`trend-${trend.field}`}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        marginBottom: '10px',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '4px' }}>
        {style.icon} {trend.title}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--fb-text)', lineHeight: 1.5 }}>
        {trend.description}
      </p>
    </div>
  )
}
```

### `src/pages/TrendsPage.tsx` (full implementation)

```tsx
import { useState } from 'react'
import Layout from '../components/Layout'
import TrendCard from '../components/TrendCard'
import { useEntries } from '../hooks/useEntries'
import { filterByRange } from '../utils/filters'
import { analyseTrends } from '../utils/trends'
import type { TimeRange } from '../utils/filters'

const PERIOD_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '1 Week',    value: '1w' },
  { label: '1 Month',   value: '1m' },
  { label: '6 Months',  value: '6m' },
  { label: '1 Year',    value: '1y' },
]

export default function TrendsPage() {
  const { entries } = useEntries()
  const [period, setPeriod] = useState<TimeRange>('1m')

  const filtered = filterByRange(entries, period)
  const trends = analyseTrends(filtered)

  return (
    <Layout>
      <div data-testid="page-trends">
        {/* Header */}
        <div className="panel" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '20px', color: 'var(--fb-blue)', marginBottom: '2px' }}>
              Trends
            </h2>
            <p style={{ color: 'var(--fb-text-light)', fontSize: '12px' }}>
              Patterns detected across {filtered.length} reading{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <label htmlFor="period-selector" style={{ marginRight: '6px', fontWeight: 700 }}>Period:</label>
            <select
              id="period-selector"
              data-testid="period-selector"
              value={period}
              style={{ width: 'auto', display: 'inline-block' }}
              onChange={e => setPeriod(e.target.value as TimeRange)}
            >
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="panel">
          {entries.length === 0 ? (
            <p data-testid="trends-empty" style={{ color: 'var(--fb-text-light)', textAlign: 'center', padding: '24px' }}>
              No entries yet. Start recording to see trends here.
            </p>
          ) : trends.length === 0 ? (
            <div data-testid="trends-all-clear" style={{ textAlign: 'center', padding: '24px', color: '#2d6a4f' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
              <strong>All clear!</strong>
              <p style={{ fontSize: '12px', color: 'var(--fb-text-light)', marginTop: '4px' }}>
                No notable trends detected in this period.
              </p>
            </div>
          ) : (
            trends.map(t => <TrendCard key={`${t.field}-${t.severity}`} trend={t} />)
          )}
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginTop: '12px', textAlign: 'center' }}>
          Pissbook is not a medical device. These insights are for personal tracking only. Consult a healthcare professional for medical advice.
        </p>
      </div>
    </Layout>
  )
}
```

---

## Passing Criteria

Run `npm test` — all tests in `trends.test.tsx` and `trend-analysis.test.ts` must pass. Manually verify: add entries with abnormal values, visit the Trends page, change the period selector. Proceed to Step 07.
