import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ViewDataPage from '../pages/ViewDataPage'
import { saveEntry, clearEntries } from '../utils/storage'
import { EntriesProvider } from '../hooks/useEntries'
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
  return render(
    <MemoryRouter>
      <EntriesProvider>
        <ViewDataPage />
      </EntriesProvider>
    </MemoryRouter>
  )
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
