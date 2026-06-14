// backend-core/src/menus/restricciones.constants.ts
/**
 * Vocabulario controlado de restricciones dietéticas.
 *
 * MANTENER SINCRONIZADO con:
 *   - backend-math/core/restricciones.py  (fuente de la lógica de filtrado)
 *   - nutriflow-frontend/src/features/generador/constants/restricciones.ts
 *
 * CONVENCIÓN SEMÁNTICA de `alimentos.restricciones` (text[]):
 *   Cada tag describe lo que el alimento CONTIENE o ES (ej. `contiene_gluten`
 *   = "este alimento contiene gluten"). Conviven con atributos positivos
 *   heredados (`alto_en_proteina`, `alto_en_fibra`) que no filtran nada.
 *   El paciente declara restricciones en positivo (`sin_gluten`, `vegano`...)
 *   y backend-math excluye preparaciones con ingredientes incompatibles.
 *   Alimentos SIN tags no se excluyen (sin datos ≠ seguro; ver política en
 *   backend-math/core/restricciones.py).
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

/** Tags asignables a `alimentos.restricciones` (usados por prisma/tag_restricciones.ts). */
export const TAGS_RESTRICCION_ALIMENTO = [
  'contiene_gluten',
  'contiene_lactosa',
  'contiene_mariscos',
  'contiene_frutos_secos',
  'contiene_huevo',
  'contiene_cerdo',
  'no_vegetariano',
  'no_vegano',
  'alto_en_sodio',
  'alto_en_azucar',
] as const;

export type TagRestriccionAlimento = (typeof TAGS_RESTRICCION_ALIMENTO)[number];

// Rango de marcas diacríticas combinantes (U+0300–U+036F), en escapes
// unicode para evitar caracteres invisibles en el fuente.
const DIACRITICOS = /[\u0300-\u036f]/g;

/** Minúsculas y sin acentos, para comparar texto libre de la ficha. */
export const normalizarTexto = (texto: string): string =>
  texto.toLowerCase().trim().normalize('NFD').replace(DIACRITICOS, '');

/**
 * Heurística conservadora: deriva restricciones canónicas desde los campos de
 * texto libre de la ficha del paciente (`alergias`, `preferencias_alimentarias`).
 * Solo sugiere — la nutricionista puede editar la selección en el generador.
 * MANTENER SINCRONIZADO con la copia del frontend (misma tabla de keywords).
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
