import { useMemo } from 'react';
import { usePlanificaciones } from './usePlanificaciones';
import { Planificacion } from '../api/planificacionesApi';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';

export interface ObjetivosNutricionales {
    kcal: number;
    prot_g: number;
    cho_g: number;
    fat_g: number;
    prot_pct: number;
    cho_pct: number;
    fat_pct: number;
}

/**
 * Fuente única de verdad de los objetivos nutricionales del paciente activo.
 * Deriva kcal + gramos de macros desde la planificación ACTIVA persistida
 * (la misma que se guarda en la pantalla de Macronutrientes), de modo que
 * Distribución de Porciones y el PDF muestren exactamente los mismos objetivos.
 *
 * Devuelve `{ objetivos, planificacionActiva }`. Si el paciente aún no tiene
 * planificación guardada, `objetivos` es null (el consumidor decide el fallback).
 */
export const useObjetivosActivos = () => {
    const activePatient = useClinicalStore((s) => s.activePatient);
    const activePlanificacionId = useClinicalStore((s) => s.activePlanificacionId);
    const { data: planificaciones, isLoading } = usePlanificaciones();

    const planificacionActiva = useMemo<Planificacion | null>(() => {
        if (!activePatient?.id) return null;
        const delPaciente = (planificaciones || []).filter((p) => p.paciente_id === activePatient.id);
        if (delPaciente.length === 0) return null;
        // Prioridad: id elegido en el store (feedback inmediato al cambiar) → flag
        // `activa` en DB → la más reciente. El id del store gana porque el flag de
        // DB tarda un refetch en actualizarse.
        return (
            delPaciente.find((p) => p.id === activePlanificacionId) ||
            delPaciente.find((p) => p.activa) ||
            delPaciente[0]
        );
    }, [planificaciones, activePatient?.id, activePlanificacionId]);

    const objetivos = useMemo<ObjetivosNutricionales | null>(() => {
        if (!planificacionActiva) return null;
        const kcal = planificacionActiva.calorias_totales || 0;
        const macros = planificacionActiva.distribucion_macros || {};
        const protPct = Number(macros.proteina) || 0;
        const choPct = Number(macros.carbohidratos) || 0;
        const fatPct = Number(macros.grasa) || 0;

        return {
            kcal: Math.round(kcal),
            prot_g: Math.round((kcal * protPct) / 100 / 4),
            cho_g: Math.round((kcal * choPct) / 100 / 4),
            fat_g: Math.round((kcal * fatPct) / 100 / 9),
            prot_pct: Math.round(protPct),
            cho_pct: Math.round(choPct),
            fat_pct: Math.round(fatPct),
        };
    }, [planificacionActiva]);

    return { objetivos, planificacionActiva, isLoading };
};
