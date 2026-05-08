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
                    <div className="p-4 text-gray-500">Esperando datos...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader title="Calculadora de Tasa Metabólica Basal (TMB)" icon={Calculator} />
            <CardContent>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                                        ? 'bg-mist-600 text-white shadow-sm' 
                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50' 
                                        }`}
                                >
                                    {formula.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {activeData.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 transition-all">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-sm font-medium text-gray-700">Fórmula</th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-700">TMB (kcal/día)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeData.map((d) => (
                                    <tr key={d.id} className="border-b border-gray-100 last:border-b-0">
                                        <td className="py-2 text-sm text-gray-600">{d.name}</td>
                                        <td className="py-2 text-sm text-gray-900 text-right font-medium">{d.kcal.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-teal-900">Promedio Tasa Metabólica Basal</span>
                        <span className="text-2xl font-semibold text-teal-700">
                            {averageKcal > 0 ? `${averageKcal} kcal/día` : 'Seleccione al menos una fórmula'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};