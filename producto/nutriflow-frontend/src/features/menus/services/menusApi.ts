import { apiClient } from '../../../shared/api/apiClient';
import type { GenerarMenuPayload, GenerarMenuResponse } from '../types/menu.types';

export const menusApi = {
  generarMenu: async (payload: GenerarMenuPayload): Promise<GenerarMenuResponse> => {
    // La generación pasa por backend-math (combinatoria) y puede tardar más que
    // el timeout global de 10s; se amplía a 30s solo para esta ruta para no
    // abortar generaciones legítimas.
    const { data } = await apiClient.post('/menus/generar', payload, { timeout: 30000 });
    return data;
  },
};
