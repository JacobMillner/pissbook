import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts'
import { useState } from 'react'
import { filterByRange, CHARTABLE_FIELDS } from '../utils/filters'
import type { Entry } from '../types'
import type { TimeRange } from '../utils/filters'

const RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
]

const LINE_COLORS = ['#3b5998','#e07b39','#4caf50','#e53935','#8e24aa','#0097a7','#f9a825','#6d4c41']

interface Props { entries: Entry[] }

export default function EntryCharts({ entries }: Props) {
  const [range, setRange] = useState<TimeRange>('1m')
  const [activeField, setActiveField] = useState<keyof Entry>('ph')

  const filtered = filterByRange(entries, range).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const chartData = filtered.map(e => ({
    date: new Date(e.timestamp).toLocaleDateString(),
    value: typeof e[activeField] === 'number' ? e[activeField] : undefined,
  }))

  return (
    <div data-testid="graph-view">
      {/* Time range selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--fb-text-light)' }}>Range:</span>
        {RANGE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`btn ${range === opt.value ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '12px' }}
            onClick={() => setRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Field selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontWeight: 700, fontSize: '12px', display: 'inline', marginRight: '8px' }}>Field:</label>
        <select
          value={String(activeField)}
          onChange={e => setActiveField(e.target.value as keyof Entry)}
          style={{ width: 'auto', display: 'inline-block' }}
        >
          {CHARTABLE_FIELDS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {chartData.length < 2 ? (
        <p style={{ color: 'var(--fb-text-light)', textAlign: 'center', padding: '24px' }}>
          Not enough data for this range. Add more entries!
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--fb-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={LINE_COLORS[0]}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={String(activeField)}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
