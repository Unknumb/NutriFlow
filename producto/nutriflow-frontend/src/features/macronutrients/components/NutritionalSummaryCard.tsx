import { Zap } from 'lucide-react';
import { MACRO_COLORS } from '../../../shared/ui/macroColors';

const FILAS = [
    { key: 'prot', label: 'Proteínas', color: MACRO_COLORS.proteinas },
    { key: 'cho', label: 'Carbohidratos', color: MACRO_COLORS.carbohidratos },
    { key: 'fat', label: 'Grasas', color: MACRO_COLORS.grasas },
] as const;

export const NutritionalSummaryCard = ({ totals, tmbPromedio }: any) => {
    return (
        <div className="bg-white flex flex-col gap-6 rounded-card border border-mist shadow-card">
            <div className="px-6 pt-6 border-b border-mist pb-4">
                <h4 className="leading-none flex items-center gap-2 font-display font-semibold text-ink text-[17px]">
                    <Zap className="w-5 h-5 text-pine-soft" />
                    Resumen Nutricional
                </h4>
            </div>
            <div className="px-6 pb-6 space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-pine rounded-md">
                    <span className="text-sm font-medium text-porcelain/80">Total calorías</span>
                    <span className="cifra-data text-lg font-medium text-porcelain">{tmbPromedio} kcal</span>
                </div>
                {FILAS.map(({ key, label, color }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-porcelain rounded-md border border-mist">
                        <span className="text-sm font-medium text-ink flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                            {label}
                        </span>
                        <span className="cifra-data text-lg font-medium" style={{ color }}>{totals[key].g}g</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
