import { useState, useMemo, useEffect } from 'react';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { useCreatePlanificacion } from '../../planificaciones/hooks/usePlanificaciones';

export const useMacronutrientsSetup = () => {
    // 1. Estado Global (Zustand)
    const activePatient = useClinicalStore((state) => state.activePatient);
    const pesoActivo = useClinicalStore((state) => state.pesoActivo);
    const tmbPromedio = useClinicalStore((state) => state.tmbPromedio);

    // 2. Estado Local (Lo que el usuario edita antes de guardar) con Auto-guardado en LocalStorage
    const [protGkg, setProtGkg] = useState(() => {
        const saved = localStorage.getItem('nutriflow_macros_protGkg');
        return saved ? parseFloat(saved) : 2.0;
    });
    const [choPct, setChoPct] = useState(() => {
        const saved = localStorage.getItem('nutriflow_macros_choPct');
        return saved ? parseFloat(saved) : 45;
    });
    const [fatPct, setFatPct] = useState(() => {
        const saved = localStorage.getItem('nutriflow_macros_fatPct');
        return saved ? parseFloat(saved) : 27;
    });

    // Efecto para auto-guardar en localStorage cada vez que el usuario mueve los sliders
    useEffect(() => {
        localStorage.setItem('nutriflow_macros_protGkg', protGkg.toString());
        localStorage.setItem('nutriflow_macros_choPct', choPct.toString());
        localStorage.setItem('nutriflow_macros_fatPct', fatPct.toString());
    }, [protGkg, choPct, fatPct]);

    // 3. Motor de Cálculo Reactivo
    const totals = useMemo(() => {
        // Proteínas (Base: g/kg)
        const protG = protGkg * pesoActivo;
        const protKcal = protG * 4;
        const protPct = tmbPromedio > 0 ? (protKcal / tmbPromedio) * 100 : 0;

        // Carbohidratos (Base: %)
        const choKcal = (choPct / 100) * tmbPromedio;
        const choG = choKcal / 4;

        // Grasas (Base: %)
        const fatKcal = (fatPct / 100) * tmbPromedio;
        const fatG = fatKcal / 9;

        const totalGrams = protG + choG + fatG;
        const totalPercent = Math.round(protPct) + Math.round(choPct) + Math.round(fatPct);

        return {
            prot: { g: Math.round(protG), kcal: Math.round(protKcal), pct: Math.round(protPct) },
            cho: { g: Math.round(choG), kcal: Math.round(choKcal), pct: Math.round(choPct) },
            fat: { g: Math.round(fatG), kcal: Math.round(fatKcal), pct: Math.round(fatPct) },
            summary: { grams: Math.round(totalGrams), percent: totalPercent }
        };
    }, [protGkg, choPct, fatPct, pesoActivo, tmbPromedio]);

    // 4. Mutación de TanStack Query (Para Guardar Planificacion)
    const createPlanificacion = useCreatePlanificacion();
    const setActivePlanificacionId = useClinicalStore((state) => state.setActivePlanificacionId);

    const handleSave = () => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero');
            return;
        }
        createPlanificacion.mutate({
            paciente_id: activePatient.id,
            calorias_totales: totals.summary.percent === 100 ? totals.prot.kcal + totals.cho.kcal + totals.fat.kcal : tmbPromedio,
            distribucion_macros: {
                proteina: totals.prot.pct,
                grasa: totals.fat.pct,
                carbohidratos: totals.cho.pct
            }
        }, {
            onSuccess: (data: any) => {
                // Asumiendo que el backend retorna el objeto creado en `data` con su `id`
                if (data && data.id) {
                    setActivePlanificacionId(data.id);
                }
                alert("¡Planificación guardada con éxito!");
            }
        });
    };

    const handleReset = () => {
        setProtGkg(1.5);
        setChoPct(50);
        setFatPct(30);
    };

    return {
        context: { pesoActivo, tmbPromedio },
        inputs: { protGkg, choPct, fatPct },
        actions: { setProtGkg, setChoPct, setFatPct, handleReset, handleSave },
        totals,
        isSaving: createPlanificacion.isPending
    };
};