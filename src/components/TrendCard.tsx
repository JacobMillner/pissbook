import type { Trend } from '../utils/trends'

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  alert:   { bg: '#fde8e8', border: '#cc0000', icon: '⚠️' },
  warning: { bg: '#fff3cd', border: '#d4a017', icon: '⚡' },
  info:    { bg: '#e8f0fe', border: '#3b5998', icon: 'ℹ️' },
}

export default function TrendCard({ trend }: { trend: Trend }) {
  const style = SEVERITY_STYLES[trend.severity]
  return (
    <div
      data-testid={`trend-${trend.field}`}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        marginBottom: '10px',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '4px' }}>
        {style.icon} {trend.title}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--fb-text)', lineHeight: 1.5 }}>
        {trend.description}
      </p>
    </div>
  )
}
