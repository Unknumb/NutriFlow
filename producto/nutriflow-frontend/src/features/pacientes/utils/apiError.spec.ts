import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { obtenerMensajeErrorApi } from './apiError';

const FALLBACK = 'Error inesperado';

function crearAxiosError(message: unknown): AxiosError {
  const err = new AxiosError('mock');
  (err as any).response = { data: { message }, status: 400, statusText: 'Bad Request', headers: {}, config: {} };
  return err;
}

describe('obtenerMensajeErrorApi', () => {
  it('retorna el mensaje string de la respuesta del backend', () => {
    const err = crearAxiosError('El RUT ya existe');
    expect(obtenerMensajeErrorApi(err, FALLBACK)).toBe('El RUT ya existe');
  });

  it('une array de mensajes (class-validator) con ". "', () => {
    const err = crearAxiosError(['nombre es requerido', 'email inválido']);
    expect(obtenerMensajeErrorApi(err, FALLBACK)).toBe('nombre es requerido. email inválido');
  });

  it('retorna fallback cuando el mensaje es string vacío', () => {
    const err = crearAxiosError('');
    expect(obtenerMensajeErrorApi(err, FALLBACK)).toBe(FALLBACK);
  });

  it('retorna fallback cuando el mensaje es solo espacios', () => {
    const err = crearAxiosError('   ');
    expect(obtenerMensajeErrorApi(err, FALLBACK)).toBe(FALLBACK);
  });

  it('retorna fallback cuando no hay respuesta (network error)', () => {
    const err = new AxiosError('Network Error');
    expect(obtenerMensajeErrorApi(err, FALLBACK)).toBe(FALLBACK);
  });

  it('retorna fallback para errores que no son AxiosError', () => {
    expect(obtenerMensajeErrorApi(new Error('algo'), FALLBACK)).toBe(FALLBACK);
    expect(obtenerMensajeErrorApi('string error', FALLBACK)).toBe(FALLBACK);
    expect(obtenerMensajeErrorApi(null, FALLBACK)).toBe(FALLBACK);
  });

  it('retorna fallback cuando message es un tipo no esperado (número)', () => {
    const err = crearAxiosError(500);
    expect(obtenerMensajeErrorApi(err, FALLBACK)).toBe(FALLBACK);
  });
});
