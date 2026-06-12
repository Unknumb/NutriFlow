// nutriflow-frontend/src/features/generador/constants/restricciones.ts
/**
 * Vocabulario controlado de restricciones dietéticas.
 *
 * MANTENER SINCRONIZADO con:
 *   - backend-core/src/menus/restricciones.constants.ts (validación @IsIn)
 *   - backend-math/core/restricciones.py (lógica de filtrado)
 */

export const RESTRICCIONES_DIETETICAS = [
  'vegetariano',
  'vegano',
  'sin_gluten',
  'sin_lactosa',
  'sin_mariscos',
  'sin_frutos_secos',
  'sin_huevo',
  'sin_cerdo',
  'bajo_sodio',
  'sin_azucar',
] as const;

export type RestriccionDietetica = (typeof RESTRICCIONES_DIETETICAS)[number];

export const RESTRICCION_LABELS: Record<RestriccionDietetica, string> = {
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  sin_gluten: 'Sin gluten',
  sin_lactosa: 'Sin lactosa',
  sin_mariscos: 'Sin mariscos',
  sin_frutos_secos: 'Sin frutos secos',
  sin_huevo: 'Sin huevo',
  sin_cerdo: 'Sin cerdo',
  bajo_sodio: 'Bajo en sodio',
  sin_azucar: 'Sin azúcar',
};

// Rango de marcas diacríticas combinantes (U+0300–U+036F).
const DIACRITICOS = /[\u0300-\u036f]/g;

const normalizarTexto = (texto: string): string =>
  texto.toLowerCase().trim().normalize('NFD').replace(DIACRITICOS, '');

/**
 * Heurística conservadora: deriva restricciones canónicas desde los campos de
 * texto libre de la ficha del paciente (`alergias`, `preferencias_alimentarias`).
 * Solo precarga la selección — la nutricionista puede editarla por sesión.
 * MANTENER SINCRONIZADO con la copia de backend-core (misma tabla de keywords).
 */
const KEYWORDS_A_RESTRICCION: ReadonlyArray<[RegExp, RestriccionDietetica]> = [
  [/\bvegano|veganismo\b/, 'vegano'],
  [/vegetarian/, 'vegetariano'],
  [/gluten|celiac|celiaqu/, 'sin_gluten'],
  [/lactosa|lacteo/, 'sin_lactosa'],
  [/marisco|camaron|ostion|chorito|almeja|jaiba|mejillon|crustaceo/, 'sin_mariscos'],
  [/fruto.?s? seco|nuez|nueces|\bmani\b|almendra|avellana|pistacho|castana|anacardo|caju/, 'sin_frutos_secos'],
  [/huevo/, 'sin_huevo'],
  [/cerdo|chancho/, 'sin_cerdo'],
  [/sodio|hipertens/, 'bajo_sodio'],
  [/azucar|diabet/, 'sin_azucar'],
];

export const derivarRestriccionesDePaciente = (
  textosFicha: string[],
): RestriccionDietetica[] => {
  const detectadas = new Set<RestriccionDietetica>();
  for (const texto of textosFicha) {
    const normalizado = normalizarTexto(texto);
    if (!normalizado) continue;
    for (const [patron, restriccion] of KEYWORDS_A_RESTRICCION) {
      if (patron.test(normalizado)) detectadas.add(restriccion);
    }
  }
  return [...detectadas];
};
