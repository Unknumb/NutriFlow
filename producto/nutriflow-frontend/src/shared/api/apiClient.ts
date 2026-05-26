import axios, { AxiosError } from 'axios';
import { supabase } from '../utils/supabase';

// 1. Configuración con timeout para evitar peticiones "zombie"
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 🚨 Senior: Timeout de 10s para evitar que la UI se bloquee
});

// 2. Request Interceptor (Auth)
apiClient.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // 🚨 Senior fix: Extraemos el status de forma segura usando el signo de interrogación
        const status = error.response?.status;

        // Ahora TypeScript sabe que 'status' es un número | undefined
        if (status === 401) {
            console.error('Sesión expirada, redirigiendo a login...');
            await supabase.auth.signOut();
            window.location.href = '/login';
        }
        
        if (status === 500) {
            console.error('Error interno del servidor en NutriFlow');
        }

        // Caso especial: El servidor ni siquiera respondió (ej: timeout o internet desconectado)
        if (!error.response) {
            console.error('Error de red o el servidor no responde');
        }
        
        return Promise.reject(error);
    }
);