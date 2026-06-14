import React from 'react';
import { usePortions } from '../hooks/usePortions';
import { NUTRITION_GROUPS, resolverComida } from '../constants';

export const VistaPauta = () => {
    const { state, computed } = usePortions();
    const { patientContext, distributions, targets, activeMeals, customFoods, customMeals, mealTimes } = state;
    const { getGroupTotal } = computed;

    const visibleMeals = activeMeals.map(id => resolverComida(id, customMeals, mealTimes));
    
    const COMBINED_GROUPS = [...NUTRITION_GROUPS, ...(customFoods || [])];
    const visibleGroups = COMBINED_GROUPS.filter(g => targets[g.id] && targets[g.id] > 0);

    return (
        <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0">
            <div className="p-8 max-w-4xl mx-auto">
                <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-ink">Pauta de Alimentación</h2>
                    <p className="text-sm text-ink-soft mt-1">{patientContext.name}</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-mist shadow-md">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="bg-pine text-porcelain text-sm font-semibold px-4 py-3 text-center border-r border-pine-soft w-24">HORA</th>
                                <th className="bg-pine text-porcelain text-sm font-semibold px-4 py-3 text-center border-r border-pine-soft w-32">COMIDA</th>
                                <th className="bg-pine text-porcelain text-sm font-semibold px-4 py-3 text-center border-r border-pine-soft w-36">PORCIÓN</th>
                                <th className="bg-pine text-porcelain text-sm font-semibold px-4 py-3 text-center border-r border-pine-soft ">OPCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleMeals.map((meal, mealIdx) => {
                                // Filtramos solo los grupos que tienen porciones > 0 en esta comida y están activos
                                const mealActiveGroups = visibleGroups.filter(g => distributions[meal.id]?.[g.id] > 0);
                                const rowCount = Math.max(1, mealActiveGroups.length);
                                const rowBg = mealIdx % 2 === 0 ? 'bg-white' : 'bg-porcelain';

                                return (
                                    <React.Fragment key={meal.id}>
                                        {mealActiveGroups.length === 0 ? (
                                            <tr className={rowBg}>
                                                <td className="border border-mist px-4 py-3 text-center align-top font-mono text-sm text-ink-soft font-medium">
                                                    {meal.time.split(' - ').map((t, i) => <div key={i}>{t}</div>)}
                                                </td>
                                                <td className="border border-mist px-4 py-3 text-center align-middle font-bold text-ink">{meal.name}</td>
                                                <td colSpan={2} className="border border-mist px-4 py-3 text-center text-ink-soft/60 italic">Sin porciones asignadas</td>
                                            </tr>
                                        ) : (
                                            mealActiveGroups.map((group, groupIdx) => (
                                                <tr key={`${meal.id}-${group.id}`} className={rowBg}>
                                                    {groupIdx === 0 && (
                                                        <>
                                                            <td className="border border-mist px-4 py-3 text-center align-top font-mono text-sm text-ink-soft font-medium" rowSpan={rowCount}>
                                                                {meal.time.split(' - ').map((t, i) => <div key={i}>{t}</div>)}
                                                            </td>
                                                            <td className="border border-mist px-4 py-3 text-center align-middle font-bold text-ink" rowSpan={rowCount}>{meal.name}</td>
                                                        </>
                                                    )}
                                                    <td className="border border-mist px-4 py-2.5 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${group.cellBg} ${group.textBtn} font-bold text-sm shrink-0`}>
                                                                {distributions[meal.id][group.id]}
                                                            </span>
                                                            <span className="text-sm font-semibold text-ink">{group.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="border border-mist px-4 py-2.5 align-middle text-sm text-ink-soft">{(group as any).options}</td>
                                                </tr>
                                            ))
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>


                <div className="mt-4 bg-porcelain border border-mist rounded-xl p-4">
                    <p className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-3">Resumen porciones diarias</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {visibleGroups.map(g => {
                            const total = getGroupTotal(g.id);
                            const target = targets[g.id] || 0;
                            const isExact = total === target;
                            
                            return (
                                <div key={g.id} className={`rounded-lg p-2 text-center border ${isExact ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                                    <div className="text-lg mb-0.5">{g.emoji}</div>
                                    <div className="text-xs font-medium text-ink-soft leading-tight">{g.label}</div>
                                    <div className={`text-sm font-bold mt-0.5 ${isExact ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {total}/{target}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
