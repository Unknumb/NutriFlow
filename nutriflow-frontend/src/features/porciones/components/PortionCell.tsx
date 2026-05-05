interface PortionCellProps {
    value: number;
    cellBg: string;   // ej: 'bg-amber-100'
    textBtn: string;  // ej: 'text-amber-900'
    onIncrement?: () => void;
    onDecrement?: () => void;
}

export const PortionCell = ({ value, cellBg, textBtn, onIncrement, onDecrement }: PortionCellProps) => {
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
        <div className={`${cellBg} rounded-lg px-2 py-0.5 mx-auto w-12 flex flex-col items-center`}>
            <button onClick={onIncrement} className={`text-[10px] ${textBtn} opacity-60 hover:opacity-100`}>▲</button>
            <span className={`font-bold text-base ${textBtn}`}>{value}</span>
            <button onClick={onDecrement} className={`text-[10px] ${textBtn} opacity-60 hover:opacity-100`}>▼</button>
        </div>
    );
};