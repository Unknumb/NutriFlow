import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { planificacionesApi, PlanificacionData, UpdatePlanificacionData } from '../api/planificacionesApi';

export const usePlanificaciones = () => {
    return useQuery({
        queryKey: ['planificaciones'],
        queryFn: planificacionesApi.getPlanificaciones,
    });
};

export const useCreatePlanificacion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PlanificacionData) => planificacionesApi.createPlanificacion(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
        },
    });
};

export const useUpdatePlanificacion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanificacionData }) =>
            planificacionesApi.updatePlanificacion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
        },
    });
};

export const useDeletePlanificacion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => planificacionesApi.deletePlanificacion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
        },
    });
};

export const useSetActivaPlanificacion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => planificacionesApi.setActivaPlanificacion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
        },
    });
};
