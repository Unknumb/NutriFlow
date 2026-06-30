import { useState, useMemo, useEffect, useCallback } from 'react';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { useCreatePlanificacion } from '../../planificaciones/hooks/usePlanificaciones';

// Claves de localStorage namespaced por paciente, para no mezclar los macros
// editados entre pacientes distintos.
const DEFAULTS = { protGkg: 2.0, choPct: 45, fatPct: 27 };
const macroKey = (patientId: string | undefined, field: string) =>
    `nutriflow_macros_${patientId || 'anon'}_${field}`;
const readMacro = (patientId: string | undefined, field: keyof typeof DEFAULTS) => {
    const saved = localStorage.getItem(macroKey(patientId, field));
    return saved !== null ? parseFloat(saved) : DEFAULTS[field];
};

export const useMacronutrientsSetup = () => {
    const activePatient = useClinicalStore((state) => state.activePatient);
    const pesoActivo = useClinicalStore((state) => state.pesoActivo);
    const tmbPromedio = useClinicalStore((state) => state.tmbPromedio);

    // 2. Estado Local (Lo que el usuario edita antes de guardar) con Auto-guardado
    //    en LocalStorage, scopeado por paciente.
    const [protGkg, setProtGkg] = useState(() => readMacro(activePatient?.id, 'protGkg'));
    const [choPct, setChoPct] = useState(() => readMacro(activePatient?.id, 'choPct'));
    const [fatPct, setFatPct] = useState(() => readMacro(activePatient?.id, 'fatPct'));

    // Al cambiar de paciente, recargar sus macros guardados (o los defaults).
    useEffect(() => {
        setProtGkg(readMacro(activePatient?.id, 'protGkg'));
        setChoPct(readMacro(activePatient?.id, 'choPct'));
        setFatPct(readMacro(activePatient?.id, 'fatPct'));
    }, [activePatient?.id]);

    // Efecto para auto-guardar en localStorage cada vez que el usuario mueve los sliders
    useEffect(() => {
        localStorage.setItem(macroKey(activePatient?.id, 'protGkg'), protGkg.toString());
        localStorage.setItem(macroKey(activePatient?.id, 'choPct'), choPct.toString());
        localStorage.setItem(macroKey(activePatient?.id, 'fatPct'), fatPct.toString());
    }, [protGkg, choPct, fatPct, activePatient?.id]);

    // Convierte g/kg → % y redondea para no acumular decimales en los sliders
    const macrosPct = useMemo(() => {
        const protKcal = protGkg * pesoActivo * 4;
        const prot = tmbPromedio > 0 ? Math.round((protKcal / tmbPromedio) * 100) : 0;
        return { prot, cho: Math.round(choPct), fat: Math.round(fatPct) };
    }, [protGkg, pesoActivo, tmbPromedio, choPct, fatPct]);

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

    // Auto-balance: al mover A, la diferencia se resta de B primero y el overflow a C.
    // Garantiza sum = 100 en cada interacción del slider.
    const setMacro = useCallback((key: "prot" | "cho" | "fat", val: number) => {
        const v = Math.round(val);
        const curProt = macrosPct.prot;
        const curCho  = macrosPct.cho;
        const curFat  = macrosPct.fat;

        let newProt = curProt;
        let newCho  = curCho;
        let newFat  = curFat;

        if (key === "prot") {
            const diff = v - curProt;
            newProt = v;
            newCho  = curCho - diff;                                // B absorbe primero
            if (newCho < 0) { newFat = Math.max(0, curFat + newCho); newCho = 0; }
        } else if (key === "cho") {
            const diff = v - curCho;
            newCho  = v;
            newFat  = curFat - diff;                                // B absorbe primero
            if (newFat < 0) { newProt = Math.max(0, curProt + newFat); newFat = 0; }
        } else {
            const diff = v - curFat;
            newFat  = v;
            newCho  = curCho - diff;                                // B absorbe primero
            if (newCho < 0) { newProt = Math.max(0, curProt + newCho); newCho = 0; }
        }

        // Corrección de residual: absorbe desvíos de redondeo o estado inicial desbalanceado
        const residual = 100 - newProt - newCho - newFat;
        if (residual !== 0) {
            if (key !== "fat") newFat = Math.max(0, newFat + residual);
            else               newCho = Math.max(0, newCho + residual);
        }

        // Convertir prot% → g/kg para el estado interno
        const protG = (newProt / 100) * tmbPromedio / 4;
        setProtGkg(pesoActivo > 0 ? protG / pesoActivo : 0);
        setChoPct(newCho);
        setFatPct(newFat);
    }, [macrosPct, tmbPromedio, pesoActivo]);

    // Traduce gramos → % y delega a setMacro para respetar el auto-balance.
    const updateFromGrams = useCallback((key: "prot" | "cho" | "fat", grams: number) => {
        if (tmbPromedio <= 0) return;
        const kcal = grams * (key === "fat" ? 9 : 4);
        setMacro(key, (kcal / tmbPromedio) * 100);
    }, [setMacro, tmbPromedio]);

    // Traduce g/kg → gramos y delega a updateFromGrams.
    const updateFromGramsPerKg = useCallback((key: "prot" | "cho" | "fat", gPerKg: number) => {
        updateFromGrams(key, gPerKg * pesoActivo);
    }, [updateFromGrams, pesoActivo]);

    const handleSave = (nombre?: string) => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero');
            return;
        }
        // No se guarda una planificación sin TMB real calculada: evita persistir
        // calorías fabricadas/arrastradas. La TMB se calcula automáticamente al
        // activar el paciente (useSyncActivePatientTmb); si aún es 0, no está lista.
        if (tmbPromedio <= 0 || pesoActivo <= 0) {
            alert('Aún no se ha calculado la TMB del paciente. Espera unos segundos o revísala en el Dashboard antes de guardar.');
            return;
        }
        createPlanificacion.mutate({
            paciente_id: activePatient.id,
            nombre: nombre?.trim() || undefined,
            calorias_totales: totals.summary.percent === 100 ? totals.prot.kcal + totals.cho.kcal + totals.fat.kcal : tmbPromedio,
            distribucion_macros: {
                proteina:      macrosPct.prot,
                grasa:         macrosPct.fat,
                carbohidratos: macrosPct.cho,
            }
        }, {
            onSuccess: (data: any) => {
                // El backend marca la nueva planificación como activa y devuelve su id.
                if (data && data.id) {
                    setActivePlanificacionId(data.id);
                }
            }
        });
    };

    const handleReset = () => {
        setProtGkg(1.5);
        setChoPct(50);
        setFatPct(30);
    };

    // Auto-cuadre: la proteína (g/kg) es decisión clínica primaria y la grasa se
    // respeta; los CARBOHIDRATOS son el macro de cierre que absorbe el ajuste
    // hasta sumar exactamente 100%. Si no caben CHO (prot+grasa ya pasan de 100),
    // se recorta la grasa.
    const autoBalance = () => {
        const protKcal = protGkg * pesoActivo * 4;
        const protPctR = tmbPromedio > 0 ? Math.round((protKcal / tmbPromedio) * 100) : 0;
        let fatR = Math.round(fatPct);
        let choNuevo = 100 - protPctR - fatR;
        if (choNuevo < 0) {
            fatR = Math.max(0, 100 - protPctR);
            setFatPct(fatR);
            choNuevo = 0;
        }
        setChoPct(choNuevo);
    };

    // Balanceado = la suma de porcentajes está a ±1 de 100 (tolerancia de redondeo).
    const isBalanced = Math.abs(totals.summary.percent - 100) <= 1;

    // Solo se puede guardar con paciente activo y TMB/peso reales calculados.
    const canSave = !!activePatient?.id && tmbPromedio > 0 && pesoActivo > 0;

    return {
        context: { pesoActivo, tmbPromedio },
        inputs: { protGkg, protPct: macrosPct.prot, choPct, fatPct },
        actions: { setMacro, updateFromGrams, updateFromGramsPerKg, setProtGkg, setChoPct, setFatPct, handleReset, handleSave, autoBalance },
        totals,
        isBalanced,
        canSave,
        isSaving: createPlanificacion.isPending
    };
};
