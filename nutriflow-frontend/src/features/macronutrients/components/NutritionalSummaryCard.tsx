import { Zap } from 'lucide-react';

export const NutritionalSummaryCard = ({ totals, tmbPromedio }: any) => {
    return (
        <div className="flex flex-col gap-6 rounded-xl border bg-linear-to-br from-teal-50 to-blue-50 border-teal-200 shadow-sm">
            <div className="px-6 pt-6 border-b border-teal-100 pb-4">
                <h4 className="leading-none flex items-center gap-2 font-semibold text-teal-900">
                    <Zap className="w-5 h-5" />
                    Resumen Nutricional
                </h4>
            </div>
            <div className="px-6 pb-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-teal-50">
                    <span className="text-sm font-medium text-gray-700">Total Calorías</span>
                    <span className="text-lg font-bold text-teal-700">{tmbPromedio} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-red-50">
                    <span className="text-sm font-medium text-gray-700">Proteínas Totales</span>
                    <span className="text-lg font-bold text-red-600">{totals.prot.g}g</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-blue-50">
                    <span className="text-sm font-medium text-gray-700">Carbohidratos Totales</span>
                    <span className="text-lg font-bold text-blue-600">{totals.cho.g}g</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-amber-50">
                    <span className="text-sm font-medium text-gray-700">Grasas Totales</span>
                    <span className="text-lg font-bold text-amber-600">{totals.fat.g}g</span>
                </div>
            </div>
        </div>
    );
};