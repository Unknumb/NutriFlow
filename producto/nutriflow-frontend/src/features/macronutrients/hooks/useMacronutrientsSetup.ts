import { useState, useMemo, useEffect, useCallback } from 'react';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { useCreatePlanificacion } from '../../planificaciones/hooks/usePlanificaciones';

type MacroKey = 'prot' | 'cho' | 'fat';
type MacroPercentages = Record<MacroKey, number>;

/**
 * Garantiza que la suma de los 3 macros sea exactamente 100%.
 * Al cambiar uno, los otros dos se escalan proporcionalmente.
 */
const autoBalance = (changed: MacroKey, newVal: number, prev: MacroPercentages): MacroPercentages => {
    const clamped = Math.max(0, Math.min(100, Math.round(newVal)));
    const others = (['prot', 'cho', 'fat'] as MacroKey[]).filter(k => k !== changed);
    const remaining = 100 - clamped;
    const otherSum = prev[others[0]] + prev[others[1]];

    let a: number, b: number;
    if (remaining <= 0) {
        a = 0;
        b = 0;
    } else if (otherSum <= 0) {
        // Caso borde: ambos otros son 0 → repartir equitativamente
        a = Math.round(remaining / 2);
        b = remaining - a;
    } else {
        // Escalar proporcionalmente; el último absorbe el resto para garantizar exactitud
        a = Math.round((prev[others[0]] / otherSum) * remaining);
        b = remaining - a;
    }

    return { [changed]: clamped, [others[0]]: a, [others[1]]: b } as MacroPercentages;
};

export const useMacronutrientsSetup = () => {
    const activePatient = useClinicalStore((state) => state.activePatient);
    const pesoActivo = useClinicalStore((state) => state.pesoActivo);
    const tmbPromedio = useClinicalStore((state) => state.tmbPromedio);

    // Estado: todos los macros como porcentajes — SIEMPRE suman 100
    const [macrosPct, setMacrosPct] = useState<MacroPercentages>(() => {
        const prot = parseFloat(localStorage.getItem('nutriflow_macros_protPct') || '0') || 28;
        const cho  = parseFloat(localStorage.getItem('nutriflow_macros_choPct')  || '0') || 45;
        const fat  = parseFloat(localStorage.getItem('nutriflow_macros_fatPct')  || '0') || 27;
        const total = prot + cho + fat;
        if (total === 0) return { prot: 28, cho: 45, fat: 27 };
        // Normalizar al cargar por si los valores guardados no suman 100
        const p = Math.round((prot / total) * 100);
        const c = Math.round((cho / total) * 100);
        return { prot: p, cho: c, fat: 100 - p - c };
    });

    useEffect(() => {
        localStorage.setItem('nutriflow_macros_protPct', macrosPct.prot.toString());
        localStorage.setItem('nutriflow_macros_choPct',  macrosPct.cho.toString());
        localStorage.setItem('nutriflow_macros_fatPct',  macrosPct.fat.toString());
    }, [macrosPct]);

    // Setter central: cambia un macro y auto-balancea los otros dos
    const setMacro = useCallback((key: MacroKey, newVal: number) => {
        setMacrosPct(prev => autoBalance(key, newVal, prev));
    }, []);

    // Derivado: g/kg de proteína (para el tab "g/kg")
    const protGkg = useMemo(() => {
        if (!pesoActivo || !tmbPromedio) return 2.0;
        return (macrosPct.prot / 100 * tmbPromedio) / (4 * pesoActivo);
    }, [macrosPct.prot, pesoActivo, tmbPromedio]);

    // Motor de cálculo reactivo
    const totals = useMemo(() => {
        const protKcal = (macrosPct.prot / 100) * tmbPromedio;
        const protG    = protKcal / 4;

        const choKcal  = (macrosPct.cho / 100) * tmbPromedio;
        const choG     = choKcal / 4;

        const fatKcal  = (macrosPct.fat / 100) * tmbPromedio;
        const fatG     = fatKcal / 9;

        return {
            prot: { g: Math.round(protG), kcal: Math.round(protKcal), pct: macrosPct.prot },
            cho:  { g: Math.round(choG),  kcal: Math.round(choKcal),  pct: macrosPct.cho  },
            fat:  { g: Math.round(fatG),  kcal: Math.round(fatKcal),  pct: macrosPct.fat  },
            summary: {
                grams:   Math.round(protG + choG + fatG),
                percent: macrosPct.prot + macrosPct.cho + macrosPct.fat, // siempre 100
            }
        };
    }, [macrosPct, tmbPromedio]);

    const createPlanificacion = useCreatePlanificacion();
    const setActivePlanificacionId = useClinicalStore((state) => state.setActivePlanificacionId);

    const handleSave = () => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero');
            return;
        }
        createPlanificacion.mutate({
            paciente_id: activePatient.id,
            calorias_totales: totals.prot.kcal + totals.cho.kcal + totals.fat.kcal,
            distribucion_macros: {
                proteina:      macrosPct.prot,
                grasa:         macrosPct.fat,
                carbohidratos: macrosPct.cho,
            }
        }, {
            onSuccess: (data: any) => {
                if (data?.id) setActivePlanificacionId(data.id);
                alert('¡Planificación guardada con éxito!');
            }
        });
    };

    const handleReset = () => setMacrosPct({ prot: 28, cho: 45, fat: 27 });

    return {
        context: { pesoActivo, tmbPromedio },
        inputs: {
            protGkg,
            protPct: macrosPct.prot,
            choPct:  macrosPct.cho,
            fatPct:  macrosPct.fat,
        },
        actions: {
            setMacro,
            // Wrappers legacy compatibles con el modo g/kg y gramos del SetupCard
            setProtGkg: (val: number) => {
                if (!pesoActivo || !tmbPromedio) return;
                setMacro('prot', (val * pesoActivo * 4 / tmbPromedio) * 100);
            },
            setChoPct:  (val: number) => setMacro('cho', val),
            setFatPct:  (val: number) => setMacro('fat', val),
            handleReset,
            handleSave,
        },
        totals,
        isSaving: createPlanificacion.isPending,
    };
};
