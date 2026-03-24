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
