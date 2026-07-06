// backend-core/src/pacientes/utils/rut.util.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Utilidades para RUT chileno: validación con dígito verificador (módulo 11)
 * y normalización al formato canónico "12345678-9" (sin puntos, con guión, K mayúscula).
 */

/** Quita puntos, guiones y espacios; deja el cuerpo + DV en mayúscula. */
export function limpiarRut(rut: string): string {
  return rut
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/\s/g, '')
    .toUpperCase();
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

/** Normaliza al formato "12345678-9". Asume que el RUT ya fue validado. */
export function normalizarRut(rut: string): string {
  const limpio = limpiarRut(rut);
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

/**
 * Decorador class-validator: valida que el valor sea un RUT chileno válido
 * (acepta formato con o sin puntos/guión; el DV se verifica con módulo 11).
 */
export function IsRutChileno(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRutChileno',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return esRutValido(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return 'El RUT ingresado no es válido (verifica el dígito verificador)';
        },
      },
    });
  };
}
