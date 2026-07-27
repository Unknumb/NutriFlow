import { LockOpen, Check } from 'lucide-react';
import type { ClinicalContext, MacronutrientTotals } from '../types';

// 🚨 CLEAN CODE: Ahora recibe todo por Props, no sabe qué es Zustand.
interface Props {
    context: ClinicalContext;
    totals: MacronutrientTotals;
    isBalanced: boolean;
    onPesoChange: (peso: number) => void;
    onTmbChange: (tmb: number) => void;
    onAutoBalance: () => void;
}

export const MacronutrientsHeader = ({ context, totals, isBalanced, onPesoChange, onTmbChange, onAutoBalance }: Props) => {
    const totalKcalCalculado = totals.prot.kcal + totals.cho.kcal + totals.fat.kcal;

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
            <div className="bg-white flex flex-col gap-6 rounded-card border border-mist lg:col-span-3 shadow-card">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-ink-soft">Calorías Totales Objetivo</label>
                    <input 
                        type="number" 
                        value={context.tmbPromedio}
                        onChange={(e) => onTmbChange(Number(e.target.value))}
                        className="cifra-data w-full rounded-md border border-mist px-3 py-1 bg-porcelain text-2xl font-medium h-14 text-center outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft text-ink" 
                    />
                    <p className="text-xs text-ink-soft mt-2 text-center">kcal/día</p>
                </div>
            </div>

            <div className="bg-white flex flex-col gap-6 rounded-card border border-mist lg:col-span-3 shadow-card">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-ink-soft">Peso de Referencia</label>
                    <input 
                        type="number" step="0.1"
                        value={context.pesoActivo}
                        onChange={(e) => onPesoChange(Number(e.target.value))}
                        className="cifra-data w-full rounded-md border border-mist px-3 py-1 bg-porcelain text-2xl font-medium h-14 text-center outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft text-ink" 
                    />
                    <p className="text-xs text-ink-soft mt-2 text-center">kilogramos</p>
                </div>
            </div>

            <div className="bg-white flex flex-col gap-6 rounded-card border border-mist lg:col-span-3 shadow-card">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-ink-soft">Total Calculado</label>
                    <div className={`cifra-data text-2xl font-medium h-14 flex items-center justify-center rounded-lg border transition-colors ${isBalanced ? 'bg-pine-soft/5 border-pine-soft/40 text-pine-soft' : 'bg-apricot/10 border-apricot/50 text-[#8a5a2a]'}`}>
                        {totalKcalCalculado}
                    </div>
                    {/* Indicador explícito de si la distribución suma 100% */}
                    <p className={`text-xs mt-2 text-center font-medium ${isBalanced ? 'text-pine-soft' : 'text-[#8a5a2a]'}`}>
                        {isBalanced
                            ? `Distribución cuadrada · ${totals.summary.percent}%`
                            : `Suma ${totals.summary.percent}% · falta cuadrar a 100%`}
                    </p>
                </div>
            </div>

            <div className="bg-white flex flex-col gap-6 rounded-card border border-mist lg:col-span-3 shadow-card">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-ink-soft">Balance Automático</label>
                    {/* Se desactiva ("Cuadrado") cuando la distribución ya suma 100%; al
                        mover los sliders manualmente vuelve a activarse para re-cuadrar. */}
                    <button
                        onClick={onAutoBalance}
                        disabled={isBalanced || context.tmbPromedio <= 0}
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-all w-full h-14 gap-2 disabled:cursor-not-allowed ${isBalanced ? 'bg-pine-soft/10 border border-pine-soft/40 text-pine-soft' : 'bg-pine text-porcelain hover:bg-pine-soft'}`}
                    >
                        {isBalanced ? <><Check className="w-5 h-5" /> Cuadrado</> : <><LockOpen className="w-5 h-5" /> Cuadrar a 100%</>}
                    </button>
                    <p className="text-xs text-ink-soft mt-2 text-center">Reparte proteínas, carbohidratos y grasas para sumar 100%</p>
                </div>
            </div>
        </div>
    );
};