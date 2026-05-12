import { Minus, Plus, Leaf } from 'lucide-react';
import type { FoodGroupDef } from '../constants/foodGroups';

interface FoodGroupProps {
    group: FoodGroupDef;
    portions: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

export const FoodGroupCard = ({ group, portions, onIncrement, onDecrement }: FoodGroupProps) => {
    if (group.isFree) {
        return (
            <div className={`rounded-xl border-2 ${group.theme.bgMain} ${group.theme.border} p-3 flex flex-col justify-between h-full`}>
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
        <div className={`rounded-xl border-2 ${group.theme.bgMain} ${group.theme.border} overflow-hidden flex flex-col`}>
            <div className={`${group.theme.bgHeader} px-3 py-2 flex items-center justify-between`}>
                <span className="text-xs font-bold text-white leading-tight drop-shadow-sm">{group.title}</span>
            </div>
            
            <div className="p-3 flex-1 flex flex-col justify-between bg-white/40">
                <div className="flex gap-1.5 text-[10px] font-semibold text-gray-700 mb-3 justify-center bg-white/60 py-1 rounded-md">
                    <span>{group.kcal}kcal</span><span className="text-gray-300">|</span>
                    <span className="text-red-600">P:{group.macros.p}g</span><span className="text-gray-300">|</span>
                    <span className="text-blue-600">C:{group.macros.c}g</span><span className="text-gray-300">|</span>
                    <span className="text-amber-600">G:{group.macros.g}g</span>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                    <button 
                        onClick={onDecrement}
                        disabled={portions <= 0}
                        className="w-7 h-7 rounded-full border-2 border-gray-400 text-gray-500 flex items-center justify-center hover:bg-white hover:text-gray-900 hover:border-gray-600 transition-colors bg-white/50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <input 
                        type="number" 
                        className="w-12 text-center border-2 border-gray-200 rounded-md text-sm font-bold py-1 bg-white outline-none shadow-inner" 
                        value={portions} 
                        readOnly
                    />
                    <button 
                        onClick={onIncrement}
                        className="w-7 h-7 rounded-full border-2 border-gray-400 text-gray-500 flex items-center justify-center hover:bg-white hover:text-gray-900 hover:border-gray-600 transition-colors bg-white/50 shadow-sm"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
                
                <div className="flex justify-between items-end mt-auto">
                    <span className="text-[10px] font-bold text-gray-500">porciones</span>
                    <button className="text-[10px] font-bold text-gray-500 hover:text-gray-800 underline transition-colors">
                        Ver ejemplos
                    </button>
                </div>
            </div>
        </div>
    );
};