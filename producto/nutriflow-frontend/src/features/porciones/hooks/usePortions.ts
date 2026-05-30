import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePaciente } from '../../pacientes/hooks/usePacientes';

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');

    // 2. Estado Global de Zustand
    const { targets, distributions, activeMeals, activeGroups, incrementPortion, decrementPortion, setInitialPortions, toggleMeal, toggleGroup, resetDistributions } = usePortionsStore();

    // 3. Datos del paciente conectado con backend
    const { activePatient } = useClinicalStore();
    usePaciente(activePatient?.id || '');

    // Transformamos los datos del backend al formato que necesita la UI
    const patientContext = { 
        name: activePatient?.nombre || "Sin seleccionar", 
        age: activePatient?.edad || 0, 
        weight: activePatient?.peso || 0, 
        kcal: targets.kcal || 0 
    };

    // 4. Consulta a la API para traer las porciones calculadas (Armador de Pautas)
    const { data: armadorData, isLoading: isLoadingArmador } = useQuery({
        queryKey: ['portions-armador', activePatient?.id],
        queryFn: async () => {
            if (!activePatient?.id) return null;
            // Endpoint sugerido para obtener cálculos de porciones desde NestJS/FastAPI
            const { data } = await apiClient.get(`/pautas/armador/${activePatient.id}`);
            return data;
        },
        enabled: !!activePatient?.id,
    });

    // 5. Sincronizar la data que llega del backend con el store de Zustand
    useEffect(() => {
        if (armadorData) {
            setInitialPortions({
                targets: armadorData.targets,
                distributions: armadorData.distributions,
                activeMeals: armadorData.activeMeals,
                activeGroups: armadorData.activeGroups
            });
        }
    }, [armadorData, setInitialPortions]);

    // 6. Mutación para guardar la pizarra actual
    const savePortionsMutation = useMutation({
        mutationFn: async () => {
            if (!activePatient?.id) throw new Error('No hay paciente activo');
            const payload = {
                paciente_id: activePatient.id,
                distributions,
                targets,
                activeMeals,
                activeGroups
            };
            // POST/PUT a NestJS para guardar el JSON en base de datos
            const { data } = await apiClient.post('/pautas/guardar-distribucion', payload);
            return data;
        }
    });

    // 7. Cálculos Derivados (Totales y Balances)
    const getGroupTotal = (groupId: string) => {
        return Object.values(distributions).reduce((acc, meal) => acc + (meal[groupId] || 0), 0);
    };

    const getGroupBalance = (groupId: string) => {
        const total = getGroupTotal(groupId);
        const target = targets[groupId];
        if (total === target) return 'exact';
        if (total > target) return 'over';
        return 'under';
    };

    return {
        state: { activeTab, patientContext, targets, distributions, activeMeals, activeGroups, isLoadingArmador, isSaving: savePortionsMutation.isPending },
        actions: { 
            setActiveTab, 
            incrementPortion, 
            decrementPortion, 
            toggleMeal,
            toggleGroup,
            resetDistributions,
            savePortions: () => savePortionsMutation.mutate()
        },
        computed: { getGroupTotal, getGroupBalance }
    };
};