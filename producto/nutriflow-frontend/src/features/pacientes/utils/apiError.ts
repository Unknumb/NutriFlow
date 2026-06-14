// nutriflow-frontend/src/features/pacientes/utils/apiError.ts
import { isAxiosError } from 'axios';

/**
 * Extrae el mensaje de error legible de una respuesta del backend (NestJS):
 * `message` puede ser string o string[] (errores de class-validator).
 */
export function obtenerMensajeErrorApi(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string' && message.trim() !== '') return message;
  }
  return fallback;
}
