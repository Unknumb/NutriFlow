import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface Props {
    mealId: string;
    idx: number;
    children: ReactNode;
}

export const DroppableMealRow = ({ mealId, idx, children }: Props) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `drop-meal-${mealId}`,
        data: { mealId }
    });

    const isEven = idx % 2 === 0;
    const defaultBg = isEven ? 'bg-white' : 'bg-gray-50';
    // Leve cambio de color cuando arrastran algo encima
    const hoverBg = isOver ? 'bg-teal-50 shadow-inner outline outline-2 outline-teal-300' : 'hover:bg-gray-100';

    return (
        <tr 
            ref={setNodeRef}
            className={`${isOver ? '' : defaultBg} ${hoverBg} transition-colors relative`}
        >
            {children}
        </tr>
    );
};
