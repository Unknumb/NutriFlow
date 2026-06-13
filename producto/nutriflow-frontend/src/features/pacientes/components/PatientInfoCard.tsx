import { useState } from 'react';
import { User, Calculator } from "lucide-react";
import { Card, CardHeader, CardContent } from "../../../shared/ui/atoms/Card";
import { Input } from "../../../shared/ui/atoms/Input";

export const PatientInfoCard = () => {
    // Estado para el Toggle switch
    const [rememberData, setRememberData] = useState(false);

    return (
        <Card className="mb-6">
            <CardHeader title="Información del Paciente" icon={User} />
            <CardContent>
                {/* Grid de 5 columnas para que quepa todo en una fila en desktop */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                        label="Nombre"
                        id="nombre"
                        defaultValue="Juan Pérez"
                        type="text"
                    />

                    <Input
                        label="Edad"
                        id="edad"
                        defaultValue="45"
                        type="number"
                    />

                    {/* Selector de Sexo estilizado manualmente para que coincida con el átomo Input */}
                    <div className="flex flex-col">
                        <label htmlFor="sexo" className="block text-sm font-medium text-ink-soft mb-1.5">
                            Sexo
                        </label>
                        <select
                            id="sexo"
                            className="flex h-9 w-full rounded-md border border-mist px-3 py-1 text-sm outline-none transition-colors focus:border-pine-soft focus:ring-1 focus:ring-pine-soft bg-white cursor-pointer"
                        >
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                        </select>
                    </div>

                    <Input
                        label="Talla (cm)"
                        id="talla"
                        defaultValue="175"
                        type="number"
                    />

                    <Input
                        label="Peso Real (kg)"
                        id="pesoReal"
                        defaultValue="85"
                        type="number"
                    />
                </div>

                {/* Footer de la Card */}
                <div className="mt-6 pt-4 border-t border-mist/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setRememberData(!rememberData)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${rememberData ? 'bg-pine' : 'bg-mist'
                                }`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${rememberData ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                        </button>
                        <span className="text-sm text-ink-soft font-medium">
                            Recordar datos para la próxima sección
                        </span>
                    </div>

                    <button className="inline-flex items-center gap-2 bg-pine hover:bg-pine text-white text-sm px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm">
                        <Calculator className="w-4 h-4" />
                        Establecer como paciente activo
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};