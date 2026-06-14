import { apiClient } from '../../../shared/api/apiClient';

export interface PlanificacionData {
    paciente_id: string;
    nombre?: string;
    calorias_totales: number;
    distribucion_macros: Record<string, any>;
}

export interface Planificacion {
    id: string;
    paciente_id: string;
    nutricionista_id: string;
    nombre?: string | null;
    activa: boolean;
    fecha_creacion: string;
    calorias_totales: number;
    distribucion_macros: Record<string, any>;
    pautas?: any[]; // Array of Pauta
}

export const planificacionesApi = {
    createPlanificacion: async (data: PlanificacionData) => {
        const response = await apiClient.post('/planificaciones', data);
        return response.data;
    },

    getPlanificaciones: async (): Promise<Planificacion[]> => {
        const response = await apiClient.get('/planificaciones');
        return response.data;
    },

    deletePlanificacion: async (id: string) => {
        const response = await apiClient.delete(`/planificaciones/${id}`);
        return response.data;
    },

    setActivaPlanificacion: async (id: string): Promise<Planificacion> => {
        const response = await apiClient.patch(`/planificaciones/${id}/activa`);
        return response.data;
    }
};
