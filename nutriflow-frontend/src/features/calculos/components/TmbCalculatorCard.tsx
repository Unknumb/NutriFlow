import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';

// 👉 1. ABRIMOS LA PUERTA: Definimos que esta tarjeta puede recibir 'data'
interface TmbProps {
    data?: any;
}

const FORMULAS_DATA = [
    { id: 'oms', name: 'OMS', kcal: 1865 },
    { id: 'harris', name: 'Harris-Benedict', kcal: 1807 },
    { id: 'mifflin', name: 'Mifflin-St Jeor', kcal: 1910 },
    { id: 'ireton', name: 'Ireton-Jones', kcal: 1950 },
];

// 👉 2. RECIBIMOS LA PROP: Añadimos { data }: TmbProps
export const TmbCalculatorCard = ({ data }: TmbProps) => {
    const [selectedFormulas, setSelectedFormulas] = useState<string[]>(['oms', 'harris']);

    const toggleFormula = (id: string) => {
        if (selectedFormulas.includes(id)) {
            setSelectedFormulas(selectedFormulas.filter(fId => fId !== id));
        } else {
            setSelectedFormulas([...selectedFormulas, id]);
        }
    };

    const activeData = FORMULAS_DATA.filter(f => selectedFormulas.includes(f.id));

    const averageKcal = activeData.length > 0
        ? Math.round(activeData.reduce((sum, item) => sum + item.kcal, 0) / activeData.length)
        : 0;

    return (
        <Card className="mb-6">
            <CardHeader title="Calculadora de Tasa Metabólica Basal (TMB)" icon={Calculator} />
            <CardContent>
                {/* Opcional: Mostrar los datos reales crudos que vienen del backend si existen */}
                {data && <div className="hidden">{JSON.stringify(data)}</div>}
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Seleccionar Fórmulas para Promediar
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {FORMULAS_DATA.map((formula) => {
                            const isSelected = selectedFormulas.includes(formula.id);
                            return (
                                <button
                                    key={formula.id}
                                    onClick={() => toggleFormula(formula.id)}
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
                                        <td className="py-2 text-sm text-gray-900 text-right font-medium">{d.kcal}</td>
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