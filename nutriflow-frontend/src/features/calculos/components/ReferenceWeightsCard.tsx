import { useState } from 'react'; // 👉 1. Importamos useState
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';

export const ReferenceWeightsCard = () => {
    // 👉 2. Datos simulados de pesos (en el futuro esto vendrá de las fórmulas matemáticas)
    const [weightsData, setWeightsData] = useState([
        { id: 'ideal', label: 'Peso Ideal', value: 67.4 },
        { id: 'maximo', label: 'Peso Máximo Saludable', value: 76.6 },
        { id: 'ajustado25', label: 'Peso Ajustado 25%', value: 71.8 },
        { id: 'ajustado50', label: 'Peso Ajustado 50%', value: 76.2 },
    ]);

    // 👉 3. Estado para guardar el ID del peso seleccionado (empezamos con Peso Ideal como Figma capture 3)
    const [selectedWeightId, setSelectedWeightId] = useState('ideal');

    // 👉 4. Lógica para encontrar el valor numérico del peso seleccionado para el footer
    const selectedWeightValue = weightsData.find(w => w.id === selectedWeightId)?.value || 0;

    return (
        <Card>
            <CardHeader title="Pesos de Referencia" />
            <CardContent>
                <div className="space-y-3">
                    {/* 👉 5. Renderizado dinámico e interactivo de las opciones de peso */}
                    {weightsData.map((w) => {
                        const isSelected = selectedWeightId === w.id;
                        return (
                            <div
                                key={w.id}
                                onClick={() => setSelectedWeightId(w.id)} // Al hacer clic, este se convierte en el seleccionado
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                        ? 'border-teal-500 bg-teal-50/30 shadow-sm' // Estilo Seleccionado (borde teal y fondo suave)
                                        : 'border-gray-200 hover:bg-gray-50' // Estilo Normal
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* 👉 6. Simulamos el Radio Button */}
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-teal-600' : 'border-gray-300'
                                        }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? 'text-teal-900' : 'text-gray-700'}`}>
                                        {w.label}
                                    </span>
                                </div>
                                <span className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-gray-900'}`}>
                                    {w.value.toFixed(1)} kg
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* 👉 7. FOOTER DINÁMICO: Se actualiza con el peso seleccionado */}
                <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200 flex justify-between items-center transition-colors">
                    <span className="text-sm font-medium text-teal-900">Peso Activo Seleccionado</span>
                    <span className="text-lg font-semibold text-teal-700">
                        {selectedWeightValue.toFixed(1)} kg
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};