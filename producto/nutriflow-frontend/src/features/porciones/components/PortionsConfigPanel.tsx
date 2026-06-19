import { Settings, X, Plus, Trash2 } from 'lucide-react';
import { usePortions } from '../hooks/usePortions';
import { MEALS, NUTRITION_GROUPS, resolverComida } from '../constants';
import { useState } from 'react';

export const PortionsConfigPanel = () => {
    const { state, actions } = usePortions();
    const { activeMeals, activeGroups, customMeals, mealTimes } = state;
    const { toggleMeal, toggleGroup, addCustomMeal, removeCustomMeal, setMealTime } = actions;

    const [isOpen, setIsOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoHorario, setNuevoHorario] = useState('');

    const comidas = [...MEALS, ...customMeals];

    const handleAgregar = () => {
        if (!nuevoNombre.trim()) return;
        addCustomMeal(nuevoNombre, nuevoHorario);
        setNuevoNombre('');
        setNuevoHorario('');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white border border-mist text-ink-soft hover:bg-porcelain px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
                <Settings className="w-4 h-4" />
                Personalizar Pizarra
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-ink/40 z-40 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="flex items-center justify-between p-5 border-b border-mist/70 bg-porcelain/50">
                    <div>
                        <h2 className="text-lg font-bold text-ink">Personalizar Pizarra</h2>
                        <p className="text-sm text-ink-soft">Ajusta los grupos y tiempos de comida.</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-ink-soft/60 hover:text-ink-soft hover:bg-mist/60 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-8">

                    {/* Tiempos de Comida */}
                    <div>
                        <h3 className="text-sm font-bold text-ink mb-3 uppercase tracking-wider flex items-center gap-2">
                            🕒 Tiempos de Comida
                        </h3>
                        <div className="space-y-2">
                            {comidas.map(meal => {
                                const esCustom = customMeals.some(c => c.id === meal.id);
                                const horario = resolverComida(meal.id, customMeals, mealTimes).time;
                                return (
                                    <div key={meal.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-mist/70">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-pine rounded border-mist shrink-0"
                                            checked={activeMeals.includes(meal.id)}
                                            onChange={() => toggleMeal(meal.id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-ink truncate">{meal.name}</p>
                                            <input
                                                type="time"
                                                value={horario}
                                                onChange={(e) => setMealTime(meal.id, e.target.value)}
                                                className="mt-1 w-full text-xs font-mono text-ink-soft border border-mist rounded-md px-2 py-1 outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft"
                                            />
                                        </div>
                                        {esCustom && (
                                            <button
                                                onClick={() => removeCustomMeal(meal.id)}
                                                className="p-1.5 text-ink-soft/60 hover:text-clinical-red hover:bg-clinical-red/5 rounded-md transition-colors shrink-0"
                                                title="Eliminar tiempo de comida"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Agregar tiempo de comida personalizado */}
                        <div className="mt-3 p-3 rounded-xl border border-dashed border-mist bg-porcelain/60">
                            <p className="text-xs font-semibold text-ink-soft mb-2">Agregar tiempo de comida</p>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={nuevoNombre}
                                    onChange={(e) => setNuevoNombre(e.target.value)}
                                    placeholder="Nombre (ej: Colación tarde)"
                                    className="w-full text-sm border border-mist rounded-md px-2.5 py-1.5 outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        value={nuevoHorario}
                                        onChange={(e) => setNuevoHorario(e.target.value)}
                                        aria-label="Horario"
                                        className="flex-1 text-sm font-mono border border-mist rounded-md px-2.5 py-1.5 outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft"
                                    />
                                    <button
                                        onClick={handleAgregar}
                                        disabled={!nuevoNombre.trim()}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-pine hover:bg-pine-soft text-porcelain text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grupos de Alimentos */}
                    <div>
                        <h3 className="text-sm font-bold text-ink mb-3 uppercase tracking-wider flex items-center gap-2">
                            🥦 Grupos de Alimentos
                        </h3>
                        <div className="space-y-2">
                            {NUTRITION_GROUPS.map(group => (
                                <label key={group.id} className="flex items-center justify-between p-3 rounded-xl border border-mist/70 hover:bg-porcelain cursor-pointer transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{group.emoji}</span>
                                        <span className="text-sm font-medium text-ink-soft">{group.label}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-pine rounded border-mist focus:ring-pine-soft"
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
