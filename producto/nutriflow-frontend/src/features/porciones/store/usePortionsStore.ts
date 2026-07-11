import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FoodGroupDef } from '../../diet-plan/constants/foodGroups';

export interface CustomFoodDef extends FoodGroupDef {
    emoji: string;
    label: string;
    headerBg: string;
    targetBg: string;
    cellBg: string;
    textBtn: string;
}

/** Sugerencia del generador anclada a un tiempo de comida de la pauta. */
export interface SugerenciaComida {
    /** id de la preparación sugerida. */
    id: string;
    nombre: string;
    /** Resumen legible de ingredientes ("Arroz (100g), Pollo (120g)"). */
    ingredientes: string;
}

export interface PortionsState {
    targets: Record<string, number>;
    distributions: Record<string, Record<string, number>>;
    activeMeals: string[];
    activeGroups: string[];
    customFoods: CustomFoodDef[];
    /** Tiempos de comida personalizados (colaciones extra, etc.). */
    customMeals: { id: string; name: string; time: string }[];
    /** Override del horario por comida (default o personalizada). */
    mealTimes: Record<string, string>;
    addCustomMeal: (name: string, time: string) => void;
    removeCustomMeal: (id: string) => void;
    setMealTime: (mealId: string, time: string) => void;
    /** Grupos marcados como libre consumo (ad libitum); no cuentan en los totales. */
    libreConsumoIds: string[];
    toggleLibreConsumo: (groupId: string) => void;
    /** Sugerencias del generador por tiempo de comida; se guardan con la pauta. */
    sugerenciasComida: Record<string, SugerenciaComida[]>;
    addSugerenciaComida: (mealId: string, sugerencia: SugerenciaComida) => void;
    removeSugerenciaComida: (mealId: string, sugerenciaId: string) => void;
    incrementPortion: (mealId: string, groupId: string) => void;
    decrementPortion: (mealId: string, groupId: string) => void;
    setPortion: (mealId: string, groupId: string, value: number) => void;
    incrementTarget: (groupId: string) => void;
    decrementTarget: (groupId: string) => void;
    resetPlan: () => void;
    resetDistributions: () => void;
    setTargets: (targets: Record<string, number>) => void;
    setInitialPortions: (data: { targets: Record<string, number>, distributions: Record<string, Record<string, number>>, activeMeals: string[], activeGroups: string[], libreConsumoIds?: string[], customMeals?: { id: string; name: string; time: string }[], mealTimes?: Record<string, string>, sugerenciasComida?: Record<string, SugerenciaComida[]> }) => void;
    addCustomFood: (food: CustomFoodDef) => void;
    updateCustomFood: (id: string, data: Partial<CustomFoodDef>) => void;
    removeCustomFood: (id: string) => void;
    toggleMeal: (mealId: string) => void;
    toggleGroup: (groupId: string) => void;
    removeTargetGroup: (groupId: string) => void;

    /** true cuando hay cambios locales (armador o porciones) que aún no se han
     *  guardado en una pauta. Mientras esté activo, NO se debe pisar el estado
     *  cargando una pauta guardada (causa raíz del bug "azúcar vuelve a 0"). */
    dirty: boolean;
    /** Pauta seleccionada en Distribución de Porciones (null = pauta nueva). */
    selectedPautaId: string | null;
    /** Última pauta cuyo detalle ya se cargó al store; evita recargas dobles. */
    loadedPautaId: string | null;
    setLoadedPautaId: (id: string | null) => void;
    /** Planificación para la que ya se hizo la auto-selección de pauta. */
    autoSelectedPlanifId: string | null;
    setAutoSelectedPlanifId: (id: string | null) => void;
    /** Selección explícita de pauta: descarta cambios locales y fuerza recarga. */
    seleccionarPauta: (id: string | null) => void;
    /** Tras guardar: deja la pauta como seleccionada/cargada y limpia dirty. */
    marcarPautaGuardada: (id: string) => void;
    loadedPatientId: string | null;
    setLoadedPatientId: (id: string | null) => void;
    /** Descarta el plan en construcción si cambia el paciente activo (barrera
     *  anti-mezcla entre pacientes). Idempotente para el mismo paciente. */
    switchPatient: (patientId: string | null) => void;
}

