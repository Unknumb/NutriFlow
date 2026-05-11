import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 🚨 NUEVO: Función para simular la autenticación durante el desarrollo
export const isAuthenticated = () => {
    // TODO: Más adelante, cuando construyamos la pantalla de Login, 
    // cambiaremos esto para que lea la sesión real de Supabase de forma asíncrona.
    
    // Por ahora, forzamos que devuelva TRUE para que el Router 
    // te deje pasar al Dashboard y puedas probar tu conexión con FastAPI.
    return true; 
};