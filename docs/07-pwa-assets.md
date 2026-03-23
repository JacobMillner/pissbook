# Step 07 — PWA Assets & Service Worker

## Goal
Complete the PWA configuration so the app can be installed to a home screen, works offline after first load, and passes Lighthouse's installability requirements. Generate the required icon assets and verify the manifest and service worker are wired correctly.

---

## Tests to Write First (TDD)

Create `src/__tests__/pwa.test.ts`:

```ts
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
```

**All tests must pass before this step is complete.**

---

## Implementation

### 1. Generate icon assets

Use a 512×512 source image. The quickest approach during development is to create simple coloured placeholder PNGs using a Node script, which you replace before shipping.

Create `scripts/gen-icons.mjs`:

```js
// scripts/gen-icons.mjs
// Requires: npm install --save-dev sharp
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, '../public')

// Create a simple blue square with white text as a placeholder icon
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" fill="#3b5998"/>
  <text x="50%" y="54%" font-family="Georgia,serif" font-size="180"
    fill="white" text-anchor="middle" dominant-baseline="middle">P</text>
</svg>`

const svgBuffer = Buffer.from(svgIcon)

for (const size of [192, 512]) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(PUBLIC, `pwa-${size}x${size}.png`))
  console.log(`Generated pwa-${size}x${size}.png`)
}

await sharp(svgBuffer).resize(180, 180).png().toFile(resolve(PUBLIC, 'apple-touch-icon.png'))
console.log('Generated apple-touch-icon.png')
```

Run it:
```bash
npm install --save-dev sharp
node scripts/gen-icons.mjs
```

> **Note:** Replace the placeholder SVG with your final artwork before deployment. The icon should clearly communicate the Pissbook brand.

### 2. Update `index.html`

Add PWA meta tags inside `<head>`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#3b5998" />
    <meta name="description" content="Track your pee strip results — your data stays on your device." />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Pissbook" />
    <link rel="apple-touch-icon" href="/pissbook/apple-touch-icon.png" />
    <title>Pissbook</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3. Register the service worker in `src/main.tsx`

Add PWA registration after app mount:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker for offline support
registerSW({
  onNeedRefresh() {
    // Could show a toast asking user to reload — keep it simple for now
    console.log('[SW] New content available. Refresh to update.')
  },
  onOfflineReady() {
    console.log('[SW] App is ready to work offline.')
  },
})
```

### 4. Verify `vite.config.ts` manifest completeness

Ensure the manifest in `vite.config.ts` matches exactly what you've tested:

```ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
  manifest: {
    name: 'Pissbook',
    short_name: 'Pissbook',
    description: 'Track your pee strip results. Your data stays on your device.',
    theme_color: '#3b5998',
    background_color: '#e9ebee',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/pissbook/',
    scope: '/pissbook/',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
})
```

### 5. Add TypeScript declaration for the virtual module

Create `src/vite-pwa.d.ts`:

```ts
declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
  }): (reloadPage?: boolean) => Promise<void>
}
```

---

## Passing Criteria

1. Run `npm test` — all tests in `pwa.test.ts` must pass.
2. Run `npm run build && npm run preview`.
3. Open Chrome DevTools → Application → Manifest. Confirm it shows `Pissbook`, icons load, and there are no manifest errors.
4. Check Application → Service Workers. The SW should be registered and active.
5. Run a Lighthouse PWA audit — target a score of 90+.

Proceed to Step 08.
