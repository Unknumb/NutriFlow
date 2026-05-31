import { useState } from 'react';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePaciente } from '../../pacientes/hooks/usePacientes';

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');

    // 2. Estado Global de Zustand
    const { targets, distributions, incrementPortion, decrementPortion } = usePortionsStore();

    // 3. Datos del paciente conectado con backend
    const { activePatient } = useClinicalStore();
    const { data: pacienteData } = usePaciente(activePatient?.id || '');

    // Transformamos los datos del backend al formato que necesita la UI,
    // o caemos en valores por defecto si no hay paciente seleccionado
    const patientContext = { 
        name: pacienteData?.nombre_completo || "Sin seleccionar", 
        age: pacienteData?.edad || 0, 
        weight: pacienteData?.peso_actual || 0, 
        kcal: targets.kcal || 0 // Las kcal suelen venir del plan de dieta
    };

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