import { useDraggable } from '@dnd-kit/core';

interface Props {
    group: {
        id: string;
        label: string;
        emoji: string;
        headerBg: string;
    };
}

export const DraggableGroupHeader = ({ group }: Props) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `drag-group-${group.id}`,
        data: { groupId: group.id }
    });

    return (
        <th 
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`${group.headerBg} text-white border border-mist text-center px-2 py-2 w-20 cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity ${isDragging ? 'opacity-50 ring-2 ring-white ring-inset' : ''}`}
            title={`Arrastra ${group.label} hacia una comida`}
        >
            <div className="text-lg mb-1 leading-none select-none">{group.emoji}</div>
            <div className="text-xs font-bold leading-tight select-none pointer-events-none">{group.label}</div>
        </th>
    );
};
