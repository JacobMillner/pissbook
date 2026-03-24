import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('PWA assets', () => {
  it('manifest is declared in vite.config.ts', () => {
    const config = readFileSync(resolve(__dirname, '../../vite.config.ts'), 'utf-8')
    expect(config).toContain('VitePWA')
    expect(config).toContain('manifest')
    expect(config).toContain('Pissbook')
  })

  it('pwa-192x192.png exists in public/', () => {
    expect(existsSync(resolve(__dirname, '../../public/pwa-192x192.png'))).toBe(true)
  })

  it('pwa-512x512.png exists in public/', () => {
    expect(existsSync(resolve(__dirname, '../../public/pwa-512x512.png'))).toBe(true)
  })

  it('apple-touch-icon.png exists in public/', () => {
    expect(existsSync(resolve(__dirname, '../../public/apple-touch-icon.png'))).toBe(true)
  })

  it('index.html includes meta theme-color', () => {
    const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8')
    expect(html).toContain('theme-color')
    expect(html).toContain('#3b5998')
  })
})
