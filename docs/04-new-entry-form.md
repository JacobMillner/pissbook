# Step 04 — New Entry Form Page

## Goal
Build the full New Entry form. Each test strip field is a labelled `<select>` that maps to the typed option sets from Step 01. Submitting saves the entry to localStorage and shows a confirmation. The submit button reads **"Post to Pissbook"**.

---

## Tests to Write First (TDD)

Create `src/__tests__/new-entry.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NewEntryPage from '../pages/NewEntryPage'
import { loadEntries, clearEntries } from '../utils/storage'

function renderPage() {
  return render(
    <MemoryRouter>
      <NewEntryPage />
    </MemoryRouter>
  )
}

describe('NewEntryPage', () => {
  beforeEach(() => clearEntries())

  it('renders the "Post to Pissbook" submit button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /post to pissbook/i })).toBeInTheDocument()
  })

  it('renders a select for every tracked field', () => {
    renderPage()
    const fields = [
      'hydration', 'urobilinogen', 'bilirubin', 'ketone', 'zinc',
      'magnesium', 'protein', 'salinity', 'nitrite', 'leukocytes',
      'freeRadical', 'specificGravity', 'ph', 'ascorbate', 'uricAcid'
    ]
    fields.forEach(name => {
      expect(screen.getByTestId(`field-${name}`)).toBeInTheDocument()
    })
  })

  it('saves an entry to storage on submit', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      expect(loadEntries()).toHaveLength(1)
    })
  })

  it('shows a success confirmation after submit', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      expect(screen.getByTestId('submit-success')).toBeInTheDocument()
    })
  })

  it('resets the form to defaults after successful submit', async () => {
    const user = userEvent.setup()
    renderPage()
    // Change hydration from default
    const hydrationSelect = screen.getByTestId('field-hydration') as HTMLSelectElement
    await user.selectOptions(hydrationSelect, 'severely_dehydrated')
    expect(hydrationSelect.value).toBe('severely_dehydrated')

    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      expect(hydrationSelect.value).toBe('optimal') // back to default
    })
  })

  it('saves the correct timestamp (ISO format)', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /post to pissbook/i }))
    await waitFor(() => {
      const entries = loadEntries()
      expect(entries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  it('renders a notes textarea', () => {
    renderPage()
    expect(screen.getByTestId('field-notes')).toBeInTheDocument()
  })
})
```

**All tests must pass before this step is complete.**

---

## Implementation

### `src/hooks/useEntryForm.ts`

Extract form state logic into a custom hook so the page component stays clean.

```ts
import { useState } from 'react'
import { DEFAULT_ENTRY } from '../types'
import { saveEntry, generateId } from '../utils/storage'
import type { Entry } from '../types'

type FormState = Omit<Entry, 'id' | 'timestamp'>

export function useEntryForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_ENTRY)
  const [submitted, setSubmitted] = useState(false)

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    const entry: Entry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...form,
    }
    saveEntry(entry)
    setForm(DEFAULT_ENTRY)
    setSubmitted(true)
    // Hide success message after 3 seconds
    setTimeout(() => setSubmitted(false), 3000)
  }

  return { form, submitted, handleChange, handleSubmit }
}
```

### `src/components/FieldSelect.tsx`

A reusable select component used for every strip field. Keeps the form DRY.

```tsx
interface Option {
  value: string | number
  label: string
}

interface FieldSelectProps {
  name: string
  label: string
  hint?: string
  options: readonly Option[]
  value: string | number
  onChange: (value: string | number) => void
}

export default function FieldSelect({
  name, label, hint, options, value, onChange
}: FieldSelectProps) {
  return (
    <div className="field-group">
      <label htmlFor={name}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      <select
        id={name}
        data-testid={`field-${name}`}
        value={String(value)}
        onChange={e => {
          // Preserve numeric types when the original value was a number
          const raw = e.target.value
          const asNum = Number(raw)
          onChange(isNaN(asNum) ? raw : asNum)
        }}
      >
        {options.map(opt => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

### `src/pages/NewEntryPage.tsx` (full implementation)

```tsx
import Layout from '../components/Layout'
import FieldSelect from '../components/FieldSelect'
import { useEntryForm } from '../hooks/useEntryForm'
import {
  HYDRATION_OPTIONS, UROBILINOGEN_OPTIONS, BILIRUBIN_OPTIONS,
  KETONE_OPTIONS, ZINC_OPTIONS, MAGNESIUM_OPTIONS, PROTEIN_OPTIONS,
  SALINITY_OPTIONS, NITRITE_OPTIONS, LEUKOCYTE_OPTIONS, FREE_RADICAL_OPTIONS,
  SPECIFIC_GRAVITY_OPTIONS, PH_OPTIONS, ASCORBATE_OPTIONS, URIC_ACID_OPTIONS,
} from '../types'

