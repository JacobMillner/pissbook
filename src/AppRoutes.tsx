import { Routes, Route } from 'react-router-dom'
import NewEntryPage from './pages/NewEntryPage'
import ViewDataPage from './pages/ViewDataPage'
import TrendsPage from './pages/TrendsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NewEntryPage />} />
      <Route path="/data" element={<ViewDataPage />} />
      <Route path="/trends" element={<TrendsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
