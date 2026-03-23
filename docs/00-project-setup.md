# Step 00 — Project Setup & Scaffold

## Goal
Bootstrap a React + TypeScript PWA project using Vite, configure it for GitHub Pages static deployment, and establish the foundational folder structure and tooling. All subsequent steps build on this scaffold.

---

## Tests to Write First (TDD)

Create `src/__tests__/setup.test.ts` before doing anything else:

```ts
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
```

**These tests must pass before this step is complete.**

---

## Setup Instructions

### 1. Scaffold the project

```bash
npm create vite@latest pissbook -- --template react-ts
cd pissbook
npm install
```

### 2. Install dependencies

```bash
# PWA support
npm install vite-plugin-pwa workbox-window

# Routing
npm install react-router-dom

# Charting
npm install recharts

# CSV export utility
npm install papaparse
npm install --save-dev @types/papaparse

# Testing
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

### 3. Configure `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pissbook/',           // Must match your GitHub repo name exactly
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Pissbook',
        short_name: 'Pissbook',
        description: 'Track your pee test strip results',
        theme_color: '#3b5998',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/pissbook/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts']
  }
})
```

### 4. Create `src/test-setup.ts`

```ts
import '@testing-library/jest-dom'
```

### 5. Update `package.json` scripts section

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint src --ext ts,tsx"
}
```

### 6. Create `src/constants.ts`

```ts
export const APP_NAME = 'Pissbook'
export const APP_VERSION = '1.0.0'
export const STORAGE_KEY = 'pissbook_entries'
```

---

## Folder Structure to Create

```
pissbook/
├── public/
│   ├── favicon.ico
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── __tests__/
│   │   └── setup.test.ts
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── constants.ts
│   ├── test-setup.ts
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
└── package.json
```

> **Architecture note:** Keep `components/` for reusable UI primitives, `pages/` for route-level components, `hooks/` for stateful logic, and `utils/` for pure functions. No component should directly access localStorage — that belongs in hooks or utils.

---

## Passing Criteria

Run `npm test` — all tests in `setup.test.ts` must be green before proceeding to Step 01.
