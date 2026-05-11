import { FileText, Save, PieChart } from 'lucide-react';
import type { DietPlanTotals } from '../types';
import type { ClinicalContext } from '../../macronutrients/types';

interface SummaryProps {
    currentTotals: DietPlanTotals;
    targetContext: ClinicalContext;
}

export const DietPlanSummary = ({ currentTotals, targetContext }: SummaryProps) => {
    // Calculamos el progreso visual
    const kcalPercentage = Math.min((currentTotals.kcal / targetContext.tmbPromedio) * 100, 100);

    return (
        <div className="flex flex-col gap-6 sticky top-6">
            
            {/* Tarjeta de Progreso */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-bold text-gray-900">Progreso de la Pauta</h3>
                </div>

                <div className="space-y-6">
                    {/* Calorías Totales */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Calorías Totales</span>
                            <span className="font-bold text-gray-900">{currentTotals.kcal} / {targetContext.tmbPromedio}</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${kcalPercentage > 100 ? 'bg-red-500' : 'bg-teal-500'}`}
                                style={{ width: `${kcalPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Desglose de Macros (Miniaturas) */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-medium mb-1">Proteínas</p>
                            <p className="text-lg font-bold text-red-700">{currentTotals.prot}g</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium mb-1">Carbs</p>
                            <p className="text-lg font-bold text-blue-700">{currentTotals.cho}g</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <p className="text-xs text-amber-600 font-medium mb-1">Grasas</p>
                            <p className="text-lg font-bold text-amber-700">{currentTotals.fat}g</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones Finales */}
            <div className="flex flex-col gap-3">
                <button className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <FileText className="w-4 h-4" /> Generar PDF
                </button>
                <button className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20">
                    <Save className="w-4 h-4" /> Guardar Pauta
                </button>
            </div>
        </div>
    );
};