import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePaciente } from '../../pacientes/hooks/usePacientes';

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');

    // 2. Estado Global de Zustand
    const { targets, distributions, activeMeals, activeGroups, customFoods, libreConsumoIds, customMeals, mealTimes, addCustomMeal, removeCustomMeal, setMealTime, incrementPortion, decrementPortion, setPortion, removeTargetGroup, setInitialPortions, toggleMeal, toggleGroup, resetDistributions } = usePortionsStore();

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
    const { data: armadorData } = useQuery({
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
    const { loadedPatientId, setLoadedPatientId } = usePortionsStore();
    useEffect(() => {
        if (armadorData && armadorData.targets && activePatient?.id && loadedPatientId !== activePatient.id) {
            setInitialPortions({
                targets: armadorData.targets,
                distributions: armadorData.distributions || {},
                activeMeals: armadorData.activeMeals || [],
                activeGroups: armadorData.activeGroups || [],
                libreConsumoIds: armadorData.libreConsumoIds || [],
                customMeals: armadorData.customMeals || [],
                mealTimes: armadorData.mealTimes || {}
            });
            setLoadedPatientId(activePatient.id);
        }
    }, [armadorData, activePatient?.id, loadedPatientId, setInitialPortions, setLoadedPatientId]);



    // 6. Mutación para guardar la pizarra actual (removida por no ser leída)

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

    const [isSaving, setIsSaving] = useState(false);

    // Guarda la pauta (distribución de porciones por comida + targets + libre
    // consumo) en el paciente activo. Persiste vía /pautas/guardar-distribucion,
    // que hace upsert de la última pauta — así sobrevive a recargas y se recarga
    // al volver a seleccionar al paciente. Devuelve {ok, message} para la UI.
    const guardarPauta = async (): Promise<{ ok: boolean; message: string }> => {
        if (!activePatient?.id) {
            return { ok: false, message: 'Selecciona un paciente activo antes de guardar la pauta.' };
        }
        const hayPorciones = Object.values(distributions).some(
            (meal) => Object.values(meal || {}).some((v) => v > 0),
        );
        if (!hayPorciones) {
            return { ok: false, message: 'Asigna porciones por comida antes de guardar la pauta.' };
        }

        setIsSaving(true);
        try {
            await apiClient.post('/pautas/guardar-distribucion', {
                paciente_id: activePatient.id,
                distributions,
                targets,
                activeMeals,
                activeGroups,
                libreConsumoIds,
                customMeals,
                mealTimes,
            });
            return { ok: true, message: 'Pauta guardada en la ficha del paciente.' };
        } catch (error) {
            console.error('Error guardando la pauta:', error);
            return { ok: false, message: 'No se pudo guardar la pauta. Intenta nuevamente.' };
        } finally {
            setIsSaving(false);
        }
    };

    return {
        state: { activeTab, patientContext, targets, distributions, activeMeals, activeGroups, customFoods, customMeals, mealTimes, libreConsumoIds, isSaving, hayPacienteActivo: !!activePatient?.id },
        actions: { setActiveTab, incrementPortion, decrementPortion, setPortion, guardarPauta, removeTargetGroup, toggleMeal, toggleGroup, resetDistributions, addCustomMeal, removeCustomMeal, setMealTime },
        computed: { getGroupTotal, getGroupBalance }
    };
};