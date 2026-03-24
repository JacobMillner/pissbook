import { BrowserRouter } from 'react-router-dom'
import { EntriesProvider } from './hooks/useEntries'
import AppRoutes from './AppRoutes'

export default function App() {
  return (
    <BrowserRouter basename="/pissbook">
      <EntriesProvider>
        <AppRoutes />
      </EntriesProvider>
    </BrowserRouter>
  )
}
