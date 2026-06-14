/**
 * Lenguaje de color de macros del sistema de diseño (ver REDISENO.md).
 * Estos valores deben coincidir con los tokens --color-macro-* de globals.css
 * y usarse idénticos en chips, gráficos (recharts), leyendas y PDF.
 */
export const MACRO_COLORS = {
  proteinas: '#3E6B8C', // azul acero
  carbohidratos: '#C98B3D', // ámbar trigo
  grasas: '#7A5C8E', // ciruela
  kcal: '#1F3D33', // pino (energía)
} as const;

export type MacroKey = keyof typeof MACRO_COLORS;
