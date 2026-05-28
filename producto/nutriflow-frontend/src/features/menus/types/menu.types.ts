export interface GenerarMenuPayload {
  porciones_disponibles: Record<string, number>;
  alimentos_rechazados?: string[];
}

export interface GenerarMenuResponse {
  menus: Array<{
    tipo_menu: string;
    alimentos: Array<{
      alimento: string;
      porciones_usadas: number;
      porcion_casera_sugerida: string;
      grupo: string;
    }>;
  }>;
}
