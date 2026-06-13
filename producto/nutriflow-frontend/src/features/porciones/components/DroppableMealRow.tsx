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
    const defaultBg = isEven ? 'bg-white' : 'bg-porcelain';
    // Leve cambio de color cuando arrastran algo encima
    const hoverBg = isOver ? 'bg-pine-soft/5 shadow-inner outline outline-2 outline-pine-soft/50' : 'hover:bg-mist/60';

    return (
        <tr 
            ref={setNodeRef}
            className={`${isOver ? '' : defaultBg} ${hoverBg} transition-colors relative`}
        >
            {children}
        </tr>
    );
};
