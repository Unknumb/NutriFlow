import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initAuthListener } from '../shared/utils/supabase'

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
