import React from 'react';
import { usePortions } from '../hooks/usePortions';

const NUTRITION_GROUPS = [
    { id: 'cereales', label: 'Cereales', emoji: '🌾', bg: 'bg-amber-100', text: 'text-amber-900', options: 'Arroz / Fideos / Pasta / Papa cocida / Choclo / Tortilla XL' },
    { id: 'frutas', label: 'Frutas', emoji: '🍎', bg: 'bg-orange-100', text: 'text-orange-900', options: 'Fruta a gusto / Plátano / Uvas / Frutillas / Berries / Mix frutas rojas' },
    { id: 'carnes', label: 'Carnes', emoji: '🍗', bg: 'bg-red-100', text: 'text-red-900', options: 'Pechuga de pollo / Vacuno magro / Salmón al horno / Salmón ahumado / Atún al agua' },
    { id: 'lacteos', label: 'Lácteos', emoji: '🥛', bg: 'bg-teal-100', text: 'text-teal-900', options: 'Leche cultivada / Yogurt natural / Yogurt proteico / Quesillo / Queso fresco' },
    { id: 'arg', label: 'ARG', emoji: '🥑', bg: 'bg-lime-100', text: 'text-lime-900', options: 'Palta / Frutos secos mix / Mantequilla de maní / Chía / Nueces' },
    { id: 'galleton', label: 'Galletón', emoji: '🍪', bg: 'bg-fuchsia-100', text: 'text-fuchsia-900', options: 'Galletón Tika Protein / Mini barras proteína WILD / Granola / Sachet yogurt' },
];

const MEALS = [
    { id: 'desayuno', time: '07:00', name: 'Desayuno' },
    { id: 'colacion_am', time: '09:00\n11:00', name: 'Colación AM' },
    { id: 'almuerzo', time: '13:00', name: 'Almuerzo' },
    { id: 'colacion_pm', time: '15:00\n16:00', name: 'Colación PM' },
    { id: 'once', time: '19:00\n20:00', name: 'Once' },
];

export const VistaPauta = () => {
    const { state, computed } = usePortions();
    const { patientContext, distributions, targets } = state;
    const { getGroupTotal } = computed;

    return (
        <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0">
            <div className="p-8 max-w-4xl mx-auto">
                <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-gray-900">Pauta de Alimentación</h2>
                    <p className="text-sm text-gray-500 mt-1">{patientContext.name}</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-300 shadow-md">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="bg-teal-700 text-white text-sm font-bold px-4 py-3 text-center border-r border-teal-600 w-24">HORA</th>
                                <th className="bg-teal-700 text-white text-sm font-bold px-4 py-3 text-center border-r border-teal-600 w-32">COMIDA</th>
                                <th className="bg-teal-700 text-white text-sm font-bold px-4 py-3 text-center border-r border-teal-600 w-36">PORCIÓN</th>
                                <th className="bg-teal-700 text-white text-sm font-bold px-4 py-3 text-center border-r border-teal-600 ">OPCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MEALS.map((meal, mealIdx) => {
                                // Filtramos solo los grupos que tienen porciones > 0 en esta comida
                                const activeGroups = NUTRITION_GROUPS.filter(g => distributions[meal.id]?.[g.id] > 0);
                                const rowCount = Math.max(1, activeGroups.length);
                                const rowBg = mealIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                                return (
                                    <React.Fragment key={meal.id}>
                                        {activeGroups.length === 0 ? (
                                            <tr className={rowBg}>
                                                <td className="border border-gray-200 px-4 py-3 text-center align-top font-mono text-sm text-gray-700 font-medium">
                                                    {meal.time.split('\n').map((t, i) => <div key={i}>{t}</div>)}
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-center align-middle font-bold text-gray-900">{meal.name}</td>
                                                <td colSpan={2} className="border border-gray-200 px-4 py-3 text-center text-gray-400 italic">Sin porciones asignadas</td>
                                            </tr>
                                        ) : (
                                            activeGroups.map((group, groupIdx) => (
                                                <tr key={`${meal.id}-${group.id}`} className={rowBg}>
                                                    {groupIdx === 0 && (
                                                        <>
                                                            <td className="border border-gray-200 px-4 py-3 text-center align-top font-mono text-sm text-gray-700 font-medium" rowSpan={rowCount}>
                                                                {meal.time.split('\n').map((t, i) => <div key={i}>{t}</div>)}
                                                            </td>
                                                            <td className="border border-gray-200 px-4 py-3 text-center align-middle font-bold text-gray-900" rowSpan={rowCount}>{meal.name}</td>
                                                        </>
                                                    )}
                                                    <td className="border border-gray-200 px-4 py-2.5 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${group.bg} ${group.text} font-bold text-sm shrink-0`}>
                                                                {distributions[meal.id][group.id]}
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-800">{group.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-200 px-4 py-2.5 align-middle text-sm text-gray-600">{group.options}</td>
                                                </tr>
                                            ))
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Extras y Resumen Dinámico */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-lg">🥦</span>
                        <div><p className="text-sm font-bold text-green-800">Verduras — Libre consumo</p></div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-lg">🫒</span>
                        <div><p className="text-sm font-bold text-yellow-800">Aceite de oliva — 10ml/día</p></div>
                    </div>
                </div>

                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Resumen porciones diarias</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {NUTRITION_GROUPS.map(g => {
                            const total = getGroupTotal(g.id);
                            const target = targets[g.id] || 0;
                            const isExact = total === target;
                            
                            return (
                                <div key={g.id} className={`rounded-lg p-2 text-center border ${isExact ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                                    <div className="text-lg mb-0.5">{g.emoji}</div>
                                    <div className="text-xs font-medium text-gray-700 leading-tight">{g.label}</div>
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