import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';

interface WeightsProps {
    data?: any;
}

export const ReferenceWeightsCard = (_props: WeightsProps) => {
    const [weightsData] = useState([
        { id: 'ideal', label: 'Peso Ideal', value: 67.4 },
        { id: 'maximo', label: 'Peso Máximo Saludable', value: 76.6 },
        { id: 'ajustado25', label: 'Peso Ajustado 25%', value: 71.8 },
        { id: 'ajustado50', label: 'Peso Ajustado 50%', value: 76.2 },
    ]);

    const [selectedWeightId, setSelectedWeightId] = useState('ideal');

    const selectedWeightValue = weightsData.find(w => w.id === selectedWeightId)?.value || 0;

    return (
        <Card>
            <CardHeader title="Pesos de Referencia" />
            <CardContent>
                <div className="space-y-3">
                    {weightsData.map((w) => {
                        const isSelected = selectedWeightId === w.id;
                        return (
                            <div
                                key={w.id}
                                onClick={() => setSelectedWeightId(w.id)}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                        ? 'border-pine-soft bg-pine-soft/5'
                                        : 'border-mist hover:bg-porcelain'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-pine-soft' : 'border-mist'
                                        }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-pine-soft" />}
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? 'text-pine-soft' : 'text-ink-soft'}`}>
                                        {w.label}
                                    </span>
                                </div>
                                <span className={`font-semibold tnum ${isSelected ? 'text-pine-soft' : 'text-ink'}`}>
                                    {w.value.toFixed(1)} kg
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 p-4 bg-pine rounded-md flex justify-between items-center">
                    <span className="text-sm font-medium text-porcelain/80 uppercase tracking-wide text-[12px]">Peso activo</span>
                    <span className="cifra-data text-2xl font-medium text-porcelain">
                        {selectedWeightValue.toFixed(1)} kg
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};