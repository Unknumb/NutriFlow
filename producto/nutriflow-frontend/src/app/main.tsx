import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'
import { TracingInstrumentation } from '@grafana/faro-web-tracing'
import { initAuthListener } from '../shared/utils/supabase'

// RUM (Grafana Cloud Frontend Observability): no-op si no hay collector URL.
if (import.meta.env.VITE_FARO_COLLECTOR_URL) {
  initializeFaro({
    url: import.meta.env.VITE_FARO_COLLECTOR_URL,
    app: {
      name: 'nutriflow-frontend',
      version: '1.0.0',
      environment: import.meta.env.MODE,
    },
    instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
    // TanStack Router no tiene integración soportada por Faro; con este flag
    // igual capturamos navegación/URL sin depender del router.
    experimental: { trackNavigation: true },
  })
}

// 1. Inicializamos el listener de autenticación con Supabase
initAuthListener();

// 2. Creamos la instancia del cliente (El "Cerebro" de la caché)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Buena práctica: evita que se recarguen los datos al cambiar de pestaña en Chrome
      retry: 1, // Si falla la red, solo reintenta 1 vez antes de mostrar error
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
