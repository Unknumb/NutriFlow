import { Settings, X } from 'lucide-react';
import { usePortions } from '../hooks/usePortions';
import { MEALS, NUTRITION_GROUPS } from '../constants';
import { useState } from 'react';

export const PortionsConfigPanel = () => {
    const { state, actions } = usePortions();
    const { activeMeals, activeGroups } = state;
    const { toggleMeal, toggleGroup } = actions;
    
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
                <Settings className="w-4 h-4" />
                Personalizar Pizarra
            </button>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 z-40 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Personalizar Pizarra</h2>
                        <p className="text-sm text-gray-500">Ajusta los grupos y tiempos de comida.</p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-8">
                    
                    {/* Tiempos de Comida */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                            🕒 Tiempos de Comida
                        </h3>
                        <div className="space-y-2">
                            {MEALS.map(meal => (
                                <label key={meal.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <span className="text-sm font-medium text-gray-700">{meal.name}</span>
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                        checked={activeMeals.includes(meal.id)}
                                        onChange={() => toggleMeal(meal.id)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Grupos de Alimentos */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                            🥦 Grupos de Alimentos
                        </h3>
                        <div className="space-y-2">
                            {NUTRITION_GROUPS.map(group => (
                                <label key={group.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{group.emoji}</span>
                                        <span className="text-sm font-medium text-gray-700">{group.label}</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                        checked={activeGroups.includes(group.id)}
                                        onChange={() => toggleGroup(group.id)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};