/** Estado clínico reseteable al cambiar de paciente. */
const PLAN_INICIAL = {
    targets: {} as Record<string, number>,
    distributions: {} as Record<string, Record<string, number>>,
    activeMeals: ['desayuno', 'colacion_am', 'almuerzo', 'colacion_pm', 'once', 'cena'],
    activeGroups: ['cer', 'veg', 'fru', 'cbg', 'lmg', 'ace'],
    customFoods: [] as CustomFoodDef[],
    customMeals: [] as { id: string; name: string; time: string }[],
    mealTimes: {} as Record<string, string>,
    libreConsumoIds: [] as string[],
    sugerenciasComida: {} as Record<string, SugerenciaComida[]>,
    dirty: false,
    selectedPautaId: null as string | null,
    loadedPautaId: null as string | null,
    autoSelectedPlanifId: null as string | null,
};

export const usePortionsStore = create<PortionsState>()(
    persist(
        (set) => ({
    // Las metas diarias calculadas en el armador de pautas + distribución por
    // comida. Se persisten en localStorage para que un F5 no pierda el trabajo.
    ...PLAN_INICIAL,
    addCustomMeal: (name, time) => set((state) => {
        const id = 'meal-' + Date.now();
        return {
            customMeals: [...state.customMeals, { id, name: name.trim(), time: time.trim() }],
            activeMeals: [...state.activeMeals, id],
            dirty: true,
        };
    }),
    removeCustomMeal: (id) => set((state) => {
        const newDistributions = { ...state.distributions };
        delete newDistributions[id];
        const newMealTimes = { ...state.mealTimes };
        delete newMealTimes[id];
        return {
            customMeals: state.customMeals.filter((m) => m.id !== id),
            activeMeals: state.activeMeals.filter((m) => m !== id),
            distributions: newDistributions,
            mealTimes: newMealTimes,
            dirty: true,
        };
    }),
    setMealTime: (mealId, time) => set((state) => ({
        mealTimes: { ...state.mealTimes, [mealId]: time },
        dirty: true,
    })),
    // Por defecto ningún grupo es libre consumo; la nutricionista lo activa por grupo.
    toggleLibreConsumo: (groupId) => set((state) => ({
        libreConsumoIds: state.libreConsumoIds.includes(groupId)
            ? state.libreConsumoIds.filter((id) => id !== groupId)
            : [...state.libreConsumoIds, groupId],
        dirty: true,
    })),
    loadedPatientId: null,
    setLoadedPatientId: (id) => set({ loadedPatientId: id }),
    switchPatient: (patientId) =>
        set((state) =>
            state.loadedPatientId === patientId
                ? state
                : { ...PLAN_INICIAL, loadedPatientId: patientId }
        ),

    setLoadedPautaId: (id) => set({ loadedPautaId: id }),
    setAutoSelectedPlanifId: (id) => set({ autoSelectedPlanifId: id }),
    seleccionarPauta: (id) => set({
        selectedPautaId: id,
        loadedPautaId: null,
        dirty: false,
    }),
    marcarPautaGuardada: (id) => set({
        selectedPautaId: id,
        loadedPautaId: id,
        dirty: false,
    }),

    // Sugerencias del generador por comida (persisten en estructura_grid_json).
    addSugerenciaComida: (mealId, sugerencia) => set((state) => {
        const actuales = state.sugerenciasComida[mealId] || [];
        if (actuales.some((s) => s.id === sugerencia.id)) return {};
        return {
            sugerenciasComida: {
                ...state.sugerenciasComida,
                [mealId]: [...actuales, sugerencia],
            },
            dirty: true,
        };
    }),
    removeSugerenciaComida: (mealId, sugerenciaId) => set((state) => ({
        sugerenciasComida: {
            ...state.sugerenciasComida,
            [mealId]: (state.sugerenciasComida[mealId] || []).filter((s) => s.id !== sugerenciaId),
        },
        dirty: true,
    })),

    setInitialPortions: (data) => set((state) => {
        // Las sugerencias agregadas desde el Generador y aún no guardadas deben
        // sobrevivir a la recarga de la pauta: unión por comida (las guardadas
        // en la pauta primero; las locales no duplicadas después).
        const guardadas = data.sugerenciasComida || {};
        const sugerenciasComida: Record<string, SugerenciaComida[]> = { ...guardadas };
        for (const [mealId, locales] of Object.entries(state.sugerenciasComida)) {
            const previas = sugerenciasComida[mealId] || [];
            const nuevas = locales.filter((s) => !previas.some((p) => p.id === s.id));
            if (nuevas.length > 0) sugerenciasComida[mealId] = [...previas, ...nuevas];
        }
        return {
            targets: data.targets,
            distributions: data.distributions,
            activeMeals: data.activeMeals || [],
            activeGroups: data.activeGroups || [],
            // Restauramos libre consumo guardado (si la pauta no trae, queda vacío).
            libreConsumoIds: data.libreConsumoIds || [],
            customMeals: data.customMeals || [],
            mealTimes: data.mealTimes || {},
            sugerenciasComida,
            // Lo cargado refleja lo guardado en la pauta: estado limpio.
            dirty: false,
        };
    }),

    toggleMeal: (mealId) => set((state) => ({
        activeMeals: state.activeMeals.includes(mealId)
            ? state.activeMeals.filter(id => id !== mealId)
            : [...state.activeMeals, mealId],
        dirty: true,
    })),

    toggleGroup: (groupId) => set((state) => ({
        activeGroups: state.activeGroups.includes(groupId)
            ? state.activeGroups.filter(id => id !== groupId)
            : [...state.activeGroups, groupId],
        dirty: true,
    })),

    removeTargetGroup: (groupId) => set((state) => {
        const newTargets = { ...state.targets };
        delete newTargets[groupId];
        const newDistributions = { ...state.distributions };
        Object.keys(newDistributions).forEach(mealId => {
            if (newDistributions[mealId]) {
                delete newDistributions[mealId][groupId];
            }
        });
        return {
            targets: newTargets,
            distributions: newDistributions,
            dirty: true,
        };
    }),

    incrementPortion: (mealId, groupId) => set((state) => ({
        distributions: {
            ...state.distributions,
            [mealId]: {
                ...(state.distributions[mealId] || {}),
                [groupId]: (state.distributions[mealId]?.[groupId] || 0) + 0.5
            }
        },
        dirty: true,
    })),

    decrementPortion: (mealId, groupId) => set((state) => {
        const current = state.distributions[mealId]?.[groupId] || 0;
        if (current <= 0) return state; // Evita valores negativos

        return {
            distributions: {
                ...state.distributions,
                [mealId]: {
                    ...state.distributions[mealId],
                    [groupId]: Math.max(0, current - 0.5)
                }
            },
            dirty: true,
        };
    }),

    setPortion: (mealId, groupId, value) => set((state) => ({
        distributions: {
            ...state.distributions,
            [mealId]: {
                ...(state.distributions[mealId] || {}),
                [groupId]: Math.max(0, value)
            }
        },
        dirty: true,
    })),

    incrementTarget: (groupId) => set((state) => ({
        targets: {
            ...state.targets,
            [groupId]: (state.targets[groupId] || 0) + 0.5
        },
        dirty: true,
    })),

    decrementTarget: (groupId) => set((state) => {
        const current = state.targets[groupId] || 0;
        if (current <= 0) return state;
        return {
            targets: {
                ...state.targets,
                [groupId]: current - 0.5
            },
            dirty: true,
        };
    }),

    resetPlan: () => set({ targets: {}, dirty: true }),
    resetDistributions: () => set({ distributions: {}, sugerenciasComida: {}, dirty: true }),
    setTargets: (newTargets) => set({ targets: newTargets, dirty: true }),
    addCustomFood: (food) => set((state) => ({ customFoods: [...state.customFoods, food], dirty: true })),
    updateCustomFood: (id, data) => set((state) => ({
        customFoods: state.customFoods.map(f => f.id === id ? { ...f, ...data } : f),
        dirty: true,
    })),
    removeCustomFood: (id) => set((state) => {
        // Also remove its portion distributions and targets
        const newTargets = { ...state.targets };
        delete newTargets[id];
        const newDistributions = { ...state.distributions };
        Object.keys(newDistributions).forEach(mealId => {
            delete newDistributions[mealId][id];
        });
        return {
            customFoods: state.customFoods.filter(f => f.id !== id),
            targets: newTargets,
            distributions: newDistributions,
            dirty: true,
        };
    })
        }),
        {
            name: 'portions-storage', // nombre en localStorage
            // Se persiste el plan en construcción completo (scopeado al paciente
            // vía loadedPatientId + switchPatient) para que un F5 o el cierre de
            // la pestaña no pierdan el trabajo del armador/porciones.
            partialize: (state) => ({
                targets: state.targets,
                distributions: state.distributions,
                activeMeals: state.activeMeals,
                activeGroups: state.activeGroups,
                customFoods: state.customFoods,
                customMeals: state.customMeals,
                mealTimes: state.mealTimes,
                libreConsumoIds: state.libreConsumoIds,
                sugerenciasComida: state.sugerenciasComida,
                dirty: state.dirty,
                selectedPautaId: state.selectedPautaId,
                loadedPautaId: state.loadedPautaId,
                autoSelectedPlanifId: state.autoSelectedPlanifId,
                loadedPatientId: state.loadedPatientId,
            }),
        }
    )
);
