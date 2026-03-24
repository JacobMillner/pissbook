import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ---- Top navigation bar ---- */}
      <header style={{
        background: 'var(--fb-blue)',
        boxShadow: 'var(--shadow-nav)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        height: '40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Brand logotype */}
        <NavLink to="/" style={{
          fontFamily: 'var(--font-brand)',
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: '-0.5px',
          textDecoration: 'none',
        }}>
          Pissbook
        </NavLink>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {[
            { to: '/data',    label: 'View Data' },
            { to: '/trends',  label: 'Trends' },
            { to: '/test',    label: 'Test' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                fontWeight: isActive ? 700 : 400,
                fontSize: '13px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'rgba(0,0,0,0.25)' : 'transparent',
                textDecoration: 'none',
              })}
            >
              {({ isActive }) => (
                <span aria-current={isActive ? 'page' : undefined}>{label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ---- Page content ---- */}
      <main style={{
        flex: 1,
        maxWidth: '860px',
        width: '100%',
        margin: '24px auto',
        padding: '0 16px',
      }}>
        {children}
      </main>

      {/* ---- Footer ---- */}
      <footer style={{
        textAlign: 'center',
        padding: '12px',
        fontSize: '11px',
        color: 'var(--fb-text-light)',
        borderTop: '1px solid var(--fb-border)',
      }}>
        Pissbook &copy; {new Date().getFullYear()} — Your data stays on your device.
      </footer>
    </div>
  )
}
