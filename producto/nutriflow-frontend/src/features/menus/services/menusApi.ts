import { apiClient } from '../../../shared/api/apiClient';
import type { GenerarMenuPayload, GenerarMenuResponse } from '../types/menu.types';

export const menusApi = {
  generarMenu: async (payload: GenerarMenuPayload): Promise<GenerarMenuResponse> => {
    const { data } = await apiClient.post('/menus/generar', payload);
    return data;
  },
};
