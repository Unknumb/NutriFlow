import { useDraggable } from "@dnd-kit/core";

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
    id: `drag::group::${group.id}`,
    data: { groupId: group.id },
  });

  return (
    <th className="p-0 border border-mist w-20 align-top">
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`w-full h-full flex flex-col items-center justify-center ${group.headerBg} text-white px-2 py-3 cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity touch-none ${isDragging ? "opacity-50 ring-2 ring-white ring-inset" : ""}`}
        title={`Arrastra ${group.label} hacia una comida`}
      >
        <div className="text-xl mb-1 leading-none select-none pointer-events-none">
          {group.emoji}
        </div>
        <div className="text-xs font-bold leading-tight select-none pointer-events-none">
          {group.label}
        </div>
      </button>
    </th>
  );
};
