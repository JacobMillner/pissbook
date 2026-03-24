import { useState } from 'react'
import Layout from '../components/Layout'
import EntryTable from '../components/EntryTable'
import EntryCharts from '../components/EntryCharts'
import { useEntries } from '../hooks/useEntries'
import { exportToCsv } from '../utils/csv'

type Tab = 'list' | 'graph'

export default function ViewDataPage() {
  const { entries, deleteEntry } = useEntries()
  const [tab, setTab] = useState<Tab>('list')

  return (
    <Layout>
      <div data-testid="page-view-data">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '20px', color: 'var(--fb-blue)' }}>
            Your Entries{entries.length > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--fb-text-light)', marginLeft: '8px' }}>
                ({entries.length})
              </span>
            )}
          </h2>
          <button
            className="btn btn-secondary"
            onClick={() => exportToCsv(entries)}
          >
            Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '0', borderBottom: '2px solid var(--fb-border)' }}>
          {(['list', 'graph'] as Tab[]).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className="btn"
              style={{
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                background: tab === t ? 'var(--fb-panel)' : 'var(--fb-bg)',
                borderColor: tab === t ? 'var(--fb-border)' : 'transparent',
                borderBottomColor: tab === t ? 'var(--fb-panel)' : 'transparent',
                marginBottom: tab === t ? '-2px' : '0',
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? 'var(--fb-blue)' : 'var(--fb-text-light)',
              }}
              onClick={() => setTab(t)}
            >
              {t === 'list' ? 'List' : 'Graph'}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="panel" style={{ borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)' }}>
          {tab === 'list'
            ? <EntryTable entries={entries} onDelete={deleteEntry} />
            : <EntryCharts entries={entries} />
          }
        </div>
      </div>
    </Layout>
  )
}
