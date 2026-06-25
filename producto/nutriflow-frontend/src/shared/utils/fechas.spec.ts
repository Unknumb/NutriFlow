import { describe, it, expect } from 'vitest';
import { formatearFecha, formatearFechaLarga } from './fechas';

describe('formatearFecha', () => {
  it('formatea una fecha ISO estándar como DD-MM-YYYY', () => {
    expect(formatearFecha('1992-03-15T00:00:00.000Z')).toBe('15-03-1992');
  });

  it('no retrocede un día por diferencia de zona horaria UTC', () => {
    // Medianoche UTC en zona al oeste (Chile UTC-3/-4) no debe dar el día anterior
    expect(formatearFecha('2024-01-01T00:00:00.000Z')).toBe('01-01-2024');
  });

  it('rellena con ceros días y meses de un dígito', () => {
    expect(formatearFecha('2000-01-05T00:00:00.000Z')).toBe('05-01-2000');
  });

  it('acepta fecha ISO sin parte de hora', () => {
    expect(formatearFecha('2023-12-31')).toBe('31-12-2023');
  });

  it('devuelve "—" para null', () => {
    expect(formatearFecha(null)).toBe('—');
  });

  it('devuelve "—" para undefined', () => {
    expect(formatearFecha(undefined)).toBe('—');
  });

  it('devuelve "—" para string vacío', () => {
    expect(formatearFecha('')).toBe('—');
  });
});

describe('formatearFechaLarga', () => {
  it('formatea como "D de mes de YYYY" en español', () => {
    expect(formatearFechaLarga('1992-03-15T00:00:00.000Z')).toBe('15 de marzo de 1992');
  });

  it('usa el nombre del mes correcto para cada índice', () => {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    meses.forEach((mes, i) => {
      const mm = String(i + 1).padStart(2, '0');
      expect(formatearFechaLarga(`2000-${mm}-10`)).toBe(`10 de ${mes} de 2000`);
    });
  });

  it('no retrocede un día por zona horaria', () => {
    expect(formatearFechaLarga('2024-01-01T00:00:00.000Z')).toBe('1 de enero de 2024');
  });

  it('devuelve "—" para null', () => {
    expect(formatearFechaLarga(null)).toBe('—');
  });

  it('devuelve "—" para undefined', () => {
    expect(formatearFechaLarga(undefined)).toBe('—');
  });

  it('devuelve "—" para string vacío', () => {
    expect(formatearFechaLarga('')).toBe('—');
  });
});
