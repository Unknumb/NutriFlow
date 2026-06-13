import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useBuscarAlimentos } from '../../alimentos/hooks/useBuscarAlimentos';

export interface FoodGroupOption {
    id: string;
    title: string;
    subtitle?: string;
    emoji: string;
    /** Color del encabezado (hex; ver paleta de grupos en REDISENO.md). */
    headerColor: string;
    /** Categoría real de la tabla `alimentos` (null si el grupo no tiene catálogo). */
    categoria: string | null;
    fixedTargetLabel?: string;
}

interface GroupOptionCardProps {
    group: FoodGroupOption;
    targetValue: number;
    currentValue: number;
}

const COLAPSADO = 5;

export const GroupOptionCard = ({ group, targetValue, currentValue }: GroupOptionCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayTarget = group.fixedTargetLabel || `${currentValue}/${targetValue} asignado`;

    // Traemos alimentos reales de la categoría (insensible a acentos, hasta 40).
    const { data, isLoading } = useBuscarAlimentos({
        search: '',
        categoria: group.categoria,
        enabled: !!group.categoria,
        limit: 40,
    });

    const alimentos = data?.items ?? [];
    const total = data?.total ?? 0;
    const visibles = isExpanded ? alimentos : alimentos.slice(0, COLAPSADO);
    const restantes = total - visibles.length;

    return (
        <div className="bg-white rounded-card border border-mist overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: group.headerColor }}>
                <span className="text-2xl">{group.emoji}</span>
                <div className="flex-1">
                    <p className="font-bold text-sm text-white">{group.title}</p>
                    {group.subtitle && <p className="text-xs text-white opacity-80">{group.subtitle}</p>}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-white/25 text-white font-bold tnum">
                    {displayTarget}
                </span>
            </div>

            <div className="p-4">
                {!group.categoria ? (
                    <p className="text-sm text-ink-soft/70 italic">Sin equivalencias en el catálogo.</p>
                ) : isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-ink-soft py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando alimentos...
                    </div>
                ) : alimentos.length === 0 ? (
                    <p className="text-sm text-ink-soft/70 italic">No hay alimentos registrados en este grupo.</p>
                ) : (
                    <>
                        <ul className="space-y-1.5">
                            {visibles.map((a) => (
                                <li key={a.id} className="flex items-start justify-between gap-2 text-sm">
                                    <span className="flex items-start gap-2 text-ink-soft min-w-0">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mist shrink-0"></span>
                                        <span className="truncate">
                                            {a.nombre}
                                            {a.marca && <span className="text-ink-soft/60"> · {a.marca}</span>}
                                        </span>
                                    </span>
                                    <span className="text-xs text-ink-soft/70 tnum shrink-0">{Math.round(a.calorias_100g)} kcal/100g</span>
                                </li>
                            ))}
                        </ul>
                        {restantes > 0 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-3 flex items-center gap-1 text-xs text-pine-soft hover:text-pine font-medium"
                            >
                                {isExpanded ? (
                                    <><ChevronUp className="w-3.5 h-3.5" /> Ocultar</>
                                ) : (
                                    <><ChevronDown className="w-3.5 h-3.5" /> Ver {restantes} alimentos más</>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
