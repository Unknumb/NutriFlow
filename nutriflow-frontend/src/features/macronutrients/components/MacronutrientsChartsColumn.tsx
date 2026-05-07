import { CaloricDistributionChart } from './CaloricDistributionChart';
import { MacronutrientsComparisonChart } from './MacronutrientsComparisonChart';
import { NutritionalSummaryCard } from './NutritionalSummaryCard';
// 🚨 Importamos los tipos
import type { ClinicalContext, MacronutrientTotals, PieChartData, BarChartData } from '../types';

interface ChartsColumnProps {
    totals: MacronutrientTotals;
    context: ClinicalContext;
}

export const MacronutrientsChartsColumn = ({ totals, context }: ChartsColumnProps) => {
    // 1. TypeScript ahora verificará que no te equivoques al escribir 'name', 'value' o 'fill'
    const pieData: PieChartData[] = [
        { name: 'Proteínas', value: totals.prot.pct, fill: '#ef4444' },
        { name: 'Carbohidratos', value: totals.cho.pct, fill: '#3b82f6' },
        { name: 'Grasas', value: totals.fat.pct, fill: '#f59e0b' },
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