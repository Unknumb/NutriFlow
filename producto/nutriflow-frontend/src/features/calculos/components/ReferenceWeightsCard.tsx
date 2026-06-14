import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';
import type { PesosReferencia } from '../api/dashboardApi';

interface WeightsProps {
    data?: PesosReferencia | null;
}

const COLOR_CLASIFICACION: Record<string, string> = {
    'Bajo peso': 'bg-macro-cho/15 text-[#8a5a2a]',
    'Normal': 'bg-pine-soft/10 text-pine-soft',
    'Sobrepeso': 'bg-apricot/15 text-[#8a5a2a]',
    'Obesidad I': 'bg-clinical-red/10 text-clinical-red',
    'Obesidad II': 'bg-clinical-red/10 text-clinical-red',
    'Obesidad III': 'bg-clinical-red/10 text-clinical-red',
};

export const ReferenceWeightsCard = ({ data }: WeightsProps) => {
    // Construimos las filas de peso a partir de los datos reales del paciente.
    const pesos = useMemo(() => {
        if (!data) return [];
        const filas = [
            { id: 'ideal', label: 'Peso ideal (IMC 22)', value: data.peso_ideal },
            { id: 'min', label: 'Peso saludable mín.', value: data.peso_saludable_min },
            { id: 'max', label: 'Peso saludable máx.', value: data.peso_saludable_max },
        ];
        // El peso ajustado solo aplica cuando el paciente supera su peso ideal.
        if (data.aplica_ajuste) {
            filas.push(
                { id: 'aj25', label: 'Peso ajustado 25%', value: data.peso_ajustado_25 },
                { id: 'aj50', label: 'Peso ajustado 50%', value: data.peso_ajustado_50 },
            );
        }
        return filas;
    }, [data]);

    const [selectedId, setSelectedId] = useState('ideal');

    if (!data) {
        return (
            <Card>
                <CardHeader title="Pesos de Referencia" />
                <CardContent>
                    <div className="p-4 text-ink-soft text-sm">Esperando datos del paciente...</div>
                </CardContent>
            </Card>
        );
    }

    const selectedValue = pesos.find(p => p.id === selectedId)?.value ?? data.peso_ideal;
    const badge = COLOR_CLASIFICACION[data.clasificacion_imc] ?? 'bg-mist text-ink-soft';

    return (
        <Card>
            <CardHeader title="Pesos de Referencia" />
            <CardContent>
                {/* IMC actual + clasificación */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-mist">
                    <div>
                        <p className="text-xs text-ink-soft uppercase tracking-wide">IMC actual</p>
                        <p className="cifra-data text-2xl font-medium text-ink">{data.imc_actual}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge}`}>
                        {data.clasificacion_imc}
                    </span>
                </div>

                <div className="space-y-2.5">
                    {pesos.map((w) => {
                        const isSelected = selectedId === w.id;
                        return (
                            <div
                                key={w.id}
                                onClick={() => setSelectedId(w.id)}
                                className={`flex items-center justify-between p-3 rounded-md border transition-colors duration-150 cursor-pointer ${isSelected
                                        ? 'border-pine-soft bg-pine-soft/5'
                                        : 'border-mist hover:bg-porcelain'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-pine-soft' : 'border-mist'}`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-pine-soft" />}
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? 'text-pine-soft' : 'text-ink-soft'}`}>
                                        {w.label}
                                    </span>
                                </div>
                                <span className={`cifra-data ${isSelected ? 'text-pine-soft' : 'text-ink'}`}>
                                    {w.value.toFixed(1)} kg
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 p-4 bg-pine rounded-md flex justify-between items-center">
                    <span className="text-sm font-medium text-porcelain/80 uppercase tracking-wide text-[12px]">Peso de trabajo</span>
                    <span className="cifra-data text-2xl font-medium text-porcelain">
                        {selectedValue.toFixed(1)} kg
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
