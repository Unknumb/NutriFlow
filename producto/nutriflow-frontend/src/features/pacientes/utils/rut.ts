// nutriflow-frontend/src/features/pacientes/utils/rut.ts
/**
 * Utilidades para RUT chileno (espejo de backend-core/src/pacientes/utils/rut.util.ts):
 * - Validación de dígito verificador con módulo 11.
 * - Formateo en vivo para inputs: "12.345.678-9".
 * - Normalización al formato canónico que guarda el backend: "12345678-9".
 */

/** Quita puntos, guiones y espacios; deja cuerpo + DV en mayúscula. */
export function limpiarRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
}

/** Calcula el dígito verificador del cuerpo numérico usando módulo 11. */
export function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/** Valida formato (con o sin puntos/guión) y dígito verificador. */
export function esRutValido(rut: unknown): boolean {
  if (typeof rut !== 'string') return false;
  const limpio = limpiarRut(rut);
  // Cuerpo de 7 u 8 dígitos + DV (dígito o K)
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return calcularDigitoVerificador(cuerpo) === dv;
}

/** Normaliza al formato "12345678-9" que persiste el backend. Asume RUT ya validado. */
export function normalizarRut(rut: string): string {
  const limpio = limpiarRut(rut);
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

/**
 * Formatea en vivo lo que escribe el usuario: "12345678K" -> "12.345.678-K".
 * Descarta caracteres no válidos y limita el cuerpo a 8 dígitos.
 * Pensado para usarse en onChange de un input controlado.
 */
export function formatearRutInput(value: string): string {
  // Solo dígitos y K/k; la K solo es válida como último carácter (DV)
  const limpio = value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
  if (limpio.length === 0) return '';
  if (limpio.length === 1) return limpio;
  const cuerpo = limpio.slice(0, -1).replace(/K/g, '');
  const dv = limpio.slice(-1);
  if (cuerpo.length === 0) return dv;
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoConPuntos}-${dv}`;
}
