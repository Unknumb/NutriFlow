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
            <div className="bg-white rounded-card border border-mist shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-pine-soft" />
                    <h3 className="text-lg font-bold text-ink">Progreso de la Pauta</h3>
                </div>

                <div className="space-y-6">
                    {/* Calorías Totales */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-ink-soft">Calorías Totales</span>
                            <span className="font-bold text-ink">{currentTotals.kcal} / {targetContext.tmbPromedio}</span>
                        </div>
                        <div className="h-2.5 w-full bg-mist/60 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${kcalPercentage > 100 ? 'bg-clinical-red' : 'bg-pine-soft'}`}
                                style={{ width: `${kcalPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Desglose de Macros (Miniaturas) */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-mist/70">
                        <div className="bg-macro-prot/10 p-3 rounded-md border border-macro-prot/20">
                            <p className="text-xs text-macro-prot font-medium mb-1">Proteínas</p>
                            <p className="text-lg font-bold text-macro-prot tnum">{currentTotals.prot}g</p>
                        </div>
                        <div className="bg-macro-cho/10 p-3 rounded-md border border-macro-cho/20">
                            <p className="text-xs text-macro-cho font-medium mb-1">Carbohidratos</p>
                            <p className="text-lg font-bold text-macro-cho tnum">{currentTotals.cho}g</p>
                        </div>
                        <div className="bg-macro-gra/10 p-3 rounded-md border border-macro-gra/20">
                            <p className="text-xs text-macro-gra font-medium mb-1">Grasas</p>
                            <p className="text-lg font-bold text-macro-gra tnum">{currentTotals.fat}g</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones Finales */}
            <div className="flex flex-col gap-3">
                <button className="w-full bg-white border border-mist text-ink-soft font-semibold py-3 rounded-card hover:bg-porcelain transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <FileText className="w-4 h-4" /> Generar PDF
                </button>
                <button className="w-full bg-pine text-white font-semibold py-3 rounded-card hover:bg-pine-soft transition-colors flex items-center justify-center gap-2 shadow-sm shadow-card">
                    <Save className="w-4 h-4" /> Guardar Pauta
                </button>
            </div>
        </div>
    );
};