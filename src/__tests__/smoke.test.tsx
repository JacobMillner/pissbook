import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../AppRoutes'
import { loadEntries, clearEntries } from '../utils/storage'

function renderRoutes(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  )
}

describe('End-to-end smoke tests', () => {
  beforeEach(() => {
    clearEntries()
  })

  it('user can create an entry and see it on the data page', async () => {
    renderRoutes('/')
    expect(screen.getByTestId('page-new-entry')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Post to Pissbook/ }))
    await waitFor(() => {
      expect(loadEntries()).toHaveLength(1)
    })

    renderRoutes('/data')
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    expect(screen.getAllByTestId(/^entry-row-/)).toHaveLength(1)
  })

  it('trends page shows all-clear with normal entries', async () => {
    const { saveEntry, generateId } = await import('../utils/storage')
    saveEntry({
      id: generateId(), timestamp: new Date().toISOString(),
      hydration: 'optimal', urobilinogen: 3.3, bilirubin: 'neg', ketone: 'neg',
      zinc: 1, magnesium: 15, protein: 'neg', salinity: 300, nitrite: 'neg',
      leukocytes: 'neg', freeRadical: 'normal', specificGravity: 1.015,
      ph: 7.0, ascorbate: 0, uricAcid: 50, notes: '',
    })
    renderRoutes('/trends')
    expect(screen.getByTestId('trends-all-clear')).toBeInTheDocument()
  })

  it('view data shows empty state when no entries', () => {
    renderRoutes('/data')
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('trends shows empty state when no entries', () => {
    renderRoutes('/trends')
    expect(screen.getByTestId('trends-empty')).toBeInTheDocument()
  })

  it('unknown route shows not-found page', () => {
    renderRoutes('/this-does-not-exist')
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument()
  })
})
