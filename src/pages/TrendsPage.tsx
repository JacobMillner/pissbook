import { useState } from 'react'
import Layout from '../components/Layout'
import TrendCard from '../components/TrendCard'
import { useEntries } from '../hooks/useEntries'
import { filterByRange } from '../utils/filters'
import { analyseTrends } from '../utils/trends'
import type { TimeRange } from '../utils/filters'

const PERIOD_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '1 Week',    value: '1w' },
  { label: '1 Month',   value: '1m' },
  { label: '6 Months',  value: '6m' },
  { label: '1 Year',    value: '1y' },
]

export default function TrendsPage() {
  const { entries } = useEntries()
  const [period, setPeriod] = useState<TimeRange>('1m')

  const filtered = filterByRange(entries, period)
  const trends = analyseTrends(filtered)

  return (
    <Layout>
      <div data-testid="page-trends">
        {/* Header */}
        <div className="panel" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '20px', color: 'var(--fb-blue)', marginBottom: '2px' }}>
              Trends
            </h2>
            <p style={{ color: 'var(--fb-text-light)', fontSize: '12px' }}>
              Patterns detected across {filtered.length} reading{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <label htmlFor="period-selector" style={{ marginRight: '6px', fontWeight: 700 }}>Period:</label>
            <select
              id="period-selector"
              data-testid="period-selector"
              value={period}
              style={{ width: 'auto', display: 'inline-block' }}
              onChange={e => setPeriod(e.target.value as TimeRange)}
            >
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="panel">
          {entries.length === 0 ? (
            <p data-testid="trends-empty" style={{ color: 'var(--fb-text-light)', textAlign: 'center', padding: '24px' }}>
              No entries yet. Start recording to see trends here.
            </p>
          ) : trends.length === 0 ? (
            <div data-testid="trends-all-clear" style={{ textAlign: 'center', padding: '24px', color: '#2d6a4f' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
              <strong>All clear!</strong>
              <p style={{ fontSize: '12px', color: 'var(--fb-text-light)', marginTop: '4px' }}>
                No notable trends detected in this period.
              </p>
            </div>
          ) : (
            trends.map(t => <TrendCard key={`${t.field}-${t.severity}`} trend={t} />)
          )}
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginTop: '12px', textAlign: 'center' }}>
          Pissbook is not a medical device. These insights are for personal tracking only. Consult a healthcare professional for medical advice.
        </p>
      </div>
    </Layout>
  )
}
