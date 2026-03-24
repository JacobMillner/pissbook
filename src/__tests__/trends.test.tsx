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
