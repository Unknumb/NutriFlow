import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';

export const useDashboardClinico = (pacienteId: string) => {
  return useQuery({
    queryKey: ['dashboard', pacienteId],
    queryFn: async () => {
      // Apuntamos al endpoint que acabamos de crear en NestJS
      const { data } = await apiClient.get(`/dashboard-clinico/${pacienteId}`);
      return data;
    },
    enabled: !!pacienteId, // Solo se ejecuta si hay un ID de paciente
  });
};