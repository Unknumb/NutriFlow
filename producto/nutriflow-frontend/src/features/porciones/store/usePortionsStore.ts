import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PortionsState {
    targets: Record<string, number>;
    distributions: Record<string, Record<string, number>>;
    activeMeals: string[];
    activeGroups: string[];
}

interface PortionsStore extends PortionsState {
    incrementPortion: (mealId: string, groupId: string) => void;
    decrementPortion: (mealId: string, groupId: string) => void;
    setInitialPortions: (data: Partial<PortionsState>) => void;
    toggleMeal: (mealId: string) => void;
    toggleGroup: (groupId: string) => void;
    resetDistributions: () => void;
}

export const usePortionsStore = create<PortionsStore>()(
    devtools(
        (set) => ({
            targets: {},
            distributions: {},
            activeMeals: [],
            activeGroups: [],
    
            setInitialPortions: (data) => set({
                targets: data.targets || {},
                distributions: data.distributions || {},
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

            resetDistributions: () => set({ 
                distributions: {},
                activeMeals: [],
                activeGroups: []
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
    })
    }), { name: 'portions-store' })
);