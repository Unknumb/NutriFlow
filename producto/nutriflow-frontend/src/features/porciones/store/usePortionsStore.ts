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

export interface PortionsState {
    targets: Record<string, number>;
    distributions: Record<string, Record<string, number>>;
    activeMeals: string[];
    activeGroups: string[];
    customFoods: CustomFoodDef[];
    incrementPortion: (mealId: string, groupId: string) => void;
    decrementPortion: (mealId: string, groupId: string) => void;
    incrementTarget: (groupId: string) => void;
    decrementTarget: (groupId: string) => void;
    resetPlan: () => void;
    resetDistributions: () => void;
    setTargets: (targets: Record<string, number>) => void;
    setInitialPortions: (data: { targets: Record<string, number>, distributions: Record<string, Record<string, number>>, activeMeals: string[], activeGroups: string[] }) => void;
    addCustomFood: (food: CustomFoodDef) => void;
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
    loadedPatientId: null,
    setLoadedPatientId: (id) => set({ loadedPatientId: id }),
    
    setInitialPortions: (data) => set({
        targets: data.targets,
        distributions: data.distributions,
        activeMeals: data.activeMeals || [],
        activeGroups: data.activeGroups || []
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
                [groupId]: (state.distributions[mealId]?.[groupId] || 0) + 1
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
                    [groupId]: current - 1
                }
            }
        };
    }),
    
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
    resetDistributions: () => set({ distributions: {} }),
    setTargets: (newTargets) => set({ targets: newTargets }),
    addCustomFood: (food) => set((state) => ({ customFoods: [...state.customFoods, food] })),
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