import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from './components/Toast'
import './index.css'

const App = lazy(() => import('./App'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent" />
        </div>
      }>
        <App />
      </Suspense>
    </ToastProvider>
  </StrictMode>,
)
