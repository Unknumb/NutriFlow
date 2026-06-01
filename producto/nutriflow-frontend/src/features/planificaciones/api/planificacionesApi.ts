import { apiClient } from '../../../shared/api/apiClient';

export interface PlanificacionData {
    paciente_id: string;
    calorias_totales: number;
    porcentajes_macros: {
        proteina: number;
        grasa: number;
        carbohidratos: number;
    };
}

export const planificacionesApi = {
    createPlanificacion: async (data: PlanificacionData) => {
        const response = await apiClient.post('/planificaciones', data);
        return response.data;
    },

    getPlanificaciones: async () => {
        const response = await apiClient.get('/planificaciones');
        return response.data;
    },

    deletePlanificacion: async (id: string) => {
        const response = await apiClient.delete(`/planificaciones/${id}`);
        return response.data;
    }
};
