import { useState } from 'react';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePaciente } from '../../pacientes/hooks/usePacientes';
import { useCreatePauta } from '../../pautas/hooks/usePautas';

export const usePortions = () => {
    // 1. Estado de Navegación UI
    const [activeTab, setActiveTab] = useState<'tabla' | 'pauta' | 'opciones' | 'pdf'>('tabla');

    // 2. Estado Global de Zustand
    const { targets, distributions, incrementPortion, decrementPortion, removeTargetGroup } = usePortionsStore();

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

    const createPauta = useCreatePauta();
    const handleSavePauta = () => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero para poder guardar la pauta.');
            return;
        }

        const savedChoPct = parseFloat(localStorage.getItem('nutriflow_macros_choPct') || '45');
        const savedFatPct = parseFloat(localStorage.getItem('nutriflow_macros_fatPct') || '27');
        const savedProtPct = 100 - savedChoPct - savedFatPct; 

        createPauta.mutate({
            paciente_id: activePatient.id,
            calorias_totales: targets.kcal || 0,
            porcentajes_macros: {
                proteina: savedProtPct,
                grasa: savedFatPct,
                carbohidratos: savedChoPct
            },
            tiempos_comida: distributions,
        }, {
            onSuccess: () => {
                alert("¡Pauta guardada con éxito en la base de datos!");
            },
            onError: (err) => {
                alert("Hubo un error al guardar la pauta");
                console.error(err);
            }
        });
    };

    return {
        state: { activeTab, patientContext, targets, distributions, isSaving: createPauta.isPending },
        actions: { setActiveTab, incrementPortion, decrementPortion, handleSavePauta, removeTargetGroup },
        computed: { getGroupTotal, getGroupBalance }
    };
};