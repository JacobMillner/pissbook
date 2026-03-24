import { useState } from 'react'
import type { Entry } from '../types'
import { HYDRATION_OPTIONS } from '../types'

interface Props {
  entries: Entry[]
  onDelete: (id: string) => void
}

const FIELD_LABELS: Record<string, string> = {
  hydration: 'Hydration',
  ph: 'pH',
  specificGravity: 'Spec Gravity',
  ketone: 'Ketone',
  urobilinogen: 'Urobilinogen',
  bilirubin: 'Bilirubin',
  zinc: 'Zinc',
  magnesium: 'Magnesium',
  protein: 'Protein',
  salinity: 'Salinity',
  nitrite: 'Nitrite',
  leukocytes: 'Leukocytes',
  freeRadical: 'Free Radical',
  ascorbate: 'Ascorbate',
  uricAcid: 'Uric Acid',
}

const SUMMARY_FIELDS: (keyof Entry)[] = ['ph', 'specificGravity', 'ketone']

const DETAIL_FIELDS: (keyof Entry)[] = [
  'urobilinogen', 'bilirubin', 'zinc', 'magnesium',
  'protein', 'salinity', 'nitrite', 'leukocytes',
  'freeRadical', 'ascorbate', 'uricAcid',
]

function getHydrationStyle(value: string) {
  const opt = HYDRATION_OPTIONS.find(o => o.value === value)
  if (!opt) return {}
  const isDark = value === 'optimal' || value === 'severely_dehydrated'
  return {
    backgroundColor: opt.color,
    color: isDark ? '#fff' : '#1a1a1a',
  }
}

function getHydrationLabel(value: string) {
  return HYDRATION_OPTIONS.find(o => o.value === value)?.label ?? value
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    + ' \u00b7 '
    + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

interface CardProps {
  entry: Entry
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
}

function EntryCard({ entry, expanded, onToggle, onDelete }: CardProps) {
  return (
    <div className="entry-card" data-testid={`entry-row-${entry.id}`}>
      <div className="entry-card-header">
        <span className="entry-card-date">{formatDate(entry.timestamp)}</span>
        <button
          className="btn btn-danger entry-card-delete"
          data-testid={`delete-${entry.id}`}
          onClick={onDelete}
          aria-label="Delete entry"
        >
          ✕
        </button>
      </div>

      <div className="entry-card-summary">
        <span
          className="hydration-badge"
          style={getHydrationStyle(entry.hydration)}
        >
          {getHydrationLabel(entry.hydration)}
        </span>
        {SUMMARY_FIELDS.map(f => (
          <span className="summary-metric" key={f}>
            <span className="metric-label">{FIELD_LABELS[f]}</span>
            <span className="metric-value">{String(entry[f])}</span>
          </span>
        ))}
      </div>

      <button className="entry-card-toggle" onClick={onToggle} aria-expanded={expanded}>
        {expanded ? '▲ Hide details' : '▼ Show details'}
      </button>

      <div className={`entry-card-details ${expanded ? 'is-open' : ''}`}>
        <div className="detail-grid">
          {DETAIL_FIELDS.map(f => (
            <div className="detail-item" key={f}>
              <span className="detail-label">{FIELD_LABELS[f]}</span>
              <span className="detail-value">{String(entry[f])}</span>
            </div>
          ))}
          {entry.notes && (
            <div className="detail-item detail-notes">
              <span className="detail-label">Notes</span>
              <span className="detail-value">{entry.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EntryTable({ entries, onDelete }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  if (entries.length === 0) {
    return (
      <p data-testid="empty-state" style={{ color: 'var(--fb-text-light)', textAlign: 'center', padding: '24px' }}>
        No entries yet. Go post your first reading!
      </p>
    )
  }

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="entry-card-list">
      {entries.map(entry => (
        <EntryCard
          key={entry.id}
          entry={entry}
          expanded={expandedIds.has(entry.id)}
          onToggle={() => toggle(entry.id)}
          onDelete={() => onDelete(entry.id)}
        />
      ))}
    </div>
  )
}
