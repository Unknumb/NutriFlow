import { Plus, X } from 'lucide-react';

import { useState } from 'react';
import { NutritionTargetsPanel } from '../../features/diet-plan/components/NutritionTargetsPanel';
import { FoodGroupCard } from '../../features/diet-plan/components/FoodGroupCard';
import { useDietPlanBuilder } from '../../features/diet-plan/hooks/useDietPlanBuilder';
import { FOOD_GROUPS } from '../../features/diet-plan/constants/foodGroups';
import { useMacronutrientsSetup } from '../../features/macronutrients/hooks/useMacronutrientsSetup';
import { useClinicalStore } from '../../shared/store/useClinicalStore';
import { usePortionsStore } from '../../features/porciones/store/usePortionsStore';

// THEMES removed

export const PautasPage = () => {
    // Obtenemos los valores desde el setup de macronutrientes (y context global del paciente)
    const { context, totals } = useMacronutrientsSetup();
    useClinicalStore();
    const { customFoods, addCustomFood, removeCustomFood } = usePortionsStore();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Instanciamos el Cerebro (Custom Hook)
    const { 
        portions, 
        targets, 
        currentTotals, 
        actions 
    } = useDietPlanBuilder({ 
        pesoActivo: context.pesoActivo, 
        tmbPromedio: context.tmbPromedio, 
        kcal: totals.summary.percent === 100 ? totals.prot.kcal + totals.cho.kcal + totals.fat.kcal : context.tmbPromedio, 
        prot: totals.prot.g, 
        cho: totals.cho.g, 
        fat: totals.fat.g 
    });


    const handleAddCustomFood = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const title = formData.get('title') as string;
        const kcal = Number(formData.get('kcal'));
        const p = Number(formData.get('p'));
        const c = Number(formData.get('c'));
        const g = Number(formData.get('g'));
        const customColor = formData.get('color') as string;
        
        addCustomFood({
            id: 'custom-' + Date.now(),
            title,
            kcal,
            macros: { p, c, g },
            theme: { bgMain: 'bg-white', bgHeader: '', border: '', text: '' },
            emoji: '🍽️',
            label: title.substring(0, 10),
            headerBg: '',
            targetBg: '',
            cellBg: 'bg-white',
            textBtn: 'text-gray-900',
            customColor
        });
        setIsAddModalOpen(false);
    };

    const ALL_GROUPS = [...FOOD_GROUPS, ...customFoods];

    return (
        <div className="p-4 max-w-[1400px] mx-auto w-full">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Armador de Pautas Alimentarias</h1>
                    <p className="text-gray-500 mt-1 font-medium">13 grupos de alimentos · Sistema de intercambio por porciones</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Añadir alimento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* PANEL IZQUIERDO */}
                <NutritionTargetsPanel 
                    targets={targets} 
                    current={currentTotals} 
                    onSuggest={actions.suggestDistribution}
                    onReset={actions.resetPlan}
                />

                {/* PANEL DERECHO (Renderizado Dinámico) */}
                <div className="col-span-9">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ALL_GROUPS.map((group) => (
                            <FoodGroupCard 
                                key={group.id}
                                group={group}
                                portions={portions[group.id] || 0}
                                onIncrement={() => actions.incrementPortion(group.id)}
                                onDecrement={() => actions.decrementPortion(group.id)}
                                onDelete={group.id.startsWith('custom-') ? () => removeCustomFood(group.id) : undefined}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL AÑADIR ALIMENTO */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Añadir Alimento Personalizado</h2>
                        <form onSubmit={handleAddCustomFood} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del alimento</label>
                                <input required name="title" type="text" placeholder="Ej: Whey Protein" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 border p-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Calorías (kcal)</label>
                                    <input required name="kcal" type="number" step="0.1" min="0" placeholder="0" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Proteínas (g)</label>
                                    <input required name="p" type="number" step="0.1" min="0" placeholder="0" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Carbohidratos (g)</label>
                                    <input required name="c" type="number" step="0.1" min="0" placeholder="0" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Grasas (g)</label>
                                    <input required name="g" type="number" step="0.1" min="0" placeholder="0" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 border p-2" />
                                </div>
                            </div>
                            
                            <div className="mt-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Color Personalizado</label>
                                <input type="color" name="color" defaultValue="#14b8a6" className="w-full h-10 rounded-lg cursor-pointer p-1 bg-white border border-gray-300" />
                            </div>
                            <button type="submit" className="mt-4 w-full bg-teal-600 text-white font-bold py-2.5 rounded-xl hover:bg-teal-700 transition-colors">
                                Guardar Alimento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};