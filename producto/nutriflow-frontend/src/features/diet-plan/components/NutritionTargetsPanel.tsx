import { Target, RefreshCw, TriangleAlert } from 'lucide-react';

interface TargetsProps {
    targets: { kcal: number; prot: number; cho: number; fat: number };
    current: { kcal: number; prot: number; cho: number; fat: number };
    onSuggest?: () => void;
    onReset?: () => void;
}

/** % real (sin capar): >100 significa que la distribución supera la meta. */
const getPct = (curr: number, max: number) => (max > 0 ? Math.round((curr / max) * 100) : 0);

/** Barra de un macro: muestra el valor real y avisa cuando supera la meta. */
const BarraMacro = ({
    label,
    curr,
    max,
    unidad,
    barClass,
}: {
    label: string;
    curr: number;
    max: number;
    unidad: string;
    barClass: string;
}) => {
    const pct = getPct(curr, max);
    const exceso = Math.round(curr - max);
    // Se avisa cuando el exceso ya es visible tras el redondeo (>0 en la unidad mostrada).
    const pasado = pct > 100 && exceso > 0;

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-xs text-ink-soft">{label}</span>
                <span className={`text-xs font-bold ${pasado ? 'text-clinical-red' : 'text-ink'}`}>
                    {Math.round(curr)}/{Math.round(max)}{unidad}
                </span>
            </div>
            <div className="h-1.5 bg-mist/60 rounded-full">
                <div
                    className={`h-full rounded-full transition-all ${pasado ? 'bg-clinical-red' : barClass}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                ></div>
            </div>
            <p className={`text-[10px] text-right mt-1 flex items-center justify-end gap-1 ${pasado ? 'text-clinical-red font-semibold' : 'text-ink-soft/60'}`}>
                {pasado && <TriangleAlert className="w-3 h-3" aria-hidden="true" />}
                {pasado ? `${pct}% · +${exceso}${unidad} sobre la meta` : `${pct}%`}
            </p>
        </div>
    );
};

export const NutritionTargetsPanel = ({ targets, current, onSuggest, onReset }: TargetsProps) => {
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
                    <BarraMacro label="Calorías" curr={current.kcal} max={targets.kcal} unidad="" barClass="bg-macro-kcal" />
                    <BarraMacro label="Proteínas" curr={current.prot} max={targets.prot} unidad="g" barClass="bg-macro-prot" />
                    <BarraMacro label="Carbos" curr={current.cho} max={targets.cho} unidad="g" barClass="bg-macro-cho" />
                    <BarraMacro label="Grasas" curr={current.fat} max={targets.fat} unidad="g" barClass="bg-macro-gra" />
                </div>
            </div>
        </div>
    );
};
