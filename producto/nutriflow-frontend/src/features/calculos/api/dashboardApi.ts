import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';

export interface TmbData {
  resultados_individuales: Record<string, number>;
  promedio_calculado: number;
}

export interface PesosReferencia {
  imc_actual: number;
  clasificacion_imc: string;
  peso_ideal: number;
  peso_saludable_min: number;
  peso_saludable_max: number;
  peso_ajustado_25: number;
  peso_ajustado_50: number;
  aplica_ajuste: boolean;
}

export interface DashboardClinicoResponse {
  pacienteId: string;
  tmb: TmbData;
  macros: any;
  pesos: PesosReferencia | null;
  status: string;
}

export const useDashboardClinico = (patient: { id: string; peso: number; talla: number; edad: number; sexo: string } | null) => {
  return useQuery<DashboardClinicoResponse>({
    queryKey: ['dashboard', patient?.id, patient?.peso, patient?.talla, patient?.edad, patient?.sexo],
    queryFn: async () => {
      if (!patient) throw new Error("No patient");
      const queryParams = new URLSearchParams({
        peso: patient.peso.toString(),
        talla: patient.talla.toString(),
        edad: patient.edad.toString(),
        sexo: patient.sexo
      });
      const { data } = await apiClient.get(`/dashboard-clinico/${patient.id}?${queryParams.toString()}`);
      return data;
    },
    enabled: !!patient?.id, // Solo se ejecuta si hay un ID de paciente
  });
};