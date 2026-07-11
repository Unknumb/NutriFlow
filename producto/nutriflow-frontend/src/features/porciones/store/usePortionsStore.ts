import { create } from 'zustand';
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
    loadedPatientId: string | null;
    setLoadedPatientId: (id: string | null) => void;
}

export const usePortionsStore = create<PortionsState>((set) => ({
    // Las metas diarias calculadas en el armador de pautas
    targets: {},
    // El estado actual de porciones por comida
    distributions: {},
    // Grupos y comidas activas
    activeMeals: ['desayuno', 'colacion_am', 'almuerzo', 'colacion_pm', 'once', 'cena'],
    activeGroups: ['cer', 'veg', 'fru', 'cbg', 'lmg', 'ace'],
    // Alimentos personalizados añadidos
    customFoods: [],
    // Tiempos de comida personalizados y overrides de horario
    customMeals: [],
    mealTimes: {},
    addCustomMeal: (name, time) => set((state) => {
        const id = 'meal-' + Date.now();
        return {
            customMeals: [...state.customMeals, { id, name: name.trim(), time: time.trim() }],
            activeMeals: [...state.activeMeals, id],
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
        };
    }),
    setMealTime: (mealId, time) => set((state) => ({
        mealTimes: { ...state.mealTimes, [mealId]: time },
    })),
    // Por defecto ningún grupo es libre consumo; la nutricionista lo activa por grupo.
    libreConsumoIds: [],
    toggleLibreConsumo: (groupId) => set((state) => ({
        libreConsumoIds: state.libreConsumoIds.includes(groupId)
            ? state.libreConsumoIds.filter((id) => id !== groupId)
            : [...state.libreConsumoIds, groupId],
    })),
    loadedPatientId: null,
    setLoadedPatientId: (id) => set({ loadedPatientId: id }),

    // Sugerencias del generador por comida (persisten en estructura_grid_json).
    sugerenciasComida: {},
    addSugerenciaComida: (mealId, sugerencia) => set((state) => {
        const actuales = state.sugerenciasComida[mealId] || [];
        if (actuales.some((s) => s.id === sugerencia.id)) return {};
        return {
            sugerenciasComida: {
                ...state.sugerenciasComida,
                [mealId]: [...actuales, sugerencia],
            },
        };
    }),
    removeSugerenciaComida: (mealId, sugerenciaId) => set((state) => ({
        sugerenciasComida: {
            ...state.sugerenciasComida,
            [mealId]: (state.sugerenciasComida[mealId] || []).filter((s) => s.id !== sugerenciaId),
        },
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
        };
    }),

    toggleMeal: (mealId) => set((state) => ({
        activeMeals: state.activeMeals.includes(mealId)
            ? state.activeMeals.filter(id => id !== mealId)
            : [...state.activeMeals, mealId]
    })),

    toggleGroup: (groupId) => set((state) => ({
        activeGroups: state.activeGroups.includes(groupId)
            ? state.activeGroups.filter(id => id !== groupId)
            : [...state.activeGroups, groupId]
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
            distributions: newDistributions
        };
    }),

    incrementPortion: (mealId, groupId) => set((state) => ({
        distributions: {
            ...state.distributions,
            [mealId]: {
                ...(state.distributions[mealId] || {}),
                [groupId]: (state.distributions[mealId]?.[groupId] || 0) + 0.5
            }
        }
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
            }
        };
    }),

    setPortion: (mealId, groupId, value) => set((state) => ({
        distributions: {
            ...state.distributions,
            [mealId]: {
                ...(state.distributions[mealId] || {}),
                [groupId]: Math.max(0, value)
            }
        }
    })),
    
    incrementTarget: (groupId) => set((state) => ({
        targets: {
            ...state.targets,
            [groupId]: (state.targets[groupId] || 0) + 0.5
        }
    })),
    
    decrementTarget: (groupId) => set((state) => {
        const current = state.targets[groupId] || 0;
        if (current <= 0) return state;
        return {
            targets: {
                ...state.targets,
                [groupId]: current - 0.5
            }
        };
    }),

    resetPlan: () => set({ targets: {} }),
    resetDistributions: () => set({ distributions: {}, sugerenciasComida: {} }),
    setTargets: (newTargets) => set({ targets: newTargets }),
    addCustomFood: (food) => set((state) => ({ customFoods: [...state.customFoods, food] })),
    updateCustomFood: (id, data) => set((state) => ({
        customFoods: state.customFoods.map(f => f.id === id ? { ...f, ...data } : f),
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
            distributions: newDistributions
        };
    })
}));