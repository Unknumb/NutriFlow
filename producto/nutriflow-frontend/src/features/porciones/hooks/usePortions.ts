import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePaciente } from '../../pacientes/hooks/usePacientes';
import { useCreatePauta } from '../../pautas/hooks/usePautas';

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');

    // 2. Estado Global de Zustand
    const { targets, distributions, activeMeals, activeGroups, customFoods, incrementPortion, decrementPortion, removeTargetGroup, setInitialPortions, toggleMeal, toggleGroup } = usePortionsStore();

    // 3. Datos del paciente conectado con backend
    const { activePatient } = useClinicalStore();
    const { data: pacienteData } = usePaciente(activePatient?.id || '');

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
        if (armadorData && armadorData.targets) {
            setInitialPortions({
                targets: armadorData.targets,
                distributions: armadorData.distributions || {},
                activeMeals: armadorData.activeMeals || [],
                activeGroups: armadorData.activeGroups || []
            });
        }
    }, [armadorData, setInitialPortions]);

    const queryClient = useQueryClient();

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
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portions-armador', activePatient?.id] });
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

    const createPauta = useCreatePauta();
    const handleSavePauta = () => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero para poder guardar la pauta.');
            return;
        }

        const savedChoPct = parseFloat(localStorage.getItem('nutriflow_macros_choPct') || '45');
        const savedFatPct = parseFloat(localStorage.getItem('nutriflow_macros_fatPct') || '27');
        const savedProtPct = 100 - savedChoPct - savedFatPct; 

        createPauta.mutate({
            paciente_id: activePatient.id,
            calorias_totales: targets.kcal || 0,
            porcentajes_macros: {
                proteina: savedProtPct,
                grasa: savedFatPct,
                carbohidratos: savedChoPct
            },
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
        actions: { setActiveTab, incrementPortion, decrementPortion, handleSavePauta, removeTargetGroup, toggleMeal, toggleGroup },
        computed: { getGroupTotal, getGroupBalance }
    };
};