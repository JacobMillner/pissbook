# Step 03 — Theme, Layout Shell & Navigation

## Goal
Build the persistent app shell: the Facebook-blue top navigation bar, the global CSS theme, and the `Layout` wrapper component used by every page. The design language is early Facebook (2004–2008): navy/blue header bar, white card panels, clean serif-accented logotype, subtle drop shadows, and Georgia/Times body text.

---

## Tests to Write First (TDD)

Create `src/__tests__/layout.test.tsx`:

```tsx
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
```

**All tests must pass before this step is complete.**

---

## Implementation

### Global CSS — `src/index.css`

Replace the default Vite stylesheet entirely:

```css
/* ============================================================
   PISSBOOK — Early Facebook Theme
   Primary blue: #3b5998  |  Light blue: #6d84b4
   Background: #e9ebee    |  Panel: #ffffff
   Text: #333333           |  Link: #3b5998
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Georgia:ital,wght@0,400;0,700;1,400&family=Tahoma:wght@400;700&display=swap');

:root {
  --fb-blue:        #3b5998;
  --fb-blue-light:  #6d84b4;
  --fb-blue-dark:   #2d4373;
  --fb-bg:          #e9ebee;
  --fb-panel:       #ffffff;
  --fb-border:      #c9cdd4;
  --fb-text:        #333333;
  --fb-text-light:  #777777;
  --fb-link:        #3b5998;
  --fb-red:         #cc0000;
  --fb-green:       #2d6a4f;
  --fb-yellow:      #d4a017;

  --font-ui:        'Tahoma', 'Helvetica Neue', Arial, sans-serif;
  --font-brand:     Georgia, 'Times New Roman', serif;

  --radius-sm:      4px;
  --radius-md:      6px;
  --shadow-card:    0 1px 3px rgba(0,0,0,0.15);
  --shadow-nav:     0 2px 4px rgba(0,0,0,0.25);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  font-family: var(--font-ui);
  font-size: 13px;
  background-color: var(--fb-bg);
  color: var(--fb-text);
  min-height: 100vh;
}

a { color: var(--fb-link); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ---- Utility classes ---- */
.panel {
  background: var(--fb-panel);
  border: 1px solid var(--fb-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 16px;
}

.btn {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s, box-shadow 0.15s;
}

.btn-primary {
  background: var(--fb-blue);
  color: #fff;
  border-color: var(--fb-blue-dark);
}
.btn-primary:hover { background: var(--fb-blue-dark); text-decoration: none; }

.btn-secondary {
  background: #f0f2f5;
  color: var(--fb-text);
  border-color: var(--fb-border);
}
.btn-secondary:hover { background: #e4e6eb; text-decoration: none; }

.btn-danger {
  background: var(--fb-red);
  color: #fff;
  border-color: #990000;
}

/* ---- Form elements ---- */
select, input[type="text"], textarea {
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--fb-text);
  background: #fff;
  border: 1px solid #bdc7d8;
  border-radius: var(--radius-sm);
  padding: 5px 8px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
select:focus, input:focus, textarea:focus {
  border-color: var(--fb-blue);
  box-shadow: 0 0 0 2px rgba(59,89,152,0.2);
}

label {
  display: block;
  font-weight: 700;
  margin-bottom: 3px;
  color: var(--fb-text);
}

.field-group { margin-bottom: 12px; }
.field-hint { font-size: 11px; color: var(--fb-text-light); margin-top: 2px; }
```

### `src/components/Layout.tsx`

```tsx
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ---- Top navigation bar ---- */}
      <header style={{
        background: 'var(--fb-blue)',
        boxShadow: 'var(--shadow-nav)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        height: '40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Brand logotype */}
        <NavLink to="/" style={{
          fontFamily: 'var(--font-brand)',
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: '-0.5px',
          textDecoration: 'none',
        }}>
          Pissbook
        </NavLink>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {[
            { to: '/data',    label: 'View Data' },
            { to: '/trends',  label: 'Trends' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              aria-current={undefined}  // NavLink sets this automatically
              style={({ isActive }) => ({
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                fontWeight: isActive ? 700 : 400,
                fontSize: '13px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'rgba(0,0,0,0.25)' : 'transparent',
                textDecoration: 'none',
              })}
              // expose aria-current for tests
              {...({ 'aria-current': undefined })}
            >
              {({ isActive }) => (
                <span aria-current={isActive ? 'page' : undefined}>{label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ---- Page content ---- */}
      <main style={{
        flex: 1,
        maxWidth: '860px',
        width: '100%',
        margin: '24px auto',
        padding: '0 16px',
      }}>
        {children}
      </main>

      {/* ---- Footer ---- */}
      <footer style={{
        textAlign: 'center',
        padding: '12px',
        fontSize: '11px',
        color: 'var(--fb-text-light)',
        borderTop: '1px solid var(--fb-border)',
      }}>
        Pissbook &copy; {new Date().getFullYear()} — Your data stays on your device.
      </footer>
    </div>
  )
}
```

> **Important:** `NavLink` automatically applies `aria-current="page"` to the active link in React Router v6. The test checks for this attribute on the wrapping `<a>` element — make sure you are not stripping it.

### Wire Layout into pages

Update each stub page to use `Layout`:

```tsx
// src/pages/NewEntryPage.tsx
import Layout from '../components/Layout'
export default function NewEntryPage() {
  return (
    <Layout>
      <div data-testid="page-new-entry"><h1>New Entry</h1></div>
    </Layout>
  )
}
```

Repeat the same wrapping pattern for `ViewDataPage`, `TrendsPage`, and `NotFoundPage`.

### Update `src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## Passing Criteria

Run `npm test` — all tests in `layout.test.tsx` must pass. Run `npm run dev` and verify the blue nav bar renders with working links before proceeding to Step 04.
