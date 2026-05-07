import { ChevronDown } from 'lucide-react';

export interface FoodGroupOption {
    id: string;
    title: string;
    subtitle?: string;
    emoji: string;
    headerBg: string;
    textColor: string;
    badgeBg: string;
    badgeText: string;
    items: string[];
    moreCount: number;
    fixedTargetLabel?: string; 
}

interface GroupOptionCardProps {
    group: FoodGroupOption;
    targetValue: number; 
    currentValue: number; // 🚨 NUEVO: Valor actual ingresado
}

export const GroupOptionCard = ({ group, targetValue, currentValue }: GroupOptionCardProps) => {
    // Si tiene etiqueta fija (Libre consumo) la mostramos. Si no, mostramos la relación (Ej: 4/5)
    const displayTarget = group.fixedTargetLabel || `${currentValue}/${targetValue} Asignado`;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className={`${group.headerBg} px-4 py-3 flex items-center gap-3`}>
                <span className="text-2xl">{group.emoji}</span>
                <div className="flex-1">
                    <p className={`font-bold text-sm ${group.textColor}`}>{group.title}</p>
                    {group.subtitle && <p className={`text-xs ${group.textColor} opacity-80`}>{group.subtitle}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${group.badgeBg} ${group.badgeText} font-bold`}>
                    {displayTarget}
                </span>
            </div>
            
            <div className="p-4">
                <ul className="space-y-1.5">
                    {group.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1 w-2 h-2 rounded-full bg-gray-300 shrink-0"></span>
                            {item}
                        </li>
                    ))}
                </ul>
                <button className="mt-3 flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium">
                    <ChevronDown className="w-3.5 h-3.5" /> Ver {group.moreCount} opciones más
                </button>
            </div>
        </div>
    );
};