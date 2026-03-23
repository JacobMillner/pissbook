# Step 09 — Final Polish, Accessibility & End-to-End Smoke Tests

## Goal
Apply final UI polish to bring the early-Facebook aesthetic to life, ensure basic accessibility, and run a full smoke test suite that validates the complete user journey from entry creation to trends detection. This is the last step before the app is considered shippable.

---

## Tests to Write First (TDD)

Create `src/__tests__/smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { clearEntries, loadEntries } from '../utils/storage'

// We test App directly with BrowserRouter replaced by MemoryRouter
// by wrapping routes in a test helper.
import AppRoutes from '../AppRoutes'

function renderRoutes(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  )
}

describe('End-to-end smoke tests', () => {
  beforeEach(() => clearEntries())

  // ---- Full entry creation journey ----
  it('user can create an entry and see it on the data page', async () => {
    // 1. Render New Entry page
    renderRoutes('/')
    expect(screen.getByTestId('page-new-entry')).toBeInTheDocument()

    // 2. Submit with default values
    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => expect(loadEntries()).toHaveLength(1))

    // 3. Navigate to View Data and check entry exists
    renderRoutes('/data')
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    expect(screen.getAllByTestId(/^entry-row-/)).toHaveLength(1)
  })

  // ---- Trends page reflects entries ----
  it('trends page shows all-clear with normal entries', async () => {
    const { saveEntry, generateId } = await import('../utils/storage')
    saveEntry({
      id: generateId(), timestamp: new Date().toISOString(),
      hydration: 'optimal', urobilinogen: 3.3, bilirubin: 'neg', ketone: 'neg',
      zinc: 1, magnesium: 15, protein: 'neg', salinity: 300, nitrite: 'neg',
      leukocytes: 'neg', freeRadical: 'normal', specificGravity: 1.015,
      ph: 7.0, ascorbate: 0, uricAcid: 50, notes: '',
    })
    renderRoutes('/trends')
    expect(screen.getByTestId('trends-all-clear')).toBeInTheDocument()
  })

  // ---- Empty states ----
  it('view data shows empty state when no entries', () => {
    renderRoutes('/data')
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('trends shows empty state when no entries', () => {
    renderRoutes('/trends')
    expect(screen.getByTestId('trends-empty')).toBeInTheDocument()
  })

  // ---- 404 ----
  it('unknown route shows not-found page', () => {
    renderRoutes('/this-does-not-exist')
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument()
  })
})
```

Create `src/__tests__/accessibility.test.tsx`:

```tsx
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
    expect(links.length).toBeGreaterThanOrEqual(3) // logo + 2 nav links
  })
})
```

**All tests must pass before this step is complete.**

---

## Implementation

### 1. Fix Layout HTML semantics

Replace the `<div>` landmarks in `Layout.tsx` with proper HTML5 semantic elements:

- `<div style="...header">` → `<header>`
- `<div style="...main">` → `<main>`
- `<div style="...footer">` → `<footer>`

This makes the accessibility tests pass and improves SEO.

```tsx
// In Layout.tsx — change:
<div style={{ background: 'var(--fb-blue)', ... }}>
// To:
<header style={{ background: 'var(--fb-blue)', ... }}>

// Change:
<div style={{ flex: 1, maxWidth: '860px', ... }}>
// To:
<main style={{ flex: 1, maxWidth: '860px', ... }}>

// Change:
<div style={{ textAlign: 'center', ... }}>
// To:
<footer style={{ textAlign: 'center', ... }}>
```

### 2. Polish: Early Facebook UI details

Apply these finishing touches that make the Facebook aesthetic feel authentic:

**`src/index.css` additions** (append to existing file):

```css
/* ---- Facebook-style blue gradient header ---- */
header {
  background: linear-gradient(to bottom, #5b74a8 0%, #3b5998 100%) !important;
}

/* ---- Profile-style welcome strip on New Entry page ---- */
.fb-profile-header {
  background: linear-gradient(to bottom, #6d84b4, #3b5998);
  color: white;
  padding: 12px 16px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  font-family: var(--font-brand);
  font-size: 18px;
}

/* ---- Subtle zebra striping on table rows ---- */
tbody tr:nth-child(even) { background: #f7f9fc; }
tbody tr:hover { background: #eef1f8; }

/* ---- Tab active underline indicator ---- */
button[role="tab"][aria-selected="true"] {
  border-bottom: 3px solid var(--fb-blue) !important;
}

/* ---- Trend card animation ---- */
[data-testid^="trend-"] {
  animation: slideIn 0.25s ease-out;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Mobile responsiveness ---- */
@media (max-width: 600px) {
  main { padding: 0 8px; }
  .panel { padding: 10px; }
  header { gap: 12px; padding: 0 10px; }
}
```

