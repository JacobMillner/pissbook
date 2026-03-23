// src/__tests__/setup.test.ts
import { describe, it, expect } from 'vitest'

describe('Project scaffold', () => {
  it('should import React without errors', async () => {
    const React = await import('react')
    expect(React).toBeDefined()
  })

  it('should have a valid APP_NAME constant', async () => {
    const { APP_NAME } = await import('../constants')
    expect(APP_NAME).toBe('Pissbook')
  })

  it('should have a valid APP_VERSION constant', async () => {
    const { APP_VERSION } = await import('../constants')
    expect(typeof APP_VERSION).toBe('string')
    expect(APP_VERSION.length).toBeGreaterThan(0)
  })
})
