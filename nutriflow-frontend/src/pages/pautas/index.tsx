import { Plus } from 'lucide-react';
import { DashboardLayout } from '../../shared/ui/organisms/DashboardLayout';
import { NutritionTargetsPanel } from '../../features/diet-plan/components/NutritionTargetsPanel';
import { FoodGroupCard } from '../../features/diet-plan/components/FoodGroupCard';
import { useDietPlanBuilder } from '../../features/diet-plan/hooks/useDietPlanBuilder';
import { FOOD_GROUPS } from '../../features/diet-plan/constants/foodGroups';

export const PautasPage = () => {
    // Instanciamos el Cerebro (Custom Hook)
    const { 
        portions, 
        targets, 
        currentTotals, 
        actions 
    } = useDietPlanBuilder({ 
        pesoActivo: 70, tmbPromedio: 1800, kcal: 1800, prot: 90, cho: 225, fat: 50 
    });

    return (
        <DashboardLayout>
            <div className="p-2 max-w-[1400px] mx-auto">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Armador de Pautas Alimentarias</h1>
                        <p className="text-gray-500 mt-1 font-medium">13 grupos de alimentos · Sistema de intercambio por porciones</p>
                    </div>
                    <button className="inline-flex items-center gap-2 bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Añadir alimento personalizado
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* PANEL IZQUIERDO */}
                    <NutritionTargetsPanel 
                        targets={targets} 
                        current={currentTotals} 
                    />

                    {/* PANEL DERECHO (Renderizado Dinámico) */}
                    <div className="col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {FOOD_GROUPS.map((group) => (
                                <FoodGroupCard 
                                    key={group.id}
                                    group={group}
                                    portions={portions[group.id] || 0}
                                    onIncrement={() => actions.incrementPortion(group.id)}
                                    onDecrement={() => actions.decrementPortion(group.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};