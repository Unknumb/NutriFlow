import { Layers, Loader2 } from 'lucide-react';
import { usePlanificaciones, useSetActivaPlanificacion } from '../hooks/usePlanificaciones';
import { useObjetivosActivos } from '../hooks/useObjetivosActivos';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';

/**
 * Selector de la planificación de macros con la que se está trabajando.
 * Cambiarla la marca como activa (en DB y en el store), y es la planificación
 * donde se guardarán las pautas. Se usa en el Armador de Pautas y en
 * Distribución de Porciones para que la nutricionista sepa siempre el contexto.
 */
export const PlanificacionSelector = () => {
    const activePatient = useClinicalStore((s) => s.activePatient);
    const setActivePlanificacionId = useClinicalStore((s) => s.setActivePlanificacionId);
    const { data: planificaciones, isLoading } = usePlanificaciones();
    const { planificacionActiva } = useObjetivosActivos();
    const setActiva = useSetActivaPlanificacion();

    const delPaciente = (planificaciones || []).filter((p) => p.paciente_id === activePatient?.id);

    if (!activePatient?.id) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <Layers className="h-3.5 w-3.5" /> Selecciona un paciente activo
            </span>
        );
    }

    if (isLoading) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando planificaciones…
            </span>
        );
    }

    if (delPaciente.length === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-apricot/40 bg-apricot/10 px-3 py-1.5 text-xs font-medium text-[#8a5a2a]">
                <Layers className="h-3.5 w-3.5" /> Sin planificación — créala en Macronutrientes
            </span>
        );
    }

    const handleChange = (id: string) => {
        if (id === planificacionActiva?.id) return;
        setActivePlanificacionId(id);
        setActiva.mutate(id);
    };

    return (
        <div className="inline-flex items-center gap-2 max-w-full">
            <Layers className="h-4 w-4 shrink-0 text-pine-soft" />
            <label htmlFor="planif-selector" className="text-xs font-medium text-ink-soft shrink-0 whitespace-nowrap">
                Planificación:
            </label>
            <select
                id="planif-selector"
                value={planificacionActiva?.id || ''}
                onChange={(e) => handleChange(e.target.value)}
                disabled={setActiva.isPending}
                className="max-w-45 sm:max-w-65 rounded-lg border border-mist bg-white pl-3 pr-8 py-1.5 text-xs font-medium text-ink outline-none focus:border-pine-soft disabled:opacity-60 truncate"
            >
                {delPaciente.map((p) => (
                    <option key={p.id} value={p.id}>
                        {(p.nombre || 'Planificación') + ' · ' + Math.round(p.calorias_totales) + ' kcal'}
                    </option>
                ))}
            </select>
            {setActiva.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-soft shrink-0" />}
        </div>
    );
};
