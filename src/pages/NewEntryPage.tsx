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
        <div className="panel" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '20px', color: 'var(--fb-blue)', marginBottom: '4px' }}>
            New Pee Strip Entry
          </h2>
          <p style={{ color: 'var(--fb-text-light)', fontSize: '12px' }}>
            Record your test strip readings. All data is saved to this device only.
          </p>
        </div>

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
