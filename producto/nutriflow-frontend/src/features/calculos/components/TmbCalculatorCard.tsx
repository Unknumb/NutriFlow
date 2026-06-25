import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';
import type { TmbData } from '../api/dashboardApi';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';

interface TmbProps {
    data?: TmbData;
}

export const TmbCalculatorCard = ({ data }: TmbProps) => {
    // Array of formula names (keys from data.resultados_individuales)
    const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
    const { setTmbPromedio } = useClinicalStore();

    useEffect(() => {
        if (data && data.resultados_individuales) {
            // Select all formulas by default when data arrives
            setSelectedFormulas(Object.keys(data.resultados_individuales));
        }
    }, [data]);

    const formulas = data?.resultados_individuales 
        ? Object.entries(data.resultados_individuales).map(([name, kcal]) => ({ id: name, name, kcal }))
        : [];

    const activeData = formulas.filter(f => selectedFormulas.includes(f.name));

    const averageKcal = activeData.length > 0
        ? Math.round(activeData.reduce((sum, item) => sum + item.kcal, 0) / activeData.length)
        : 0;

    useEffect(() => {
        setTmbPromedio(averageKcal);
    }, [averageKcal, setTmbPromedio]);

    const toggleFormula = (formulaName: string) => {
        if (selectedFormulas.includes(formulaName)) {
            setSelectedFormulas(selectedFormulas.filter(name => name !== formulaName));
        } else {
            setSelectedFormulas([...selectedFormulas, formulaName]);
        }
    };

    if (!data || !data.resultados_individuales) {
        return (
            <Card className="mb-6">
                <CardHeader title="Calculadora de Tasa Metabólica Basal (TMB)" icon={Calculator} />
                <CardContent>
                    <div className="p-4 text-ink-soft">Esperando datos...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader title="Calculadora de Tasa Metabólica Basal (TMB)" icon={Calculator} />
            <CardContent>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-ink-soft mb-3">
                        Seleccionar Fórmulas para Promediar
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {formulas.map((formula) => {
                            const isSelected = selectedFormulas.includes(formula.name);
                            return (
                                <button
                                    key={formula.id}
                                    onClick={() => toggleFormula(formula.name)}
                                    className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${isSelected
                                        ? 'bg-pine text-porcelain'
                                        : 'border border-mist text-ink-soft hover:border-pine-soft hover:text-pine-soft'
                                        }`}
                                >
                                    {formula.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {activeData.length > 0 && (
                    <div className="bg-porcelain rounded-md border border-mist p-4 mb-4 overflow-x-auto">
                        <table className="w-full min-w-[280px]">
                            <thead>
                                <tr className="border-b border-mist">
                                    <th className="text-left py-2 text-sm font-medium text-ink-soft">Fórmula</th>
                                    <th className="text-right py-2 text-sm font-medium text-ink-soft">TMB (kcal/día)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeData.map((d) => (
                                    <tr key={d.id} className="border-b border-mist/60 last:border-b-0">
                                        <td className="py-2 text-sm text-ink-soft">{d.name}</td>
                                        <td className="py-2 text-sm text-ink text-right font-medium tnum">{d.kcal.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="bg-pine rounded-md p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-sm font-medium text-porcelain/80 uppercase tracking-wide">Promedio TMB</span>
                        <span className="cifra-data text-2xl sm:text-[32px] font-medium text-porcelain break-words">
                            {averageKcal > 0 ? `${averageKcal} kcal/día` : 'Seleccione al menos una fórmula'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};