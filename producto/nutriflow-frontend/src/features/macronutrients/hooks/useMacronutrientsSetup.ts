import { useState, useMemo, useEffect, useCallback } from 'react';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { useCreatePlanificacion, useUpdatePlanificacion } from '../../planificaciones/hooks/usePlanificaciones';

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
    const updatePlanificacion = useUpdatePlanificacion();
    const setActivePlanificacionId = useClinicalStore((state) => state.setActivePlanificacionId);

    // Ajuste MANUAL: mover un macro cambia solo ese macro; la suma puede quedar
    // por encima o por debajo de 100% (y se muestra el aviso). El cuadre a 100%
    // se hace explícitamente con el botón "Balance Automático" (autoBalance).
    const setMacro = useCallback((key: "prot" | "cho" | "fat", val: number) => {
        const v = Math.max(0, Math.round(val));
        if (key === "prot") {
            // La proteína se guarda en g/kg; convertimos el % objetivo a g/kg.
            const protG = (v / 100) * tmbPromedio / 4;
            setProtGkg(pesoActivo > 0 ? protG / pesoActivo : 0);
        } else if (key === "cho") {
            setChoPct(v);
        } else {
            setFatPct(v);
        }
    }, [tmbPromedio, pesoActivo]);

    // Traduce gramos → % del macro indicado (manual, sin tocar los otros).
    const updateFromGrams = useCallback((key: "prot" | "cho" | "fat", grams: number) => {
        if (tmbPromedio <= 0) return;
        const kcal = grams * (key === "fat" ? 9 : 4);
        setMacro(key, (kcal / tmbPromedio) * 100);
    }, [setMacro, tmbPromedio]);

    // Traduce g/kg → gramos y delega a updateFromGrams.
    const updateFromGramsPerKg = useCallback((key: "prot" | "cho" | "fat", gPerKg: number) => {
        updateFromGrams(key, gPerKg * pesoActivo);
    }, [updateFromGrams, pesoActivo]);

    // Valida que se pueda persistir y arma calorías/macros, común a crear y
    // sobrescribir. Devuelve null (con aviso) si el contexto aún no está listo.
    const buildPayload = () => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero');
            return null;
        }
        // No se guarda una planificación sin TMB real calculada: evita persistir
        // calorías fabricadas/arrastradas. La TMB se calcula automáticamente al
        // activar el paciente (useSyncActivePatientTmb); si aún es 0, no está lista.
        if (tmbPromedio <= 0 || pesoActivo <= 0) {
            alert('Aún no se ha calculado la TMB del paciente. Espera unos segundos o revísala en el Dashboard antes de guardar.');
            return null;
        }
        return {
            calorias_totales: totals.summary.percent === 100 ? totals.prot.kcal + totals.cho.kcal + totals.fat.kcal : tmbPromedio,
            distribucion_macros: {
                proteina:      macrosPct.prot,
                grasa:         macrosPct.fat,
                carbohidratos: macrosPct.cho,
            }
        };
    };

    const handleSave = (nombre?: string) => {
        const payload = buildPayload();
        if (!payload || !activePatient?.id) return;
        createPlanificacion.mutate({
            paciente_id: activePatient.id,
            nombre: nombre?.trim() || undefined,
            ...payload,
        }, {
            onSuccess: (data: any) => {
                // El backend marca la nueva planificación como activa y devuelve su id.
                if (data && data.id) {
                    setActivePlanificacionId(data.id);
                }
            }
        });
    };

    // Sobrescribe una planificación existente del paciente con los macros
    // actuales; el backend la deja como la activa del paciente.
    const handleOverwrite = (planificacionId: string) => {
        const payload = buildPayload();
        if (!payload) return;
        updatePlanificacion.mutate({ id: planificacionId, data: payload }, {
            onSuccess: () => setActivePlanificacionId(planificacionId),
        });
    };

    const handleReset = () => {
        setProtGkg(1.5);
        setChoPct(50);
        setFatPct(30);
    };

    // Balance automático: deja proteínas, carbohidratos y grasas sumando 100%
    // repartidos en los 3 grupos.
    // - Si ya hay una distribución significativa (≥2 macros con valor), se ESCALA
    //   de forma proporcional conservando las relaciones definidas.
    // - Si el estado es degenerado (todo en 0, o un solo macro con valor, p.ej.
    //   proteína al 100%), se aplica un reparto equilibrado por defecto
    //   (30% proteínas / 40% carbohidratos / 30% grasas) para que el botón
    //   siempre produzca un balance real de los 3 grupos.
    const autoBalance = () => {
        if (tmbPromedio <= 0) return;

        const total = macrosPct.prot + macrosPct.cho + macrosPct.fat;
        const conValor = [macrosPct.prot, macrosPct.cho, macrosPct.fat].filter((x) => x > 0).length;

        let newProt: number;
        let newCho: number;
        let newFat: number;

        if (total <= 0 || conValor < 2) {
            // Reparto equilibrado estándar para los 3 grupos.
            newProt = 30;
            newCho = 40;
            newFat = 30;
        } else {
            const factor = 100 / total;
            newProt = Math.round(macrosPct.prot * factor);
            newCho = Math.round(macrosPct.cho * factor);
            newFat = Math.max(0, 100 - newProt - newCho);
        }

        const protG = (newProt / 100) * tmbPromedio / 4;
        setProtGkg(pesoActivo > 0 ? protG / pesoActivo : 0);
        setChoPct(newCho);
        setFatPct(newFat);
    };

    // Balanceado = la suma de porcentajes está a ±1 de 100 (tolerancia de redondeo).
    const isBalanced = Math.abs(totals.summary.percent - 100) <= 1;

    // Solo se puede guardar con paciente activo y TMB/peso reales calculados.
    const canSave = !!activePatient?.id && tmbPromedio > 0 && pesoActivo > 0;

    return {
        context: { pesoActivo, tmbPromedio },
        inputs: { protGkg, protPct: macrosPct.prot, choPct, fatPct },
        actions: { setMacro, updateFromGrams, updateFromGramsPerKg, setProtGkg, setChoPct, setFatPct, handleReset, handleSave, handleOverwrite, autoBalance },
        totals,
        isBalanced,
        canSave,
        isSaving: createPlanificacion.isPending || updatePlanificacion.isPending
    };
};
