import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePaciente } from '../../pacientes/hooks/usePacientes';
import { useObjetivosActivos } from '../../planificaciones/hooks/useObjetivosActivos';

export interface PautaResumen {
    id: string;
    nombre: string | null;
    planificacion_id: string | null;
    fecha_creacion: string;
}

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');
    const queryClient = useQueryClient();

    // 2. Estado Global de Zustand
    const {
        targets, distributions, activeMeals, activeGroups, customFoods, libreConsumoIds, customMeals, mealTimes, sugerenciasComida,
        dirty, selectedPautaId, loadedPautaId, autoSelectedPlanifId,
        addCustomMeal, removeCustomMeal, setMealTime, incrementPortion, decrementPortion, setPortion, removeTargetGroup,
        setInitialPortions, toggleMeal, toggleGroup, resetDistributions, removeSugerenciaComida,
        seleccionarPauta, marcarPautaGuardada, setLoadedPautaId, setAutoSelectedPlanifId, switchPatient,
    } = usePortionsStore();

    // 3. Datos del paciente conectado con backend
    const { activePatient } = useClinicalStore();
    usePaciente(activePatient?.id || '');

    // El plan en construcción pertenece a un paciente: si cambió el paciente
    // activo, se descarta el estado anterior (switchPatient es idempotente).
    useEffect(() => {
        switchPatient(activePatient?.id || null);
    }, [activePatient?.id, switchPatient]);

    // Objetivos y planificación activa (fuente única; obligatoria para guardar).
    const { planificacionActiva, objetivos } = useObjetivosActivos();

    // Transformamos los datos del backend al formato que necesita la UI
    const patientContext = {
        name: activePatient?.nombre || "Sin seleccionar",
        age: activePatient?.edad || 0,
        weight: activePatient?.peso || 0,
        kcal: objetivos?.kcal || targets.kcal || 0
    };

    // 4. Lista de pautas del paciente (para el selector).
    const { data: pautasList } = useQuery<PautaResumen[]>({
        queryKey: ['pautas-lista', activePatient?.id],
        queryFn: async () => {
            if (!activePatient?.id) return [];
            const { data } = await apiClient.get(`/pautas/lista/${activePatient.id}`);
            return data;
        },
        enabled: !!activePatient?.id,
    });

    // Pautas que pertenecen a la planificación activa del paciente.
    const pautasDeActiva = (pautasList || []).filter(
        (p) => !planificacionActiva || p.planificacion_id === planificacionActiva.id,
    );

    // Auto-selección de pauta: cuando se conoce la lista de pautas de la
    // planificación activa se selecciona la más reciente, UNA sola vez por
    // planificación, y solo si no hay trabajo local sin guardar (dirty). Antes
    // esto corría en cada montaje y pisaba lo hecho en el Armador de Pautas.
    useEffect(() => {
        if (!activePatient?.id || !planificacionActiva || pautasList === undefined) return;
        if (autoSelectedPlanifId === planificacionActiva.id) return;
        setAutoSelectedPlanifId(planificacionActiva.id);
        if (dirty) return; // conserva los cambios del armador aún no guardados
        const defaultId = pautasDeActiva.length > 0 ? pautasDeActiva[0].id : null;
        seleccionarPauta(defaultId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePatient?.id, planificacionActiva?.id, pautasList, autoSelectedPlanifId, dirty]);

    // 5. Cargar el detalle de la pauta seleccionada en el store de Zustand.
    const { data: pautaDetalle } = useQuery({
        queryKey: ['pauta-detalle', selectedPautaId],
        queryFn: async () => {
            if (!selectedPautaId) return null;
            const { data } = await apiClient.get(`/pautas/${selectedPautaId}`);
            return data;
        },
        enabled: !!selectedPautaId,
    });

    useEffect(() => {
        if (!selectedPautaId) return;
        if (loadedPautaId === selectedPautaId) return; // ya cargada
        if (dirty) return; // NUNCA pisar cambios locales sin guardar
        const grid = pautaDetalle?.estructura_grid_json;
        if (pautaDetalle && grid && grid.targets) {
            setInitialPortions({
                targets: grid.targets,
                distributions: grid.distributions || {},
                activeMeals: grid.activeMeals || [],
                activeGroups: grid.activeGroups || [],
                libreConsumoIds: grid.libreConsumoIds || [],
                customMeals: grid.customMeals || [],
                mealTimes: grid.mealTimes || {},
                sugerenciasComida: grid.sugerenciasComida || {}
            });
            setLoadedPautaId(selectedPautaId);
        }
    }, [pautaDetalle, selectedPautaId, loadedPautaId, dirty, setInitialPortions, setLoadedPautaId]);

    // 6. Cálculos Derivados (Totales y Balances)
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
    const guardarPauta = async (nombre?: string): Promise<{ ok: boolean; message: string }> => {
        if (!activePatient?.id) {
            return { ok: false, message: 'Selecciona un paciente activo antes de guardar la pauta.' };
        }
        // P7: no se puede guardar una pauta sin una planificación de macros asignada.
        if (!planificacionActiva) {
            return { ok: false, message: 'Crea o asigna una planificación de macronutrientes antes de guardar la pauta.' };
        }
        const hayPorciones = Object.values(distributions).some(
            (meal) => Object.values(meal || {}).some((v) => v > 0),
        );
        if (!hayPorciones) {
            return { ok: false, message: 'Asigna porciones por comida antes de guardar la pauta.' };
        }

        setIsSaving(true);
        try {
            const { data } = await apiClient.post('/pautas/guardar-distribucion', {
                paciente_id: activePatient.id,
                planificacion_id: planificacionActiva.id,
                pauta_id: selectedPautaId || undefined,
                nombre: nombre?.trim() || undefined,
                distributions,
                targets,
                activeMeals,
                activeGroups,
                libreConsumoIds,
                customMeals,
                mealTimes,
                sugerenciasComida,
            });
            const nuevaId = data?.pautaId;
            if (nuevaId) {
                // Queda como seleccionada/cargada y el estado local pasa a limpio.
                marcarPautaGuardada(nuevaId);
            }
            queryClient.invalidateQueries({ queryKey: ['pautas-lista', activePatient.id] });
            queryClient.invalidateQueries({ queryKey: ['pauta-detalle', nuevaId || selectedPautaId] });
            // Las pautas se muestran anidadas en planificaciones (ficha del paciente).
            queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
            return { ok: true, message: 'Pauta guardada en la ficha del paciente.' };
        } catch (error) {
            console.error('Error guardando la pauta:', error);
            return { ok: false, message: 'No se pudo guardar la pauta. Intenta nuevamente.' };
        } finally {
            setIsSaving(false);
        }
    };

    // Empieza una pauta nueva (vacía) dentro de la planificación activa.
    const nuevaPauta = () => {
        seleccionarPauta(null);
        resetDistributions();
    };

    // Nombre sugerido para una pauta nueva: "Pauta N" según las de la planificación.
    const nombrePautaSugerido = `Pauta ${pautasDeActiva.length + 1}`;
    const pautaSeleccionada = pautasDeActiva.find((p) => p.id === selectedPautaId) || null;

    return {
        state: {
            activeTab, patientContext, targets, distributions, activeMeals, activeGroups, customFoods, customMeals, mealTimes, libreConsumoIds, sugerenciasComida, isSaving,
            dirty,
            hayPacienteActivo: !!activePatient?.id,
            hayPlanificacionActiva: !!planificacionActiva,
            pautas: pautasDeActiva,
            selectedPautaId,
            pautaSeleccionada,
            nombrePautaSugerido,
        },
        actions: { setActiveTab, incrementPortion, decrementPortion, setPortion, guardarPauta, removeTargetGroup, toggleMeal, toggleGroup, resetDistributions, addCustomMeal, removeCustomMeal, setMealTime, seleccionarPauta, nuevaPauta, removeSugerenciaComida },
        computed: { getGroupTotal, getGroupBalance }
    };
};