### 3. Polish: NotFoundPage

Replace the stub with a proper Facebook-themed 404:

```tsx
// src/pages/NotFoundPage.tsx
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Layout>
      <div data-testid="page-not-found" className="panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚽</div>
        <h2 style={{ fontFamily: 'var(--font-brand)', color: 'var(--fb-blue)', marginBottom: '8px' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--fb-text-light)', marginBottom: '20px' }}>
          This page doesn't exist. Maybe it got flushed.
        </p>
        <Link to="/" className="btn btn-primary">← Back to New Entry</Link>
      </div>
    </Layout>
  )
}
```

### 4. Final `README.md`

Create a `README.md` in the project root:

```md
# 💛 Pissbook

Track your urine test strip results. All data is stored locally on your device.
Built as a PWA — install it to your home screen for the best experience.

## Features
- Log 16 test strip parameters per entry
- View results as a table or plotted over time (1W / 1M / 6M / 1Y)
- Automatic trend detection with plain-English summaries
- Export all data as CSV
- Works offline after first load
- Zero data leaves your device

## Development

\`\`\`bash
npm install
npm run dev       # start dev server
npm test          # run test suite
npm run build     # production build
\`\`\`

## Deployment

Push to `main`. The GitHub Actions workflow runs tests, builds, and deploys automatically to GitHub Pages.

## Disclaimer
Pissbook is a personal tracking tool, not a medical device. Always consult a healthcare professional for medical advice.
```

### 5. Run the full test suite

```bash
npm test
```

All test files should pass:
- `setup.test.ts`
- `storage.test.ts`
- `types.test.ts`
- `csv.test.ts`
- `routing.test.tsx`
- `layout.test.tsx`
- `new-entry.test.tsx`
- `view-data.test.tsx`
- `trends.test.tsx`
- `trend-analysis.test.ts`
- `pwa.test.ts`
- `workflow.test.ts`
- `smoke.test.tsx`
- `accessibility.test.tsx`

---

## Passing Criteria

1. `npm test` — all 14 test files pass with 0 failures.
2. `npm run build` — build succeeds with no TypeScript errors.
3. Push to `main` — Actions pipeline is green.
4. Visit the live GitHub Pages URL and verify:
   - App loads at `/pissbook/`
   - New Entry form submits
   - View Data shows the entry
   - Trends page works
   - "Add to Home Screen" prompt appears (or can be triggered from browser menu)
   - App loads correctly when offline (after one online visit)

**🎉 Pissbook is shipped.**
```

---

## Architecture Summary

```
src/
├── __tests__/          All test files — one per feature
├── components/
│   ├── Layout.tsx       App shell (header, main, footer)
│   ├── FieldSelect.tsx  Reusable labelled select
│   ├── EntryTable.tsx   List view of entries
│   ├── EntryCharts.tsx  Recharts line chart with range filter
│   └── TrendCard.tsx    Single trend display card
├── hooks/
│   ├── useEntryForm.ts  Form state + submit logic
│   └── useEntries.ts    Load/delete entries from storage
├── pages/
│   ├── NewEntryPage.tsx
│   ├── ViewDataPage.tsx
│   ├── TrendsPage.tsx
│   └── NotFoundPage.tsx
├── types/
│   └── index.ts         All field option constants + Entry type
├── utils/
│   ├── storage.ts       localStorage CRUD
│   ├── csv.ts           CSV export via papaparse
│   ├── filters.ts       Time range filtering + chartable fields
│   └── trends.ts        Trend analysis rules
├── constants.ts
├── AppRoutes.tsx
├── App.tsx
└── main.tsx
```

**Key design rules followed throughout:**
- No component imports `localStorage` directly — all storage goes through `utils/storage.ts`
- All types come from `types/index.ts` — no inline type literals in components
- Custom hooks own stateful logic — pages are thin shells
- Every utility function is pure and independently testable
- CSS uses variables from `index.css` — no hardcoded hex values in JSX
