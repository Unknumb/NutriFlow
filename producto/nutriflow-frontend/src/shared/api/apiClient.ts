import axios, { AxiosError } from 'axios';
import { supabase } from '../utils/supabase';
import { notify } from '../store/useToastStore';

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

        // Errores inesperados (5xx) y de red: se surfacing al usuario con un
        // toast global, además del log. Los 4xx se manejan a nivel de cada
        // feature (validación de formularios, 409 de duplicado, etc.).
        if (status && status >= 500) {
            console.error('Error interno del servidor en NutriFlow');
            notify('error', 'Ocurrió un error en el servidor. Intenta nuevamente en unos momentos.');
        }

        if (!error.response) {
            console.error('Error de red o el servidor no responde');
            notify('error', 'No se pudo conectar con el servidor. Revisa tu conexión e intenta otra vez.');
        }

        return Promise.reject(error);
    }
);