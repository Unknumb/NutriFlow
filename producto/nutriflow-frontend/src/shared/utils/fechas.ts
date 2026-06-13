// nutriflow-frontend/src/shared/utils/fechas.ts
//
// Formateo de fechas seguro frente a zona horaria.
//
// Las fechas del backend llegan como ISO (p.ej. "1992-03-15T00:00:00.000Z").
// `new Date(iso).toLocaleDateString()` en una zona al oeste de UTC (Chile es
// UTC-3/-4) interpreta la medianoche UTC y la convierte a local, retrocediendo
// un día. Además, sin locale explícito usa el del sistema (US → "3/14/1992").
// Estos helpers usan los componentes UTC del ISO para evitar el desfase y
// fuerzan el locale es-CL (DD-MM-YYYY).

const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Extrae {año, mes, día} de la parte de fecha de un ISO, sin aplicar zona horaria. */
function partesUTC(iso: string): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  // Tomamos solo la porción de fecha (antes de la T) para no depender de la hora.
  const soloFecha = iso.slice(0, 10);
  const [y, m, d] = soloFecha.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

/** "15-03-1992". Devuelve '—' si la fecha es inválida o vacía. */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const p = partesUTC(iso);
  if (!p) return '—';
  const dd = String(p.d).padStart(2, '0');
  const mm = String(p.m).padStart(2, '0');
  return `${dd}-${mm}-${p.y}`;
}

/** "15 de marzo de 1992". Para documentos y encabezados. */
export function formatearFechaLarga(iso: string | null | undefined): string {
  if (!iso) return '—';
  const p = partesUTC(iso);
  if (!p) return '—';
  return `${p.d} de ${MESES_LARGOS[p.m - 1]} de ${p.y}`;
}
