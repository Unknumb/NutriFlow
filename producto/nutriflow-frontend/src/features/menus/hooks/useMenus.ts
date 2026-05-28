import { useMutation } from '@tanstack/react-query';
import { menusApi } from '../services/menusApi';
import type { GenerarMenuPayload } from '../types/menu.types';

export const useGenerarMenu = () => {
  return useMutation({
    mutationFn: (payload: GenerarMenuPayload) => menusApi.generarMenu(payload),
  });
};
