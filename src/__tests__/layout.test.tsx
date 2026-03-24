import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'

describe('Layout shell', () => {
  it('renders the Pissbook logo text', () => {
    render(
      <MemoryRouter>
        <Layout><div>child</div></Layout>
      </MemoryRouter>
    )
    expect(screen.getByText('Pissbook')).toBeInTheDocument()
  })

  it('has a nav link to View Data', () => {
    render(
      <MemoryRouter>
        <Layout><div /></Layout>
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /view data/i })).toBeInTheDocument()
  })

  it('has a nav link to Trends', () => {
    render(
      <MemoryRouter>
        <Layout><div /></Layout>
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /trends/i })).toBeInTheDocument()
  })

  it('renders children inside the main content area', () => {
    render(
      <MemoryRouter>
        <Layout><p data-testid="child-content">hello</p></Layout>
      </MemoryRouter>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('active nav link is visually marked (has aria-current)', () => {
    render(
      <MemoryRouter initialEntries={['/data']}>
        <Layout><div /></Layout>
      </MemoryRouter>
    )
    const dataLink = screen.getByRole('link', { name: /view data/i })
    expect(dataLink).toHaveAttribute('aria-current', 'page')
  })
})