export default function NewEntryPage() {
  const { form, submitted, handleChange, handleSubmit } = useEntryForm()

  return (
    <Layout>
      <div data-testid="page-new-entry">
        {/* Page header */}
        <div className="panel" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '20px', color: 'var(--fb-blue)', marginBottom: '4px' }}>
            New Pee Strip Entry
          </h2>
          <p style={{ color: 'var(--fb-text-light)', fontSize: '12px' }}>
            Record your test strip readings. All data is saved to this device only.
          </p>
        </div>

        {/* Success banner */}
        {submitted && (
          <div
            data-testid="submit-success"
            style={{
              background: '#dff0d8',
              border: '1px solid #3c763d',
              color: '#3c763d',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: '16px',
              fontWeight: 700,
            }}
          >
            ✓ Posted to Pissbook!
          </div>
        )}

        {/* Form card */}
        <div className="panel">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 20px' }}>

            <FieldSelect name="hydration" label="Hydration Level"
              options={HYDRATION_OPTIONS} value={form.hydration}
              onChange={v => handleChange('hydration', v as typeof form.hydration)} />

            <FieldSelect name="urobilinogen" label="Urobilinogen" hint="umol/L"
              options={UROBILINOGEN_OPTIONS} value={form.urobilinogen}
              onChange={v => handleChange('urobilinogen', v as typeof form.urobilinogen)} />

            <FieldSelect name="bilirubin" label="Bilirubin" hint="umol/L"
              options={BILIRUBIN_OPTIONS} value={form.bilirubin}
              onChange={v => handleChange('bilirubin', v as typeof form.bilirubin)} />

            <FieldSelect name="ketone" label="Ketone" hint="mmol/L"
              options={KETONE_OPTIONS} value={form.ketone}
              onChange={v => handleChange('ketone', v as typeof form.ketone)} />

            <FieldSelect name="zinc" label="Zinc" hint="mg/L"
              options={ZINC_OPTIONS} value={form.zinc}
              onChange={v => handleChange('zinc', v as typeof form.zinc)} />

            <FieldSelect name="magnesium" label="Magnesium" hint="mg/dL"
              options={MAGNESIUM_OPTIONS} value={form.magnesium}
              onChange={v => handleChange('magnesium', v as typeof form.magnesium)} />

            <FieldSelect name="protein" label="Protein" hint="g/L"
              options={PROTEIN_OPTIONS} value={form.protein}
              onChange={v => handleChange('protein', v as typeof form.protein)} />

            <FieldSelect name="salinity" label="Salinity" hint="mg/dL"
              options={SALINITY_OPTIONS} value={form.salinity}
              onChange={v => handleChange('salinity', v as typeof form.salinity)} />

            <FieldSelect name="nitrite" label="Nitrite"
              options={NITRITE_OPTIONS} value={form.nitrite}
              onChange={v => handleChange('nitrite', v as typeof form.nitrite)} />

            <FieldSelect name="leukocytes" label="Leukocytes" hint="cells/uL"
              options={LEUKOCYTE_OPTIONS} value={form.leukocytes}
              onChange={v => handleChange('leukocytes', v as typeof form.leukocytes)} />

            <FieldSelect name="freeRadical" label="Free Radical"
              options={FREE_RADICAL_OPTIONS} value={form.freeRadical}
              onChange={v => handleChange('freeRadical', v as typeof form.freeRadical)} />

            <FieldSelect name="specificGravity" label="Specific Gravity"
              options={SPECIFIC_GRAVITY_OPTIONS} value={form.specificGravity}
              onChange={v => handleChange('specificGravity', v as typeof form.specificGravity)} />

            <FieldSelect name="ph" label="pH"
              options={PH_OPTIONS} value={form.ph}
              onChange={v => handleChange('ph', v as typeof form.ph)} />

            <FieldSelect name="ascorbate" label="Ascorbate" hint="mmol/L"
              options={ASCORBATE_OPTIONS} value={form.ascorbate}
              onChange={v => handleChange('ascorbate', v as typeof form.ascorbate)} />

            <FieldSelect name="uricAcid" label="Uric Acid" hint="mg/L"
              options={URIC_ACID_OPTIONS} value={form.uricAcid}
              onChange={v => handleChange('uricAcid', v as typeof form.uricAcid)} />
          </div>

          {/* Notes */}
          <div className="field-group" style={{ marginTop: '12px' }}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              data-testid="field-notes"
              rows={3}
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Optional notes about this reading..."
            />
          </div>

          {/* Submit */}
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Post to Pissbook
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
```

---

## Passing Criteria

Run `npm test` — all tests in `new-entry.test.tsx` must pass. Manually test in the browser: fill the form, click **Post to Pissbook**, confirm success banner appears, and verify `localStorage` contains the entry via DevTools before proceeding to Step 05.
