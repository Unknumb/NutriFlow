import { Minus, Plus, Leaf, Trash2 } from 'lucide-react';
import type { FoodGroupDef } from '../constants/foodGroups';

interface FoodGroupProps {
    group: FoodGroupDef;
    portions: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onDelete?: () => void;
}

export const FoodGroupCard = ({ group, portions, onIncrement, onDecrement, onDelete }: FoodGroupProps) => {
    if (group.isFree) {
        return (
            <div className={`rounded-card border-2 ${group.theme.bgMain} ${group.theme.border} p-3 flex flex-col justify-between h-full`}>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Leaf className={`w-4 h-4 ${group.theme.text}`} />
                        <span className={`text-xs font-bold ${group.theme.text} leading-tight`}>{group.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${group.theme.text} bg-white/60 px-2 py-0.5 rounded-full`}>Libre consumo</span>
                </div>
                <button className={`mt-3 text-[10px] font-semibold ${group.theme.text} underline text-left hover:opacity-70 transition-opacity`}>
                    Ver ejemplos
                </button>
            </div>
        );
    }

    return (
        <div 
            className={`rounded-card border-2 ${group.theme.bgMain} ${group.theme.border} overflow-hidden flex flex-col`}
            style={group.customColor ? { borderColor: group.customColor, backgroundColor: group.customColor + '1A' } : undefined}
        >
            <div 
                className={`${group.theme.bgHeader} px-3 py-2 flex items-center justify-between`}
                style={group.customColor ? { backgroundColor: group.customColor } : undefined}
            >
                <span className="text-xs font-bold text-white leading-tight drop-shadow-sm flex-1">{group.title}</span>
                {onDelete && (
                    <button 
                        onClick={onDelete}
                        className="text-white/80 hover:text-white transition-colors"
                        title="Eliminar alimento"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
            
            <div className="p-3 flex-1 flex flex-col justify-between bg-white/40">
                <div className="flex gap-1.5 text-[10px] font-semibold text-ink-soft mb-3 justify-center bg-white/60 py-1 rounded-md">
                    <span>{group.kcal}kcal</span><span className="text-ink-soft/40">|</span>
                    <span className="text-macro-prot">P:{group.macros.p}g</span><span className="text-ink-soft/40">|</span>
                    <span className="text-macro-cho">C:{group.macros.c}g</span><span className="text-ink-soft/40">|</span>
                    <span className="text-macro-gra">G:{group.macros.g}g</span>
                </div>
                
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
                
                <div className="flex justify-between items-end mt-auto">
                    <span className="text-[10px] font-bold text-ink-soft">porciones</span>
                    <button className="text-[10px] font-bold text-ink-soft hover:text-ink underline transition-colors">
                        Ver ejemplos
                    </button>
                </div>
            </div>
        </div>
    );
};