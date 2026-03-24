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
