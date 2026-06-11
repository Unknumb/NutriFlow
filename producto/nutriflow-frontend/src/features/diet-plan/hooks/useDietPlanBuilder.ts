import { useState, useMemo } from 'react';
import { FOOD_GROUPS } from '../constants/foodGroups';
import type { DietPlanTotals } from '../types';
import type { ClinicalContext } from '../../macronutrients/types';
import { usePortionsStore } from '../../porciones/store/usePortionsStore';

export const useDietPlanBuilder = (initialTargets: ClinicalContext & { kcal: number, prot: number, cho: number, fat: number }) => {
    // Usamos el store global para que las porciones elegidas aquí se reflejen en /porciones
    const store = usePortionsStore();
    const portions = store.targets; // Las porciones aquí son los targets en el store de distribuciones

    const [targets, setTargets] = useState(initialTargets);

    const ALL_GROUPS = useMemo(() => [...FOOD_GROUPS, ...store.customFoods], [store.customFoods]);

    const currentTotals = useMemo<DietPlanTotals>(() => {
        return ALL_GROUPS.reduce((acc, group) => {
            const qty = portions[group.id] || 0;
            if (!group.isFree && qty > 0) {
                acc.kcal += group.kcal * qty;
                acc.prot += group.macros.p * qty;
                acc.cho += group.macros.c * qty;
                acc.fat += group.macros.g * qty;
            }
            return acc;
        }, { kcal: 0, prot: 0, cho: 0, fat: 0 });
    }, [portions, ALL_GROUPS]);

    const suggestDistribution = () => {
        let remainingProt = targets.prot;
        let remainingCho = targets.cho;
        let remainingFat = targets.fat;

        const newPortions: Record<string, number> = {};

        const addPortion = (groupId: string, amount: number) => {
            if (amount <= 0) return;
            const group = ALL_GROUPS.find(g => g.id === groupId);
            if (!group) return;

            const p = group.macros.p;
            const c = group.macros.c;
            const g_mac = group.macros.g;

            // Calculate max allowed amount to not exceed remaining macros
            // We use a small epsilon 0.1 to avoid floating point precision issues
            const maxP = p > 0 ? (remainingProt + 0.1) / p : Infinity;
            const maxC = c > 0 ? (remainingCho + 0.1) / c : Infinity;
            const maxG = g_mac > 0 ? (remainingFat + 0.1) / g_mac : Infinity;

            const maxAllowed = Math.min(maxP, maxC, maxG);
            
            // Round down to nearest 0.5
            const actualAmount = Math.floor(Math.min(amount, maxAllowed) * 2) / 2;

            if (actualAmount <= 0) return;

            newPortions[groupId] = (newPortions[groupId] || 0) + actualAmount;
            remainingProt -= p * actualAmount;
            remainingCho -= c * actualAmount;
            remainingFat -= g_mac * actualAmount;
        };

        const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
        const randomChoice = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        // 1. Base Veggies and Fruits
        addPortion('veg', randomInt(2, 5));
        addPortion('fru', randomInt(2, 4));
        
        // 2. Base Dairy (Random type and amount)
        const dairyType = randomChoice(['lbg', 'lmg', 'lag']);
        addPortion(dairyType, randomInt(1, 2) + (Math.random() > 0.5 ? 0.5 : 0));

        // 3. Chance for Legumes (Leguminosas)
        if (Math.random() > 0.6) {
            addPortion('leg', randomInt(1, 2));
        }

        // 4. Meats to fill protein
        if (remainingProt > 0) {
            const meatType = randomChoice(['cbg', 'cag']);
            addPortion(meatType, 100); // addPortion will cap it safely
        }

        // 5. Cereals to fill carbs
        if (remainingCho > 0) {
            addPortion('cer', 100); // addPortion will cap it safely
        }

        // 6. Oils / Fats to fill fat
        if (remainingFat > 0) {
            const fatType = randomChoice(['ace', 'arg']);
            addPortion(fatType, 100); // addPortion will cap it safely
        }

        // Asignar al store global
        store.setTargets(newPortions);
    };

    return {
        portions,
        targets,
        setTargets,
        currentTotals,
        actions: {
            incrementPortion: store.incrementTarget,
            decrementPortion: store.decrementTarget,
            resetPlan: store.resetPlan,
            suggestDistribution
        }
    };
};