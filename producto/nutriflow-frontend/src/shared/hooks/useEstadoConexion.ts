import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Estados posibles de la conexión con el sistema, pensados para mostrarse
 * en lenguaje simple a una persona no técnica:
 * - 'verificando'    → estamos comprobando la conexión
 * - 'conectado'      → todo funciona
 * - 'sin-base-datos' → el sistema responde pero los datos no cargan
 * - 'sin-conexion'   → no se pudo contactar al sistema
 */
export type EstadoConexion = 'verificando' | 'conectado' | 'sin-base-datos' | 'sin-conexion';

// Se quitan las barras finales para evitar URLs con doble barra ("//health")
// cuando VITE_API_URL viene configurada con "/" al final (ej. en Vercel/Render).
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Cada cuánto se vuelve a comprobar la conexión de forma automática (30 s).
const INTERVALO_MS = 30_000;
// Si el servidor no contesta en 8 s lo damos por "sin conexión".
const TIMEOUT_MS = 8_000;

interface UseEstadoConexionReturn {
  estado: EstadoConexion;
  /** Vuelve a comprobar la conexión manualmente (botón "Reintentar"). */
  reintentar: () => void;
  /** Momento de la última comprobación, para mostrar "hace un momento" si se quiere. */
  ultimaRevision: Date | null;
}

/**
 * Comprueba periódicamente que el frontend puede hablar con el backend
 * (endpoint público GET /health) y que la base de datos responde.
 *
 * Usa `fetch` directo a propósito (no el apiClient con interceptores de auth):
 * el chequeo es público y no debe disparar el redirect a /login ni los logs
 * de error globales cuando el servidor está caído.
 */
export function useEstadoConexion(): UseEstadoConexionReturn {
  const [estado, setEstado] = useState<EstadoConexion>('verificando');
  const [ultimaRevision, setUltimaRevision] = useState<Date | null>(null);
  // Evita actualizar el estado si el componente ya se desmontó.
  const montadoRef = useRef(true);

  const comprobar = useCallback(async () => {
    if (montadoRef.current) setEstado('verificando');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        if (montadoRef.current) setEstado('sin-conexion');
        return;
      }

      const data: { servidor?: boolean; baseDatos?: boolean } = await res.json();
      if (!montadoRef.current) return;

      setEstado(data.baseDatos ? 'conectado' : 'sin-base-datos');
    } catch {
      // Timeout abortado, servidor caído o error de red.
      if (montadoRef.current) setEstado('sin-conexion');
    } finally {
      clearTimeout(timeout);
      if (montadoRef.current) setUltimaRevision(new Date());
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;
    void comprobar();

    const intervalo = setInterval(() => void comprobar(), INTERVALO_MS);

    // Recomprueba al volver a la pestaña (la red pudo haberse recuperado).
    const onVisible = () => {
      if (document.visibilityState === 'visible') void comprobar();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      montadoRef.current = false;
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [comprobar]);

  return { estado, reintentar: comprobar, ultimaRevision };
}
