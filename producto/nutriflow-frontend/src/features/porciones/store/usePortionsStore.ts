import { create } from 'zustand';
import { MEALS, NUTRITION_GROUPS } from '../constants';

export interface PortionsState {
    targets: Record<string, number>;
    distributions: Record<string, Record<string, number>>;
    activeMeals: string[];
    activeGroups: string[];
    incrementPortion: (mealId: string, groupId: string) => void;
    decrementPortion: (mealId: string, groupId: string) => void;
    setInitialPortions: (data: { targets?: Record<string, number>, distributions?: Record<string, Record<string, number>>, activeMeals?: string[], activeGroups?: string[] }) => void;
    toggleMeal: (mealId: string) => void;
    toggleGroup: (groupId: string) => void;
    resetDistributions: () => void;
    hideEmpty: boolean;
    toggleHideEmpty: () => void;
}

export const usePortionsStore = create<PortionsState>((set) => ({
    targets: {},
    distributions: {},
    activeMeals: [],
    activeGroups: [],
    hideEmpty: false,
    
    setInitialPortions: (data) => set({
        targets: data.targets || {},
        distributions: data.distributions || {},
        // Si no vienen grupos activos, usamos los valores por defecto
        activeMeals: data.activeMeals?.length ? data.activeMeals : MEALS.map(m => m.id),
        activeGroups: data.activeGroups?.length ? data.activeGroups : NUTRITION_GROUPS.map(g => g.id)
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

    toggleHideEmpty: () => set((state) => ({ hideEmpty: !state.hideEmpty })),

    resetDistributions: () => set({ distributions: {} }),

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
    })
}));