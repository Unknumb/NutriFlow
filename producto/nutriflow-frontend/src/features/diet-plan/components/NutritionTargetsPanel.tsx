import { Target, RefreshCw } from 'lucide-react';

interface TargetsProps {
    targets: { kcal: number; prot: number; cho: number; fat: number };
    current: { kcal: number; prot: number; cho: number; fat: number };
    onSuggest?: () => void;
    onReset?: () => void;
}

export const NutritionTargetsPanel = ({ targets, current, onSuggest, onReset }: TargetsProps) => {
    // Calculamos porcentajes para las barras
    const getPct = (curr: number, max: number) => Math.min(Math.round((curr / max) * 100) || 0, 100);
    
    const pctKcal = getPct(current.kcal, targets.kcal);
    const pctProt = getPct(current.prot, targets.prot);
    const pctCho = getPct(current.cho, targets.cho);
    const pctFat = getPct(current.fat, targets.fat);

    return (
        <div className="col-span-3 space-y-4">
            {/* TARJETA 1: Inputs de Objetivos */}
            <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm sticky top-4">
                <div className="px-6 pt-6 border-b border-gray-50 pb-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <Target className="w-4 h-4 text-teal-600" /> Objetivos Nutricionales
                    </h4>
                </div>
                <div className="px-6 pb-6 space-y-3">
                    <div><label className="text-xs font-medium text-gray-700">Calorías (kcal)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" value={targets.kcal} readOnly /></div>
                    <div><label className="text-xs font-medium text-gray-700">Proteínas (g)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" value={targets.prot} readOnly /></div>
                    <div><label className="text-xs font-medium text-gray-700">Carbohidratos (g)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" value={targets.cho} readOnly /></div>
                    <div><label className="text-xs font-medium text-gray-700">Grasas (g)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" value={targets.fat} readOnly /></div>
                    
                    <div className="h-px w-full bg-gray-200 my-2"></div>
                    
                    <button onClick={onSuggest} className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 h-8 text-xs font-medium rounded-md transition-colors shadow-sm">
                        <RefreshCw className="w-3 h-3" /> Sugerir Distribución
                    </button>
                    <button onClick={onReset} className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 flex items-center justify-center gap-2 h-8 text-xs font-medium rounded-md transition-colors">
                        Resetear
                    </button>
                </div>
            </div>

            {/* TARJETA 2: Barras de Progreso */}
            <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 pt-6 border-b border-gray-50 pb-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Totales vs Objetivo</h4>
                </div>
                <div className="px-6 pb-6 space-y-4">
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-600">Calorías</span><span className="text-xs font-bold text-gray-800">{current.kcal}/{targets.kcal}</span></div>
                        <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pctKcal}%` }}></div></div>
                        <p className="text-[10px] text-gray-400 text-right mt-1">{pctKcal}%</p>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-600">Proteínas</span><span className="text-xs font-bold text-gray-800">{current.prot}/{targets.prot}g</span></div>
                        <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${pctProt}%` }}></div></div>
                        <p className="text-[10px] text-gray-400 text-right mt-1">{pctProt}%</p>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-600">Carbos</span><span className="text-xs font-bold text-gray-800">{current.cho}/{targets.cho}g</span></div>
                        <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pctCho}%` }}></div></div>
                        <p className="text-[10px] text-gray-400 text-right mt-1">{pctCho}%</p>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-600">Grasas</span><span className="text-xs font-bold text-gray-800">{current.fat}/{targets.fat}g</span></div>
                        <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pctFat}%` }}></div></div>
                        <p className="text-[10px] text-gray-400 text-right mt-1">{pctFat}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};