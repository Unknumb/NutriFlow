import { Info, CheckCircle } from 'lucide-react';
import { PortionCell } from './PortionCell';
import { usePortions } from '../hooks/usePortions';

// 🚨 MAPEO EXPLÍCITO: Así Tailwind no borra las clases
const NUTRITION_GROUPS = [
    { id: 'cereales', label: 'Cereales', emoji: '🌾', headerBg: 'bg-amber-500', targetBg: 'bg-amber-500 border-amber-600', cellBg: 'bg-amber-100', textBtn: 'text-amber-900' },
    { id: 'frutas', label: 'Frutas', emoji: '🍎', headerBg: 'bg-orange-500', targetBg: 'bg-orange-500 border-orange-600', cellBg: 'bg-orange-100', textBtn: 'text-orange-900' },
    { id: 'carnes', label: 'Carnes', emoji: '🍗', headerBg: 'bg-red-500', targetBg: 'bg-red-500 border-red-600', cellBg: 'bg-red-100', textBtn: 'text-red-900' },
    { id: 'lacteos', label: 'Lácteos', emoji: '🥛', headerBg: 'bg-teal-500', targetBg: 'bg-teal-500 border-teal-600', cellBg: 'bg-teal-100', textBtn: 'text-teal-900' },
    { id: 'arg', label: 'ARG', emoji: '🥑', headerBg: 'bg-lime-600', targetBg: 'bg-lime-600 border-lime-700', cellBg: 'bg-lime-100', textBtn: 'text-lime-900' },
    { id: 'galleton', label: 'Galletón', emoji: '🍪', headerBg: 'bg-fuchsia-500', targetBg: 'bg-fuchsia-500 border-fuchsia-600', cellBg: 'bg-fuchsia-100', textBtn: 'text-fuchsia-900' },
];

const MEALS = [
    { id: 'desayuno', time: '07:00', name: 'Desayuno' },
    { id: 'colacion_am', time: '09:00 - 11:00', name: 'Colación AM' },
    { id: 'almuerzo', time: '13:00', name: 'Almuerzo' },
    { id: 'colacion_pm', time: '15:00 - 16:00', name: 'Colación PM' },
    { id: 'once', time: '19:00 - 20:00', name: 'Once' },
];

