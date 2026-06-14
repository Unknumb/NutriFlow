import { useDraggable } from '@dnd-kit/core';
import { GripHorizontal } from 'lucide-react';

const HIDE_ARROWS_CSS = `
  .hide-arrows::-webkit-outer-spin-button,
  .hide-arrows::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .hide-arrows {
    -moz-appearance: textfield;
  }
`;

interface PortionCellProps {
    value: number;
    cellBg: string;   // ej: 'bg-amber-100'
    textBtn: string;  // ej: 'text-amber-900'
    mealId: string;
    groupId: string;
    onIncrement?: () => void;
    onDecrement?: () => void;
    onSetPortion?: (val: number) => void;
}

export const PortionCell = ({ value, cellBg, textBtn, mealId, groupId, onIncrement, onDecrement, onSetPortion }: PortionCellProps) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `drag::portion::${mealId}::${groupId}`,
        data: { mealId, groupId, type: 'portion' },
        disabled: value <= 0
    });

    if (value === 0) {
        return (
            <button 
                onClick={onIncrement}
                className="w-6 h-6 mx-auto rounded-full border border-dashed border-mist text-ink-soft/60 hover:border-pine-soft hover:text-pine-soft flex items-center justify-center transition-colors"
                title="Agregar porción"
            >
                +
            </button>
        );
    }

    return (
        <>
        <style>{HIDE_ARROWS_CSS}</style>
        <div 
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`${cellBg} rounded-lg px-2 py-0.5 mx-auto w-12 flex flex-col items-center shadow-sm cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-offset-1 hover:ring-mist transition-all ${isDragging ? 'opacity-50 scale-105' : ''}`}
            title="Arrastra hacia arriba para restar"
        >
            <button onClick={onIncrement} className={`text-[10px] ${textBtn} opacity-60 hover:opacity-100 w-full font-bold`} onPointerDown={(e) => e.stopPropagation()}>▲</button>
            <div className="flex items-center justify-center w-full">
                <input 
                    type="number"
                    step="0.5"
                    min="0"
                    value={value}
                    onChange={(e) => onSetPortion?.(parseFloat(e.target.value) || 0)}
                    onPointerDown={(e) => e.stopPropagation()} // Evita que se inicie el drag al hacer clic
                    className={`font-bold text-base ${textBtn} w-full text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-pine-soft rounded hide-arrows p-0 m-0`}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                />
            </div>
            <button onClick={onDecrement} className={`text-[10px] ${textBtn} opacity-60 hover:opacity-100 w-full font-bold`} onPointerDown={(e) => e.stopPropagation()}>▼</button>
            <GripHorizontal className={`w-3 h-3 ${textBtn} opacity-40 mt-0.5`} />
        </div>
        </>
    );
};