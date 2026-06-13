import { CaloricDistributionChart } from './CaloricDistributionChart';
import { MacronutrientsComparisonChart } from './MacronutrientsComparisonChart';
import { NutritionalSummaryCard } from './NutritionalSummaryCard';
// 🚨 Importamos los tipos
import type { ClinicalContext, MacronutrientTotals, PieChartData, BarChartData } from '../types';
import { MACRO_COLORS } from '../../../shared/ui/macroColors';

interface ChartsColumnProps {
    totals: MacronutrientTotals;
    context: ClinicalContext;
}

export const MacronutrientsChartsColumn = ({ totals, context }: ChartsColumnProps) => {
    // 1. TypeScript ahora verificará que no te equivoques al escribir 'name', 'value' o 'fill'
    const pieData: PieChartData[] = [
        { name: 'Proteínas', value: totals.prot.pct, fill: MACRO_COLORS.proteinas },
        { name: 'Carbohidratos', value: totals.cho.pct, fill: MACRO_COLORS.carbohidratos },
        { name: 'Grasas', value: totals.fat.pct, fill: MACRO_COLORS.grasas },
    ];

    const barData: BarChartData[] = [
        { name: 'Proteínas', kcal: totals.prot.kcal },
        { name: 'Carbohidratos', kcal: totals.cho.kcal },
        { name: 'Grasas', kcal: totals.fat.kcal },
    ];

    return (
        <div className="col-span-5 space-y-6">
            <CaloricDistributionChart pieData={pieData} />
            <MacronutrientsComparisonChart barData={barData} />
            <NutritionalSummaryCard totals={totals} tmbPromedio={context.tmbPromedio} />
        </div>
    );
};