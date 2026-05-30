import { Info, CheckCircle } from 'lucide-react';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay, useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import { PortionCell } from './PortionCell';
import { DraggableGroupHeader } from './DraggableGroupHeader';
import { DroppableMealRow } from './DroppableMealRow';
import { usePortions } from '../hooks/usePortions';
import { NUTRITION_GROUPS, MEALS } from '../constants';

export const PortionsTable = () => {
    const { state, actions, computed } = usePortions();
    const { targets, distributions, activeMeals, activeGroups, hideEmpty } = state;
    const { incrementPortion, decrementPortion } = actions;
    const { getGroupTotal, getGroupBalance } = computed;

    const [activeDragGroupId, setActiveDragGroupId] = useState<string | null>(null);

    // Filtrar Grupos: Solo activos + Si hideEmpty es true, ocultar los que tienen total 0 y no están siendo arrastrados
    const baseVisibleGroups = NUTRITION_GROUPS.filter(g => activeGroups.includes(g.id));
    const visibleGroups = hideEmpty 
        ? baseVisibleGroups.filter(g => getGroupTotal(g.id) > 0 || g.id === activeDragGroupId)
        : baseVisibleGroups;

    // Filtrar Comidas: Solo activas + Si hideEmpty es true, ocultar las que no tienen ninguna porción asignada
    const visibleMeals = activeMeals
        .map(mealId => MEALS.find(m => m.id === mealId) || { id: mealId, time: '--:--', name: mealId.charAt(0).toUpperCase() + mealId.slice(1).replace('_', ' ') })
        .filter(meal => {
            if (!hideEmpty) return true;
            const hasPortions = visibleGroups.some(g => (distributions[meal.id]?.[g.id] || 0) > 0);
            return hasPortions;
        });

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragStart = (event: any) => {
        const { active } = event;
        const activeData = String(active.id).split('-');
        if (activeData[0] === 'drag' && activeData[1] === 'group') {
            setActiveDragGroupId(activeData[2]);
        }
    };

    const handleDragEnd = (event: any) => {
        setActiveDragGroupId(null);
        const { active, over } = event;
        if (!over) {
            // Drop fuera de todo (zona nula) -> Si es una porción, la restamos
            const activeData = String(active.id).split('-');
            if (activeData[0] === 'drag' && activeData[1] === 'portion') {
                const mealId = activeData[2];
                const groupId = activeData[3];
                decrementPortion(mealId, groupId);
            }
            return;
        }

        const activeData = String(active.id).split('-');
        const overData = String(over.id).split('-');

        // active: drag-group-[groupId]
        // over: drop-meal-[mealId]
        if (activeData[0] === 'drag' && activeData[1] === 'group' && overData[0] === 'drop' && overData[1] === 'meal') {
            const groupId = activeData[2];
            const mealId = overData[2];
            incrementPortion(mealId, groupId);
        }

        // active: drag-portion-[mealId]-[groupId]
        // over: drop-header-palette
        if (activeData[0] === 'drag' && activeData[1] === 'portion' && over.id === 'drop-header-palette') {
            const mealId = activeData[2];
            const groupId = activeData[3];
            decrementPortion(mealId, groupId);
        }
    };

    const activeDragGroup = activeDragGroupId ? NUTRITION_GROUPS.find(g => g.id === activeDragGroupId) : null;

    // Zona de droppable para la paleta superior
    const { setNodeRef: setHeaderRef, isOver: isHeaderOver } = useDroppable({
        id: 'drop-header-palette'
    });

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-4 bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-start gap-3 shadow-sm">
                <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-sm text-teal-800 leading-snug">
                    <strong className="block mb-1 font-bold text-teal-900">¿Cómo asignar porciones?</strong>
                    Arrastra el encabezado del grupo alimentario (ej. 🍎 Frutas) y suéltalo sobre el horario de comida deseado (ej. Desayuno) para sumar una porción.<br/>
                    Para restar, agarra la porción desde la comida y devuélvela hacia arriba, o usa los controles ▲ ▼.
                </p>
            </div>

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="overflow-x-auto pb-4">
                    <table className="border-collapse bg-white shadow-sm rounded-xl overflow-hidden w-full text-sm min-w-[800px]">
                        <thead ref={setHeaderRef} className={`transition-colors ${isHeaderOver ? 'bg-red-50 outline outline-2 outline-red-300 outline-offset-[-2px]' : ''}`}>
                            <tr>
                                <td rowSpan={2} className="bg-yellow-50 border border-gray-200 text-center align-middle p-3 w-[130px]">
                                    <p className="text-xs text-gray-600 italic leading-snug">Guíate por el libro de <strong className="text-gray-800 not-italic">porciones de intercambio</strong></p>
                                </td>
                                {visibleGroups.map(g => (
                                    <DraggableGroupHeader key={g.id} group={g} />
                                ))}
                                <th className="bg-green-800 text-white border border-gray-200 text-center px-2 py-2 w-20"><div className="text-lg mb-1 leading-none">🥦</div><div className="text-xs font-bold leading-tight">Verduras</div></th>
                                <th className="bg-yellow-400 text-gray-900 border border-gray-200 text-center px-2 py-2 w-20"><div className="text-lg mb-1 leading-none">🫒</div><div className="text-xs font-bold leading-tight">Aceites</div></th>
                            </tr>
                            <tr>
                                {visibleGroups.map(g => (
                                    <td key={`target-${g.id}`} className={`${g.targetBg} border text-center py-1`}>
                                        <button className="font-bold text-sm text-white">{targets[g.id]}</button>
                                    </td>
                                ))}
                                <td className="bg-green-800 border border-green-900 text-center py-1"><span className="text-xs font-bold text-white">x</span></td>
                                <td className="bg-yellow-400 border border-yellow-500 text-center py-1"><span className="text-xs font-bold text-gray-900">½</span></td>
                            </tr>
                            <tr className="bg-gray-100">
                                <td className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center">N° Porciones DIARIO</td>
                                {visibleGroups.map(g => (
                                    <td key={`target-txt-${g.id}`} className="border border-gray-200 text-center"><span className="text-sm font-bold text-gray-700">{targets[g.id]}</span></td>
                                ))}
                                <td className="border border-gray-200 text-center"><span className="text-xs text-green-700 font-semibold">Libre</span></td>
                                <td className="border border-gray-200 text-center"><span className="text-xs text-yellow-800 font-semibold">10ml</span></td>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleMeals.map((meal, idx) => (
                                <DroppableMealRow key={meal.id} mealId={meal.id} idx={idx}>
                                    <td className="border border-gray-200 p-2 text-left pointer-events-none select-none">
                                        <div className="text-xs text-gray-500 font-mono">{meal.time}</div>
                                        <span className="font-bold text-sm text-gray-800">{meal.name}</span>
                                    </td>
                                    {visibleGroups.map(g => (
                                        <td key={`${meal.id}-${g.id}`} className="border border-gray-200 text-center p-1">
                                            <PortionCell 
                                                value={distributions[meal.id]?.[g.id] || 0} 
                                                cellBg={g.cellBg}
                                                textBtn={g.textBtn}
                                                mealId={meal.id}
                                                groupId={g.id}
                                                onIncrement={() => incrementPortion(meal.id, g.id)}
                                                onDecrement={() => decrementPortion(meal.id, g.id)}
                                            />
                                        </td>
                                    ))}
                                    <td className="border border-gray-200 text-center pointer-events-none select-none">{meal.id === 'desayuno' ? <span className="text-xs text-green-700 font-semibold px-2 py-1 bg-green-50 rounded-full">Libre!</span> : ''}</td>
                                    <td className="border border-gray-200 text-center pointer-events-none select-none">{meal.id === 'desayuno' ? <span className="text-xs text-yellow-800 font-semibold px-2 py-1 bg-yellow-50 rounded-full">10ml</span> : ''}</td>
                                </DroppableMealRow>
                            ))}
                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                            <td className="border border-gray-200 p-2 text-xs font-bold text-gray-700 text-right uppercase tracking-wide">Total</td>
                            {visibleGroups.map(g => {
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
                            {visibleGroups.map(g => {
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

            <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                {activeDragGroup ? (
                    <div className={`${activeDragGroup.headerBg} text-white rounded shadow-xl flex items-center justify-center gap-2 px-4 py-2 scale-110 rotate-3 opacity-90`}>
                        <span className="text-2xl">{activeDragGroup.emoji}</span>
                        <span className="font-bold text-sm">{activeDragGroup.label}</span>
                    </div>
                ) : null}
            </DragOverlay>
            </DndContext>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="font-medium">Balance exacto</span></div>
                <div className="flex items-center gap-1.5"><span className="flex w-4 h-4 rounded bg-amber-100 border border-amber-300 text-amber-700 font-bold items-center justify-center">−</span><span className="font-medium">Sin asignar</span></div>
                <div className="flex items-center gap-1.5"><span className="flex w-4 h-4 rounded bg-red-100 border border-red-300 text-red-700 font-bold items-center justify-center">+</span><span className="font-medium">Excede meta</span></div>
                <span className="text-gray-400 ml-auto">· Haz click en horas o metas para editarlas</span>
            </div>
        </div>
    );
};