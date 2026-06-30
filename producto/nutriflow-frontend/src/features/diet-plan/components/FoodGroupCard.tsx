import { Minus, Plus, Pencil, Trash2, Infinity as InfinityIcon } from 'lucide-react';
import type { FoodGroupDef } from '../constants/foodGroups';

interface FoodGroupProps {
    group: FoodGroupDef;
    portions: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    /** Si el grupo está marcado como libre consumo (ad libitum). */
    esLibre: boolean;
    /** Alterna el modo libre consumo del grupo. */
    onToggleLibre: () => void;
}

export const FoodGroupCard = ({ group, portions, onIncrement, onDecrement, onEdit, onDelete, esLibre, onToggleLibre }: FoodGroupProps) => {
    const headerStyle = group.customColor ? { backgroundColor: group.customColor } : undefined;
    const borderStyle = group.customColor ? { borderColor: group.customColor } : undefined;

    return (
        <div
            className={`w-full min-w-0 rounded-card border-2 ${group.theme.bgMain} ${group.theme.border} overflow-hidden flex flex-col`}
            style={borderStyle}
        >
            {/* Encabezado de color */}
            <div className={`${group.theme.bgHeader} px-3 py-2 flex items-center justify-between`} style={headerStyle}>
                <span className="text-xs font-bold text-white leading-tight drop-shadow-sm flex-1">{group.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label={`Editar grupo ${group.title}`}
                            title="Editar grupo"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label={`Eliminar grupo ${group.title}`}
                            title="Eliminar grupo"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between bg-white/40">
                {/* Macros de referencia */}
                <div className="flex gap-1.5 text-[10px] font-semibold text-ink-soft mb-3 justify-center bg-white/60 py-1 rounded-md">
                    <span>{group.kcal}kcal</span><span className="text-ink-soft/40">|</span>
                    <span className="text-macro-prot">P:{group.macros.p}g</span><span className="text-ink-soft/40">|</span>
                    <span className="text-macro-cho">C:{group.macros.c}g</span><span className="text-ink-soft/40">|</span>
                    <span className="text-macro-gra">G:{group.macros.g}g</span>
                </div>

                {/* Contador de porciones o estado libre consumo */}
                {esLibre ? (
                    <div className="flex items-center justify-center gap-2 mb-3 h-[34px]">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pine-soft/10 text-pine-soft text-xs font-bold">
                            <InfinityIcon className="w-3.5 h-3.5" /> Libre consumo
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <button
                            onClick={onDecrement}
                            disabled={portions <= 0}
                            className="w-7 h-7 rounded-full border-2 border-mist text-ink-soft flex items-center justify-center hover:bg-white hover:text-ink hover:border-pine-soft transition-colors bg-white/50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <input
                            type="number"
                            className="w-12 text-center border-2 border-mist rounded-md text-sm font-bold py-1 bg-white outline-none shadow-inner"
                            value={portions}
                            readOnly
                        />
                        <button
                            onClick={onIncrement}
                            className="w-7 h-7 rounded-full border-2 border-mist text-ink-soft flex items-center justify-center hover:bg-white hover:text-ink hover:border-pine-soft transition-colors bg-white/50 shadow-sm"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Toggle de libre consumo, estilizado dentro del recuadro */}
                <button
                    onClick={onToggleLibre}
                    className={`mt-auto w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition-colors ${
                        esLibre
                            ? 'bg-pine-soft/10 border-pine-soft/40 text-pine-soft'
                            : 'bg-white/60 border-mist text-ink-soft hover:border-pine-soft hover:text-pine-soft'
                    }`}
                    title="Marcar este grupo como libre consumo (ad libitum)"
                >
                    <span>Libre consumo</span>
                    <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${esLibre ? 'bg-pine-soft' : 'bg-mist'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${esLibre ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </span>
                </button>
            </div>
        </div>
    );
};
