import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePaciente } from '../../pacientes/hooks/usePacientes';
import { useCreatePauta } from '../../pautas/hooks/usePautas';

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');

    // 2. Estado Global de Zustand
    const { targets, distributions, activeMeals, activeGroups, customFoods, incrementPortion, decrementPortion, setPortion, removeTargetGroup, setInitialPortions, toggleMeal, toggleGroup, resetDistributions } = usePortionsStore();

    // 3. Datos del paciente conectado con backend
    const { activePatient, activePlanificacionId } = useClinicalStore();
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
                activeGroups: armadorData.activeGroups || []
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

    const createPauta = useCreatePauta();
    const handleSavePauta = () => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero para poder guardar la pauta.');
            return;
        }

        if (!activePlanificacionId) {
            alert('Primero debes crear y guardar una Planificación (Metas de Macronutrientes).');
            return;
        }

        const descripcion = window.prompt("Ingresa un nombre para esta Pauta (ej: Día de entrenamiento, Día de descanso):", "Pauta Regular");
        if (descripcion === null) {
            // Usuario canceló el prompt
            return;
        }

        createPauta.mutate({
            paciente_id: activePatient.id,
            planificacion_id: activePlanificacionId,
            descripcion_general: descripcion,
            tiempos_comida: distributions,
        }, {
            onSuccess: async () => {
                try {
                    await apiClient.post('/pautas/guardar-distribucion', {
                        paciente_id: activePatient.id,
                        distributions,
                        targets,
                        activeMeals,
                        activeGroups
                    });
                    alert("¡Pauta guardada con éxito en la base de datos!");
                } catch (error) {
                    console.error('Error guardando distribución:', error);
                    alert("La pauta se creó pero falló al guardar la distribución.");
                }
            },
            onError: (err) => {
                alert("Hubo un error al guardar la pauta");
                console.error(err);
            }
        });
    };

    return {
        state: { activeTab, patientContext, targets, distributions, activeMeals, activeGroups, customFoods, isSaving: createPauta.isPending },
        actions: { setActiveTab, incrementPortion, decrementPortion, setPortion, handleSavePauta, removeTargetGroup, toggleMeal, toggleGroup, resetDistributions },
        computed: { getGroupTotal, getGroupBalance }
    };
};