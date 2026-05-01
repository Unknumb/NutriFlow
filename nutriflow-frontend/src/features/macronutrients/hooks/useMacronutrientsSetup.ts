import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { saveMacronutrients } from '../api/macronutrientsApi';

export const useMacronutrientsSetup = () => {
    // 1. Estado Global (Zustand)
    const pesoActivo = useClinicalStore((state) => state.pesoActivo);
    const tmbPromedio = useClinicalStore((state) => state.tmbPromedio);

    // 2. Estado Local (Lo que el usuario edita antes de guardar)
    const [protGkg, setProtGkg] = useState(2.0);
    const [choPct, setChoPct] = useState(45);
    const [fatPct, setFatPct] = useState(27);

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
        const totalPercent = Math.round(protPct) + choPct + fatPct;

        return {
            prot: { g: Math.round(protG), kcal: Math.round(protKcal), pct: Math.round(protPct) },
            cho: { g: Math.round(choG), kcal: Math.round(choKcal), pct: choPct },
            fat: { g: Math.round(fatG), kcal: Math.round(fatKcal), pct: fatPct },
            summary: { grams: Math.round(totalGrams), percent: totalPercent }
        };
    }, [protGkg, choPct, fatPct, pesoActivo, tmbPromedio]);

    // 4. Mutación de TanStack Query (Para Guardar)
    const saveMutation = useMutation({
        mutationFn: saveMacronutrients,
        onSuccess: () => {
            // Aquí podrías lanzar un Toast de éxito (ej. react-hot-toast)
            alert("¡Distribución guardada con éxito!");
        }
    });

    const handleReset = () => {
        setProtGkg(1.5);
        setChoPct(50);
        setFatPct(30);
    };

    return {
        context: { pesoActivo, tmbPromedio },
        inputs: { protGkg, choPct, fatPct },
        actions: { setProtGkg, setChoPct, setFatPct, handleReset },
        totals,
        saveMutation
    };
};