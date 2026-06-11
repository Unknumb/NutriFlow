import axios, { AxiosError } from 'axios';
import { supabase } from '../utils/supabase';

// 1. Configuración con timeout para evitar peticiones "zombie"
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 🚨 Senior: Timeout de 10s para evitar que la UI se bloquee
});

export interface ApiError {
    message: string | string[];
    error: string;
    statusCode: number;
}

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
    async (error: AxiosError<ApiError>) => {
        const status = error.response?.status;
        const apiError = error.response?.data;

        if (status === 401) {
            console.error('Sesión expirada, redirigiendo a login...');
            await supabase.auth.signOut();
            window.location.href = '/login';
        }
        
        if (status === 400) {
            console.error('Error de validación:', apiError?.message);
        }

        if (status === 500) {
            console.error('Error interno del servidor en NutriFlow');
        }

        if (!error.response) {
            console.error('Error de red o el servidor no responde');
        }
        
        return Promise.reject(error);
    }
);