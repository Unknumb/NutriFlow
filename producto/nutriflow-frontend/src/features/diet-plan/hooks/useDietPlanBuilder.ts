import { useState, useMemo } from 'react';
import { FOOD_GROUPS } from '../constants/foodGroups';
import type { DietPlanTotals } from '../types';
// 🚨 CORRECCIÓN FSD: Importamos el contexto clínico desde su feature dueña
import type { ClinicalContext } from '../../macronutrients/types';

export const useDietPlanBuilder = (initialTargets: ClinicalContext & { kcal: number, prot: number, cho: number, fat: number }) => {
    const [portions, setPortions] = useState<Record<string, number>>({});
    const [targets, setTargets] = useState(initialTargets);

    const incrementPortion = (id: string) => {
        setPortions(prev => ({ ...prev, [id]: (prev[id] || 0) + 0.5 }));
    };

    const decrementPortion = (id: string) => {
        setPortions(prev => {
            const current = prev[id] || 0;
            if (current <= 0) return prev;
            return { ...prev, [id]: current - 0.5 };
        });
    };

    const resetPlan = () => setPortions({});

    const currentTotals = useMemo<DietPlanTotals>(() => {
        return FOOD_GROUPS.reduce((acc, group) => {
            const qty = portions[group.id] || 0;
            if (!group.isFree && qty > 0) {
                acc.kcal += group.kcal * qty;
                acc.prot += group.macros.p * qty;
                acc.cho += group.macros.c * qty;
                acc.fat += group.macros.g * qty;
            }
            return acc;
        }, { kcal: 0, prot: 0, cho: 0, fat: 0 });
    }, [portions]);

    return {
        portions,
        targets,
        setTargets,
        currentTotals,
        actions: {
            incrementPortion,
            decrementPortion,
            resetPlan
        }
    };
};