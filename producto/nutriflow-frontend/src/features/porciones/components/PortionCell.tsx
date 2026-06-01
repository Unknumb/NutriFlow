import { useDraggable } from '@dnd-kit/core';
import { GripHorizontal } from 'lucide-react';

interface PortionCellProps {
    value: number;
    cellBg: string;   // ej: 'bg-amber-100'
    textBtn: string;  // ej: 'text-amber-900'
    mealId: string;
    groupId: string;
    onIncrement?: () => void;
    onDecrement?: () => void;
}

export const PortionCell = ({ value, cellBg, textBtn, mealId, groupId, onIncrement, onDecrement }: PortionCellProps) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `drag-portion-${mealId}-${groupId}`,
        data: { mealId, groupId, type: 'portion' },
        disabled: value <= 0
    });

    if (value === 0) {
        return (
            <button 
                onClick={onIncrement}
                className="w-6 h-6 mx-auto rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-500 flex items-center justify-center transition-colors"
                title="Agregar porción"
            >
                +
            </button>
        );
    }

    return (
        <div 
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`${cellBg} rounded-lg px-2 py-0.5 mx-auto w-12 flex flex-col items-center shadow-sm cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all ${isDragging ? 'opacity-50 scale-105' : ''}`}
            title="Arrastra hacia arriba para restar"
        >
            <button onClick={onIncrement} className={`text-[10px] ${textBtn} opacity-60 hover:opacity-100 w-full font-bold`} onPointerDown={(e) => e.stopPropagation()}>▲</button>
            <div className="flex items-center gap-0.5">
                <span className={`font-bold text-base ${textBtn}`}>{value}</span>
            </div>
            <button onClick={onDecrement} className={`text-[10px] ${textBtn} opacity-60 hover:opacity-100 w-full font-bold`} onPointerDown={(e) => e.stopPropagation()}>▼</button>
            <GripHorizontal className={`w-3 h-3 ${textBtn} opacity-40 mt-0.5`} />
        </div>
    );
};