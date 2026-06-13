import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
    extraItems?: string[];
}

interface GroupOptionCardProps {
    group: FoodGroupOption;
    targetValue: number; 
    currentValue: number;
}

export const GroupOptionCard = ({ group, targetValue, currentValue }: GroupOptionCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayTarget = group.fixedTargetLabel || `${currentValue}/${targetValue} Asignado`;

    const extraMocks = Array(group.moreCount).fill('Opción equivalente (Ref. Nutricional)');

    return (
        <div className="bg-white rounded-xl border border-mist overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                        <li key={idx} className="flex items-start gap-2 text-sm text-ink-soft">
                            <span className="mt-1 w-2 h-2 rounded-full bg-mist shrink-0"></span>
                            {item}
                        </li>
                    ))}
                    {isExpanded && (group.extraItems || extraMocks).map((item, idx) => (
                        <li key={`extra-${idx}`} className="flex items-start gap-2 text-sm text-ink-soft">
                            <span className="mt-1 w-2 h-2 rounded-full bg-pine-soft/50 shrink-0"></span>
                            {item}
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 flex items-center gap-1 text-xs text-pine-soft hover:text-pine-soft font-medium"
                >
                    {isExpanded ? (
                        <><ChevronUp className="w-3.5 h-3.5" /> Ocultar opciones</>
                    ) : (
                        <><ChevronDown className="w-3.5 h-3.5" /> Ver {group.moreCount} opciones más</>
                    )}
                </button>
            </div>
        </div>
    );
};