export const PortionsTable = () => {
    const { state, actions, computed } = usePortions();
    const { targets, distributions } = state;
    const { incrementPortion, decrementPortion } = actions;
    const { getGroupTotal, getGroupBalance } = computed;

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-4 flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 max-w-fit">
                <Info className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                <p className="text-xs text-teal-800">
                    <strong>Recuerda guiarte por el libro de porciones de intercambio.</strong> Haz click en cualquier número para editarlo.
                </p>
            </div>

            <div className="overflow-x-auto pb-4">
                <table className="border-collapse bg-white shadow-sm rounded-xl overflow-hidden w-full text-sm min-w-[800px]">
                    <thead>
                        <tr>
                            <td rowSpan={2} className="bg-yellow-50 border border-gray-200 text-center align-middle p-3 w-[130px]">
                                <p className="text-xs text-gray-600 italic leading-snug">Guíate por el libro de <strong className="text-gray-800 not-italic">porciones de intercambio</strong></p>
                            </td>
                            {NUTRITION_GROUPS.map(g => (
                                <th key={g.id} className={`${g.headerBg} text-white border border-gray-200 text-center px-2 py-2 w-20`}>
                                    <div className="text-lg mb-1 leading-none">{g.emoji}</div>
                                    <div className="text-xs font-bold leading-tight">{g.label}</div>
                                </th>
                            ))}
                            <th className="bg-green-800 text-white border border-gray-200 text-center px-2 py-2 w-20"><div className="text-lg mb-1 leading-none">🥦</div><div className="text-xs font-bold leading-tight">Verduras</div></th>
                            <th className="bg-yellow-400 text-gray-900 border border-gray-200 text-center px-2 py-2 w-20"><div className="text-lg mb-1 leading-none">🫒</div><div className="text-xs font-bold leading-tight">Aceites</div></th>
                        </tr>
                        <tr>
                            {NUTRITION_GROUPS.map(g => (
                                <td key={`target-${g.id}`} className={`${g.targetBg} border text-center py-1`}>
                                    <button className="font-bold text-sm text-white">{targets[g.id]}</button>
                                </td>
                            ))}
                            <td className="bg-green-800 border border-green-900 text-center py-1"><span className="text-xs font-bold text-white">x</span></td>
                            <td className="bg-yellow-400 border border-yellow-500 text-center py-1"><span className="text-xs font-bold text-gray-900">½</span></td>
                        </tr>
                        <tr className="bg-gray-100">
                            <td className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center">N° Porciones DIARIO</td>
                            {NUTRITION_GROUPS.map(g => (
                                <td key={`target-txt-${g.id}`} className="border border-gray-200 text-center"><span className="text-sm font-bold text-gray-700">{targets[g.id]}</span></td>
                            ))}
                            <td className="border border-gray-200 text-center"><span className="text-xs text-green-700 font-semibold">Libre</span></td>
                            <td className="border border-gray-200 text-center"><span className="text-xs text-yellow-800 font-semibold">10ml</span></td>
                        </tr>
                    </thead>
                    <tbody>
                        {MEALS.map((meal, idx) => (
                            <tr key={meal.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                                <td className="border border-gray-200 p-2 text-left">
                                    <div className="text-xs text-gray-500 font-mono">{meal.time}</div>
                                    <span className="font-bold text-sm text-gray-800">{meal.name}</span>
                                </td>
                                {NUTRITION_GROUPS.map(g => (
                                    <td key={`${meal.id}-${g.id}`} className="border border-gray-200 text-center p-1">
                                        <PortionCell 
                                            value={distributions[meal.id]?.[g.id] || 0} 
                                            cellBg={g.cellBg}
                                            textBtn={g.textBtn}
                                            onIncrement={() => incrementPortion(meal.id, g.id)}
                                            onDecrement={() => decrementPortion(meal.id, g.id)}
                                        />
                                    </td>
                                ))}
                                <td className="border border-gray-200 text-center">{meal.id === 'desayuno' ? <span className="text-xs text-green-700 font-semibold px-2 py-1 bg-green-50 rounded-full">Libre!</span> : ''}</td>
                                <td className="border border-gray-200 text-center">{meal.id === 'desayuno' ? <span className="text-xs text-yellow-800 font-semibold px-2 py-1 bg-yellow-50 rounded-full">10ml</span> : ''}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                            <td className="border border-gray-200 p-2 text-xs font-bold text-gray-700 text-right uppercase tracking-wide">Total</td>
                            {NUTRITION_GROUPS.map(g => {
                                const total = getGroupTotal(g.id);
                                const balance = getGroupBalance(g.id);
                                const colorClass = balance === 'exact' ? 'text-emerald-700' : balance === 'over' ? 'text-red-600' : 'text-amber-600';
                                return <td key={`total-${g.id}`} className="border border-gray-200 text-center py-2"><span className={`text-sm font-bold ${colorClass}`}>{total}</span></td>;
                            })}
                            <td className="border border-gray-200 text-center py-2"><span className="text-gray-400">—</span></td>
                            <td className="border border-gray-200 text-center py-2"><span className="text-gray-400">—</span></td>
                        </tr>
                        <tr className="bg-white">
                            <td className="border border-gray-200 p-2 text-xs font-bold text-gray-700 text-right uppercase tracking-wide">Balance</td>
                            {NUTRITION_GROUPS.map(g => {
                                const balance = getGroupBalance(g.id);
                                return (
                                    <td key={`balance-${g.id}`} className={`border border-gray-100 text-center py-2 ${balance === 'exact' ? 'bg-emerald-50' : balance === 'over' ? 'bg-red-50' : 'bg-amber-50'}`}>
                                        {balance === 'exact' && <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />}
                                        {balance === 'under' && <span className="text-amber-600 font-bold text-lg leading-none">-</span>}
                                        {balance === 'over' && <span className="text-red-500 font-bold text-lg leading-none">+</span>}
                                    </td>
                                );
                            })}
                            <td className="border border-gray-200 text-center py-2"><span className="text-sm text-green-600 font-bold">✓</span></td>
                            <td className="border border-gray-200 text-center py-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="font-medium">Balance exacto</span></div>
                <div className="flex items-center gap-1.5"><span className="flex w-4 h-4 rounded bg-amber-100 border border-amber-300 text-amber-700 font-bold items-center justify-center">−</span><span className="font-medium">Sin asignar</span></div>
                <div className="flex items-center gap-1.5"><span className="flex w-4 h-4 rounded bg-red-100 border border-red-300 text-red-700 font-bold items-center justify-center">+</span><span className="font-medium">Excede meta</span></div>
                <span className="text-gray-400 ml-auto">· Haz click en horas o metas para editarlas</span>
            </div>
        </div>
    );
};