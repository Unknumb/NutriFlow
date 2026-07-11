import { useEffect, useMemo } from 'react';
import { FOOD_GROUPS } from '../constants/foodGroups';
import type { DietPlanTotals } from '../types';
import type { ClinicalContext } from '../../macronutrients/types';
import { usePortionsStore } from '../../porciones/store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';

export const useDietPlanBuilder = (initialTargets: ClinicalContext & { kcal: number, prot: number, cho: number, fat: number }) => {
    // Usamos el store global para que las porciones elegidas aquí se reflejen en /porciones
    const store = usePortionsStore();
    const portions = store.targets; // Las porciones aquí son los targets en el store de distribuciones

    // El plan en construcción pertenece a un paciente: si cambió el paciente
    // activo, se descarta el estado anterior (switchPatient es idempotente).
    const activePatientId = useClinicalStore((s) => s.activePatient?.id);
    const switchPatient = store.switchPatient;
    useEffect(() => {
        switchPatient(activePatientId || null);
    }, [activePatientId, switchPatient]);

    // Los objetivos se derivan directamente de las props (macros/TMB del paciente
    // activo). No se copian a estado local para evitar que queden congelados al
    // cambiar de paciente o de planificación (bug de targets stale).
    const targets = initialTargets;

    const ALL_GROUPS = useMemo(() => [...FOOD_GROUPS, ...store.customFoods], [store.customFoods]);

    const libreConsumoIds = store.libreConsumoIds;

    const currentTotals = useMemo<DietPlanTotals>(() => {
        return ALL_GROUPS.reduce((acc, group) => {
            const qty = portions[group.id] || 0;
            const esLibre = group.isFree || libreConsumoIds.includes(group.id);
            if (!esLibre && qty > 0) {
                acc.kcal += group.kcal * qty;
                acc.prot += group.macros.p * qty;
                acc.cho += group.macros.c * qty;
                acc.fat += group.macros.g * qty;
            }
            return acc;
        }, { kcal: 0, prot: 0, cho: 0, fat: 0 });
    }, [portions, ALL_GROUPS, libreConsumoIds]);

    /** Crea un agregador que suma porciones a `acumulado` sin exceder los macros
     *  restantes (los va descontando). Compartido por sugerir y completar. */
    const makePortionAdder = (
        acumulado: Record<string, number>,
        remaining: { prot: number; cho: number; fat: number },
    ) => (groupId: string, amount: number) => {
        if (amount <= 0) return;
        const group = ALL_GROUPS.find(g => g.id === groupId);
        if (!group) return;

        const p = group.macros.p;
        const c = group.macros.c;
        const g_mac = group.macros.g;

        // Calculate max allowed amount to not exceed remaining macros
        // We use a small epsilon 0.1 to avoid floating point precision issues
        const maxP = p > 0 ? (remaining.prot + 0.1) / p : Infinity;
        const maxC = c > 0 ? (remaining.cho + 0.1) / c : Infinity;
        const maxG = g_mac > 0 ? (remaining.fat + 0.1) / g_mac : Infinity;

        const maxAllowed = Math.min(maxP, maxC, maxG);

        // Round down to nearest 0.5
        const actualAmount = Math.floor(Math.min(amount, maxAllowed) * 2) / 2;

        if (actualAmount <= 0) return;

        acumulado[groupId] = (acumulado[groupId] || 0) + actualAmount;
        remaining.prot -= p * actualAmount;
        remaining.cho -= c * actualAmount;
        remaining.fat -= g_mac * actualAmount;
    };

    const suggestDistribution = () => {
        const remaining = { prot: targets.prot, cho: targets.cho, fat: targets.fat };
        const newPortions: Record<string, number> = {};
        const addPortion = makePortionAdder(newPortions, remaining);

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
        if (remaining.prot > 0) {
            const meatType = randomChoice(['cbg', 'cag']);
            addPortion(meatType, 100); // addPortion will cap it safely
        }

        // 5. Cereals to fill carbs
        if (remaining.cho > 0) {
            addPortion('cer', 100); // addPortion will cap it safely
        }

        // 6. Oils / Fats to fill fat
        if (remaining.fat > 0) {
            const fatType = randomChoice(['ace', 'arg']);
            addPortion(fatType, 100); // addPortion will cap it safely
        }

        // Asignar al store global
        store.setTargets(newPortions);
    };

    // Completa la distribución hasta las metas SIN pisar lo ya colocado: parte
    // de las porciones actuales, calcula los macros que faltan y agrega solo
    // porciones de relleno (proteína→carnes, carbohidratos→cereales,
    // grasa→aceites) capadas para no exceder ninguna meta.
    const completeDistribution = () => {
        const remaining = {
            prot: Math.max(0, targets.prot - currentTotals.prot),
            cho: Math.max(0, targets.cho - currentTotals.cho),
            fat: Math.max(0, targets.fat - currentTotals.fat),
        };
        const newPortions: Record<string, number> = { ...portions };
        const addPortion = makePortionAdder(newPortions, remaining);

        // Base de verduras/frutas solo si aún no hay nada de ellas.
        if (!newPortions['veg']) addPortion('veg', 2);
        if (!newPortions['fru']) addPortion('fru', 2);

        // Relleno determinista por macro faltante (el cap evita pasarse).
        if (remaining.prot > 0) addPortion('cbg', 100);
        if (remaining.cho > 0) addPortion('cer', 100);
        if (remaining.fat > 0) addPortion('ace', 100);

        store.setTargets(newPortions);
    };

    return {
        portions,
        targets,
        currentTotals,
        actions: {
            incrementPortion: store.incrementTarget,
            decrementPortion: store.decrementTarget,
            resetPlan: store.resetPlan,
            suggestDistribution,
            completeDistribution
        }
    };
};
