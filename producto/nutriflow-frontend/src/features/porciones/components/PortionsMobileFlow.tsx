import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePortions } from '../hooks/usePortions';
import { NUTRITION_GROUPS, comidasOrdenadas } from '../constants';

export const PortionsMobileFlow = () => {
    const { state, actions, computed } = usePortions();
    const { targets, distributions, activeMeals, customFoods, customMeals, mealTimes } = state;
    const { incrementPortion, decrementPortion } = actions;
    const { getGroupBalance, getGroupTotal } = computed;

    const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

    const COMBINED_GROUPS = [...NUTRITION_GROUPS, ...(customFoods || [])];
    const visibleGroups = COMBINED_GROUPS.filter(g => targets[g.id] && targets[g.id] > 0);
    const visibleMeals = comidasOrdenadas(activeMeals, customMeals, mealTimes);

    const toggleMeal = (mealId: string) => {
        setExpandedMeal(prev => prev === mealId ? null : mealId);
    };

    return (
        <div className="flex flex-col h-full w-full bg-porcelain rounded-b-card overflow-hidden border-x border-b border-mist">
            {/* Cabecera de Balances Globales */}
            <div className="bg-white px-4 py-3 border-b border-mist shadow-sm shrink-0 sticky top-0 z-10 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                    {visibleGroups.map(g => {
                        const balance = getGroupBalance(g.id);
                        const total = getGroupTotal(g.id);
                        const target = targets[g.id];
                        let statusColor = "bg-amber-50 border-amber-200 text-amber-700";
                        if (balance === "exact") statusColor = "bg-emerald-50 border-emerald-200 text-emerald-700";
                        if (balance === "over") statusColor = "bg-red-50 border-red-200 text-red-700";

                        return (
                            <div key={`badge-${g.id}`} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${statusColor}`}>
                                <span className="text-base">{g.emoji}</span>
                                <span className="text-xs font-bold">{total}/{target}</span>
                                {balance === "exact" && <CheckCircle className="w-3.5 h-3.5" />}
                            </div>
                        );
                    })}
                </div>
                <p className="text-[10px] text-ink-soft mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Desliza para ver todos los balances
                </p>
            </div>

            {/* Lista de Comidas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {visibleMeals.map(meal => {
                    const isExpanded = expandedMeal === meal.id;
                    const mealDistributions = distributions[meal.id] || {};
                    const hasPortions = Object.values(mealDistributions).some(val => val > 0);

                    return (
                        <div key={meal.id} className="bg-white rounded-xl border border-mist shadow-sm overflow-hidden transition-all">
                            {/* Cabecera de la Comida (Acordeón) */}
                            <button
                                onClick={() => toggleMeal(meal.id)}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-porcelain/50 transition-colors text-left"
                            >
                                <div>
                                    <span className="text-xs text-ink-soft font-mono uppercase tracking-wider">{meal.time}</span>
                                    <h3 className="text-lg font-bold text-ink leading-tight">{meal.name}</h3>
                                    {!isExpanded && hasPortions && (
                                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                            {visibleGroups.map(g => {
                                                const val = mealDistributions[g.id];
                                                if (!val) return null;
                                                return (
                                                    <span key={`summary-${g.id}`} className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${g.cellBg} ${g.textBtn}`}>
                                                        {g.emoji} {val}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="text-ink-soft shrink-0 ml-4 bg-porcelain p-2 rounded-full">
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </button>

                            {/* Contenido Expandido */}
                            {isExpanded && (
                                <div className="p-4 border-t border-mist/50 bg-porcelain/20 space-y-4">
                                    {visibleGroups.map(g => {
                                        const value = mealDistributions[g.id] || 0;
                                        return (
                                            <div key={`editor-${g.id}`} className="flex items-center justify-between bg-white p-3 rounded-lg border border-mist shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${g.cellBg}`}>
                                                        {g.emoji}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-ink">{g.label}</p>
                                                        <p className="text-xs text-ink-soft">Diario: {getGroupTotal(g.id)} / {targets[g.id]}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 bg-porcelain p-1 rounded-lg border border-mist/70">
                                                    <button
                                                        onClick={() => decrementPortion(meal.id, g.id)}
                                                        disabled={value <= 0}
                                                        className="w-10 h-10 flex items-center justify-center rounded-md bg-white border border-mist shadow-sm text-ink-soft hover:text-ink disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-transform"
                                                    >
                                                        <span className="text-xl leading-none -mt-0.5">-</span>
                                                    </button>
                                                    <span className="font-bold text-lg w-8 text-center text-ink">{value}</span>
                                                    <button
                                                        onClick={() => incrementPortion(meal.id, g.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-md bg-white border border-mist shadow-sm text-pine hover:text-pine-soft active:scale-95 transition-transform"
                                                    >
                                                        <span className="text-xl leading-none -mt-0.5">+</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
