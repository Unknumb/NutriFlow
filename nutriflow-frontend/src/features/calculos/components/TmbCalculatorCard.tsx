import { useState } from 'react'; // 👉 1. Importamos useState
import { Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';

// 👉 2. Datos simulados de las fórmulas (luego esto vendrá de cálculos reales)
const FORMULAS_DATA = [
    { id: 'oms', name: 'OMS', kcal: 1865 },
    { id: 'harris', name: 'Harris-Benedict', kcal: 1807 },
    { id: 'mifflin', name: 'Mifflin-St Jeor', kcal: 1910 },
    { id: 'ireton', name: 'Ireton-Jones', kcal: 1950 },
];

export const TmbCalculatorCard = () => {
    // 👉 3. Estado para guardar qué fórmulas están seleccionadas (empezamos con OMS y Harris como en tus capturas)
    const [selectedFormulas, setSelectedFormulas] = useState<string[]>(['oms', 'harris']);

    // 👉 4. Lógica para seleccionar/deseleccionar
    const toggleFormula = (id: string) => {
        if (selectedFormulas.includes(id)) {
            // Si ya está, la quitamos
            setSelectedFormulas(selectedFormulas.filter(fId => fId !== id));
        } else {
            // Si no está, la agregamos
            setSelectedFormulas([...selectedFormulas, id]);
        }
    };

    // 👉 5. CÁLCULO MATEMÁTICO DEL PROMEDIO
    // Filtramos los datos completos basándonos en los IDs seleccionados
    const activeData = FORMULAS_DATA.filter(f => selectedFormulas.includes(f.id));

    // Calculamos el promedio. Si no hay nada seleccionado, es 0.
    const averageKcal = activeData.length > 0
        ? Math.round(activeData.reduce((sum, item) => sum + item.kcal, 0) / activeData.length)
        : 0;

    return (
        <Card className="mb-6">
            <CardHeader title="Calculadora de Tasa Metabólica Basal (TMB)" icon={Calculator} />
            <CardContent>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Seleccionar Fórmulas para Promediar
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {/* 👉 6. Renderizado dinámico de botones de fórmula */}
                        {FORMULAS_DATA.map((formula) => {
                            const isSelected = selectedFormulas.includes(formula.id);
                            return (
                                <button
                                    key={formula.id}
                                    onClick={() => toggleFormula(formula.id)} // Inyectamos la lógica de clic
                                    className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${isSelected
                                        ? 'bg-mist-600 text-white shadow-sm' // Estilo Seleccionado (Figma capture 1)
                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50' // Estilo No Seleccionado
                                        }`}
                                >
                                    {formula.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 👉 7. TABLA DINÁMICA: Solo se muestran filas si hay fórmulas seleccionadas */}
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
                                {activeData.map((data) => (
                                    <tr key={data.id} className="border-b border-gray-100 last:border-b-0">
                                        <td className="py-2 text-sm text-gray-600">{data.name}</td>
                                        <td className="py-2 text-sm text-gray-900 text-right font-medium">{data.kcal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 👉 8. RESULTADO MATEMÁTICO DINÁMICO */}
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