import { useState } from 'react';
import { usePortionsStore } from '../store/usePortionsStore';

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');

    // 2. Estado Global de Zustand
    const { targets, distributions, incrementPortion, decrementPortion } = usePortionsStore();

    // 3. Datos del paciente (Pronto vendrá por TanStack Query)
    const patientContext = { name: "Juan Pérez", age: 45, weight: 85, kcal: 1807 };

    // 4. Cálculos Derivados (Totales y Balances)
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

    return {
        state: { activeTab, patientContext, targets, distributions },
        actions: { setActiveTab, incrementPortion, decrementPortion },
        computed: { getGroupTotal, getGroupBalance }
    };
};