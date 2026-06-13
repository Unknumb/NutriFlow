// nutriflow-frontend/src/features/porciones/gruposMath.ts
//
// Mapeo entre los ids cortos de grupo de intercambio usados en el frontend
// (constants.ts / foodGroups.ts: 'cer', 'veg', ...) y las claves que espera
// backend-math en `porciones_disponibles` (core/valores_porciones.py).
//
// Sin este mapeo, enviar las porciones con los ids cortos hace que backend-math
// las ignore (no matchea ninguna clave) y el generador no filtra por porciones.

export const GRUPO_A_MATH: Record<string, string> = {
  cer: 'cereales_papas_legumbres_frescas',
  veg: 'verduras_general',
  vlb: 'verduras_libre_consumo',
  fru: 'frutas',
  cag: 'carnes_altas_grasa',
  cbg: 'carnes_bajas_grasa',
  leg: 'leguminosas_secas',
  lag: 'lacteos_altos_grasa',
  lmg: 'lacteos_medios_grasa',
  lbg: 'lacteos_bajos_grasa',
  ace: 'aceites_y_grasas',
  arg: 'alimentos_ricos_en_lipidos',
  azu: 'azucares',
};

/**
 * Traduce un objeto de porciones con ids cortos ({ cer: 2, veg: 1 }) a las
 * claves que entiende backend-math ({ cereales_papas_legumbres_frescas: 2, ... }).
 * Omite grupos sin mapeo y porciones <= 0.
 */
export function traducirPorcionesParaMath(
  porciones: Record<string, number>,
): Record<string, number> {
  const salida: Record<string, number> = {};
  for (const [grupo, cantidad] of Object.entries(porciones)) {
    const clave = GRUPO_A_MATH[grupo];
    if (clave && cantidad > 0) {
      salida[clave] = (salida[clave] ?? 0) + cantidad;
    }
  }
  return salida;
}
