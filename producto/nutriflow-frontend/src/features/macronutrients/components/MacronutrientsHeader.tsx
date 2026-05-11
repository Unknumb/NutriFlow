import { LockOpen } from 'lucide-react';
import type { ClinicalContext, MacronutrientTotals } from '../types';

// 🚨 CLEAN CODE: Ahora recibe todo por Props, no sabe qué es Zustand.
interface Props {
    context: ClinicalContext;
    totals: MacronutrientTotals;
    onPesoChange: (peso: number) => void;
    onTmbChange: (tmb: number) => void;
}

export const MacronutrientsHeader = ({ context, totals, onPesoChange, onTmbChange }: Props) => {
    const totalKcalCalculado = totals.prot.kcal + totals.cho.kcal + totals.fat.kcal;
    const isBalanced = totalKcalCalculado === context.tmbPromedio;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-6">
            <div className="bg-white flex flex-col gap-6 rounded-xl border border-gray-200 lg:col-span-3 shadow-sm">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-gray-700">Calorías Totales Objetivo</label>
                    <input 
                        type="number" 
                        value={context.tmbPromedio}
                        onChange={(e) => onTmbChange(Number(e.target.value))}
                        className="w-full rounded-md border border-gray-200 px-3 py-1 bg-gray-50 text-2xl font-semibold h-14 text-center outline-none focus:border-teal-500 focus:ring-2" 
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">kcal/día</p>
                </div>
            </div>

            <div className="bg-white flex flex-col gap-6 rounded-xl border border-gray-200 lg:col-span-3 shadow-sm">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-gray-700">Peso de Referencia</label>
                    <input 
                        type="number" step="0.1"
                        value={context.pesoActivo}
                        onChange={(e) => onPesoChange(Number(e.target.value))}
                        className="w-full rounded-md border border-gray-200 px-3 py-1 bg-gray-50 text-2xl font-semibold h-14 text-center outline-none focus:border-teal-500 focus:ring-2" 
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">kilogramos</p>
                </div>
            </div>

            <div className="bg-white flex flex-col gap-6 rounded-xl border border-gray-200 lg:col-span-3 shadow-sm">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-gray-700">Total Calculado</label>
                    <div className={`text-2xl font-semibold h-14 flex items-center justify-center rounded-lg border transition-colors ${isBalanced ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                        {totalKcalCalculado}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">kcal/día</p>
                </div>
            </div>

            <div className="bg-white flex flex-col gap-6 rounded-xl border border-gray-200 lg:col-span-3 shadow-sm">
                <div className="px-6 pt-6 pb-6">
                    <label className="items-center gap-2 text-sm font-medium mb-2 block text-gray-700">Balance Automático</label>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all bg-gray-900 text-white hover:bg-gray-800 w-full h-14 gap-2">
                        <LockOpen className="w-5 h-5" /> Activo
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">Auto-ajuste a 100%</p>
                </div>
            </div>
        </div>
    );
};