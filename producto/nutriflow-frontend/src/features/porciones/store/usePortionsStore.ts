import { create } from 'zustand';

interface PortionsState {
    targets: Record<string, number>;
    distributions: Record<string, Record<string, number>>;
    incrementPortion: (mealId: string, groupId: string) => void;
    decrementPortion: (mealId: string, groupId: string) => void;
}

export const usePortionsStore = create<PortionsState>((set) => ({
    // Las metas diarias según la evaluación
    targets: {
        cereales: 4, frutas: 5, carnes: 7, lacteos: 3, arg: 2, galleton: 2
    },
    // El estado actual de porciones por comida
    distributions: {
        desayuno: { frutas: 1, lacteos: 1 },
        colacion_am: { frutas: 2, arg: 1, galleton: 1 },
        almuerzo: { cereales: 2, carnes: 4 },
        colacion_pm: { frutas: 2, lacteos: 1, galleton: 1 },
        once: { cereales: 2, carnes: 3, lacteos: 1, arg: 1 },
    },
    
    incrementPortion: (mealId, groupId) => set((state) => ({
        distributions: {
            ...state.distributions,
            [mealId]: {
                ...state.distributions[mealId],
                [groupId]: (state.distributions[mealId]?.[groupId] || 0) + 1
            }
        }
    })),
    
    decrementPortion: (mealId, groupId) => set((state) => {
        const current = state.distributions[mealId]?.[groupId] || 0;
        if (current <= 0) return state; // Evita valores negativos
        
        return {
            // 🚨 CORRECCIÓN: Faltaba esta llave "distributions:" envolviendo el retorno
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