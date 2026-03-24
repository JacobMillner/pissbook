import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for offline support
registerSW({
  onNeedRefresh() {
    // Could show a toast asking user to reload — keep it simple for now
    console.log('[SW] New content available. Refresh to update.')
  },
  onOfflineReady() {
    console.log('[SW] App is ready to work offline.')
  },
})
