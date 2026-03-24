import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NewEntryPage from '../pages/NewEntryPage'
import { loadEntries, clearEntries } from '../utils/storage'

function renderPage() {
  return render(
    <MemoryRouter>
      <NewEntryPage />
    </MemoryRouter>
  )
}

describe('NewEntryPage', () => {
  beforeEach(() => clearEntries())

  it('renders the "Post to Pissbook" submit button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /post to pissbook/i })).toBeInTheDocument()
  })

  it('renders a select for every tracked field', () => {
    renderPage()
    const fields = [
      'hydration', 'urobilinogen', 'bilirubin', 'ketone', 'zinc',
      'magnesium', 'protein', 'salinity', 'nitrite', 'leukocytes',
      'freeRadical', 'specificGravity', 'ph', 'ascorbate', 'uricAcid'
    ]
    fields.forEach(name => {
      expect(screen.getByTestId(`field-${name}`)).toBeInTheDocument()
    })
  })

  it('saves an entry to storage on submit', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      expect(loadEntries()).toHaveLength(1)
    })
  })

  it('shows a success confirmation after submit', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      expect(screen.getByTestId('submit-success')).toBeInTheDocument()
    })
  })

  it('resets the form to defaults after successful submit', async () => {
    const user = userEvent.setup()
    renderPage()
    const hydrationSelect = screen.getByTestId('field-hydration') as HTMLSelectElement
    await user.selectOptions(hydrationSelect, 'severely_dehydrated')
    expect(hydrationSelect.value).toBe('severely_dehydrated')

    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      expect(hydrationSelect.value).toBe('optimal')
    })
  })

  it('saves the correct timestamp (ISO format)', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      const entries = loadEntries()
      expect(entries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  it('renders a notes textarea', () => {
    renderPage()
    expect(screen.getByTestId('field-notes')).toBeInTheDocument()
  })
})
