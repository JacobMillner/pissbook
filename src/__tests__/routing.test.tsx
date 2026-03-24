import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../AppRoutes'
import { EntriesProvider } from '../hooks/useEntries'

describe('App routing', () => {
  it('renders New Entry page at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <EntriesProvider>
          <AppRoutes />
        </EntriesProvider>
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-new-entry')).toBeInTheDocument()
  })

  it('renders View Data page at /data', () => {
    render(
      <MemoryRouter initialEntries={['/data']}>
        <EntriesProvider>
          <AppRoutes />
        </EntriesProvider>
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-view-data')).toBeInTheDocument()
  })

  it('renders Trends page at /trends', () => {
    render(
      <MemoryRouter initialEntries={['/trends']}>
        <EntriesProvider>
          <AppRoutes />
        </EntriesProvider>
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-trends')).toBeInTheDocument()
  })

  it('renders 404 fallback for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <EntriesProvider>
          <AppRoutes />
        </EntriesProvider>
      </MemoryRouter>
    )
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument()
  })
})
