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
        <div className="col-span-full lg:col-span-3 space-y-4">
            {/* TARJETA 1: Inputs de Objetivos */}
            <div className="bg-white text-ink flex flex-col gap-6 rounded-card border border-mist shadow-sm sticky top-4">
                <div className="px-6 pt-6 border-b border-mist/50 pb-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
                        <Target className="w-4 h-4 text-pine-soft" /> Objetivos Nutricionales
                    </h4>
                </div>
                <div className="px-6 pb-6 space-y-3">
                    <div><label className="text-xs font-medium text-ink-soft">Calorías (kcal)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-mist rounded-md bg-porcelain focus:ring-2 focus:ring-pine-soft outline-none" value={targets.kcal} readOnly /></div>
                    <div><label className="text-xs font-medium text-ink-soft">Proteínas (g)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-mist rounded-md bg-porcelain focus:ring-2 focus:ring-pine-soft outline-none" value={targets.prot} readOnly /></div>
                    <div><label className="text-xs font-medium text-ink-soft">Carbohidratos (g)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-mist rounded-md bg-porcelain focus:ring-2 focus:ring-pine-soft outline-none" value={targets.cho} readOnly /></div>
                    <div><label className="text-xs font-medium text-ink-soft">Grasas (g)</label><input type="number" className="w-full mt-1 h-8 px-3 text-sm border border-mist rounded-md bg-porcelain focus:ring-2 focus:ring-pine-soft outline-none" value={targets.fat} readOnly /></div>
                    
                    <div className="h-px w-full bg-mist my-2"></div>
                    
                    <button onClick={onSuggest} className="w-full bg-pine hover:bg-pine-soft text-white flex items-center justify-center gap-2 h-8 text-xs font-medium rounded-md transition-colors shadow-sm">
                        <RefreshCw className="w-3 h-3" /> Sugerir Distribución
                    </button>
                    <button onClick={onReset} className="w-full bg-white hover:bg-porcelain text-ink-soft border border-mist flex items-center justify-center gap-2 h-8 text-xs font-medium rounded-md transition-colors">
                        Resetear
                    </button>
                </div>
            </div>

            {/* TARJETA 2: Barras de Progreso */}
            <div className="bg-white text-ink flex flex-col gap-6 rounded-card border border-mist shadow-sm">
                <div className="px-6 pt-6 border-b border-mist/50 pb-2">
                    <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider">Totales vs Objetivo</h4>
                </div>
                <div className="px-6 pb-6 space-y-4">
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-ink-soft">Calorías</span><span className="text-xs font-bold text-ink">{Math.round(Math.min(current.kcal, targets.kcal))}/{Math.round(targets.kcal)}</span></div>
                        <div className="h-1.5 bg-mist/60 rounded-full"><div className="h-full bg-macro-kcal rounded-full transition-all" style={{ width: `${pctKcal}%` }}></div></div>
                        <p className="text-[10px] text-ink-soft/60 text-right mt-1">{pctKcal}%</p>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-ink-soft">Proteínas</span><span className="text-xs font-bold text-ink">{Math.round(Math.min(current.prot, targets.prot))}/{Math.round(targets.prot)}g</span></div>
                        <div className="h-1.5 bg-mist/60 rounded-full"><div className="h-full bg-macro-prot rounded-full transition-all" style={{ width: `${pctProt}%` }}></div></div>
                        <p className="text-[10px] text-ink-soft/60 text-right mt-1">{pctProt}%</p>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-ink-soft">Carbos</span><span className="text-xs font-bold text-ink">{Math.round(Math.min(current.cho, targets.cho))}/{Math.round(targets.cho)}g</span></div>
                        <div className="h-1.5 bg-mist/60 rounded-full"><div className="h-full bg-macro-cho rounded-full transition-all" style={{ width: `${pctCho}%` }}></div></div>
                        <p className="text-[10px] text-ink-soft/60 text-right mt-1">{pctCho}%</p>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-ink-soft">Grasas</span><span className="text-xs font-bold text-ink">{Math.round(Math.min(current.fat, targets.fat))}/{Math.round(targets.fat)}g</span></div>
                        <div className="h-1.5 bg-mist/60 rounded-full"><div className="h-full bg-macro-gra rounded-full transition-all" style={{ width: `${pctFat}%` }}></div></div>
                        <p className="text-[10px] text-ink-soft/60 text-right mt-1">{pctFat}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};