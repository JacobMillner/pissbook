import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import FieldSelect from '../components/FieldSelect'
import { PH_OPTIONS } from '../types'

describe('Accessibility', () => {
  it('Layout has a <main> landmark', () => {
    render(
      <MemoryRouter>
        <Layout><div /></Layout>
      </MemoryRouter>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('Layout has a <header> landmark', () => {
    render(
      <MemoryRouter>
        <Layout><div /></Layout>
      </MemoryRouter>
    )
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('Layout has a <footer> landmark', () => {
    render(
      <MemoryRouter>
        <Layout><div /></Layout>
      </MemoryRouter>
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('FieldSelect label is associated with the select via htmlFor/id', () => {
    render(
      <FieldSelect
        name="ph"
        label="pH"
        options={PH_OPTIONS}
        value={7.0}
        onChange={() => {}}
      />
    )
    const label = screen.getByText('pH')
    const select = screen.getByTestId('field-ph')
    expect(label.getAttribute('for')).toBe(select.getAttribute('id'))
  })

  it('Nav links are keyboard accessible (role=link)', () => {
    render(
      <MemoryRouter>
        <Layout><div /></Layout>
      </MemoryRouter>
    )
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(3)
  })
})
