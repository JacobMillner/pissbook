import type { Entry } from '../types'

interface Props {
  entries: Entry[]
  onDelete: (id: string) => void
}

const VISIBLE_FIELDS: (keyof Entry)[] = [
  'timestamp', 'hydration', 'urobilinogen', 'bilirubin', 'ketone',
  'zinc', 'magnesium', 'protein', 'salinity', 'nitrite',
  'leukocytes', 'freeRadical', 'specificGravity', 'ph', 'ascorbate', 'uricAcid'
]

const FIELD_LABELS: Record<string, string> = {
  timestamp: 'Date',
  hydration: 'Hydration',
  urobilinogen: 'Urobilinogen',
  bilirubin: 'Bilirubin',
  ketone: 'Ketone',
  zinc: 'Zinc',
  magnesium: 'Magnesium',
  protein: 'Protein',
  salinity: 'Salinity',
  nitrite: 'Nitrite',
  leukocytes: 'Leukocytes',
  freeRadical: 'Free Radical',
  specificGravity: 'Spec Gravity',
  ph: 'pH',
  ascorbate: 'Ascorbate',
  uricAcid: 'Uric Acid',
}

export default function EntryTable({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <p data-testid="empty-state" style={{ color: 'var(--fb-text-light)', textAlign: 'center', padding: '24px' }}>
        No entries yet. Go post your first reading!
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: 'var(--fb-bg)', borderBottom: '2px solid var(--fb-border)' }}>
            {VISIBLE_FIELDS.map(f => (
              <th key={f} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>
                {FIELD_LABELS[f]}
              </th>
            ))}
            <th style={{ padding: '6px 8px' }}>Del</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id} data-testid={`entry-row-${entry.id}`}
              style={{ borderBottom: '1px solid var(--fb-border)' }}>
              {VISIBLE_FIELDS.map(f => (
                <td key={f} style={{ padding: '5px 8px' }}>
                  {f === 'timestamp'
                    ? new Date(entry.timestamp).toLocaleString()
                    : String(entry[f])}
                </td>
              ))}
              <td style={{ padding: '5px 8px' }}>
                <button
                  className="btn btn-danger"
                  data-testid={`delete-${entry.id}`}
                  style={{ padding: '2px 8px', fontSize: '11px' }}
                  onClick={() => onDelete(entry.id)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
